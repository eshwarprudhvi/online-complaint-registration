const { Server } = require('socket.io');
const socketMiddleware = require('./socketMiddleware');
const SocketHandlers = require('./SocketHandlers');
const EVENTS = require('./SocketEvents');

let io = null;
let handlers = null;

class SocketServer {
  static init(server) {
    io = new Server(server, {
      cors: {
        origin: '*', // In production, restrict to frontend URL
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
      }
    });

    handlers = new SocketHandlers(io);

    // Apply Authentication Middleware
    io.use(socketMiddleware);

    // Handle Connection
    io.on(EVENTS.CONNECT, (socket) => {
      console.log(`Socket connected: ${socket.id} (User: ${socket.user.id})`);
      handlers.handleConnection(socket);
    });

    return io;
  }

  static getIO() {
    if (!io) {
      throw new Error('Socket.IO has not been initialized');
    }
    return io;
  }
}

module.exports = SocketServer;
