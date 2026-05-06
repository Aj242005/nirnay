import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronRight, Building2, Search, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
type ActiveTender = {
  tender_id: string;
  department_id: string;
  status: string;
  lifecycle_status: string;
  criteria_count: number;
  created_at: string | null;
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const statusColors: Record<string, string> = {
  uploaded: 'default',
  ocr_processing: 'secondary',
  ocr_complete: 'secondary',
  extracting: 'secondary',
  extracted: 'success',
  ready_for_evaluation: 'warning',
  evaluated: 'secondary',
};

const BidderTenders: React.FC = () => {
  const [tenders, setTenders] = useState<ActiveTender[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/bidder/tenders')
      .then((r) => setTenders(r.data.tenders || []))
      .catch(() => setTenders([]))
      .finally(() => setLoading(false));
  }, []);

  const activeTenders = useMemo(
    () => tenders.filter((t) => t.lifecycle_status === 'active'),
    [tenders]
  );

  const filtered = activeTenders.filter((t) =>
    t.tender_id.toLowerCase().includes(search.toLowerCase()) ||
    t.department_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Browse Tenders</h1>
        <p className="text-muted-foreground text-sm mt-1">View active tenders and their requirements</p>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tenders by ID or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <FileText className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">{activeTenders.length === 0 ? 'No active tenders available yet' : 'No tenders found'}</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {filtered.map((t) => (
            <motion.div key={t.tender_id} variants={item}>
              <Card className="group hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer"
                    onClick={() => navigate(`/submissions?tender=${t.tender_id}`)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t.tender_id}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Building2 className="h-3 w-3" />
                        <span>{t.department_id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>{t.criteria_count} criteria</span>
                    </div>
                    <Badge variant={(statusColors[t.status] || 'default') as any}>
                      {t.status.replace(/_/g, ' ')}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
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

export default BidderTenders;
