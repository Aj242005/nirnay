import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { FileText, Play, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import type { Tender } from '@nirnay/shared-types';

const statusVariant = (status: string) => {
  if (status === 'accepted' || status === 'evaluated') return 'success';
  if (status === 'rejected') return 'destructive';
  if (status === 'requires_human_review') return 'warning';
  return 'secondary';
};

const EvaluationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState(searchParams.get('tender') || '');
  const [proposals, setProposals] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedTender = useMemo(
    () => tenders.find((t) => t.tender_id === selectedTenderId),
    [selectedTenderId, tenders]
  );

  const loadProposals = async (tenderId: string) => {
    if (!tenderId) {
      setProposals([]);
      return;
    }
    const res = await api.get(`/dashboard/tenders/${tenderId}/proposals`);
    setProposals(res.data.proposals || []);
  };

  useEffect(() => {
    api.get('/dashboard/tenders')
      .then((res) => setTenders(res.data.tenders || []))
      .catch(() => setTenders([]));
  }, []);

  useEffect(() => {
    loadProposals(selectedTenderId).catch(() => setProposals([]));
  }, [selectedTenderId]);

  const runEvaluation = async () => {
    if (!selectedTenderId) {
      setMessage('Select a tender first.');
      return;
    }
    setRunning(true);
    setMessage(null);
    try {
      await api.post(`/evaluation/run/${selectedTenderId}`);
      setMessage('Evaluation started. Refresh this view after processing completes.');
      await loadProposals(selectedTenderId);
    } catch (error: any) {
      setMessage(error?.response?.data?.detail || 'Could not start evaluation.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Evaluation Engine</h1>
        <p className="text-muted-foreground text-sm mt-1">Run evaluations and track proposal status</p>
      </motion.div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Tender Evaluation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <select
              value={selectedTenderId}
              onChange={(e) => {
                setSelectedTenderId(e.target.value);
                setMessage(null);
              }}
              className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select tender</option>
              {tenders.map((t) => (
                <option key={t.tender_id} value={t.tender_id}>{t.tender_id} ({t.lifecycle_status || t.status})</option>
              ))}
            </select>
            <Button className="gap-2" onClick={runEvaluation} disabled={running || !selectedTenderId}>
              <Play className="h-4 w-4" /> {running ? 'Starting...' : 'Run Evaluation'}
            </Button>
          </div>

          {selectedTender && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{selectedTender.department_id}</span>
              <Badge variant="secondary">{selectedTender.bidder_count} bidders</Badge>
              <Badge variant={selectedTender.lifecycle_status === 'active' ? 'success' : 'secondary'}>
                {selectedTender.lifecycle_status || selectedTender.status}
              </Badge>
            </div>
          )}

          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Submitted Proposals</CardTitle></CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No submitted proposals for this tender</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proposals.map((proposal) => (
                <div key={proposal.bidder_id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{proposal.bidder_id}</p>
                      <p className="text-xs text-muted-foreground">{proposal.document_count} document{proposal.document_count === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                  <Badge variant={statusVariant(proposal.status) as any}>{proposal.status.replace(/_/g, ' ')}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluationPage;
