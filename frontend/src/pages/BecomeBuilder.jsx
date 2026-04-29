import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Building2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Upload,
  FileText,
  X,
  Edit2,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Award,
  Shield,
  Crown,
  Lock,
  ArrowRight
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Personal Details', icon: User },
  { id: 2, title: 'Legal Documents', icon: Shield }
];

const ROLE_TYPES = [
  { value: 'builder', label: 'Builder', description: 'Real estate developer or construction company' },
  { value: 'agent', label: 'Agent', description: 'Property consultant or real estate broker' }
];

const FORM_STORAGE_KEY = 'becomeBuilderFormData';
const FORM_STEP_KEY = 'becomeBuilderStep';

function BecomeBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, isSubscribed, openLogin } = useAuth();

  // Check if returning from subscription
  const returnState = location.state;
  const isReturningFromSubscription = returnState?.returnTo === 'become-builder-form';
  const savedStep = returnState?.savedStep || 1;

  const [step, setStep] = useState(isReturningFromSubscription ? savedStep : 1);
  const [submitting, setSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    fullName: '',
    mobileNumber: '',
    email: '',
    city: '',
    roleType: '',
    experience: '',
    agencyName: '',
    
    // Step 2: Legal Documents
    reraNumber: '',
    governmentIdName: '',
    governmentId: null,
    governmentIdPreview: null
  });
  const [errors, setErrors] = useState({});

  // Load saved form data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(FORM_STORAGE_KEY);
    const savedStepData = localStorage.getItem(FORM_STEP_KEY);
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({
          ...prev,
          ...parsed,
          // Don't restore file objects, only the preview if it was uploaded
          governmentId: null,
          governmentIdPreview: parsed.governmentIdPreview || null
        }));
      } catch (e) {
        console.error('Failed to parse saved form data', e);
      }
    }
    
    if (savedStepData && !isReturningFromSubscription) {
      setStep(parseInt(savedStepData, 10) || 1);
    }
  }, [isReturningFromSubscription]);

  // Save form data when it changes
  useEffect(() => {
    const dataToSave = {
      fullName: formData.fullName,
      mobileNumber: formData.mobileNumber,
      email: formData.email,
      city: formData.city,
      roleType: formData.roleType,
      experience: formData.experience,
      agencyName: formData.agencyName,
      reraNumber: formData.reraNumber,
      governmentIdName: formData.governmentIdName,
      governmentIdPreview: formData.governmentIdPreview
    };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
    localStorage.setItem(FORM_STEP_KEY, step.toString());
  }, [formData, step]);

  // Clear saved data on successful submission
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(FORM_STORAGE_KEY);
    localStorage.removeItem(FORM_STEP_KEY);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, governmentId: 'Please upload a valid image (JPG, PNG) or PDF file' }));
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, governmentId: 'File size must be less than 5MB' }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        governmentId: file,
        governmentIdPreview: URL.createObjectURL(file)
      }));
      setErrors(prev => ({ ...prev, governmentId: '' }));
    }
  };

  const removeFile = () => {
    if (formData.governmentIdPreview) {
      URL.revokeObjectURL(formData.governmentIdPreview);
    }
    setFormData(prev => ({
      ...prev,
      governmentId: null,
      governmentIdPreview: null
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    // Mobile number validation (required)
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }
    
    // Email validation (required)
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    // Government ID Name is required
    if (!formData.governmentIdName || !formData.governmentIdName.trim()) {
      newErrors.governmentIdName = 'Government ID name is required';
    }
    
    // Government ID is required
    if (!formData.governmentId && !formData.governmentIdPreview) {
      newErrors.governmentId = 'Government ID upload is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    // Check if user is logged in
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    // Check if user has subscription
    if (!isSubscribed) {
      setShowSubscriptionPrompt(true);
      return;
    }

    // Proceed with submission
    setSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear saved data on success
      clearSavedData();
      
      // Show success and redirect
      alert('Your builder/agent application has been submitted successfully! We will review your documents and get back to you within 24-48 hours.');
      navigate('/');
    } catch (error) {
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginAndContinue = () => {
    setShowLoginPrompt(false);
    openLogin();
  };

  const handleSubscribeAndContinue = () => {
    setShowSubscriptionPrompt(false);
    // Navigate to subscription with return state
    navigate('/subscription', {
      state: { 
        returnTo: 'become-builder-form',
        savedStep: step,
        from: 'builder-registration'
      }
    });
  };

  // Login prompt modal
  if (showLoginPrompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl border border-gray-200 p-8 shadow-xl text-center"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-4">
            Login Required
          </h2>
          
          <p className="text-gray-600 mb-8">
            Please login to complete your builder/agent registration. Your form data will be preserved.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleLoginAndContinue}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all"
            >
              Login to Continue
            </button>
            
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Subscription prompt modal
  if (showSubscriptionPrompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-white rounded-3xl border border-gray-200 p-8 shadow-xl"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-orange-200">
              <Crown className="w-10 h-10 text-orange-500" />
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              Subscription Required
            </h2>
            
            <p className="text-lg text-gray-600 mb-6">
              To become a verified builder or agent on REVO HOMES, an active subscription is required. Upgrade now to unlock premium features and reach thousands of buyers.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-gray-700">Verified badge on listings</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-gray-700">Priority placement in search</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-gray-700">Lead management dashboard</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleSubscribeAndContinue}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              View Subscription Plans
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowSubscriptionPrompt(false)}
              className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Builder/Agent</h1>
          <p className="text-sm text-gray-500">Join our network of trusted real estate professionals and grow your business</p>
        </div>

        {/* Step Navigation */}
        <div className="mb-8 bg-white border border-gray-200 rounded-xl p-2 hidden sm:flex justify-between items-center shadow-sm">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex relative flex-1 items-center justify-center">
                <div 
                  className={`flex items-center justify-center w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all z-10 ${
                    step === s.id 
                      ? 'bg-primary text-white shadow-md' 
                      : step > s.id 
                      ? 'text-primary bg-primary/5' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    <span className="hidden md:inline">{s.title}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Step Indicator */}
        <div className="sm:hidden mb-6">
          <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <span className="text-sm font-bold text-gray-900">Step {step} of 2</span>
            <span className="text-sm font-medium text-primary">{STEPS[step - 1].title}</span>
          </div>
        </div>

        {/* Form Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm"
          >
            {step === 1 && (
              <div className="space-y-6">
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <h3 className="text-xl flex items-center gap-2 font-bold text-gray-900">
                    <User className="w-5 h-5 text-primary" /> 
                    Personal Details
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 ml-7">Enter your contact information and professional details</p>
                </div>

                {/* Mobile Number & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        placeholder="Enter 10-digit mobile number"
                        className={`w-full pl-9 pr-4 py-2.5 bg-white border rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm ${
                          errors.mobileNumber ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.mobileNumber && (
                      <p className="text-xs text-red-500 mt-1 ml-1">{errors.mobileNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className={`w-full pl-9 pr-4 py-2.5 bg-white border rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm ${
                          errors.email ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1 ml-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Full Name & City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                      City / Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter your city"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Role Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-3 ml-1">
                    Role Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ROLE_TYPES.map((role) => {
                      const isSelected = formData.roleType === role.value;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, roleType: role.value }))}
                          className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {role.value === 'builder' ? <Building2 className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className={`font-bold text-sm ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                              {role.label}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Experience & Agency Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                      Experience (Years) <span className="text-gray-400">- Optional</span>
                    </label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select experience</option>
                        <option value="0-2">0-2 years</option>
                        <option value="2-5">2-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                      Agency/Company Name <span className="text-gray-400">- Optional</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="agencyName"
                        value={formData.agencyName}
                        onChange={handleChange}
                        placeholder="Enter agency or company name"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <h3 className="text-xl flex items-center gap-2 font-bold text-gray-900">
                    <Shield className="w-5 h-5 text-primary" /> 
                    Legal Documents
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 ml-7">Upload your verification documents for approval</p>
                </div>

                {/* RERA Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                    RERA Number <span className="text-gray-400">- Optional</span>
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="reraNumber"
                      value={formData.reraNumber}
                      onChange={handleChange}
                      placeholder="e.g., PRM/KA/RERA/1234/2024"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-1">
                    If you have a valid RERA registration number, please provide it for faster verification.
                  </p>
                </div>

                {/* Government ID Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                    Name of Government ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="governmentIdName"
                      value={formData.governmentIdName || ''}
                      onChange={handleChange}
                      placeholder="e.g., Aadhaar, PAN, Passport"
                      className={`w-full pl-9 pr-4 py-2.5 bg-white border rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm ${
                        errors.governmentIdName ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.governmentIdName && (
                    <p className="text-xs text-red-500 mt-1 ml-1">{errors.governmentIdName}</p>
                  )}
                </div>

                {/* Government ID Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-3 ml-1">
                    Government ID Upload <span className="text-red-500">*</span>
                  </label>
                  
                  <div className={`border-2 border-dashed rounded-2xl p-8 transition-all ${
                    errors.governmentId 
                      ? 'border-red-300 bg-red-50' 
                      : formData.governmentId || formData.governmentIdPreview
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 bg-gray-50 hover:border-primary/50'
                  }`}>
                    {!formData.governmentId && !formData.governmentIdPreview ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">
                          Upload {formData.governmentIdName || 'Government ID'}
                        </h4>
                        <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
                          {formData.governmentIdName 
                            ? `Please upload your valid ${formData.governmentIdName}` 
                            : "Please upload a valid government-issued ID (Aadhaar, PAN, Passport, or Driver's License)"}
                        </p>
                        <div className="relative inline-block">
                          <button
                            type="button"
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
                          >
                            Choose File
                          </button>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-3">Maximum file size: 5MB (JPG, PNG, PDF)</p>
                      </div>
                    ) : (
                      <div className="max-w-sm mx-auto">
                        <div className="relative group bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-50 mb-3 border border-gray-50">
                            {formData.governmentIdPreview && (
                              formData.governmentId?.type?.startsWith('image/') || 
                              formData.governmentIdPreview.match(/\.(jpeg|jpg|gif|png|webp)$/i)
                            ) ? (
                              <img 
                                src={formData.governmentIdPreview} 
                                alt="ID Preview" 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                <FileText size={40} className="text-gray-200" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">PDF Document</span>
                              </div>
                            )}

                            {/* Edit/Delete Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                              <button
                                type="button"
                                onClick={() => document.getElementById('id-replace').click()}
                                className="w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-xl backdrop-blur-md transition-all flex items-center justify-center"
                                title="Replace File"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={removeFile}
                                className="w-10 h-10 bg-red-500/80 hover:bg-red-500 text-white rounded-xl backdrop-blur-md transition-all flex items-center justify-center"
                                title="Remove File"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </div>

                          <div className="px-1">
                            <p className="text-[11px] font-bold text-gray-500 truncate mb-1">
                              {formData.governmentId?.name || 'Government ID'}
                            </p>
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                formData.governmentId?.type?.startsWith('image/') || 
                                formData.governmentIdPreview?.match(/\.(jpeg|jpg|gif|png|webp)$/i)
                                  ? 'bg-green-400' 
                                  : 'bg-blue-400'
                              }`}></div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                {formData.governmentId?.type?.startsWith('image/') || 
                                 formData.governmentIdPreview?.match(/\.(jpeg|jpg|gif|png|webp)$/i)
                                  ? 'Image' 
                                  : 'PDF / Document'}
                              </span>
                            </div>
                          </div>

                          {/* Hidden input for replacement */}
                          <input
                            type="file"
                            id="id-replace"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.governmentId && (
                    <p className="text-xs text-red-500 mt-2 ml-1">{errors.governmentId}</p>
                  )}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-blue-900 mb-1">Document Verification</h4>
                    <p className="text-xs text-blue-700">
                      Your documents will be securely stored and used only for verification purposes. 
                      Verification typically takes 24-48 hours. You will be notified once approved.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              step === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BecomeBuilder;