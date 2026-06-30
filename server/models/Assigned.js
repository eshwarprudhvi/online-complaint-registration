const mongoose = require('mongoose');

const assignedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Assigned', 'Accepted', 'Completed'],
      default: 'Assigned',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Assigned', assignedSchema);
