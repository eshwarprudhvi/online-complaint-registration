const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { adminAuth } = require('../middleware/roleMiddleware');
const analyticsController = require('../controllers/analyticsController');

// All analytics routes require admin authentication
router.use(auth, adminAuth);

// GET /api/admin/analytics/dashboard
router.get('/dashboard', analyticsController.getDashboardStats);

// GET /api/admin/analytics/complaints
router.get('/complaints', analyticsController.getComplaintsAnalytics);

// GET /api/admin/analytics/officers
router.get('/officers', analyticsController.getOfficerPerformance);

// GET /api/admin/analytics/users
router.get('/users', analyticsController.getUserAnalytics);

// GET /api/admin/analytics/resolution
router.get('/resolution', analyticsController.getResolutionAnalytics);

// GET /api/admin/analytics/activity
router.get('/activity', analyticsController.getRecentActivity);

// GET /api/admin/analytics/report
router.get('/report', analyticsController.generateReport);

module.exports = router;
