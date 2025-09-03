'use client';

import { useState } from 'react';
import { Bell, X, ShoppingCart, Users, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function NotificationBell() {
  const { notifications, isConnected, clearNotifications, markNotificationAsRead, connectionAttempts } = useWebSocket();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <ShoppingCart className="h-5 w-5 text-blue-600" />;
      case 'new_user':
        return <Users className="h-5 w-5 text-green-600" />;
      case 'product_update':
        return <Package className="h-5 w-5 text-yellow-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_order':
        return 'border-l-blue-500 bg-blue-50/50';
      case 'new_user':
        return 'border-l-green-500 bg-green-50/50';
      case 'product_update':
        return 'border-l-yellow-500 bg-yellow-50/50';
      default:
        return 'border-l-gray-500 bg-gray-50/50';
    }
  };

  const getNotificationStatus = (type) => {
    switch (type) {
      case 'new_order':
        return { icon: Clock, color: 'text-blue-600', text: 'New Order' };
      case 'new_user':
        return { icon: CheckCircle, color: 'text-green-600', text: 'New User' };
      case 'product_update':
        return { icon: AlertCircle, color: 'text-yellow-600', text: 'Product Update' };
      default:
        return { icon: Bell, color: 'text-gray-600', text: 'Notification' };
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id || notification.timestamp);
    
    // Navigate based on notification type
    if (notification.type === 'new_order') {
      window.location.href = '/admin/orders';
    } else if (notification.type === 'new_user') {
      window.location.href = '/admin/users';
    }
    
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {/* Connection Status Indicator */}
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-xs text-gray-500 font-medium">
                {isConnected ? 'Connected' : connectionAttempts > 0 ? `Reconnecting (${connectionAttempts}/5)` : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-1">No notifications yet</p>
                <p className="text-sm text-gray-400">You'll see important updates here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification, index) => {
                  const status = getNotificationStatus(notification.type);
                  return (
                    <div
                      key={notification.id || notification.timestamp || index}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                        !notification.read ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className={`border-l-4 pl-4 py-1 ${getNotificationColor(notification.type)}`}>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <status.icon className={`h-3 w-3 ${status.color}`} />
                                <span className="text-xs text-gray-500 font-medium">
                                  {status.text}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">
                                {formatTime(notification.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => window.location.href = '/admin/notifications'}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
