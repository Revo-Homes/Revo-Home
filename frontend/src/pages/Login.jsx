import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

function Login({ isModal = false, isPropertyDetails = false }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { openSignup, openOtp, sendOtp, oauthCallback, closeAuthModal, handleEmailLoginSuccess } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone.trim()) {
      setError('Mobile number is mandatory');
      return;
    }
    
    // 10-digit Indian number validation
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    if (!phoneRegex.test(cleanPhone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    const identifier = cleanPhone;
    setLoading(true);
    try {
      // Send OTP to the backend
      const result = await sendOtp(identifier, 'sms');
      if (result.success) {
        openOtp('sms', identifier);
        
        // Note: Don't simulate login success here
        // Let the user go through proper OTP verification flow
        console.log('OTP sent successfully, waiting for verification');
      } else {
        navigate('/otp-verify', { state: { method: 'sms', identifier } });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Real Google OAuth using @react-oauth/google
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        // Fetch the user's profile from Google using the access token
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const profile = await profileRes.json();

        if (!profile.email) {
          setError('Could not retrieve email from Google. Please try again.');
          return;
        }

        // Send to our backend OAuth callback
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
            // Store temp token and navigate to OTP verify with a special flag
            openOtp('sms', '', 'link_phone');
            return;
          }
          if (isModal) {
            // Handle email login success for new auth flow
            if (!isPropertyDetails) {
              handleEmailLoginSuccess(result.user); // Pass user data to check if they have phone
            } else {
              closeAuthModal();
            }
          } else {
            navigate('/dashboard');
          }
        } else {
          setError(result.message || 'Google sign-in failed. Please try again.');
        }
      } catch (err) {
        console.error('Google OAuth error:', err);
        setError('Google sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Google OAuth Login Error:', errorResponse);
      setError('Google sign-in was cancelled or failed. Please try again.');
    },
    flow: 'implicit', // Uses popup by default
  });

  
  const content = (
    <div className={`w-full ${isModal ? '' : 'max-w-md'}`}>
      {!isModal && (
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-2xl font-bold text-primary">REVO</span>
            <span className="text-2xl font-bold text-gray-900">HOMES</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">
            {isPropertyDetails ? 'Login to View Property Details' : 'Login to access full property details'}
          </p>
        </div>
      )}

      <div className={`${isModal ? '' : 'bg-white rounded-2xl shadow-property-hover border border-gray-100 p-8'}`}>
        {isModal && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 mt-1">
              {isPropertyDetails ? 'Login to View Property Details' : 'Login to your account'}
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-cta text-white font-semibold rounded-lg hover:bg-cta-hover transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          
          <button
            type="button"
            className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={() => googleLogin()}
            disabled={loading}
          >
           <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </form>

              </div>
    </div>
  );

  if (isModal) return content;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      {content}
    </div>
  );
}

export default Login;

  
