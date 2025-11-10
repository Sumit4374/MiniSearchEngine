'use client';

import { useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(
        file => file.type === 'text/plain' || file.type === 'application/pdf'
      );

      if (validFiles.length !== selectedFiles.length) {
        setMessage({ type: 'error', text: 'Some files were rejected. Only .txt and .pdf files are allowed.' });
      }

      setFiles(prev => [...prev, ...validFiles.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
      }))]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one file to upload.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();

      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput?.files) {
        Array.from(fileInput.files).forEach(file => {
          formData.append('files', file);
        });
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setMessage({
        type: 'success',
        text: `Successfully indexed ${data.filesProcessed} file(s) with ${data.totalWords} words!`
      });
      setFiles([]);

      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred during upload.'
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Document Indexer
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Upload .txt or .pdf files to index their content for searching
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
          <Link href="/search">
            <Button variant="outline">Search</Button>
          </Link>
          <Link href="/history">
            <Button variant="outline">History</Button>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Documents
            </CardTitle>
            <CardDescription>
              Select .txt or .pdf files to index. Multiple files can be uploaded at once.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
              <input
                id="file-input"
                type="file"
                multiple
                accept=".txt,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  .txt or .pdf files (max 10MB each)
                </p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-slate-900 dark:text-slate-50">
                  Selected Files ({files.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-slate-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="flex-1"
              >
                {uploading ? 'Indexing...' : 'Index Documents'}
              </Button>
              {files.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setFiles([])}
                  disabled={uploading}
                >
                  Clear All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
