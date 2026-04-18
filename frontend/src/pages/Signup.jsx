import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Signup({ isModal = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { openLogin, signup, openOtp } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Name and Phone are mandatory');
      return;
    }
    
    // 10-digit Indian number validation
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = formData.phone.trim().replace(/\D/g, '').slice(-10);
    if (!phoneRegex.test(cleanPhone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
    }
    
    if (!formData.agreeTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }
    
    try {
      // For Revo Homes users, use Phone OTP for Signup
      const result = await useAuth().sendOtp(cleanPhone, 'sms');
      
      if (result.success) {
        // Redirect to OTP verify with Signup data context
        // Note: For now we'll just open the modal or navigate
        openOtp('sms', cleanPhone);
        
        // Optional: Store registration info in session storage to use after verification
        sessionStorage.setItem('signup_data', JSON.stringify({
          first_name: formData.name.split(' ')[0],
          last_name: formData.name.split(' ').slice(1).join(' '),
          email: formData.email.trim() || undefined,
          phone: cleanPhone
        }));
      } else {
        setError(result.message || 'OTP request failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = (e) => {
    if (isModal) {
      e.preventDefault();
      openLogin();
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
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2">Join REVO HOMES to find your perfect space</p>
        </div>
      )}

      <div className={`${isModal ? '' : 'bg-white rounded-2xl shadow-property-hover border border-gray-100 p-8'}`}>
        {isModal && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-500 mt-1">Join our community today</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-medium">+91</span>
              <input
                type="tel"
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-600">
              I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </span>
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-cta text-white font-semibold rounded-lg hover:bg-cta-hover transition-colors disabled:opacity-70"
          >
            {loading ? 'Sending OTP...' : 'Send OTP for Verification'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link 
            to="/login" 
            onClick={handleLoginClick}
            className="text-primary font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
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

export default Signup;
