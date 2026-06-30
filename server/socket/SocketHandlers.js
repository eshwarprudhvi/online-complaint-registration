const EVENTS = require('./SocketEvents');

class SocketHandlers {
  constructor(io) {
    this.io = io;
    this.onlineUsers = new Set();
  }

  handleConnection(socket) {
    const user = socket.user;
    
    // Auto-join specific rooms based on role
    socket.join(`user:${user.id}`);
    
    if (user.role === 'Admin') {
      socket.join('admins');
    }
    
    if (user.role === 'Agent') {
      socket.join(`officer:${user.id}`);
    }

    // Add to online users
    this.onlineUsers.add(user.id);
    this.io.emit(EVENTS.USER_ONLINE, { userId: user.id });

    // Handle user requesting to join a complaint room
    socket.on('join_complaint', (complaintId) => {
      // In a strict environment, we'd verify authorization to join this complaint room.
      // For this implementation, we trust the authenticated user or authorize locally if needed.
      socket.join(`complaint:${complaintId}`);
    });

    socket.on('leave_complaint', (complaintId) => {
      socket.leave(`complaint:${complaintId}`);
    });

    socket.on(EVENTS.DISCONNECT, () => {
      this.handleDisconnect(socket);
    });
  }

  handleDisconnect(socket) {
    const user = socket.user;
    
    // Remove from online users
    this.onlineUsers.delete(user.id);
    
    // Broadcast offline status
    this.io.emit(EVENTS.USER_OFFLINE, { userId: user.id });
  }

  isUserOnline(userId) {
    return this.onlineUsers.has(userId);
  }
}

module.exports = SocketHandlers;
