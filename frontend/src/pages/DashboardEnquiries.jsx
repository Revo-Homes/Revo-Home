import { useProperty } from '../contexts/PropertyContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-600 border border-amber-100',
  Replied: 'bg-green-50 text-green-600 border border-green-100',
  Sent: 'bg-blue-50 text-blue-600 border border-blue-100',
};

function DashboardEnquiries() {
  const { enquiries, deleteEnquiry } = useProperty();
  const { user, loading: authLoading } = useAuth();
  const [deletedIds, setDeletedIds] = useState(new Set());
  const [confirmId, setConfirmId] = useState(null);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Enquiries...</p>
      </div>
    );
  }

  const allEnquiries = Array.isArray(enquiries) ? enquiries : [];
  const sentEnquiries = allEnquiries
    .filter(e => e.userEmail === user?.email && !deletedIds.has(e.id));

  const handleDeleteConfirm = (id) => setConfirmId(id);

  const handleDelete = async (id) => {
    const success = await deleteEnquiry(id);
    if (success) {
      setDeletedIds(prev => new Set([...prev, id]));
      setConfirmId(null);
    }
  };

  const EnquiryCard = ({ e, index }) => (
    <motion.div
      key={e.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      layout
      className="group bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/80 hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden"
    >
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="p-7 flex flex-col md:flex-row gap-6 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center shadow-sm">
            <span className="text-xl font-black text-primary">
              {(e.ownerEmail || 'P')[0].toUpperCase()}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${STATUS_STYLES[e.status] || STATUS_STYLES.Sent}`}>
              {e.status || 'Sent'}
            </span>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {e.date || 'Recently'}
            </span>
          </div>

          <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-primary transition-colors truncate">
            {e.propertyTitle || `Property #${e.propertyId}`}
          </h3>

          <div className="flex items-center gap-2 mb-4">
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
            <p className="text-xs font-bold text-gray-400 truncate">To: {e.ownerEmail || 'Property Owner'}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40 rounded-l-2xl" />
            <p className="text-sm text-gray-600 leading-relaxed italic pl-2">"{e.message}"</p>
          </div>
        </div>

        {/* Delete */}
        <div className="flex-shrink-0 self-start">
          <AnimatePresence mode="wait">
            {confirmId === e.id ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col gap-2 items-end"
              >
                <p className="text-xs font-bold text-gray-500 text-right mb-1">Confirm delete?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmId(null)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="trash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => handleDeleteConfirm(e.id)}
                className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all duration-200 group/del"
                title="Delete enquiry"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4"
      >
        <div>
          <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Inbox</p>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Sent Enquiries</h1>
          <p className="text-gray-400 font-medium mt-1">
            {sentEnquiries.length === 0
              ? 'No messages sent yet'
              : `${sentEnquiries.length} message${sentEnquiries.length !== 1 ? 's' : ''} sent to property owners`}
          </p>
        </div>

        {sentEnquiries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 bg-white rounded-2xl px-5 py-3 border border-gray-100 shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-sm font-black text-gray-900">{sentEnquiries.length}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sent</p>
          </motion.div>
        )}
      </motion.div>

      {sentEnquiries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-[40px] p-20 text-center border border-gray-100 shadow-xl shadow-gray-100/50"
        >
          <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gray-100">
            <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">No sent enquiries yet</h2>
          <p className="text-gray-400 max-w-sm mx-auto font-medium leading-relaxed">
            When you contact property owners, your messages will appear here.
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-5">
            {sentEnquiries.map((e, index) => (
              <EnquiryCard key={e.id} e={e} index={index} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default DashboardEnquiries;
