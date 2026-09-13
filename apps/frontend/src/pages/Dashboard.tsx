import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Layers, 
  MessageSquare, 
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import UploadModal from '../components/UploadModal';

interface DocumentItem {
  id: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  status: string;
  progress: number;
  created_at: string;
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchDocs = async () => {
    if (!user || !token || !user.workspaces?.[0]) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/api/v1/documents/?workspace_id=${user.workspaces[0].id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [user, token]);

  const totalCount = documents.length;
  const completedCount = documents.filter(d => d.status === 'completed').length;
  const processingCount = documents.filter(d => d.status === 'processing').length;
  const failedCount = documents.filter(d => d.status === 'failed').length;

  const pdfCount = documents.filter(d => d.mime_type.includes('pdf')).length;
  const imageCount = documents.filter(d => d.mime_type.includes('image')).length;
  const otherCount = totalCount - pdfCount - imageCount;

  const pdfPct = totalCount > 0 ? Math.round((pdfCount / totalCount) * 100) : 0;
  const imgPct = totalCount > 0 ? Math.round((imageCount / totalCount) * 100) : 0;
  const otherPct = totalCount > 0 ? Math.max(0, 100 - pdfPct - imgPct) : 0;

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Workspace Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time status of your documents, OCR processing, and RAG knowledge base.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchDocs} 
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            Sync
          </button>
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* KPI Stats Cards (Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Total Documents */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Uploaded</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{totalCount}</div>
            <div className="flex items-center text-xs font-medium text-emerald-600 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              {completedCount} indexed & searchable
            </div>
          </div>
        </div>

        {/* Ready / Completed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fully Processed</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{completedCount}</div>
            <div className="text-xs text-slate-500 mt-1">
              {totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}% completion rate` : 'No files yet'}
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Pipeline</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{processingCount}</div>
            <div className="text-xs text-slate-500 mt-1">
              {processingCount > 0 ? 'OCR / Vectorizing in Celery' : 'Queue is idle'}
            </div>
          </div>
        </div>

        {/* AI Knowledge Base */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">RAG Readiness</span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{completedCount > 0 ? 'Ready' : 'Pending'}</div>
            <div className="text-xs text-slate-500 mt-1">
              Qdrant Vector Database
            </div>
          </div>
        </div>

      </div>

      {/* Analytics & Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Document Breakdown & Processing Status */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Document Processing Status</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live distribution across background tasks</p>
            </div>
            <Link to="/documents" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </div>

          <div className="space-y-4">
            {/* Completed Progress */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed & Embedded</span>
                <span>{completedCount} docs ({totalCount ? Math.round((completedCount/totalCount)*100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${totalCount ? (completedCount/totalCount)*100 : 0}%` }}
                />
              </div>
            </div>

            {/* Processing Progress */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Processing (OCR / Embedding)</span>
                <span>{processingCount} docs</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${totalCount ? (processingCount/totalCount)*100 : 0}%` }}
                />
              </div>
            </div>

            {/* Failed Progress */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Attention Needed / Failed</span>
                <span>{failedCount} docs</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${totalCount ? (failedCount/totalCount)*100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick RAG Launchpad */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Ask your documents with Groq + Qwen</h3>
                <p className="text-xs text-slate-600 mt-0.5">Your vectorized knowledge base is ready for questions with streaming responses.</p>
              </div>
            </div>
            <Link 
              to="/chat" 
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shrink-0 transition-colors"
            >
              Open Chat
            </Link>
          </div>
        </div>

        {/* Document Types Proportion */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Documents by Type</h2>
            <p className="text-xs text-slate-500 mt-0.5">Based on MIME detection</p>

            <div className="mt-8 space-y-4">
              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">PDF Documents</div>
                    <div className="text-xs text-slate-500">{pdfCount} files</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-900">{pdfPct}%</div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">Scanned Images</div>
                    <div className="text-xs text-slate-500">{imageCount} files</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-900">{imgPct}%</div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">Other Formats</div>
                    <div className="text-xs text-slate-500">{otherCount} files</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-900">{otherPct}%</div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 text-xs text-slate-500 flex justify-between">
            <span>Active Workspace</span>
            <span className="font-medium text-slate-700">{user?.workspaces?.[0]?.name || 'Default Workspace'}</span>
          </div>
        </div>

      </div>

      {/* Recent Uploads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Documents</h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest additions to your knowledge store</p>
          </div>
          <Link to="/documents" className="text-xs font-medium text-blue-600 hover:text-blue-700">
            View All Documents
          </Link>
        </div>

        {documents.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No documents uploaded yet</p>
            <p className="text-xs mt-1">Upload a PDF or receipt to populate metrics and Q&A.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="pb-3 font-semibold">Document</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">File Size</th>
                  <th className="pb-3 font-semibold">Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.slice(0, 5).map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-medium text-slate-800 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate max-w-xs">{doc.original_filename}</span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        doc.status === 'completed' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : doc.status === 'processing'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{formatSize(doc.file_size_bytes)}</td>
                    <td className="py-3 text-slate-400">{new Date(doc.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isUploadOpen && (
        <UploadModal 
          onClose={() => setIsUploadOpen(false)} 
          onUploadSuccess={() => {
            setIsUploadOpen(false);
            fetchDocs();
          }} 
        />
      )}

    </div>
  );
}
