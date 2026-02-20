import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';

interface WebSocketClient {
  userId?: number;
  isAlive?: boolean;
  readyState: number;
  send(data: string): void;
  ping(): void;
  terminate(): void;
  on(event: string, callback: Function): void;
}

interface LeaderboardUpdate {
  type: 'leaderboard_update';
  data: Array<{
    rank: number;
    userId: number;
    userName: string;
    totalPoints: number;
    isTopFive: boolean;
  }>;
}

interface PingMessage {
  type: 'ping';
}

interface PongMessage {
  type: 'pong';
}

type WebSocketMessage = LeaderboardUpdate | PingMessage | PongMessage;

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocketClient>();

export function initializeWebSocket(server: any) {
  try {
    wss = new WebSocketServer({ server, path: '/ws' });
    console.log('[WebSocket] Server initialized on path /ws');

    wss.on('connection', (ws: any, req: IncomingMessage) => {
      console.log('[WebSocket] New client connected');
      const client = ws as WebSocketClient;
      ws.isAlive = true;
      clients.add(ws);

      // Handle incoming messages
      ws.on('message', (data: Buffer | string) => {
        try {
          const message = JSON.parse(data.toString());
          
          if (message.type === 'subscribe') {
            ws.userId = message.userId;
            console.log('[WebSocket] Client subscribed:', message.userId);
          } else if (message.type === 'pong') {
            ws.isAlive = true;
          }
        } catch (error) {
          console.error('[WebSocket] Message parse error:', error);
        }
      });

      ws.on('close', () => {
        console.log('[WebSocket] Client disconnected');
        clients.delete(ws);
      });

      ws.on('error', (error: any) => {
        console.error('[WebSocket] Client error:', error?.message || error);
        clients.delete(ws);
      });
    });

    wss.on('error', (error: any) => {
      console.error('[WebSocket] Server error:', error?.message || error);
    });

    // Heartbeat to detect dead connections (every 45 seconds)
    const heartbeat = setInterval(() => {
      let deadCount = 0;
      clients.forEach((ws: WebSocketClient) => {
        if (!ws.isAlive) {
          ws.terminate();
          clients.delete(ws);
          deadCount++;
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
      if (deadCount > 0 || clients.size > 0) {
        console.log(`[WebSocket] Heartbeat: ${clients.size} active clients, ${deadCount} dead connections removed`);
      }
    }, 45000);

    wss.on('close', () => {
      clearInterval(heartbeat);
    });

    return wss;
  } catch (error) {
    console.error('[WebSocket] Failed to initialize:', error);
    return null;
  }
}

export function broadcastLeaderboardUpdate(leaderboardData: LeaderboardUpdate['data']) {
  if (!wss) {
    console.warn('[WebSocket] Server not initialized, cannot broadcast');
    return;
  }

  const message: LeaderboardUpdate = {
    type: 'leaderboard_update',
    data: leaderboardData,
  };

  const payload = JSON.stringify(message);
  let sentCount = 0;
  let failedCount = 0;

  clients.forEach((client: WebSocketClient) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
        sentCount++;
      } catch (error) {
        console.error('[WebSocket] Failed to send message:', error);
        failedCount++;
      }
    }
  });

  if (sentCount > 0 || failedCount > 0) {
    console.log(`[WebSocket] Broadcast: ${sentCount} sent, ${failedCount} failed out of ${clients.size} total`);
  }
}

export function getConnectedClientsCount(): number {
  return clients.size;
}
