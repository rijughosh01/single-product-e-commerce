const Notification = require('../models/Notification');
const ErrorHandler = require('../utils/errorHandler');

// Get user's notifications => /api/v1/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, unreadOnly = false } = req.query;
    
    const query = { user: req.user.id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read => /api/v1/notification/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new ErrorHandler('Notification not found', 404));
    }

    if (notification.user.toString() !== req.user.id) {
      return next(new ErrorHandler('Not authorized to access this notification', 403));
    }

    notification.markAsRead();
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read => /api/v1/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification => /api/v1/notification/:id
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new ErrorHandler('Notification not found', 404));
    }

    if (notification.user.toString() !== req.user.id) {
      return next(new ErrorHandler('Not authorized to delete this notification', 403));
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get unread count => /api/v1/notifications/unread-count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    next(error);
  }
};

// Create notification (internal use) => /api/v1/admin/notification/create
exports.createNotification = async (req, res, next) => {
  try {
    const { userId, title, message, type, priority, actionUrl, actionText, metadata } = req.body;

    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      priority,
      actionUrl,
      actionText,
      metadata
    });

    res.status(201).json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
};

// Get all notifications - Admin => /api/v1/admin/notifications
exports.getAllNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, userId, type, isRead } = req.query;
    
    const query = {};
    if (userId) query.user = userId;
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await Notification.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};
