import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  role: 'user' | 'ai';
  content: string;
  sources?: { document_id: string; page: number; score: number }[];
}

export default function Chat() {
  const { token } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! Ask me anything about your uploaded documents.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: userMsg })
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.answer,
        sources: data.sources 
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', content: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Chat with Documents</h1>
      
      <div style={{ flex: 1, overflowY: 'auto', background: 'white', borderRadius: '8px', padding: '1rem', border: '1px solid #e5e7eb', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            <div style={{ 
              background: m.role === 'user' ? '#3b82f6' : '#f3f4f6', 
              color: m.role === 'user' ? 'white' : 'black',
              padding: '0.75rem 1rem', 
              borderRadius: '8px',
              whiteSpace: 'pre-wrap'
            }}>
              {m.content}
            </div>
            {m.sources && m.sources.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Sources: {m.sources.map(s => `Page ${s.page}`).join(', ')}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', background: '#f3f4f6', padding: '0.75rem 1rem', borderRadius: '8px', color: '#6b7280' }}>
            Thinking...
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question about your documents..."
          style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
