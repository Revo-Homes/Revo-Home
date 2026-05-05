import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

function LoginModal({ isOpen, onClose }) {
  const {
    openSignup, sendOtp, verifyOtp, oauthCallback,
    handleEmailLoginSuccess, closeAuthModal, handlePhoneVerified,
    sendPhoneVerificationOtp, verifyPhoneVerificationOtp,
    authModalMode, otpModeData
  } = useAuth();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('login'); // 'login' | 'otp' | 'link_phone'
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync internal step with AuthContext mode
  useEffect(() => {
    if (isOpen) {
      if (authModalMode === 'otp') {
        if (otpModeData?.mode === 'link_phone') {
          setStep('link_phone');
          setIsLinkingMode(true);
        } else {
          setStep('otp');
          setPhone(otpModeData?.identifier || '');
          setIsLinkingMode(false);
        }
      } else {
        setStep(authModalMode || 'login');
        setIsLinkingMode(false);
      }
    }
  }, [isOpen, authModalMode, otpModeData]);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    if (error) setError('');
  };

  const handleSubmitPhone = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone.trim() || phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isLinkingMode) {
        result = await sendPhoneVerificationOtp(phone);
      } else {
        result = await sendOtp(phone, 'sms', 'login');
      }

      if (result.success) {
        setStep('otp');
      } else {
        setError(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOTP = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isLinkingMode) {
        result = await verifyPhoneVerificationOtp(otpValue);
      } else {
        result = await verifyOtp(phone, otpValue, 'sms');
      }

      if (result.success) {
        onClose();
        handlePhoneVerified(phone);
      } else {
        setError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`login-otp-${index + 1}`).focus();
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const profile = await profileRes.json();

        if (!profile.email) {
          setError('Could not retrieve email from Google');
          return;
        }

        const result = await oauthCallback({
          provider: 'google',
          oauth_id: profile.sub,
          email: profile.email,
          first_name: profile.given_name || '',
          last_name: profile.family_name || '',
          avatar_url: profile.picture || undefined,
        });

        if (result.success) {
          if (result.status === 'phone_required') {
            setIsLinkingMode(true);
            setStep('link_phone');
            console.log('📱 Google login success, but phone is required.');
          } else {
            handleEmailLoginSuccess(result.user);
          }
        } else {
          setError(result.message || 'Google login failed');
        }
      } catch (err) {
        console.error('Google OAuth error:', err);
        setError('Google sign-in failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google sign-in failed'),
    flow: 'implicit',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 'link_phone' ? 'Complete Registration' : 'Welcome Back'}
            </h2>
            <p className="text-gray-500 mt-1">
              {step === 'link_phone' ? 'Please verify your phone number to continue' : 'Login to your account'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          {(step === 'login' || step === 'link_phone') ? (
            <form onSubmit={handleSubmitPhone} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center px-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 font-medium">
                    +91
                  </div>
                  <div className="relative flex-1">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="98765 43210"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>

              {step === 'login' && (
                <>
                  <div className="relative flex items-center py-4">
                    <div className="flex-grow border-t border-gray-100"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">OR</span>
                    <div className="flex-grow border-t border-gray-100"></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => googleLogin()}
                    disabled={loading}
                    className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </button>

                  <p className="text-center text-sm text-gray-500 mt-6">
                    Don’t have an account?{' '}
                    <button
                      type="button"
                      onClick={openSignup}
                      className="text-orange-600 font-bold hover:underline"
                    >
                      Signup
                    </button>
                  </p>
                </>
              )}
            </form>
          ) : (
            <form onSubmit={handleSubmitOTP} className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-4">
                  Enter the 6-digit code sent to <b>+91 {phone}</b>
                </p>
                <div className="flex justify-between gap-2 max-w-[280px] mx-auto">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`login-otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otp[index] && index > 0) {
                          document.getElementById(`login-otp-${index - 1}`).focus();
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
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="text-sm text-gray-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <ArrowLeft size={14} />
                  Change mobile number
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default LoginModal;