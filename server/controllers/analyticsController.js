const analyticsService = require('../services/analyticsService');

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await analyticsService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getComplaintsAnalytics = async (req, res) => {
  try {
    const filters = req.query; // { startDate, endDate, department, status, category }
    const analytics = await analyticsService.getComplaintAnalytics(filters);
    res.json(analytics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getOfficerPerformance = async (req, res) => {
  try {
    const filters = req.query; 
    const sort = req.query.sort || 'highestCompleted';
    const performance = await analyticsService.getOfficerPerformance(filters, sort);
    res.json(performance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getResolutionAnalytics = async (req, res) => {
  try {
    const analytics = await analyticsService.getResolutionAnalytics();
    res.json(analytics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const analytics = await analyticsService.getUserAnalytics();
    res.json(analytics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const activity = await analyticsService.getRecentActivity();
    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const { type } = req.query; // daily, weekly, monthly, yearly
    const filters = req.body || {}; // could pass filters in body for POST, but we use GET for this usually. Let's use query params.
    
    // Merge query params for filters, except type
    const queryFilters = { ...req.query };
    delete queryFilters.type;

    const report = await analyticsService.generateReport(type || 'monthly', queryFilters);
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
