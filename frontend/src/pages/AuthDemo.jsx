import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function AuthDemo() {
  const { 
    isNewUser, 
    isPhoneVerified, 
    userPhoneNumber,
    openPreAuthModal,
    resetAuthFlow 
  } = useAuth();

  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message }]);
  };

  const handleOpenPreAuth = () => {
    addLog('🚀 Opening Pre-Auth Modal...');
    openPreAuthModal();
  };

  const handleReset = () => {
    addLog('🔄 Resetting auth flow...');
    resetAuthFlow();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication Flow Demo</h1>
          <p className="text-gray-600">Test the new conditional phone verification flow</p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Control Panel</h2>
          <div className="flex gap-4">
            <button
              onClick={handleOpenPreAuth}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Start Authentication Flow
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset Flow
            </button>
          </div>
        </div>

        {/* State Display */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current State</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">User Type</div>
              <div className="font-semibold text-gray-900">
                {isNewUser ? 'New User' : 'Existing User'}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Phone Verified</div>
              <div className={`font-semibold ${isPhoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                {isPhoneVerified ? '✅ Yes' : '❌ No'}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Phone Number</div>
              <div className="font-semibold text-gray-900">
                {userPhoneNumber || 'Not set'}
              </div>
            </div>
          </div>
        </div>

        {/* Flow Instructions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Scenarios</h2>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">📱 New User - Phone First</h3>
              <p className="text-gray-600 text-sm mb-2">
                1. Click "Start Authentication Flow"<br />
                2. Select "Continue with Phone" (Primary option)<br />
                3. Enter phone number & verify OTP<br />
                4. Should redirect to Home Page
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">📧 New User - Email First</h3>
              <p className="text-gray-600 text-sm mb-2">
                1. Click "Start Authentication Flow"<br />
                2. Select "Login using Email"<br />
                3. Complete email login (simulated)<br />
                4. Should show Phone OTP modal (no phone)<br />
                5. Verify phone → redirect to Home
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">👤 Existing User - Email</h3>
              <p className="text-gray-600 text-sm mb-2">
                1. Click "Start Authentication Flow"<br />
                2. Select "Login using Email"<br />
                3. Complete login (simulated with phone)<br />
                4. Should redirect directly to Home
              </p>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Log</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">No activity yet. Start the authentication flow to see logs.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex gap-3 text-sm">
                  <span className="text-gray-400 font-mono">{log.time}</span>
                  <span className="text-gray-700">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthDemo;
