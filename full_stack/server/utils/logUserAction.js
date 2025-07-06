const UserLog = require('../models/UserLogs');

const logUserAction = async ({ userId, action, req }) => {
  await UserLog.create({
    userId,
    action,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip || req.connection.remoteAddress,
  });
};

module.exports = logUserAction;