import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    // URL relative if proxied, or exact if cross-origin. Let's rely on standard current origin if proxy handles it, or explicit backend URL.
    // Assuming backend runs on 5000 and client on 5173. Hardcoding localhost:5000 for dev purposes if needed, but best is to use environment variable or fallback.
    this.url = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  }

  connect(token) {
    if (this.socket?.connected) return;

    this.socket = io(this.url, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  emit(event, data) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }
}

export default new SocketService();
