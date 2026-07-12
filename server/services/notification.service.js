const NotificationRepository = require('../repositories/NotificationRepository');

class NotificationService {
  async notify(userId, organizationId, title, message, type = 'System') {
    try {
      return await NotificationRepository.create({
        recipient: userId,
        organization: organizationId,
        title,
        message,
        type
      });
    } catch (error) {
      console.error(`Failed to create notification: ${error.message}`);
    }
  }

  async getUserNotifications(userId, organizationId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = { recipient: userId, organization: organizationId };
    
    const notifications = await NotificationRepository.find(query, {
      sort: { createdAt: -1 },
      skip,
      limit
    });

    const total = await NotificationRepository.count(query);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async markAsRead(notificationId, userId) {
    const notification = await NotificationRepository.findOne({ _id: notificationId, recipient: userId });
    if (!notification) {
      throw new Error('Notification not found');
    }
    notification.readStatus = true;
    return await notification.save();
  }
}

module.exports = new NotificationService();
