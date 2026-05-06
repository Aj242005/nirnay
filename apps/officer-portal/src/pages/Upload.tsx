import React from 'react';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, FileText, Hash, Building2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
]);

const UploadPage: React.FC = () => {
  const [dragOver, setDragOver] = React.useState(false);
  const [tenderId, setTenderId] = React.useState('');
  const [departmentId, setDepartmentId] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateAndSelectFile = (file: File | undefined) => {
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.has(file.type)) {
      setSelectedFile(null);
      setMessage({ type: 'error', text: 'Choose a PDF, DOCX, PNG, or JPEG file.' });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setMessage({ type: 'error', text: 'File must be 50MB or smaller.' });
      return;
    }

    setSelectedFile(file);
    setMessage(null);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!tenderId.trim() || !departmentId.trim() || !selectedFile) {
      setMessage({ type: 'error', text: 'Enter tender ID, department ID, and choose a file.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('tender_id', tenderId.trim());
    formData.append('department_id', departmentId.trim());

    setIsUploading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('nirnay_token');
      const response = await fetch('/api/ingestion/tender', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.detail || 'Upload failed. Please try again.');
      }

      setMessage({ type: 'success', text: `Upload accepted. Document ID: ${data.doc_id}` });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Upload failed. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

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
              <input type="text" placeholder="e.g. TENDER-2026-001" value={tenderId}
                onChange={(e) => setTenderId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> Department ID
              </label>
              <input type="text" placeholder="e.g. PWD-MH" value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <input ref={fileInputRef} type="file" className="hidden"
                 accept=".pdf,.docx,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
                 onChange={(e) => validateAndSelectFile(e.target.files?.[0])} />
          <div role="button" tabIndex={0}
               onClick={openFilePicker}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' || e.key === ' ') {
                   e.preventDefault();
                   openFilePicker();
                 }
               }}
               onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
               onDragLeave={() => setDragOver(false)}
               onDrop={(e) => {
                 e.preventDefault();
                 setDragOver(false);
                 validateAndSelectFile(e.dataTransfer.files?.[0]);
               }}
               className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <UploadIcon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Drop your file here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, PNG, JPEG • Max 50MB</p>
              <Button type="button" variant="outline" size="sm" className="mt-2"
                      onClick={(e) => { e.stopPropagation(); openFilePicker(); }}>
                Browse Files
              </Button>
            </div>
          </div>
          {selectedFile && (
            <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="truncate text-sm">{selectedFile.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      aria-label="Remove selected file">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {message && (
            <p className={`text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-destructive'}`}>
              {message.text}
            </p>
          )}
          <Button className="w-full h-11 text-base" disabled={isUploading}
                  onClick={handleUpload}>
            {isUploading ? 'Uploading...' : 'Upload & Process'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;
