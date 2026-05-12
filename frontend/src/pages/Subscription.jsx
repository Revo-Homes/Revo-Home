import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronUp,
  Target,
  Sparkles,
  ShieldCheck,
  Play,
  Briefcase,
  Smartphone,
  Globe,
  Share2,
  PieChart,
  MessageSquare
} from 'lucide-react';

// --- Constants & Data ---

const PLAN_HIERARCHY = {
  simple: 1,
  basic: 1,
  advance: 2,
  advanced: 2,
  pro: 2,
  master: 3,
  elite: 3,
  luxury: 3,
  enterprise: 3
};

const PLAN_TAGLINES = {
  simple: "Perfect for independent property sellers",
  advance: "Most preferred plan for faster deal closure",
  master: "Full-service enterprise property selling solution"
};

const PLAN_HIGHLIGHTS = {
  simple: ["Direct inquiry access", "Portal promotion", "Property showcase support"],
  advance: ["Guaranteed sales support", "Filtered buyer leads", "Dedicated manager"],
  master: ["Zero commission closure", "Broker network amplification", "Priority deal handling"]
};

const FEATURE_CATEGORIES = [
  {
    name: "Marketing",
    features: [
      { id: "insta_reels", name: "Instagram Reels", simple: false, advance: true, master: true, badge: "NEW" },
      { id: "whatsapp_mkt", name: "WhatsApp Marketing", simple: false, advance: true, master: true, badge: "POPULAR" },
      { id: "prop_video", name: "Property Showcase Video", simple: true, advance: true, master: true },
      { id: "newspaper_ad", name: "Newspaper Classified Ad", simple: false, advance: false, master: true },
      { id: "landing_page", name: "Property Landing Page", simple: false, advance: false, master: true },
    ]
  },
  {
    name: "Lead Management",
    features: [
      { id: "inquiries", name: "Lead Quality", simple: "Raw", advance: "Filtered", master: "Filtered" },
      { id: "privacy", name: "Phone Number Privacy", simple: true, advance: true, master: true },
      { id: "spam_free", name: "Freedom from Spam Calls", simple: true, advance: true, master: true, badge: "MOST LOVED" },
    ]
  },
  {
    name: "Sales Support",
    features: [
      { id: "negotiation", name: "Sales Negotiation Support", simple: false, advance: true, master: true },
      { id: "site_visits", name: "Site Visit Support", simple: false, advance: false, master: true },
      { id: "agreement", name: "Legal Agreement Support", simple: true, advance: true, master: true },
    ]
  },
  {
    name: "Enterprise Support",
    features: [
      { id: "rel_manager", name: "Relationship Manager", simple: false, advance: true, master: true, badge: "PREMIUM" },
      { id: "closing_manager", name: "Closing Manager", simple: false, advance: true, master: true },
      { id: "progress_reports", name: "Weekly Progress Reports", simple: false, advance: true, master: true },
    ]
  },
  {
    name: "Guarantees",
    features: [
      { id: "guaranteed_sell", name: "Guaranteed Sell", simple: false, advance: true, master: true, badge: "LIMITED" },
      { id: "money_back", name: "Money-Back Guarantee", simple: false, advance: true, master: true },
    ]
  }
];

const METRICS = [
  { label: "Deals Closed", value: "₹250Cr+", icon: <Briefcase className="h-5 w-5" /> },
  { label: "Leads Generated", value: "18K+", icon: <Target className="h-5 w-5" /> },
  { label: "Properties Listed", value: "3500+", icon: <Building className="h-5 w-5" /> },
  { label: "Faster Closures", value: "92%", icon: <Zap className="h-5 w-5" /> },
];

const AFTER_PURCHASE_STEPS = [
  { title: "Plan Activated", desc: "Instant access to your seller dashboard and tools." },
  { title: "Relationship Manager Assigned", desc: "A dedicated expert contacts you within 4 hours." },
  { title: "Property Marketing Starts", desc: "Professional shoots and multi-platform campaigns go live." },
  { title: "Buyer Leads Generated", desc: "Verified and filtered inquiries start arriving." },
  { title: "Deal Closure Assistance", desc: "Expert negotiation and legal support until the deal is won." }
];

const WHY_CHOOSE_US = [
  { title: "Verified Buyers", desc: "No more time-wasters. Every lead is pre-screened for intent and budget.", icon: <Users /> },
  { title: "Faster Closures", desc: "Our data-driven matching closes deals 3x faster than traditional methods.", icon: <Zap /> },
  { title: "Multi-platform Promotion", desc: "Reach buyers across Instagram, Facebook, Google, and premium portals.", icon: <Globe /> },
  { title: "Legal & Agreement Support", desc: "End-to-end documentation handling for a stress-free experience.", icon: <FileText /> },
  { title: "Zero Spam Calls", desc: "Your privacy is protected. We filter all initial calls for you.", icon: <Smartphone /> },
  { title: "Dedicated Managers", desc: "Expert guidance at every step of your selling journey.", icon: <Headphones /> }
];

const FAQ_DATA = [
  { q: "How does plan activation work?", a: "Once payment is confirmed, your dashboard is instantly upgraded. A welcome kit and manager assignment follow within hours." },
  { q: "Can I upgrade later?", a: "Absolutely. You can upgrade to a higher tier at any time. We'll prorate your existing plan value toward the new one." },
  { q: "Is GST included?", a: "Prices shown are base prices. 18% GST will be applied during checkout." },
  { q: "How does the Money-Back Guarantee work?", a: "On Advance and Master plans, if we don't deliver verified leads within 30 days, you're eligible for a refund as per our terms." },
  { q: "What is 'Guaranteed Sell'?", a: "It's our commitment to continue premium marketing and negotiation until your property is closed, beyond the standard plan duration." }
];

// --- Helper Functions ---

function normalizePlanKey(value = '') {
  return value.toString().toLowerCase().trim().replace(/plan/g, '').replace(/[^a-z]/g, '').trim();
}

function getCurrentPlanKey(subscription) {
  if (!subscription) return null;
  const possibleValues = [
    subscription.current_plan_slug, subscription.current_plan, subscription.plan_slug,
    subscription.plan_id, subscription.tier, subscription.name, subscription?.plan?.slug,
    subscription?.plan?.name, subscription?.plan?.id, subscription?.plan?.displayName,
    subscription.planName, subscription.planSlug
  ];
  for (const value of possibleValues) {
    if (!value) continue;
    const normalized = normalizePlanKey(value);
    if (PLAN_HIERARCHY[normalized]) return normalized;
  }
  return null;
}

function getPlanAction(planKey, currentSubscription) {
  if (!currentSubscription) return { type: 'subscribe', label: 'Subscribe Now', disabled: false };
  
  const currentPlanKey = getCurrentPlanKey(currentSubscription);
  const currentLevel = PLAN_HIERARCHY[currentPlanKey] || 0;
  const planLevel = PLAN_HIERARCHY[planKey] || 0;

  if (currentLevel === planLevel) return { type: 'current', label: 'Current Plan', disabled: true };
  // Lower grade plans: hide button entirely (null type)
  if (planLevel < currentLevel) return { type: 'hidden', label: '', disabled: true };
  
  return { type: 'upgrade', label: 'Upgrade Now', disabled: false };
}

// --- Components ---

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl ${className}`}>
    {children}
  </div>
);

const AnimatedCounter = ({ value }) => {
  // Simplified counter for now, could use a real hook
  return <span className="font-bold">{value}</span>;
};

const ComparisonMatrix = () => {
  return (
    <div className="mt-20 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-8 text-sm font-semibold text-slate-400 uppercase tracking-widest">Feature Matrix</th>
              <th className="p-8 text-center min-w-[200px]">
                <span className="text-lg font-bold text-slate-300">Simple</span>
              </th>
              <th className="p-8 text-center min-w-[200px] bg-blue-500/5">
                <span className="text-lg font-bold text-cyan-400">Advance</span>
              </th>
              <th className="p-8 text-center min-w-[200px] bg-amber-500/5">
                <span className="text-lg font-bold text-amber-400">Master</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_CATEGORIES.map((cat, idx) => (
              <React.Fragment key={idx}>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <td colSpan={4} className="px-8 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                    {cat.name}
                  </td>
                </tr>
                {cat.features.map((feat, fidx) => (
                  <tr key={fidx} className="border-b border-white/5 hover:bg-white/5 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-300 font-medium">{feat.name}</span>
                        {feat.badge && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400">
                            {feat.badge}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <FeatureValue value={feat.simple} />
                    </td>
                    <td className="px-8 py-6 text-center bg-blue-500/5">
                      <FeatureValue value={feat.advance} color="cyan" />
                    </td>
                    <td className="px-8 py-6 text-center bg-amber-500/5">
                      <FeatureValue value={feat.master} color="amber" />
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FeatureValue = ({ value, color = "slate" }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <div className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-${color === 'slate' ? 'emerald' : color}-500/20`}>
        <Check className={`h-4 w-4 text-${color === 'slate' ? 'emerald' : color}-400`} />
      </div>
    ) : (
      <div className="mx-auto h-0.5 w-4 bg-white/10 rounded-full" />
    );
  }
  return <span className={`text-sm font-bold text-${color}-400`}>{value}</span>;
};

// --- Main Page Component ---

export default function SubscriptionPage() {
  const { isLoggedIn, openLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFAQ, setActiveFAQ] = useState(null);

  const subscriptionCacheKey = useMemo(() => {
    const userId = user?.id ? String(user.id) : "anon";
    const orgId = user?.organization_id || user?.organizationId || user?.organization?.id;
    return `revo_sub:${orgId}:${userId}`;
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch plans and subscription in parallel
        const [plansRes, subRes] = await Promise.allSettled([
          billingApi.getPlans({ categoryKey: 'property_owner_sell' }),
          billingApi.getCurrentSubscription({ categoryKey: 'property_owner_sell' }).catch(() => null)
        ]);

        if (!isMounted) return;

        if (plansRes.status === 'fulfilled') {
          // Handle both { plans: [] } and raw [] response formats
          const rawPlans = plansRes.value;
          const plansData = Array.isArray(rawPlans) ? rawPlans : (rawPlans?.plans || []);
          
          if (plansData.length > 0) {
            setPlans(plansData.map(p => ({
              ...p,
              slug: normalizePlanKey(p.slug || p.name || p.displayName)
            })));
          } else {
            console.warn("No plans found for category: property_owner_sell");
          }
        } else {
          console.error("Failed to fetch plans:", plansRes.reason);
          setError("Failed to load subscription plans. Please try again.");
        }
        
        if (subRes.status === 'fulfilled' && subRes.value) {
          setCurrentSubscription(subRes.value.subscription || subRes.value);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchData();
    return () => { isMounted = false; };
  }, [user?.id, isLoggedIn]);

  const handleAction = (plan) => {
    if (!isLoggedIn) return openLogin();
    navigate('/checkout', { 
      state: { 
        plan, 
        planId: plan.id || plan._id,
        planSlug: plan.slug || normalizePlanKey(plan.name || plan.displayName),
        categoryKey: 'property_owner_sell',
        from: location.pathname 
      } 
    });
  };

  if (loading) return <div className="min-h-screen bg-[#050816] flex items-center justify-center"><Loader2 className="h-10 w-10 text-blue-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050816] text-white selection:bg-blue-500/30 selection:text-white font-sans antialiased">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Layered luxury background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full"
          />
        </div>

        <div className="relative max-w-7xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.05]">
              Sell Faster. <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Close Smarter.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Premium Real Estate Growth Plans Built for Serious Sellers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            {["10,000+ Qualified Buyers", "₹250Cr+ Property Transactions", "98% Client Satisfaction", "24hr Lead Response"].map((stat, i) => (
              <GlassCard key={i} className="px-6 py-3 border-white/5 bg-white/[0.03]">
                <span className="text-sm font-semibold text-slate-300 tracking-wide">{stat}</span>
              </GlassCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. PRICING CARDS */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {['simple', 'advance', 'master'].map((tier, idx) => {
              const plan = plans.find(p => p.slug === tier) || { name: tier.charAt(0).toUpperCase() + tier.slice(1), basePrice: tier === 'simple' ? 15000 : tier === 'advance' ? 50000 : 100000 };
              const action = getPlanAction(tier, currentSubscription);
              const isAdvance = tier === 'advance';
              const isMaster = tier === 'master';

              return (
                <motion.div
                  key={tier}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                  className={`relative flex flex-col rounded-[40px] p-10 border transition-all duration-500 overflow-hidden
                    ${tier === 'simple' ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700' : ''}
                    ${tier === 'advance' ? 'bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-600 border-white/20 shadow-[0_0_60px_rgba(59,130,246,0.35)]' : ''}
                    ${tier === 'master' ? 'bg-gradient-to-br from-[#1a1a1a] via-[#111827] to-black border-amber-400/30 shadow-[0_0_80px_rgba(251,191,36,0.25)]' : ''}
                  `}
                >
                  {/* Badge */}
                  {isAdvance && (
                    <div className="absolute top-6 right-8">
                      <span className="px-4 py-1.5 bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">MOST POPULAR</span>
                    </div>
                  )}
                  {isMaster && (
                    <div className="absolute top-6 right-8">
                      <span className="px-4 py-1.5 bg-amber-400 text-black text-[10px] font-black uppercase tracking-widest rounded-full">ELITE LUXURY</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                      <h3 className={`text-lg font-black uppercase tracking-[0.2em] ${isAdvance ? 'text-white' : isMaster ? 'text-amber-400' : 'text-slate-400'}`}>
                        {tier} Plan
                      </h3>
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-black tabular-nums">₹{plan.basePrice.toLocaleString()}</span>
                          <span className={`text-sm font-medium ${isAdvance ? 'text-blue-100' : 'text-slate-500'}`}>+GST</span>
                        </div>
                        <p className={`text-sm font-medium ${isAdvance ? 'text-blue-100' : 'text-slate-400'}`}>
                          {PLAN_TAGLINES[tier]}
                        </p>
                      </div>
                    </div>

                    {/* Features highlight */}
                    <div className="space-y-4">
                      <p className={`text-xs font-black uppercase tracking-widest ${isAdvance ? 'text-blue-200' : 'text-slate-500'}`}>Top Features</p>
                      <ul className="space-y-4">
                        {PLAN_HIGHLIGHTS[tier].map((feat, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className={`mt-1 p-0.5 rounded-full ${isAdvance ? 'bg-white/20' : 'bg-white/10'}`}>
                              <Check className={`h-3 w-3 ${isAdvance ? 'text-white' : isMaster ? 'text-amber-400' : 'text-emerald-400'}`} />
                            </div>
                            <span className={`text-sm font-medium ${isAdvance ? 'text-white' : 'text-slate-300'}`}>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* CTA */}
                    {action.type === 'hidden' ? (
                      <div className="w-full py-5 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 ${isMaster ? 'text-amber-400' : 'text-emerald-400'}`} />
                        <span className="text-sm font-semibold text-slate-500">Included in Your Plan</span>
                      </div>
                    ) : action.type === 'current' ? (
                      <motion.button
                        disabled
                        className={`relative w-full py-5 rounded-2xl font-bold tracking-wide overflow-hidden cursor-not-allowed
                          ${isAdvance ? 'bg-white/20 text-white border border-white/30' : isMaster ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}
                        `}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Current Plan
                        </span>
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAction(plan)}
                        className={`relative w-full py-5 rounded-2xl font-bold tracking-wide transition-all overflow-hidden group
                          ${isAdvance ? 'bg-white text-blue-600 shadow-xl' : isMaster ? 'bg-amber-400 text-black shadow-[0_10px_30px_rgba(251,191,36,0.3)]' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}
                        `}
                      >
                        <span className="relative z-10">{action.label}</span>
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      </motion.button>
                    )}
                  </div>

                  <p className={`mt-6 text-center text-xs font-black uppercase tracking-widest ${isAdvance ? 'text-blue-200' : 'text-slate-600'}`}>
                    {tier === 'master' ? '90+60 Days Validity' : tier === 'advance' ? '60+60 Days Validity' : '60+30 Days Validity'}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. COMPARISON TABLE */}
      <section className="px-6 py-24 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">The Detail View</h2>
            <p className="text-slate-400 text-lg">Compare every strategic advantage side-by-side.</p>
          </div>
          <ComparisonMatrix />
        </div>
      </section>

      {/* 4. PERFORMANCE METRICS */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {METRICS.map((metric, i) => (
              <GlassCard key={i} className="p-8 text-center space-y-4 border-white/5">
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                  {metric.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="text-4xl font-black tracking-tighter text-white">
                    <AnimatedCounter value={metric.value} />
                  </h4>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">{metric.label}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 5. AFTER PURCHASE TIMELINE */}
      <section className="px-6 py-24 bg-gradient-to-b from-transparent to-blue-500/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Your Success Roadmap</h2>
            <p className="text-slate-400 text-lg">What happens after you choose a plan.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Connector line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-12" />
            
            {AFTER_PURCHASE_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative z-10 flex flex-col items-center text-center space-y-6"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600 border-4 border-[#050816] flex items-center justify-center text-lg font-bold shadow-2xl">
                  {i + 1}
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white leading-tight">{step.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHY SELLERS CHOOSE US */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Why Sellers Choose Us</h2>
            <p className="text-slate-400 text-lg">The Revo Homes advantage in property selling.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHY_CHOOSE_US.map((item, i) => (
              <GlassCard key={i} className="p-10 space-y-6 hover:bg-white/[0.08] transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  {item.icon && React.cloneElement(item.icon, { className: "h-7 w-7" })}
                </div>
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-white">{item.title}</h4>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="px-6 py-24 mb-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-black tracking-tight">Questions?</h2>
            <p className="text-slate-400">Everything you need to know about our plans.</p>
          </div>
          <div className="space-y-4">
            {FAQ_DATA.map((item, i) => (
              <GlassCard key={i} className="overflow-hidden border-white/5">
                <button 
                  onClick={() => setActiveFAQ(activeFAQ === i ? null : i)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left"
                >
                  <span className="text-lg font-bold text-slate-200">{item.q}</span>
                  <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${activeFAQ === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFAQ === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8 text-slate-400 leading-relaxed">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Sticky CTA Placeholder */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <GlassCard className="p-4 bg-blue-600 border-none shadow-2xl">
          <button className="w-full py-4 text-center font-black uppercase tracking-widest text-sm">
            Compare All Plans
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
