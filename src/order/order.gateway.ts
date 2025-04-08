// order.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class OrderGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(`user_${userId}`);
      console.log(`✅ User ${userId} joined room: user_${userId}`);
    }
  }

  // 🚀 Broadcast order status update to a specific customer room
  sendOrderUpdate(customerId: number, data: any) {
    this.server.to(`user_${customerId}`).emit('orderUpdate', data);
  }
}
