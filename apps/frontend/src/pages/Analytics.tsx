import { 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight
} from 'lucide-react';

export default function Analytics() {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-[34px] font-bold text-[#111827] tracking-tight">
            Analytics & Accuracy
          </h1>
          <p className="text-[13px] leading-[20px] text-[#6B7280] mt-0.5">
            OCR recognition rates, latency distributions, and query performance over time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-9 px-3 bg-white border border-[#D1D5DB] rounded-lg text-xs font-medium text-[#111827] flex items-center gap-2 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>May 12 - May 18, 2024</span>
          </div>
        </div>
      </div>

      {/* Top Metrics Row (Section 9.8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
          <span className="text-xs font-medium text-[#6B7280]">Total Documents</span>
          <div className="text-[28px] leading-[34px] font-bold text-[#111827] mt-1">2,145</div>
          <span className="flex items-center text-xs font-medium text-[#10B981] mt-1">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +12.5%
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
          <span className="text-xs font-medium text-[#6B7280]">Processed Today</span>
          <div className="text-[28px] leading-[34px] font-bold text-[#111827] mt-1">1,982</div>
          <span className="flex items-center text-xs font-medium text-[#10B981] mt-1">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +8.1%
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
          <span className="text-xs font-medium text-[#6B7280]">Avg. Extraction Accuracy</span>
          <div className="text-[28px] leading-[34px] font-bold text-[#111827] mt-1">94.6%</div>
          <span className="flex items-center text-xs font-medium text-[#10B981] mt-1">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +2.1%
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
          <span className="text-xs font-medium text-[#6B7280]">Avg. Processing Time</span>
          <div className="text-[28px] leading-[34px] font-bold text-[#111827] mt-1">38s</div>
          <span className="flex items-center text-xs font-medium text-[#10B981] mt-1">
            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> -4.2s faster
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
          <span className="text-xs font-medium text-[#6B7280]">RAG Queries</span>
          <div className="text-[28px] leading-[34px] font-bold text-[#111827] mt-1">1,284</div>
          <span className="flex items-center text-xs font-medium text-[#10B981] mt-1">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +18.7%
          </span>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Documents Over Time */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#111827]">Documents Over Time</h2>
            <span className="text-xs text-[#6B7280]">Daily Volume</span>
          </div>

          <div className="h-52 w-full pt-4">
            <svg viewBox="0 0 400 140" className="w-full h-full overflow-visible">
              <line x1="0" y1="20" x2="400" y2="20" stroke="#F3F4F6" strokeWidth="1" />
              <line x1="0" y1="60" x2="400" y2="60" stroke="#F3F4F6" strokeWidth="1" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="#F3F4F6" strokeWidth="1" />
              <line x1="0" y1="130" x2="400" y2="130" stroke="#E5E7EB" strokeWidth="1" />
              
              <path
                d="M 0,110 C 60,115 100,50 160,70 C 220,90 280,20 340,35 L 400,25"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="160" cy="70" r="4" fill="#2563EB" stroke="#fff" strokeWidth="2" />
              <circle cx="340" cy="35" r="4" fill="#2563EB" stroke="#fff" strokeWidth="2" />
            </svg>
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

        {/* Chart 2: Extraction Accuracy Over Time */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#111827]">Extraction Accuracy Over Time</h2>
            <span className="text-xs text-[#10B981] font-semibold">94.6% Avg</span>
          </div>

          <div className="h-52 w-full pt-4">
            <svg viewBox="0 0 400 140" className="w-full h-full overflow-visible">
              <line x1="0" y1="20" x2="400" y2="20" stroke="#F3F4F6" strokeWidth="1" />
              <line x1="0" y1="60" x2="400" y2="60" stroke="#F3F4F6" strokeWidth="1" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="#F3F4F6" strokeWidth="1" />
              <line x1="0" y1="130" x2="400" y2="130" stroke="#E5E7EB" strokeWidth="1" />
              
              <path
                d="M 0,60 C 70,55 120,40 180,30 C 240,20 300,50 360,25 L 400,20"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="180" cy="30" r="4" fill="#10B981" stroke="#fff" strokeWidth="2" />
              <circle cx="360" cy="25" r="4" fill="#10B981" stroke="#fff" strokeWidth="2" />
            </svg>
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

        {/* Processing Time Distribution (Bars) */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#111827]">Processing Time Distribution</h2>
            <span className="text-xs text-[#6B7280]">Latency Cohorts</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-[#E5E7EB] pb-2">
            {[
              { label: '0-15s', height: '35%', count: '240' },
              { label: '15-30s', height: '60%', count: '680' },
              { label: '30-45s', height: '85%', count: '910' },
              { label: '45-60s', height: '70%', count: '740' },
              { label: '60-120s', height: '25%', count: '180' },
              { label: '120s+', height: '10%', count: '45' }
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] text-[#6B7280]">{bar.count}</span>
                <div 
                  className="w-full bg-[#4F46E5] hover:bg-[#4338CA] rounded-t-md transition-all" 
                  style={{ height: bar.height }} 
                />
                <span className="text-[10px] text-[#9CA3AF] mt-1">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Document Classification Breakdown */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111827] mb-4">MIME Type Classification</h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#F9FAFB]">
                <span className="text-[#111827] font-medium">application/pdf</span>
                <span className="font-bold text-[#4F46E5]">1,450 (67.6%)</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#F9FAFB]">
                <span className="text-[#111827] font-medium">image/png</span>
                <span className="font-bold text-[#10B981]">412 (19.2%)</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#F9FAFB]">
                <span className="text-[#111827] font-medium">image/jpeg</span>
                <span className="font-bold text-[#F59E0B]">283 (13.2%)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E7EB] flex justify-between text-xs text-[#6B7280]">
            <span>Model Execution Engine</span>
            <span className="font-semibold text-[#111827]">PyMuPDF + Tesseract OCR</span>
          </div>
        </div>

      </div>

    </div>
  );
}
