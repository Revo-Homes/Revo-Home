import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RevoUserProfileForm from '../components/RevoUserProfileForm';
import AvatarUpload from '../components/AvatarUpload';

const Settings = () => {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [updateSuccess, setUpdateSuccess] = useState(false);

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
        </div>
      </div>
    </div>
  );
};

export default Settings;
