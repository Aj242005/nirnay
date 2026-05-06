import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ReviewPage: React.FC = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold tracking-tight">Review Queue</h1>
      <p className="text-muted-foreground text-sm mt-1">Manual review items requiring officer decision</p>
    </motion.div>
    <Card>
      <CardContent className="p-12 text-center text-muted-foreground">
        <ClipboardCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">No pending reviews</p>
        <p className="text-xs mt-1">Run an evaluation on a tender to populate the review queue</p>
      </CardContent>
    </Card>
  </div>
);

export default ReviewPage;
