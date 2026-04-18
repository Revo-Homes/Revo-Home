import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fire, Snowflake, Sun, Crown, ChevronDown, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ScoreDisplayWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (user) {
      fetchScore();
    }
  }, [user]);

  // Listen for score updates from tracker
  useEffect(() => {
    const handleScoreUpdate = (event) => {
      if (event.detail) {
        // Refresh score data
        fetchScore();
      }
    };

    window.addEventListener('leadScoreUpdate', handleScoreUpdate);
    return () => window.removeEventListener('leadScoreUpdate', handleScoreUpdate);
  }, []);

  const fetchScore = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/users/${user.id}/lead-score`);
      if (response.data.data?.has_lead) {
        setScoreData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching score:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !scoreData) {
    return null;
  }

  const { score, tier, temperature } = scoreData;

  const getTierConfig = (tier) => {
    switch (tier) {
      case 'premium':
        return {
          icon: Crown,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          borderColor: 'border-purple-300',
          gradient: 'from-purple-500 to-pink-500',
          label: 'Premium'
        };
      case 'hot':
        return {
          icon: Fire,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
          gradient: 'from-red-500 to-orange-500',
          label: 'Hot'
        };
      case 'warm':
        return {
          icon: Sun,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          borderColor: 'border-orange-300',
          gradient: 'from-orange-400 to-yellow-400',
          label: 'Warm'
        };
      default:
        return {
          icon: Snowflake,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-300',
          gradient: 'from-blue-400 to-cyan-400',
          label: 'Cold'
        };
    }
  };

  const config = getTierConfig(tier);
  const TierIcon = config.icon;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={() => navigate('/my-lead-score')}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${config.bgColor} border ${config.borderColor} hover:shadow-md transition-all duration-200`}
      >
        <TierIcon className={`w-5 h-5 ${config.color}`} />
        <div className="flex items-baseline space-x-1">
          <span className={`font-bold ${config.color}`}>{score}</span>
          <span className="text-xs text-gray-500">/100</span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${config.gradient} p-4 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TierIcon className="w-6 h-6" />
                <span className="font-semibold">{config.label} Lead</span>
              </div>
              <span className="text-2xl font-bold">{score}</span>
            </div>
            <p className="text-sm text-white/80 mt-1">
              Score reflects your property search activity
            </p>
          </div>

          {/* Quick Stats */}
          <div className="p-4 space-y-3">
            {scoreData.components && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Website Activity</span>
                  <span className="font-medium">{scoreData.components.website_activity || 0}/30</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${((scoreData.components.website_activity || 0) / 30) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Profile Complete</span>
                  <span className="font-medium">{scoreData.components.profile_completeness || 0}/20</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${((scoreData.components.profile_completeness || 0) / 20) * 100}%` }}
                  />
                </div>
              </>
            )}

            {/* Activity Summary */}
            {scoreData.activity && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{scoreData.activity.views || 0}</p>
                  <p className="text-xs text-gray-500">Views</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{scoreData.activity.favorites || 0}</p>
                  <p className="text-xs text-gray-500">Favorites</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{scoreData.activity.clicks || 0}</p>
                  <p className="text-xs text-gray-500">Clicks</p>
                </div>
              </div>
            )}

            {/* View Full Dashboard Link */}
            <button
              onClick={() => navigate('/my-lead-score')}
              className="w-full flex items-center justify-center space-x-2 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span>View Full Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreDisplayWidget;
