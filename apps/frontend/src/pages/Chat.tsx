import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Loader2, 
  Plus, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function Chat() {
  const { token } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      content: 'Hello! Ask me any question about your uploaded contracts, invoices, and documents.'
    }
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
    setMessages(prev => [...prev, { role: 'ai', content: '' }]);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
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
              break;
            }
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'content') {
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
      
      {/* Panel 1: Conversation List (Compact 200px) */}
      <div className="hidden xl:flex w-[200px] bg-white rounded-xl border border-[#E5E7EB] p-3.5 flex-col justify-between shrink-0 shadow-xs">
        <div className="space-y-3">
          <button 
            onClick={() => {
              setMessages([
                { 
                  role: 'ai', 
                  content: 'Hello! Ask me any question about your uploaded contracts, invoices, and documents.'
                }
              ]);
            }}
            className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <div className="pt-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Conversations
          </div>

          <div className="space-y-1">
            <button className="w-full text-left p-2.5 rounded-lg bg-indigo-50/80 text-indigo-700 font-medium text-xs flex items-center gap-2 border border-indigo-100">
              <MessageSquare className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
              <span className="truncate">Current Session</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-[#9CA3AF] text-center pt-3 border-t border-[#E5E7EB]">
          Conversations are encrypted & private
        </div>
      </div>

      {/* Panel 2: Expanded Fluid Chat Canvas */}
      <div className="flex-1 bg-white rounded-xl border border-[#E5E7EB] shadow-xs flex flex-col min-w-0 overflow-hidden">
        
        {/* Chat Canvas Header */}
        <div className="h-14 px-6 border-b border-[#E5E7EB] flex items-center justify-between shrink-0 bg-[#F9FAFB]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111827] leading-none">RAG Assistant</h2>
              <span className="text-[11px] text-[#6B7280]">Powered by Groq Qwen-3.8-27B & Qdrant</span>
            </div>
          </div>
          <div className="text-xs text-[#10B981] font-semibold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            Vector Context Ready
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {messages.map((m, idx) => (
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
                  <p className="whitespace-pre-wrap">
                    {m.content || (isLoading && idx === messages.length - 1 ? (
                      <span className="flex items-center gap-2 text-[#6B7280]">
                        <Loader2 className="w-4 h-4 animate-spin text-[#4F46E5]" />
                        Searching vector database and generating answer...
                      </span>
                    ) : '')}
                  </p>
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <UserIcon className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
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
