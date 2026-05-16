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
========================================================= */

const FeatureValue = ({
  value,
  color = 'slate'
}) => {
  if (typeof value === 'boolean') {
    return value ? (
      <div
        className={`
          mx-auto flex h-6 w-6 items-center justify-center rounded-full
          ${color === 'amber'
            ? 'bg-amber-100'
            : color === 'cyan'
              ? 'bg-blue-100'
              : 'bg-green-100'
          }
        `}
      >
        <Check
          className={`
            h-4 w-4
            ${color === 'amber'
              ? 'text-amber-600'
              : color === 'cyan'
                ? 'text-blue-600'
                : 'text-green-600'
            }
          `}
        />
      </div>
    ) : (
      <div className="mx-auto h-0.5 w-4 bg-slate-200 rounded-full" />
    );
  }

  return (
    <span className="text-sm font-bold text-slate-700">
      {value}
    </span>
  );
};

/* =========================================================
   COMPARISON TABLE
========================================================= */

const ComparisonMatrix = () => {
  return (
    <div className="mt-20 overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50">

      <div className="overflow-x-auto">

        <table className="w-full text-left border-collapse">

          <thead>

            <tr className="border-b border-slate-100 bg-slate-50/50">

              <th className="p-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
                Plan Features
              </th>

              <th className="p-8 text-center min-w-[200px]">
                <span className="text-lg font-bold text-slate-900">
                  Simple
                </span>
              </th>

              <th className="p-8 text-center min-w-[200px] bg-blue-50/30">
                <span className="text-lg font-bold text-blue-600">
                  Advance
                </span>
              </th>

              <th className="p-8 text-center min-w-[200px] bg-primary/5">
                <span className="text-lg font-bold text-primary">
                  Master
                </span>
              </th>

            </tr>

          </thead>

          <tbody>

            {FEATURE_CATEGORIES.map((cat, idx) => (
              <React.Fragment key={idx}>

                <tr className="bg-slate-50/30 border-b border-slate-100">

                  <td
                    colSpan={4}
                    className="px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400"
                  >
                    {cat.name}
                  </td>

                </tr>

                {cat.features.map((feat, fidx) => (
                  <tr
                    key={fidx}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-300"
                  >

                    <td className="px-8 py-6">

                      <span className="text-slate-700 font-medium">
                        {feat.name}
                      </span>

                    </td>

                    <td className="px-8 py-6 text-center">
                      <FeatureValue value={feat.simple} />
                    </td>

                    <td className="px-8 py-6 text-center bg-blue-50/20">
                      <FeatureValue
                        value={feat.advance}
                        color="cyan"
                      />
                    </td>

                    <td className="px-8 py-6 text-center bg-primary/5">
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
  const { isLoggedIn, openLogin, user } =
    useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const [plans, setPlans] = useState([]);

  const [currentSubscription, setCurrentSubscription] =
    useState(null);

  const [loading, setLoading] = useState(true);

  const [activeFAQ, setActiveFAQ] =
    useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [plansRes, subRes] =
          await Promise.allSettled([
            billingApi.getPlans({
              categoryKey: 'property_owner_sell'
            }),

            billingApi
              .getCurrentSubscription({
                categoryKey: 'property_owner_sell'
              })
              .catch(() => null)
          ]);

        if (!isMounted) return;

        if (plansRes.status === 'fulfilled') {
          const rawPlans = plansRes.value;

          const plansData = Array.isArray(rawPlans)
            ? rawPlans
            : rawPlans?.plans || [];

          setPlans(
            plansData.map((p) => ({
              ...p,
              slug: normalizePlanKey(
                p.slug || p.name || p.displayName
              )
            }))
          );
        }

        if (
          subRes.status === 'fulfilled' &&
          subRes.value
        ) {
          setCurrentSubscription(
            subRes.value.subscription ||
            subRes.value
          );
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

    navigate('/checkout', {
      state: {
        plan,
        planId: plan.id || plan._id,
        planSlug:
          plan.slug ||
          normalizePlanKey(
            plan.name || plan.displayName
          ),
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
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white overflow-x-hidden">

      {/* HERO */}

      <section className="relative pt-32 pb-24 px-6">

        <div className="absolute inset-0 overflow-hidden pointer-events-none">

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/5 blur-[120px] rounded-full" />

        </div>

        <div className="relative max-w-7xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/10 mb-8">

            <Sparkles className="w-4 h-4 text-primary" />

            <span className="text-primary text-xs font-bold uppercase tracking-[0.2em]">
              Premium Property Selling
            </span>

          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">

            Sell Faster.<br />

            <span className="text-primary">
              Close Smarter.
            </span>

          </h1>

          <p className="mt-8 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">

            High-converting property selling plans designed to maximize visibility,
            generate verified leads and close deals faster.

          </p>

        </div>

      </section>

      {/* PLANS */}

      <section className="px-6 pb-28">

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

          {['simple', 'advance', 'master'].map(
            (tier, idx) => {

              const plan =
                plans.find(
                  (p) => p.slug === tier
                ) || {
                  name:
                    tier.charAt(0).toUpperCase() +
                    tier.slice(1),

                  basePrice:
                    tier === 'simple'
                      ? 15000
                      : tier === 'advance'
                        ? 50000
                        : 100000
                };

              const action = getPlanAction(
                tier,
                currentSubscription
              );

              const isMaster = tier === 'master';

              const isAdvance =
                tier === 'advance';

              return (
                <motion.div
                  key={tier}
                  initial={{
                    opacity: 0,
                    y: 30
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.1
                  }}
                  whileHover={{
                    y: -8
                  }}
                  className={`
                    relative rounded-[36px] overflow-hidden transition-all duration-500 flex flex-col

                    ${isMaster
                      ? `
                        bg-primary text-white
                        shadow-[0_40px_100px_rgba(0,0,0,0.18)]
                        scale-[1.03] z-30
                      `
                      : isAdvance
                        ? `
                        bg-white border border-primary/10
                        shadow-[0_20px_60px_rgba(0,0,0,0.08)]
                        z-20
                      `
                        : `
                        bg-white border border-slate-200
                        shadow-[0_10px_40px_rgba(0,0,0,0.05)]
                        z-10
                      `
                    }
                  `}
                >

                  {isMaster && (
                    <div className="absolute top-5 right-5">

                      <div className="px-4 py-2 rounded-full bg-white text-primary text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">

                        <Crown className="w-3 h-3" />

                        Most Popular

                      </div>

                    </div>
                  )}

                  <div className="p-10 flex flex-col flex-1">

                    <div className="mb-10">

                      <h3
                        className={`
                          text-3xl font-black mb-3

                          ${isMaster
                            ? 'text-white'
                            : 'text-slate-900'
                          }
                        `}
                      >
                        {plan.name}
                      </h3>

                      <p
                        className={`
                          text-sm leading-relaxed

                          ${isMaster
                            ? 'text-white/70'
                            : 'text-slate-500'
                          }
                        `}
                      >
                        {PLAN_TAGLINES[tier]}
                      </p>

                    </div>

                    <div className="mb-10">

                      <div className="flex items-start gap-2">

                        <span
                          className={`
                            text-xl mt-2 font-bold

                            ${isMaster
                              ? 'text-white/80'
                              : 'text-slate-500'
                            }
                          `}
                        >
                          ₹
                        </span>

                        <span
                          className={`
                            text-6xl font-black tracking-tight

                            ${isMaster
                              ? 'text-white'
                              : 'text-slate-900'
                            }
                          `}
                        >
                          {plan.basePrice.toLocaleString()}
                        </span>

                      </div>

                      <p
                        className={`
                          mt-2 text-sm font-semibold

                          ${isMaster
                            ? 'text-white/70'
                            : 'text-slate-500'
                          }
                        `}
                      >
                        + GST
                      </p>

                    </div>

                    <div className="space-y-5 flex-1">

                      {PLAN_HIGHLIGHTS[tier].map(
                        (feature, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-4"
                          >

                            <div
                              className={`
                                w-6 h-6 rounded-full flex items-center justify-center mt-1

                                ${isMaster
                                  ? 'bg-white/10'
                                  : 'bg-primary/10'
                                }
                              `}
                            >
                              <Check
                                className={`
                                  w-3.5 h-3.5

                                  ${isMaster
                                    ? 'text-white'
                                    : 'text-primary'
                                  }
                                `}
                              />
                            </div>

                            <span
                              className={`
                                text-[15px] leading-relaxed font-medium

                                ${isMaster
                                  ? 'text-white/90'
                                  : 'text-slate-700'
                                }
                              `}
                            >
                              {feature}
                            </span>

                          </div>
                        )
                      )}

                    </div>

                    <div className="my-8 h-px w-full bg-white/10" />

                    {action.type ===
                      'current' ? (
                      <button
                        disabled
                        className={`
                          w-full py-5 rounded-2xl font-black uppercase tracking-[0.18em] text-sm

                          ${isMaster
                            ? 'bg-white text-primary'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }
                        `}
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleAction(plan)
                        }
                        className={`
                          w-full py-5 rounded-2xl font-black uppercase tracking-[0.18em] text-sm transition-all duration-300

                          ${isMaster
                            ? 'bg-white text-primary hover:scale-[1.02]'
                            : isAdvance
                              ? 'bg-primary text-white hover:bg-primary/90'
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
            }
          )}

        </div>

      </section>

      {/* METRICS */}

      <section className="px-6 pb-24">

        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">

          {METRICS.map((metric, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-[30px] p-8 text-center shadow-sm"
            >

              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">

                {React.cloneElement(metric.icon, {
                  className: 'w-6 h-6'
                })}

              </div>

              <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                {metric.value}
              </h3>

              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">
                {metric.label}
              </p>

            </div>
          ))}

        </div>

      </section>

      {/* COMPARISON */}

      <section className="px-6 pb-24">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">

            <h2 className="text-5xl font-black text-slate-900 tracking-tight">
              Compare Plans
            </h2>

            <p className="mt-4 text-slate-500 text-lg">
              Compare every feature side by side.
            </p>

          </div>

          <ComparisonMatrix />

        </div>

      </section>

      {/* FAQ */}

      <section className="px-6 pb-28">

        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-14">

            <h2 className="text-5xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>

          </div>

          <div className="space-y-5">

            {FAQ_DATA.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-slate-100 rounded-[28px] overflow-hidden shadow-sm"
              >

                <button
                  onClick={() =>
                    setActiveFAQ(
                      activeFAQ === i
                        ? null
                        : i
                    )
                  }
                  className="w-full px-8 py-7 flex items-center justify-between text-left"
                >

                  <span className="text-lg font-bold text-slate-800">
                    {item.q}
                  </span>

                  <ChevronDown
                    className={`
                      w-5 h-5 text-slate-400 transition-transform duration-300

                      ${activeFAQ === i
                        ? 'rotate-180'
                        : ''
                      }
                    `}
                  />

                </button>

                <AnimatePresence>

                  {activeFAQ === i && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0
                      }}
                      animate={{
                        height: 'auto',
                        opacity: 1
                      }}
                      exit={{
                        height: 0,
                        opacity: 0
                      }}
                      className="overflow-hidden"
                    >

                      <div className="px-8 pb-8 text-slate-500 leading-relaxed">

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