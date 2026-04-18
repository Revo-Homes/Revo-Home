import { motion, AnimatePresence } from 'framer-motion';

function CompareModal({ isOpen, onClose, properties }) {
  if (!isOpen) return null;

  const formatPrice = (p) => {
    if (!p) return '—';
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
    return `₹${p.toLocaleString('en-IN')}`;
  };

  // Logic to "rate the best" based on price per sqft (lower is better value)
  const ratedProperties = properties.map(p => ({
    ...p,
    pricePerSqft: p.price / parseInt(p.area)
  }));

  const bestValueId = ratedProperties.reduce((min, p) => 
    p.pricePerSqft < min.pricePerSqft ? p : min, ratedProperties[0]
  ).id;

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
              <div className="grid grid-cols-[200px_1fr_1fr_1fr] gap-8">
                {/* Labels Column */}
                <div className="flex flex-col gap-12 pt-[220px]">
                  <div className="h-10 flex items-center font-bold text-gray-400 uppercase tracking-widest text-xs">Price</div>
                  <div className="h-10 flex items-center font-bold text-gray-400 uppercase tracking-widest text-xs">BHK</div>
                  <div className="h-10 flex items-center font-bold text-gray-400 uppercase tracking-widest text-xs">Area</div>
                  <div className="h-10 flex items-center font-bold text-gray-400 uppercase tracking-widest text-xs">Type</div>
                  <div className="h-10 flex items-center font-bold text-gray-400 uppercase tracking-widest text-xs">Location</div>
                  <div className="h-10 flex items-center font-bold text-gray-400 uppercase tracking-widest text-xs">Value Rating</div>
                </div>

                {/* Property Columns */}
                {ratedProperties.slice(0, 3).map((p) => (
                  <div key={p.id} className={`flex flex-col gap-12 p-6 rounded-[32px] transition-all duration-500 ${
                    p.id === bestValueId ? 'bg-primary/5 ring-2 ring-primary/20 scale-[1.02] shadow-xl' : 'hover:bg-gray-50'
                  }`}>
                    {/* Property Card Head */}
                    <div className="flex flex-col gap-4">
                      <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                        {p.id === bestValueId && (
                          <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full shadow-lg">
                            ⭐ Best Value
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 line-clamp-2 min-h-[3rem] leading-tight">{p.title}</h3>
                    </div>

                    <div className="h-10 flex items-center text-xl font-black text-primary">{formatPrice(p.price)}</div>
                    <div className="h-10 flex items-center text-lg font-bold text-gray-900">{p.bhk} BHK</div>
                    <div className="h-10 flex items-center text-lg font-bold text-gray-900">{p.area} sqft</div>
                    <div className="h-10 flex items-center text-lg font-bold text-gray-900 uppercase tracking-wide text-sm">{p.propertyType}</div>
                    <div className="h-10 flex items-center text-gray-500 font-medium text-sm line-clamp-1 italic">{p.location}</div>
                    <div className="h-10 flex items-center">
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        p.id === bestValueId ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {p.id === bestValueId ? 'Excellent Value' : 'Good Quality'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 sticky bottom-0">
             <button 
              onClick={onClose}
              className="px-8 py-3 font-bold text-gray-600 hover:text-gray-900 transition-colors"
             >
              Close Comparison
             </button>
             <button className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg hover:shadow-primary/30 transition-all">
               Get Expert Advice
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CompareModal;
