const Notification = require('../models/Notification');

// Get notifications for logged-in user
const getAllNotifications = async (userId) => {
  return await Notification.find({ userId }).populate('songId').sort({ createdAt: -1 });
};

// Mark a notification as read
const markAsRead = async (id, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { isRead: true },
    { returnDocument: 'after' }
  );
  if (!notification) throw new Error('Notification not found');
  return notification;
};

module.exports = { getAllNotifications, markAsRead };
