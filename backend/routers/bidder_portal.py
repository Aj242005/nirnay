"""
Bidder portal router — endpoints accessible only to bidder-role users.
Covers: listing available tenders, viewing own submissions, uploading documents,
checking own verdicts, and reading notifications.
"""
import logging
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func

from db.database import get_db
from db.models import (
    Document, EvaluationVerdict, BidderOverallVerdict,
    TenderCriterion, DocumentAuthenticity, BidderExtractedValue,
    ProposalStatus, TenderWorkflow,
)
from routers.rbac import require_role, require_permission

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/bidder", tags=["Bidder Portal"])


# ── Helper ────────────────────────────────────────────────────
def _bidder_id(request: Request) -> str:
    return getattr(request.state, "user_id", "")


# ── Available tenders ─────────────────────────────────────────
@router.get("/tenders")
async def list_available_tenders(
    request: Request,
    db: Session = Depends(get_db),
    _role: str = Depends(require_permission("tenders:read")),
):
    """List all tenders open for bidding."""
    tender_ids = (
        db.query(Document.tender_id)
        .filter(Document.doc_type == "tender")
        .distinct()
        .all()
    )
    tenders = []
    for (t_id,) in tender_ids:
        tender_doc = db.query(Document).filter(
            Document.tender_id == t_id,
            Document.doc_type == "tender",
        ).first()
        if not tender_doc:
            continue
        workflow = db.query(TenderWorkflow).filter(TenderWorkflow.tender_id == t_id).first()
        lifecycle_status = workflow.lifecycle_status if workflow else ("active" if tender_doc.status == "extracted" else "processing")
        if lifecycle_status != "active":
            continue

        criteria_count = db.query(func.count(TenderCriterion.criterion_id)).filter(
            TenderCriterion.tender_id == t_id
        ).scalar() or 0

        tenders.append({
            "tender_id": t_id,
            "department_id": tender_doc.department_id,
            "status": tender_doc.status,
            "lifecycle_status": lifecycle_status,
            "criteria_count": criteria_count,
            "created_at": str(tender_doc.created_at) if tender_doc.created_at else None,
        })

    return {"tenders": tenders}


# ── Own submissions ───────────────────────────────────────────
@router.get("/submissions")
async def list_my_submissions(
    request: Request,
    db: Session = Depends(get_db),
    _role: str = Depends(require_permission("submissions:read")),
):
    """List all documents submitted by the current bidder."""
    bid = _bidder_id(request)
    docs = db.query(Document).filter(
        Document.bidder_id == bid,
        Document.doc_type == "bidder",
    ).order_by(Document.created_at.desc()).all()

    proposals = db.query(ProposalStatus).filter(ProposalStatus.bidder_id == bid).all()
    proposal_by_tender = {p.tender_id: p for p in proposals}

    return {
        "bidder_id": bid,
        "proposals": [
            {
                "tender_id": p.tender_id,
                "bidder_id": p.bidder_id,
                "status": p.status,
                "document_count": p.document_count,
                "updated_at": str(p.updated_at) if p.updated_at else None,
            }
            for p in proposals
        ],
        "submissions": [
            {
                "id": d.id,
                "tender_id": d.tender_id,
                "original_filename": d.original_filename,
                "status": d.status,
                "proposal_status": proposal_by_tender.get(d.tender_id).status if proposal_by_tender.get(d.tender_id) else "pending",
                "file_size_bytes": d.file_size_bytes,
                "created_at": str(d.created_at) if d.created_at else None,
            }
            for d in docs
        ],
    }


@router.get("/submissions/{tender_id}")
async def get_submission_for_tender(
    tender_id: str,
    request: Request,
    db: Session = Depends(get_db),
    _role: str = Depends(require_permission("submissions:read")),
):
    """Get bidder's documents for a specific tender."""
    bid = _bidder_id(request)
    docs = db.query(Document).filter(
        Document.tender_id == tender_id,
        Document.bidder_id == bid,
        Document.doc_type == "bidder",
    ).all()

    return {
        "tender_id": tender_id,
        "bidder_id": bid,
        "documents": [
            {
                "id": d.id,
                "original_filename": d.original_filename,
                "status": d.status,
                "mime_type": d.mime_type,
                "file_size_bytes": d.file_size_bytes,
                "created_at": str(d.created_at) if d.created_at else None,
            }
            for d in docs
        ],
    }


# ── Verdicts for own submissions ──────────────────────────────
@router.get("/verdicts/{tender_id}")
async def get_my_verdicts(
    tender_id: str,
    request: Request,
    db: Session = Depends(get_db),
    _role: str = Depends(require_permission("verdicts:read")),
):
    """Get evaluation verdicts for the current bidder on a specific tender."""
    bid = _bidder_id(request)

    overall = db.query(BidderOverallVerdict).filter(
        BidderOverallVerdict.tender_id == tender_id,
        BidderOverallVerdict.bidder_id == bid,
        BidderOverallVerdict.supersedes_id.is_(None),
    ).first()

    if not overall:
        proposal = db.query(ProposalStatus).filter(
            ProposalStatus.tender_id == tender_id,
            ProposalStatus.bidder_id == bid,
        ).first()
        return {"tender_id": tender_id, "bidder_id": bid, "status": proposal.status if proposal else "pending", "verdicts": []}

    criterion_verdicts = db.query(EvaluationVerdict).filter(
        EvaluationVerdict.tender_id == tender_id,
        EvaluationVerdict.bidder_id == bid,
        EvaluationVerdict.supersedes_verdict_id.is_(None),
    ).all()
    proposal = db.query(ProposalStatus).filter(
        ProposalStatus.tender_id == tender_id,
        ProposalStatus.bidder_id == bid,
    ).first()

    return {
        "tender_id": tender_id,
        "bidder_id": bid,
        "status": proposal.status if proposal else "evaluated",
        "overall_verdict": overall.overall_verdict,
        "failing_criteria": overall.failing_criteria,
        "manual_review_criteria": overall.manual_review_criteria,
        "verdicts": [
            {
                "verdict_id": v.verdict_id,
                "criterion_id": v.criterion_id,
                "verdict": v.verdict,
                "confidence_score": v.confidence_score,
                "extracted_value": v.extracted_value,
                "threshold_value": v.threshold_value,
                "ambiguity_reason": v.ambiguity_reason,
            }
            for v in criterion_verdicts
        ],
    }


# ── Tender criteria (read-only for bidders) ───────────────────
@router.get("/criteria/{tender_id}")
async def get_tender_criteria(
    tender_id: str,
    db: Session = Depends(get_db),
    _role: str = Depends(require_permission("tenders:read")),
):
    """View tender criteria so a bidder knows what to submit."""
    criteria = db.query(TenderCriterion).filter(
        TenderCriterion.tender_id == tender_id
    ).all()

    return {
        "tender_id": tender_id,
        "criteria": [
            {
                "criterion_id": c.criterion_id,
                "type": c.type,
                "description": c.description,
                "threshold_value": c.threshold_value,
                "threshold_unit": c.threshold_unit,
                "mandatory": c.mandatory,
            }
            for c in criteria
        ],
    }


# ── Authenticity score for own documents ──────────────────────
@router.get("/authenticity/{document_id}")
async def get_my_document_authenticity(
    document_id: str,
    request: Request,
    db: Session = Depends(get_db),
    _role: str = Depends(require_permission("documents:read")),
):
    """Get authenticity score for one of the bidder's own documents."""
    bid = _bidder_id(request)
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.bidder_id == bid,
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or not yours")

    auth = db.query(DocumentAuthenticity).filter(
        DocumentAuthenticity.document_id == document_id
    ).first()

    if not auth:
        return {"document_id": document_id, "status": "not_scored_yet"}

    return {
        "document_id": document_id,
        "authenticity_score": auth.authenticity_score,
        "flags": auth.flags,
        "scored_at": str(auth.scored_at) if auth.scored_at else None,
    }


# ── Dashboard summary for bidder ──────────────────────────────
@router.get("/dashboard")
async def bidder_dashboard(
    request: Request,
    db: Session = Depends(get_db),
    _role: str = Depends(require_permission("profile:read")),
):
    """Quick summary for the bidder landing page."""
    bid = _bidder_id(request)

    total_submissions = db.query(func.count(Document.id)).filter(
        Document.bidder_id == bid, Document.doc_type == "bidder"
    ).scalar() or 0

    tenders_applied = db.query(func.count(func.distinct(Document.tender_id))).filter(
        Document.bidder_id == bid, Document.doc_type == "bidder"
    ).scalar() or 0

    proposals = db.query(ProposalStatus).filter(ProposalStatus.bidder_id == bid).all()

    eligible_count = sum(1 for p in proposals if p.status == "accepted")
    rejected_count = sum(1 for p in proposals if p.status == "rejected")
    review_count = sum(1 for p in proposals if p.status in ("pending", "under_evaluation", "requires_human_review", "evaluated"))

    return {
        "bidder_id": bid,
        "total_submissions": total_submissions,
        "tenders_applied": tenders_applied,
        "eligible_count": eligible_count,
        "rejected_count": rejected_count,
        "review_count": review_count,
    }
