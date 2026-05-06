import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ExportPage: React.FC = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold tracking-tight">Export & Reports</h1>
      <p className="text-muted-foreground text-sm mt-1">Generate evaluation reports and audit PDFs</p>
    </motion.div>
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Evaluation Report</h3>
            <p className="text-xs text-muted-foreground mt-1">Full evaluation report with verdicts, scores, and evidence</p>
            <Button variant="outline" size="sm" className="mt-3 gap-2"><Download className="h-3.5 w-3.5" /> Generate PDF</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 shrink-0">
            <Download className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Audit Export</h3>
            <p className="text-xs text-muted-foreground mt-1">Complete audit trail for compliance and review</p>
            <Button variant="outline" size="sm" className="mt-3 gap-2"><Download className="h-3.5 w-3.5" /> Generate PDF</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default ExportPage;
