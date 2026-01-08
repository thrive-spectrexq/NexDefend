import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField } from '@mui/material';

const ConsolePage: React.FC = () => {
  const [history, setHistory] = useState<string[]>(['Welcome to NexDefend Console v2.0', 'Type "help" for available commands.']);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmd: string) => {
    let output = '';
    const command = cmd.trim().toLowerCase();

    switch (command) {
      case 'help':
        output = 'Available commands: help, status, clear, agents, scan <ip>';
        break;
      case 'status':
        output = 'System Status: OPTIMAL\nServices: Active\nUptime: 42h 12m';
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'agents':
        output = 'Listing agents...\n- host-101 (Online)\n- host-102 (Offline)\n- host-103 (Online)';
        break;
      default:
        if (command.startsWith('scan ')) {
            output = `Initiating vulnerability scan on ${command.split(' ')[1]}... \nScan ID: ${Math.floor(Math.random()*10000)}`;
        } else {
            output = `Command not found: ${command}`;
        }
    }

    setHistory(prev => [...prev, `> ${cmd}`, output]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>Console</Typography>
      <Paper
        sx={{
          flexGrow: 1,
          bgcolor: '#0f172a',
          color: '#33ff33',
          fontFamily: 'monospace',
          p: 2,
          overflowY: 'auto',
          border: '1px solid #333'
        }}
      >
        {history.map((line, i) => (
          <Typography key={i} component="div" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {line}
          </Typography>
        ))}
        <div ref={endRef} />
      </Paper>
      <Box sx={{ mt: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Enter command..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          sx={{
            input: { color: '#33ff33', fontFamily: 'monospace' },
            bgcolor: '#1e293b'
          }}
        />
      </Box>
    </Box>
  );
};

export default ConsolePage;
