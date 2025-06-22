// models/UserLog.js
const mongoose = require('mongoose');

const userLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  action: { type: String, required: true }, // login, logout, register, page_view, etc.
  page: { type: String }, // /dashboard, /settings (optional for page_view)
  userAgent: { type: String }, // browser/device info
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserLog', userLogSchema);
