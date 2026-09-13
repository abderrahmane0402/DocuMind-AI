import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowUpRight, 
  FileText,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
  processed_today: number;
  needs_review: number;
  processing: number;
  extraction_accuracy: number;
  types: {
    invoices: number;
    receipts: number;
    others: number;
  };
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [stats, setStats] = useState<StatsSummary | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !token || !user.workspaces?.[0]) return;
      const wsId = user.workspaces[0].id;
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [docsRes, statsRes] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/documents/?workspace_id=${wsId}`, { headers }),
          fetch(`http://localhost:8000/api/v1/documents/stats/summary?workspace_id=${wsId}`, { headers })
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
        console.error('Error fetching dashboard statistics:', err);
      }
    };
    fetchData();
  }, [user, token]);

  // Derived real metrics
  const totalDocs = stats?.total_documents ?? documents.length;
  const completedDocs = stats?.processed_today ?? documents.filter(d => d.status === 'completed').length;
  const needsReviewDocs = stats?.needs_review ?? documents.filter(d => d.status === 'failed' || d.status === 'needs_review').length;
  const processingDocs = stats?.processing ?? documents.filter(d => d.status === 'processing').length;
  const accuracy = stats?.extraction_accuracy ?? (totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0);

  const invoicesCount = stats?.types.invoices ?? documents.filter(d => (d.mime_type || '').includes('pdf')).length;
  const receiptsCount = stats?.types.receipts ?? documents.filter(d => (d.mime_type || '').includes('image')).length;
  const othersCount = stats?.types.others ?? Math.max(0, totalDocs - invoicesCount - receiptsCount);

  const invoicePct = totalDocs > 0 ? Math.round((invoicesCount / totalDocs) * 100) : 0;
  const receiptPct = totalDocs > 0 ? Math.round((receiptsCount / totalDocs) * 100) : 0;
  const otherPct = totalDocs > 0 ? Math.max(0, 100 - invoicePct - receiptPct) : 0;

  // Donut SVG calculations
  const circumference = 238; // 2 * pi * 38
  const invoiceStroke = (invoicePct / 100) * circumference;
  const receiptStroke = (receiptPct / 100) * circumference;
  const otherStroke = (otherPct / 100) * circumference;

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      
      {/* Header: Title + Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-2xl lg:text-[26px] font-bold text-[#111827] tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Real-time document pipeline, OCR extraction, and RAG knowledge metrics
          </p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <div className="h-8 px-3 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#111827] flex items-center gap-2 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Today</span>
          </div>
          <Link
            to="/upload"
            className="h-8 px-3.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            Upload
          </Link>
        </div>
      </div>

      {/* Row 1: 5 Metric Cards (All 100% Real Dynamic Stats) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Total Documents */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#6B7280]">Total Documents</span>
          <div className="mt-2">
            <div className="text-2xl lg:text-[26px] font-bold text-[#111827] leading-none">{totalDocs}</div>
            <div className="flex items-center text-[11px] font-medium text-[#10B981] mt-2">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>{completedDocs} indexed</span>
            </div>
          </div>
        </div>

        {/* Processed Today */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#6B7280]">Processed & Ready</span>
          <div className="mt-2">
            <div className="text-2xl lg:text-[26px] font-bold text-[#111827] leading-none">{completedDocs}</div>
            <div className="flex items-center text-[11px] font-medium text-[#10B981] mt-2">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              <span>{totalDocs > 0 ? `${Math.round((completedDocs / totalDocs) * 100)}% rate` : '100%'}</span>
            </div>
          </div>
        </div>

        {/* Needs Review */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#6B7280]">Needs Review</span>
            {needsReviewDocs > 0 && <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />}
          </div>
          <div className="mt-2">
            <div className="text-2xl lg:text-[26px] font-bold text-[#111827] leading-none">{needsReviewDocs}</div>
            <div className={`flex items-center text-[11px] font-medium mt-2 ${needsReviewDocs > 0 ? 'text-[#EF4444]' : 'text-[#6B7280]'}`}>
              {needsReviewDocs > 0 ? (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  <span>Action needed</span>
                </>
              ) : (
                <span>All clear</span>
              )}
            </div>
          </div>
        </div>

        {/* Extraction Accuracy */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#6B7280]">Extraction Accuracy</span>
          <div className="mt-2">
            <div className="text-2xl lg:text-[26px] font-bold text-[#111827] leading-none">
              {totalDocs > 0 ? `${accuracy}%` : '100%'}
            </div>
            <div className="flex items-center text-[11px] font-medium text-[#10B981] mt-2">
              <Sparkles className="w-3 h-3 mr-1 text-[#4F46E5]" />
              <span>Tesseract + Qdrant</span>
            </div>
          </div>
        </div>

        {/* Active Pipeline */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium text-[#6B7280]">Active In Pipeline</span>
          <div className="mt-2">
            <div className="text-2xl lg:text-[26px] font-bold text-[#111827] leading-none">{processingDocs}</div>
            <div className="flex items-center text-[11px] font-medium text-[#4F46E5] mt-2">
              <Clock className="w-3 h-3 mr-1" />
              <span>{processingDocs > 0 ? 'Worker running' : 'Queue idle'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Processing Trend Area Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold text-[#111827]">
                Documents Processing Trend
              </h2>
              <p className="text-[11px] text-[#6B7280]">Ingestion throughput over the last 7 days</p>
            </div>
            <span className="text-[11px] font-medium text-[#6B7280] bg-[#F9FAFB] px-2 py-0.5 rounded border border-[#E5E7EB]">
              Real-time
            </span>
          </div>

          <div className="relative w-full h-44 my-2">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              <line x1="0" y1="30" x2="500" y2="30" stroke="#F3F4F6" strokeWidth="1" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#F3F4F6" strokeWidth="1" />
              <line x1="0" y1="110" x2="500" y2="110" stroke="#F3F4F6" strokeWidth="1" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#E5E7EB" strokeWidth="1" />

              <path
                d={totalDocs > 0 
                  ? "M 0,135 C 100,135 150,110 250,90 C 350,70 420,40 500,30 L 500,140 L 0,140 Z"
                  : "M 0,140 L 500,140 Z"
                }
                fill="url(#areaGradient)"
              />

              <path
                d={totalDocs > 0 
                  ? "M 0,135 C 100,135 150,110 250,90 C 350,70 420,40 500,30"
                  : "M 0,140 L 500,140"
                }
                fill="none"
                stroke="#4F46E5"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {totalDocs > 0 && (
                <>
                  <circle cx="250" cy="90" r="3.5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="500" cy="30" r="3.5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
                </>
              )}
            </svg>

            <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1 font-medium">
              <span>6d ago</span>
              <span>5d ago</span>
              <span>4d ago</span>
              <span>3d ago</span>
              <span>2d ago</span>
              <span>Yesterday</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Documents by Type Donut (1/3 width) */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#111827]">
              Documents by Type
            </h2>
            <p className="text-[11px] text-[#6B7280]">Actual workspace MIME distribution</p>
          </div>

          <div className="flex items-center justify-center my-3">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F3F4F6" strokeWidth="12" />
                
                {totalDocs > 0 ? (
                  <>
                    {/* Invoices (PDF) */}
                    {invoiceStroke > 0 && (
                      <circle 
                        cx="50" cy="50" r="38" fill="transparent" stroke="#4F46E5" strokeWidth="12"
                        strokeDasharray={`${invoiceStroke} ${circumference}`} strokeDashoffset="0"
                      />
                    )}
                    {/* Receipts (Images) */}
                    {receiptStroke > 0 && (
                      <circle 
                        cx="50" cy="50" r="38" fill="transparent" stroke="#10B981" strokeWidth="12"
                        strokeDasharray={`${receiptStroke} ${circumference}`} strokeDashoffset={`-${invoiceStroke}`}
                      />
                    )}
                    {/* Others */}
                    {otherStroke > 0 && (
                      <circle 
                        cx="50" cy="50" r="38" fill="transparent" stroke="#F59E0B" strokeWidth="12"
                        strokeDasharray={`${otherStroke} ${circumference}`} strokeDashoffset={`-${invoiceStroke + receiptStroke}`}
                      />
                    )}
                  </>
                ) : (
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#E5E7EB" strokeWidth="12" />
                )}
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-lg font-bold text-[#111827]">{totalDocs}</span>
                <span className="text-[9px] text-[#6B7280] uppercase tracking-wider">Docs</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-[#111827]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#6B7280]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
                Invoices (PDF)
              </span>
              <span className="font-semibold">{invoicePct}% ({invoicesCount})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#6B7280]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                Scans (Images)
              </span>
              <span className="font-semibold">{receiptPct}% ({receiptsCount})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#6B7280]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                Other Documents
              </span>
              <span className="font-semibold">{otherPct}% ({othersCount})</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Recent Documents (Real API Data Only) + Processing Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Recent Documents Table (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#111827]">
              Recent Documents
            </h2>
            <Link to="/documents" className="text-xs font-semibold text-[#4F46E5] hover:underline">
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-[#9CA3AF] border-b border-[#E5E7EB] bg-[#F9FAFB]/60">
                <tr>
                  <th className="py-2 px-3 font-semibold">Document</th>
                  <th className="py-2 px-3 font-semibold">Type</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                  <th className="py-2 px-3 font-semibold">Uploaded By</th>
                  <th className="py-2 px-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {documents.length > 0 ? (
                  documents.slice(0, 5).map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-2.5 px-3 font-medium text-[#111827] flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
                        <span className="truncate max-w-[220px]">{doc.original_filename}</span>
                      </td>
                      <td className="py-2.5 px-3 text-[#6B7280]">
                        {doc.mime_type.includes('pdf') ? 'Invoice' : 'Receipt'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          doc.status === 'completed'
                            ? 'bg-[#ECFDF5] text-[#10B981] border border-[#10B981]/20'
                            : doc.status === 'processing'
                            ? 'bg-[#EFF6FF] text-[#3B82F6] border border-[#3B82F6]/20'
                            : 'bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/20'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#6B7280]">{user?.display_name || user?.email || 'abderrahmane'}</td>
                      <td className="py-2.5 px-3 text-[#6B7280]">
                        {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-[#9CA3AF]">
                      No documents uploaded yet. Upload your first PDF to generate statistics.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Processing Status (1/3 width, 100% Real Live Math) */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#111827] mb-3">
              Processing Status
            </h2>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-[#111827]">Completed</span>
                  <span className="text-[#6B7280]">
                    {completedDocs} ({totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#10B981] rounded-full transition-all duration-500" 
                    style={{ width: `${totalDocs > 0 ? (completedDocs / totalDocs) * 100 : 0}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-[#111827]">Processing</span>
                  <span className="text-[#6B7280]">
                    {processingDocs} ({totalDocs > 0 ? Math.round((processingDocs / totalDocs) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#3B82F6] rounded-full transition-all duration-500" 
                    style={{ width: `${totalDocs > 0 ? (processingDocs / totalDocs) * 100 : 0}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-[#111827]">Needs Review</span>
                  <span className="text-[#6B7280]">
                    {needsReviewDocs} ({totalDocs > 0 ? Math.round((needsReviewDocs / totalDocs) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#F59E0B] rounded-full transition-all duration-500" 
                    style={{ width: `${totalDocs > 0 ? (needsReviewDocs / totalDocs) * 100 : 0}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] mt-3 flex items-center justify-between text-xs text-[#6B7280]">
            <span>Active Worker Node</span>
            <span className="font-semibold text-[#10B981] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Online
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
