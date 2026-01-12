import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField, IconButton, Tooltip } from '@mui/material';
import {
    Terminal as TerminalIcon,
    DeleteSweep as ClearIcon
} from '@mui/icons-material';

const ConsolePage: React.FC = () => {
  const [history, setHistory] = useState<{type: 'cmd' | 'out' | 'err', text: string}[]>([
      { type: 'out', text: 'NexDefend Security Protocol v2.4.1 initialized...' },
      { type: 'out', text: 'Connection established to Mainframe [192.168.1.50]' },
      { type: 'out', text: 'Type "help" to view available commands.' }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Keep focus on input
  const focusInput = () => {
      inputRef.current?.focus();
  };

  const handleCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    const newHistory = [...history, { type: 'cmd' as const, text: `admin@nexdefend:~$ ${cmd}` }];

    let response = '';
    let type: 'out' | 'err' = 'out';

    switch (command.split(' ')[0]) {
      case 'help':
        response = `Available Commands:
  help          - Show this help message
  status        - Check system health status
  clear         - Clear terminal history
  agents        - List connected security agents
  scan <target> - Initiate vulnerability scan on target IP
  whoami        - Display current user
  connect <ip>  - Establish secure tunnel`;
        break;
      case 'status':
        response = `[SYSTEM STATUS]
---------------------------
Core Service   : ONLINE [PID: 4022]
Threat Engine  : ONLINE [PID: 4023]
Database       : CONNECTED
Memory Usage   : 14% (12GB Free)
Active Threats : 0 Detected`;
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'agents':
        response = `ID        HOSTNAME      IP              STATUS
------------------------------------------------
AG-001    WinSrv-Prod   10.0.0.15       [ONLINE]
AG-002    Lin-Gateway   10.0.0.1        [ONLINE]
AG-003    DB-Cluster    10.0.0.25       [OFFLINE]`;
        break;
      case 'whoami':
        response = 'root (Privileges: ALL)';
        break;
      case 'scan':
        const target = command.split(' ')[1];
        if (target) {
             response = `[+] Target acquired: ${target}
[+] Initializing port scanner...
[+] Checking CVE database...
[!] Scan ID #9921 started. check 'alerts' for results.`;
        } else {
            response = 'Usage: scan <target_ip>';
            type = 'err';
        }
        break;
      case '':
        break;
      default:
        response = `bash: ${command}: command not found`;
        type = 'err';
    }

    if (response) {
        newHistory.push({ type, text: response });
    }

    setHistory(newHistory);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  return (
    <Box
        sx={{
            p: 3,
            height: 'calc(100vh - 80px)',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#050505',
        }}
    >
      <Paper
        elevation={10}
        onClick={focusInput}
        sx={{
          flexGrow: 1,
          bgcolor: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 0 50px rgba(0, 209, 255, 0.05)',
          '&:before': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
              backgroundSize: '100% 2px, 3px 100%',
              pointerEvents: 'none',
              zIndex: 10
          }
        }}
      >
        {/* Terminal Header */}
        <Box sx={{
            bgcolor: '#161b22',
            borderBottom: '1px solid #30363d',
            p: 1,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TerminalIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                    root@nexdefend-core:~
                </Typography>
            </Box>
            <Box>
                <Tooltip title="Clear Console">
                    <IconButton size="small" onClick={() => setHistory([])}>
                        <ClearIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>

        {/* Terminal Content */}
        <Box
            sx={{
                flexGrow: 1,
                p: 2,
                overflowY: 'auto',
                fontFamily: '"Fira Code", "Roboto Mono", monospace',
                fontSize: '0.9rem',
                color: '#e6edf3',
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#30363d', borderRadius: '4px' }
            }}
        >
            {history.map((line, i) => (
                <Box key={i} sx={{ mb: 0.5, opacity: 0.9 }}>
                    <Typography
                        component="span"
                        sx={{
                            fontFamily: 'inherit',
                            whiteSpace: 'pre-wrap',
                            color: line.type === 'cmd' ? '#7ee787' : line.type === 'err' ? '#ff7b72' : '#a5d6ff',
                            fontWeight: line.type === 'cmd' ? 600 : 400
                        }}
                    >
                        {line.text}
                    </Typography>
                </Box>
            ))}

            {/* Input Line */}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography
                    component="span"
                    sx={{
                        fontFamily: 'inherit',
                        color: '#7ee787',
                        mr: 1,
                        fontWeight: 'bold',
                        userSelect: 'none'
                    }}
                >
                    admin@nexdefend:~$
                </Typography>
                <TextField
                    inputRef={inputRef}
                    fullWidth
                    variant="standard"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    InputProps={{
                        disableUnderline: true,
                        sx: {
                            color: 'white',
                            fontFamily: '"Fira Code", "Roboto Mono", monospace',
                            fontSize: '0.9rem',
                            p: 0
                        }
                    }}
                />
            </Box>
            <div ref={endRef} />
        </Box>
      </Paper>
    </Box>
  );
};

export default ConsolePage;
