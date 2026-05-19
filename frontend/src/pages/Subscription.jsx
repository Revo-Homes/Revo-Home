import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { billingApi } from '../services/billingApi';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Loader2,
  Check,
  ChevronDown,
  Star,
  Crown,
  CheckCircle2,
  Clock,
  Users,
  Headphones,
  FileText,
  Building,
  Zap,
  Globe,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Briefcase,
  Target
} from 'lucide-react';

/* =========================================================
   PLAN CONFIG
========================================================= */

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
  simple: 'Perfect for independent property sellers',
  advance: 'Most preferred plan for faster deal closure',
  master: 'Full-service enterprise property selling solution'
};

const PLAN_HIGHLIGHTS = {
  simple: [
    'Direct inquiry access',
    'Portal promotion',
    'Property showcase support'
  ],

  advance: [
    'Guaranteed sales support',
    'Filtered buyer leads',
    'Dedicated manager'
  ],

  master: [
    'Zero commission closure',
    'Broker network amplification',
    'Priority deal handling'
  ]
};

const FEATURE_CATEGORIES = [
  {
    name: 'Marketing',
    features: [
      {
        id: 'insta_reels',
        name: 'Instagram Reels',
        simple: false,
        advance: true,
        master: true
      },

      {
        id: 'whatsapp_mkt',
        name: 'WhatsApp Marketing',
        simple: false,
        advance: true,
        master: true
      },

      {
        id: 'prop_video',
        name: 'Property Showcase Video',
        simple: true,
        advance: true,
        master: true
      },

      {
        id: 'newspaper_ad',
        name: 'Newspaper Classified Ad',
        simple: false,
        advance: false,
        master: true
      },

      {
        id: 'landing_page',
        name: 'Property Landing Page',
        simple: false,
        advance: false,
        master: true
      }
    ]
  },

  {
    name: 'Lead Management',
    features: [
      {
        id: 'inquiries',
        name: 'Lead Quality',
        simple: 'Raw',
        advance: 'Filtered',
        master: 'Filtered'
      },

      {
        id: 'privacy',
        name: 'Phone Number Privacy',
        simple: true,
        advance: true,
        master: true
      },

      {
        id: 'spam_free',
        name: 'Freedom from Spam Calls',
        simple: true,
        advance: true,
        master: true
      }
    ]
  },

  {
    name: 'Sales Support',
    features: [
      {
        id: 'negotiation',
        name: 'Sales Negotiation Support',
        simple: false,
        advance: true,
        master: true
      },

      {
        id: 'site_visits',
        name: 'Site Visit Support',
        simple: false,
        advance: false,
        master: true
      },

      {
        id: 'agreement',
        name: 'Property Agreement Service',
        simple: true,
        advance: true,
        master: true
      }
    ]
  },

  {
    name: 'Enterprise Support',
    features: [
      {
        id: 'rel_manager',
        name: 'Relationship Manager',
        simple: false,
        advance: true,
        master: true
      },

      {
        id: 'closing_manager',
        name: 'Closing Manager',
        simple: false,
        advance: true,
        master: true
      },

      {
        id: 'progress_reports',
        name: 'Progress Reports',
        simple: false,
        advance: true,
        master: true
      }
    ]
  }
];

const METRICS = [
  {
    label: 'Deals Closed',
    value: '₹250Cr+',
    icon: <Briefcase />
  },

  {
    label: 'Leads Generated',
    value: '18K+',
    icon: <Target />
  },

  {
    label: 'Properties Listed',
    value: '3500+',
    icon: <Building />
  },

  {
    label: 'Faster Closures',
    value: '92%',
    icon: <Zap />
  }
];

const FAQ_DATA = [
  {
    q: 'How does plan activation work?',
    a: 'Once payment is confirmed, your dashboard is instantly upgraded.'
  },

  {
    q: 'Can I upgrade later?',
    a: 'Yes. You can upgrade your plan anytime.'
  },

  {
    q: 'Is GST included?',
    a: '18% GST will be added during checkout.'
  },

  {
    q: 'Do plans include guaranteed support?',
    a: 'Advance and Master plans include premium support and lead management.'
  }
];

/* =========================================================
   HELPERS
========================================================= */

function normalizePlanKey(value = '') {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/plan/g, '')
    .replace(/[^a-z]/g, '')
    .trim();
}

function getTierFromPlan(plan = {}) {
  const key = normalizePlanKey(
    plan.slug || plan.originalSlug || plan.name || plan.displayName || ''
  );
  if (key.includes('simple') || key.includes('basic')) return 'simple';
  if (key.includes('advance') || key.includes('advanced') || key.includes('pro')) return 'advance';
  if (key.includes('master') || key.includes('elite') || key.includes('luxury') || key.includes('enterprise')) {
    return 'master';
  }
  if (PLAN_HIERARCHY[key]) return key;
  return null;
}

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
    subscription?.plan?.name
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

function getPlanAction(planKey, currentSubscription) {
  if (!currentSubscription) {
    return {
      type: 'subscribe',
      label: 'Subscribe Now',
      disabled: false
    };
  }

  const currentPlanKey = getCurrentPlanKey(currentSubscription);

  const currentLevel =
    PLAN_HIERARCHY[currentPlanKey] || 0;

  const planLevel =
    PLAN_HIERARCHY[planKey] || 0;

  if (currentLevel === planLevel) {
    return {
      type: 'current',
      label: 'Current Plan',
      disabled: true
    };
  }

  if (planLevel < currentLevel) {
    return {
      type: 'hidden',
      label: '',
      disabled: true
    };
  }

  return {
    type: 'upgrade',
    label: 'Upgrade Now',
    disabled: false
  };
}

/* =========================================================
   FEATURE VALUE
========================================================= */const FeatureValue = ({
  value,
  color = 'slate'
}) => {
  if (typeof value === 'boolean') {
    return value ? (
      <div
        className={`
          mx-auto flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110
          ${color === 'amber'
            ? 'bg-amber-500/15 border border-amber-500/30'
            : color === 'cyan'
              ? 'bg-primary/15 border border-primary/30'
              : 'bg-emerald-500/15 border border-emerald-500/30'
          }
        `}
      >
        <Check
          className={`
            h-4 w-4
            ${color === 'amber'
              ? 'text-amber-400 font-black'
              : color === 'cyan'
                ? 'text-primary font-black'
                : 'text-emerald-500 font-black'
            }
          `}
        />
      </div>
    ) : (
      <div className="mx-auto h-0.5 w-4 bg-slate-200 rounded-full" />
    );
  }

  return (
    <span className="text-sm font-black text-slate-800">
      {value}
    </span>
  );
};

/* =========================================================
   COMPARISON TABLE
========================================================= */

const ComparisonMatrix = () => {
  return (
    <div className="mt-20 overflow-hidden rounded-[40px] border border-slate-100/80 bg-white/80 backdrop-blur-xl shadow-[0_30px_70px_rgba(0,0,0,0.05)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="p-8 text-xs font-black text-slate-400 uppercase tracking-[0.25em]">
                Plan Features
              </th>
              <th className="p-8 text-center min-w-[200px] border-r border-slate-100/55">
                <span className="text-lg font-black text-slate-700 block">
                  Simple
                </span>
                <span className="text-[11px] font-bold text-slate-400 mt-1 block uppercase tracking-widest">Basic</span>
              </th>
              <th className="p-8 text-center min-w-[200px] bg-primary/[0.02] border-r border-slate-100/55">
                <span className="text-lg font-black text-primary block">
                  Advance
                </span>
                <span className="text-[11px] font-black text-cta mt-1 block uppercase tracking-widest">Recommended</span>
              </th>
              <th className="p-8 text-center min-w-[200px] bg-red-950/[0.02]">
                <div className="flex items-center justify-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="text-lg font-black text-neutral-900 block">
                    Master
                  </span>
                </div>
                <span className="text-[11px] font-black text-amber-500 mt-1 block uppercase tracking-widest">Exclusive</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_CATEGORIES.map((cat, idx) => (
              <React.Fragment key={idx}>
                <tr className="bg-slate-50/40 border-b border-slate-100/50">
                  <td
                    colSpan={4}
                    className="px-8 py-5 text-xs font-black uppercase tracking-[0.25em] text-primary/80"
                  >
                    {cat.name}
                  </td>
                </tr>
                {cat.features.map((feat, fidx) => (
                  <tr
                    key={fidx}
                    className="border-b border-slate-100/50 hover:bg-slate-50/50 transition-all duration-300"
                  >
                    <td className="px-8 py-6">
                      <span className="text-slate-700 font-semibold text-[15px]">
                        {feat.name}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center border-r border-slate-100/40">
                      <FeatureValue value={feat.simple} />
                    </td>
                    <td className="px-8 py-6 text-center bg-primary/[0.01] border-r border-slate-100/40">
                      <FeatureValue
                        value={feat.advance}
                        color="cyan"
                      />
                    </td>
                    <td className="px-8 py-6 text-center bg-red-950/[0.01]">
                      <FeatureValue
                        value={feat.master}
                        color="amber"
                      />
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

/* =========================================================
   MAIN PAGE
========================================================= */

function SubscriptionPage() {
  const { isLoggedIn, openLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFAQ, setActiveFAQ] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [plansRes, subRes] = await Promise.allSettled([
          billingApi.getPlans({
            categoryKey: 'property_owner_sell'
          }),
          billingApi.getCurrentSubscription({
            categoryKey: 'property_owner_sell'
          }).catch(() => null)
        ]);

        if (!isMounted) return;

        if (plansRes.status === 'fulfilled') {
          const rawPlans = plansRes.value;
          const plansData = Array.isArray(rawPlans) ? rawPlans : rawPlans?.plans || [];
          setPlans(
            plansData.map((p) => {
              const originalSlug = p.slug || p.name || p.displayName;
              return {
                ...p,
                originalSlug,
                tierKey: getTierFromPlan(p),
                slug: normalizePlanKey(originalSlug),
              };
            })
          );
        }

        if (subRes.status === 'fulfilled' && subRes.value) {
          setCurrentSubscription(subRes.value.subscription || subRes.value);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, isLoggedIn]);

  const handleAction = (plan) => {
    if (!isLoggedIn) {
      return openLogin();
    }

    const resolvedPlanId = plan?.id || plan?._id;
    if (!resolvedPlanId) {
      console.error('[Subscription] Cannot checkout — plan missing database id:', plan);
      return;
    }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-slate-500 font-medium">
          Loading Premium Plans...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/40 overflow-x-hidden pb-32">
      {/* Background Ornaments */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-primary/10 to-cta/10 blur-[130px] rounded-full opacity-60" />
        <div className="absolute top-[400px] right-[-200px] w-[500px] h-[500px] bg-cta/5 blur-[120px] rounded-full opacity-50" />
        <div className="absolute top-[1200px] left-[-200px] w-[600px] h-[600px] bg-primary/5 blur-[140px] rounded-full opacity-50" />
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-36 pb-20 px-6 z-10">
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-cta/10 border border-primary/20 mb-8 backdrop-blur-md shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-primary text-xs font-black uppercase tracking-[0.22em]">
              Premium Property Acceleration
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-8xl font-black tracking-tight text-slate-900 leading-[1.05]"
          >
            Sell Your Property<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cta to-amber-500">
              At Lightning Speed
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Power up your listing with robust sales assistance, certified buyers,
            and professional promotion. Choose a plan that matches your timeline.
          </motion.p>
        </div>
      </section>

      {/* CARDS SECTION */}
      <section className="px-6 pb-28 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-10 items-stretch">
          {['simple', 'advance', 'master'].map((tier, idx) => {
            const plan = plans.find((p) => p.tierKey === tier || p.slug === tier) || {
              name: tier.charAt(0).toUpperCase() + tier.slice(1),
              basePrice: tier === 'simple' ? 15000 : tier === 'advance' ? 50000 : 100000
            };

            const action = getPlanAction(tier, currentSubscription);
            const isMaster = tier === 'master';
            const isAdvance = tier === 'advance';

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className={`
                  relative rounded-[44px] overflow-hidden transition-all duration-500 flex flex-col p-1
                  ${isMaster
                    ? 'bg-gradient-to-b from-neutral-950 via-red-950 to-neutral-900 text-white shadow-[0_35px_80px_rgba(232,90,42,0.18)] scale-[1.03] lg:scale-[1.05] z-30 border border-cta/30'
                    : isAdvance
                      ? 'bg-white border-2 border-primary/20 shadow-[0_25px_60px_rgba(185,28,28,0.07)] z-20'
                      : 'bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.03)] z-10'
                  }
                `}
              >
                {/* Accent glows for premium cards */}
                {isAdvance && (
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary to-cta" />
                )}

                {isMaster && (
                  <div className="absolute top-5 right-5 z-40">
                    <div className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-lg shadow-amber-500/20">
                      <Crown className="w-3.5 h-3.5" />
                      Executive Choice
                    </div>
                  </div>
                )}

                {isAdvance && (
                  <div className="absolute top-5 right-5 z-40">
                    <div className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-cta text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-md">
                      <Star className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-10 flex flex-col flex-1 relative z-10">
                  <div className="mb-8">
                    <h3 className={`text-3xl font-black mb-3.5 tracking-tight ${isMaster ? 'text-white' : 'text-slate-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm leading-relaxed font-semibold ${isMaster ? 'text-white/60' : 'text-slate-500'}`}>
                      {PLAN_TAGLINES[tier]}
                    </p>
                  </div>

                  <div className="mb-10">
                    <div className="flex items-start gap-1">
                      <span className={`text-2xl mt-1.5 font-bold ${isMaster ? 'text-amber-400' : 'text-primary'}`}>₹</span>
                      <span className={`text-6xl font-black tracking-tight leading-none ${isMaster ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-amber-300' : 'text-slate-900'}`}>
                        {plan.basePrice.toLocaleString()}
                      </span>
                    </div>
                    <p className={`mt-2 text-xs font-black uppercase tracking-widest ${isMaster ? 'text-white/40' : 'text-slate-400'}`}>
                      + 18% GST (Exclusive)
                    </p>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className={`text-xs font-black uppercase tracking-[0.18em] mb-4 ${isMaster ? 'text-amber-400/80' : 'text-primary/80'}`}>
                      What's Included
                    </div>
                    {PLAN_HIGHLIGHTS[tier].map((feature, i) => (
                      <div key={i} className="flex items-start gap-3.5">
                        <div className={`
                          w-5.5 h-5.5 rounded-full flex items-center justify-center mt-0.5 shrink-0
                          ${isMaster ? 'bg-amber-400/10 text-amber-300' : 'bg-primary/10 text-primary'}
                        `}>
                          <Check className="w-3.5 h-3.5 font-black" />
                        </div>
                        <span className={`text-[14.5px] leading-relaxed font-semibold ${isMaster ? 'text-white/80' : 'text-slate-600'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className={`my-8 h-px w-full ${isMaster ? 'bg-white/10' : 'bg-slate-100'}`} />

                  {action.type === 'current' ? (
                    <button
                      disabled
                      className={`
                        w-full py-4.5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all border
                        ${isMaster
                          ? 'bg-white/10 text-white border-white/20'
                          : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        }
                      `}
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(plan)}
                      className={`
                        w-full py-4.5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 transform active:scale-95 shadow-md
                        ${isMaster
                          ? 'bg-gradient-to-r from-amber-400 via-cta to-primary text-neutral-950 font-black hover:shadow-[0_8px_30px_rgba(255,107,53,0.35)]'
                          : isAdvance
                            ? 'bg-gradient-to-r from-primary to-cta text-white hover:opacity-95 shadow-lg shadow-primary/20 hover:shadow-primary/30'
                            : 'bg-slate-900 text-white hover:bg-black'
                        }
                      `}
                    >
                      {action.label}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* METRICS SECTION */}
      <section className="px-6 pb-28 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 rounded-[48px] p-10 md:p-16 border border-white/5 shadow-2xl relative overflow-hidden">
            {/* Background glow in dark metrics container */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cta/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {METRICS.map((metric, i) => (
                <div key={i} className="text-center p-6 border-r border-white/5 last:border-r-0 last:border-b-0 md:border-b-0">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 text-cta flex items-center justify-center mb-5 border border-white/5">
                    {React.cloneElement(metric.icon, { className: 'w-6 h-6' })}
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cta tracking-tight">
                    {metric.value}
                  </h3>
                  <p className="mt-3.5 text-[11px] uppercase tracking-[0.25em] text-slate-400 font-black">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON MATRIX SECTION */}
      <section className="px-6 pb-28 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/10 mb-4">
              <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">Detailed Overview</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
              Compare All Features
            </h2>
            <p className="mt-4 text-slate-500 font-semibold max-w-xl mx-auto text-sm md:text-base">
              Decide on the right plan by reviewing the exact breakdown of our marketing, sales, and platform details.
            </p>
          </div>
          <ComparisonMatrix />
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="px-6 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
              Got Questions?
            </h2>
            <p className="mt-3 text-slate-500 font-semibold">
              Find instant answers to common questions about plans, billing, and activation.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_DATA.map((item, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-[24px] overflow-hidden shadow-sm hover:border-slate-200 transition-colors"
              >
                <button
                  onClick={() => setActiveFAQ(activeFAQ === i ? null : i)}
                  className="w-full px-8 py-6.5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-base md:text-lg font-black text-slate-800">
                    {item.q}
                  </span>
                  <div className={`p-1.5 rounded-full bg-slate-100 text-slate-500 transition-transform duration-300 ${activeFAQ === i ? 'rotate-180 bg-primary/10 text-primary animate-pulse' : ''}`}>
                    <ChevronDown className="w-4.5 h-4.5" />
                  </div>
                </button>

                <AnimatePresence>
                  {activeFAQ === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-7 text-[15px] text-slate-500 leading-relaxed font-medium">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

export default SubscriptionPage;