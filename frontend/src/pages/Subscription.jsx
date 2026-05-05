import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { billingApi } from '../services/billingApi';
import { Loader2, AlertCircle } from 'lucide-react';

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

export default function SubscriptionPage() {
  const { subscribeUser, isLoggedIn, openLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadWarning, setLoadWarning] = useState(null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-red-600" />
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">

      <div className="h-20" />

      {loadWarning ? (
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <span>{loadWarning}</span>
          </div>
        </div>
      ) : null}

      {/* ───── Title ───── */}
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
          Choose Your <span className="text-red-600">Premium</span> Plan
        </h1>
        <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
          Complete marketing and sales solution for real estate projects.
        </p>
      </div>

      {/* ───────────────── DESKTOP TABLE ───────────────── */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 mt-14 mb-20">
        <div className="overflow-x-auto bg-white rounded-3xl shadow-xl border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#0f172a] text-white">
                <th className="p-4 text-center text-xl font-bold border-r border-[#1e293b]">Features / Inclusions</th>
                {plans.map(p => (
                  <th key={p.id} className="p-6 text-center border-l border-[#1e293b]">
                    <div className="text-2xl font-black text-white">{p.name}</div>
                    <div className="mt-2 text-primary font-bold">{p.priceLabel}</div>
                    <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Excluding GST</div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {features.map((f, i) => (
                <tr key={i} className="border-t border-gray-200">
                  <td className="p-4 font-semibold bg-gray-50 text-">{f.label}</td>
                  {f.values.map((v, idx) => (
                    <td key={idx} className="p-4 text-center border-l border-gray-200">{v}</td>
                  ))}
                </tr>
              ))}

              {/* Subscribe Row */}
              <tr className="border-t border-gray-300 bg-gray-50">
                <td className="p-4 font-bold">Get Started</td>
                {plans.map(p => (
                  <td key={p.id} className="p-4 text-center border-l border-gray-200">
                    <button
                      onClick={() => handleSubscribe(p.id)}
                      className="px-6 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition"
                    >
                      Subscribe
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:hidden max-w-md mx-auto px-4 mt-10 space-y-8 pb-20">
        {plans.map((plan, pi) => (
          <div key={plan.id} className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            
            <div className="bg-[#0f172a] p-8 text-center text-white">
              <h3 className="text-3xl font-black">{plan.name}</h3>
              <p className="font-bold mt-2 text-primary text-xl">{plan.priceLabel}</p>
              <p className="text-xs mt-2 text-gray-400 uppercase tracking-widest font-bold">Excluding GST</p>
            </div>

            <div className="p-6 space-y-4 text-sm bg-gray-50/50">
              {features.map((f, fi) => (
                <div key={fi} className="flex justify-between gap-4 border-b border-gray-100 pb-2">
                  <span className="text-gray-600">{f.label}</span>
                  <span className="font-semibold text-right">{f.values[pi]}</span>
                </div>
              ))}
            </div>

            <div className="p-5">
              <button
                onClick={() => handleSubscribe(plan.id)}
                className="w-full py-3 rounded-xl bg-red-600 text-white font-bold"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ───────────────── FOOT NOTES ───────────────── */}
      <div className="max-w-5xl mx-auto px-4 mt-16 text-xs text-gray-600 space-y-3 leading-relaxed">
        <p>
          * Service validity includes additional 30 days if 100% advance is provided. All prices exclude GST. GST charged at 18%.
        </p>
        <p>
          Minimum 50% advance required to start services. Remaining 50% to be paid within next 30 days. Part payments are not eligible for money-back guarantee.
        </p>
        <p>
          Additional 30/60 days of services is only included for 100% advance payment cases.
        </p>
        <p>
          Digital agreement will be signed detailing services and payment commitments.
        </p>
        <p>
          ^ Closing Expert/Manager helps in end-to-end deal closing on behalf of clients.
        </p>
      </div>

      {/* ───────────────── MONEY BACK ───────────────── */}
      <div className="max-w-5xl mx-auto px-4 mt-10 mb-24">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-extrabold mb-3"># 50% Money-Back Guarantee Clause</h3>
          <ul className="text-xs text-gray-600 space-y-2 list-disc pl-5">
            <li>Clients eligible for 50% refund on basic package amount (excluding GST) only if: full 100% advance is paid, and either the client withdraws within 30 days or the property remains unsold for guaranteed sales plans despite our full efforts.</li>
            <li>If client postpones or withdraws, minimum 30 days of service will still be provided.</li>
            <li>Refunds processed within 15 working days from date of eligibility confirmation.</li>
            <li>Non-refund conditions: client sells independently or via external reference; transaction fails due to legal, financial, or personal reasons not attributable to our services.</li>
            <li>In non-refund cases, initial 50% payment is non-refundable and balance will not be demanded.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}