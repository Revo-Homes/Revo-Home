import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, User, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function SignupModal({ isOpen, onClose, onLoginClick }) {
  const { handlePhoneVerified } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [step, setStep] = useState('details'); // 'details' | 'otp'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError('');
  };

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Name and Mobile Number are required');
      return;
    }
    if (formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    // Mock API call
    setTimeout(() => {
      console.log('Signup OTP sent to:', formData.phone);
      setStep('otp');
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (otp.join('').length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    // Mock API call
    setTimeout(() => {
      console.log('User signed up (mock):', formData);
      setSuccess(true);
      setLoading(false);
      
      // Perform mock login via AuthContext to make dashboard visible
      setTimeout(() => {
        handlePhoneVerified(formData.phone);
        onClose();
      }, 1500);
    }, 1000);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`signup-otp-${index + 1}`).focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                <CheckCircle size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Registration Successful!</h2>
              <p className="text-gray-500 mt-2">Welcome to Revo Homes.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                <p className="text-gray-500 mt-1">Join Revo Homes today</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                  {error}
                </div>
              )}

              {step === 'details' ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number *</label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 font-medium whitespace-nowrap">
                        +91
                      </div>
                      <div className="relative flex-1">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="98765 43210"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !formData.name || !formData.phone}
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>

                  <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={onLoginClick}
                      className="text-orange-600 font-bold hover:underline"
                    >
                      Login
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-4">
                      Enter the 6-digit code sent to <b>+91 {formData.phone}</b>
                    </p>
                    <div className="flex justify-between gap-2 max-w-[280px] mx-auto">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`signup-otp-${index}`}
                          type="text"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !otp[index] && index > 0) {
                              document.getElementById(`signup-otp-${index - 1}`).focus();
                            }
                          }}
                          className="w-10 h-12 text-center text-xl font-bold border-2 border-gray-100 rounded-lg focus:border-orange-500 outline-none transition-all"
                          maxLength={1}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Signup'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="text-sm text-gray-500 hover:text-orange-600 transition-colors"
                    >
                      Wait, let me change my number
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default SignupModal;
