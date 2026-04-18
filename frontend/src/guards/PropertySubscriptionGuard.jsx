import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProperty } from '../contexts/PropertyContext';
import { 
  Crown, 
  Lock, 
  ArrowRight, 
  Home, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function PropertySubscriptionGuard({ children }) {
  const { user, isLoggedIn } = useAuth();
  const { getUserProperties } = useProperty();
  const navigate = useNavigate();
  
  const [userProperties, setUserProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!isLoggedIn || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        const properties = await getUserProperties();
        setUserProperties(properties || []);
      } catch (error) {
        console.error('Failed to fetch user properties:', error);
        setUserProperties([]);
      } finally {
        setLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, [isLoggedIn, user?.id, getUserProperties]);

  const getPropertyCount = () => userProperties.length;
  const hasSubscription = () => user?.isSubscribed;
  const canListMoreProperties = () => {
    if (hasSubscription()) return true;
    return getPropertyCount() < 1; // Free users can list 1 property
  };

  const handleUpgradePlan = () => {
    navigate('/property-subscription');
  };

  const handleContinueWithBasic = () => {
    setShowUpgradeModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your subscription status...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              Login Required
            </h2>
            
            <p className="text-gray-600 mb-8">
              Please login to list your property. Create a free account to get started with your first property listing.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all"
              >
                Login to Continue
              </button>
              
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                Create Free Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!canListMoreProperties()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-lg w-full mx-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-orange-200">
                <Crown className="w-10 h-10 text-orange-500" />
              </div>
              
              <h2 className="text-3xl font-black text-gray-900 mb-4">
                Upgrade Your <span className="text-primary">Listing Plan</span>
              </h2>
              
              <p className="text-lg text-gray-600 mb-6">
                You've reached your free listing limit! Upgrade to list more properties and unlock premium features.
              </p>

              {/* Current Status */}
              <div className="inline-flex items-center gap-6 px-6 py-3 bg-gray-50 rounded-2xl border border-gray-200 mb-8">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">
                    Listed: <span className="font-bold text-gray-900">{getPropertyCount()}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-orange-600">
                    Free Limit: 1
                  </span>
                </div>
              </div>
            </div>

            {/* Plans Comparison */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              {/* Continue with Basic (Disabled) */}
              <div className="relative bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 opacity-60">
                <div className="absolute top-3 right-3">
                  <div className="px-2 py-1 bg-gray-400 text-white text-xs font-bold rounded-full">
                    Current
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-700">Basic Plan</h3>
                    <p className="text-2xl font-black text-gray-900">Free</p>
                  </div>
                  <Lock className="w-6 h-6 text-gray-400" />
                </div>
                
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    1 Property Listing
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Basic Features
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="w-4 h-4 border-2 border-gray-300 rounded-full"></span>
                    More Properties
                  </li>
                </ul>
                
                <button 
                  disabled 
                  className="w-full py-3 bg-gray-200 text-gray-400 rounded-xl font-bold cursor-not-allowed"
                >
                  Limit Reached
                </button>
              </div>

              {/* Upgrade to Premium */}
              <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs font-bold rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Recommended
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-primary">Premium Plan</h3>
                    <p className="text-2xl font-black text-primary">₹2,999<span className="text-sm font-medium text-primary/70">/month</span></p>
                  </div>
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    5 Property Listings
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Premium Features
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Priority Support
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Better Visibility
                  </li>
                </ul>
                
                <button 
                  onClick={handleUpgradePlan}
                  className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  Upgrade Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Additional Options */}
            <div className="text-center">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="text-primary font-bold hover:underline text-sm"
              >
                View all subscription plans
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User can list properties - show the protected content
  return children;
}
