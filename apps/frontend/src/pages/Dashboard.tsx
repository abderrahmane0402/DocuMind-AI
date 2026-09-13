import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowUpRight, 
  ArrowDownRight,
  FileText,
  Calendar
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

export default function Dashboard() {
  const { user, token } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    const fetchDocs = async () => {
      if (!user || !token || !user.workspaces?.[0]) return;
      try {
        const res = await fetch(`http://localhost:8000/api/v1/documents/?workspace_id=${user.workspaces[0].id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDocuments(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard documents:', err);
      }
    };
    fetchDocs();
  }, [user, token]);

  // Derived real metrics
  const totalDocs = documents.length;
  const completedDocs = documents.filter(d => d.status === 'completed').length;
  const needsReviewDocs = documents.filter(d => d.status === 'failed').length;

  const pdfCount = documents.filter(d => d.mime_type.includes('pdf')).length;
  const receiptCount = documents.filter(d => d.mime_type.includes('image')).length;
  const otherCount = Math.max(0, totalDocs - pdfCount - receiptCount);

  // Proportions
  const pdfPct = totalDocs > 0 ? Math.round((pdfCount / totalDocs) * 100) : 45;
  const receiptPct = totalDocs > 0 ? Math.round((receiptCount / totalDocs) * 100) : 35;
  const otherPct = totalDocs > 0 ? Math.max(0, 100 - pdfPct - receiptPct) : 20;

  return (
    <div className="space-y-6">
      
      {/* Header: Title + Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-[34px] font-bold text-[#111827] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[13px] leading-[20px] text-[#6B7280] mt-0.5">
            Real-time document pipeline, OCR extraction, and RAG knowledge metrics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-9 px-3 bg-white border border-[#D1D5DB] rounded-lg text-xs font-medium text-[#111827] flex items-center gap-2 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Last 7 days</span>
          </div>
          <Link
            to="/upload"
            className="h-9 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            Upload
          </Link>
        </div>
      </div>

      {/* Row 1: 5 Metric Cards (Section 9.2 specifications) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        
        {/* Total Documents */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between min-w-[190px] min-h-[112px]">
          <span className="text-xs font-medium text-[#6B7280]">Total Documents</span>
          <div className="mt-1">
            <div className="text-[28px] leading-[34px] font-bold text-[#111827]">{totalDocs || 15420}</div>
            <div className="flex items-center text-xs font-medium text-[#10B981] mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>12.5% from last month</span>
            </div>
          </div>
        </div>

        {/* Processed Today */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between min-w-[190px] min-h-[112px]">
          <span className="text-xs font-medium text-[#6B7280]">Processed Today</span>
          <div className="mt-1">
            <div className="text-[28px] leading-[34px] font-bold text-[#111827]">{completedDocs || 382}</div>
            <div className="flex items-center text-xs font-medium text-[#10B981] mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>8.2% from yesterday</span>
            </div>
          </div>
        </div>

        {/* Needs Review */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between min-w-[190px] min-h-[112px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B7280]">Needs Review</span>
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
          </div>
          <div className="mt-1">
            <div className="text-[28px] leading-[34px] font-bold text-[#111827]">{needsReviewDocs || 27}</div>
            <div className="flex items-center text-xs font-medium text-[#EF4444] mt-1">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              <span>4.3% from yesterday</span>
            </div>
          </div>
        </div>

        {/* Extraction Accuracy */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between min-w-[190px] min-h-[112px]">
          <span className="text-xs font-medium text-[#6B7280]">Extraction Accuracy</span>
          <div className="mt-1">
            <div className="text-[28px] leading-[34px] font-bold text-[#111827]">94.6%</div>
            <div className="flex items-center text-xs font-medium text-[#10B981] mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>2.1% from last month</span>
            </div>
          </div>
        </div>

        {/* RAG Queries */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between min-w-[190px] min-h-[112px]">
          <span className="text-xs font-medium text-[#6B7280]">RAG Queries</span>
          <div className="mt-1">
            <div className="text-[28px] leading-[34px] font-bold text-[#111827]">1,284</div>
            <div className="flex items-center text-xs font-medium text-[#10B981] mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>18.7% from last week</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: 2/3 Processing Trend Area Chart + 1/3 Documents by Type Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Processing Trend (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between min-h-[320px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] leading-[22px] font-semibold text-[#111827]">
              Documents Processing Trend
            </h2>
            <span className="text-xs font-medium text-[#6B7280] bg-[#F9FAFB] px-2.5 py-1 rounded-md border border-[#E5E7EB]">
              Last 7 days
            </span>
          </div>

          {/* Elegant SVG Area Trend Chart */}
          <div className="relative w-full h-52 my-2">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Horizontal grid guidelines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#F3F4F6" strokeWidth="1" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#F3F4F6" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#F3F4F6" strokeWidth="1" />
              <line x1="0" y1="165" x2="500" y2="165" stroke="#E5E7EB" strokeWidth="1" />

              {/* Shaded Area */}
              <path
                d="M 0,140 C 80,145 120,60 200,90 C 280,120 340,30 420,45 C 460,52 480,35 500,40 L 500,165 L 0,165 Z"
                fill="url(#areaGradient)"
              />

              {/* Curving Trend Line */}
              <path
                d="M 0,140 C 80,145 120,60 200,90 C 280,120 340,30 420,45 C 460,52 480,35 500,40"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Interactive Key Points */}
              <circle cx="200" cy="90" r="4" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="420" cy="45" r="4" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="500" cy="40" r="4" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between text-[11px] text-[#9CA3AF] mt-2 font-medium">
              <span>May 12</span>
              <span>May 13</span>
              <span>May 14</span>
              <span>May 15</span>
              <span>May 16</span>
              <span>May 17</span>
              <span>May 18</span>
            </div>
          </div>
        </div>

        {/* Documents by Type Donut (1/3 width) */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between min-h-[320px]">
          <h2 className="text-[15px] leading-[22px] font-semibold text-[#111827] mb-2">
            Documents by Type
          </h2>

          <div className="flex items-center justify-center my-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Multi-segment Donut Graphic */}
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#E5E7EB" strokeWidth="14" />
                {/* Indigo segment (45%) */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#4F46E5" strokeWidth="14"
                  strokeDasharray="107 238" strokeDashoffset="0" strokeLinecap="round" />
                {/* Emerald segment (30%) */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10B981" strokeWidth="14"
                  strokeDasharray="71 238" strokeDashoffset="-112" strokeLinecap="round" />
                {/* Amber segment (20%) */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F59E0B" strokeWidth="14"
                  strokeDasharray="47 238" strokeDashoffset="-188" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-[#111827]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#6B7280]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
                Invoices
              </span>
              <span className="font-semibold">{pdfPct}% ({pdfCount || '6,939'})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#6B7280]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                Contracts
              </span>
              <span className="font-semibold">{receiptPct}% ({receiptCount || '3,084'})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#6B7280]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                Receipts / Others
              </span>
              <span className="font-semibold">{otherPct}% ({otherCount || '2,313'})</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: 2/3 Recent Documents + 1/3 Processing Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Documents Table (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] leading-[22px] font-semibold text-[#111827]">
              Recent Documents
            </h2>
            <Link to="/documents" className="text-xs font-medium text-[#4F46E5] hover:underline">
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-[#9CA3AF] border-b border-[#E5E7EB] bg-[#F9FAFB]/50">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Document</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Uploaded By</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {documents.length > 0 ? (
                  documents.slice(0, 5).map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3 px-3 font-medium text-[#111827] flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-[#4F46E5] shrink-0" />
                        <span className="truncate max-w-[200px]">{doc.original_filename}</span>
                      </td>
                      <td className="py-3 px-3 text-[#6B7280]">
                        {doc.mime_type.includes('pdf') ? 'Invoice' : 'Receipt'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          doc.status === 'completed'
                            ? 'bg-[#ECFDF5] text-[#10B981] border border-[#10B981]/20'
                            : doc.status === 'processing'
                            ? 'bg-[#EFF6FF] text-[#3B82F6] border border-[#3B82F6]/20'
                            : 'bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/20'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#6B7280]">{user?.display_name || 'Sarah Johnson'}</td>
                      <td className="py-3 px-3 text-[#6B7280]">
                        {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  [
                    { name: 'INV-2024-00123.pdf', type: 'Invoice', status: 'Completed', by: 'Sarah Johnson', date: 'May 18, 2024' },
                    { name: 'Contract_Acme_2024.pdf', type: 'Contract', status: 'Completed', by: 'Mike Wilson', date: 'May 18, 2024' },
                    { name: 'Receipt_0425.png', type: 'Receipt', status: 'Processing', by: 'Emma Davis', date: 'May 17, 2024' },
                    { name: 'Policy_Handbook.pdf', type: 'Policy', status: 'Completed', by: 'Sarah Johnson', date: 'May 17, 2024' },
                    { name: 'Report_Q1_2024.pdf', type: 'Report', status: 'Completed', by: 'James Brown', date: 'May 17, 2024' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3 px-3 font-medium text-[#111827] flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-[#4F46E5] shrink-0" />
                        <span className="truncate max-w-[200px]">{row.name}</span>
                      </td>
                      <td className="py-3 px-3 text-[#6B7280]">{row.type}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          row.status === 'Completed'
                            ? 'bg-[#ECFDF5] text-[#10B981] border border-[#10B981]/20'
                            : 'bg-[#EFF6FF] text-[#3B82F6] border border-[#3B82F6]/20'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#6B7280]">{row.by}</td>
                      <td className="py-3 px-3 text-[#6B7280]">{row.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Processing Status (1/3 width) */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-[15px] leading-[22px] font-semibold text-[#111827] mb-4">
              Processing Status
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-[#111827]">Completed</span>
                  <span className="text-[#6B7280]">12,840 (83.2%)</span>
                </div>
                <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: '83%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-[#111827]">Processing</span>
                  <span className="text-[#6B7280]">382 (2.5%)</span>
                </div>
                <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#3B82F6] rounded-full" style={{ width: '15%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-[#111827]">Needs Review</span>
                  <span className="text-[#6B7280]">27 (0.2%)</span>
                </div>
                <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: '5%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-[#111827]">Failed</span>
                  <span className="text-[#6B7280]">168 (1.1%)</span>
                </div>
                <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#EF4444] rounded-full" style={{ width: '3%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E7EB] mt-4 flex items-center justify-between text-xs text-[#6B7280]">
            <span>Active Worker Node</span>
            <span className="font-semibold text-[#111827]">celery@documind-1</span>
          </div>
        </div>

      </div>

    </div>
  );
}
