"""Review router — queue, override, sign-off."""
import logging, uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import EvaluationVerdict, OfficerAction, BidderOverallVerdict, ProposalStatus, TenderWorkflow
from routers.rbac import require_permission
from models.verdict import OverrideRequest

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/review", tags=["Review"])


def _refresh_overall_verdict(tender_id: str, bidder_id: str, db: Session):
    verdicts = db.query(EvaluationVerdict).filter(
        EvaluationVerdict.tender_id == tender_id,
        EvaluationVerdict.bidder_id == bidder_id,
        EvaluationVerdict.supersedes_verdict_id.is_(None),
    ).all()
    if not verdicts:
        return

    failing = [v.criterion_id for v in verdicts if v.verdict == "NOT_ELIGIBLE"]
    manual = [v.criterion_id for v in verdicts if v.verdict == "MANUAL_REVIEW"]
    if manual:
        overall_verdict = "MANUAL_REVIEW"
        proposal_status = "requires_human_review"
    elif failing:
        overall_verdict = "NOT_ELIGIBLE"
        proposal_status = "evaluated"
    else:
        overall_verdict = "ELIGIBLE"
        proposal_status = "evaluated"

    current = db.query(BidderOverallVerdict).filter(
        BidderOverallVerdict.tender_id == tender_id,
        BidderOverallVerdict.bidder_id == bidder_id,
        BidderOverallVerdict.supersedes_id.is_(None),
    ).first()
    replacement_id = str(uuid.uuid4())
    if current:
        current.supersedes_id = replacement_id
    db.add(BidderOverallVerdict(
        id=replacement_id,
        tender_id=tender_id,
        bidder_id=bidder_id,
        overall_verdict=overall_verdict,
        failing_criteria=failing,
        manual_review_criteria=manual,
    ))

    proposal = db.query(ProposalStatus).filter(
        ProposalStatus.tender_id == tender_id,
        ProposalStatus.bidder_id == bidder_id,
    ).first()
    if proposal:
        proposal.status = proposal_status

@router.get("/queue/{tender_id}")
async def get_review_queue(
    tender_id: str,
    db: Session = Depends(get_db),
    _role: str = Depends(require_permission("review:read")),
):
    verdicts = db.query(EvaluationVerdict).filter(EvaluationVerdict.tender_id == tender_id, EvaluationVerdict.verdict == "MANUAL_REVIEW", EvaluationVerdict.supersedes_verdict_id.is_(None)).all()
    return {"tender_id": tender_id, "total_count": len(verdicts), "verdicts": [
        {"verdict_id": v.verdict_id, "bidder_id": v.bidder_id, "criterion_id": v.criterion_id, "verdict": v.verdict, "confidence_score": v.confidence_score, "extracted_value": v.extracted_value, "threshold_value": v.threshold_value, "ambiguity_reason": v.ambiguity_reason, "source_page": v.source_page, "evidence_document_id": v.evidence_document_id, "reasoning_trace": v.reasoning_trace} for v in verdicts]}

@router.post("/override/{verdict_id}")
async def override_verdict(
    verdict_id: str,
    body: OverrideRequest,
    request: Request,
    db: Session = Depends(get_db),
    _role: str = Depends(require_permission("review:update")),
):
    original = db.query(EvaluationVerdict).filter(EvaluationVerdict.verdict_id == verdict_id).first()
    if not original: raise HTTPException(status_code=404, detail="Verdict not found")
    new_verdict_id = str(uuid.uuid4())
    original.supersedes_verdict_id = new_verdict_id
    new_verdict = EvaluationVerdict(
        verdict_id=new_verdict_id, tender_id=original.tender_id, bidder_id=original.bidder_id,
        criterion_id=original.criterion_id, verdict=body.new_verdict, confidence_score=1.0,
        evidence_document_id=original.evidence_document_id, source_page=original.source_page,
        extracted_value=original.extracted_value, threshold_value=original.threshold_value,
        ambiguity_reason=None, reasoning_trace={"officer_override": True, "comment": body.comment, "original_verdict_id": verdict_id},
        llm_model_used=None, supersedes_verdict_id=None)
    db.add(new_verdict)
    action = OfficerAction(id=str(uuid.uuid4()), officer_id=getattr(request.state, "officer_id", "unknown"), officer_email=getattr(request.state, "email", "unknown"), action_type="override_verdict", target_id=verdict_id, comment=body.comment)
    db.add(action)
    _refresh_overall_verdict(original.tender_id, original.bidder_id, db)
    db.commit()
    return {"new_verdict_id": new_verdict.verdict_id, "verdict": body.new_verdict}

@router.post("/signoff/{tender_id}")
async def sign_off(
    tender_id: str,
    request: Request,
    db: Session = Depends(get_db),
    _role: str = Depends(require_permission("review:signoff")),
):
    pending = db.query(EvaluationVerdict).filter(EvaluationVerdict.tender_id == tender_id, EvaluationVerdict.verdict == "MANUAL_REVIEW", EvaluationVerdict.supersedes_verdict_id.is_(None)).count()
    if pending > 0: raise HTTPException(status_code=400, detail=f"{pending} pending reviews remain")
    action = OfficerAction(id=str(uuid.uuid4()), officer_id=getattr(request.state, "officer_id", "unknown"), officer_email=getattr(request.state, "email", "unknown"), action_type="sign_off", target_id=tender_id, comment="Tender evaluation signed off")
    db.add(action)
    db.commit()
    return {"tender_id": tender_id, "status": "signed_off"}


@router.post("/complete/{tender_id}")
async def complete_tender(
    tender_id: str,
    body: dict,
    request: Request,
    db: Session = Depends(get_db),
    _role: str = Depends(require_permission("review:update")),
):
    selected_bidder_id = body.get("selected_bidder_id")
    if not selected_bidder_id:
        raise HTTPException(status_code=400, detail="selected_bidder_id is required")

    pending = db.query(EvaluationVerdict).filter(
        EvaluationVerdict.tender_id == tender_id,
        EvaluationVerdict.verdict == "MANUAL_REVIEW",
        EvaluationVerdict.supersedes_verdict_id.is_(None),
    ).count()
    if pending > 0:
        raise HTTPException(status_code=400, detail=f"{pending} pending reviews remain")

    proposals = db.query(ProposalStatus).filter(ProposalStatus.tender_id == tender_id).all()
    if not any(p.bidder_id == selected_bidder_id for p in proposals):
        raise HTTPException(status_code=404, detail="Selected bidder has no proposal for this tender")

    for proposal in proposals:
        proposal.status = "accepted" if proposal.bidder_id == selected_bidder_id else "rejected"

    workflow = db.query(TenderWorkflow).filter(TenderWorkflow.tender_id == tender_id).first()
    if workflow:
        workflow.lifecycle_status = "completed"
        workflow.selected_bidder_id = selected_bidder_id

    db.add(OfficerAction(
        id=str(uuid.uuid4()),
        officer_id=getattr(request.state, "officer_id", "unknown"),
        officer_email=getattr(request.state, "email", "unknown"),
        action_type="complete_tender",
        target_id=tender_id,
        comment=f"Selected bidder {selected_bidder_id}",
    ))
    db.commit()
    return {"tender_id": tender_id, "selected_bidder_id": selected_bidder_id, "status": "completed"}
