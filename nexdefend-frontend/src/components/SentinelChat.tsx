import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, MessageSquare, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { apiClient } from '../api/apiClient';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function SentinelChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am Sentinel, your AI security assistant. How can I help you analyze the system today?',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        // Use the configured apiClient which handles baseURL and auth
        // Assuming /api/v1/ai/chat is the endpoint we created in Go
        const res = await apiClient.post('/ai/chat', { query: userMessage.text });

        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: res.data.response,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
        console.error("Chat error", error);
        const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: "I'm having trouble connecting to the neural core. Please check my connection settings.",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-brand-primary rounded-full shadow-lg hover:bg-brand-primary-hover transition-all z-50 animate-in fade-in zoom-in duration-300"
      >
        <Bot size={28} className="text-white" />
      </button>
    );
  }

  return (
    <div className={cn(
        "fixed right-6 bg-surface border border-surface-highlight shadow-2xl rounded-lg overflow-hidden flex flex-col z-50 transition-all duration-300",
        isMinimized ? "bottom-6 h-14 w-72" : "bottom-6 h-[600px] w-[400px]"
    )}>
      {/* Header */}
      <div className="bg-surface-darker p-3 flex items-center justify-between border-b border-surface-highlight">
        <div className="flex items-center gap-2">
            <Bot size={20} className="text-brand-primary" />
            <span className="font-bold text-text">Sentinel Copilot</span>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setIsMinimized(!isMinimized)} className="text-text-muted hover:text-text">
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text">
                <X size={16} />
            </button>
        </div>
      </div>

      {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface/50">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex w-full",
                            msg.sender === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={cn(
                            "max-w-[80%] rounded-lg p-3 text-sm",
                            msg.sender === 'user'
                                ? "bg-brand-primary text-white rounded-br-none"
                                : "bg-surface-highlight text-text-secondary rounded-bl-none border border-white/5"
                        )}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="bg-surface-highlight rounded-lg p-3 rounded-bl-none border border-white/5 flex gap-1">
                            <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce delay-75" />
                            <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce delay-150" />
                        </div>
                     </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-surface-highlight bg-surface-darker">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask Sentinel..."
                        className="flex-1 bg-surface border border-surface-highlight rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-brand-primary"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="p-2 bg-brand-primary rounded-md text-white hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
          </>
      )}
    </div>
  );
}
