import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const EvaluationPage: React.FC = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold tracking-tight">Evaluation Engine</h1>
      <p className="text-muted-foreground text-sm mt-1">Run and monitor tender evaluations</p>
    </motion.div>
    <Card>
      <CardHeader><CardTitle className="text-lg">Select Tender to Evaluate</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Enter Tender ID..." className="w-full h-10 pl-10 pr-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <Button className="w-full gap-2"><Shield className="h-4 w-4" /> Run Evaluation</Button>
        <div className="p-8 text-center text-muted-foreground">
          <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Enter a tender ID and run evaluation to see results</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default EvaluationPage;
