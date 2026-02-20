import { useEffect, useState, useCallback, useRef } from 'react';
import { trpc } from '@/lib/trpc';

interface LeaderboardEntry {
  rank: number;
  userId: number;
  userName: string;
  totalPoints: number;
  isTopFive: boolean;
}

export function useRealtimeLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [usePolling, setUsePolling] = useState(false);
  const { data: initialData, isLoading } = trpc.leaderboard.getCurrent.useQuery();
  
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;
  const BASE_RECONNECT_DELAY = 1000;
  const POLLING_INTERVAL = 5000; // 5 seconds

  useEffect(() => {
    // Set initial data from query
    if (initialData) {
      setLeaderboard(initialData);
    }
  }, [initialData]);

  // Polling fallback when WebSocket is unavailable
  useEffect(() => {
    if (!usePolling) return;

    console.log('[Leaderboard] Using polling fallback');
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/trpc/leaderboard.getCurrent');
        if (response.ok) {
          const data = await response.json();
          if (data.result?.data) {
            setLeaderboard(data.result.data);
          }
        }
      } catch (error) {
        console.error('[Leaderboard] Polling error:', error);
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(pollInterval);
  }, [usePolling]);

  useEffect(() => {
    // Determine WebSocket URL based on current location with explicit /ws path
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isCleanupCalled = false;

    const connect = () => {
      if (isCleanupCalled) return;
      
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        console.warn('[WebSocket Client] Max reconnection attempts reached, falling back to polling');
        setUsePolling(true);
        setIsConnected(false);
        return;
      }

      try {
        console.log(`[WebSocket Client] Connecting (attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
        ws = new WebSocket(wsUrl);
        
        // Set a timeout for connection
        const connectionTimeout = setTimeout(() => {
          if (ws && ws.readyState === WebSocket.CONNECTING) {
            console.warn('[WebSocket Client] Connection timeout');
            ws.close();
          }
        }, 5000);

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('[WebSocket Client] Connected successfully');
          setIsConnected(true);
          setUsePolling(false);
          reconnectAttemptsRef.current = 0;
          
          // Subscribe to leaderboard updates
          ws?.send(JSON.stringify({
            type: 'subscribe',
            userId: 'leaderboard-viewer',
          }));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'leaderboard_update') {
              setLeaderboard(message.data);
            }
          } catch (error) {
            console.error('[WebSocket Client] Failed to parse message:', error);
          }
        };

        ws.onclose = () => {
          if (isCleanupCalled) return;
          
          console.log('[WebSocket Client] Disconnected');
          setIsConnected(false);
          
          // Exponential backoff with jitter
          reconnectAttemptsRef.current++;
          const delay = Math.min(
            BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current - 1),
            10000
          ) + Math.random() * 1000;
          
          console.log(`[WebSocket Client] Reconnecting in ${Math.round(delay)}ms...`);
          reconnectTimeout = setTimeout(connect, delay);
        };

        ws.onerror = (error: any) => {
          // Suppress error logging - errors are expected when WebSocket connection fails
          // The connection will attempt to reconnect automatically
          setIsConnected(false);
        };
      } catch (error: any) {
        console.error('[WebSocket Client] Failed to create connection:', error?.message || error);
        setIsConnected(false);
        
        // Exponential backoff
        reconnectAttemptsRef.current++;
        const delay = Math.min(
          BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current - 1),
          10000
        ) + Math.random() * 1000;
        
        reconnectTimeout = setTimeout(connect, delay);
      }
    };

    connect();

    // Stop reconnecting when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        console.log('[WebSocket Client] Tab hidden, connection paused');
      } else {
        // Resume when tab becomes visible
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          reconnectAttemptsRef.current = 0;
          console.log('[WebSocket Client] Tab visible, reconnecting...');
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isCleanupCalled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return {
    leaderboard,
    isLoading,
    isConnected,
    usePolling,
  };
}
