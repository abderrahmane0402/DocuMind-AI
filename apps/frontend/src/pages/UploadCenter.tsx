import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  UploadCloud, 
  FileText, 
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

interface UploadItem {
  id: string;
  name: string;
  size: string;
  status: 'uploading' | 'processing' | 'completed' | 'queued' | 'failed';
  progress: number;
}

export default function UploadCenter() {
  const { user, token } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length || !user || !user.workspaces?.[0]) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const newItem: UploadItem = {
        id: Math.random().toString(),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        status: 'uploading',
        progress: 25
      };
      setQueue(prev => [newItem, ...prev]);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('workspace_id', user.workspaces[0].id);

      try {
        const res = await fetch(`${API_BASE_URL}/documents/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (res.ok) {
          setQueue(prev => prev.map(item => 
            item.id === newItem.id ? { ...item, status: 'completed', progress: 100 } : item
          ));
        } else {
          setQueue(prev => prev.map(item => 
            item.id === newItem.id ? { ...item, status: 'failed', progress: 0 } : item
          ));
        }
      } catch (err) {
        setQueue(prev => prev.map(item => 
          item.id === newItem.id ? { ...item, status: 'failed', progress: 0 } : item
        ));
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] leading-[34px] font-bold text-[#111827] tracking-tight">
            Upload Documents
          </h1>
          <p className="text-[13px] leading-[20px] text-[#6B7280] mt-0.5">
            Add invoices, receipts, and contracts for OCR extraction and vector indexing
          </p>
        </div>
        <Link 
          to="/documents" 
          className="text-xs font-semibold text-[#4F46E5] hover:underline flex items-center gap-1"
        >
          <span>View all documents</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Drop Zone (Section 9.4: min height 280px, dashed 1.5px primary-200, primary-50 drag-over) */}
        <div className="lg:col-span-7">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            className={`min-h-[300px] border-[1.5px] border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              dragActive 
                ? 'border-[#4F46E5] bg-[#EEF2FF]' 
                : 'border-[#C7D2FE] bg-white hover:bg-[#F6F8FC]'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              multiple 
              onChange={(e) => handleFiles(e.target.files)} 
              className="hidden" 
              accept="application/pdf,image/png,image/jpeg,image/jpg"
            />
            <div className="w-14 h-14 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mb-4 shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-[#111827]">
              Drag & drop files here
            </h3>
            <p className="text-xs text-[#6B7280] mt-1 mb-5">or click to browse your computer</p>
            
            <button 
              type="button" 
              className="h-9 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Choose Files
            </button>
            
            <span className="text-[11px] text-[#9CA3AF] mt-6">
              Supported formats: PDF, PNG, JPG, JPEG (Max file size: 50MB per file)
            </span>
          </div>
        </div>

        {/* Upload Queue Panel (Section 9.4) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] mb-4">
              <h2 className="text-sm font-semibold text-[#111827]">
                Upload Queue ({queue.length})
              </h2>
              <button 
                onClick={() => setQueue([])} 
                className="text-xs font-medium text-[#6B7280] hover:text-[#EF4444]"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-3">
              {queue.length === 0 ? (
                <div className="py-14 text-center space-y-2">
                  <UploadCloud className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">Queue is empty</p>
                  <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto leading-relaxed">
                    Select or drag documents into the drop zone to begin processing.
                  </p>
                </div>
              ) : (
                queue.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="font-semibold text-slate-900 truncate max-w-[140px]">{item.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{item.size}</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          item.status === 'completed' 
                            ? 'bg-emerald-500' 
                            : item.status === 'failed' 
                            ? 'bg-red-500' 
                            : 'bg-indigo-600'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="capitalize text-slate-600 font-medium">{item.status}...</span>
                      <span className="font-bold text-slate-900">{item.progress}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E7EB] mt-4 flex items-center justify-between text-xs text-[#6B7280]">
            <span>Background Processor</span>
            <span className="text-[#10B981] font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Online
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
