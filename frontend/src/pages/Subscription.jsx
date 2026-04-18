import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* ─────────────────────────────────────────────
   PLAN DATA (EDIT HERE ANYTIME)
─────────────────────────────────────────────*/

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    priceLabel: 'Rs. 2,00,000/-',
    service: '60 + 30 Days',
  },
  {
    id: 'booster',
    name: 'Booster',
    priceLabel: 'Rs. 3,00,000/-',
    service: '90 + 30 Days',
  },
  {
    id: 'maximum',
    name: 'Maximum',
    priceLabel: 'Rs. 5,00,000/-',
    service: '120 + 30 Days',
  }
];

const features = [
  { label: 'Service Validity in Days*', values: ['60 + 30', '90 + 30', '120 + 30'] },
  { label: 'Professional Photo', values: ['Yes', 'Yes', 'Yes'] },
  { label: 'Property Reel/Shorts', values: ['1 Reel', '2 Reels', '3–5 Reels'] },
  { label: 'Drone Shoot & Video Editing', values: ['No', '1 time', '2 times'] },
  { label: 'Sampleflat Walkthrough Video', values: ['Yes (1 Unit)', 'Yes (Up to 3 Units)', 'Yes (Up to 5 Units)'] },
  { label: 'Construction Progress Video', values: ['No', 'Yes (Monthly once)', 'Yes (Monthly once)'] },
  { label: 'Project Website', values: ['No', 'Yes', 'Yes'] },
  { label: 'Property Portal Listings (Own + 3 Platforms)', values: ['Yes', 'Yes', 'Yes'] },
  { label: 'Facebook/Insta Creatives', values: ['30', '60', '90'] },
  { label: 'Reels Posting', values: ['Only posting', 'Only posting', 'Only posting'] },
  { label: 'Meta Ads Management', values: ['No', 'Yes (As per allocated Budget)', 'Yes (As per allocated Budget)'] },
  { label: 'Google Ads Management', values: ['No', 'Yes (As per allocated Budget)', 'Yes (As per allocated Budget)'] },
  { label: 'YouTube Channel Management', values: ['No', 'Yes', 'Yes'] },
  { label: 'Social Media Influencer', values: ['No', 'No', '2 tieups 5L+ Followers. Min 1 post/month'] },
  { label: 'Lead Database (Organic)', values: ['Included', 'Included', 'Included'] },
  { label: 'Lead Calling & Filtration', values: ['No', 'Yes', 'Yes'] },
  { label: 'Relationship Manager', values: ['Included', 'Included', 'Included'] },
  { label: 'Additional Services of Closing Expert^', values: ['Included (1% Commission)', 'Included (1% Commission)', 'Included (1% Commission)'] },
  { label: 'Additional Services', values: ['On payment basis', 'On payment basis', 'On payment basis'] },
  { label: 'Money-Back Guarantee#', values: ['Included', 'Included', 'Included'] },
];

/* ───────────────────────────────────────────── */

export default function SubscriptionPage() {
  const { subscribeUser, isLoggedIn, openLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubscribe = (planId) => {
    if (!isLoggedIn) return openLogin();
    const selectedPlan = plans.find(p => p.id === planId);
    
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

  return (
    <div className="min-h-screen bg-[#f6f7fb]">

      <div className="h-20" />

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
          * Service validity includes additional 30 days if 100% advance is provided.
          All prices exclude GST. GST charged at 18%.
        </p>
        <p>
          Minimum 50% advance required to start services. Part payments are not eligible
          for money-back guarantee or additional service extension.
        </p>
        <p>
          Digital agreement will be signed detailing services and payment commitments.
        </p>
        <p>
          ^ Closing Expert assists in end-to-end deal closure. 1% commission applicable.
          Clients may opt out during enrollment.
        </p>
      </div>

      {/* ───────────────── MONEY BACK ───────────────── */}
      <div className="max-w-5xl mx-auto px-4 mt-10 mb-24">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-extrabold mb-3"># 50% Money-Back Guarantee Clause</h3>
          <ul className="text-xs text-gray-600 space-y-2 list-disc pl-5">
            <li>Valid for 50% refund of basic package amount (excluding GST)</li>
            <li>Full advance payment must be completed</li>
            <li>If services fail to deliver agreed outcomes within 30 days</li>
            <li>If client withdraws — remaining service days provided instead</li>
            <li>Refunds processed within 15 working days after approval</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
