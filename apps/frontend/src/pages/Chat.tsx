import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Send, Bot, User as UserIcon, Loader2, FileText } from 'lucide-react';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    
    // Add user message to history
    const updatedHistory = [...messages, { role: 'user', content: userMsg }];
    setMessages(updatedHistory as Message[]);
    setIsLoading(true);

    // Prepare a placeholder for the AI response
    setMessages(prev => [...prev, { role: 'ai', content: '' }]);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Send the entire conversation history (excluding the first greeting and the empty placeholder)
        body: JSON.stringify({ 
          messages: updatedHistory.filter(m => m.content).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

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
              } else if (data.type === 'content') {
                aiContent += data.content;
              } else if (data.type === 'error') {
                aiContent += `\n[Error: ${data.content}]`;
              }
              
              // Update the last message in real-time
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: 'ai',
                  content: aiContent,
                  sources: aiSources
                };
                return newMessages;
              });
            } catch (e) {
              console.error("Error parsing stream chunk:", e, dataStr);
            }
          }
        }
      }
    } catch (err: any) {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: 'ai', content: `Error: ${err.message}` };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto py-6 px-4 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">RAG Assistant</h1>
          <p className="text-sm text-slate-500">Context-aware Q&A</p>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6 flex flex-col gap-6">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {m.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              )}
              
              <div className={`flex flex-col gap-2 max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3.5 rounded-2xl text-[15px] ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm' 
                    : 'bg-slate-50 text-slate-800 rounded-tl-sm border border-slate-100 shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {m.content || (isLoading && idx === messages.length - 1 ? (
                      <span className="flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin"/> Processing...</span>
                    ) : '')}
                  </p>
                </div>
                
                {m.sources && m.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm w-full">
                    <div className="text-xs font-semibold text-slate-500 w-full mb-1">SOURCES</div>
                    {m.sources.map((s, i) => (
                      <div key={i} className="text-xs px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100 flex items-center gap-1.5 hover:bg-blue-100 cursor-pointer transition-colors">
                        <FileText className="w-3 h-3"/>
                        <span className="font-medium">Document {s.document_id.substring(0, 4)}...</span>
                        <span className="opacity-75">- Page {s.page}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-1">
                  <UserIcon className="w-4 h-4 text-slate-600" />
                </div>
              )}
              
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="relative shadow-sm rounded-xl">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="w-full pl-6 pr-14 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder:text-slate-400"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
