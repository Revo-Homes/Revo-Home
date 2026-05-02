import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { useProperty } from '../contexts/PropertyContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

function DashboardProperties() {
  const { fetchMyProperties, deleteProperty, togglePropertyVisibility, enquiries } = useProperty();
  const { isLoggedIn, loading: authLoading, isSubscribed, user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [enquiryPopupId, setEnquiryPopupId] = useState(null);
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);


  useEffect(() => {
    if (!isLoggedIn || authLoading) return;
    const load = async () => {
      if (authLoading) return;
      setFetching(true);
      try {
        console.log('DashboardProperties: Fetching properties for user...', user?.email);
        const data = await fetchMyProperties();
        console.log('DashboardProperties: Found properties:', data?.length);
        setProperties(data || []);
      } catch (err) {
        console.error('Failed to load my properties:', err);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [fetchMyProperties, isLoggedIn, authLoading, user]);

  const handleToggleVisibility = async (id) => {
    try {
      await togglePropertyVisibility(id);
      setProperties(prev => prev.map(p => 
        (p.id || p.propertyId) === id ? { ...p, disabled: !p.disabled } : p
      ));
    } catch (err) {
      console.error('Failed to update visibility:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProperty(id);
      setProperties(prev => prev.filter(p => (p.id || p.propertyId) !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Failed to delete property:', err);
      setConfirmDeleteId(null);
    }
  };

  const safeProperties = Array.isArray(properties) ? properties : [];

  const handleInquiryClick = (propId) => {
    if (!isSubscribed) {
      alert('Please subscribe to view enquiries for your properties.');
      return;
    }
    setEnquiryPopupId(prev => prev === propId ? null : propId);
  };

  const getPropertyEnquiries = (propId) =>
    (Array.isArray(enquiries) ? enquiries : []).filter(
      e => String(e.propertyId) === String(propId)
    );

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold">Verifying your session...</p>
      </div>
    );
  }

  if (fetching && safeProperties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold">Loading your properties...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Please log in</h2>
        <p className="text-gray-500">You need to be logged in to view your properties.</p>
        <Link to="/" className="px-6 py-3 bg-primary text-white font-bold rounded-2xl">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">My Properties</h1>
          <p className="text-gray-500 font-medium">
            {safeProperties.length === 0
              ? 'No properties listed yet.'
              : `${safeProperties.length} properties in your portfolio`}
          </p>
        </div>
        <Link
          to="/sell"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          List New Property
        </Link>
      </div>

      {safeProperties.length === 0 ? (
        <div className="bg-gray-50 rounded-[32px] p-12 text-center border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No properties found</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Start by listing your first property to find potential buyers and tenants.</p>
          <Link to="/sell" className="text-primary font-black uppercase tracking-widest text-sm hover:underline">
            List a property now →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {safeProperties.map((p) => {
            const propId = p.id || p.propertyId;
            const propEnquiries = getPropertyEnquiries(propId);
            const enquiryCount = propEnquiries.length;
            const isPopupOpen = enquiryPopupId === propId;

            return (
              <div key={propId} className="relative">
                <PropertyCard
                  {...p}
                  disabled={p.disabled}
                  customBadge={
                    <div className="flex flex-col gap-1">
                      {(() => {
                        // Determine status display
                        const status = p.disabled ? 'hidden' : 
                                      (p.status?.status || p.status || 'draft');
                        
                        const statusConfig = {
                          'active': { label: 'Active', color: 'bg-green-500' },
                          'live': { label: 'Active', color: 'bg-green-500' },
                          'draft': { label: 'Pending Approval', color: 'bg-amber-500' },
                          'inactive': { label: 'Inactive', color: 'bg-gray-500' },
                          'hidden': { label: 'Hidden', color: 'bg-gray-500' },
                          'disabled': { label: 'Disabled', color: 'bg-gray-500' },
                          'expired': { label: 'Expired', color: 'bg-red-500' },
                          'withdrawn': { label: 'Withdrawn', color: 'bg-red-500' }
                        };
                        
                        const config = statusConfig[status.toLowerCase()] || { label: status, color: 'bg-gray-500' };
                        
                        return (
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-lg backdrop-blur-md ${config.color} text-white`}>
                            {config.label}
                          </span>
                        );
                      })()}
                    </div>
                  }
                  footerActions={
                    <div className="flex flex-wrap gap-2">
                      {/* View button */}
                      <Link
                        to={`/properties/${propId}`}
                        className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors group min-w-[60px]"
                        title="View My Listing"
                      >
                        <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-[10px] font-black uppercase">View</span>
                      </Link>

                      {/* Visibility Toggle */}
                      <button
                        onClick={() => handleToggleVisibility(propId)}
                        className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-colors group min-w-[60px] ${
                          p.disabled ? 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                        }`}
                        title={p.disabled ? 'Enable Property' : 'Disable Property'}
                      >
                         <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {p.disabled ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          )}
                        </svg>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">{p.disabled ? 'Enable' : 'Hide'}</span>
                      </button>

                      {/* Inquiry button with WhatsApp-style badge */}
                      <div className="relative">
                        {enquiryCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                            {enquiryCount}
                          </span>
                        )}
                        <button
                          onClick={() => handleInquiryClick(propId)}
                          className={`w-full flex flex-col items-center justify-center p-2 rounded-xl transition-colors group ${
                            isPopupOpen ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }`}
                          title="View Enquiries"
                        >
                          <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <span className="text-[10px] font-bold uppercase tracking-tighter">Inquiry</span>
                        </button>
                      </div>

                      <Link
                        to={`/sell?edit=${propId}`}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors group"
                        title="Edit Property"
                      >
                        <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-[10px] font-bold uppercase mt-px tracking-tighter">Edit</span>
                      </Link>

                      {confirmDeleteId === propId ? (
                        <div className="flex-1 flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-100 animate-in fade-in slide-in-from-right-2 min-w-[120px]">
                          <span className="text-[10px] font-black text-red-600 uppercase px-2">Sure?</span>
                          <button 
                            onClick={() => handleDelete(propId)}
                            className="flex-1 py-2 bg-red-500 text-white text-[10px] font-black rounded-lg hover:bg-red-600 transition-all uppercase"
                          >
                            Yes
                          </button>
                          <button 
                            onClick={() => setConfirmDeleteId(null)}
                            className="flex-1 py-2 bg-white text-gray-500 text-[10px] font-black rounded-lg hover:bg-gray-100 transition-all uppercase border border-gray-100"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(propId)}
                          className="flex flex-col items-center justify-center p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors group"
                          title="Remove Property"
                        >
                          <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="text-[10px] font-bold uppercase mt-px tracking-tighter">Remove</span>
                        </button>
                      )}
                    </div>
                  }
                />

                {/* Enquiry Popup — fixed centered screen modal */}
                <AnimatePresence>
                  {isPopupOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                      onClick={() => setEnquiryPopupId(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-md"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50">
                          <div>
                            <h3 className="font-black text-gray-900">Enquiries</h3>
                            <p className="text-xs text-gray-400 font-bold mt-0.5 uppercase tracking-widest">{enquiryCount} message{enquiryCount !== 1 ? 's' : ''}</p>
                          </div>
                          <button
                            onClick={() => setEnquiryPopupId(null)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                          {enquiryCount === 0 ? (
                            <p className="text-center py-10 text-gray-400 font-bold text-sm">No enquiries yet for this property</p>
                          ) : propEnquiries.map((enq, idx) => (
                            <motion.div
                              key={enq.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="px-6 py-4 hover:bg-gray-50/80 transition-colors"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                                  enq.isReply ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'
                                }`}>
                                  {enq.isReply ? 'R' : (enq.userEmail || 'A')[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-900 text-sm truncate">
                                    {enq.isReply ? 'Your Reply' : (enq.userEmail || 'Anonymous')}
                                  </p>
                                  <p className="text-gray-300 text-[10px] uppercase tracking-widest font-bold">{enq.date}</p>
                                </div>
                                {!enq.isReply && (
                                  <button
                                    onClick={() => {
                                      setReplyId(prev => prev === enq.id ? null : enq.id);
                                      setReplyText('');
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                                      replyId === enq.id
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary'
                                    }`}
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    Reply
                                  </button>
                                )}
                              </div>
                              <p className={`text-sm leading-relaxed pl-11 mb-3 ${enq.isReply ? 'text-gray-400 italic' : 'text-gray-500'}`}>
                                {enq.message}
                              </p>

                              {/* Inline reply box */}
                              <AnimatePresence>
                                {replyId === enq.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden pl-11"
                                  >
                                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
                                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Reply to {enq.userEmail}</p>
                                      <textarea
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Type your reply..."
                                        rows={3}
                                        className="w-full text-sm bg-white border border-gray-100 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium text-gray-700"
                                      />
                                      <div className="flex gap-2 mt-2">
                                        <button
                                          onClick={() => {
                                            if (!replyText.trim()) return;
                                            
                                            // Handle mailto
                                            const subject = encodeURIComponent(`Reply: ${enq.propertyTitle || 'Your Property Enquiry'}`);
                                            const body = encodeURIComponent(`Hi,\n\nThank you for your enquiry.\n\n${replyText}\n\nBest regards,\nRevo Homes Property Owner`);
                                            window.open(`mailto:${enq.userEmail}?subject=${subject}&body=${body}`);

                                            setReplyId(null);
                                            setReplyText('');
                                            // We could re-fetch or let context handle it if it polls, 
                                            // but for immediate feedback we'll just close.
                                          }}
                                          disabled={!replyText.trim()}
                                          className="flex-1 py-2.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                        >
                                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                          </svg>
                                          Send Reply
                                        </button>
                                        <button
                                          onClick={() => { setReplyId(null); setReplyText(''); }}
                                          className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DashboardProperties;
