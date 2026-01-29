import { useState } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface SentinelChatProps {
  onClose?: () => void;
}

export const SentinelChat = ({ onClose }: SentinelChatProps) => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'NexDefend AI initialized. Monitoring 42 active endpoints. No critical anomalies detected.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);

    // Fake AI Response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: `Processing query: "${input}"... Analysis complete. No indicators of compromise found in the sector.` }]);
    }, 1500);
    setInput('');
  };

  return (
    <GlassCard
      title="NexDefend Copilot"
      icon={<Sparkles className="h-5 w-5" />}
      className="h-[500px] flex flex-col"
      action={
        onClose && (
            <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                aria-label="Close Chat"
            >
                <X size={18} />
            </button>
        )
      }
    >
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg font-mono text-sm ${
              msg.role === 'user'
                ? 'bg-primary/20 text-white border border-primary/30'
                : 'bg-surface/50 text-cyan-100 border border-white/5'
            }`}>
              {msg.role === 'ai' && <div className="text-xs text-accent mb-1 font-bold flex items-center gap-1"><Bot size={12}/> NEXDEFEND AI</div>}
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask NexDefend AI to scan..."
          className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_10px_rgba(6,182,212,0.2)]"
        />
        <button
          onClick={handleSend}
          className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 hover:text-white transition-colors cursor-pointer"
        >
          <Send size={18} />
        </button>
      </div>
    </GlassCard>
  );
};
