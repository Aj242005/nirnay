import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

const variantForStatus = (status: string) => {
  if (status === 'accepted') return 'success';
  if (status === 'rejected') return 'destructive';
  if (status === 'requires_human_review') return 'warning';
  return 'secondary';
};

const VerdictsPage: React.FC = () => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bidder/submissions')
      .then((r) => setProposals(r.data.proposals || []))
      .catch(() => setProposals([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Evaluation Verdicts</h1>
        <p className="text-muted-foreground text-sm mt-1">View final status for your submitted proposals</p>
      </motion.div>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : proposals.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Eye className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No verdicts yet</p>
            <p className="text-xs mt-1">Your verdicts will appear here once evaluation is complete</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <Card key={p.tender_id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Tender: {p.tender_id}</p>
                    <p className="text-xs text-muted-foreground">{p.document_count} submitted document{p.document_count === 1 ? '' : 's'}</p>
                  </div>
                </div>
                <Badge variant={variantForStatus(p.status) as any}>{p.status.replace(/_/g, ' ')}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerdictsPage;
