import { Lock, CheckCircle2, X } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * LoginPromptBanner - Reusable component for prompting guest users to sign in
 * 
 * @param {Object} props
 * @param {Function} props.onSignIn - Callback when sign in button is clicked
 * @param {Function} props.onDismiss - Callback when dismiss button is clicked (optional)
 * @param {string} props.feature - Feature name to display (e.g., "view complete details")
 * @param {boolean} props.showDismiss - Whether to show dismiss button (default: false)
 * @param {string} props.variant - "default" | "compact" | "sidebar" (default: "default")
 */
const LoginPromptBanner = ({ 
  onSignIn, 
  onDismiss, 
  feature = 'view complete details',
  showDismiss = false,
  variant = 'default'
}) => {
  const benefits = [
    'Contact owner directly',
    'View all property photos',
    'Save favorite properties',
    'Get price alerts'
  ];

  if (variant === 'compact') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Lock className="text-primary" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">Sign in to {feature}</p>
            <p className="text-xs text-gray-500 truncate">Get full access to all features</p>
          </div>
          <button 
            onClick={onSignIn}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg text-sm hover:bg-primary-dark transition-all whitespace-nowrap"
          >
            Sign In
          </button>
        </div>
      </motion.div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-[2.5rem] p-8 border border-primary/20 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative">
          <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
            <Lock className="text-primary" size={28} />
          </div>
          
          <h3 className="text-xl font-black text-gray-900 mb-3">Unlock Full Access</h3>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Sign in to {feature}, view complete specs, and schedule visits.
          </p>
          
          <button
            onClick={onSignIn}
            className="w-full py-4 bg-primary text-white font-black text-sm rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            Sign In to Continue
          </button>
          
          <div className="mt-6 space-y-3 text-xs text-gray-500">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Lock className="text-primary" size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-gray-900 mb-1">
              Sign in to {feature}
            </h3>
            {showDismiss && onDismiss && (
              <button 
                onClick={onDismiss}
                className="text-gray-400 hover:text-gray-600 transition-all p-1"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Get access to full property information, owner contact details, save favorites, and schedule visits.
          </p>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={onSignIn}
              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all"
            >
              Sign In / Sign Up
            </button>
            {showDismiss && onDismiss && (
              <button 
                onClick={onDismiss}
                className="px-4 py-2.5 text-gray-500 hover:text-gray-700 font-medium transition-all"
              >
                Continue as Guest
              </button>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-primary/10 grid grid-cols-2 gap-2">
            {benefits.slice(0, 4).map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle2 size={12} className="text-primary flex-shrink-0" />
                <span className="truncate">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPromptBanner;
