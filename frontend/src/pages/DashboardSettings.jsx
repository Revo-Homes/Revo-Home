import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProperty } from '../contexts/PropertyContext';
import { userApi } from '../services/api';
import billingApi from '../services/billingApi';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile',      label: 'Profile',      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'professional', label: 'Professional', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'security',     label: 'Security',     icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'activity',     label: 'Activity',     icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'my-plan',      label: 'My Plan',      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const INPUT_BASE = `w-full h-12 px-4 bg-white border border-gray-200 rounded-xl
  focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400
  font-medium text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm
  hover:border-gray-300 shadow-sm`;

const LABEL = "block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2";

// ─── VIEW MODEL ─────────────────────────────────────────────────────────────────
class UserProfileViewModel {
  constructor(backendData = {}) {
    this.raw = backendData;
    const { firstName, lastName } = this.parseNames(backendData.first_name, backendData.last_name);
    this.firstName  = firstName;
    this.lastName   = lastName;
    this.fullName   = `${firstName} ${lastName}`.trim();
    this.email      = backendData.email || '';
    this.phone      = backendData.phone || '';
    this.avatarUrl  = backendData.avatar_url || '';
    this.bio        = backendData.bio || '';
    this.gender     = backendData.gender || 'prefer_not_to_say';
    this.dateOfBirth = this.formatDate(backendData.date_of_birth);
    this.locality   = backendData.meta?.locality || '';
    this.locale     = backendData.locale || 'en';
    this.timezone   = backendData.timezone || 'Asia/Kolkata';
    this.specialization    = backendData.specialization || '';
    this.yearsOfExperience = backendData.years_of_experience ?? null;
    this.licenseNumber     = backendData.license_number || '';
    this.licenseExpiry     = this.formatDate(backendData.license_expiry);
    this.emailVerifiedAt   = backendData.email_verified_at;
    this.phoneVerifiedAt   = backendData.phone_verified_at;
    this.isEmailVerified   = !!backendData.email_verified_at;
    this.isPhoneVerified   = !!backendData.phone_verified_at;
    this.twoFactorEnabled  = backendData.two_factor_enabled || false;
    this.oauthProvider     = backendData.oauth_provider || null;
    this.isOAuthUser       = !!backendData.oauth_provider;
    this.lastLoginAt       = this.formatDateTime(backendData.last_login_at);
    this.createdAt         = this.formatDate(backendData.created_at);
    this.role              = backendData.role || 'user';
    this.status            = backendData.status || 'active';
    this.organizationId        = backendData.organization_id;
    this.reportingManagerId    = backendData.reporting_manager_id;
  }
  parseNames(firstName = '', lastName = '') {
    if (firstName && firstName.includes(' ') && !lastName) {
      const parts = firstName.trim().split(/\s+/);
      return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
    }
    return { firstName: firstName || '', lastName: lastName || '' };
  }
  formatDate(d) {
    if (!d) return '';
    if (typeof d === 'string' && d.includes('T')) return d.split('T')[0];
    return d;
  }
  formatDateTime(d) {
    if (!d) return null;
    try {
      const date = new Date(d);
      return {
        raw: d,
        formatted: date.toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' }),
        relative: this.getRelativeTime(date)
      };
    } catch { return { raw: d, formatted: d, relative: null }; }
  }
  getRelativeTime(date) {
    const diff = Date.now() - date;
    const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), dy = Math.floor(diff/86400000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (dy < 7) return `${dy}d ago`;
    return null;
  }
  getProfileCompletion() {
    const fields = [this.firstName, this.lastName, this.email, this.phone, this.bio, this.dateOfBirth, this.locality, this.avatarUrl];
    return Math.round(fields.filter(Boolean).length / fields.length * 100);
  }
  toUpdatePayload(fd) {
    const p = {};
    if (fd.firstName !== undefined)        p.first_name         = fd.firstName || null;
    if (fd.lastName !== undefined)         p.last_name          = fd.lastName || null;
    if (fd.phone !== undefined)            p.phone              = fd.phone ? fd.phone.replace(/\D/g,'') : null;
    if (fd.bio !== undefined)              p.bio                = fd.bio || null;
    if (fd.avatarUrl !== undefined)        p.avatar_url         = fd.avatarUrl || null;
    if (fd.gender !== undefined)           p.gender             = fd.gender || null;
    if (fd.dateOfBirth !== undefined)      p.date_of_birth      = fd.dateOfBirth || null;
    if (fd.locale !== undefined)           p.locale             = fd.locale;
    if (fd.timezone !== undefined)         p.timezone           = fd.timezone;
    if (fd.specialization !== undefined)   p.specialization     = fd.specialization || null;
    if (fd.yearsOfExperience !== undefined) p.years_of_experience = fd.yearsOfExperience !== '' ? parseInt(fd.yearsOfExperience,10) : null;
    if (fd.licenseNumber !== undefined)    p.license_number     = fd.licenseNumber || null;
    if (fd.licenseExpiry !== undefined)    p.license_expiry     = fd.licenseExpiry || null;
    if (fd.locality !== undefined)         p.meta               = { ...(this.raw.meta||{}), locality: fd.locality || null };
    return p;
  }
}

// ─── ERROR BOUNDARY ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(e, i) { console.error('[DashboardSettings]', e, i); }
  render() {
    if (this.state.hasError) return (
      <div className="p-8 bg-red-50 rounded-2xl border border-red-100 text-center">
        <p className="text-red-600 font-bold text-lg mb-2">Something went wrong</p>
        <p className="text-red-400 text-sm mb-4">{this.state.error?.message}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold">Reload</button>
      </div>
    );
    return this.props.children;
  }
}

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function Icon({ path, className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );
}

function Badge({ children, variant = 'default' }) {
  const styles = {
    default: 'bg-gray-100 text-gray-600',
    red:     'bg-red-50 text-red-600 border border-red-100',
    green:   'bg-emerald-50 text-emerald-600 border border-emerald-100',
    yellow:  'bg-amber-50 text-amber-600 border border-amber-100',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${styles[variant]}`}>
      {children}
    </span>
  );
}

function FieldInput({ label, error, hint, icon, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className={LABEL}>{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>}
        <input
          {...props}
          className={`${INPUT_BASE} ${icon ? 'pl-10' : ''} ${error ? 'border-red-400 focus:ring-red-400/30' : ''} ${className}`}
        />
      </div>
      {error && <p className="text-red-500 text-xs font-semibold mt-1">{error}</p>}
      {hint && !error && <p className="text-amber-500 text-xs font-medium mt-1">{hint}</p>}
    </div>
  );
}

function FieldSelect({ label, error, children, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className={LABEL}>{label}</label>}
      <select {...props} className={`${INPUT_BASE} appearance-none cursor-pointer`}>
        {children}
      </select>
      {error && <p className="text-red-500 text-xs font-semibold mt-1">{error}</p>}
    </div>
  );
}

function FieldTextarea({ label, error, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className={LABEL}>{label}</label>}
      <textarea
        {...props}
        className={`${INPUT_BASE} h-auto py-3 resize-none leading-relaxed ${error ? 'border-red-400' : ''}`}
      />
      {error && <p className="text-red-500 text-xs font-semibold mt-1">{error}</p>}
    </div>
  );
}

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────
function Section({ title, subtitle, icon, children, className = '', action = null }) {
  return (
    <div className={`mb-8 last:mb-0 ${className}`}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-red-200 flex-shrink-0 mt-0.5">
            {icon}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-base leading-tight">{title}</h4>
            {subtitle && <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && (
          <div className="flex-shrink-0 ml-4">
            {action}
          </div>
        )}
      </div>
      <div className="pl-0">{children}</div>
    </div>
  );
}

// ─── SAVE BUTTON ──────────────────────────────────────────────────────────────
function SaveButton({ loading, success }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={!loading ? { scale: 1.02 } : {}}
      whileTap={!loading ? { scale: 0.97 } : {}}
      className={`relative overflow-hidden px-8 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-300 flex items-center gap-2
        ${success ? 'bg-emerald-500 shadow-emerald-200' : 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-200 hover:shadow-xl hover:shadow-red-200/50'}
        ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {/* shine effect */}
      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
      {loading ? (
        <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
      ) : success ? (
        <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg> Saved!</>
      ) : (
        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> Save Changes</>
      )}
    </motion.button>
  );
}

// ─── PROFILE CARD ─────────────────────────────────────────────────────────────
function ProfileCard({ viewModel, loading, onAvatarUpload, avatarUploading, isSubscribed }) {
  if (loading || !viewModel) return <ProfileCardSkeleton />;
  const pct = viewModel.getProfileCompletion();
  const initials = [viewModel.firstName?.[0], viewModel.lastName?.[0]].filter(Boolean).join('') || 'U';
  const roleLabel = viewModel.role === 'revo_user' ? 'Customer' : (viewModel.role || 'User');

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full lg:w-[290px] flex-shrink-0"
    >
      {/* Avatar card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/80 border border-gray-100 overflow-hidden">
        {/* Red header stripe */}
        <div className="h-20 bg-gradient-to-br from-red-500 via-red-500 to-red-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{backgroundImage:`radial-gradient(circle at 70% 50%, white 1px, transparent 1px)`, backgroundSize:'18px 18px'}} />
        </div>

        <div className="px-6 pb-6 -mt-10">
          {/* Avatar */}
          <div className="relative inline-block group mb-4">
            <div className="w-20 h-20 rounded-2xl ring-4 ring-white overflow-hidden bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-200">
              {viewModel.avatarUrl
                ? <img src={viewModel.avatarUrl} alt={viewModel.fullName} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl">{initials}</div>}
            </div>
            <label className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
              <input type="file" className="hidden" accept="image/*" onChange={onAvatarUpload} />
              {avatarUploading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                : <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3" strokeWidth={2} /></svg>}
            </label>
          </div>

          <h3 className="font-black text-gray-900 text-lg leading-tight mb-1">{viewModel.fullName || 'Your Name'}</h3>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="red">{roleLabel}</Badge>
            {isSubscribed && <Badge variant="green">Active Plan</Badge>}
          </div>

          {/* Contact info */}
          <div className="space-y-2.5 mb-5">
            {viewModel.email && (
              <div className="flex items-center gap-2.5 text-xs text-gray-600">
                <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <Icon path="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="w-3.5 h-3.5" />
                </div>
                <span className="truncate font-medium">{viewModel.email}</span>
                {viewModel.isEmailVerified
                  ? <span className="ml-auto flex-shrink-0"><Badge variant="green">✓</Badge></span>
                  : <span className="ml-auto flex-shrink-0"><Badge variant="yellow">Unverified</Badge></span>}
              </div>
            )}
            {viewModel.phone && (
              <div className="flex items-center gap-2.5 text-xs text-gray-600">
                <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <Icon path="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">{viewModel.phone}</span>
              </div>
            )}
            {viewModel.locality && (
              <div className="flex items-center gap-2.5 text-xs text-gray-600">
                <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <Icon path="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">{viewModel.locality}</span>
              </div>
            )}
          </div>

          {/* Profile completion */}
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Profile Strength</span>
              <span className="text-xs font-black text-red-500">{pct}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              />
            </div>
            {pct < 100 && (
              <p className="text-[10px] text-gray-400 mt-2 font-medium">Complete your profile to unlock all features</p>
            )}
          </div>
        </div>
      </div>

      {/* Last login card */}
      {viewModel.lastLoginAt && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-3 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500 flex-shrink-0">
            <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Login</p>
            <p className="text-xs font-semibold text-gray-700">{viewModel.lastLoginAt.relative || viewModel.lastLoginAt.formatted}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function ProfileCardSkeleton() {
  return (
    <div className="w-full lg:w-[290px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="h-20 bg-gray-200 animate-pulse" />
      <div className="px-6 pb-6 -mt-10 space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-gray-200 animate-pulse ring-4 ring-white" />
        <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
function Tabs({ active, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100/80 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar backdrop-blur-sm border border-gray-200/60">
      {TABS.map(tab => {
        const isActive = tab.id === active;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)}
            className={`relative flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200
              ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'}`}
          >
            {isActive && (
              <motion.div layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-md shadow-red-200"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon path={tab.icon} className="w-3.5 h-3.5" />
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── FORM SKELETON ────────────────────────────────────────────────────────────
function FormSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
      <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
    </div>
  );
}

// ─── PROFILE FORM ─────────────────────────────────────────────────────────────
function ProfileForm({ formData, onChange, errors = {} }) {
  const set = useCallback((f, v) => onChange(f, v), [onChange]);
  return (
    <div className="bg-white rounded-2xl shadow-md shadow-gray-100/80 border border-gray-100 divide-y divide-gray-50 overflow-hidden">
      {/* Basic Info */}
      <div className="p-8">
        <Section title="Basic Information" subtitle="Your name and contact details" icon={<Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" className="w-4 h-4" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldInput label="First Name" value={formData.firstName} onChange={e => set('firstName', e.target.value)} placeholder="First name" error={errors.firstName} />
            <FieldInput label="Last Name"  value={formData.lastName}  onChange={e => set('lastName', e.target.value)}  placeholder="Last name"  error={errors.lastName} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
            <FieldInput label="Email Address" type="email"
              icon={<Icon path="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="w-4 h-4" />}
              value={formData.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com"
              hint={!formData.email ? "Add email to improve communication" : ""} error={errors.email} />
            <FieldInput label="Phone Number" type="tel"
              icon={<Icon path="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" className="w-4 h-4" />}
              value={formData.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" error={errors.phone} />
          </div>
        </Section>
      </div>

      {/* Personal Info */}
      <div className="p-8">
        <Section title="Personal Details" subtitle="Demographics and location" icon={<Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" className="w-4 h-4" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldSelect label="Gender" value={formData.gender} onChange={e => set('gender', e.target.value)}>
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </FieldSelect>
            <FieldInput label="Date of Birth" type="date" value={formData.dateOfBirth}
              onChange={e => set('dateOfBirth', e.target.value)} max={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="mt-5">
            <FieldInput label="Locality / Area"
              icon={<Icon path="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" className="w-4 h-4" />}
              value={formData.locality} onChange={e => set('locality', e.target.value)} placeholder="Your locality or area" />
          </div>
        </Section>
      </div>

      {/* Bio */}
      <div className="p-8">
        <Section title="About You" subtitle="A short bio visible on your profile" icon={<Icon path="M4 6h16M4 12h16m-7 6h7" className="w-4 h-4" />}>
          <FieldTextarea label="Bio" rows={5} value={formData.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell clients a bit about yourself, your experience, and what makes you stand out…" />
          <p className="text-xs text-gray-400 mt-2 text-right font-medium">{(formData.bio || '').length} / 500</p>
        </Section>
      </div>
    </div>
  );
}

// ─── PROFESSIONAL FORM ────────────────────────────────────────────────────────
function ProfessionalForm({ formData, onChange, errors = {} }) {
  const set = useCallback((f, v) => onChange(f, v), [onChange]);
  return (
    <div className="bg-white rounded-2xl shadow-md shadow-gray-100/80 border border-gray-100 overflow-hidden">
      <div className="p-8">
        <Section title="Professional Information" subtitle="Your credentials and expertise" icon={<Icon path="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="w-4 h-4" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldInput label="Specialization" value={formData.specialization}
              onChange={e => set('specialization', e.target.value)} placeholder="e.g. Residential, Commercial" error={errors.specialization} />
            <FieldInput label="Years of Experience" type="number" min="0" max="60"
              value={formData.yearsOfExperience ?? ''} onChange={e => set('yearsOfExperience', e.target.value)}
              placeholder="e.g. 5" error={errors.yearsOfExperience} />
          </div>
        </Section>
      </div>

      <div className="p-8 border-t border-gray-50">
        <Section title="License Details" subtitle="Your professional license information" icon={<Icon path="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" className="w-4 h-4" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldInput label="License Number" value={formData.licenseNumber}
              onChange={e => set('licenseNumber', e.target.value)} placeholder="Enter license number" error={errors.licenseNumber} />
            <FieldInput label="License Expiry Date" type="date" value={formData.licenseExpiry}
              onChange={e => set('licenseExpiry', e.target.value)} min={new Date().toISOString().split('T')[0]} error={errors.licenseExpiry} />
          </div>
          {/* License status callout */}
          {formData.licenseNumber && formData.licenseExpiry && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="mt-5 flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <p className="text-xs font-semibold text-emerald-700">License details on file. Expires {formData.licenseExpiry}.</p>
            </motion.div>
          )}
        </Section>
      </div>
    </div>
  );
}

// ─── SECURITY PANEL ───────────────────────────────────────────────────────────
function SecurityPanel({ viewModel }) {
  const items = [
    {
      label: 'Email Verification',
      sub: viewModel.isEmailVerified ? 'Verified and active' : 'Not yet verified',
      verified: viewModel.isEmailVerified,
      action: !viewModel.isEmailVerified ? { label: 'Verify Now', onClick: () => {} } : null,
    },
    {
      label: 'Phone Verification',
      sub: viewModel.isPhoneVerified ? 'Verified and active' : 'Not yet verified',
      verified: viewModel.isPhoneVerified,
      action: !viewModel.isPhoneVerified && viewModel.phone ? { label: 'Verify Now', onClick: () => {} } : null,
    },
    {
      label: 'Two-Factor Authentication',
      sub: viewModel.twoFactorEnabled ? 'Extra security is enabled' : 'Not enabled — recommended',
      verified: viewModel.twoFactorEnabled,
      action: { label: viewModel.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA', onClick: () => {} },
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md shadow-gray-100/80 border border-gray-100 p-8">
      <Section title="Security & Verification" subtitle="Keep your account safe" icon={<Icon path="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" className="w-4 h-4" />}>
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                ${item.verified ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-50 text-amber-500'}`}>
                {item.verified
                  ? <Icon path="M5 13l4 4L19 7" className="w-5 h-5" />
                  : <Icon path="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
              </div>
              {item.action && (
                <button onClick={item.action.onClick}
                  className="flex-shrink-0 px-4 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors">
                  {item.action.label}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Password change (non-OAuth) */}
      {!viewModel.isOAuthUser && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <Section title="Password" subtitle="Update your login password" icon={<Icon path="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" className="w-4 h-4" />}>
            <button className="px-6 py-3 rounded-xl text-sm font-bold text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center gap-2">
              <Icon path="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" className="w-4 h-4" />
              Change Password
            </button>
          </Section>
        </div>
      )}
      {viewModel.isOAuthUser && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <Icon path="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <p className="text-xs font-semibold text-blue-700">You signed in via <span className="capitalize">{viewModel.oauthProvider}</span>. Password management is handled by your provider.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ACTIVITY PANEL ───────────────────────────────────────────────────────────
function ActivityPanel({ viewModel, propertyStats }) {
  const stats = [
    { label: 'Listed Properties', value: propertyStats.total_properties, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: 'text-red-500 bg-red-50' },
    { label: 'Active Listings',   value: propertyStats.active_listings,   icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-500 bg-emerald-50' },
    { label: 'Total Views',       value: propertyStats.total_views,        icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', color: 'text-blue-500 bg-blue-50' },
    { label: 'Inquiries',         value: propertyStats.total_inquiries,    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: 'text-violet-500 bg-violet-50' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md shadow-gray-100/80 border border-gray-100 p-8">
      <Section title="Activity Overview" subtitle="Your account at a glance" icon={<Icon path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" className="w-4 h-4" />}>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
              className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <Icon path={s.icon} className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-gray-900">{s.value ?? '—'}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-70 mb-1">Member Since</p>
          <p className="text-xl font-black">{viewModel.createdAt || '—'}</p>
          <p className="text-xs opacity-60 mt-0.5 font-medium">Account status: <span className="font-bold capitalize opacity-90">{viewModel.status}</span></p>
        </div>
      </Section>
    </div>
  );
}

// ─── BUY PLAN PANEL ───────────────────────────────────────────────────────────
function BuyPlanPanel({ isSubscribed, user }) {
  const navigate = useNavigate();
  const planName = user?.subscription?.planName || user?.subscriptionPlan;

  return (
    <div className="bg-white rounded-2xl shadow-md shadow-gray-100/80 border border-gray-100 p-8">
      <Section title="Upgrade Your Plan" subtitle="Unlock premium features by choosing a subscription plan" icon={<Icon path="M13 10V3L4 14h7v7l9-11h-7z" className="w-4 h-4" />}>
        {isSubscribed ? (
          <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100/80 rounded-2xl border border-gray-200">
             {/* Subscribed UI */}
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div>
                 <Badge variant="green">Active Subscription</Badge>
                 <h4 className="text-xl font-black text-gray-900 mt-3">{planName ? `${planName} Plan` : 'Active Plan'}</h4>
                 <p className="text-sm text-gray-500 font-medium mt-1">
                   {planName 
                     ? `You are currently subscribed to the ${planName} plan.` 
                     : 'You are currently subscribed to a premium plan with unlimited listings.'}
                 </p>
               </div>
               <button onClick={() => navigate('/subscription')} className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
                 Manage Plan
               </button>
             </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-md shadow-red-200 text-white relative overflow-hidden group">
            {/* Overlay Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_50%,_white_1px,_transparent_1px)] bg-[length:18px_18px]"></div>
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/20 transition-all duration-700" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center px-3 py-1 bg-white/20 text-white text-[11px] font-bold uppercase tracking-widest rounded-full mb-4 shadow-sm backdrop-blur-md">Free Tier</span>
                <h4 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">Ready for more?</h4>
                <p className="text-red-100 text-sm font-medium max-w-md leading-relaxed">Boost your real estate business with unlimited property listings, premium support, detailed analytics, and top-tier visibility.</p>
              </div>
              <button 
                onClick={() => navigate('/subscription', { state: { from: 'buy-plan' } })} 
                className="px-8 py-3.5 bg-white text-red-600 rounded-xl text-sm font-black shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all w-full md:w-auto flex-shrink-0 text-center flex justify-center items-center gap-2"
              >
                View Plans
                <Icon path="M17 8l4 4m0 0l-4 4m4-4H3" className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

// ─── MY PLAN PANEL ────────────────────────────────────────────────────────────
function MyPlanPanel({ subscription, loadingSubscription, onRefreshSubscription }) {
  const navigate = useNavigate();
  
  if (loadingSubscription) {
    return (
      <div className="bg-white rounded-2xl shadow-md shadow-gray-100/80 border border-gray-100 p-8">
        <Section title="My Plan" subtitle="Loading your subscription details..." icon={<Icon path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4" />}>
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        </Section>
      </div>
    );
  }

  console.log('[MyPlanPanel] Subscription:', subscription);
  const hasActivePlan = subscription && 
    (subscription.status === 'active' || subscription.status === 'trialing' || subscription.status === 'paid');
  const planName = subscription?.planName || subscription?.plan?.name || subscription?.plan_name || subscription?.plan_display_name || 'Current Plan';
  const totalAmount = subscription?.totalAmount || subscription?.total_amount || subscription?.totalAmount || 0;
  const categoryKey = subscription?.categoryKey || subscription?.category_key || subscription?.plan_category_key || 'N/A';
  const billingCycle = subscription?.billingCycle || subscription?.billing_cycle || subscription?.plan_billing_cycle || 'one_time';
  const periodStart = subscription?.currentPeriodStart || subscription?.current_period_start || subscription?.currentPeriodStart;
  const periodEnd = subscription?.currentPeriodEnd || subscription?.current_period_end || subscription?.currentPeriodEnd;
  const status = subscription?.status || 'unknown';
  
  // Extract plan features and quotas
  const planFeatures = subscription?.plan_features || subscription?.features || {};
  const planQuotas = subscription?.plan_quota_config || subscription?.quota_config || {};
  const planDescription = subscription?.plan_description || subscription?.description || '';
  const maxProperties = subscription?.plan_max_properties || planQuotas?.max_properties || 0;
  const maxUsers = subscription?.plan_max_users || planQuotas?.max_users || 0;
  const maxTeamSize = subscription?.plan_max_team_size || planQuotas?.max_team_size || 0;
  const maxFeaturedProperties = subscription?.plan_max_featured_properties || planQuotas?.max_featured_properties || 0;
  
  return (
    <div className="bg-white rounded-2xl shadow-md shadow-gray-100/80 border border-gray-100 p-8">
      <Section 
        title="My Plan" 
        subtitle="Your current subscription details" 
        icon={<Icon path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4" />}
        action={
          <button
            onClick={onRefreshSubscription}
            disabled={loadingSubscription}
            className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Icon path="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" className="w-3 h-3" />
            Refresh
          </button>
        }
      >
        {hasActivePlan ? (
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50/80 rounded-2xl border border-green-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <Badge variant="green">{status === 'trialing' ? 'Trialing' : 'Active'}</Badge>
                <h4 className="text-xl font-black text-gray-900 mt-3">{planName}</h4>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  Category: {categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  Billing: {billingCycle}
                </p>
                {periodStart && periodEnd && (
                  <p className="text-sm text-gray-400 mt-2">
                    Valid until: {new Date(periodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-gray-900">₹{totalAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  {subscription?.gstRate || subscription?.gst_rate || 18}% GST included
                </p>
                <button 
                  onClick={() => navigate('/subscription')} 
                  className="mt-4 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
                >
                  Manage Plan
                </button>
              </div>
            </div>

            {/* Plan Description */}
            {planDescription && (
              <div className="mb-6 p-4 bg-white/50 rounded-xl border border-green-100">
                <p className="text-sm text-gray-600 leading-relaxed">{planDescription}</p>
              </div>
            )}

            {/* Plan Features & Quotas */}
            <div className="space-y-4">
              <h5 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Plan Features & Limits</h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {maxProperties > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-green-100">
                    <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                      <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Properties</p>
                      <p className="font-bold text-gray-900">{maxProperties === 999999 ? 'Unlimited' : maxProperties}</p>
                    </div>
                  </div>
                )}

                {maxFeaturedProperties > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-green-100">
                    <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                      <Icon path="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Featured Properties</p>
                      <p className="font-bold text-gray-900">{maxFeaturedProperties === 999999 ? 'Unlimited' : maxFeaturedProperties}</p>
                    </div>
                  </div>
                )}

                {maxUsers > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-green-100">
                    <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                      <Icon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Team Users</p>
                      <p className="font-bold text-gray-900">{maxUsers === 999999 ? 'Unlimited' : maxUsers}</p>
                    </div>
                  </div>
                )}

                {maxTeamSize > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-green-100">
                    <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                      <Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Team Size</p>
                      <p className="font-bold text-gray-900">{maxTeamSize === 999999 ? 'Unlimited' : maxTeamSize}</p>
                    </div>
                  </div>
                )}

                {/* Additional Features */}
                {Object.entries(planFeatures).map(([key, value]) => {
                  if (typeof value === 'boolean' && value) {
                    return (
                      <div key={key} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-green-100">
                        <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                          <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="font-bold text-gray-900">Enabled</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}

                {/* Fallback if no features found */}
                {maxProperties === 0 && maxFeaturedProperties === 0 && maxUsers === 0 && maxTeamSize === 0 && 
                 Object.keys(planFeatures).length === 0 && (
                  <div className="col-span-full p-4 bg-white/50 rounded-lg border border-green-100 text-center">
                    <Icon path="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No specific limits or features configured for this plan</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : subscription ? (
          <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50/80 rounded-2xl border border-yellow-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Badge variant="yellow">{subscription.status}</Badge>
                <h4 className="text-xl font-black text-gray-900 mt-3">{planName}</h4>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  Your subscription is currently {subscription.status}
                </p>
              </div>
              <button 
                onClick={() => navigate('/subscription')} 
                className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
              >
                View Plans
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-md shadow-red-200 text-white relative overflow-hidden group">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_50%,_white_1px,_transparent_1px)] bg-[length:18px_18px]"></div>
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/20 transition-all duration-700" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center px-3 py-1 bg-white/20 text-white text-[11px] font-bold uppercase tracking-widest rounded-full mb-4 shadow-sm backdrop-blur-md">Free Tier</span>
                <h4 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">No Active Plan</h4>
                <p className="text-red-100 text-sm font-medium max-w-md leading-relaxed">
                  You don't have an active subscription. Choose a plan to unlock premium features.
                </p>
              </div>
              <button 
                onClick={() => navigate('/subscription', { state: { from: 'my-plan' } })} 
                className="px-8 py-3.5 bg-white text-red-600 rounded-xl text-sm font-black shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all w-full md:w-auto flex-shrink-0 text-center flex justify-center items-center gap-2"
              >
                View Plans
                <Icon path="M17 8l4 4m0 0l-4 4m4-4H3" className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

// ─── ERROR TOAST ──────────────────────────────────────────────────────────────
function ErrorToast({ message, onClose }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
      <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon path="M6 18L18 6M6 6l12 12" className="w-3 h-3" />
      </div>
      <p className="flex-1 text-red-700 font-semibold text-xs">{message}</p>
      <button onClick={onClose} className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
        <Icon path="M6 18L18 6M6 6l12 12" className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
function DashboardSettings() {
  const { user, isSubscribed, syncProfile, logout, loading: authLoading } = useAuth();
  const { fetchMyProperties } = useProperty();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab]         = useState('profile');

  // Handle tab from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    if (tabFromUrl && TABS.some(t => t.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

  // Fetch active subscription
  const fetchSubscription = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!user?.id) {
      console.log('[DashboardSettings] User not authenticated, skipping subscription fetch');
      setLoadingSubscription(false);
      return;
    }
    
    try {
      setLoadingSubscription(true);
      const response = await billingApi.getActiveSubscription();
      console.log('[DashboardSettings] Active subscription response:', response);
      
      // Handle different response formats
      const subData = response?.data || response?.subscription || response;
      if (subData && (subData.id || subData.planId)) {
        console.log('[DashboardSettings] Setting subscription:', subData);
        setSubscription(subData);
      } else {
        console.log('[DashboardSettings] No active subscription found');
        setSubscription(null);
      }
    } catch (error) {
      console.error('[DashboardSettings] Failed to fetch subscription:', error);
      // Don't clear existing subscription on error, just log it
    } finally {
      setLoadingSubscription(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]); // Re-fetch when fetchSubscription function changes

  // Listen for payment success events
  useEffect(() => {
    const handlePaymentSuccess = (event) => {
      console.log('[DashboardSettings] Payment success detected, refreshing subscription');
      fetchSubscription();
    };

    // Listen for custom payment success events
    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    
    // Check URL parameters for payment success on component mount
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'success' && urlParams.get('txnid')) {
      console.log('[DashboardSettings] Payment success detected in URL, refreshing subscription');
      fetchSubscription();
    }

    return () => {
      window.removeEventListener('paymentSuccess', handlePaymentSuccess);
    };
  }, [fetchSubscription]);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [saveSuccess, setSaveSuccess]     = useState(false);
  const [error, setError]                 = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [viewModel, setViewModel]         = useState(null);
  const [formData, setFormData]           = useState({});
  const [propertyStats, setPropertyStats] = useState({ total_properties:0, active_listings:0, total_inquiries:0, total_views:0, featured_properties:0 });
  const [subscription, setSubscription]   = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  useEffect(() => {
    if (user) {
      const vm = new UserProfileViewModel(user);
      setViewModel(vm);
      setFormData({
        firstName: vm.firstName, lastName: vm.lastName, email: vm.email, phone: vm.phone,
        bio: vm.bio, avatarUrl: vm.avatarUrl, gender: vm.gender, dateOfBirth: vm.dateOfBirth,
        locality: vm.locality, locale: vm.locale, timezone: vm.timezone,
        specialization: vm.specialization, yearsOfExperience: vm.yearsOfExperience,
        licenseNumber: vm.licenseNumber, licenseExpiry: vm.licenseExpiry,
        isOAuthUser: vm.isOAuthUser, oauthProvider: vm.oauthProvider,
      });
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const props = await fetchMyProperties();
        const arr = Array.isArray(props) ? props : [];
        setPropertyStats({
          total_properties:    arr.length,
          active_listings:     arr.filter(p => !p.disabled && p.status !== 'hidden').length,
          total_inquiries:     arr.reduce((s, p) => s + (p.inquiries_count || 0), 0),
          total_views:         arr.reduce((s, p) => s + (p.views_count || 0), 0),
          featured_properties: arr.filter(p => p.is_featured || p.badge === 'featured').length,
        });
      } catch { /* ignore */ }
    })();
  }, [user, fetchMyProperties]);

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) { setError('User not loaded yet'); return; }
    setSaving(true); setError(null); setSaveSuccess(false);
    try {
      const payload = viewModel.toUpdatePayload(formData);
      const response = await userApi.updateMe(user.id, payload);
      const updatedUser = response.data?.user || response.user || response;
      if (updatedUser) {
        const newVm = new UserProfileViewModel({ ...user, ...updatedUser });
        setViewModel(newVm);
        setFormData(prev => ({
          ...prev,
          firstName: newVm.firstName, lastName: newVm.lastName, phone: newVm.phone,
          bio: newVm.bio, avatarUrl: newVm.avatarUrl, gender: newVm.gender,
          dateOfBirth: newVm.dateOfBirth, locality: newVm.locality,
          specialization: newVm.specialization, yearsOfExperience: newVm.yearsOfExperience,
          licenseNumber: newVm.licenseNumber, licenseExpiry: newVm.licenseExpiry,
        }));
      }
      syncProfile().catch(() => {});
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      let msg = 'Update failed';
      if (err.status === 409 || err.message?.includes('Duplicate')) msg = 'Phone number already in use.';
      else if (err.status === 400) msg = err.message || 'Invalid data provided';
      else if (err.status === 403) msg = 'You do not have permission to update this profile';
      else if (err.message) msg = err.message;
      setError(msg);
    } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData(); fd.append('avatar', file);
      const res = await userApi.uploadAvatarMe(fd);
      const url = res.data?.avatar_url || res.data;
      setFormData(prev => ({ ...prev, avatarUrl: url }));
      setViewModel(prev => ({ ...prev, avatarUrl: url }));
      await syncProfile();
    } catch { setError('Avatar upload failed'); }
    finally { setAvatarUploading(false); }
  };

  const renderContent = () => {
    if (loading || !viewModel) return <FormSkeleton />;
    const withForm = (FormComp) => (
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <FormComp formData={formData} onChange={handleFormChange} />
        <AnimatePresence>
          {error && <ErrorToast key="err" message={error} onClose={() => setError(null)} />}
        </AnimatePresence>
        <div className="flex justify-end pt-2">
          <SaveButton loading={saving} success={saveSuccess} />
        </div>
      </form>
    );
    switch (activeTab) {
      case 'profile':      return withForm(ProfileForm);
      case 'professional': return withForm(ProfessionalForm);
      case 'security':     return <SecurityPanel viewModel={viewModel} />;
      case 'activity':     return <ActivityPanel viewModel={viewModel} propertyStats={propertyStats} />;
      case 'my-plan':      return <MyPlanPanel subscription={subscription} loadingSubscription={loadingSubscription} onRefreshSubscription={fetchSubscription} />;
      default:             return null;
    }
  };

  if (authLoading) return (
    <div className="max-w-6xl mx-auto py-12 px-4 flex gap-8">
      <ProfileCardSkeleton />
      <div className="flex-1 space-y-4">
        <div className="h-12 bg-gray-200 rounded-2xl animate-pulse w-80" />
        <FormSkeleton />
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      {/* Page background */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-red-50/20">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">

          {/* ── Header ── */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-red-400 to-red-600" />
                <span className="text-[11px] font-black text-red-500 uppercase tracking-widest">My Account</span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Profile Settings</h1>
              <p className="text-gray-400 text-sm mt-1 font-medium">Manage your profile, credentials, and security preferences</p>
            </div>

            <button onClick={logout}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm group">
              <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              Sign Out
            </button>
          </motion.div>

          {/* ── Main Layout ── */}
          <div className="flex flex-col lg:flex-row gap-7">

            {/* Sidebar */}
            <ProfileCard viewModel={viewModel} loading={loading}
              onAvatarUpload={handleAvatarUpload} avatarUploading={avatarUploading}
              isSubscribed={isSubscribed} />

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Tabs */}
              <div className="mb-7">
                <Tabs active={activeTab} onChange={(id) => { setActiveTab(id); setError(null); setSaveSuccess(false); }} />
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div key={activeTab}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }} className="min-h-[420px]">
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default DashboardSettings;
