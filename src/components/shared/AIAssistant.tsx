'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Building2,
  Briefcase,
  TrendingUp,
  BookOpen,
  Users,
  Loader2,
  ChevronRight,
  ArrowUpRight,
  Minus,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════ */

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  { label: 'Summarize active mandates', icon: Briefcase },
  { label: 'Which companies need follow-up?', icon: Users },
  { label: 'Draft a company deep dive', icon: BookOpen },
  { label: 'Comparable deal analysis', icon: TrendingUp },
];

/* ══════════════════════════════════════════════════════════════════
   SAFE MARKDOWN RENDERING
   ══════════════════════════════════════════════════════════════════ */

function renderMessageContent(content: string, role: string) {
  return content.split('\n').map((line, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} style={{ color: role === 'user' ? '#04080f' : '#f0f4f8' }}>{part.slice(2, -2)}</strong>;
        }
        return <span key={j}>{part}</span>;
      })}
    </span>
  ));
}

/* ══════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════ */

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const assistantMsgId = (Date.now() + 1).toString();
      let fullText = '';

      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);
      setIsTyping(false);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullText += parsed.text;
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === assistantMsgId ? { ...m, content: fullText } : m
                    )
                  );
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        }
      }
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an issue connecting to the AI service. Please try again in a moment.',
        timestamp: new Date(),
      }]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 group"
        style={{
          background: 'linear-gradient(135deg, #5fd4e3, #9499d1)',
          boxShadow: '0 4px 24px rgba(95,212,227,0.25), 0 0 0 1px rgba(95,212,227,0.1)',
        }}
      >
        <Sparkles className="w-6 h-6" style={{ color: '#04080f' }} />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-full transition-all duration-300 hover:scale-[1.02]"
        style={{
          background: '#0a1628',
          border: '1px solid rgba(95,212,227,0.15)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        <Sparkles className="w-4 h-4" style={{ color: '#5fd4e3' }} />
        <span className="text-[13px] font-medium" style={{ color: '#e2e8f0' }}>Ambrosia AI</span>
        {messages.length > 0 && (
          <span className="w-2 h-2 rounded-full bg-teal-400" />
        )}
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden"
      style={{
        width: '420px',
        height: '620px',
        background: '#04080f',
        border: '1px solid rgba(95,212,227,0.1)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(95,212,227,0.05)',
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4" style={{
        background: 'linear-gradient(135deg, rgba(95,212,227,0.06), rgba(148,153,209,0.04))',
        borderBottom: '1px solid rgba(95,212,227,0.08)',
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5fd4e3, #9499d1)' }}>
              <Sparkles className="w-4 h-4" style={{ color: '#04080f' }} />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold" style={{ color: '#f0f4f8' }}>Ambrosia AI</h3>
              <p className="text-[10px]" style={{ color: '#475569' }}>Advisory intelligence assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-md transition-colors"
              style={{ color: '#475569' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(100,116,139,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}>
              <Minus className="w-4 h-4" />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-md transition-colors"
              style={{ color: '#475569' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(100,116,139,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'thin' }}>
        {messages.length === 0 ? (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="flex justify-center mb-6 mt-4">
              <svg width="40" height="50" viewBox="0 0 64 80" className="opacity-20">
                <defs>
                  <linearGradient id="ai-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5fd4e3" />
                    <stop offset="100%" stopColor="#9499d1" />
                  </linearGradient>
                </defs>
                <path d="M20 4 C20 4, 36 16, 20 28 C4 40, 36 52, 20 64" fill="none" stroke="url(#ai-grad)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M44 4 C44 4, 28 16, 44 28 C60 40, 28 52, 44 64" fill="none" stroke="url(#ai-grad)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            <p className="text-center text-[14px] font-medium mb-1" style={{ color: '#e2e8f0' }}>
              How can I help?
            </p>
            <p className="text-center text-[12px] mb-8" style={{ color: '#475569' }}>
              I have context on your mandates, companies, contacts, and market intelligence.
            </p>

            <div className="space-y-2">
              {SUGGESTIONS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200"
                    style={{
                      background: '#07101e',
                      border: '1px solid rgba(100,116,139,0.08)',
                      animation: `slideUp 0.4s ease-out ${i * 60}ms both`,
                    }}
                    onClick={() => sendMessage(s.label)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(95,212,227,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(100,116,139,0.08)'; }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#5fd4e3' }} />
                    <span className="text-[13px]" style={{ color: '#94a3b8' }}>{s.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0" style={{ color: '#334155' }} />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ animation: 'slideUp 0.3s ease-out' }}>
                <div className="max-w-[85%]">
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5fd4e3, #9499d1)' }}>
                        <Sparkles className="w-3 h-3" style={{ color: '#04080f' }} />
                      </div>
                      <span className="text-[10px] font-medium" style={{ color: '#475569' }}>Ambrosia AI</span>
                    </div>
                  )}
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{
                      background: msg.role === 'user' ? 'linear-gradient(135deg, #5fd4e3, #9499d1)' : '#0a1628',
                      border: msg.role === 'assistant' ? '1px solid rgba(100,116,139,0.08)' : 'none',
                    }}
                  >
                    <div
                      className="text-[13px] leading-relaxed whitespace-pre-wrap"
                      style={{ color: msg.role === 'user' ? '#04080f' : '#cbd5e1' }}
                    >
                      {renderMessageContent(msg.content, msg.role)}
                    </div>
                  </div>
                  <p className="mt-1.5 text-[9px]" style={{ color: '#334155', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5fd4e3, #9499d1)' }}>
                  <Sparkles className="w-3 h-3" style={{ color: '#04080f' }} />
                </div>
                <div className="flex items-center gap-1.5 px-4 py-3 rounded-xl" style={{ background: '#0a1628', border: '1px solid rgba(100,116,139,0.08)' }}>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: '1px solid rgba(100,116,139,0.08)' }}>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about mandates, companies, or market intelligence..."
            className="flex-1 bg-transparent border-none outline-none text-[13px]"
            style={{ color: '#e2e8f0' }}
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0"
            style={{
              background: input.trim() ? 'linear-gradient(135deg, #5fd4e3, #9499d1)' : 'transparent',
              opacity: input.trim() ? 1 : 0.3,
            }}
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#5fd4e3' }} />
            ) : (
              <Send className="w-4 h-4" style={{ color: input.trim() ? '#04080f' : '#475569' }} />
            )}
          </button>
        </form>
        <p className="text-center mt-2" style={{ fontSize: '9px', color: '#1e293b' }}>
          Powered by Claude · Ambrosia Ventures
        </p>
      </div>
    </div>
  );
}
