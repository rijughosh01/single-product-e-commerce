'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ordersAPI } from '@/lib/api';
import { Calendar, Mail, Phone, MapPin, ShoppingBag, Heart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ProfileOverview = ({ user }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteProducts: 0,
    memberSince: ''
  });

  useEffect(() => {
    if (!user) return;
    fetchUserStats();
  }, [user]);

  const fetchUserStats = async () => {
    try {
      if (!user) return;
      const ordersResponse = await ordersAPI.getOrders();
      const orders = ordersResponse.data.orders || [];
      
      const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : '';

      setStats({
        totalOrders: orders.length,
        totalSpent,
        favoriteProducts: 0, // Will be updated when wishlist API is called
        memberSince
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg p-6 border border-gray-200 bg-white">
          <div className="h-6 w-40 bg-gray-100 rounded mb-4" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={user.avatar?.url || '/placeholder-avatar.jpg'}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center mt-2 space-x-4">
              <Badge className={getStatusColor(user.isEmailVerified ? 'verified' : 'pending')}>
                {user.isEmailVerified ? 'Email Verified' : 'Email Pending'}
              </Badge>
              <Badge variant="outline" className="text-gray-600">
                {user.role === 'admin' ? 'Administrator' : 'Customer'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid removed as requested */}

      {/* Contact Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">{user.email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">{user.phone}</span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">
              {user.addresses?.length > 0 
                ? `${user.addresses.length} address${user.addresses.length > 1 ? 'es' : ''} saved`
                : 'No addresses saved'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Account created</span>
            </div>
            <span className="text-sm text-gray-500">{stats.memberSince}</span>
          </div>
          {user.isEmailVerified && (
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Email verified</span>
              </div>
              <span className="text-sm text-gray-500">Recently</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
