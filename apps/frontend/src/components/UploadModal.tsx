import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UploadCloud, X, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface UploadModalProps {
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function UploadModal({ onClose, onUploadSuccess }: UploadModalProps) {
  const { user, token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !user || !user.workspaces?.[0]) return;
    
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspace_id', user.workspaces[0].id);

    try {
      const response = await fetch(`${API_BASE_URL}/documents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        onUploadSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.detail || 'Upload failed');
      }
    } catch (err) {
      setError('An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Upload Document</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Dropzone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition-colors flex flex-col items-center justify-center"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="application/pdf,image/png,image/jpeg,image/jpg"
            />
            
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>

            {file ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-slate-700">Click or drag a document here</p>
                <p className="text-xs text-slate-400 mt-1">PDFs, scanned images, or receipts (Max 20MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Start Processing'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
