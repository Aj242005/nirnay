import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ClipboardCheck, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import type { Tender } from '@nirnay/shared-types';

const proposalVariant = (status: string) => {
  if (status === 'accepted' || status === 'evaluated') return 'success';
  if (status === 'rejected') return 'destructive';
  if (status === 'requires_human_review') return 'warning';
  return 'secondary';
};

const ReviewPage: React.FC = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState('');
  const [queue, setQueue] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedBidderId, setSelectedBidderId] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const loadTenderData = async (tenderId: string) => {
    if (!tenderId) {
      setQueue([]);
      setProposals([]);
      return;
    }
    const [queueRes, proposalsRes] = await Promise.all([
      api.get(`/review/queue/${tenderId}`),
      api.get(`/dashboard/tenders/${tenderId}/proposals`),
    ]);
    setQueue(queueRes.data.verdicts || []);
    setProposals(proposalsRes.data.proposals || []);
  };

  useEffect(() => {
    api.get('/dashboard/tenders')
      .then((res) => setTenders(res.data.tenders || []))
      .catch(() => setTenders([]));
  }, []);

  useEffect(() => {
    loadTenderData(selectedTenderId).catch(() => {
      setQueue([]);
      setProposals([]);
    });
  }, [selectedTenderId]);

  const overrideVerdict = async (verdictId: string, newVerdict: 'ELIGIBLE' | 'NOT_ELIGIBLE') => {
    await api.post(`/review/override/${verdictId}`, {
      new_verdict: newVerdict,
      comment: `Officer marked criterion ${newVerdict}`,
    });
    await loadTenderData(selectedTenderId);
  };

  const completeTender = async () => {
    if (!selectedTenderId || !selectedBidderId) {
      setMessage('Select a tender and winning bidder first.');
      return;
    }
    setMessage(null);
    try {
      await api.post(`/review/complete/${selectedTenderId}`, { selected_bidder_id: selectedBidderId });
      setMessage('Tender completed. Selected bidder is accepted and all others are rejected.');
      await loadTenderData(selectedTenderId);
    } catch (error: any) {
      setMessage(error?.response?.data?.detail || 'Could not complete tender.');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Review Queue</h1>
        <p className="text-muted-foreground text-sm mt-1">Resolve human review items and complete tender selection</p>
      </motion.div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Tender Review</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <select
            value={selectedTenderId}
            onChange={(e) => {
              setSelectedTenderId(e.target.value);
              setSelectedBidderId('');
              setMessage(null);
            }}
            className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select tender</option>
            {tenders.map((t) => (
              <option key={t.tender_id} value={t.tender_id}>{t.tender_id} ({t.lifecycle_status || t.status})</option>
            ))}
          </select>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Human Review Required</CardTitle></CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <ClipboardCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No pending reviews</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((verdict) => (
                <div key={verdict.verdict_id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{verdict.bidder_id}</p>
                      <p className="text-xs text-muted-foreground">Criterion: {verdict.criterion_id}</p>
                      <p className="text-xs text-muted-foreground mt-1">{verdict.ambiguity_reason || 'Manual decision required'}</p>
                    </div>
                    <Badge variant="warning">manual review</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-2" onClick={() => overrideVerdict(verdict.verdict_id, 'ELIGIBLE')}>
                      <CheckCircle className="h-4 w-4" /> Eligible
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-2" onClick={() => overrideVerdict(verdict.verdict_id, 'NOT_ELIGIBLE')}>
                      <XCircle className="h-4 w-4" /> Not Eligible
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Complete Tender</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {proposals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No proposals submitted for this tender.</p>
          ) : (
            <>
              <div className="space-y-3">
                {proposals.map((proposal) => (
                  <div key={proposal.bidder_id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{proposal.bidder_id}</p>
                      <p className="text-xs text-muted-foreground">{proposal.document_count} document{proposal.document_count === 1 ? '' : 's'}</p>
                    </div>
                    <Badge variant={proposalVariant(proposal.status) as any}>{proposal.status.replace(/_/g, ' ')}</Badge>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <select
                  value={selectedBidderId}
                  onChange={(e) => setSelectedBidderId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={queue.length > 0}
                >
                  <option value="">Select accepted bidder</option>
                  {proposals.map((p) => (
                    <option key={p.bidder_id} value={p.bidder_id}>{p.bidder_id}</option>
                  ))}
                </select>
                <Button onClick={completeTender} disabled={queue.length > 0 || !selectedBidderId}>
                  Complete Tender
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewPage;
