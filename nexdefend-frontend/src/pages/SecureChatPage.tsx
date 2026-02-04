import { useState, useEffect, useRef } from 'react';
import { createClient, MatrixClient } from 'matrix-js-sdk';
import { GlassCard } from '../components/ui/GlassCard';
import { Send, Lock, Shield, Hash, User } from 'lucide-react';

export default function SecureChatPage() {
  const [client, setClient] = useState<MatrixClient | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('disconnected');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real app, use user's credentials or a guest account
    const initMatrix = async () => {
        setStatus('connecting');
        const c = createClient({
            baseUrl: "http://localhost:8008", // Synapse
            // For demo, we might need a way to login.
            // I'll assume we can use a hardcoded guest or prompts.
            // Simplified: Just show UI if no auth
        });

        // Setup listeners...
        setClient(c);
        setStatus('connected (demo)');

        // Mock rooms
        setRooms([
            { id: '!1:nexdefend.local', name: '#ops-critical' },
            { id: '!2:nexdefend.local', name: '#intel-sharing' },
            { id: '!3:nexdefend.local', name: '#incident-2401' },
        ]);
    };
    initMatrix();
  }, []);

  const sendMessage = () => {
      if (!input.trim()) return;
      const newMsg = {
          id: Date.now(),
          sender: 'me',
          body: input,
          ts: new Date()
      };
      setMessages([...messages, newMsg]);

      // Check for bot command
      if (input.startsWith('!scan')) {
          setTimeout(() => {
              setMessages(prev => [...prev, {
                  id: Date.now()+1,
                  sender: '@bot:nexdefend.local',
                  body: 'Scanning target... [ACTIVE DEFENSE ENGAGED]',
                  ts: new Date()
              }]);
          }, 1000);
      }

      setInput('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in duration-500">
        {/* Sidebar */}
        <div className="w-80 flex flex-col gap-4">
             <GlassCard className="p-4 bg-red-500/10 border-red-500/20">
                 <div className="flex items-center gap-3 text-red-400">
                     <Shield size={24} />
                     <div>
                         <h3 className="font-bold text-sm">SECURE CHANNEL</h3>
                         <p className="text-[10px] opacity-70">End-to-End Encrypted (Matrix)</p>
                     </div>
                 </div>
             </GlassCard>

             <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                 {rooms.map(room => (
                     <button
                        key={room.id}
                        onClick={() => setSelectedRoom(room.id)}
                        className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all ${
                            selectedRoom === room.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'hover:bg-white/5 text-gray-400'
                        }`}
                     >
                         <Hash size={16} />
                         <span className="font-mono text-sm">{room.name}</span>
                     </button>
                 ))}
             </div>
        </div>

        {/* Chat Area */}
        <GlassCard className="flex-1 flex flex-col overflow-hidden relative">
            {selectedRoom ? (
                <>
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                        <div className="flex items-center gap-2">
                            <Lock size={16} className="text-green-400" />
                            <span className="font-mono text-gray-300">
                                {rooms.find(r => r.id === selectedRoom)?.name}
                            </span>
                        </div>
                        <span className="text-xs text-green-500 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>
                            ENCRYPTED
                        </span>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${msg.sender === 'me' ? 'bg-cyan-600' : 'bg-gray-700'}`}>
                                    {msg.sender === 'me' ? 'ME' : 'BOT'}
                                </div>
                                <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                                    msg.sender === 'me'
                                    ? 'bg-cyan-500/10 text-cyan-100 border border-cyan-500/20 rounded-tr-none'
                                    : 'bg-white/5 text-gray-300 border border-white/10 rounded-tl-none'
                                }`}>
                                    <p>{msg.body}</p>
                                    <span className="text-[10px] opacity-50 block mt-1 text-right">
                                        {msg.ts.toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/5 bg-black/20 flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message or command (!scan IP)..."
                            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                        />
                        <button
                            onClick={sendMessage}
                            className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                    <Lock size={48} className="mb-4 opacity-20" />
                    <p>Select a secure channel to begin</p>
                </div>
            )}
        </GlassCard>
    </div>
  );
}
