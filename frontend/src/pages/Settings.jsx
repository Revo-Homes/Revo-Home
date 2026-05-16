import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RevoUserProfileForm from '../components/RevoUserProfileForm';
import AvatarUpload from '../components/AvatarUpload';
import { billingApi } from '../services/billingApi';
import { 
  User, 
  Settings as SettingsIcon, 
  CreditCard, 
  Shield, 
  Bell, 
  ChevronRight, 
  CheckCircle2, 
  Zap, 
  Crown,
  Loader2,
  Calendar,
  IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden ${className}`}>
    {children}
  </div>
);

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
    }
  };

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoadingSubscription(true);
        const response = await billingApi.getActiveSubscription({ categoryKey: 'property_owner_sell' });
        if (response?.data || response) {
          setSubscription(response.data || response);
        }
      } catch (error) {
        console.error('[Settings] Failed to fetch subscription:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, []);

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'My Plan', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#050816] text-white pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black tracking-tight"
          >
            Account <span className="text-blue-500">Settings</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 mt-2"
          >
            Manage your digital presence and property selling preferences.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-3 space-y-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="font-bold text-sm tracking-wide">{tab.label}</span>
                  {isActive && <motion.div layoutId="activeTab" className="ml-auto"><ChevronRight className="h-4 w-4" /></motion.div>}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <GlassCard className="p-8 flex flex-col md:flex-row items-center gap-8">
                    <AvatarUpload user={user} />
                    <div className="text-center md:text-left space-y-2">
                      <h2 className="text-3xl font-black">{user?.first_name} {user?.last_name}</h2>
                      <p className="text-slate-400 font-medium">{user?.email}</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                          {user?.status || 'Active'}
                        </span>
                        {subscription && (
                          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {subscription.planName || subscription.plan?.name || 'Pro User'}
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-white/10">
                          Joined {user?.created_at ? new Date(user.created_at).getFullYear() : '2024'}
                        </span>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-8">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      Personal Information
                    </h3>
                    {updateSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Profile updated successfully!
                      </motion.div>
                    )}
                    <div className="revo-form-dark">
                      <RevoUserProfileForm user={user} onSubmit={handleProfileUpdate} />
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === 'subscription' && (
                <motion.div
                  key="subscription"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold mb-2">Your Current Plan</h3>
                  {loadingSubscription ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching your status...</p>
                    </div>
                  ) : subscription ? (
                    <div className="space-y-6">
                      <GlassCard className={`p-10 relative group ${subscription.planName?.toLowerCase().includes('master') ? 'bg-gradient-to-br from-amber-500/20 via-black to-black border-amber-500/30' : 'bg-gradient-to-br from-blue-600/20 via-black to-black border-blue-500/20'}`}>
                        {subscription.planName?.toLowerCase().includes('master') && (
                          <Crown className="absolute top-8 right-8 h-12 w-12 text-amber-500/20 group-hover:text-amber-500/40 transition-colors" />
                        )}
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                          <div className="space-y-6">
                            <div className="space-y-1">
                              <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Active Plan</p>
                              <h4 className="text-4xl font-black text-white">{subscription.planName || subscription.plan?.name || 'Active Subscription'}</h4>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-white/5 text-slate-400"><Calendar className="h-4 w-4" /></div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Renews On</p>
                                  <p className="text-sm font-bold text-slate-200">
                                    {subscription.currentPeriodEnd || subscription.current_period_end
                                      ? new Date(subscription.currentPeriodEnd || subscription.current_period_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                      : 'Lifetime Access'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-white/5 text-slate-400"><IndianRupee className="h-4 w-4" /></div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Billing Amount</p>
                                  <p className="text-sm font-bold text-slate-200">
                                    ₹{(subscription.totalAmount || subscription.total_amount || 0).toLocaleString()} <span className="text-[10px] opacity-50 font-medium">/{subscription.billingCycle || 'one-time'}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col justify-end">
                            <button className="px-8 py-4 bg-white text-black rounded-2xl font-black text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]">
                              MANAGE PLAN
                            </button>
                          </div>
                        </div>
                      </GlassCard>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GlassCard className="p-6 space-y-4">
                          <h5 className="font-bold text-sm text-slate-300">Plan Status</h5>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">{subscription.status}</span>
                          </div>
                        </GlassCard>
                        <GlassCard className="p-6 space-y-4">
                          <h5 className="font-bold text-sm text-slate-300">Category</h5>
                          <span className="text-blue-400 text-xs font-black uppercase tracking-widest">{subscription.categoryKey || 'General'}</span>
                        </GlassCard>
                      </div>
                    </div>
                  ) : (
                    <GlassCard className="p-12 text-center space-y-6">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <Zap className="h-10 w-10 text-slate-600" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-bold">No Active Plan</h4>
                        <p className="text-slate-400 max-w-sm mx-auto">
                          You are currently on the free tier. Upgrade to unlock premium property selling tools and featured listings.
                        </p>
                      </div>
                      <button 
                        onClick={() => window.location.href = '/subscription'}
                        className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm tracking-widest hover:bg-blue-500 transition-all shadow-xl"
                      >
                        VIEW PLANS
                      </button>
                    </GlassCard>
                  )}
                </motion.div>
              )}

              {(activeTab === 'notifications' || activeTab === 'security') && (
                <motion.div
                  key="coming-soon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 text-center"
                >
                  <SettingsIcon className="h-12 w-12 text-slate-700 mx-auto mb-4 animate-spin-slow" />
                  <h3 className="text-xl font-bold text-slate-300">Coming Soon</h3>
                  <p className="text-slate-500 text-sm mt-2">These settings will be available in the next update.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
