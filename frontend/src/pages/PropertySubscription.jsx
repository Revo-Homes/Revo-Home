import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProperty } from '../contexts/PropertyContext';
import { 
  Crown, 
  CheckCircle2, 
  ArrowRight, 
  Home, 
  Star, 
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react';

const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    priceLabel: '₹0',
    propertiesLimit: 1,
    features: [
      'List 1 Property',
      'Basic Property Details',
      'Photo Upload (5 photos)',
      '30 Days Listing',
      'Basic Support'
    ],
    highlighted: false,
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '2999',
    priceLabel: '₹2,999',
    propertiesLimit: 5,
    features: [
      'List 5 Properties',
      'Advanced Property Details',
      'Photo Upload (20 photos)',
      'Video Upload',
      '90 Days Listing',
      'Priority Support',
      'Featured Badge',
      'Better Visibility'
    ],
    highlighted: true,
    popular: true
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '5999',
    priceLabel: '₹5,999',
    propertiesLimit: -1, // -1 for unlimited
    features: [
      'Unlimited Properties',
      'All Premium Features',
      'Unlimited Photos & Videos',
      '365 Days Listing',
      'Dedicated Support',
      'Premium Badge',
      'Maximum Visibility',
      'Property Analytics',
      'Lead Management'
    ],
    highlighted: false,
    popular: false
  }
];

export default function PropertySubscription() {
  const { user, isLoggedIn, subscribeUser } = useAuth();
  const { getUserProperties } = useProperty();
  const navigate = useNavigate();
  const [userProperties, setUserProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const fetchUserProperties = async () => {
      if (!isLoggedIn || !user?.id) return;
      
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

    fetchUserProperties();
  }, [isLoggedIn, user?.id, getUserProperties]);

  const handleSubscribe = async (planId) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setSelectedPlan(planId);
    
    // Subscribe user
    const success = await subscribeUser(planId);
    
    if (success) {
      // Redirect to checkout
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      navigate('/checkout', { 
        state: { 
          plan,
          type: 'property_subscription',
          from: '/sell' 
        } 
      });
    }
  };

  const handleContinueWithBasic = () => {
    navigate('/sell');
  };

  const getPropertyCount = () => userProperties.length;
  const canListMoreWithBasic = () => getPropertyCount() < 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-6">
            <Crown className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Property Listing Plans</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Choose Your <span className="text-primary">Listing Plan</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            List your properties and reach thousands of potential buyers and renters. 
            Start with our free plan and upgrade as needed.
          </p>

          {/* Current Status */}
          {isLoggedIn && (
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm mb-8">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  Properties Listed: <span className="font-bold text-gray-900">{getPropertyCount()}</span>
                </span>
              </div>
              {!canListMoreWithBasic() && (
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 rounded-full">
                  <Shield className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-bold text-orange-600">Basic Limit Reached</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isPopular = plan.popular;
            const isHighlighted = plan.highlighted;
            const isDisabled = plan.id === 'basic' && !canListMoreWithBasic();
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl border-2 transition-all duration-300 ${
                  isPopular 
                    ? 'border-primary shadow-2xl shadow-primary/20 scale-105' 
                    : isHighlighted
                    ? 'border-primary/50 shadow-xl'
                    : 'border-gray-200 shadow-lg'
                } ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-1'}`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className={`p-8 text-center rounded-t-3xl ${
                  isPopular ? 'bg-gradient-to-br from-primary to-primary/90' : 'bg-gray-50'
                }`}>
                  <h3 className={`text-2xl font-black mb-2 ${
                    isPopular ? 'text-white' : 'text-gray-900'
                  }`}>
                    {plan.name}
                  </h3>
                  
                  <div className="mb-4">
                    <span className={`text-4xl font-black ${
                      isPopular ? 'text-white' : 'text-gray-900'
                    }`}>
                      {plan.priceLabel}
                    </span>
                    {plan.price !== 'Free' && (
                      <span className={`text-sm font-medium ${
                        isPopular ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        /month
                      </span>
                    )}
                  </div>
                  
                  {plan.propertiesLimit > 0 && (
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                      isPopular ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      <Home className="w-3 h-3" />
                      {plan.propertiesLimit} Properties
                    </div>
                  )}
                  {plan.propertiesLimit === -1 && (
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                      isPopular ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      <Zap className="w-3 h-3" />
                      Unlimited
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="p-6">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          isPopular ? 'text-primary' : 'text-green-500'
                        }`} />
                        <span className="text-sm font-medium text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {plan.id === 'basic' ? (
                    <button
                      onClick={handleContinueWithBasic}
                      disabled={isDisabled}
                      className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all ${
                        isDisabled
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg'
                      }`}
                    >
                      {isDisabled ? 'Limit Reached' : 'Continue with Basic'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={selectedPlan === plan.id}
                      className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all ${
                        isPopular
                          ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30'
                          : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg'
                      } ${selectedPlan === plan.id ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      {selectedPlan === plan.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </span>
                      ) : (
                        'Subscribe Now'
                      )}
                    </button>
                  )}
                </div>

                {/* Trust Badge for Premium */}
                {isHighlighted && (
                  <div className="px-6 py-4 bg-gradient-to-r from-primary/10 to-primary/5 border-t border-primary/20">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-primary" />
                      <span className="font-medium text-primary">Best value for regular sellers</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">
            Why Choose Our <span className="text-primary">Property Listing Plans</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Maximum Visibility</h3>
              <p className="text-sm text-gray-600">
                Reach thousands of potential buyers and renters across multiple platforms
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-sm text-gray-600">
                Your property listings are protected with our advanced security features
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Easy Management</h3>
              <p className="text-sm text-gray-600">
                Simple dashboard to manage all your property listings in one place
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Have questions?{' '}
            <button 
              onClick={() => navigate('/contact')}
              className="text-primary font-bold hover:underline"
            >
              Contact our support team
            </button>
          </p>
          <p className="text-xs text-gray-500">
            All plans include basic property listing features. Premium plans offer enhanced visibility and additional tools.
          </p>
        </div>
      </div>
    </div>
  );
}
