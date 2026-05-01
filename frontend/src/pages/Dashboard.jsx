import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import CompareModal from '../components/CompareModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useProperty } from '../contexts/PropertyContext';
import { useAuth } from '../contexts/AuthContext';

function DashboardSaved() {
  const { fetchSaved, loading: propertyLoading, isSaved } = useProperty();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [savedProperties, setSavedProperties] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || authLoading) return;

    const load = async () => {
      setFetching(true);
      try {
        const data = await fetchSaved();
        setSavedProperties(data);
      } catch (err) {
        console.error('Failed to load saved properties:', err);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [fetchSaved, isLoggedIn, authLoading]);

  const toggleSelection = (id) => {
    setSelectedIds(prev => {
      if (!prev.includes(id) && prev.length >= 3) return prev;
      return prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
    });
  };

  const safeSaved = (Array.isArray(savedProperties) ? savedProperties : [])
    .filter(p => isSaved(p.propertyId || p.id));

  const selectedProperties = safeSaved.filter(p => selectedIds.includes(p.id || p.propertyId));

  if (authLoading || (fetching && safeSaved.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold">
          {authLoading ? "Verifying your session..." : "Loading saved properties..."}
        </p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Please log in</h2>
        <p className="text-gray-500">You need to be logged in to view saved properties.</p>
        <Link to="/" className="px-6 py-3 bg-primary text-white font-bold rounded-2xl">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Saved Properties</h1>
          <p className="text-gray-500 font-medium">
            {safeSaved.length === 0 
              ? "You haven't saved any properties yet." 
              : `${safeSaved.length} properties you're interested in`}
          </p>
        </div>
        {selectedIds.length > 0 && (
          <button 
            onClick={() => setSelectedIds([])}
            className="text-primary font-bold text-sm hover:underline"
          >
            Clear Selection ({selectedIds.length}/3)
          </button>
        )}
      </div>

      {safeSaved.length === 0 ? (
        <div className="bg-gray-50 rounded-[32px] p-12 text-center border-2 border-dashed border-gray-200">
           <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
           </div>
           <h2 className="text-xl font-bold text-gray-900 mb-2">No saved properties</h2>
           <p className="text-gray-500 mb-8 max-w-sm mx-auto">Click the heart icon on any property to save it for later and compare with others.</p>
           <Link to="/properties" className="text-primary font-black uppercase tracking-widest text-sm hover:underline">
             Browse properties →
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {safeSaved.map((p) => {
            const isSelected = selectedIds.includes(p.id || p.propertyId);
            return (
              <div key={p.id || p.propertyId} className="relative">
                <PropertyCard 
                  {...p} 
                  footerActions={
                    <button
                      onClick={() => toggleSelection(p.id || p.propertyId)}
                      className={`w-full py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                        isSelected 
                          ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Selected for Compare
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Add to Compare
                        </>
                      )}
                    </button>
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Compare Button */}
      <AnimatePresence>
        {selectedIds.length >= 2 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50"
          >
            <button
              onClick={() => setIsCompareOpen(true)}
              className="bg-cta text-white px-10 py-5 rounded-full font-black text-lg shadow-[0_20px_50px_rgba(255,107,0,0.4)] hover:shadow-[0_20px_50px_rgba(255,107,0,0.6)] transition-all hover:-translate-y-1 flex items-center gap-4"
            >
              <span className="flex items-center justify-center bg-white/20 w-8 h-8 rounded-full text-sm">
                {selectedIds.length}
              </span>
              Compare Details
              <svg className="w-6 h-6 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CompareModal 
        isOpen={isCompareOpen}
        onClose={() => {
          setIsCompareOpen(false);
          setSelectedIds([]);
        }}
        properties={selectedProperties}
      />
    </div>
  );
}

export default DashboardSaved;