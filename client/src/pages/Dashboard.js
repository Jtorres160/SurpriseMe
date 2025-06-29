import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Upload, 
  DollarSign, 
  Eye, 
  ShoppingCart, 
  TrendingUp,
  Image,
  Video,
  Plus
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalContent: 0,
    totalViews: 0,
    totalEarnings: 0,
    totalPurchases: 0
  });
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user's content
        const contentResponse = await axios.get('/api/content/creator/' + user._id);
        const content = contentResponse.data.content;
        
        // Calculate stats
        const totalViews = content.reduce((sum, item) => sum + item.views, 0);
        const totalEarnings = content.reduce((sum, item) => sum + item.totalRevenue, 0);
        
        setStats({
          totalContent: content.length,
          totalViews,
          totalEarnings,
          totalPurchases: user.totalSpent || 0
        });
        
        setRecentContent(content.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Content',
      value: stats.totalContent,
      icon: Image,
      color: 'bg-blue-500',
      description: 'Items uploaded'
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'bg-green-500',
      description: 'Content views'
    },
    {
      title: 'Total Earnings',
      value: `$${stats.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      description: 'From sales'
    },
    {
      title: 'Total Spent',
      value: `$${stats.totalPurchases.toFixed(2)}`,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      description: 'On purchases'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user.username}! Here's an overview of your activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="card-body space-y-4">
              <Link
                to="/upload"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Upload className="w-6 h-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">Upload New Content</h3>
                  <p className="text-sm text-gray-600">Share your latest creation</p>
                </div>
                <Plus className="w-5 h-5 text-gray-400 ml-auto" />
              </Link>
              
              <Link
                to="/gallery"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Image className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">Browse Gallery</h3>
                  <p className="text-sm text-gray-600">Discover amazing content</p>
                </div>
                <Plus className="w-5 h-5 text-gray-400 ml-auto" />
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Account Overview</h2>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Balance</span>
                <span className="font-semibold text-gray-900">${user.balance?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Earnings</span>
                <span className="font-semibold text-gray-900">${user.totalEarnings?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Content */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Content</h2>
            <Link
              to="/my-content"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          <div className="card-body">
            {recentContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentContent.map((content) => (
                  <div key={content._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                      <img
                        src={content.thumbnailUrl}
                        alt={content.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1">{content.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{content.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-primary-600">
                          ${content.price}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{content.views} views</span>
                          <span className="text-sm text-gray-500">{content.purchases} sales</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by uploading your first piece of content
                </p>
                <Link to="/upload" className="btn-primary">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Content
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 