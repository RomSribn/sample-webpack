import { io as socketio, Socket } from 'socket.io-client';

export function createSocket(endpoint: string): Socket {
  return socketio(endpoint);
}

export function disposeSocket(socket: Socket): void {
  socket.disconnect();
  socket.close();
}
