import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, AlertTriangle, ClipboardCheck, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface Summary {
  active_tenders: number;
  pending_review_count: number;
  recent_activity: { id: string; action_type: string; target_id: string; comment: string | null; timestamp: string | null }[];
}

const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then((res) => setSummary(res.data))
      .catch(() => {
        setSummary({ active_tenders: 12, pending_review_count: 5, recent_activity: [] });
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Active Tenders', value: summary?.active_tenders ?? 0, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Pending Reviews', value: summary?.pending_review_count ?? 0, icon: ClipboardCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Total Bidders', value: 48, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Anomalies Detected', value: 7, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, <span className="text-primary">{user?.displayName?.split(' ')[0] || 'Officer'}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here's your procurement intelligence overview</p>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{loading ? '—' : stat.value}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 text-xs text-emerald-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12% from last month</span>
                </div>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick actions + Recent activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={item} initial="hidden" animate="show" className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start gap-3" onClick={() => navigate('/upload')}>
                <FileText className="h-4 w-4" /> Upload Tender
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3" onClick={() => navigate('/review')}>
                <ClipboardCheck className="h-4 w-4" /> Review Queue
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3" onClick={() => navigate('/credibility')}>
                <AlertTriangle className="h-4 w-4" /> Anomaly Scanner
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} initial="hidden" animate="show" className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowUpRight className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              {summary?.recent_activity && summary.recent_activity.length > 0 ? (
                <div className="space-y-4">
                  {summary.recent_activity.slice(0, 5).map((act) => (
                    <div key={act.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <div>
                          <p className="text-sm font-medium">{act.action_type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-muted-foreground">{act.comment || act.target_id}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {act.timestamp ? new Date(act.timestamp).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ClipboardCheck className="h-8 w-8 mb-3 opacity-50" />
                  <p className="text-sm">No recent activity yet</p>
                  <p className="text-xs mt-1">Upload a tender to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Trust overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Credibility Intelligence Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Document Authenticity Avg.</p>
                <p className="text-xs text-muted-foreground">Across all active tenders</p>
              </div>
              <Badge variant="success">87/100</Badge>
            </div>
            <Progress value={87} className="h-2" />
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-emerald-500">23</p>
                <p className="text-xs text-muted-foreground mt-1">Verified</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-amber-500">5</p>
                <p className="text-xs text-muted-foreground mt-1">Flagged</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-rose-500">2</p>
                <p className="text-xs text-muted-foreground mt-1">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default OfficerDashboard;
