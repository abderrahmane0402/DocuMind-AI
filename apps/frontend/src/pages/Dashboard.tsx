import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';
import { 
  FileText, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  MessageSquare, 
  UploadCloud, 
  ArrowRight,
  Database,
  Sparkles,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface DocumentItem {
  id: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  status: string;
  progress: number;
  created_at: string;
}

interface StatsSummary {
  total_documents: number;
  completed: number;
  processing: number;
  needs_review: number;
  total_chunks: number;
  total_bytes: number;
  types: {
    pdf: number;
    images: number;
    others: number;
  };
  system_status: {
    api: string;
    vector_store: string;
    embedding_model: string;
    llm_model: string;
  };
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickQuery, setQuickQuery] = useState('');

  const fetchData = async () => {
    if (!user || !token || !user.workspaces?.[0]) return;
    const wsId = user.workspaces[0].id;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      setLoading(true);
      const [docsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/documents/?workspace_id=${wsId}`, { headers }),
        fetch(`${API_BASE_URL}/documents/stats/summary?workspace_id=${wsId}`, { headers })
      ]);

      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, token]);

  // Real statistics directly from database
  const totalDocs = stats?.total_documents ?? documents.length;
  const completedDocs = stats?.completed ?? documents.filter(d => d.status === 'completed').length;
  const processingDocs = stats?.processing ?? documents.filter(d => d.status === 'processing').length;
  const totalChunks = stats?.total_chunks ?? 0;
  const totalBytes = stats?.total_bytes ?? documents.reduce((acc, d) => acc + (d.file_size_bytes || 0), 0);

  const pdfCount = stats?.types.pdf ?? documents.filter(d => (d.mime_type || '').includes('pdf')).length;
  const imageCount = stats?.types.images ?? documents.filter(d => (d.mime_type || '').includes('image')).length;
  const otherCount = stats?.types.others ?? Math.max(0, totalDocs - pdfCount - imageCount);

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    navigate('/chat');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header & Quick Action CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Workspace Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of your documents, OCR ingestion pipeline, and Qdrant RAG store
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="h-8 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} />
            <span>Sync</span>
          </button>
          
          <Link
            to="/upload"
            className="h-8 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </Link>
        </div>
      </div>

      {/* Row 1: 4 Balanced Metric Cards (100% Real Live Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Documents */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Documents</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{totalDocs}</div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1.5">
              <HardDrive className="w-3 h-3 text-slate-400" />
              <span>{formatSize(totalBytes)} stored</span>
            </div>
          </div>
        </div>

        {/* Ready for RAG */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Ready for Retrieval</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{completedDocs}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{totalDocs > 0 ? `${Math.round((completedDocs / totalDocs) * 100)}% indexed` : '0 indexed'}</span>
            </div>
          </div>
        </div>

        {/* Vectorized Chunks */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Vector Chunks</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{totalChunks}</div>
            <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium mt-1.5">
              <Database className="w-3 h-3" />
              <span>384-dim Qdrant vectors</span>
            </div>
          </div>
        </div>

        {/* Pipeline Telemetry */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Ingestion Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${processingDocs > 0 ? 'bg-blue-500 animate-ping' : 'bg-emerald-500'}`} />
              {processingDocs > 0 ? `${processingDocs} Processing` : 'Idle & Ready'}
            </div>
            <div className="text-xs text-slate-500 mt-1.5">
              Celery + Redis workers
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Left (58% Documents Feed) & Right (42% Architecture & Telemetry) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Recent Documents Table */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Documents</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your actual uploaded documents in this workspace</p>
            </div>
            <Link to="/documents" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-2.5 px-4">Document</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.length > 0 ? (
                  documents.slice(0, 6).map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate max-w-[220px]">
                            <div className="truncate font-semibold">{doc.original_filename}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {new Date(doc.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          doc.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : doc.status === 'processing'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {doc.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-500">
                        {formatSize(doc.file_size_bytes)}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <Link 
                          to="/chat"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 px-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">No documents uploaded yet</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Upload your first PDF, invoice, or scanned receipt to begin semantic vector search and Q&A.
                      </p>
                      <Link
                        to="/upload"
                        className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: AI Architecture, Breakdown & Launchpad */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* AI Knowledge Store & Infrastructure Telemetry */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  AI Architecture Status
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Operational
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Vector Store</span>
                <span className="font-semibold text-slate-900">Qdrant (documind_chunks)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Embedding Model</span>
                <span className="font-semibold text-slate-900">all-MiniLM-L6-v2 (384d)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">LLM Engine</span>
                <span className="font-semibold text-slate-900">Groq (Qwen 2.5 27B)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">OCR Extraction</span>
                <span className="font-semibold text-slate-900">PyMuPDF + Tesseract v5</span>
              </div>
            </div>
          </div>

          {/* Real Format Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-100">
              Document Format Breakdown
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  PDF Documents
                </span>
                <span className="font-bold text-slate-900">
                  {pdfCount} ({totalDocs > 0 ? Math.round((pdfCount / totalDocs) * 100) : 0}%)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Scanned Images (OCR)
                </span>
                <span className="font-bold text-slate-900">
                  {imageCount} ({totalDocs > 0 ? Math.round((imageCount / totalDocs) * 100) : 0}%)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  Other Formats
                </span>
                <span className="font-bold text-slate-900">
                  {otherCount} ({totalDocs > 0 ? Math.round((otherCount / totalDocs) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>

          {/* Direct Chat Launchpad */}
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-blue-50/50 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Ask your documents</h3>
            </div>
            <p className="text-xs text-slate-600 mb-3.5">
              Query your indexed documents in real-time with grounded citations and streaming responses.
            </p>

            <form onSubmit={handleQuickSearch} className="relative">
              <input 
                type="text"
                placeholder="e.g. What are the key terms in the invoice?"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                className="w-full h-9 pl-3 pr-9 bg-white border border-indigo-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 w-7 h-7 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors shadow-xs"
                title="Launch RAG query"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
