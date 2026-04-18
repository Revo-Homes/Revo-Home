import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const RevoUserProfileForm = ({ user, onSubmit }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    locale: 'en',
    timezone: 'Asia/Kolkata',
    date_of_birth: '',
    gender: '',
    meta: {
      preferences: {
        email_notifications: true,
        sms_notifications: false,
        marketing_emails: false
      }
    }
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        locale: user.locale || 'en',
        timezone: user.timezone || 'Asia/Kolkata',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        meta: user.meta || {
          preferences: {
            email_notifications: true,
            sms_notifications: false,
            marketing_emails: false
          }
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (formData.first_name.length < 2) newErrors.first_name = 'First name must be at least 2 characters';
    if (formData.last_name.length < 2) newErrors.last_name = 'Last name must be at least 2 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Show success message
    } catch (error) {
      // Show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full p-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Profile Details</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              placeholder="Tell us about yourself..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                name="locale"
                value={formData.locale}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="bn">বাংলা</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
                <option value="mr">मराठी</option>
                <option value="gu">ગુજરાતી</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="Asia/Kolkata">India Time (IST)</option>
                <option value="Asia/Dubai">Dubai Time</option>
                <option value="Asia/Singapore">Singapore Time</option>
                <option value="Europe/London">London Time</option>
                <option value="America/New_York">New York Time</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="meta.preferences.email_notifications"
              checked={formData.meta.preferences.email_notifications}
              onChange={handleChange}
              className="mr-2"
              disabled={isSubmitting}
            />
            <span className="text-sm">Email notifications for property updates</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              name="meta.preferences.sms_notifications"
              checked={formData.meta.preferences.sms_notifications}
              onChange={handleChange}
              className="mr-2"
              disabled={isSubmitting}
            />
            <span className="text-sm">SMS notifications for important updates</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              name="meta.preferences.marketing_emails"
              checked={formData.meta.preferences.marketing_emails}
              onChange={handleChange}
              className="mr-2"
              disabled={isSubmitting}
            />
            <span className="text-sm">Marketing emails and newsletters</span>
          </label>
        </div>
      </div>

      {/* Account Status (Display Only) */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Account Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Account Status:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              user?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user?.status || 'Unknown'}
            </span>
          </div>
          
          <div>
            <span className="text-gray-600">Email Verified:</span>
            <span className={`ml-2 ${user?.email_verified_at ? 'text-green-600' : 'text-red-600'}`}>
              {user?.email_verified_at ? '✓ Verified' : '✗ Not Verified'}
            </span>
          </div>
          
          <div>
            <span className="text-gray-600">Phone Verified:</span>
            <span className={`ml-2 ${user?.phone_verified_at ? 'text-green-600' : 'text-red-600'}`}>
              {user?.phone_verified_at ? '✓ Verified' : '✗ Not Verified'}
            </span>
          </div>
          
          <div>
            <span className="text-gray-600">Two-Factor Auth:</span>
            <span className={`ml-2 ${user?.two_factor_enabled ? 'text-green-600' : 'text-gray-600'}`}>
              {user?.two_factor_enabled ? '✓ Enabled' : '✗ Disabled'}
            </span>
          </div>
          
          <div>
            <span className="text-gray-600">Login Method:</span>
            <span className="ml-2">
              {user?.oauth_provider ? `OAuth (${user.oauth_provider})` : 'Email & Password'}
            </span>
          </div>
          
          <div>
            <span className="text-gray-600">Last Login:</span>
            <span className="ml-2">
              {user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default RevoUserProfileForm;
