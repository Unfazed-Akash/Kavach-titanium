'use client';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id);
    });
  }
  return socket;
}

export default getSocket;
