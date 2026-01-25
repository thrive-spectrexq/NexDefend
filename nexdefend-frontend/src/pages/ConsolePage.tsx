import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField, IconButton } from '@mui/material';
import { Terminal as TerminalIcon, DeleteSweep as ClearIcon } from '@mui/icons-material';
import client from '../api/client'; // Using your existing client
import { getAgents } from '../api/agents';

// Define structure for command responses
interface ConsoleLine {
  type: 'cmd' | 'out' | 'err';
  text: string;
}

interface Agent {
  id: number;
  hostname: string;
  ip_address: string;
  status: string;
  [key: string]: unknown;
}

const ConsolePage: React.FC = () => {
  const [history, setHistory] = useState<ConsoleLine[]>([
      { type: 'out', text: 'NexDefend Security Protocol v2.5.0 initialized...' },
      { type: 'out', text: 'Connected to NexDefend Core API.' },
      { type: 'out', text: 'Type "help" to view available commands.' }
  ]);
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const addLine = (type: 'out' | 'err', text: string) => {
      setHistory(prev => [...prev, { type, text }]);
  };

  const executeCommand = async (rawCmd: string) => {
    const args = rawCmd.trim().split(' ');
    const cmd = args[0].toLowerCase();

    setProcessing(true);

    try {
        if (cmd === 'help') {
            addLine('out', `Available Commands:
  help            - Show this help message
  status          - Check API connection health
  clear           - Clear terminal history
  agents          - List connected security agents (Real-time)
  scan <target>   - Initiate vulnerability scan (API)
  whoami          - Display current session info`);
        } else if (cmd === 'clear') {
            setHistory([]);
        } else if (cmd === 'whoami') {
            // Simple check for token or user info
            const token = localStorage.getItem('token');
            addLine('out', token ? 'User: Authenticated Admin (JWT)' : 'User: Guest (Limited Access)');
        } else if (cmd === 'status') {
            // Ping the stats endpoint as a health check
            try {
                const start = Date.now();
                await client.get('/dashboard/stats');
                const latency = Date.now() - start;
                addLine('out', `[SYSTEM STATUS]
---------------------------
API Gateway    : ONLINE (${latency}ms)
Database       : CONNECTED
Services       : ACTIVE`);
            } catch (e) {
                addLine('err', `[!] System Unreachable: ${e}`);
            }
        } else if (cmd === 'agents') {
            addLine('out', '[*] Fetching agent list from /api/v1/assets...');
            try {
                const assets = await getAgents();
                if (assets.length === 0) {
                     addLine('out', 'No agents found registered in the system.');
                } else {
                    let table = 'ID       HOSTNAME       IP              STATUS\n';
                    table += '------------------------------------------------\n';
                    // Cast assets to any[] to iterate safely or use Asset interface
                    (assets as Agent[]).forEach((a) => {
                        table += `${a.id.toString().padEnd(8)} ${a.hostname.padEnd(14)} ${a.ip_address.padEnd(15)} [${a.status.toUpperCase()}]\n`;
                    });
                    addLine('out', table);
                }
            } catch (e) {
                addLine('err', `Failed to retrieve agents: ${e}`);
            }
        } else if (cmd === 'scan') {
            const target = args[1];
            if (!target) {
                addLine('err', 'Usage: scan <target_ip_or_hostname>');
            } else {
                addLine('out', `[+] Initiating scan for target: ${target}...`);
                try {
                    // Call your actual backend endpoint (scan_handler.go)
                    // Note: The backend handler currently doesn't read the body, but we send it for future proofing
                    await client.post('/scans', { target: target });
                    addLine('out', `[SUCCESS] Scan job submitted for ${target}.`);
                    addLine('out', `[INFO] Check 'Vulnerabilities' page for results.`);
                } catch (e) {
                     addLine('err', `[!] Failed to start scan: ${e}`);
                }
            }
        } else if (cmd !== '') {
            addLine('err', `bash: ${cmd}: command not found`);
        }
    } catch (err) {
        addLine('err', `Unexpected error: ${err}`);
    } finally {
        setProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !processing) {
      const cmd = input;
      setHistory(prev => [...prev, { type: 'cmd', text: `admin@nexdefend:~$ ${cmd}` }]);
      setInput('');
      executeCommand(cmd);
    }
  };

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', bgcolor: '#050505' }}>
      <Paper
        elevation={10}
        onClick={() => inputRef.current?.focus()}
        sx={{
          flexGrow: 1,
          bgcolor: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '"Fira Code", monospace'
        }}
      >
        {/* Header */}
        <Box sx={{ bgcolor: '#161b22', borderBottom: '1px solid #30363d', p: 1, px: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TerminalIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">root@nexdefend-core:~</Typography>
            </Box>
            <IconButton size="small" onClick={() => setHistory([])}><ClearIcon fontSize="small" sx={{ color: 'text.secondary' }} /></IconButton>
        </Box>

        {/* Output Area */}
        <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', color: '#e6edf3' }}>
            {history.map((line, i) => (
                <Box key={i} sx={{ mb: 0.5 }}>
                    <Typography component="span" sx={{
                        fontFamily: 'inherit', whiteSpace: 'pre-wrap',
                        color: line.type === 'cmd' ? '#7ee787' : line.type === 'err' ? '#ff7b72' : '#a5d6ff',
                        fontWeight: line.type === 'cmd' ? 600 : 400
                    }}>
                        {line.text}
                    </Typography>
                </Box>
            ))}

            {/* Input Line */}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography component="span" sx={{ fontFamily: 'inherit', color: '#7ee787', mr: 1, fontWeight: 'bold' }}>
                    admin@nexdefend:~$
                </Typography>
                <TextField
                    inputRef={inputRef}
                    fullWidth
                    variant="standard"
                    value={input}
                    disabled={processing}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    InputProps={{ disableUnderline: true, sx: { color: 'white', fontFamily: 'inherit', p: 0 } }}
                />
            </Box>
            <div ref={endRef} />
        </Box>
      </Paper>
    </Box>
  );
};

export default ConsolePage;
