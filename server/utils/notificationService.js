const Notification = require("../models/Notification");
const User = require("../models/User");

class NotificationService {
  static async createNotification(notificationData) {
    try {
      const {
        userId,
        title,
        message,
        type,
        priority = "medium",
        metadata = {},
        actionUrl,
        actionText,
        expiresAt,
      } = notificationData;

      // Validate required fields
      if (!userId || !title || !message || !type) {
        throw new Error("Missing required notification fields");
      }

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Create notification
      const notification = await Notification.create({
        user: userId,
        title,
        message,
        type,
        priority,
        metadata,
        actionUrl,
        actionText,
        expiresAt,
      });

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // Create notifications for all admin users
  static async createAdminNotification(notificationData) {
    try {
      
      const adminUsers = await User.find({ role: "admin" });

      if (adminUsers.length === 0) {
        return [];
      }

      const notifications = [];

      // Create notification for each admin
      for (const admin of adminUsers) {
        try {
          const notification = await this.createNotification({
            ...notificationData,
            userId: admin._id,
          });
          notifications.push(notification);
        } catch (error) {
          console.error(
            `Failed to create notification for admin ${admin._id}:`,
            error
          );
        }
      }

      return notifications;
    } catch (error) {
      console.error("Error creating admin notifications:", error);
      throw error;
    }
  }

  // Create order-related notifications

  static async createOrderNotification(order, eventType) {
    try {
      const notifications = [];

      // Notification for customer
      const customerNotification = await this.createNotification({
        userId: order.user,
        title: this.getOrderTitle(eventType),
        message: this.getOrderMessage(order, eventType),
        type: "order",
        priority: this.getOrderPriority(eventType),
        metadata: {
          orderId: order._id,
        },
        actionUrl: `/orders/${order._id}`,
        actionText: "View Order",
      });
      notifications.push(customerNotification);

      // Notification for admins
      const adminNotifications = await this.createAdminNotification({
        title: `Admin: ${this.getOrderTitle(eventType)}`,
        message: `Order #${order._id} - ${this.getOrderMessage(
          order,
          eventType
        )}`,
        type: "order",
        priority: this.getOrderPriority(eventType),
        metadata: {
          orderId: order._id,
        },
        actionUrl: `/admin/orders/${order._id}`,
        actionText: "View Order",
      });
      notifications.push(...adminNotifications);

      return notifications;
    } catch (error) {
      console.error("Error creating order notifications:", error);
      throw error;
    }
  }

  // Create payment-related notifications

  static async createPaymentNotification(payment, order, eventType) {
    try {
      const notifications = [];

      // Notification for customer
      const customerNotification = await this.createNotification({
        userId: order.user,
        title: this.getPaymentTitle(eventType),
        message: this.getPaymentMessage(payment, order, eventType),
        type: "payment",
        priority: this.getPaymentPriority(eventType),
        metadata: {
          orderId: order._id,
          paymentId: payment.id || payment._id,
        },
        actionUrl: `/orders/${order._id}`,
        actionText: "View Order",
      });
      notifications.push(customerNotification);

      // Notification for admins
      const adminNotifications = await this.createAdminNotification({
        title: `Admin: ${this.getPaymentTitle(eventType)}`,
        message: `Payment for Order #${order._id} - ${this.getPaymentMessage(
          payment,
          order,
          eventType
        )}`,
        type: "payment",
        priority: this.getPaymentPriority(eventType),
        metadata: {
          orderId: order._id,
          paymentId: payment.id || payment._id,
        },
        actionUrl: `/admin/orders/${order._id}`,
        actionText: "View Order",
      });
      notifications.push(...adminNotifications);

      return notifications;
    } catch (error) {
      console.error("Error creating payment notifications:", error);
      throw error;
    }
  }

  // Create shipping-related notifications

  static async createShippingNotification(
    order,
    eventType,
    trackingNumber = null
  ) {
    try {
      const notifications = [];

      // Notification for customer
      const customerNotification = await this.createNotification({
        userId: order.user,
        title: this.getShippingTitle(eventType),
        message: this.getShippingMessage(order, eventType, trackingNumber),
        type: "shipping",
        priority: this.getShippingPriority(eventType),
        metadata: {
          orderId: order._id,
          trackingNumber,
        },
        actionUrl: `/orders/${order._id}`,
        actionText: "Track Order",
      });
      notifications.push(customerNotification);

      return notifications;
    } catch (error) {
      console.error("Error creating shipping notifications:", error);
      throw error;
    }
  }

  // Helper methods for order notifications
  static getOrderTitle(eventType) {
    const titles = {
      created: "Order Confirmed",
      updated: "Order Updated",
      cancelled: "Order Cancelled",
      shipped: "Order Shipped",
      delivered: "Order Delivered",
    };
    return titles[eventType] || "Order Update";
  }

  static getOrderMessage(order, eventType) {
    const messages = {
      created: `Your order #${order._id} has been confirmed and is being processed.`,
      updated: `Your order #${order._id} has been updated.`,
      cancelled: `Your order #${order._id} has been cancelled.`,
      shipped: `Your order #${order._id} has been shipped and is on its way.`,
      delivered: `Your order #${order._id} has been delivered successfully.`,
    };
    return messages[eventType] || `Your order #${order._id} has been updated.`;
  }

  static getOrderPriority(eventType) {
    const priorities = {
      created: "medium",
      updated: "low",
      cancelled: "high",
      shipped: "medium",
      delivered: "medium",
    };
    return priorities[eventType] || "medium";
  }

  // Helper methods for payment notifications
  static getPaymentTitle(eventType) {
    const titles = {
      success: "Payment Successful",
      failed: "Payment Failed",
      refunded: "Payment Refunded",
      pending: "Payment Pending",
    };
    return titles[eventType] || "Payment Update";
  }

  static getPaymentMessage(payment, order, eventType) {
    const amount = payment.amount
      ? `₹${payment.amount / 100}`
      : `₹${order.totalPrice}`;
    const messages = {
      success: `Your payment of ${amount} for order #${order._id} was successful.`,
      failed: `Your payment of ${amount} for order #${order._id} failed. Please try again.`,
      refunded: `Your payment of ${amount} for order #${order._id} has been refunded.`,
      pending: `Your payment of ${amount} for order #${order._id} is pending.`,
    };
    return messages[eventType] || `Payment update for order #${order._id}.`;
  }

  static getPaymentPriority(eventType) {
    const priorities = {
      success: "medium",
      failed: "high",
      refunded: "medium",
      pending: "low",
    };
    return priorities[eventType] || "medium";
  }

  // Helper methods for shipping notifications
  static getShippingTitle(eventType) {
    const titles = {
      shipped: "Order Shipped",
      delivered: "Order Delivered",
      out_for_delivery: "Out for Delivery",
    };
    return titles[eventType] || "Shipping Update";
  }

  static getShippingMessage(order, eventType, trackingNumber) {
    const baseMessage = `Your order #${order._id}`;
    const trackingInfo = trackingNumber ? ` (Tracking: ${trackingNumber})` : "";

    const messages = {
      shipped: `${baseMessage} has been shipped and is on its way.${trackingInfo}`,
      delivered: `${baseMessage} has been delivered successfully.`,
      out_for_delivery: `${baseMessage} is out for delivery.${trackingInfo}`,
    };
    return (
      messages[eventType] ||
      `${baseMessage} shipping status updated.${trackingInfo}`
    );
  }

  static getShippingPriority(eventType) {
    const priorities = {
      shipped: "medium",
      delivered: "medium",
      out_for_delivery: "medium",
    };
    return priorities[eventType] || "medium";
  }
}

module.exports = NotificationService;
