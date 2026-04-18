import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = ['Plan', 'Payment', 'Confirmation'];

function StepBar({ current }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 ${
              i < current ? 'bg-green-500 text-white' :
              i === current ? 'bg-primary text-white shadow-lg shadow-primary/30' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i < current ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest mt-1.5 ${i === current ? 'text-primary' : 'text-gray-400'}`}>{step}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 mx-2 transition-all duration-700 ${i < current ? 'bg-green-400' : 'bg-gray-100'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { subscribeUser } = useAuth();
  const plan = location.state?.plan;
  const from = location.state?.from;
  const returnTo = location.state?.returnTo;
  const savedStep = location.state?.savedStep;
  const [status, setStatus] = useState('idle');
  const [countdown, setCountdown] = useState(3);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!plan) navigate('/subscription');
  }, [plan, navigate]);

  useEffect(() => {
    if (status === 'success') {
      const t = setInterval(() => setCountdown(c => c - 1), 1000);
      const r = setTimeout(() => {
        // If returning from builder form, redirect back to it
        if (returnTo === 'become-builder-form') {
          navigate('/become-builder', {
            state: { 
              returnTo: 'become-builder-form',
              savedStep: savedStep || 2
            }
          });
        } else if (from === 'buy-plan') {
          navigate('/dashboard/settings?tab=buy-plan');
        } else {
          navigate('/dashboard');
        }
      }, 3000);
      return () => { clearInterval(t); clearTimeout(r); };
    }
  }, [status, navigate, from, returnTo, savedStep]);

  if (!plan) return null;

  const rawPrice = parseInt(plan.priceLabel.replace(/[^0-9]/g, ''), 10) || 0;
  const gstAmount = Math.round(rawPrice * 0.18);
  const totalAmount = rawPrice + gstAmount;
  const fmtINR = (n) => `₹${n.toLocaleString('en-IN')}`;

  const currentStep = status === 'idle' ? 1 : status === 'processing' ? 1 : status === 'success' ? 2 : 1;

  const handlePayment = () => {
    setStatus('processing');
    setErrorMessage('');
    setTimeout(() => {
      // Simulate highly reliable payment for demo purposes
      const ok = true; 
      if (ok) { 
        setStatus('success'); 
        subscribeUser(plan.id); 
      } else { 
        setStatus('fail');
        setErrorMessage('Transaction declined by your bank. Please try another method.');
      }
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 overflow-y-auto pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Secure Checkout</p>
          <h1 className="text-3xl font-black text-gray-900">Complete Your Subscription</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-gray-100 p-8 shadow-2xl shadow-gray-100/80"
        >
          <StepBar current={currentStep} />

          <AnimatePresence mode="wait">

            {/* IDLE — Summary + Pay */}
            {status === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {/* Plan badge */}
                <div className="flex items-center gap-4 bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-2xl p-5 mb-7">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">⭐</div>
                  <div>
                    <p className="text-white/60 text-xs font-black uppercase tracking-widest">Selected Plan</p>
                    <p className="text-white font-black text-lg">{plan.name}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-white/60 text-xs font-bold">Base Price</p>
                    <p className="text-white font-black">{fmtINR(rawPrice)}</p>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="bg-gray-50 rounded-2xl p-5 mb-7 border border-gray-100 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-bold">Subtotal (excl. GST)</span>
                    <span className="text-gray-900 font-bold">{fmtINR(rawPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm pb-3 border-b border-gray-200">
                    <span className="text-gray-500 font-bold flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded text-[10px] font-black flex items-center justify-center">%</span>
                      GST (18%)
                    </span>
                    <span className="text-gray-900 font-bold">+ {fmtINR(gstAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-gray-900">Total Due</span>
                    <span className="text-2xl font-black text-primary">{fmtINR(totalAmount)}</span>
                  </div>
                </div>

                {/* PayU gateway badge */}
                <div className="flex items-center gap-4 bg-green-50 border border-green-100 rounded-2xl p-4 mb-7">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="font-black text-[#0eaa28] text-xs tracking-tight">PayU</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Secured by PayU Payment Gateway</p>
                    <p className="text-xs text-gray-400 mt-0.5">UPI • Cards • Net Banking • Wallets</p>
                  </div>
                  <div className="ml-auto flex flex-col gap-1 items-end">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                      <span className="text-[10px] font-black text-green-600 uppercase tracking-wider">SSL Secured</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                      <span className="text-[10px] font-black text-green-600 uppercase tracking-wider">256-bit encrypted</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-base shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Pay {fmtINR(totalAmount)} Securely
                </button>
              </motion.div>
            )}

            {/* PROCESSING */}
            {status === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="py-16 flex flex-col items-center text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 border-4 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Processing Payment</h2>
                <p className="text-gray-400 font-bold text-sm">Please do not close or refresh this page</p>
              </motion.div>
            )}

            {/* SUCCESS */}
            {status === 'success' && (
              <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="py-8 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100"
                >
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-400 font-bold mb-2">Your <strong className="text-gray-700">{plan.name}</strong> subscription is now active.</p>
                <p className="text-primary font-black text-sm mb-8">
                  {returnTo === 'become-builder-form' 
                    ? `Returning to application form in ${countdown}s...` 
                    : `Redirecting in ${countdown}s...`}
                </p>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500 rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 3, ease: 'linear' }}
                  />
                </div>
              </motion.div>
            )}

            {/* FAIL */}
            {status === 'fail' && (
              <motion.div key="fail" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="py-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-100">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Failed</h2>
                <p className="text-gray-400 font-bold mb-8 text-sm">We couldn't process your payment. No charges were made.</p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setStatus('idle')}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black transition-all hover:bg-primary-dark shadow-lg shadow-primary/20">
                    Try Again
                  </button>
                  <button onClick={() => navigate('/subscription')}
                    className="flex-1 py-4 bg-gray-50 border border-gray-200 text-gray-600 rounded-2xl font-bold transition-colors hover:bg-gray-100">
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

        {/* Trust indicators at bottom */}
        {status === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-6 mt-6 text-gray-400 text-xs font-bold flex-wrap">
            {['🔒 256-bit SSL', '✅ PCI Compliant', '🏦 RBI Regulated'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Checkout;
