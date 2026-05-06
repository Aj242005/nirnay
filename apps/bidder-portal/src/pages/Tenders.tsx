import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronRight, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const BidderTenders: React.FC = () => {
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/bidder/tenders')
      .then((r) => setTenders(r.data.tenders || []))
      .catch(() => setTenders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Browse Tenders</h1>
        <p className="text-muted-foreground text-sm mt-1">View available tenders and their requirements</p>
      </motion.div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : tenders.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <FileText className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">No tenders available yet</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {tenders.map((t: any) => (
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
                    <Badge variant="secondary">{t.criteria_count} criteria</Badge>
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
