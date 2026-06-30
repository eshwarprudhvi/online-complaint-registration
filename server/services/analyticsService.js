const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Assignment = require('../models/Assignment');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

class AnalyticsService {
  
  async getDashboardStats() {
    const [userStats] = await User.aggregate([
      {
        $facet: {
          totalUsers: [{ $count: "count" }],
          totalCitizens: [{ $match: { role: 'Ordinary' } }, { $count: "count" }],
          totalOfficers: [{ $match: { role: 'Agent' } }, { $count: "count" }],
          approvedOfficers: [{ $match: { role: 'Agent', approvalStatus: 'Approved' } }, { $count: "count" }],
          pendingOfficers: [{ $match: { role: 'Agent', approvalStatus: 'Pending' } }, { $count: "count" }],
          rejectedOfficers: [{ $match: { role: 'Agent', approvalStatus: 'Rejected' } }, { $count: "count" }]
        }
      }
    ]);

    const [complaintStats] = await Complaint.aggregate([
      {
        $facet: {
          totalComplaints: [{ $count: "count" }],
          pending: [{ $match: { status: 'Pending' } }, { $count: "count" }],
          assigned: [{ $match: { status: 'Assigned' } }, { $count: "count" }],
          inProgress: [{ $match: { status: 'In Progress' } }, { $count: "count" }],
          resolved: [{ $match: { status: 'Resolved' } }, { $count: "count" }],
          rejected: [{ $match: { status: 'Rejected' } }, { $count: "count" }],
          cancelled: [{ $match: { status: 'Cancelled' } }, { $count: "count" }]
        }
      }
    ]);

    const [assignmentStats] = await Assignment.aggregate([
      {
        $facet: {
          totalAssignments: [{ $count: "count" }],
          activeAssignments: [{ $match: { assignmentStatus: { $in: ['Assigned', 'Accepted', 'In Progress'] } } }, { $count: "count" }],
          completedAssignments: [{ $match: { assignmentStatus: 'Completed' } }, { $count: "count" }]
        }
      }
    ]);

    const [messagingStats] = await Message.aggregate([
      {
        $facet: {
          totalMessages: [{ $count: "count" }],
          totalConversations: [
            { $group: { _id: "$complaintId" } },
            { $count: "count" }
          ]
        }
      }
    ]);

    const [notificationStats] = await Notification.aggregate([
      {
        $facet: {
          totalNotifications: [{ $count: "count" }],
          unreadNotifications: [{ $match: { isRead: false } }, { $count: "count" }]
        }
      }
    ]);

    const extractCount = (arr) => arr.length > 0 ? arr[0].count : 0;

    return {
      users: {
        total: extractCount(userStats.totalUsers),
        citizens: extractCount(userStats.totalCitizens),
        officers: extractCount(userStats.totalOfficers),
        approvedOfficers: extractCount(userStats.approvedOfficers),
        pendingOfficers: extractCount(userStats.pendingOfficers),
        rejectedOfficers: extractCount(userStats.rejectedOfficers),
      },
      complaints: {
        total: extractCount(complaintStats.totalComplaints),
        pending: extractCount(complaintStats.pending),
        assigned: extractCount(complaintStats.assigned),
        inProgress: extractCount(complaintStats.inProgress),
        resolved: extractCount(complaintStats.resolved),
        rejected: extractCount(complaintStats.rejected),
        cancelled: extractCount(complaintStats.cancelled),
      },
      assignments: {
        total: extractCount(assignmentStats.totalAssignments),
        active: extractCount(assignmentStats.activeAssignments),
        completed: extractCount(assignmentStats.completedAssignments),
      },
      messaging: {
        totalMessages: extractCount(messagingStats.totalMessages),
        totalConversations: extractCount(messagingStats.totalConversations),
      },
      notifications: {
        total: extractCount(notificationStats.totalNotifications),
        unread: extractCount(notificationStats.unreadNotifications),
      }
    };
  }

  async getComplaintAnalytics(filters = {}) {
    const matchStage = {};
    
    if (filters.startDate || filters.endDate) {
      matchStage.createdAt = {};
      if (filters.startDate) matchStage.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) matchStage.createdAt.$lte = new Date(filters.endDate);
    }
    if (filters.department) matchStage.department = filters.department;
    if (filters.status) matchStage.status = filters.status;
    if (filters.category) matchStage.category = filters.category;

    const [results] = await Complaint.aggregate([
      { $match: matchStage },
      {
        $facet: {
          byCategory: [
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byDepartment: [
            { $group: { _id: { $ifNull: ["$department", "Unassigned"] }, count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byStatus: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byMonth: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
          ],
          byYear: [
            {
              $group: {
                _id: { $year: "$createdAt" },
                count: { $sum: 1 }
              }
            },
            { $sort: { "_id": 1 } }
          ]
        }
      }
    ]);

    return results;
  }

  async getOfficerPerformance(filters = {}, sort = 'highestCompleted') {
    let sortStage = { completed: -1 };
    if (sort === 'lowestPending') sortStage = { activeWorkload: 1 };
    else if (sort === 'fastestResolution') sortStage = { averageResolutionTime: 1 };

    const pipeline = [
      { $match: { role: 'Agent' } },
      {
        $lookup: {
          from: 'assignments',
          localField: '_id',
          foreignField: 'agentId',
          as: 'assignments'
        }
      },
      {
        $lookup: {
          from: 'complaints',
          localField: 'assignments.complaintId',
          foreignField: '_id',
          as: 'complaintsDetails'
        }
      },
      {
        $addFields: {
          totalAssigned: { $size: "$assignments" },
          accepted: {
            $size: {
              $filter: {
                input: "$assignments",
                as: "a",
                cond: { $in: ["$$a.assignmentStatus", ["Accepted", "In Progress", "Completed"]] }
              }
            }
          },
          completed: {
            $size: {
              $filter: {
                input: "$assignments",
                as: "a",
                cond: { $eq: ["$$a.assignmentStatus", "Completed"] }
              }
            }
          },
          activeWorkload: {
            $size: {
              $filter: {
                input: "$assignments",
                as: "a",
                cond: { $in: ["$$a.assignmentStatus", ["Assigned", "Accepted", "In Progress"]] }
              }
            }
          },
          // Filter rejected complaints
          rejected: {
            $size: {
              $filter: {
                input: "$complaintsDetails",
                as: "c",
                cond: { $eq: ["$$c.status", "Rejected"] }
              }
            }
          },
          resolvedComplaintsForTime: {
            $filter: {
              input: "$complaintsDetails",
              as: "c",
              cond: { $and: [{ $eq: ["$$c.status", "Resolved"] }, { $ne: ["$$c.resolvedAt", null] }] }
            }
          }
        }
      },
      {
        $addFields: {
          resolutionTimes: {
            $map: {
              input: "$resolvedComplaintsForTime",
              as: "c",
              in: { $subtract: ["$$c.resolvedAt", "$$c.createdAt"] } // Returns milliseconds
            }
          }
        }
      },
      {
        $addFields: {
          averageResolutionTime: { $avg: "$resolutionTimes" } // in ms
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          approvalStatus: 1,
          totalAssigned: 1,
          accepted: 1,
          completed: 1,
          activeWorkload: 1,
          rejected: 1,
          averageResolutionTime: 1
        }
      },
      { $sort: sortStage }
    ];

    return await User.aggregate(pipeline);
  }

  async getResolutionAnalytics() {
    const pipeline = [
      {
        $match: {
          status: 'Resolved',
          resolvedAt: { $exists: true, $ne: null }
        }
      },
      {
        $addFields: {
          resolutionTimeMs: { $subtract: ["$resolvedAt", "$createdAt"] }
        }
      },
      {
        $facet: {
          stats: [
            {
              $group: {
                _id: null,
                avgResolutionTime: { $avg: "$resolutionTimeMs" },
                fastestResolution: { $min: "$resolutionTimeMs" },
                slowestResolution: { $max: "$resolutionTimeMs" }
              }
            }
          ],
          monthlyTrends: [
            {
              $group: {
                _id: {
                  year: { $year: "$resolvedAt" },
                  month: { $month: "$resolvedAt" }
                },
                avgTime: { $avg: "$resolutionTimeMs" },
                count: { $sum: 1 }
              }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
          ]
        }
      }
    ];

    const [results] = await Complaint.aggregate(pipeline);
    
    return {
      stats: results.stats[0] || { avgResolutionTime: 0, fastestResolution: 0, slowestResolution: 0 },
      monthlyTrends: results.monthlyTrends
    };
  }

  async getUserAnalytics() {
    const [results] = await User.aggregate([
      {
        $facet: {
          monthlyRegistrations: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                  role: "$role"
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
          ],
          roleDistribution: [
            {
              $group: {
                _id: "$role",
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const mostActiveCitizens = await Complaint.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          count: 1,
          name: "$user.name",
          email: "$user.email"
        }
      }
    ]);

    const mostActiveOfficers = await Assignment.aggregate([
      { $match: { assignmentStatus: 'Completed' } },
      { $group: { _id: "$agentId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          count: 1,
          name: "$user.name",
          email: "$user.email"
        }
      }
    ]);

    return {
      ...results,
      mostActiveCitizens,
      mostActiveOfficers
    };
  }

  async getRecentActivity() {
    const recentComplaints = await Complaint.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name').lean();
    const recentAssignments = await Assignment.find().sort({ assignedAt: -1 }).limit(5).populate('complaintId', 'title category').populate('agentId', 'name').lean();
    const recentResolutions = await Complaint.find({ status: 'Resolved' }).sort({ resolvedAt: -1 }).limit(5).populate('userId', 'name').lean();
    const recentOfficers = await User.find({ role: 'Agent' }).sort({ createdAt: -1 }).limit(5).select('name email approvalStatus createdAt').lean();

    return {
      recentComplaints,
      recentAssignments,
      recentResolutions,
      recentOfficers
    };
  }

  async generateReport(type, filters = {}) {
    // type: daily, weekly, monthly, yearly
    // Determine start date based on type
    const now = new Date();
    let startDate = new Date();
    
    if (type === 'daily') startDate.setDate(now.getDate() - 1);
    else if (type === 'weekly') startDate.setDate(now.getDate() - 7);
    else if (type === 'monthly') startDate.setMonth(now.getMonth() - 1);
    else if (type === 'yearly') startDate.setFullYear(now.getFullYear() - 1);
    else startDate.setMonth(now.getMonth() - 1); // default to month

    const matchStage = { createdAt: { $gte: startDate } };
    
    if (filters.department) matchStage.department = filters.department;
    if (filters.category) matchStage.category = filters.category;
    if (filters.status) matchStage.status = filters.status;

    const complaints = await Complaint.find(matchStage).populate('userId', 'name email').sort({ createdAt: -1 }).lean();

    // Prepare JSON for future export (CSV, PDF, Excel)
    return {
      reportType: type,
      generatedAt: new Date(),
      filters,
      data: complaints.map(c => ({
        id: c._id,
        title: c.title,
        category: c.category,
        department: c.department || 'Unassigned',
        status: c.status,
        citizenName: c.userId?.name,
        citizenEmail: c.userId?.email,
        createdAt: c.createdAt,
        resolvedAt: c.resolvedAt || null
      }))
    };
  }
}

module.exports = new AnalyticsService();
