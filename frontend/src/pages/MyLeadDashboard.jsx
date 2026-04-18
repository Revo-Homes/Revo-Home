import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Fire, 
  Snowflake, 
  Sun, 
  Crown,
  TrendingUp,
  Clock,
  Eye,
  Heart,
  Share2,
  Search,
  User,
  Home,
  Calendar,
  ChevronRight,
  Award,
  Zap,
  Target,
  BarChart3,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MyLeadDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch score data
      const scoreResponse = await api.get(`/api/v1/users/${user.id}/lead-score`);
      setScoreData(scoreResponse.data.data);

      // Fetch interactions
      const interactionsResponse = await api.get(`/api/v1/users/${user.id}/interactions?days=30`);
      setInteractions(interactionsResponse.data.data.interactions || []);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'premium': return <Crown className="w-8 h-8 text-purple-500" />;
      case 'hot': return <Fire className="w-8 h-8 text-red-500" />;
      case 'warm': return <Sun className="w-8 h-8 text-orange-500" />;
      default: return <Snowflake className="w-8 h-8 text-blue-500" />;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'premium': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'hot': return 'bg-red-100 text-red-800 border-red-300';
      case 'warm': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getNextTierInfo = (currentTier, score) => {
    const tiers = [
      { name: 'warm', threshold: 40, label: 'Warm' },
      { name: 'hot', threshold: 70, label: 'Hot' },
      { name: 'premium', threshold: 80, label: 'Premium' }
    ];

    const currentIndex = tiers.findIndex(t => t.name === currentTier);
    if (currentIndex === -1) {
      const next = tiers[0];
      return { nextTier: next.label, pointsNeeded: next.threshold - score };
    }
    if (currentIndex >= tiers.length - 1) {
      return null; // Already at max tier
    }

    const next = tiers[currentIndex + 1];
    return { nextTier: next.label, pointsNeeded: next.threshold - score };
  };

  const getScoreComponentColor = (score, max) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const score = scoreData?.score || 0;
  const tier = scoreData?.tier || 'cold';
  const nextTier = getNextTierInfo(tier, score);
  const components = scoreData?.components || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Lead Score</h1>
          <p className="text-gray-600 mt-2">
            Track your property search activity and earn benefits
          </p>
        </div>

        {/* Score Overview Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Score Display */}
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className={`p-4 rounded-full ${getTierColor(tier).split(' ')[0]}`}>
                {getTierIcon(tier)}
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <span className="text-5xl font-bold text-gray-900">{score}</span>
                  <span className="text-2xl text-gray-400">/100</span>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(tier)}`}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
                </span>
              </div>
            </div>

            {/* Progress to Next Tier */}
            {nextTier && (
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-600 mb-2">
                  {nextTier.pointsNeeded} points to reach <span className="font-semibold">{nextTier.nextTier}</span>
                </p>
                <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${(score / (score + nextTier.pointsNeeded)) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Rank */}
            {scoreData?.rank && (
              <div className="text-center mt-4 md:mt-0">
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Award className="w-5 h-5" />
                  <span className="text-sm">Top {scoreData.rank}% of leads</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Score Breakdown
              </h2>
              
              <div className="space-y-5">
                {/* Website Activity */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <Eye className="w-4 h-4 mr-2 text-blue-500" />
                      Website Activity
                    </span>
                    <span className="text-sm text-gray-600">
                      {components.website_activity || 0}/30
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${getScoreComponentColor(components.website_activity || 0, 30)}`}
                      style={{ width: `${Math.min(100, ((components.website_activity || 0) / 30) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Profile Completeness */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <User className="w-4 h-4 mr-2 text-green-500" />
                      Profile Completeness
                    </span>
                    <span className="text-sm text-gray-600">
                      {components.profile_completeness || 0}/20
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${getScoreComponentColor(components.profile_completeness || 0, 20)}`}
                      style={{ width: `${Math.min(100, ((components.profile_completeness || 0) / 20) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Recency */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-purple-500" />
                      Recency
                    </span>
                    <span className="text-sm text-gray-600">
                      {components.recency || 0}/15
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${getScoreComponentColor(components.recency || 0, 15)}`}
                      style={{ width: `${Math.min(100, ((components.recency || 0) / 15) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Communication */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2 text-orange-500" />
                      Communication
                    </span>
                    <span className="text-sm text-gray-600">
                      {components.communication || 0}/15
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${getScoreComponentColor(components.communication || 0, 15)}`}
                      style={{ width: `${Math.min(100, ((components.communication || 0) / 15) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Property Depth */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <Home className="w-4 h-4 mr-2 text-pink-500" />
                      Property Interest
                    </span>
                    <span className="text-sm text-gray-600">
                      {components.property_depth || 0}/12
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${getScoreComponentColor(components.property_depth || 0, 12)}`}
                      style={{ width: `${Math.min(100, ((components.property_depth || 0) / 12) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Demographics */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-teal-500" />
                      Demographics
                    </span>
                    <span className="text-sm text-gray-600">
                      {components.demographics || 0}/8
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${getScoreComponentColor(components.demographics || 0, 8)}`}
                      style={{ width: `${Math.min(100, ((components.demographics || 0) / 8) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Recent Activity
              </h2>
              
              <div className="space-y-4">
                {interactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No recent activity. Start exploring properties to earn points!
                  </p>
                ) : (
                  interactions.slice(0, 10).map((interaction, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {interaction.interaction_type === 'property_view' && <Eye className="w-5 h-5 text-blue-500" />}
                        {interaction.interaction_type === 'property_click' && <Home className="w-5 h-5 text-green-500" />}
                        {interaction.interaction_type === 'favorite_add' && <Heart className="w-5 h-5 text-red-500" />}
                        {interaction.interaction_type === 'share' && <Share2 className="w-5 h-5 text-purple-500" />}
                        {interaction.interaction_type === 'contact_request' && <Phone className="w-5 h-5 text-orange-500" />}
                        {interaction.interaction_type === 'schedule_viewing' && <Calendar className="w-5 h-5 text-teal-500" />}
                        {interaction.interaction_type === 'profile_update' && <User className="w-5 h-5 text-gray-500" />}
                        {interaction.interaction_type === 'search_query' && <Search className="w-5 h-5 text-indigo-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {interaction.interaction_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        {interaction.property_name && (
                          <p className="text-xs text-gray-600 mt-1">
                            {interaction.property_name}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(interaction.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold ${interaction.score_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {interaction.score_change > 0 ? '+' : ''}{interaction.score_change}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Tier Benefits */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tier Benefits</h3>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${tier === 'cold' ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Snowflake className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-gray-900">Cold Benefits</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Basic property recommendations</li>
                    <li>• Email alerts</li>
                  </ul>
                </div>

                <div className={`p-4 rounded-lg ${tier === 'warm' ? 'bg-orange-50 border-2 border-orange-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Sun className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold text-gray-900">Warm Benefits</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Priority agent assignment</li>
                    <li>• Bi-weekly recommendations</li>
                    <li>• WhatsApp group access</li>
                  </ul>
                </div>

                <div className={`p-4 rounded-lg ${tier === 'hot' ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Fire className="w-5 h-5 text-red-500" />
                    <span className="font-semibold text-gray-900">Hot Benefits</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Instant agent callback (2hr SLA)</li>
                    <li>• Exclusive property previews</li>
                    <li>• Dedicated relationship manager</li>
                  </ul>
                </div>

                <div className={`p-4 rounded-lg ${tier === 'premium' ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Crown className="w-5 h-5 text-purple-500" />
                    <span className="font-semibold text-gray-900">Premium Benefits</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• VIP treatment at all stages</li>
                    <li>• First access to new launches</li>
                    <li>• Private viewing arrangements</li>
                    <li>• Negotiation assistance</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            {scoreData?.activity && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Activity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{scoreData.activity.views || 0}</p>
                    <p className="text-xs text-gray-600">Property Views</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Heart className="w-6 h-6 text-red-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{scoreData.activity.favorites || 0}</p>
                    <p className="text-xs text-gray-600">Favorites</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Home className="w-6 h-6 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{scoreData.activity.clicks || 0}</p>
                    <p className="text-xs text-gray-600">Clicks</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{scoreData.activity.total_interactions || 0}</p>
                    <p className="text-xs text-gray-600">Total Actions</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow p-6 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Boost Your Score
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/properties')}
                  className="w-full flex items-center justify-between p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <span className="text-sm">Schedule a Viewing</span>
                  <span className="text-sm font-bold">+30 pts</span>
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center justify-between p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <span className="text-sm">Complete Profile</span>
                  <span className="text-sm font-bold">+10 pts</span>
                </button>
                <button 
                  onClick={() => navigate('/properties')}
                  className="w-full flex items-center justify-between p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <span className="text-sm">Share a Property</span>
                  <span className="text-sm font-bold">+20 pts</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyLeadDashboard;
