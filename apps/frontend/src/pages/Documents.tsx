import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  UploadCloud, 
  Search, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trash2,
  CheckSquare
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

export default function Documents() {
  const { user, token } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

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
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;
    try {
      setDeleting(true);
      const res = await fetch(`http://localhost:8000/api/v1/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok || res.status === 204) {
        setDocuments(prev => prev.filter(d => d.id !== id));
        setSelectedIds(prev => prev.filter(item => item !== id));
      } else {
        alert('Failed to delete document.');
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    } finally {
      setDeleting(false);
    }
  };

  const deleteSelectedDocuments = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected document(s)?`)) return;
    try {
      setDeleting(true);
      const res = await fetch('http://localhost:8000/api/v1/documents/batch-delete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ document_ids: selectedIds })
      });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => !selectedIds.includes(d.id)));
        setSelectedIds([]);
      } else {
        alert('Failed to delete selected documents.');
      }
    } catch (err) {
      console.error('Failed to batch delete:', err);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [user, token]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(d => d.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getType = (mime: string, name: string) => {
    if (name.toLowerCase().includes('invoice') || mime.includes('pdf')) return 'Invoice';
    if (name.toLowerCase().includes('contract')) return 'Contract';
    if (name.toLowerCase().includes('receipt') || mime.includes('image')) return 'Receipt';
    if (name.toLowerCase().includes('policy')) return 'Policy';
    return 'Report';
  };

  const displayDocs = documents;

  const filtered = displayDocs.filter(d => {
    const matchesSearch = d.original_filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const docType = getType(d.mime_type, d.original_filename).toLowerCase();
    const matchesType = typeFilter === 'all' || docType === typeFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-[34px] font-bold text-[#111827] tracking-tight">
            Documents
          </h1>
          <p className="text-[13px] leading-[20px] text-[#6B7280] mt-0.5">
            Manage your document collection, extract structured metadata, and trigger validation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDocs}
            className="h-9 px-3 bg-white border border-[#D1D5DB] rounded-lg text-xs font-medium text-[#111827] flex items-center gap-2 shadow-xs hover:bg-[#F9FAFB] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#4F46E5]' : 'text-[#6B7280]'}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/upload"
            className="h-9 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload</span>
          </Link>
        </div>
      </div>

      {/* Toolbar (Section 9.3) */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-xl">
          {/* Search 280-360px */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input 
              type="text" 
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#EEF2FF]"
            />
          </div>

          {/* Type Filter */}
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#4F46E5]"
          >
            <option value="all">All Types</option>
            <option value="invoice">Invoices</option>
            <option value="contract">Contracts</option>
            <option value="receipt">Receipts</option>
            <option value="policy">Policies</option>
            <option value="report">Reports</option>
          </select>

          {/* Status Filter */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#4F46E5]"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="needs_review">Needs Review</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={deleteSelectedDocuments}
              disabled={deleting}
              className="h-9 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <Filter className="w-3.5 h-3.5" />
            <span>{filtered.length} results</span>
          </div>
        </div>
      </div>

      {/* Bulk Selection Notification Banner */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            <span>
              <strong className="font-semibold">{selectedIds.length}</strong> document{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1 text-xs text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100/60 rounded-md font-medium transition-colors"
            >
              Deselect All
            </button>
            <button
              onClick={deleteSelectedDocuments}
              disabled={deleting}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table: selection | name | type | status | uploaded by | date | size | actions */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#F9FAFB] text-[#6B7280] font-semibold text-[11px] uppercase tracking-wider border-b border-[#E5E7EB] h-11">
              <tr>
                <th className="w-11 px-4">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-[#D1D5DB] text-[#4F46E5] focus:ring-[#4F46E5]"
                  />
                </th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Uploaded By</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filtered.map((doc) => {
                const isSelected = selectedIds.includes(doc.id);
                const typeLabel = getType(doc.mime_type, doc.original_filename);

                return (
                  <tr 
                    key={doc.id}
                    className={`h-[52px] hover:bg-[#F9FAFB] transition-colors ${isSelected ? 'bg-[#EEF2FF]/40' : ''}`}
                  >
                    <td className="w-11 px-4">
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(doc.id)}
                        className="w-4 h-4 rounded border-[#D1D5DB] text-[#4F46E5] focus:ring-[#4F46E5]"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-[#111827]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate max-w-sm">{doc.original_filename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">
                      {typeLabel}
                    </td>
                    <td className="px-4 py-3">
                      {doc.status === 'completed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#10B981] border border-[#10B981]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                          Completed
                        </span>
                      )}
                      {doc.status === 'processing' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EFF6FF] text-[#3B82F6] border border-[#3B82F6]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-ping" />
                          Processing {doc.progress ? `(${doc.progress}%)` : ''}
                        </span>
                      )}
                      {doc.status === 'needs_review' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFFBEB] text-[#F59E0B] border border-[#F59E0B]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                          Needs Review
                        </span>
                      )}
                      {doc.status === 'failed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {user?.display_name || user?.email?.split('@')[0] || 'Admin'}
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">
                      {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">{formatSize(doc.file_size_bytes)}</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => deleteDocument(doc.id, doc.original_filename)}
                        disabled={deleting}
                        className="p-1.5 text-[#9CA3AF] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Section (Bottom left count, Bottom right pages) */}
        <div className="h-14 px-6 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280] bg-[#F9FAFB]/50">
          <div>
            Showing <span className="font-semibold text-[#111827]">{filtered.length > 0 ? `1-${filtered.length}` : '0'}</span> of <span className="font-semibold text-[#111827]">{documents.length}</span> documents
          </div>

          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-md border border-[#D1D5DB] text-[#9CA3AF] hover:bg-white disabled:opacity-40">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 rounded-md bg-[#4F46E5] text-white font-medium text-xs">
              1
            </button>
            <button className="p-1.5 rounded-md border border-[#D1D5DB] text-[#6B7280] hover:bg-white">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
