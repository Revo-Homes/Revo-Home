import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { billingApi } from '../services/billingApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  Check,
  ChevronDown,
  Star,
  Shield,
  Zap,
  Crown,
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  Headphones,
  FileText,
  Award,
  TrendingUp,
  Building,
  Phone,
  Mail,
  CreditCard,
  Lock,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

// Plan hierarchy for upgrade logic
const PLAN_HIERARCHY = {
  simple: 1,
  advance: 2,
  master: 3,
};

// Normalize any plan name/ID into a lowercase hierarchy key
function normalizePlanKey(value = '') {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/plan/g, '')
    .replace(/[^a-z]/g, '')
    .trim();
}

// Extract current plan key from subscription object
function getCurrentPlanKey(subscription) {
  if (!subscription) return null;

  const possibleValues = [
    subscription.current_plan_slug,
    subscription.current_plan,
    subscription.plan_slug,
    subscription.plan_id,
    subscription.tier,
    subscription.name,
    subscription?.plan?.slug,
    subscription?.plan?.name,
    subscription?.plan?.id,
    subscription?.plan?.displayName,
    subscription.id,
  ];

  for (const value of possibleValues) {
    if (!value) continue;
    const normalized = normalizePlanKey(value);
    if (PLAN_HIERARCHY[normalized]) {
      return normalized;
    }
  }
  return null;
}

// Extract plan key from plan object
function getPlanKey(plan) {
  const possibleValues = [
    plan.slug,
    plan.name,
    plan.displayName,
    plan.id,
  ];

  for (const value of possibleValues) {
    if (!value) continue;
    const normalized = normalizePlanKey(value);
    if (PLAN_HIERARCHY[normalized]) {
      return normalized;
    }
  }
  return null;
}

// Helper: determine plan action based on current subscription
function getPlanAction(plan, currentSubscription) {
  if (!currentSubscription) {
    return { type: 'subscribe', label: 'Subscribe', disabled: false };
  }

  const currentPlanKey = getCurrentPlanKey(currentSubscription);
  const planKey = getPlanKey(plan);

  const currentLevel = PLAN_HIERARCHY[currentPlanKey] || 0;
  const planLevel = PLAN_HIERARCHY[planKey] || 0;

  if (import.meta.env.DEV) {
    console.log({ currentPlanKey, planKey, currentLevel, planLevel });
  }

  // Current plan
  if (currentLevel === planLevel) {
    return { type: 'current', label: 'Current Plan', disabled: true };
  }

  // Lower plan → hide
  if (planLevel < currentLevel) {
    return { type: 'hidden', label: '', disabled: true };
  }

  // Higher plan → upgrade
  if (planLevel > currentLevel) {
    return { type: 'upgrade', label: `Upgrade to ${plan.name}`, disabled: false };
  }

  return { type: 'subscribe', label: 'Subscribe', disabled: false };
}

function includedFeatureList(plan) {
  const raw = plan?.features;
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (raw && typeof raw === 'object' && Array.isArray(raw.included_features)) {
    return raw.included_features.filter(Boolean);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.included_features)) return parsed.included_features.filter(Boolean);
    } catch {
      return [];
    }
  }
  return [];
}

// Skeleton loader
function SubscriptionSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-50">
      {/* Hero Skeleton */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-zinc-900/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center space-y-6">
            <div className="h-12 w-96 mx-auto bg-slate-200 rounded-2xl animate-pulse" />
            <div className="h-6 w-2/3 mx-auto bg-slate-200 rounded-xl animate-pulse" />
            <div className="flex justify-center gap-4">
              <div className="h-8 w-32 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-8 w-32 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-8 w-32 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Current Subscription Card Skeleton */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="h-32 bg-white rounded-3xl border border-slate-200 shadow-sm animate-pulse" />
      </div>

      {/* Plan Cards Skeleton */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 space-y-4">
                <div className="h-8 w-24 bg-slate-200 rounded-xl animate-pulse" />
                <div className="h-12 w-32 bg-slate-200 rounded-xl animate-pulse" />
                <div className="space-y-2">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="h-4 bg-slate-200 rounded-lg animate-pulse" />
                  ))}
                </div>
                <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const { isLoggedIn, openLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFeatures, setExpandedFeatures] = useState({});
  const [expandedFAQ, setExpandedFAQ] = useState({});

  // Enhanced data fetching with current subscription
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch plans and current subscription in parallel
        const [plansResponse, subscriptionResponse] = await Promise.allSettled([
          billingApi.getPlans({ categoryKey: 'property_owner_sell' }),
          billingApi.getCurrentSubscription().catch(() => null)
        ]);

        // Handle plans data
        if (plansResponse.status === 'fulfilled') {
          let plansData = plansResponse.value?.plans || [];

          if (plansData.length === 0) {
            // Fallback to hardcoded data
            plansData = [
              {
                id: 'simple',
                name: 'Simple',
                displayName: 'Simple',
                priceLabel: 'Rs. 15,000 + GST',
                basePrice: 15000,
                totalPrice: 17700,
                service: '60 + 30 Days',
                serviceValidityDays: 60,
                bonusDays: 30,
                features: {
                  guaranteedSell: false,
                  instagramReels: false,
                  propertyShowcaseVideo: true,
                  whatsappMarketing: false,
                  rawInquiries: 'Raw',
                  salesNegotiation: false,
                  propertySiteVisit: false,
                  promotionPortals: true,
                  propertyLandingPage: false,
                  promptReply: true,
                  newspaperAd: false,
                  brokerNetwork: true,
                  propertyListing: true,
                  progressReports: false,
                  relationshipManager: false,
                  closingManager: false,
                  propertyAgreement: true,
                  moneyBackGuarantee: 'NA'
                }
              },
              {
                id: 'advance',
                name: 'Advance',
                displayName: 'Advance',
                priceLabel: 'Rs. 50,000 + GST',
                basePrice: 50000,
                totalPrice: 59000,
                service: '60 + 60 Days',
                serviceValidityDays: 60,
                bonusDays: 60,
                features: {
                  guaranteedSell: true,
                  instagramReels: true,
                  propertyShowcaseVideo: true,
                  whatsappMarketing: true,
                  rawInquiries: 'Filtered',
                  salesNegotiation: true,
                  propertySiteVisit: false,
                  promotionPortals: true,
                  propertyLandingPage: false,
                  promptReply: true,
                  newspaperAd: false,
                  brokerNetwork: true,
                  propertyListing: true,
                  progressReports: true,
                  relationshipManager: true,
                  closingManager: true,
                  propertyAgreement: true,
                  moneyBackGuarantee: 'Included'
                }
              },
              {
                id: 'master',
                name: 'Master',
                displayName: 'Master',
                priceLabel: 'Rs. 1,00,000 + GST',
                basePrice: 100000,
                totalPrice: 118000,
                service: '90 + 60 Days',
                serviceValidityDays: 90,
                bonusDays: 60,
                features: {
                  guaranteedSell: true,
                  instagramReels: true,
                  propertyShowcaseVideo: true,
                  whatsappMarketing: true,
                  rawInquiries: 'Filtered',
                  salesNegotiation: true,
                  propertySiteVisit: true,
                  promotionPortals: true,
                  propertyLandingPage: true,
                  promptReply: true,
                  newspaperAd: true,
                  brokerNetwork: true,
                  propertyListing: true,
                  progressReports: true,
                  relationshipManager: true,
                  closingManager: true,
                  propertyAgreement: true,
                  moneyBackGuarantee: 'Included'
                }
              }
            ];
          }

          const transformedPlans = plansData.map((plan) => {
            const basePrice = Number(plan.basePrice ?? plan.base_price ?? 0);
            const totalPrice = Number(plan.totalPrice ?? plan.total_price ?? basePrice);
            const incl = includedFeatureList(plan);
            return {
              id: plan.id,
              slug: normalizePlanKey(
                plan.slug || plan.name || plan.displayName
              ),
              categoryKey: plan.categoryKey || plan.category_key,
              name: plan.displayName || plan.name,
              displayName: plan.displayName || plan.name,
              priceLabel: basePrice === 0 ? 'Free' : `Rs. ${basePrice.toLocaleString('en-IN')} + GST`,
              basePrice,
              totalPrice,
              gstAmount: Number(plan.gstAmount ?? plan.gst_amount ?? 0),
              gstRate: Number(plan.gstRate ?? plan.gst_rate ?? 18),
              billingCycle: plan.billingCycle || plan.billing_cycle || 'one_time',
              service: `${plan.serviceValidityDays ?? plan.service_validity_days ?? 0} + ${plan.bonusDays ?? plan.bonus_days ?? 0} Days`,
              serviceValidityDays: plan.serviceValidityDays ?? plan.service_validity_days ?? 0,
              bonusDays: plan.bonusDays ?? plan.bonus_days ?? 0,
              includedFeatures: incl,
              features: plan.features || {},
              hasGuarantee: plan.hasGuarantee ?? plan.has_guarantee,
              commissionPercent: plan.commissionPercent ?? plan.commission_percent,
              badgeText: plan.badgeText ?? plan.badge_text,
              isRecommended: plan.isRecommended ?? plan.is_recommended,
            };
          });
          setPlans(transformedPlans);
        } else {
          throw new Error('Failed to fetch plans');
        }

        // Handle current subscription — try multiple sources
        let subscriptionData = null;
        if (subscriptionResponse.status === 'fulfilled') {
          subscriptionData = subscriptionResponse.value;
        }
        // If getCurrentSubscription returned null/404, try getActiveSubscription
        if (!subscriptionData) {
          try {
            const activeSub = await billingApi.getActiveSubscription();
            subscriptionData = activeSub;
          } catch (e) {
            // silent fail
          }
        }
        // Final fallback: check localStorage cached subscription
        if (!subscriptionData) {
          try {
            const cached = localStorage.getItem('revo_current_subscription');
            if (cached) subscriptionData = JSON.parse(cached);
          } catch (e) {
            // ignore parse error
          }
        }
        if (subscriptionData) {
          // Normalize: if API returns array, take first item; if nested under 'subscription', unwrap it
          let normalized = subscriptionData;
          if (Array.isArray(normalized)) normalized = normalized[0] || null;
          if (normalized?.subscription) normalized = normalized.subscription;
          if (normalized) {
            setCurrentSubscription(normalized);
            if (import.meta.env.DEV) {
              console.log('[SubscriptionPage] Detected subscription:', normalized);
            }
          }
        }

      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err?.message || 'Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubscribe = (planId) => {
    if (!isLoggedIn) return openLogin();
    const selectedPlan = plans.find(
      (p) => String(p.id) === String(planId) || p.slug === planId
    );
    if (!selectedPlan) return;

    const params = new URLSearchParams(location.search);
    const from = params.get('from') || location.state?.from;
    const returnTo = location.state?.returnTo;
    const savedStep = location.state?.savedStep;

    navigate('/checkout', {
      state: {
        plan: selectedPlan,
        categoryKey: selectedPlan.categoryKey || selectedPlan.category_key || 'property_owner_sell',
        from,
        returnTo,
        savedStep
      }
    });
  };

  // Feature comparison data
  const featureComparison = useMemo(() => [
    {
      category: 'Marketing',
      icon: <Zap className="h-5 w-5" />,
      features: [
        { name: 'Instagram Reels', simple: false, advance: true, master: true },
        { name: 'Property Showcase Video', simple: true, advance: true, master: true },
        { name: 'WhatsApp Marketing', simple: false, advance: true, master: true },
        { name: 'Newspaper Classified Ad', simple: false, advance: false, master: true },
        { name: 'Property Landing Page', simple: false, advance: false, master: true },
      ]
    },
    {
      category: 'Lead Generation',
      icon: <Users className="h-5 w-5" />,
      features: [
        { name: 'Raw Inquiries', simple: 'Raw', advance: 'Filtered', master: 'Filtered' },
        { name: 'Prompt Reply to Inquiries', simple: true, advance: true, master: true },
        { name: 'Privacy of Your Phone Number', simple: true, advance: true, master: true },
        { name: 'Freedom from Irritating Calls', simple: true, advance: true, master: true },
      ]
    },
    {
      category: 'Brokerage Network',
      icon: <Building className="h-5 w-5" />,
      features: [
        { name: 'Promotion to Broker Network', simple: true, advance: true, master: true },
        { name: 'Property Listing on Our Portal', simple: true, advance: true, master: true },
        { name: 'Promotion on Real Estate Portals', simple: true, advance: true, master: true },
      ]
    },
    {
      category: 'Deal Closure',
      icon: <Award className="h-5 w-5" />,
      features: [
        { name: 'Sales Negotiation Support', simple: false, advance: true, master: true },
        { name: 'Dedicated Closing Assistance', simple: false, advance: true, master: true },
        { name: 'Property Site Visit Support', simple: false, advance: false, master: true },
        { name: 'Property Agreement Service', simple: true, advance: true, master: true },
      ]
    },
    {
      category: 'Enterprise Support',
      icon: <Headphones className="h-5 w-5" />,
      features: [
        { name: 'Relationship Manager', simple: false, advance: true, master: true },
        { name: 'Progress Reports', simple: false, advance: true, master: true },
        { name: 'Closing Manager', simple: false, advance: true, master: true },
      ]
    },
    {
      category: 'Guarantee & Protection',
      icon: <Shield className="h-5 w-5" />,
      features: [
        { name: 'Guaranteed Sell', simple: false, advance: true, master: true },
        { name: 'Money-Back Guarantee', simple: 'NA', advance: 'Included', master: 'Included' },
        { name: 'Dedicated closing assistance', simple: false, advance: true, master: true },
      ]
    }
  ], []);

  // FAQ data
  const faqData = [
    {
      question: 'How does plan activation work?',
      answer: 'Once you complete the payment, your plan is activated immediately. You\'ll receive a confirmation email with all the details and access to your dashboard.'
    },
    {
      question: 'Can I upgrade later?',
      answer: 'Yes! You can upgrade to any higher plan at any time. The upgrade is prorated and you only pay the difference for the remaining period.'
    },
    {
      question: 'Is GST included?',
      answer: 'All prices mentioned are exclusive of GST. 18% GST is added at checkout. The total amount including GST will be shown before payment.'
    },
    {
      question: 'What happens after payment?',
      answer: 'After successful payment, you\'ll get immediate access to all features of your chosen plan. Our team will contact you within 24 hours to kickstart your property marketing.'
    },
    {
      question: 'Is support included?',
      answer: 'Yes! All plans include email support. Advance and Master plans include a dedicated relationship manager and priority support channels.'
    },
    {
      question: 'How does guaranteed sales work?',
      answer: 'Our guaranteed sell plans ensure your property gets sold within the specified period, or we provide additional marketing services until it sells, subject to terms and conditions.'
    }
  ];

  if (loading) {
    return <SubscriptionSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Unable to Load Plans</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-50">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-zinc-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-7xl mx-auto px-6 py-24 text-center"
        >
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
                Scale Your Property Sales With{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Premium Growth Plans
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                End-to-end marketing, lead generation, brokerage distribution, negotiation support, and deal closure solutions for real estate projects.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {[
                { icon: <Building className="h-5 w-5" />, text: 'Trusted by Builders' },
                { icon: <Shield className="h-5 w-5" />, text: 'Guaranteed Sales Support' },
                { icon: <Zap className="h-5 w-5" />, text: 'Enterprise CRM Enabled' }
              ].map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/20 rounded-full shadow-sm"
                >
                  <div className="text-blue-600">{badge.icon}</div>
                  <span className="text-sm font-medium text-slate-700">{badge.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Current Subscription Status Card */}
      {currentSubscription && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-7xl mx-auto px-6 mb-12"
        >
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-emerald-900">Current Active Plan</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-emerald-900 capitalize">
                    {getCurrentPlanKey(currentSubscription) ||
                      currentSubscription?.plan?.name ||
                      currentSubscription?.name ||
                      'Active'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-emerald-700">
                    {(() => {
                      const expiry = currentSubscription.expires_at || currentSubscription.end_date || currentSubscription.expiry_date;
                      return expiry ? (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Valid until {new Date(expiry).toLocaleDateString()}
                        </span>
                      ) : null;
                    })()}
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium capitalize">
                      {typeof currentSubscription.status === 'string' ? currentSubscription.status : 'active'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-emerald-700 mb-1">Ready to upgrade?</p>
                <p className="text-xs text-emerald-600">Unlock more features and benefits</p>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Plan Cards Grid */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {plans.map((plan, index) => {
            const action = getPlanAction(plan, currentSubscription);
            const isMaster = plan.id === 'master';
            const isCurrent = action.type === 'current';
            const topFeatures = [
              plan.features?.guaranteedSell && 'Guaranteed Sell',
              plan.features?.relationshipManager && 'Dedicated Manager',
              plan.features?.instagramReels && 'Instagram Reels',
              plan.features?.propertySiteVisit && 'Site Visit Support',
              plan.features?.propertyLandingPage && 'Property Landing Page',
              plan.features?.newspaperAd && 'Newspaper Classified Ad',
            ].filter(Boolean).slice(0, 4);

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
                className={`
                  relative rounded-3xl border overflow-hidden transition-all duration-300
                  ${isMaster
                    ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-2xl'
                    : isCurrent
                      ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-lg'
                      : 'bg-white border-slate-200 shadow-sm hover:shadow-lg'
                  }
                `}
              >
                {isMaster && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold">
                      <Crown className="h-3 w-3" />
                      Most Powerful
                    </div>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold">
                      <CheckCircle2 className="h-3 w-3" />
                      Current Plan
                    </div>
                  </div>
                )}
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <h3 className={`text-2xl font-bold ${isMaster ? 'text-white' : 'text-slate-900'}`}>
                      {plan.name}
                    </h3>
                    <div className="space-y-1">
                      <p className={`text-3xl font-bold ${isMaster ? 'text-white' : 'text-slate-900'}`}>
                        {plan.priceLabel}
                      </p>
                      <p className={`text-sm ${isMaster ? 'text-slate-300' : 'text-slate-600'}`}>
                        {plan.service} validity
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {topFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className={`h-4 w-4 ${isMaster ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-sm ${isMaster ? 'text-slate-200' : 'text-slate-700'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  {action.type !== 'hidden' && action.label && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={action.disabled}
                      aria-label={action.label}
                      className={`
                        w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-200
                        ${action.type === 'current'
                          ? 'border-2 border-emerald-600 text-emerald-600 bg-emerald-50 cursor-not-allowed'
                          : action.type === 'upgrade'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }
                        ${action.disabled ? 'cursor-not-allowed opacity-60' : ''}
                      `}
                    >
                      {action.label}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Feature Comparison */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Compare Features Across Plans
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Detailed comparison of all features included in each plan
            </p>
          </div>
          <div className="space-y-4">
            {featureComparison.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * categoryIndex }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFeatures(prev => ({
                    ...prev,
                    [category.category]: !prev[category.category]
                  }))}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  aria-expanded={!!expandedFeatures[category.category]}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {category.category}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedFeatures[category.category] ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                <AnimatePresence>
                  {expandedFeatures[category.category] && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-slate-200"
                    >
                      <div className="p-6 space-y-4">
                        {category.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="grid grid-cols-4 gap-4 items-center py-3 border-b border-slate-100 last:border-0">
                            <div className="text-sm font-medium text-slate-900">
                              {feature.name}
                            </div>
                            {['simple', 'advance', 'master'].map((tier) => (
                              <div key={tier} className="text-center">
                                {typeof feature[tier] === 'boolean' ? (
                                  feature[tier] ? (
                                    <Check className="h-5 w-5 text-emerald-600 mx-auto" />
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )
                                ) : (
                                  <span className="text-sm text-slate-700">{feature[tier]}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Your Investment is Protected</h2>
              <p className="text-slate-300 leading-relaxed">
                We stand behind our service with comprehensive guarantees and enterprise-grade security measures to ensure your peace of mind.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <Shield className="h-5 w-5" />, title: '50% Money-Back Guarantee', desc: 'Get refunded if we don\'t deliver results' },
                  { icon: <Lock className="h-5 w-5" />, title: 'Secure Payment Processing', desc: 'Bank-level security for all transactions' },
                  { icon: <FileText className="h-5 w-5" />, title: 'Digital Agreement Protection', desc: 'Legally binding service contracts' },
                  { icon: <Users className="h-5 w-5" />, title: 'Dedicated Relationship Manager', desc: 'Personal support throughout your journey' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Guarantee Terms</h3>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>50% refund on basic package if property remains unsold despite our efforts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Minimum 30 days service provided even if client withdraws</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Refunds processed within 15 working days of eligibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Full transparency with no hidden terms or conditions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Everything you need to know about our subscription plans
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFAQ(prev => ({
                    ...prev,
                    [index]: !prev[index]
                  }))}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                  aria-expanded={!!expandedFAQ[index]}
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform flex-shrink-0 ${expandedFAQ[index] ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                <AnimatePresence>
                  {expandedFAQ[index] && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-slate-200"
                    >
                      <div className="p-6">
                        <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Sticky Mobile CTA */}
      {!currentSubscription && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-50"
        >
          <button
            onClick={() => handleSubscribe('simple')}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
          >
            Get Started with Simple Plan
          </button>
        </motion.div>
      )}
    </div>
  );
}
