import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateFilters } from '../store/slices/propertySlice';

const CATEGORIES = [
  { id: 'buy', label: 'Buy' },
  { id: 'rent', label: 'Rent' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'plots', label: 'Plots' },
  { id: 'pg', label: 'PG' },
  { id: 'commercial_rent', label: 'Commercial Rent' },
  { id: 'coworking', label: 'Co-Working' }
];

const BHK_OPTIONS = ['1', '2', '3', '4', '5+'];
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Independent House', 'Plot', 'Commercial', 'Plots', 'PG', 'Coworking'];
const FURNISHING_OPTIONS = ['Fully Furnished', 'Semi Furnished', 'Unfurnished'];
const AMENITIES_OPTIONS = ['Parking', 'Lift', 'Gym', 'Swimming Pool', 'Security', 'Power Backup', 'Club House', 'Garden'];

const FilterPopover = ({ label, active, children, summary }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-[13px] font-semibold whitespace-nowrap transition-all ${
          active
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
        }`}
      >
        <span>{summary || label}</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] p-4 sm:p-6 w-[280px]"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function SmartSearchBar({ variant = 'hero' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.properties.filters);
  const [activeCategory, setActiveCategory] = useState(filters.listingType);

  const triggerSearch = useCallback((currentFilters) => {
    // Collect non-empty filters
    const activeFiltersCount = Object.values(currentFilters).filter(v => 
      Array.isArray(v) ? v.length > 0 : !!v
    ).length;

    const params = new URLSearchParams();
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        params.set(key, Array.isArray(value) ? value.join(',') : value);
      }
    });
    
    const searchString = `/properties?${params.toString()}`;
    
    // Only navigate to properties page if NOT on the home page and filters are active
    // OR if on properties page, just update URL
    if (location.pathname === '/properties') {
      window.history.replaceState(null, '', searchString);
    } else if (location.pathname !== '/' && activeFiltersCount > 0) {
      navigate(searchString);
    }
    // On Home page ('/'), we just let the Redux state update the Home component's local view
  }, [navigate, location.pathname]);

  const handleUpdateFilter = (key, value) => {
    dispatch(updateFilters({ [key]: value }));
    // The Redux state update is enough for Home.jsx to react.
    // We only call triggerSearch for URL/navigation side effects.
    const nextFilters = { ...filters, [key]: value };
    triggerSearch(nextFilters);
  };

  const toggleArrayFilter = (key, item) => {
    const arr = [...filters[key]];
    const next = arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
    handleUpdateFilter(key, next);
  };

  return (
    <div className={`w-full ${variant === 'hero' ? 'max-w-6xl mx-auto' : ''}`}>
      <div className="bg-white rounded-[24px] shadow-2xl border border-gray-100 relative z-20 w-full min-w-0">
    {/* Tabs Row */}
<div className="flex items-center justify-between px-6 overflow-x-auto no-scrollbar border-b border-gray-100 gap-6">
  {CATEGORIES.map((cat) => (
    <button
      key={cat.id}
      onClick={() => {
        setActiveCategory(cat.id);
        handleUpdateFilter('listingType', cat.id);
      }}
      className={`relative py-3 text-base font-bold transition-colors whitespace-nowrap ${
        activeCategory === cat.id
          ? 'text-black'
          : 'text-gray-800 hover:text-gray-600'
      }`}
    >
      {cat.label}

      {activeCategory === cat.id && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
        />
      )}
    </button>
  ))}
</div>

        {/* Filters Row */}
        <div className="p-3">
          <div className="flex flex-wrap items-center gap-3 relative z-30">
            
            {/* Locality Search */}
            <div className="flex-1 min-w-[200px] relative group">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <input
                type="text"
                placeholder="Search Locality..."
                value={filters.location}
                onChange={(e) => handleUpdateFilter('location', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>

            {/* Reordered Order: Property type, BHK, Area, furnishing , budget, amenities */}
            
            {/* Property Type */}
            <FilterPopover
              label="Property Type"
              active={filters.propertyType.length > 0}
              summary={filters.propertyType.length > 0 ? filters.propertyType[0] + (filters.propertyType.length > 1 ? ` +${filters.propertyType.length - 1}` : '') : null}
            >
              <div className="grid grid-cols-1 gap-2">
                {PROPERTY_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.propertyType.includes(type)}
                      onChange={() => toggleArrayFilter('propertyType', type)}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </FilterPopover>

            {/* BHK */}
            <FilterPopover
              label="BHK"
              active={filters.bhk.length > 0}
              summary={filters.bhk.length > 0 ? `${filters.bhk.join(', ')} BHK` : null}
            >
              <div className="flex flex-wrap gap-2">
                {BHK_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => toggleArrayFilter('bhk', opt)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.bhk.includes(opt)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt} BHK
                  </button>
                ))}
              </div>
            </FilterPopover>

            {/* Area */}
            <FilterPopover
               label="Area (sqft)"
               active={!!filters.areaMin || !!filters.areaMax}
            >
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Min Area"
                  value={filters.areaMin}
                  onChange={(e) => handleUpdateFilter('areaMin', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg outline-none"
                />
                <input
                  type="number"
                  placeholder="Max Area"
                  value={filters.areaMax}
                  onChange={(e) => handleUpdateFilter('areaMax', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg outline-none"
                />
              </div>
            </FilterPopover>

            {/* Furnishing */}
            <FilterPopover
              label="Furnishing"
              active={filters.furnishing.length > 0}
            >
              <div className="grid grid-cols-1 gap-2">
                {FURNISHING_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.furnishing.includes(opt)}
                      onChange={() => toggleArrayFilter('furnishing', opt)}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </FilterPopover>

            {/* Budget */}
            <FilterPopover
              label="Budget"
              active={!!filters.budgetMin || !!filters.budgetMax}
              summary={filters.budgetMin || filters.budgetMax ? `₹${filters.budgetMin || 0} - ₹${filters.budgetMax || 'max'}` : null}
            >
              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.budgetMin}
                    onChange={(e) => handleUpdateFilter('budgetMin', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.budgetMax}
                    onChange={(e) => handleUpdateFilter('budgetMax', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-lg outline-none"
                  />
                </div>
              </div>
            </FilterPopover>

            {/* Amenities */}
            <FilterPopover
              label="Amenities"
              active={filters.amenities.length > 0}
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {AMENITIES_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(opt)}
                      onChange={() => toggleArrayFilter('amenities', opt)}
                      className="mt-0.5 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
                    />
                    <span className="text-sm text-gray-700 break-words">{opt}</span>
                  </label>
                ))}
              </div>
            </FilterPopover>

          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartSearchBar;
