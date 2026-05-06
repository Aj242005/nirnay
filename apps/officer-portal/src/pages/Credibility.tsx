import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CredibilityPage: React.FC = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold tracking-tight">Credibility Intelligence</h1>
      <p className="text-muted-foreground text-sm mt-1">Document authenticity, cross-bidder anomalies, and contradiction detection</p>
    </motion.div>
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6 text-center">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-amber-500/10 mb-3">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <h3 className="font-semibold">Contradiction Checker</h3>
          <p className="text-xs text-muted-foreground mt-1">Detect conflicting criteria in tender documents</p>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6 text-center">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-rose-500/10 mb-3">
            <Shield className="h-6 w-6 text-rose-500" />
          </div>
          <h3 className="font-semibold">Anomaly Scanner</h3>
          <p className="text-xs text-muted-foreground mt-1">Cross-bidder intelligence for collusion detection</p>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6 text-center">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-blue-500/10 mb-3">
            <Shield className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="font-semibold">Authenticity Scores</h3>
          <p className="text-xs text-muted-foreground mt-1">Trust scores for individual documents</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default CredibilityPage;
