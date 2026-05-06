import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const BidderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dash, setDash] = useState<any>(null);

  useEffect(() => {
    api.get('/bidder/dashboard')
      .then((r) => setDash(r.data))
      .catch((err) => {
        console.error('Failed to fetch bidder dashboard:', err);
        setDash(null);
      });
  }, []);

  const stats = [
    { label: 'Tenders Applied', value: dash?.tenders_applied ?? 0, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Submissions', value: dash?.total_submissions ?? 0, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Eligible', value: dash?.eligible_count ?? 0, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Under Review', value: dash?.review_count ?? 0, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, <span className="text-primary">{user?.displayName?.split(' ')[0] || 'Bidder'}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Track your tender submissions and evaluation results</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <motion.div key={s.label} variants={item}>
            <Card className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                    <p className="text-3xl font-bold mt-2">{s.value}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}>
                    <s.icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader><CardTitle className="text-lg">Submission Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <Badge variant="success">On Track</Badge>
            </div>
            <Progress value={65} className="h-2" />
            <p className="text-xs text-muted-foreground">You've completed 65% of active tender requirements</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BidderDashboard;
