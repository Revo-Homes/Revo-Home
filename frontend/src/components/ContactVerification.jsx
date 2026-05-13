import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Mail, Phone, Send, ShieldCheck } from 'lucide-react';
import { authApi } from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

export const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

export const normalizePhone = (phone = '') => {
  const digits = String(phone).replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
};

const emptyChannelState = {
  otp: '',
  sentTo: '',
  verifiedValue: '',
  loading: false,
  error: '',
  message: '',
};

export function useContactVerification({ email, phone }) {
  const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);
  const normalizedPhone = useMemo(() => normalizePhone(phone), [phone]);
  const [channels, setChannels] = useState({
    email: emptyChannelState,
    sms: emptyChannelState,
  });

  const isEmailValid = EMAIL_REGEX.test(normalizedEmail);
  const isPhoneValid = PHONE_REGEX.test(normalizedPhone);
  const isEmailVerified = isEmailValid && channels.email.verifiedValue === normalizedEmail;
  const isPhoneVerified = isPhoneValid && channels.sms.verifiedValue === normalizedPhone;
  const isVerified = isEmailVerified && isPhoneVerified;

  useEffect(() => {
    setChannels((prev) => ({
      ...prev,
      email: prev.email.verifiedValue && prev.email.verifiedValue !== normalizedEmail
        ? { ...emptyChannelState }
        : prev.email,
    }));
  }, [normalizedEmail]);

  useEffect(() => {
    setChannels((prev) => ({
      ...prev,
      sms: prev.sms.verifiedValue && prev.sms.verifiedValue !== normalizedPhone
        ? { ...emptyChannelState }
        : prev.sms,
    }));
  }, [normalizedPhone]);

  const setChannelState = (channel, updater) => {
    setChannels((prev) => ({
      ...prev,
      [channel]: typeof updater === 'function' ? updater(prev[channel]) : updater,
    }));
  };

  const getIdentifier = (channel) => (channel === 'email' ? normalizedEmail : normalizedPhone);

  const validateIdentifier = (channel) => {
    if (channel === 'email') {
      if (!normalizedEmail) return 'Enter an email address before requesting OTP.';
      if (!isEmailValid) return 'Enter a valid email address before requesting OTP.';
      return '';
    }

    if (!normalizedPhone) return 'Enter a phone number before requesting OTP.';
    if (!isPhoneValid) return 'Enter a valid 10-digit Indian mobile number before requesting OTP.';
    return '';
  };

  const sendOtp = async (channel) => {
    const validationError = validateIdentifier(channel);
    if (validationError) {
      setChannelState(channel, (prev) => ({ ...prev, error: validationError, message: '' }));
      return { success: false, message: validationError };
    }

    const identifier = getIdentifier(channel);
    setChannelState(channel, (prev) => ({ ...prev, loading: true, error: '', message: '' }));

    try {
      const payload = { identifier, channel };
      if (channel === 'sms') payload.mode = 'login';
      const response = await authApi.sendOtp(payload);
      setChannelState(channel, (prev) => ({
        ...prev,
        sentTo: identifier,
        otp: '',
        message: response?.message || 'OTP sent successfully.',
        error: '',
      }));
      return { success: true };
    } catch (error) {
      const message = error?.message || 'Failed to send OTP. Please try again.';
      setChannelState(channel, (prev) => ({ ...prev, error: message, message: '' }));
      return { success: false, message };
    } finally {
      setChannelState(channel, (prev) => ({ ...prev, loading: false }));
    }
  };

  const verifyOtp = async (channel) => {
    const validationError = validateIdentifier(channel);
    if (validationError) {
      setChannelState(channel, (prev) => ({ ...prev, error: validationError, message: '' }));
      return { success: false, message: validationError };
    }

    const identifier = getIdentifier(channel);
    const channelState = channels[channel];
    const otp = channelState.otp.trim();

    if (otp.length !== 6) {
      const message = 'Enter the 6-digit OTP.';
      setChannelState(channel, (prev) => ({ ...prev, error: message, message: '' }));
      return { success: false, message };
    }

    if (channelState.sentTo && channelState.sentTo !== identifier) {
      const message = 'Contact value changed. Please request a fresh OTP.';
      setChannelState(channel, (prev) => ({ ...prev, error: message, message: '' }));
      return { success: false, message };
    }

    setChannelState(channel, (prev) => ({ ...prev, loading: true, error: '', message: '' }));

    try {
      await authApi.verifyOtp({ identifier, code: otp, channel });
      setChannelState(channel, (prev) => ({
        ...prev,
        verifiedValue: identifier,
        message: channel === 'email' ? 'Email verified.' : 'Phone verified.',
        error: '',
      }));
      return { success: true };
    } catch (error) {
      const message = error?.message || 'Invalid OTP. Please try again.';
      setChannelState(channel, (prev) => ({ ...prev, error: message, message: '' }));
      return { success: false, message };
    } finally {
      setChannelState(channel, (prev) => ({ ...prev, loading: false }));
    }
  };

  const setOtp = (channel, value) => {
    const otp = String(value).replace(/\D/g, '').slice(0, 6);
    setChannelState(channel, (prev) => ({ ...prev, otp, error: '', message: '' }));
  };

  const getSubmitBlocker = () => {
    if (!isEmailValid) return 'Please enter and verify a valid email address before submitting.';
    if (!isPhoneValid) return 'Please enter and verify a valid 10-digit mobile number before submitting.';
    if (!isEmailVerified || !isPhoneVerified) return 'Please verify both phone number and email OTP before submitting.';
    return '';
  };

  return {
    channels,
    normalizedEmail,
    normalizedPhone,
    isEmailValid,
    isPhoneValid,
    isEmailVerified,
    isPhoneVerified,
    isVerified,
    sendOtp,
    verifyOtp,
    setOtp,
    getSubmitBlocker,
  };
}

function VerificationRow({ channel, label, value, verified, verification }) {
  const state = verification.channels[channel];
  const Icon = channel === 'email' ? Mail : Phone;
  const maskedValue = value || (channel === 'email' ? 'email address' : 'phone number');

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg ${verified ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{label}</p>
            <p className="break-all text-xs text-slate-500">{maskedValue}</p>
            {verified && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => verification.sendOtp(channel)}
          disabled={state.loading || verified}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/20 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-3.5 w-3.5" />
          {state.sentTo ? 'Resend OTP' : 'Send OTP'}
        </button>
      </div>

      {!verified && state.sentTo && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            inputMode="numeric"
            value={state.otp}
            onChange={(event) => verification.setOtp(channel, event.target.value)}
            placeholder="Enter 6-digit OTP"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => verification.verifyOtp(channel)}
            disabled={state.loading || state.otp.length !== 6}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Verify
          </button>
        </div>
      )}

      {(state.error || state.message) && (
        <p className={`mt-2 text-xs ${state.error ? 'text-red-600' : 'text-green-600'}`}>
          {state.error || state.message}
        </p>
      )}
    </div>
  );
}

export function ContactVerificationPanel({ verification, className = '' }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50 p-4 ${className}`}>
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold text-slate-900">Verify contact details before submitting</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <VerificationRow
          channel="sms"
          label="Phone OTP"
          value={verification.normalizedPhone ? `+91 ${verification.normalizedPhone}` : ''}
          verified={verification.isPhoneVerified}
          verification={verification}
        />
        <VerificationRow
          channel="email"
          label="Email OTP"
          value={verification.normalizedEmail}
          verified={verification.isEmailVerified}
          verification={verification}
        />
      </div>
    </div>
  );
}

export function InlineContactVerifier({ channel, verification, className = '' }) {
  const state = verification.channels[channel === 'sms' ? 'sms' : 'email'];
  const verified = channel === 'sms' ? verification.isPhoneVerified : verification.isEmailVerified;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => verification.sendOtp(channel === 'sms' ? 'sms' : 'email')}
          disabled={state.loading || verified}
          className="inline-flex items-center gap-2 rounded-lg border border-primary/20 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.sentTo ? 'Resend OTP' : 'Send OTP'}
        </button>

        {state.sentTo && !verified && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={state.otp}
              onChange={(e) => verification.setOtp(channel === 'sms' ? 'sms' : 'email', e.target.value)}
              placeholder="OTP"
              className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => verification.verifyOtp(channel === 'sms' ? 'sms' : 'email')}
              disabled={state.loading || state.otp.length !== 6}
              className="rounded-lg bg-primary px-3 py-1 text-sm font-semibold text-white disabled:opacity-60"
            >
              Verify
            </button>
          </div>
        )}
      </div>

      {(state.error || state.message) && (
        <p className={`text-xs ${state.error ? 'text-red-600' : 'text-green-600'}`}>{state.error || state.message}</p>
      )}
    </div>
  );
}
