import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '../api/ai';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  TextField,
  Fab,
  CircularProgress
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon
} from '@mui/icons-material';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const SentinelChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hello, I am NexDefend AI. How can I assist with your security analysis today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await aiApi.chat(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: res.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting to the AI core right now." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      {/* Chat Window */}
      {isOpen && (
        <Paper
          elevation={6}
          sx={{
            mb: 2,
            width: 320,
            height: 400,
            bgcolor: '#09090b', // Dark background matching theme
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#00D1FF' }}>
              <BotIcon fontSize="small" />
              <Typography variant="subtitle2" fontWeight="bold">NexDefend AI</Typography>
            </Box>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {messages.map((msg, idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <Box sx={{
                  maxWidth: '85%',
                  p: 1.5,
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  bgcolor: msg.role === 'user' ? 'rgba(0, 209, 255, 0.15)' : 'rgba(255,255,255,0.05)',
                  color: msg.role === 'user' ? '#fff' : 'text.secondary',
                  border: msg.role === 'user' ? '1px solid rgba(0, 209, 255, 0.3)' : '1px solid rgba(255,255,255,0.05)'
                }}>
                  {msg.text}
                </Box>
              </Box>
            ))}
            {loading && (
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
                 <CircularProgress size={10} color="inherit" />
                 NexDefend AI is thinking...
               </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 1, bgcolor: 'rgba(255,255,255,0.02)' }}>
            <TextField
              variant="standard"
              placeholder="Ask NexDefend AI..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              fullWidth
              InputProps={{
                disableUnderline: true,
                sx: { fontSize: '0.875rem', px: 1 }
              }}
              sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, px: 1, py: 0.5 }}
            />
            <IconButton onClick={handleSend} disabled={loading} sx={{ color: '#00D1FF', '&:disabled': { color: 'rgba(255,255,255,0.3)' } }}>
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* Toggle Button */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          bgcolor: '#00D1FF',
          '&:hover': { bgcolor: '#00b8e6' }
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>
    </Box>
  );
};

export default SentinelChat;
