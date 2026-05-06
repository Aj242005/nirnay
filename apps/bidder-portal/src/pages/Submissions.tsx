import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const SubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bidder/submissions')
      .then((r) => setSubmissions(r.data.submissions || []))
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight">My Submissions</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your document submissions</p>
        </motion.div>
        <Button className="gap-2"><Upload className="h-4 w-4" /> New Submission</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Upload className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No submissions yet</p>
            <p className="text-xs mt-1">Browse tenders and submit your bid documents</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {submissions.map((s: any) => (
            <motion.div key={s.id} variants={item}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{s.original_filename}</p>
                      <p className="text-xs text-muted-foreground">Tender: {s.tender_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={s.status === 'extracted' ? 'success' : 'secondary'}>{s.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default SubmissionsPage;
