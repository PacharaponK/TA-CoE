import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

/**
 * Broadcasts queue changes so viewers (students) and the TA dashboard
 * stay in sync in real-time. Clients listen for the `queue:changed`
 * event and refetch the view they are currently looking at.
 */
@WebSocketGateway({
  cors: {
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },
})
export class RealtimeGateway {
  @WebSocketServer()
  server: Server;

  /** Notify all connected clients that the queue (or its config) changed. */
  emitChange(payload?: Record<string, unknown>) {
    this.server?.emit('queue:changed', payload ?? { at: Date.now() });
  }
}
