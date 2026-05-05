import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProperty } from '../contexts/PropertyContext';
import { billingApi } from '../services/billingApi';
import { 
  Crown, 
  CheckCircle2, 
  ArrowRight, 
  Home, 
  Star, 
  Zap,
  Shield,
  TrendingUp,
  Loader2
} from 'lucide-react';

// Fallback plans if API fails - matching the expected structure
const FALLBACK_PLANS = [
  {
    id: 'owner-simple-sell',
    slug: 'owner-simple-sell',
    name: 'Simple Plan',
    displayName: 'Simple Plan',
    priceLabel: '₹15,000',
    basePrice: 15000,
    billingCycle: 'one_time',
    maxProperties: 1,
    maxListings: null,
    serviceValidityDays: 60,
    features: {
      guaranteedSell: false,
      propertyShowcaseVideo: true,
      propertyListing: true,
      brokerNetworkPromotion: true,
      filteredInquiries: false,
      whatsappMarketing: false,
      negotiationSupport: false,
      siteVisitSupport: false,
      landingPageSupport: false,
      classifiedAds: false,
      relationshipManager: false,
      closingManager: false
    },
    quotaConfig: { properties: 1 },
    isPopular: false,
    isRecommended: false,
    hasGuarantee: false,
    commissionPercent: 2
  },
  {
    id: 'owner-advance-sell',
    slug: 'owner-advance-sell',
    name: 'Advance Plan',
    displayName: 'Advance Plan',
    priceLabel: '₹50,000',
    basePrice: 50000,
    billingCycle: 'one_time',
    maxProperties: 1,
    maxListings: null,
    serviceValidityDays: 120,
    features: {
      guaranteedSell: true,
      propertyShowcaseVideo: true,
      propertyListing: true,
      brokerNetworkPromotion: true,
      filteredInquiries: true,
      whatsappMarketing: true,
      negotiationSupport: true,
      siteVisitSupport: false,
      landingPageSupport: false,
      classifiedAds: false,
      relationshipManager: true,
      closingManager: true
    },
    quotaConfig: { properties: 1 },
    isPopular: true,
    isRecommended: true,
    hasGuarantee: true,
    commissionPercent: 1,
    badgeText: 'Guaranteed Sell'
  },
  {
    id: 'owner-master-sell',
    slug: 'owner-master-sell',
    name: 'Master Plan',
    displayName: 'Master Plan',
    priceLabel: '₹1,00,000',
    basePrice: 100000,
    billingCycle: 'one_time',
    maxProperties: 1,
    maxListings: null,
    serviceValidityDays: 150,
    features: {
      guaranteedSell: true,
      propertyShowcaseVideo: true,
      propertyListing: true,
      brokerNetworkPromotion: true,
      filteredInquiries: true,
      whatsappMarketing: true,
      negotiationSupport: true,
      siteVisitSupport: true,
      landingPageSupport: true,
      classifiedAds: true,
      relationshipManager: true,
      closingManager: true
    },
    quotaConfig: { properties: 1 },
    isPopular: false,
    isRecommended: false,
    hasGuarantee: true,
    commissionPercent: 0,
    badgeText: 'Zero Commission'
  }
];

export default function PropertySubscription() {
  const { user, isLoggedIn, subscribeUser } = useAuth();
  const { getUserProperties } = useProperty();
  const navigate = useNavigate();
  const [userProperties, setUserProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [apiError, setApiError] = useState(null);

  // Fetch plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setApiLoading(true);
        const response = await billingApi.getPlans({ categoryKey: 'property_owner_sell' });
        const apiPlans = response?.plans || response || [];
        
        if (apiPlans.length > 0) {
          // Transform API plans to match component structure
          const transformedPlans = apiPlans.map(plan => ({
            id: plan.id || plan.slug,
            slug: plan.slug,
            name: plan.name || plan.displayName,
            displayName: plan.displayName || plan.name,
            priceLabel: plan.basePrice === 0 ? '₹0' : `₹${plan.basePrice?.toLocaleString('en-IN')}`,
            basePrice: plan.basePrice,
            billingCycle: plan.billingCycle || 'one_time',
            maxProperties: plan.maxProperties ?? plan.quotaConfig?.properties ?? plan.quotaConfig?.maxProperties,
            maxListings: plan.maxListings ?? plan.quotaConfig?.maxListings,
            serviceValidityDays: plan.serviceValidityDays,
            features: plan.features || {},
            quotaConfig: plan.quotaConfig || {},
            isPopular: plan.isPopular || plan.isRecommended,
            isRecommended: plan.isRecommended,
            gstRate: plan.gstRate || 18,
            totalPrice: plan.totalPrice || (plan.basePrice * 1.18),
            hasGuarantee: plan.hasGuarantee,
            commissionPercent: plan.commissionPercent,
            badgeText: plan.badgeText
          }));
          setPlans(transformedPlans);
        } else {
          setPlans(FALLBACK_PLANS);
        }
      } catch (error) {
        console.error('Failed to fetch plans from API:', error);
        setApiError('Using fallback plans due to API error');
        setPlans(FALLBACK_PLANS);
      } finally {
        setApiLoading(false);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchUserProperties = async () => {
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

    fetchUserProperties();
  }, [isLoggedIn, user?.id, getUserProperties]);

  const handleSubscribe = async (planSlug) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setSelectedPlan(planSlug);
    
    // Find the full plan object
    const plan = plans.find(p => p.slug === planSlug || p.id === planSlug);
    
    if (!plan) {
      console.error('Plan not found:', planSlug);
      setSelectedPlan(null);
      return;
    }
    
    // Subscribe user
    try {
      const success = await subscribeUser(planSlug);
      
      if (success) {
        // Redirect to checkout with full plan data from API
        navigate('/checkout', { 
          state: { 
            plan,
            planId: plan.id,
            planSlug: plan.slug,
            categoryKey: 'property_owner_sell',
            type: 'property_subscription',
            from: '/sell' 
          } 
        });
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      setSelectedPlan(null);
    }
  };

  const handleContinueWithBasic = () => {
    navigate('/sell');
  };

  const getPropertyCount = () => userProperties.length;
  const canListMoreWithBasic = () => getPropertyCount() < 1;

  if (loading || apiLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
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

        {apiError && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-yellow-700 text-sm">{apiError}</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const isPopular = plan.isPopular || plan.isRecommended;
            const isHighlighted = plan.isRecommended || plan.isPopular;
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
                    {plan.basePrice > 0 && (
                      <span className={`text-sm font-medium ${
                        isPopular ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        /month
                      </span>
                    )}
                  </div>
                  
                  {plan.maxProperties > 0 && (
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                      isPopular ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      <Home className="w-3 h-3" />
                      {plan.maxProperties} Properties
                    </div>
                  )}
                  {(plan.maxProperties === null || plan.maxProperties === undefined || plan.maxProperties === -1) && (
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
                    {Object.entries(plan.features || {}).slice(0, 6).map(([key, value], index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          isPopular ? 'text-primary' : 'text-green-500'
                        }`} />
                        <span className="text-sm font-medium text-gray-700">
                          {typeof value === 'boolean' 
                            ? `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value ? 'Yes' : 'No'}`
                            : `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`
                          }
                        </span>
                      </li>
                    ))}
                    {plan.serviceValidityDays && (
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          isPopular ? 'text-primary' : 'text-green-500'
                        }`} />
                        <span className="text-sm font-medium text-gray-700">
                          {plan.serviceValidityDays} Days Validity
                        </span>
                      </li>
                    )}
                  </ul>

                  {/* CTA Button */}
                  {plan.basePrice === 0 ? (
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
                      onClick={() => handleSubscribe(plan.slug || plan.id)}
                      disabled={selectedPlan === (plan.slug || plan.id)}
                      className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all ${
                        isPopular
                          ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30'
                          : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg'
                      } ${selectedPlan === (plan.slug || plan.id) ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      {selectedPlan === (plan.slug || plan.id) ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin h-4 w-4" />
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
