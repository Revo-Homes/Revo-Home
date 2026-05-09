import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { billingApi } from '../services/billingApi';
import { Loader2, AlertCircle, Check, X, ShieldCheck, Sparkles, Crown, Star, Clock, ChevronDown, ArrowRight, Info, FileText, Percent } from 'lucide-react';

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

const PLAN_ORDER = {
  simple: 1,
  advance: 2,
  master: 3,
  33: 1,
  34: 2,
  35: 3,
  'owner-simple-sell': 1,
  'owner-advance-sell': 2,
  'owner-master-sell': 3,
};

function planTier(planOrId) {
  const id = String(planOrId?.id ?? planOrId?.slug ?? planOrId).toLowerCase();
  return PLAN_ORDER[id] || 0;
}

export default function SubscriptionPage() {
  const { subscribeUser, isLoggedIn, openLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadWarning, setLoadWarning] = useState(null);
  const [activeSub, setActiveSub] = useState(null);

  useEffect(() => {
    const fetchActive = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await billingApi.getActiveSubscription(null, { categoryKey: 'property_owner_sell' });
        const sub = res?.data?.subscription || res?.subscription || res?.data || res;
        if (sub?.planId || sub?.id) setActiveSub(sub);
      } catch (e) {
        console.warn('Could not fetch active subscription:', e);
      }
    };
    fetchActive();
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setLoadWarning(null);
        let plansData = [];
        try {
          const response = await billingApi.getPlans({ categoryKey: 'property_owner_sell' });
          plansData = response?.plans || [];
        } catch (fetchErr) {
          console.warn('Plans API failed, using fallback table:', fetchErr);
          setLoadWarning(fetchErr?.message || 'Could not reach billing API — showing reference plans.');
        }

        if (plansData.length === 0) {
          // Fallback to hardcoded data if API fails
          setPlans([
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
                commission: '2%',
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
                commission: '1%',
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
                commission: '0%',
                moneyBackGuarantee: 'Included'
              }
            }
          ]);

          setFeatures([
            { label: 'Service Validity in Days*', values: ['60 + 30', '60 + 60', '90 + 60'] },
            { label: 'Guaranteed Sell', values: ['No', 'Yes', 'Yes'] },
            { label: 'Paid Upfront', values: ['Yes', 'Yes', 'Yes'] },
            { label: 'Instagram Reels', values: ['No', 'Yes', 'Yes'] },
            { label: 'Privacy of Your Phone Number', values: ['Yes', 'Yes', 'Yes'] },
            { label: 'Property Showcase Video', values: ['Yes', 'Yes', 'Yes'] },
            { label: 'WhatsApp Marketing', values: ['No', 'Yes', 'Yes'] },
            { label: 'Raw Inquiries', values: ['Raw', 'Filtered', 'Filtered'] },
            { label: 'Sales Negotiation and Closure Support', values: ['No', 'Yes', 'Yes'] },
            { label: 'Property Site Visit Support', values: ['No', 'No', 'Yes'] },
            { label: 'Promotion on Real Estate Portals', values: ['Yes', 'Yes', 'Yes'] },
            { label: 'Property Landing Page', values: ['No', 'No', 'Yes'] },
            { label: 'Prompt Reply to Inquiries', values: ['Yes', 'Yes', 'Yes'] },
            { label: 'Newspaper Classified Ad', values: ['No', 'No', 'Yes'] },
            { label: 'Promotion to Broker Network', values: ['Yes', 'Yes', 'Yes'] },
            { label: 'Property Listing on Our Portal', values: ['Yes', 'Yes', 'Yes'] },
            { label: 'Progress Reports', values: ['No', 'Yes', 'Yes'] },
            { label: 'Freedom from Irritating Phone Calls', values: ['Yes', 'Yes', 'Yes'] },
            { label: 'Relationship Manager', values: ['No', 'Yes', 'Yes'] },
            { label: 'Closing Manager^', values: ['No', 'Yes', 'Yes'] },
            { label: 'Property Agreement Service', values: ['Yes', 'Yes', 'Yes'] },
            { label: 'Commission on Closure', values: ['2%', '1%', '0%'] },
            { label: 'Money-Back Guarantee#', values: ['NA', 'Included', 'Included'] },
          ]);
        } else {
          const transformedPlans = plansData.map((plan) => {
            const basePrice = Number(plan.basePrice ?? plan.base_price ?? 0);
            const totalPrice = Number(plan.totalPrice ?? plan.total_price ?? basePrice);
            const incl = includedFeatureList(plan);
            return {
              id: plan.id,
              slug: plan.slug,
              name: plan.displayName || plan.name,
              displayName: plan.displayName || plan.name,
              priceLabel:
                basePrice === 0 ? 'Free' : `Rs. ${basePrice.toLocaleString('en-IN')} + GST`,
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

          const maxRows = Math.max(
            ...transformedPlans.map((p) => (p.includedFeatures?.length ? p.includedFeatures.length : 0)),
            1
          );
          const transformedFeatures = Array.from({ length: maxRows }, (_, rowIdx) => ({
            label: `Included ${rowIdx + 1}`,
            values: transformedPlans.map((p) => p.includedFeatures[rowIdx] || '—'),
          }));
          setFeatures(transformedFeatures);
        }
      } catch (err) {
        console.error('Failed to fetch plans:', err);
        setLoadWarning(err?.message || 'Failed to load plans.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = (planId) => {
    if (!isLoggedIn) return openLogin();
    const selectedPlan = plans.find(
      (p) => String(p.id) === String(planId) || p.slug === planId
    );
    if (!selectedPlan) return;

    // Pass from parameter to checkout
    const params = new URLSearchParams(location.search);
    const from = params.get('from') || location.state?.from;

    // Pass returnTo state if coming from builder form
    const returnTo = location.state?.returnTo;
    const savedStep = location.state?.savedStep;

    navigate('/checkout', {
      state: {
        plan: selectedPlan,
        from,
        returnTo,
        savedStep
      }
    });
  };

  const isCurrentPlan = (planId) => activeSub && String(activeSub.planId) === String(planId);
  const activeTier = planTier(activeSub?.plan);
  const canSubscribe = (planId) => {
    if (!activeSub) return true;
    const targetTier = planTier(plans.find((p) => String(p.id) === String(planId) || p.slug === planId));
    return targetTier > activeTier;
  };

  const getCardHighlights = (plan, planIndex) => {
    if (plan.includedFeatures && plan.includedFeatures.length > 0) {
      return plan.includedFeatures.slice(0, 6).map((f) => ({ label: f, value: true, isCheck: true }));
    }
    const priority = [
      'Guaranteed Sell',
      'Instagram Reels',
      'Property Showcase Video',
      'WhatsApp Marketing',
      'Sales Negotiation and Closure Support',
      'Property Site Visit Support',
      'Property Landing Page',
      'Newspaper Classified Ad',
      'Relationship Manager',
      'Closing Manager^',
      'Progress Reports',
      'Commission on Closure',
      'Money-Back Guarantee#',
      'Promotion on Real Estate Portals',
      'Property Listing on Our Portal',
      'Property Agreement Service',
      'Prompt Reply to Inquiries'
    ];
    const out = [];
    for (const label of priority) {
      const row = features.find((f) => f.label === label);
      if (row) {
        const raw = row.values[planIndex];
        const val = String(raw ?? '').trim();
        if (val === 'Yes' || val === 'Included' || val === 'Filtered' || val.endsWith('%')) {
          out.push({ label, value: raw, isCheck: true });
          if (out.length >= 6) break;
        }
      }
    }
    return out;
  };

  const renderCell = (val) => {
    const str = String(val ?? '').trim();
    if (str === 'Yes' || str === 'Included' || str === 'Filtered') {
      return (
        <span className="inline-flex items-center justify-center gap-1.5 text-emerald-600 font-semibold">
          <Check className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">{val}</span>
        </span>
      );
    }
    if (str === 'No' || str === 'NA') {
      return (
        <span className="inline-flex items-center justify-center gap-1.5 text-gray-300">
          <X className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline text-gray-400">{val}</span>
        </span>
      );
    }
    return <span className="text-gray-700 font-medium">{val}</span>;
  };

  const [expandedMobile, setExpandedMobile] = useState({});
  const toggleMobile = (id) => setExpandedMobile((p) => ({ ...p, [id]: !p[id] }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-red-500" />
          <p className="mt-5 text-gray-400 text-lg">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">

      {/* ===== HERO HEADER ===== */}
      <div className="relative bg-[#0b0f1a] overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm text-gray-300 mb-6 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span>No hidden fees • Transparent pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Premium</span> Plan
          </h1>
          <p className="mt-5 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Complete marketing and sales solution for real estate projects. Select the plan that fits your ambitions.
          </p>
        </div>
      </div>

      {/* ===== WARNING BANNER ===== */}
      {loadWarning ? (
        <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200/60 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <span>{loadWarning}</span>
          </div>
        </div>
      ) : null}

      {/* ===== DESKTOP PRICING CARDS ===== */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 mt-16 mb-20">
        <div className="grid grid-cols-3 gap-6 items-start">
          {plans.map((plan, pi) => {
            const isRecommended = plan.isRecommended || plan.id === 'advance' || plan.name === 'Advance';
            const isPremium = plan.id === 'master' || plan.name === 'Master';
            const current = isCurrentPlan(plan.id);
            const highlights = getCardHighlights(plan, pi);

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl border transition-all duration-300 hover:translate-y-[-4px] ${isPremium
                    ? 'bg-[#0f172a] border-gray-700 shadow-2xl shadow-black/30 scale-105 z-10'
                    : isRecommended
                      ? 'bg-white border-red-200 shadow-xl shadow-red-500/10'
                      : 'bg-white border-gray-200/80 shadow-lg'
                  }`}
              >
                {/* Badge */}
                {isRecommended && !isPremium && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold shadow-lg shadow-red-500/25">
                      <Star className="h-3.5 w-3.5 fill-white" />
                      RECOMMENDED
                    </div>
                  </div>
                )}
                {isPremium && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-500/25">
                      <Crown className="h-3.5 w-3.5" />
                      PREMIUM
                    </div>
                  </div>
                )}
                {current && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                      CURRENT PLAN
                    </span>
                  </div>
                )}

                {/* Card Header */}
                <div className={`p-8 text-center ${isPremium ? 'text-white' : ''}`}>
                  <h3 className={`text-2xl font-bold ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                    {plan.displayName || plan.name}
                  </h3>
                  <div className="mt-5">
                    <span className={`text-4xl font-black ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                      {plan.priceLabel}
                    </span>
                  </div>
                  <p className={`mt-2 text-sm font-medium ${isPremium ? 'text-gray-400' : 'text-gray-500'}`}>
                    Excluding GST
                  </p>
                  <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${isPremium ? 'bg-white/10 text-amber-300' : 'bg-red-50 text-red-700'
                    }`}>
                    <Clock className="h-4 w-4" />
                    {plan.service}
                  </div>
                </div>

                {/* Divider */}
                <div className={`mx-6 h-px ${isPremium ? 'bg-gray-700' : 'bg-gray-100'}`} />

                {/* Features */}
                <div className="p-8">
                  <p className={`text-xs font-bold uppercase tracking-wider mb-5 ${isPremium ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                    Key Features
                  </p>
                  <ul className="space-y-4">
                    {highlights.map((h, hi) => (
                      <li key={hi} className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isPremium ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                          <Check className="h-3 w-3" />
                        </div>
                        <span className={`text-sm ${isPremium ? 'text-gray-300' : 'text-gray-600'}`}>
                          {h.label}
                          <span className="ml-1 font-semibold">{h.value !== true ? `: ${h.value}` : ''}</span>
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-8">
                    {current ? (
                      <button
                        disabled
                        className={`w-full py-3.5 rounded-xl font-bold text-sm border-2 ${isPremium
                            ? 'border-gray-600 text-gray-400 bg-transparent'
                            : 'border-gray-200 text-gray-400 bg-gray-100'
                          }`}
                      >
                        Current Plan
                      </button>
                    ) : canSubscribe(plan.id) ? (
                      <button
                        onClick={() => handleSubscribe(plan.id)}
                        className={`group w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] ${isPremium
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-500/20 hover:shadow-amber-500/30'
                            : 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/20 hover:shadow-red-500/30'
                          }`}
                      >
                        <span className="inline-flex items-center justify-center gap-2">
                          {isPremium ? 'Upgrade to Master' : 'Subscribe Now'}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className={`w-full py-3.5 rounded-xl font-bold text-sm border-2 ${isPremium
                            ? 'border-gray-600 text-gray-400 bg-transparent'
                            : 'border-gray-200 text-gray-400 bg-gray-100'
                          }`}
                      >
                        Included
                      </button>
                    )}
                  </div>

                  {/* Trust signal */}
                  {isRecommended && !current && (
                    <p className="mt-3 text-center text-xs text-gray-400 font-medium">
                      Most chosen plan by property owners
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== MOBILE PRICING CARDS ===== */}
      <div className="lg:hidden max-w-md mx-auto px-4 mt-10 space-y-8 pb-10">
        {plans.map((plan, pi) => {
          const isRecommended = plan.isRecommended || plan.id === 'advance' || plan.name === 'Advance';
          const isPremium = plan.id === 'master' || plan.name === 'Master';
          const current = isCurrentPlan(plan.id);
          const expanded = !!expandedMobile[plan.id];
          const highlights = getCardHighlights(plan, pi);

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl border overflow-hidden transition-all duration-300 ${isPremium
                  ? 'bg-[#0f172a] border-gray-700 shadow-2xl'
                  : isRecommended
                    ? 'bg-white border-red-200 shadow-xl'
                    : 'bg-white border-gray-200/80 shadow-lg'
                }`}
            >
              {isRecommended && !isPremium && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold shadow-md">
                    <Star className="h-3 w-3 fill-white" />
                    RECOMMENDED
                  </div>
                </div>
              )}
              {isPremium && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold shadow-md">
                    <Crown className="h-3 w-3" />
                    PREMIUM
                  </div>
                </div>
              )}

              <div className={`p-6 text-center ${isPremium ? 'text-white' : ''}`}>
                <h3 className={`text-2xl font-bold ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                  {plan.displayName || plan.name}
                </h3>
                <div className="mt-4">
                  <span className={`text-3xl font-black ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                    {plan.priceLabel}
                  </span>
                </div>
                <p className={`mt-1 text-xs font-medium ${isPremium ? 'text-gray-400' : 'text-gray-500'}`}>
                  Excluding GST
                </p>
                <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${isPremium ? 'bg-white/10 text-amber-300' : 'bg-red-50 text-red-700'
                  }`}>
                  <Clock className="h-3.5 w-3.5" />
                  {plan.service}
                </div>
                {current && (
                  <div className="mt-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
                      CURRENT PLAN
                    </span>
                  </div>
                )}
              </div>

              <div className={`mx-5 h-px ${isPremium ? 'bg-gray-700' : 'bg-gray-100'}`} />

              {/* Quick highlights */}
              <div className="p-5">
                <ul className="space-y-3">
                  {highlights.slice(0, expanded ? highlights.length : 4).map((h, hi) => (
                    <li key={hi} className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isPremium ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                        <Check className="h-3 w-3" />
                      </div>
                      <span className={`text-sm ${isPremium ? 'text-gray-300' : 'text-gray-600'}`}>
                        {h.label}
                        <span className="ml-1 font-semibold">{h.value !== true ? `: ${h.value}` : ''}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                {highlights.length > 4 && (
                  <button
                    onClick={() => toggleMobile(plan.id)}
                    className={`mt-4 flex items-center gap-1 text-xs font-semibold ${isPremium ? 'text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    {expanded ? 'Show less' : `Show all ${highlights.length} features`}
                    <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </button>
                )}

                <div className="mt-6">
                  {current ? (
                    <button
                      disabled
                      className={`w-full py-3.5 rounded-xl font-bold text-sm border-2 ${isPremium
                          ? 'border-gray-600 text-gray-400 bg-transparent'
                          : 'border-gray-200 text-gray-400 bg-gray-100'
                        }`}
                    >
                      Current Plan
                    </button>
                  ) : canSubscribe(plan.id) ? (
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-300 active:scale-[0.98] ${isPremium
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                    >
                      {isPremium ? 'Upgrade to Master' : 'Subscribe Now'}
                    </button>
                  ) : (
                    <button
                      disabled
                      className={`w-full py-3.5 rounded-xl font-bold text-sm border-2 ${isPremium
                          ? 'border-gray-600 text-gray-400 bg-transparent'
                          : 'border-gray-200 text-gray-400 bg-gray-100'
                        }`}
                    >
                      Included
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== FEATURE COMPARISON TABLE ===== */}
      <div className="max-w-7xl mx-auto px-4 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Detailed Comparison</h2>
          <p className="mt-2 text-gray-500">Everything you need to know about our plans</p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-gray-200/80 shadow-lg bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0b0f1a] text-white">
                <th className="sticky left-0 z-10 bg-[#0b0f1a] p-5 text-left text-base font-bold border-r border-white/10 min-w-[260px]">
                  Features / Inclusions
                </th>
                {plans.map((p) => (
                  <th key={p.id} className="p-5 text-center min-w-[180px] border-l border-white/10">
                    <div className="text-lg font-bold">{p.displayName || p.name}</div>
                    <div className="mt-1 text-xs text-gray-400 font-medium">{p.priceLabel}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr
                  key={i}
                  className={`border-t border-gray-100 transition-colors ${i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'} hover:bg-red-50/30`}
                >
                  <td className="sticky left-0 z-10 bg-white/95 backdrop-blur-sm p-5 font-semibold text-gray-800 border-r border-gray-100 min-w-[260px]">
                    {f.label}
                  </td>
                  {f.values.map((v, idx) => (
                    <td key={idx} className="p-5 text-center border-l border-gray-100 min-w-[180px]">
                      {renderCell(v)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* CTA Row */}
              <tr className="border-t border-gray-200 bg-gray-50/80">
                <td className="sticky left-0 z-10 bg-gray-50/95 backdrop-blur-sm p-5 font-bold text-gray-900 border-r border-gray-200">
                  Get Started
                </td>
                {plans.map((p) => {
                  const current = isCurrentPlan(p.id);
                  const canSub = canSubscribe(p.id);
                  return (
                    <td key={p.id} className="p-5 text-center border-l border-gray-200 min-w-[180px]">
                      {current ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-200">
                          <Check className="h-4 w-4" /> Active
                        </span>
                      ) : canSub ? (
                        <button
                          onClick={() => handleSubscribe(p.id)}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                          Subscribe
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-400 text-sm font-bold border border-gray-200">
                          —
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== FOOTNOTES ===== */}
      <div className="max-w-5xl mx-auto px-4 mb-16">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex gap-4 p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">Pricing & GST</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Service validity includes additional 30 days if 100% advance is provided. All prices exclude GST. GST charged at 18%.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">Payment Terms</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Minimum 50% advance required to start services. Remaining 50% to be paid within next 30 days. Part payments are not eligible for money-back guarantee.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">Service Extension</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Additional 30/60 days of services is only included for 100% advance payment cases.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">Agreement & Support</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Digital agreement will be signed detailing services and payment commitments. Closing Expert/Manager helps in end-to-end deal closing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MONEY BACK ===== */}
      <div className="max-w-5xl mx-auto px-4 mb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-8 md:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-extrabold text-gray-900">50% Money-Back Guarantee</h3>
                <p className="text-sm text-emerald-700 font-medium mt-0.5">Your investment is protected</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-600">
                  <Check className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                  <span>Eligible for 50% refund on basic package amount (excluding GST) only if: full 100% advance is paid, and either the client withdraws within 30 days or the property remains unsold for guaranteed sales plans despite our full efforts.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-600">
                  <Check className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                  <span>If client postpones or withdraws, minimum 30 days of service will still be provided.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-600">
                  <Check className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                  <span>Refunds processed within 15 working days from date of eligibility confirmation.</span>
                </li>
              </ul>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-600">
                  <X className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                  <span>Non-refund conditions: client sells independently or via external reference; transaction fails due to legal, financial, or personal reasons not attributable to our services.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-600">
                  <X className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                  <span>In non-refund cases, initial 50% payment is non-refundable and balance will not be demanded.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}