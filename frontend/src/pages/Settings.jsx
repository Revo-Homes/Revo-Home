import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RevoUserProfileForm from '../components/RevoUserProfileForm';
import AvatarUpload from '../components/AvatarUpload';
import billingApi from '../services/billingApi';

const Settings = () => {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  const handleProfileUpdate = async (profileData) => {
    try {
      await updateUserProfile(profileData);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Show error message
    }
  };

  // Fetch active subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoadingSubscription(true);
        const response = await billingApi.getActiveSubscription();
        console.log('[Settings] Active subscription:', response);
        if (response?.data) {
          setSubscription(response.data);
        }
      } catch (error) {
        console.error('[Settings] Failed to fetch subscription:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your Revo Homes profile and preferences</p>
      </div>

      {updateSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          Profile updated successfully!
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-6">
          <AvatarUpload user={user} />
          <div>
            <h2 className="text-2xl font-bold">{user?.first_name} {user?.last_name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <span className={`px-2 py-1 rounded text-xs ${
                user?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user?.status}
              </span>
              {subscription && (
                <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 ml-2">
                  {subscription.planName || subscription.plan?.name || 'Active Plan'}
                </span>
              )}
              <span className="text-gray-500">Member since {user?.created_at ? new Date(user.created_at).getFullYear() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-4 border-b-2 font-medium text-sm ${
                activeTab === 'preferences'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Preferences
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className={`py-4 border-b-2 font-medium text-sm ${
                activeTab === 'subscription'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Plan
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <RevoUserProfileForm user={user} onSubmit={handleProfileUpdate} />
          )}
          
          {activeTab === 'preferences' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Account Preferences</h3>
              <p className="text-gray-600">
                Notification preferences and other settings are managed in the Profile Information tab.
              </p>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Current Subscription Plan</h3>
              {loadingSubscription ? (
                <p className="text-gray-600">Loading subscription details...</p>
              ) : subscription ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold text-blue-900">
                        {subscription.planName || subscription.plan?.name || 'Current Plan'}
                      </h4>
                      <p className="text-blue-700 mt-1">
                        Status: <span className="font-semibold capitalize">{subscription.status}</span>
                      </p>
                      <p className="text-blue-600 text-sm mt-1">
                        Category: {subscription.categoryKey || subscription.category || 'N/A'}
                      </p>
                      <p className="text-blue-600 text-sm mt-1">
                        Billing Cycle: {subscription.billingCycle || 'one_time'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-900">
                        ₹{subscription.totalAmount || subscription.total_amount || subscription.amount || 0}
                      </p>
                      <p className="text-blue-600 text-sm">
                        {subscription.gstRate || subscription.gst_rate || 18}% GST included
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">Period:</span>{' '}
                      {subscription.currentPeriodStart || subscription.current_period_start
                        ? new Date(subscription.currentPeriodStart || subscription.current_period_start).toLocaleDateString()
                        : 'N/A'}{' '}
                      -{' '}
                      {subscription.currentPeriodEnd || subscription.current_period_end
                        ? new Date(subscription.currentPeriodEnd || subscription.current_period_end).toLocaleDateString()
                        : 'N/A'}
                    </p>
                    {subscription.paymentProvider || subscription.payment_provider && (
                      <p className="text-sm text-blue-600 mt-1">
                        Payment: {subscription.paymentProvider || subscription.payment_provider}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No active subscription found.</p>
                  <a
                    href="/pricing"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Plans
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
