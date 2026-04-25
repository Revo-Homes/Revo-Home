import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout as authLogout } from '../store/slices/authSlice';
import { authApi, userApi } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  // Modal and UI state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); 
  const [otpModeData, setOtpModeData] = useState({ method: 'email', identifier: '' });
  const [isPropertyDetailsLogin, setIsPropertyDetailsLogin] = useState(false); // Track if login is for property details
  
  // New authentication flow state
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true); // Track if user is new (frontend only)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false); // Initialize as false, set in useEffect
  const [userPhoneNumber, setUserPhoneNumber] = useState(''); // Initialize as empty, set in useEffect

  const handleLogoutLocally = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('phoneVerified'); // Clear phone verification on logout
        localStorage.removeItem('userPhoneNumber'); // Clear phone number on logout
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    setUser(null);
    setIsLoggedIn(false);
    dispatch(authLogout());
  };

  const syncProfile = useCallback(async () => {
    try {
      const response = await userApi.getMe();
      const userData = response.data?.user || response.user || response;
      
      // Add Revo Homes organization context (ID: 1)
      if (userData) {
        userData.organization = {
          id: 1,
          name: 'Revo Homes',
          slug: 'revo_homes'
        };
      }
      
      setUser(userData);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Error saving user to localStorage:', error);
      }
      return userData;
    } catch (err) {
      console.error('AuthContext: Profile sync failed:', err);
      if (err.status === 401) {
        handleLogoutLocally();
      }
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try cookie-based auth first (Revo Home uses cookies now)
        const userData = await syncProfile();
        if (userData) {
          setIsLoggedIn(true);
          setLoading(false);
          return;
        }
        
        // Fallback to localStorage token (for backward compatibility / CRM frontend)
        const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
        const savedUser = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
        
        if (token) {
          if (savedUser) {
            try {
              const u = JSON.parse(savedUser);
              setUser(u);
              setIsLoggedIn(true);
              dispatch(loginSuccess({ user: u, token }));
            } catch (_) {}
          }
          
          // For temporary tokens from phone verification, skip backend sync
          if (token.startsWith('temp_token_')) {
            console.log('📱 Using temporary token from phone verification');
            setIsLoggedIn(true);
          } else {
            // Always verify token/sync profile on load for real tokens
            const userData = await syncProfile();
            setIsLoggedIn(Boolean(userData));
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [dispatch, syncProfile]);

  // Log authentication state changes
  useEffect(() => {
    if (isLoggedIn) {
      console.log('✅ Authentication complete, user is logged in');
    }
  }, [isLoggedIn]);

  // Initialize localStorage values safely after component mount
  useEffect(() => {
    try {
      // Check if phone was previously verified in this session
      const phoneVerified = localStorage.getItem('phoneVerified') === 'true';
      setIsPhoneVerified(phoneVerified);
      
      // Get previously verified phone number from localStorage
      const phoneNumber = localStorage.getItem('userPhoneNumber') || '';
      setUserPhoneNumber(phoneNumber);
    } catch (error) {
      console.error('Error initializing localStorage values:', error);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.login({ email, password });
      const token = response.token || response.access_token || response.data?.access_token;
      const userData = response.user || response.data?.user;
      
      if (userData || token) {
        // Cookie is automatically set by backend - no need to store token in localStorage
        // But keep backward compatibility for CRM frontend
        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
        }
        
        // Sync full profile from backend
        const syncedUser = await syncProfile();
        const finalUser = syncedUser || userData;
        
        setIsLoggedIn(true);
        dispatch(loginSuccess({ user: finalUser, token }));
        return { success: true, user: finalUser };
      }
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      setError(err.message || 'Login failed');
      return { success: false, message: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    if (!user?.id) return { success: false, message: 'User not logged in' };
    try {
      setSaving(true);
      await userApi.updateMe(user.id, profileData);
      const updatedUser = await syncProfile();
      dispatch(loginSuccess({ user: updatedUser, token: localStorage.getItem(TOKEN_KEY) }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      handleLogoutLocally();
      // Clear phone verification state on logout
      setIsPhoneVerified(false);
      setUserPhoneNumber('');
      window.location.href = '/';
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await authApi.forgotPassword({ email });
      return { success: true, message: response.message };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, new_password) => {
    try {
      setLoading(true);
      const response = await authApi.resetPassword({ token, new_password });
      return { success: true, message: response.message };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (old_password, new_password) => {
    try {
      setLoading(true);
      const response = await authApi.changePassword({ old_password, new_password });
      return { success: true, message: response.message };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailToken = async (token) => {
    try {
      setLoading(true);
      const response = await authApi.verifyEmailToken({ token });
      return { success: true, message: response.message };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const verify2fa = async (user_id, code) => {
    try {
      setLoading(true);
      const response = await authApi.verify2fa({ user_id, code });
      return { success: true, data: response };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (identifier, channel = 'sms') => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.sendOtp({ identifier, channel });
      return { success: true, message: response.message || 'OTP sent successfully!' };
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
      return { success: false, message: err.message || 'Failed to send OTP' };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (identifier, code, channel = 'sms') => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.verifyOtp({ identifier, code, channel });
      const token = response.token || response.access_token || response.data?.access_token;
      if (token) {
        // Check if this is OAuth flow completion
        const oauthToken = localStorage.getItem('oauthToken');
        const oauthUserData = localStorage.getItem('oauthUserData');
        
        let userData;
        let finalToken = token;
        
        if (oauthToken && oauthUserData) {
          // OAuth flow completion - use stored OAuth data
          userData = JSON.parse(oauthUserData);
          finalToken = oauthToken;
          
          // Clean up OAuth storage
          localStorage.removeItem('oauthToken');
          localStorage.removeItem('oauthUserData');
          
          console.log('🔐 OAuth OTP verified successfully');
        } else {
          // Regular email OTP flow
          localStorage.setItem(TOKEN_KEY, token);
          userData = await syncProfile();
          console.log('📧 Email OTP verified successfully');
        }
        
        // Check if this is a new user (no phone in profile)
        const hasPhoneFromBackend = userData && userData.phone;
        
        // POST-VERIFICATION: If we have signup data stored, update the profile now
        const signupData = sessionStorage.getItem('signup_data');
        if (signupData) {
          try {
            const parsedData = JSON.parse(signupData);
            if (parsedData.phone === identifier || parsedData.phone === identifier.replace(/\D/g, '').slice(-10)) {
              console.log('📝 Updating new user profile with signup data...', parsedData);
              await userApi.updateMe(userData.id, parsedData);
              userData = await syncProfile(); // Refresh userData
              sessionStorage.removeItem('signup_data');
            }
          } catch (e) {
            console.error('Failed to apply signup data:', e);
          }
        }
        
        // Always log the user in after successful OTP verification
        // Phone verification for dashboard actions is handled by PhoneVerificationGuard
        setUser(userData);
        setIsLoggedIn(true);
        setIsNewUser(false);
        if (hasPhoneFromBackend || signupData) {
          setIsPhoneVerified(true);
        }
        console.log('✅ User fully authenticated via OTP');
        
        dispatch(loginSuccess({ user: userData, token: finalToken }));
        return { success: true, user: userData, token: finalToken };
      }
      throw new Error(response.message || 'OTP verification failed');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: error.message || 'Invalid OTP. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const oauthCallback = async (payload) => {
    try {
      setLoading(true);
      const response = await authApi.oauthCallback(payload);
      const token = response.token || response.access_token || response.data?.access_token;
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        const userData = await syncProfile();
        
        // Always log in after successful OAuth
        // Phone verification happens inside the dashboard via PhoneVerificationGuard
        setIsLoggedIn(true);
        setIsNewUser(false);
        if (userData && userData.phone) {
          setIsPhoneVerified(true);
        }
        dispatch(loginSuccess({ user: userData, token }));
        return { success: true, user: userData, token };
      }
      return { success: false, message: 'OAuth failed' };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data) => {
    try {
      setLoading(true);
      const response = await userApi.create({ ...data, role: 'revo_user' }); 
      const token = response.token || response.access_token || response.data?.access_token;
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        const userData = await syncProfile();
        setIsLoggedIn(true);
        dispatch(loginSuccess({ user: userData, token }));
        return { success: true, user: userData, token };
      }
      return { success: true, message: 'User created. Please sign in.' };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, message: error.message || 'Signup failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const openLogin = () => { setAuthModalMode('login'); setShowAuthModal(true); };
  const openLoginForPropertyDetails = () => {
    setIsPropertyDetailsLogin(true);
    setAuthModalMode('login'); 
    setShowAuthModal(true);
  };
  const openSignup = () => {
    setShowAuthModal(false);
    setShowSignupModal(true);
  };

  const openOtp = (method, identifier) => {
    setOtpModeData({ method, identifier });
    setAuthModalMode('otp');
    setShowAuthModal(true);
  };

  const closeAuthModal = () => setShowAuthModal(false);
  const closeSignupModal = () => setShowSignupModal(false);

  const handlePhoneVerified = (phoneNumber) => {
    setUserPhoneNumber(phoneNumber);
    setIsPhoneVerified(true);
    
    // Persist phone verification in localStorage
    localStorage.setItem('phoneVerified', 'true');
    localStorage.setItem('userPhoneNumber', phoneNumber);
    
    // Create a temporary user session for demo purposes
    // In production, this would involve actual backend authentication
    const tempUser = {
      id: 'temp_user_' + Date.now(),
      email: 'user@example.com',
      phone: phoneNumber,
      first_name: 'User',
      last_name: 'Demo',
      isPhoneVerified: true
    };
    
    // Create a temporary token for demo purposes
    const tempToken = 'temp_token_' + Date.now();
    
    // Set user as logged in
    setUser(tempUser);
    setIsLoggedIn(true);
    localStorage.setItem(TOKEN_KEY, tempToken);
    localStorage.setItem(USER_KEY, JSON.stringify(tempUser));
    
    // Dispatch login success for Redux
    dispatch(loginSuccess({ user: tempUser, token: tempToken }));
    
    console.log('✅ Phone verified and user logged in:', phoneNumber);
    
    // After phone verification, redirect to home
    window.location.href = '/';
  };

  const handleEmailLoginSuccess = (userData) => {
    setShowAuthModal(false);
    // Always redirect to home after successful email login
    // Phone verification for dashboard actions is handled by PhoneVerificationGuard
    window.location.href = '/';
  };

  const subscribeUser = async (planId) => {
    // Assuming backend handles this via a future endpoint
    console.log('AuthContext: Subscribing user to plan:', planId);
    if (!user) return false;
    setUser(prev => ({ ...prev, isSubscribed: true, subscriptionPlan: planId }));
    return true;
  };

  // Role-based profile management
  const updateUserProfile = useCallback(async (profileData) => {
    try {
      const response = await userApi.updateMe(profileData);
      setUser(prev => ({ ...prev, ...response.data.user }));
      return response.data.user;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }, []);

  const updateUserPreferences = useCallback(async (preferences) => {
    try {
      const response = await userApi.updatePreferences(preferences);
      setUser(prev => ({ ...prev, ...response.data.user }));
      return response.data.user;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }, []);

  // NO password change for revo_user - OAuth users only
  // const changeUserPassword = null; // Not available for revo_user


  
  return (
    <AuthContext.Provider
      value={{
        user, isLoggedIn, loading, saving, error,
        isSubscribed: user?.isSubscribed || false,
        showAuthModal, authModalMode, otpModeData, showSignupModal,
        setAuthModalMode, openLogin, openSignup, openOtp, closeAuthModal, closeSignupModal,
        openLoginForPropertyDetails, isPropertyDetailsLogin,
        // New authentication flow
        isNewUser, isPhoneVerified, userPhoneNumber,
        handlePhoneVerified, handleEmailLoginSuccess,
        login, logout, sendOtp, verifyOtp, signup, updateProfile, subscribeUser,
        forgotPassword, resetPassword, changePassword, verifyEmailToken, verify2fa, oauthCallback,
        syncProfile, updateUserProfile, updateUserPreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
