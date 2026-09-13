import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UploadModal from '../components/UploadModal';

interface Document {
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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = async () => {
    if (!user || !token) return;
    try {
      const response = await fetch(`http://localhost:8000/api/v1/documents/?workspace_id=${user.workspaces[0]?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user, token]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const response = await fetch(`http://localhost:8000/api/v1/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Documents</h1>
        <div>
          <button 
            onClick={fetchDocuments}
            style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', marginRight: '1rem' }}
          >
            Refresh
          </button>
          <button 
            onClick={() => setIsUploadOpen(true)}
            style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Upload Document
          </button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading documents...</div>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
          <p style={{ color: '#6b7280' }}>No documents uploaded yet.</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Type</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Size</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>{doc.original_filename}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.875rem' }}>{doc.mime_type.split('/')[1].toUpperCase()}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.875rem' }}>{formatSize(doc.file_size_bytes)}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ padding: '0.25rem 0.5rem', background: '#dbeafe', color: '#1e40af', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500' }}>
                    {doc.status} ({Math.round(doc.progress * 100)}%)
                  </span>
                </td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                  <button onClick={() => handleDelete(doc.id)} style={{ padding: '0.25rem 0.5rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isUploadOpen && (
        <UploadModal 
          onClose={() => setIsUploadOpen(false)} 
          onUploadSuccess={fetchDocuments}
        />
      )}
    </div>
  );
}
