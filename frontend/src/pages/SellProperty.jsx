import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import { syncHomesAuthToCrm } from '../utils/syncHomesAuthToCrm';
import { Building2, CheckCircle2, Loader2 } from 'lucide-react';
import '@/index.css';

const AddProperty = lazy(() => import('@/pages/admin/AddProperty'));

const STEPS = [
  'Property Basics',
  'Pricing',
  'Location',
  'Media Upload',
  'Amenities',
  'Ownership & Legal',
  'Review & Publish',
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function SellPropertyShell() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('revo_sell_property_draft_meta');
    if (saved) {
      try {
        const meta = JSON.parse(saved);
        if (typeof meta.activeStep === 'number') setActiveStep(meta.activeStep);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'revo_sell_property_draft_meta',
      JSON.stringify({ activeStep, updatedAt: Date.now() })
    );
  }, [activeStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">List Your Property</h1>
              <p className="text-xs text-white/60">Premium listing flow · autosave enabled</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Draft autosave on
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        <aside className="lg:sticky lg:top-24 h-fit">
          <nav className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-2 mb-3">Progress</p>
            {STEPS.map((label, index) => {
              const done = index < activeStep;
              const current = index === activeStep;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                    current
                      ? 'bg-primary/20 text-white border border-primary/40'
                      : done
                        ? 'text-emerald-300/90 hover:bg-white/5'
                        : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done ? 'bg-emerald-500/20 text-emerald-300' : current ? 'bg-primary text-white' : 'bg-white/10'
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
                  </span>
                  <span className="font-medium leading-tight">{label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="crm-add-property-root rounded-2xl border border-white/10 bg-white shadow-2xl overflow-hidden min-h-[70vh]">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-32 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                <p className="text-sm font-medium">Loading property form…</p>
              </div>
            }
          >
            <AddProperty variant="homes" />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function SellProperty() {
  useEffect(() => {
    syncHomesAuthToCrm();
  }, []);

  const client = useMemo(() => queryClient, []);

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <SellPropertyShell />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
