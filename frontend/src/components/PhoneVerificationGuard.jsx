import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { userApi } from '../services/api';

/**
 * Guard component that enforces phone verification for Revo Homes users.
 * If a user is logged in but has no phone number (e.g. Google Auth), 
 * it displays a mandatory verification screen.
 */
function PhoneVerificationGuard({ children }) {
  const { user, sendOtp, verifyOtp, syncProfile, logout } = useAuth();
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const otpInputRefs = useRef([]);

  // If user is not logged in or already has a phone, just show children
  if (!user || user.phone) {
    return children;
  }

  // Handle Phone Number Submit
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    try {
      const result = await sendOtp(cleanPhone, 'sms');
      if (result.success) {
        setStep('otp');
      } else {
        setError(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/\D/g, '');
      const result = await verifyOtp(cleanPhone, otpValue, 'sms');
      
      if (result.success) {
        // Successful verification - Now link this phone to the user account
        await userApi.updateMe(user.id, { phone: cleanPhone });
        await syncProfile();
        setSuccess(true);
      } else {
        setError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-8 sm:p-10">
            <AnimatePresence mode="wait">
              {/* Step 1: Collect Phone Number */}
              {step === 'phone' && !success && (
                <motion.div
                  key="phone-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Phone className="text-primary" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Phone</h2>
                    <p className="text-gray-600">To secure your account and access the dashboard, please verify your mobile number.</p>
                  </div>

                  <form onSubmit={handlePhoneSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+91</span>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="9876543210"
                          className="w-full pl-16 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-lg"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                        <AlertCircle size={16} />
                        <p>{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                    </button>

                    <button 
                      type="button"
                      onClick={logout}
                      className="w-full py-2 text-gray-500 text-sm hover:text-red-500 transition-colors"
                    >
                      Logout and exit
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Verify OTP */}
              {step === 'otp' && !success && (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-8">
                    <button
                      onClick={() => setStep('phone')}
                      className="mb-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Code</h2>
                    <p className="text-gray-600">Enter the 6-digit code sent to +91 {phoneNumber}</p>
                  </div>

                  <form onSubmit={handleOtpSubmit} className="space-y-8">
                    <div className="flex justify-center gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpInputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-14 border-2 border-gray-200 rounded-xl text-center text-xl font-bold focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                          maxLength={1}
                        />
                      ))}
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                        <AlertCircle size={16} />
                        <p>{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify and Access Dashboard'}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Success Screen */}
              {success && (
                <motion.div
                  key="success-step"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-600" size={48} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Phone Verified!</h2>
                  <p className="text-gray-600 mb-8">Your account is now fully secured. You can now access your dashboard.</p>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhoneVerificationGuard;
