const SocketServer = require('./SocketServer');
const EVENTS = require('./SocketEvents');

class SocketService {
  
  /**
   * Broadcasts a new message to the receiver and the complaint room
   */
  static emitMessage(messageObj) {
    const io = SocketServer.getIO();
    // Emit to specific receiver for immediate global UI updates (like unread counts)
    io.to(`user:${messageObj.receiverId}`).emit(EVENTS.MESSAGE_RECEIVED, messageObj);
    // Emit to complaint room for active chat windows
    io.to(`complaint:${messageObj.complaintId}`).emit(EVENTS.MESSAGE_RECEIVED, messageObj);
  }

  /**
   * Emits a newly generated notification to the targeted user
   */
  static emitNotification(notification) {
    const io = SocketServer.getIO();
    io.to(`user:${notification.userId}`).emit(EVENTS.NEW_NOTIFICATION, notification);
  }

  /**
   * Triggers a live UI update when a complaint's status changes
   */
  static emitComplaintUpdate(complaint, assignment) {
    const io = SocketServer.getIO();
    const payload = { complaint, assignment };
    
    // Notify the citizen
    io.to(`user:${complaint.userId}`).emit(EVENTS.COMPLAINT_UPDATED, payload);
    
    // Notify the officer if assigned
    if (assignment && assignment.agentId) {
      io.to(`officer:${assignment.agentId}`).emit(EVENTS.COMPLAINT_UPDATED, payload);
    }
    
    // Notify admins to update their dashboards
    io.to('admins').emit(EVENTS.DASHBOARD_REFRESH, { source: 'COMPLAINT_UPDATED', payload });
  }

  /**
   * Triggers when an admin assigns a complaint
   */
  static emitComplaintAssignment(complaint, assignment) {
    const io = SocketServer.getIO();
    const payload = { complaint, assignment };
    
    io.to(`user:${complaint.userId}`).emit(EVENTS.COMPLAINT_ASSIGNED, payload);
    io.to(`officer:${assignment.agentId}`).emit(EVENTS.COMPLAINT_ASSIGNED, payload);
    io.to('admins').emit(EVENTS.DASHBOARD_REFRESH, { source: 'COMPLAINT_ASSIGNED', payload });
  }

  /**
   * Generic dashboard refresh trigger for wide-reaching changes
   */
  static emitDashboardRefresh(room, payload = {}) {
    const io = SocketServer.getIO();
    io.to(room).emit(EVENTS.DASHBOARD_REFRESH, payload);
  }
}

module.exports = SocketService;
