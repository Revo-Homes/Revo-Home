import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Scale,
  Home,
  Paintbrush,
  TrendingUp,
  Banknote,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import EMICalculator from './EMICalculator';
import HomeLoanAssistance from './HomeLoanAssistance';
import PropertyAgreement from './PropertyAgreement';
import RentalYield from './RentalYield';
import BuyingVsRenting from './BuyingVsRenting';
import PropertyManagement from './PropertyManagement';
import InteriorDesign from './InteriorDesign';

const SERVICES = [
  {
    id: 'agreement',
    title: 'Property Agreement',
    icon: Scale,
    category: 'Legal',
    description:
      'Professional agreement drafting and review by our legal experts. Secure your transaction with airtight documentation and dispute-ready clauses.',
    features: ['Sales Agreement', 'Legal Drafting', 'Document Verification', 'Dispute Resolution'],
    cta: 'Get Agreement',
    link: '/tools/property-agreement',
    hasComponent: true,
  },
  {
    id: 'management',
    title: 'Property Management',
    icon: Home,
    category: 'Management',
    description:
      'End-to-end management of your property — tenant sourcing, rent collection, and maintenance handled seamlessly so you can focus on returns.',
    features: ['Tenant Sourcing', 'Rent Collection', 'Maintenance & Repairs', 'Legal Compliance'],
    cta: 'Manage Property',
    link: '/contact',
    hasComponent: true,
  },
  {
    id: 'interior',
    title: 'Interior Design',
    icon: Paintbrush,
    category: 'Services',
    description:
      'Transform your space with curated partner designers and architects. From concept to execution, we ensure quality at every stage.',
    features: ['3D Visualisation', 'Modular Kitchen', 'End-to-end Execution', 'Quality Assurance'],
    cta: 'Get a Quote',
    link: '/contact',
    hasComponent: true,
  },
  {
    id: 'rental-yield',
    title: 'Rental Yield',
    icon: TrendingUp,
    category: 'Analytics',
    description:
      'Understand return potential of any investment property. Calculate gross yield, net yield, and cash-on-cash return with real figures.',
    features: ['Gross Yield', 'Net Yield', 'Cash-on-Cash Return', 'Investment Analysis'],
    cta: 'Calculate Yield',
    link: '/tools/rental-yield',
    hasComponent: true,
  },
  {
    id: 'buying-vs-renting',
    title: 'Buying vs Renting',
    icon: Calculator,
    category: 'Analytics',
    description:
      'Compare long-term financial outcomes of purchasing vs renting and investing. Make informed decisions with real-time calculations.',
    features: ['EMI Calculation', 'Property Appreciation', 'Investment Growth', 'Break-even Analysis'],
    cta: 'Compare Now',
    link: '/tools/buying-vs-renting',
    hasComponent: true,
  },
  {
    id: 'emi',
    title: 'EMI Calculator',
    icon: Calculator,
    category: 'Finance',
    description:
      'Plan your home loan repayment with precision. Visualise monthly breakdowns, amortisation schedules, and impact of prepayments.',
    features: ['Monthly Breakup', 'Amortization Schedule', 'Prepayment Impact', 'Interest vs Principal'],
    cta: 'Calculate EMI',
    link: '/tools/emi-calculator',
    hasComponent: true,
  },
  {
    id: 'loans',
    title: 'Home Loans',
    icon: Banknote,
    category: 'Finance',
    description:
      'Access competitive interest rates from top banks with fast approvals, minimal paperwork, and expert support through every step.',
    features: ['Instant Approval', 'Minimal Paperwork', 'Balance Transfer', 'Top-up Loans'],
    cta: 'Apply Now',
    link: '/tools/home-loan',
    hasComponent: true,
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(SERVICES.map((s) => s.category)))];

// Renders the appropriate component based on the active service
function ServiceContent({ service, navigate }) {
  if (service.hasComponent) {
    if (service.id === 'management') return <div className="bg-white rounded-2xl border border-slate-100 h-auto"><PropertyManagement /></div>;
    if (service.id === 'interior') return <div className="bg-white rounded-2xl border border-slate-100 h-auto"><InteriorDesign /></div>;
    if (service.id === 'emi') return <div className="bg-white rounded-2xl border border-slate-100 h-auto"><EMICalculator /></div>;
    if (service.id === 'loans') return <div className="bg-white rounded-2xl border border-slate-100 h-auto"><HomeLoanAssistance /></div>;
    if (service.id === 'rental-yield') return <div className="bg-white rounded-2xl border border-slate-100 h-auto"><RentalYield /></div>;
    if (service.id === 'buying-vs-renting') return <div className="bg-white rounded-2xl border border-slate-100 h-auto"><BuyingVsRenting /></div>;
    if (service.id === 'agreement') return <div className="bg-white rounded-2xl border border-slate-100 h-auto"><PropertyAgreement /></div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary/70 bg-primary/8 px-3 py-1 rounded-full border border-primary/15">
                {service.category}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-3 mb-4 leading-tight tracking-tight">
              {service.title}
            </h2>
            <p className="text-slate-500 leading-relaxed text-base mb-8 max-w-xl">
              {service.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {service.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <button
                onClick={() => navigate(service.link)}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-primary text-white rounded-xl font-semibold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                {service.cta}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          <div className="lg:col-span-2 hidden lg:flex flex-col gap-4">
            <div className="flex-1 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04]">
                <service.icon size={240} className="absolute -bottom-10 -right-10 text-slate-900" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-5 border border-primary/15">
                  <service.icon size={28} />
                </div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  {service.category}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed max-w-[160px] mx-auto">
                  Expert-backed service with guaranteed quality and support.
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-900 text-white p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Verified & Trusted</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All our services are backed by certified professionals and quality guarantees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabId = searchParams.get('tab') || 'agreement';
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  const activeService = SERVICES.find((s) => s.id === activeTabId) || SERVICES[0];

  const visibleServices =
    activeCategory === 'All'
      ? SERVICES
      : SERVICES.filter((s) => s.category === activeCategory);

  // If active tab gets filtered out, keep it visible in the list anyway
  const sidebarServices =
    visibleServices.find((s) => s.id === activeTabId)
      ? visibleServices
      : [activeService, ...visibleServices];

  const handleTabClick = (id) => {
    setSearchParams({ tab: id });
  };

  const isCalculatorTab = activeTabId === 'rental-yield' || activeTabId === 'buying-vs-renting';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col">
      {/* Category Navigation Bar - Prominent */}
      <nav className="w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center gap-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-base font-bold transition-all duration-500 ease-in-out tracking-wide ${
                  activeCategory === cat 
                    ? 'text-primary border-b-3 border-primary pb-2 scale-105 transform' 
                    : 'text-slate-600 hover:text-slate-900 hover:scale-105 transform transform'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Layout - Grid */}
      <div className="flex-1 grid grid-cols-[280px_1fr] overflow-y-auto">
        {/* Sidebar - Fixed width */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border-r border-slate-200 shadow-lg h-auto"
        >
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 border-b border-slate-200">
            <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">
              {activeCategory === 'All' ? 'All Services' : activeCategory}
            </p>
          </div>
          <nav className="overflow-y-auto p-3">
            <div className="space-y-1">
              {sidebarServices.map((service) => {
                const isActive = activeTabId === service.id;
                return (
                  <button
                    key={service.id}
                    onClick={() => handleTabClick(service.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'
                      }`}
                    >
                      <service.icon
                        size={18}
                        className={isActive ? 'text-white' : 'text-slate-500'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">
                        {service.title}
                      </div>
                      {!isActive && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {service.category}
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <ChevronRight size={16} className="text-white/70" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </motion.aside>

        {/* Tool Content Area */}
        <main className="p-6 h-auto overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTabId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'ease-in-out' }}
              className="h-auto"
            >
              <ServiceContent service={activeService} navigate={navigate} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}