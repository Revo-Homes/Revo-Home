import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useProperty } from '../contexts/PropertyContext';
import { useRevoLeadTracker } from '../hooks/useRevoLeadTracker';
import { buildStructuredMessage, splitFullName, submitPublicEnquiry } from '../services/publicEnquiry';
import { X, Info, User, Mail, Phone, MessageSquare, Loader2 } from 'lucide-react';

function CompareModal({ isOpen, onClose, properties }) {
  

  const formatPrice = (p) => {
    if (!p) return '—';
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
    return `₹${p.toLocaleString('en-IN')}`;
  };

  // Logic to "rate the best" based on price per sqft (lower is better value)
  const ratedProperties = properties.map(p => ({
    ...p,
    pricePerSqft: p.pricePerSqft || (p.price && Number(p.area) > 0 ? p.price / Number(p.area) : Infinity)
  }));

  const bestValueId = ratedProperties.length > 0
  ? ratedProperties.reduce((min, p) =>
      (p.pricePerSqft || Infinity) < (min.pricePerSqft || Infinity) ? p : min,
      ratedProperties[0]
    ).id
  : null;

  const { user, isLoggedIn, openLogin } = useAuth();
  const { generateLead } = useRevoLeadTracker();
  const { addEnquiry } = useProperty();
  const [showExpertForm, setShowExpertForm] = useState(false);
  const [expertFormData, setExpertFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [expertFormErrors, setExpertFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const compareTitles = properties.map((p) => p.title).filter(Boolean).join(' vs ') || 'selected properties';
      setExpertFormData((prev) => ({
        ...prev,
        name: user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        message: `I need expert advice on comparing ${compareTitles}. Please contact me.`
      }));
    }
  }, [user, properties]);

  const validateExpertForm = () => {
    const newErrors = {};
    if (!expertFormData.name.trim()) newErrors.name = 'Full name is required';
    if (expertFormData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(expertFormData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!expertFormData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(expertFormData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    setExpertFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleExpertSubmit = async () => {
    if (!validateExpertForm()) return;
    setIsSubmitting(true);

    try {
      const { firstName, lastName } = splitFullName(expertFormData.name);
      const compareTitles = properties.map((p) => p.title).filter(Boolean).join(' vs ') || 'selected properties';
      const adviceMessage = buildStructuredMessage(
        `Expert Advice Request - Compare: ${compareTitles}`,
        {
          'Compared Properties': compareTitles,
          'Preferred Contact': expertFormData.phone,
        },
        expertFormData.message
      );

      await generateLead(properties[0]?.id, user?.id || null, {
        listingId: properties[0]?.id,
        propertyId: properties[0]?.propertyId,
        title: `Expert Advice Request - Compare: ${compareTitles}`,
        price: properties[0]?.price,
        location: properties[0]?.location,
        propertyType: properties[0]?.propertyType,
        bhk: properties[0]?.bhk,
        area: properties[0]?.area,
        listingType: properties[0]?.listingType,
        city: properties[0]?.city,
        state: properties[0]?.state,
        userFirstName: firstName,
        userLastName: lastName,
        userEmail: expertFormData.email,
        userPhone: expertFormData.phone,
        priority: 'high',
        is_hot: true,
        score: 85,
        notes: adviceMessage,
        utm_content: 'compare_expert_advice',
        leadEvent: 'expert_advice_request',
        timestamp: new Date().toISOString(),
      });

      await submitPublicEnquiry({
        name: expertFormData.name,
        email: expertFormData.email,
        phone: expertFormData.phone,
        subject: `Expert Advice Request: ${compareTitles}`,
        message: adviceMessage,
        enquiryType: 'property_inquiry',
        preferredLocation: properties[0]?.location,
        preferredPropertyTypes: properties[0]?.propertyType,
        propertyId: properties[0]?.propertyId,
        listingId: properties[0]?.id,
        sourcePage: window.location.pathname,
        utmContent: 'compare_expert_advice',
      });

      try {
        await addEnquiry(properties[0]?.id, adviceMessage);
      } catch (error) {
        console.log('Compare expert advice addEnquiry skipped or failed:', error);
      }

      setShowExpertForm(false);
      alert('Expert will contact you shortly!');
      onClose();
      return Promise.resolve();
    } catch (error) {
      console.error('Expert advice submission error:', error);
      alert(error?.message || 'Failed to submit expert advice request. Please try again.');
      return Promise.reject(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null; 

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-6xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-3xl font-black text-gray-900">Compare Properties</h2>
              <p className="text-gray-500 font-medium">Comparing {properties.length} selected properties</p>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-x-auto p-8 pt-4">
            <div className="min-w-[800px]">
              <div className={`grid gap-6 mb-6 ${
    properties.length === 1 ? 'grid-cols-[180px_1fr]' :
    properties.length === 2 ? 'grid-cols-[180px_1fr_1fr]' :
    'grid-cols-[180px_1fr_1fr_1fr]'
  }`}>
                <div />
                {ratedProperties.slice(0, 3).map((p) => (
                  <div key={p.id} className={`p-4 rounded-[24px] ${p.id === bestValueId ? 'bg-primary/5 ring-2 ring-primary/20' : ''}`}>
                    <div className="relative h-[150px] rounded-xl overflow-hidden shadow-md mb-3">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                      {p.id === bestValueId && (
                        <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow">
                          ⭐ Best Value
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{p.title}</h3>
                  </div>
                ))}
              </div>

              {[
                { label: 'PRICE', render: (p) => <span className="text-xl font-black text-primary">{p.price ? formatPrice(p.price) : '—'}</span> },
                { label: 'BHK', render: (p) => <span className="text-base font-bold text-gray-900">{p.bhk && String(p.bhk).trim() && String(p.bhk).trim() !== 'undefined' ? (String(p.bhk).includes('BHK') ? p.bhk : `${p.bhk} BHK`) : '—'}</span> },
                { label: 'AREA', render: (p) => <span className="text-base font-bold text-gray-900">{Number(p.area) > 0 ? `${p.area} sqft` : '—'}</span> },
                { label: 'TYPE', render: (p) => <span className="text-base font-bold text-gray-900 uppercase">{p.propertyType || '—'}</span> },
                { label: 'LOCATION', render: (p) => <span className="text-sm text-gray-500 italic">{p.location || '—'}</span> },
                { label: 'VALUE RATING', render: (p) => (
                  <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.id === bestValueId ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {p.id === bestValueId ? 'Excellent Value' : 'Good Quality'}
                  </div>
                )},
              ].map((row, i) => (
                <div key={i} className={`grid gap-6 border-t border-gray-100 ${
      properties.length === 1 ? 'grid-cols-[180px_1fr]' :
      properties.length === 2 ? 'grid-cols-[180px_1fr_1fr]' :
      'grid-cols-[180px_1fr_1fr_1fr]'
    }`}>
                  <div className="py-4 flex items-center font-bold text-gray-400 uppercase tracking-widest text-xs">
                    {row.label}
                  </div>
                  {ratedProperties.slice(0, 3).map((p) => (
                    <div key={p.id} className={`py-4 px-4 flex items-center ${p.id === bestValueId ? 'bg-primary/5' : ''}`}>
                      {row.render(p)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 sticky bottom-0">
             <button 
              onClick={onClose}
              className="px-8 py-3 font-bold text-gray-600 hover:text-gray-900 transition-colors"
             >
              Close Comparison
             </button>
             <button
               onClick={() => {
                 if (!isLoggedIn) {
                   openLogin();
                   return;
                 }
                 setShowExpertForm(true);
               }}
               className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg hover:shadow-primary/30 transition-all"
             >
               Get Expert Advice
             </button>
          </div>

          <AnimatePresence>
            {showExpertForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
                onClick={() => setShowExpertForm(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Expert Advice Request</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Compare selected properties and request expert help.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowExpertForm(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>

                  {!isLoggedIn && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-sm text-amber-700">
                        <Info size={14} className="inline mr-1" />
                        Please <button onClick={openLogin} className="font-semibold underline">login</button> for faster submission
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={expertFormData.name}
                          onChange={(e) => setExpertFormData({ ...expertFormData, name: e.target.value })}
                          placeholder="Enter your full name"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                        />
                      </div>
                      {expertFormErrors.name && <p className="text-xs text-red-500 mt-1">{expertFormErrors.name}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Email <span className="text-gray-400">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={expertFormData.email}
                          onChange={(e) => setExpertFormData({ ...expertFormData, email: e.target.value })}
                          placeholder="Enter your email"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                        />
                      </div>
                      {expertFormErrors.email && <p className="text-xs text-red-500 mt-1">{expertFormErrors.email}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          value={expertFormData.phone}
                          onChange={(e) => setExpertFormData({ ...expertFormData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                        />
                      </div>
                      {expertFormErrors.phone && <p className="text-xs text-red-500 mt-1">{expertFormErrors.phone}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Message <span className="text-gray-400">(Optional)</span>
                      </label>
                      <div className="relative">
                        <MessageSquare size={18} className="absolute left-3 top-3 text-gray-400" />
                        <textarea
                          value={expertFormData.message}
                          onChange={(e) => setExpertFormData({ ...expertFormData, message: e.target.value })}
                          placeholder="Tell us more about your requirements..."
                          rows={3}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExpertSubmit}
                    disabled={isSubmitting}
                    className="w-full mt-6 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <MessageSquare size={18} />
                        Send Enquiry
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-xs text-gray-400 mt-4">
                    Your enquiry will be created directly in Revo CRM
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CompareModal;