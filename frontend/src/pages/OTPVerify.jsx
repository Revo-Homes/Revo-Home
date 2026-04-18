import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function OTPVerify({ isModal = false, modalMethod, modalIdentifier }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, closeAuthModal } = useAuth();

  const { method, identifier } = isModal 
    ? { method: modalMethod, identifier: modalIdentifier }
    : (location.state || { method: 'email', identifier: '' });

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    if (pasted.length) {
      const newOtp = [...otp];
      pasted.split('').forEach((char, i) => (newOtp[i] = char));
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Call the real backend verification
      const result = await verifyOtp(identifier, otpValue);
      if (result.success) {
        // Check if phone OTP is required for new users
        if (result.requiresPhoneOTP) {
          // Don't close modal - let phone OTP modal show
          console.log('Email OTP verified, phone OTP required');
          return;
        }
        
        // Phone OTP not required - close modal and navigate
        if (isModal) {
          closeAuthModal();
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className={`w-full ${isModal ? '' : 'max-w-md'}`}>
      {!isModal && (
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-2xl font-bold text-primary">REVO</span>
            <span className="text-2xl font-bold text-gray-900">HOMES</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
          <p className="text-gray-500 mt-2">
            We've sent a 6-digit code to your {method === 'email' ? 'email' : 'phone'}
          </p>
          <p className="font-medium text-gray-900 mt-1">{identifier}</p>
        </div>
      )}

      <div className={`${isModal ? '' : 'bg-white rounded-2xl shadow-property-hover border border-gray-100 p-8'}`}>
        {isModal && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
            <p className="text-gray-500 mt-1">
              Code sent to {identifier}
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-10 sm:w-12 h-12 sm:h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-cta text-white font-semibold rounded-lg hover:bg-cta-hover transition-colors disabled:opacity-70"
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Didn't receive OTP?{' '}
            <button type="button" className="text-primary font-semibold hover:underline">
              Resend
            </button>
          </p>
        </form>
      </div>
    </div>
  );

  if (isModal) return content;

  if (!identifier) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Session expired. Please login again.</p>
          <Link to="/login" className="text-primary font-semibold mt-2 inline-block">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      {content}
    </div>
  );
}

export default OTPVerify;
