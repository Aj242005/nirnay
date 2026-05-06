import React from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const VerdictsPage: React.FC = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold tracking-tight">Evaluation Verdicts</h1>
      <p className="text-muted-foreground text-sm mt-1">View evaluation results for your submissions</p>
    </motion.div>
    <Card>
      <CardContent className="p-12 text-center text-muted-foreground">
        <Eye className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">No verdicts yet</p>
        <p className="text-xs mt-1">Your verdicts will appear here once evaluation is complete</p>
      </CardContent>
    </Card>
  </div>
);

export default VerdictsPage;
