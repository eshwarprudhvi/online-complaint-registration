const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { officerAuth } = require('../middleware/roleMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getAssignedComplaints,
  getComplaintDetails,
  acceptComplaint,
  startWork,
  resolveComplaint,
  rejectComplaint,
  addActionNote,
  uploadEvidence,
} = require('../controllers/officerController');

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/complaints';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and PDF are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: fileFilter
});

// Apply both middlewares to all routes
router.use(auth, officerAuth);

router.get('/complaints', getAssignedComplaints);
router.get('/complaints/:id', getComplaintDetails);
router.put('/complaints/:id/accept', acceptComplaint);
router.put('/complaints/:id/start', startWork);
router.put('/complaints/:id/resolve', resolveComplaint);
router.put('/complaints/:id/reject', rejectComplaint);
router.post('/complaints/:id/notes', addActionNote);
router.post('/complaints/:id/upload', upload.single('file'), uploadEvidence);

module.exports = router;
