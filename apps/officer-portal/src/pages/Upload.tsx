import React from 'react';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, FileText, Hash, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const UploadPage: React.FC = () => {
  const [dragOver, setDragOver] = React.useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Upload Documents</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload tender or bidder submission documents</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Tender Document</CardTitle>
          <CardDescription>PDF, DOCX, or scanned images up to 50MB</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" /> Tender ID
              </label>
              <input type="text" placeholder="e.g. TENDER-2026-001"
                className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> Department ID
              </label>
              <input type="text" placeholder="e.g. PWD-MH"
                className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
               onDragLeave={() => setDragOver(false)}
               onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
               className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <UploadIcon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Drop your file here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, PNG, JPEG • Max 50MB</p>
              <Button variant="outline" size="sm" className="mt-2">Browse Files</Button>
            </div>
          </div>
          <Button className="w-full h-11 text-base">Upload & Process</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;
