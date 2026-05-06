import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Building2, FileText, Hash, Upload, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import type { Tender } from '@nirnay/shared-types';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
]);

const SubmissionsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(Boolean(searchParams.get('tender')));
  const [selectedTenderId, setSelectedTenderId] = useState(searchParams.get('tender') || '');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedTender = useMemo(
    () => tenders.find((t) => t.tender_id === selectedTenderId),
    [selectedTenderId, tenders]
  );

  const loadSubmissions = useCallback(() => {
    setLoading(true);
    api.get('/bidder/submissions')
      .then((r) => {
        setSubmissions(r.data.submissions || []);
        setProposals(r.data.proposals || []);
      })
      .catch(() => {
        setSubmissions([]);
        setProposals([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSubmissions();
    api.get('/bidder/tenders')
      .then((r) => setTenders(r.data.tenders || []))
      .catch(() => setTenders([]));
  }, [loadSubmissions]);

  const validateAndSelectFiles = (files: FileList | File[] | undefined) => {
    const incoming = Array.from(files || []);
    if (incoming.length === 0) return;

    const invalidType = incoming.find((file) => !ACCEPTED_FILE_TYPES.has(file.type));
    if (invalidType) {
      setSelectedFiles([]);
      setMessage({ type: 'error', text: 'Choose a PDF, DOCX, PNG, or JPEG file.' });
      return;
    }

    const oversized = incoming.find((file) => file.size > MAX_FILE_SIZE);
    if (oversized) {
      setSelectedFiles([]);
      setMessage({ type: 'error', text: 'Each file must be 50MB or smaller.' });
      return;
    }

    setSelectedFiles(incoming);
    setMessage(null);
  };

  const resetFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedTenderId || !selectedTender || selectedFiles.length === 0 || !user?.uid) {
      setMessage({ type: 'error', text: 'Select a tender and choose at least one bid document.' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('nirnay_token');
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tender_id', selectedTender.tender_id);
        formData.append('department_id', selectedTender.department_id);
        formData.append('bidder_id', user.uid);

        const response = await fetch('/api/ingestion/bidder', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formData,
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.detail || 'Submission upload failed. Please try again.');
        }
      }

      setMessage({ type: 'success', text: 'Submission accepted. Proposal status is pending.' });
      resetFiles();
      loadSubmissions();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Submission upload failed. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight">My Submissions</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your document submissions</p>
        </motion.div>
        <Button className="gap-2" onClick={() => setShowForm((open) => !open)}>
          <Upload className="h-4 w-4" /> New Submission
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload Bid Document</CardTitle>
            <CardDescription>Choose an active tender and submit a PDF, DOCX, PNG, or JPEG up to 50MB</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" /> Tender
                </label>
                <select
                  value={selectedTenderId}
                  onChange={(e) => {
                    setSelectedTenderId(e.target.value);
                    setMessage(null);
                  }}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select tender</option>
                  {tenders.map((t) => (
                    <option key={t.tender_id} value={t.tender_id}>{t.tender_id}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> Department
                </label>
                <input
                  type="text"
                  value={selectedTender?.department_id || ''}
                  readOnly
                  placeholder="Selected tender department"
                  className="w-full h-10 px-3 rounded-lg border bg-muted/30 text-sm text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.docx,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
              onChange={(e) => validateAndSelectFiles(e.target.files || undefined)}
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                validateAndSelectFiles(e.dataTransfer.files || undefined);
              }}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium">Drop your file here or click to browse</p>
                <p className="text-xs text-muted-foreground">PDF, DOCX, PNG, JPEG</p>
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate text-sm">
                    {selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} files selected`}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {(selectedFiles.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={resetFiles} aria-label="Remove selected files">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {message && (
              <p className={`text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-destructive'}`}>
                {message.text}
              </p>
            )}

            <Button className="w-full h-11 text-base" disabled={isUploading} onClick={handleUpload}>
              {isUploading ? 'Uploading...' : 'Upload Submission'}
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : proposals.length === 0 && submissions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Upload className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No submissions yet</p>
            <p className="text-xs mt-1">Browse tenders and submit your bid documents</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {proposals.map((p: any) => (
            <motion.div key={p.tender_id} variants={item}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Tender: {p.tender_id}</p>
                      <p className="text-xs text-muted-foreground">{p.document_count} document{p.document_count === 1 ? '' : 's'} submitted</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={p.status === 'accepted' ? 'success' : p.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {p.status.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '—'}
                    </span>
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

export default SubmissionsPage;
