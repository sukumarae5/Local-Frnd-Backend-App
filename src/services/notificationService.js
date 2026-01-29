const Notification = require("../models/notificationModel");

exports.send = Notification.create;
exports.list = Notification.list;
exports.read = Notification.markRead;
