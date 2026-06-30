const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

const officerAuth = (req, res, next) => {
  if (req.user && req.user.role === 'Agent') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Officer role required.' });
  }
};

module.exports = { adminAuth, officerAuth };
