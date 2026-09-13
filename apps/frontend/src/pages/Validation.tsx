import { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  ChevronRight,
  ArrowLeft,
  FileCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface FieldItem {
  id: string;
  label: string;
  value: string;
  confidence: number;
  status: 'validated' | 'needs_review' | 'corrected';
}

export default function Validation() {
  const [fields, setFields] = useState<FieldItem[]>([
    { id: '1', label: 'Invoice Number', value: 'INV-2024-00123', confidence: 98, status: 'validated' },
    { id: '2', label: 'Invoice Date', value: 'May 18, 2024', confidence: 96, status: 'validated' },
    { id: '3', label: 'Due Date', value: 'June 17, 2024', confidence: 95, status: 'validated' },
    { id: '4', label: 'Supplier Name', value: 'Acme Corporation', confidence: 99, status: 'validated' },
    { id: '5', label: 'Supplier Tax ID', value: '12-3456789', confidence: 71, status: 'needs_review' },
    { id: '6', label: 'Customer Name', value: 'Tech Solutions Inc.', confidence: 98, status: 'validated' },
    { id: '7', label: 'Currency', value: 'USD', confidence: 99, status: 'validated' },
    { id: '8', label: 'Total Amount', value: '$3,025.00', confidence: 98, status: 'validated' }
  ]);

  const [selectedFieldId, setSelectedFieldId] = useState<string>('5');
  const selectedField = fields.find(f => f.id === selectedFieldId);

  const handleConfirm = () => {
    setFields(prev => prev.map(f => f.id === selectedFieldId ? { ...f, status: 'validated' } : f));
  };

  const handleCorrect = (newVal: string) => {
    setFields(prev => prev.map(f => f.id === selectedFieldId ? { ...f, value: newVal, status: 'corrected' } : f));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/documents" className="p-2 rounded-lg bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827]">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
              <span>Documents</span>
              <ChevronRight className="w-3 h-3" />
              <span>INV-2024-00123.pdf</span>
            </div>
            <h1 className="text-[20px] font-bold text-[#111827] mt-0.5">Field Validation & Review</h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="h-9 px-3 bg-white border border-[#D1D5DB] rounded-lg text-xs font-semibold text-[#111827] flex items-center gap-1.5 shadow-xs hover:bg-[#F9FAFB]">
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button className="h-9 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Mark as Validated</span>
          </button>
        </div>
      </div>

      {/* 3-Column Desktop Layout (Section 9.6: Preview 32%, Field List 38%, Review Panel 30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        
        {/* Column 1: Document Preview (32% -> lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] mb-3 text-xs text-[#6B7280]">
            <span className="font-semibold text-[#111827]">Original Scanned PDF</span>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:text-[#111827]"><ZoomIn className="w-3.5 h-3.5" /></button>
              <button className="p-1 hover:text-[#111827]"><ZoomOut className="w-3.5 h-3.5" /></button>
              <button className="p-1 hover:text-[#111827]"><RotateCw className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Render Mock Document Invoice Container */}
          <div className="flex-1 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-4 text-[11px] text-[#111827] space-y-3 overflow-y-auto font-mono">
            <div className="flex justify-between border-b pb-2">
              <div>
                <span className="font-bold text-sm">ACME CORP</span>
                <p className="text-[10px] text-[#6B7280]">123 Business Way, New York</p>
              </div>
              <span className="font-bold text-sm text-[#4F46E5]">INVOICE</span>
            </div>
            
            <div className="space-y-1 text-[#4B5563]">
              <p>Invoice #: INV-2024-00123</p>
              <p>Date: May 18, 2024</p>
              <p className="bg-[#FFFBEB] p-1 border border-[#F59E0B] rounded">
                Supplier Tax ID: 12-3456789
              </p>
              <p>Total: $3,025.00</p>
            </div>

            <div className="pt-4 border-t text-[10px] text-[#9CA3AF] text-center">
              Page 1 of 1 · OCR confidence 96.4%
            </div>
          </div>
        </div>

        {/* Column 2: Field List (38% -> lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E5E7EB] shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#111827]">Extracted Fields (8)</h2>
            <span className="text-xs font-semibold text-[#F59E0B] bg-[#FFFBEB] px-2 py-0.5 rounded-full border border-[#F59E0B]/20">
              1 Needs Review
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7EB]">
            {fields.map((field) => {
              const isSelected = field.id === selectedFieldId;
              const isHigh = field.confidence >= 90;
              const isWarning = field.confidence >= 75 && field.confidence < 90;

              return (
                <div
                  key={field.id}
                  onClick={() => setSelectedFieldId(field.id)}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#EEF2FF] border-l-4 border-l-[#4F46E5]' : 'hover:bg-[#F9FAFB]'
                  }`}
                >
                  <div>
                    <span className="text-xs font-medium text-[#6B7280]">{field.label}</span>
                    <div className="text-sm font-semibold text-[#111827] mt-0.5">{field.value}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Confidence Indicator (Section 9.5: Green >=90, Amber 75-89, Red <75) */}
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isHigh
                        ? 'bg-[#ECFDF5] text-[#10B981]'
                        : isWarning
                        ? 'bg-[#FFFBEB] text-[#F59E0B]'
                        : 'bg-[#FEF2F2] text-[#EF4444]'
                    }`}>
                      {field.confidence}%
                    </span>

                    {field.status === 'validated' && <CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
                    {field.status === 'needs_review' && <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />}
                    {field.status === 'corrected' && <FileCheck className="w-4 h-4 text-[#4F46E5]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 3: Field Details & Audit Actions (30% -> lg:col-span-3) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#111827] pb-3 border-b border-[#E5E7EB]">
              Field Inspector
            </h3>

            {selectedField ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#6B7280]">Target Key</span>
                  <p className="font-semibold text-sm text-[#111827] mt-0.5">{selectedField.label}</p>
                </div>

                <div>
                  <span className="text-[#6B7280]">Extracted Value</span>
                  <input 
                    type="text" 
                    value={selectedField.value} 
                    onChange={(e) => handleCorrect(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#D1D5DB] rounded-lg text-sm font-medium text-[#111827] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#EEF2FF]"
                  />
                </div>

                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Confidence:</span>
                    <span className="font-bold text-[#111827]">{selectedField.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Source Engine:</span>
                    <span className="text-[#111827]">Tesseract v5.3 OCR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Status:</span>
                    <span className="font-semibold text-[#4F46E5] capitalize">{selectedField.status}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#9CA3AF]">Select a field to review</div>
            )}
          </div>

          <div className="space-y-2 pt-4 border-t border-[#E5E7EB]">
            <button 
              onClick={handleConfirm}
              className="w-full h-9 bg-[#10B981] hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm Valid</span>
            </button>
            <button 
              className="w-full h-9 bg-white border border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject Field</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
