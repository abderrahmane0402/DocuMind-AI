import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Loader2, 
  Plus, 
  MessageSquare,
  Sparkles,
  Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_BASE_URL } from '../config';

interface Message {
  id?: string;
  role: 'user' | 'ai' | 'assistant';
  content: string;
}

interface ChatSessionItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export default function Chat() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      content: 'Hello! Ask me any question about your uploaded contracts, invoices, and documents.'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Fetch sessions list on mount
  const fetchSessions = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/chat/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data: ChatSessionItem[] = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [token]);

  // 2. Load messages when selecting a session
  const selectSession = async (sessionId: string) => {
    if (activeSessionId === sessionId) return;
    setActiveSessionId(sessionId);
    setIsHistoryLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setMessages(data.map((m: any) => ({
            id: m.id,
            role: m.role === 'assistant' ? 'ai' : m.role,
            content: m.content
          })));
        } else {
          setMessages([
            { 
              role: 'ai', 
              content: 'Hello! Ask me any question about your uploaded contracts, invoices, and documents.'
            }
          ]);
        }
      }
    } catch (err) {
      console.error('Failed to load session messages:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // 3. New Chat action
  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([
      { 
        role: 'ai', 
        content: 'Hello! Ask me any question about your uploaded contracts, invoices, and documents.'
      }
    ]);
    setInput('');
  };

  // 4. Delete session
  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (activeSessionId === sessionId) {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  // 5. Send message & stream answer
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');

    const updatedHistory = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(updatedHistory);
    setIsLoading(true);

    // AI placeholder
    setMessages(prev => [...prev, { role: 'ai', content: '' }]);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          session_id: activeSessionId,
          messages: updatedHistory
            .filter(m => m.content)
            .map(m => ({ 
              role: m.role === 'ai' ? 'assistant' : m.role, 
              content: m.content 
            }))
        })
      });

      if (!response.ok) throw new Error('Query failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';

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
              fetchSessions(); // refresh session list with updated titles/timestamps
              break;
            }
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'session') {
                if (!activeSessionId && data.session_id) {
                  setActiveSessionId(data.session_id);
                }
              } else if (data.type === 'content') {
                aiContent += data.content;
                setMessages(prev => {
                  const next = [...prev];
                  next[next.length - 1] = {
                    role: 'ai',
                    content: aiContent
                  };
                  return next;
                });
              }
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
    <div className="h-[calc(100vh-80px)] flex gap-5 overflow-hidden">
      
      {/* Panel 1: Conversation List */}
      <div className="hidden xl:flex w-[230px] bg-white rounded-xl border border-[#E5E7EB] p-3.5 flex-col justify-between shrink-0 shadow-xs">
        <div className="space-y-3 flex-1 flex flex-col min-h-0">
          <button 
            onClick={handleNewChat}
            className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <div className="pt-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Conversations ({sessions.length})
          </div>

          <div className="space-y-1 overflow-y-auto flex-1 pr-1">
            {/* Active Unsaved / Fresh Session Item */}
            {!activeSessionId && (
              <div className="w-full text-left p-2.5 rounded-lg bg-indigo-50/80 text-indigo-700 font-medium text-xs flex items-center gap-2 border border-indigo-100">
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
                <span className="truncate">New Conversation</span>
              </div>
            )}

            {/* Saved Sessions */}
            {sessions.map(s => {
              const isSelected = activeSessionId === s.id;
              return (
                <div 
                  key={s.id}
                  onClick={() => selectSession(s.id)}
                  className={`group w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between gap-2 border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50/80 text-indigo-700 font-medium border-indigo-100' 
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden min-w-0">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className="truncate">{s.title}</span>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteSession(e, s.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 text-slate-400 transition-opacity"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {sessions.length === 0 && activeSessionId && (
              <div className="py-4 text-center text-xs text-slate-400">
                No past conversations
              </div>
            )}
          </div>
        </div>

        <div className="text-[11px] text-[#9CA3AF] text-center pt-3 border-t border-[#E5E7EB] shrink-0">
          Conversations saved automatically
        </div>
      </div>

      {/* Panel 2: Expanded Fluid Chat Canvas */}
      <div className="flex-1 bg-white rounded-xl border border-[#E5E7EB] shadow-xs flex flex-col min-w-0 overflow-hidden">
        
        {/* Chat Canvas Header */}
        <div className="h-14 px-6 border-b border-[#E5E7EB] flex items-center justify-between shrink-0 bg-[#F9FAFB]/50">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h2 className="text-sm font-bold text-[#111827] leading-none">RAG Assistant</h2>
              <span className="text-[10px] sm:text-[11px] text-[#6B7280] truncate block">Powered by Groq Qwen-3.8-27B & Qdrant</span>
            </div>
          </div>
          <div className="hidden sm:flex text-xs text-[#10B981] font-semibold items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            Vector Ready
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          {isHistoryLoading ? (
            <div className="h-full flex items-center justify-center text-slate-400 gap-2 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              Loading conversation history...
            </div>
          ) : (
            messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {m.role === 'ai' && (
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-xs border border-indigo-100">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              {/* Message bubble sizing: large & spacious */}
              <div className={`space-y-2 ${m.role === 'user' ? 'max-w-[82%]' : 'max-w-[92%]'}`}>
                <div className={`px-5 py-4 rounded-2xl text-[15px] leading-[25px] ${
                  m.role === 'user'
                    ? 'bg-[#EEF2FF] text-[#111827] border border-[#C7D2FE]'
                    : 'bg-white text-[#111827] border border-[#E5E7EB] shadow-xs'
                }`}>
                  {m.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <div>
                      {m.content ? (
                        <div className="prose prose-slate max-w-none space-y-3 text-[#111827]">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2 text-[#0F172A]" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-3 mb-2 text-[#0F172A] border-b border-slate-100 pb-1" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-base font-semibold mt-2 mb-1 text-[#1E293B]" {...props} />,
                              p: ({node, ...props}) => <p className="mb-2.5 leading-relaxed" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 my-2 pl-2 text-slate-800" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 my-2 pl-2 text-slate-800" {...props} />,
                              li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                              code: ({node, inline, className, children, ...props}: any) => {
                                return inline ? (
                                  <code className="bg-slate-100 text-indigo-700 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-xs overflow-x-auto my-3 border border-slate-800 shadow-inner">
                                    <code {...props}>{children}</code>
                                  </pre>
                                );
                              },
                              table: ({node, ...props}) => (
                                <div className="overflow-x-auto my-3 border border-slate-200 rounded-xl shadow-xs">
                                  <table className="w-full text-left border-collapse text-xs sm:text-sm" {...props} />
                                </div>
                              ),
                              thead: ({node, ...props}) => <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold" {...props} />,
                              tbody: ({node, ...props}) => <tbody className="divide-y divide-slate-100" {...props} />,
                              tr: ({node, ...props}) => <tr className="hover:bg-slate-50/60 transition-colors" {...props} />,
                              th: ({node, ...props}) => <th className="p-3 font-semibold text-slate-900" {...props} />,
                              td: ({node, ...props}) => <td className="p-3 text-slate-700" {...props} />,
                              blockquote: ({node, ...props}) => (
                                <blockquote className="border-l-4 border-indigo-500 pl-3.5 py-1 italic text-slate-600 bg-indigo-50/40 rounded-r-lg my-2" {...props} />
                              )
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        isLoading && idx === messages.length - 1 && (
                          <span className="flex items-center gap-2 text-[#6B7280]">
                            <Loader2 className="w-4 h-4 animate-spin text-[#4F46E5]" />
                            Searching vector database and generating structured answer...
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <UserIcon className="w-5 h-5" />
                </div>
              )}
            </div>
          )))}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer (Sticky at bottom, taller input) */}
        <div className="p-4 border-t border-[#E5E7EB] bg-white shrink-0">
          <form onSubmit={sendMessage} className="relative">
            <input 
              type="text" 
              placeholder="Ask a question about your uploaded documents..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="w-full h-13 pl-5 pr-14 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#EEF2FF]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white flex items-center justify-center transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[11px] text-[#9CA3AF] text-center mt-2">
            Answers are grounded strictly in your uploaded documents.
          </div>
        </div>

      </div>

    </div>
  );
}
