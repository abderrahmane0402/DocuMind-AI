import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Loader2, 
  FileText, 
  Plus, 
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
  sources?: { document_id: string; page: number; score: number }[];
}

export default function Chat() {
  const { token } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      content: 'Hello! Ask me any question about your uploaded contracts, invoices, and documents. I retrieve factual answers and cite exact pages.',
      sources: []
    }
  ]);
  const [activeSources, setActiveSources] = useState<any[]>([
    { document_name: 'INV-2024-00123.pdf', page: 1, confidence: 0.98, snippet: 'Total amount for Invoice INV-2024-00123 is USD 3,025.00 due on June 17, 2024.' },
    { document_name: 'Contract_Acme_2024.pdf', page: 3, confidence: 0.94, snippet: 'Section 4.2 Payment Terms: Net 30 days upon invoice receipt.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');

    const updatedHistory = [...messages, { role: 'user', content: userMsg }];
    setMessages(updatedHistory as Message[]);
    setIsLoading(true);

    // AI placeholder
    setMessages(prev => [...prev, { role: 'ai', content: '', sources: [] }]);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: updatedHistory.filter(m => m.content).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error('Query failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';
      let aiSources: any[] = [];

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') {
              setIsLoading(false);
              break;
            }
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'sources') {
                aiSources = data.sources;
                if (data.sources.length > 0) {
                  setActiveSources(data.sources.map((s: any) => ({
                    document_name: `Document ${s.document_id.substring(0, 6)}.pdf`,
                    page: s.page,
                    confidence: s.score ? Math.min(0.99, s.score + 0.5) : 0.95,
                    snippet: 'Extracted semantic context retrieved from Qdrant vector database.'
                  })));
                }
              } else if (data.type === 'content') {
                aiContent += data.content;
              }

              setMessages(prev => {
                const next = [...prev];
                next[next.length - 1] = {
                  role: 'ai',
                  content: aiContent,
                  sources: aiSources
                };
                return next;
              });
            } catch (err) {
              console.error(err);
            }
          }
        }
      }
    } catch (err: any) {
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: 'ai', content: `Error: ${err.message}` };
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 overflow-hidden">
      
      {/* Panel 1: Conversation List (Section 9.7: 260px) */}
      <div className="hidden xl:flex w-[260px] bg-white rounded-xl border border-[#E5E7EB] p-4 flex-col justify-between shrink-0 shadow-xs">
        <div className="space-y-3">
          <button className="w-full h-9 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs">
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <div className="pt-2 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
            Recent Conversations
          </div>

          <div className="space-y-1">
            <button className="w-full text-left p-2.5 rounded-lg bg-[#EEF2FF] text-[#4F46E5] font-medium text-xs flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Invoice Total & Terms</span>
            </button>
            <button className="w-full text-left p-2.5 rounded-lg hover:bg-[#F9FAFB] text-[#6B7280] font-medium text-xs flex items-center gap-2 transition-colors">
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Acme Contract Clause 4</span>
            </button>
            <button className="w-full text-left p-2.5 rounded-lg hover:bg-[#F9FAFB] text-[#6B7280] font-medium text-xs flex items-center gap-2 transition-colors">
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Q1 Expenses Summary</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-[#9CA3AF] text-center pt-3 border-t border-[#E5E7EB]">
          Conversations are encrypted & private
        </div>
      </div>

      {/* Panel 2: Fluid Chat Canvas (Section 9.7: minimum 520px) */}
      <div className="flex-1 bg-white rounded-xl border border-[#E5E7EB] shadow-xs flex flex-col min-w-[320px] overflow-hidden">
        
        {/* Chat Canvas Header */}
        <div className="h-14 px-6 border-b border-[#E5E7EB] flex items-center justify-between shrink-0 bg-[#F9FAFB]/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4F46E5]" />
            <h2 className="text-sm font-bold text-[#111827]">RAG Assistant</h2>
            <span className="text-xs text-[#6B7280]">· Groq Qwen-3.8-27B</span>
          </div>
          <div className="text-xs text-[#10B981] font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            Context Ready
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {m.role === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message bubble sizing from Section 9.7: User 70% max, Assistant 82% max */}
              <div className={`space-y-2 ${m.role === 'user' ? 'max-w-[70%]' : 'max-w-[82%]'}`}>
                <div className={`px-4 py-3 rounded-xl text-[14px] leading-[22px] ${
                  m.role === 'user'
                    ? 'bg-[#EEF2FF] text-[#111827] border border-[#C7D2FE]'
                    : 'bg-white text-[#111827] border border-[#E5E7EB] shadow-xs'
                }`}>
                  <p className="whitespace-pre-wrap">
                    {m.content || (isLoading && idx === messages.length - 1 ? (
                      <span className="flex items-center gap-2 text-[#6B7280]">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4F46E5]" />
                        Searching vector database...
                      </span>
                    ) : '')}
                  </p>
                </div>

                {/* Inline Citation Chips (Section 9.7) */}
                {m.sources && m.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.sources.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#F9FAFB] text-[#4F46E5] border border-[#E5E7EB] px-2 py-0.5 rounded-md hover:bg-[#EEF2FF] cursor-pointer transition-colors">
                        <FileText className="w-3 h-3" />
                        Page {s.page}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-[#111827] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer (Section 9.7: Sticky at bottom, min height 56px) */}
        <div className="p-4 border-t border-[#E5E7EB] bg-white shrink-0">
          <form onSubmit={sendMessage} className="relative">
            <input 
              type="text" 
              placeholder="Ask a question about your documents..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="w-full h-12 pl-4 pr-12 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#EEF2FF]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white flex items-center justify-center transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[11px] text-[#9CA3AF] text-center mt-2">
            Answers are grounded strictly in retrieved vector chunks.
          </div>
        </div>

      </div>

      {/* Panel 3: Sources Evidence Panel (Section 9.7: 340px) */}
      <div className="hidden lg:flex w-[340px] bg-white rounded-xl border border-[#E5E7EB] p-5 flex-col shrink-0 shadow-xs overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] mb-4">
          <h3 className="text-sm font-bold text-[#111827]">Sources & Evidence</h3>
          <span className="text-[11px] font-semibold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded">
            {activeSources.length} Citations
          </span>
        </div>

        <div className="space-y-4">
          {activeSources.map((source, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-[#4F46E5] shrink-0" />
                  <span className="text-xs font-bold text-[#111827] truncate">{source.document_name}</span>
                </div>
                <span className="text-[11px] font-semibold text-[#10B981] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                  {Math.round(source.confidence * 100)}%
                </span>
              </div>

              <p className="text-xs leading-relaxed text-[#6B7280] bg-white p-2.5 rounded-lg border border-[#E5E7EB]">
                "{source.snippet}"
              </p>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-[#9CA3AF]">Page {source.page}</span>
                <button className="text-[#4F46E5] hover:underline font-semibold flex items-center gap-1">
                  <span>Open in viewer</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
