import { useEffect, useRef, useState, useCallback } from 'react';

type WebSocketMessage = {
  type: string;
  data: any;
};

type WebSocketStatus = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';

export const useWebSocket = (path: string = '/ws') => {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('CLOSED');
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | undefined>(undefined);

  const connect = useCallback(() => {
    // Determine protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const url = `${protocol}//${host}${path}`;

    const ws = new WebSocket(url);
    socketRef.current = ws;

    setStatus('CONNECTING');

    ws.onopen = () => {
      setStatus('OPEN');
      console.log('WebSocket connected');
    };

    ws.onclose = () => {
      setStatus('CLOSED');
      console.log('WebSocket disconnected');
      // Attempt reconnect after 3 seconds
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
      } catch (e) {
        console.warn('Failed to parse WebSocket message:', event.data);
      }
    };
  }, [path]);

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { lastMessage, status };
};
