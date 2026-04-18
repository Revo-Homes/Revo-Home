import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocation as useGeoLocation } from '../contexts/LocationContext';
import logo from '../assets/Revo Homes Logo.png';
import { 
  Menu, 
  ChevronDown, 
  Calculator, 
  Scale, 
  Home, 
  Paintbrush, 
  TrendingUp, 
  Banknote,
  Wrench,
  MapPin,
  Navigation
} from 'lucide-react';

// ── Compact Location Display ─────────────────────────────────────────────────────
function CompactLocationDisplay() {
  const { location, formatLocation, detectLocation, forceDetectLocation, isDetecting, searchLocations, selectLocation, searchResults } = useGeoLocation();
  const { isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Auto-detect location on mount for all users
  useEffect(() => {
    if (!location) {
      console.log('CompactLocationDisplay: No location found, detecting location...');
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.error('CompactLocationDisplay: Geolocation is not supported by this browser');
        return;
      }
      
      // Check permission status
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          console.log('CompactLocationDisplay: Geolocation permission state:', result.state);
          if (result.state === 'denied') {
            console.error('CompactLocationDisplay: Geolocation permission denied');
            // Don't show alert for non-logged users, just log it
            if (isLoggedIn) {
              alert('Location access is denied. Please enable location permissions in your browser settings.');
            }
          } else if (result.state === 'granted') {
            console.log('CompactLocationDisplay: Permission granted, detecting location...');
            detectLocation();
          } else if (result.state === 'prompt') {
            console.log('CompactLocationDisplay: Permission will be prompted, detecting location...');
            // Will prompt user for permission
            detectLocation();
          }
        });
      } else {
        // Fallback for browsers that don't support permissions API
        console.log('CompactLocationDisplay: Permissions API not supported, trying direct detection...');
        detectLocation();
      }
    }
  }, [location, detectLocation, isLoggedIn]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = async (query) => {
    setSearch(query);
    if (query.length > 2) {
      await searchLocations(query);
    }
  };

  const handleLocationSelect = async (loc) => {
    await selectLocation(loc);
    setIsOpen(false);
    setSearch('');
  };

  const handleDetectAgain = async () => {
    try {
      console.log('CompactLocationDisplay: Manual location detection triggered...');
      await forceDetectLocation();
      setIsOpen(false);
      console.log('CompactLocationDisplay: Location detection successful!');
    } catch (error) {
      console.error('CompactLocationDisplay: Manual location detection failed:', error);
      // You could show a toast or error message here
      alert('Location detection failed: ' + (error.message || 'Please enable location permissions in your browser'));
    }
  };

  if (!location) {
    return (
      <button
        onClick={async () => {
          try {
            console.log('CompactLocationDisplay: Initial location detection triggered...');
            await forceDetectLocation();
            console.log('CompactLocationDisplay: Initial location detection successful!');
          } catch (error) {
            console.error('CompactLocationDisplay: Initial location detection failed:', error);
            alert('Location detection failed: ' + (error.message || 'Please enable location permissions in your browser'));
          }
        }}
        disabled={isDetecting}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-primary hover:bg-red-50 transition-all text-sm font-medium text-gray-700 group"
      >
        <Navigation className={`w-4 h-4 text-primary flex-shrink-0 ${isDetecting ? 'animate-spin' : ''}`} />
        <span className="max-w-[120px] truncate text-gray-800">
          {isDetecting ? 'Detecting...' : 'Detect Location'}
        </span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-primary hover:bg-red-50 transition-all text-sm font-medium text-gray-700 group"
      >
        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="max-w-[120px] truncate text-gray-800" title={formatLocation()}>
          {formatLocation() || 'Current Location'}
        </span>
        <svg
          className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-slide-up">
          {/* Current Location */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-blue-900">Current Location</span>
                <p className="text-xs text-blue-700 mt-0.5">{formatLocation()}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                autoFocus
                type="text"
                placeholder="Search city, area, or locality..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Detect Again Button */}
          <div className="p-2 border-b border-gray-100">
            <button
              onClick={handleDetectAgain}
              disabled={isDetecting}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left transition-colors rounded-lg hover:bg-gray-50 group"
            >
              <div className={`w-8 h-8 bg-primary rounded-full flex items-center justify-center ${isDetecting ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`}>
                <Navigation className={`w-4 h-4 text-white ${isDetecting ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex-1">
                <span className="text-gray-700 font-medium">
                  {isDetecting ? 'Detecting...' : 'Use my current location'}
                </span>
                <p className="text-xs text-gray-500">Auto-detect your location</p>
              </div>
            </button>
          </div>

          {/* Search Results */}
          {search && searchResults && searchResults.length > 0 && (
            <div className="py-2 max-h-48 overflow-y-auto">
              <p className="px-4 py-2 text-xs text-gray-400 font-medium uppercase tracking-wider">Search Results</p>
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(result)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left transition-colors hover:bg-gray-50 group"
                >
                  <MapPin className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                  <div className="flex-1">
                    <span className="text-gray-700 font-medium block">{result.city || result.name}</span>
                    {result.state && <span className="text-xs text-gray-500">{result.state}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Popular Cities */}
          <div className="py-2">
            <p className="px-4 py-2 text-xs text-gray-400 font-medium uppercase tracking-wider">Popular Cities</p>
            {[
              { city: 'Mumbai', state: 'Maharashtra' },
              { city: 'Bangalore', state: 'Karnataka' },
              { city: 'Delhi NCR', state: 'Delhi' },
              { city: 'Hyderabad', state: 'Telangana' },
              { city: 'Pune', state: 'Maharashtra' },
              { city: 'Chennai', state: 'Tamil Nadu' },
              { city: 'Kolkata', state: 'West Bengal' },
              { city: 'Bhubaneswar', state: 'Odisha' }
            ].map((city) => (
              <button
                key={city.city}
                onClick={() => handleLocationSelect(city)}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left transition-colors hover:bg-gray-50 group"
              >
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                  <MapPin className="w-3 h-3 text-gray-500 group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-gray-700 font-medium">{city.city}</span>
                  <span className="text-xs text-gray-500 ml-2">{city.state}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ToolsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const services = [
    { title: 'Property Management', id: 'management', icon: Home },
    { title: 'EMI Calculator', id: 'emi', icon: Calculator },
    { title: 'Rental Yield', id: 'rental-yield', icon: TrendingUp },
    { title: 'Interior Design', id: 'interior', icon: Paintbrush },
    { title: 'Home Loans', id: 'loans', icon: Banknote, path: '/tools/home-loan' },
  ];

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-700 hover:text-primary hover:bg-primary/5 transition-all text-[11px] font-black uppercase tracking-wider group bg-gray-50/50 border border-gray-100 h-11"
        title="Tools & Services"
      >
        <Wrench size={14} className="text-primary group-hover:rotate-12 transition-transform" />
        <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden py-3 animate-slide-up">
          <div className="grid grid-cols-1 gap-1">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => {
                  if (service.path) {
                    navigate(service.path);
                  } else {
                    navigate(`/tools?tab=${service.id}`);
                  }
                  setIsOpen(false);
                }}
                className="flex items-center gap-4 px-5 py-3 text-left hover:bg-primary/5 group transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-primary group-hover:shadow-md transition-all">
                  <service.icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">{service.title}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">Expert Service</p>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-50 px-5">
             <button 
               onClick={() => { navigate('/tools'); setIsOpen(false); }}
               className="w-full py-2.5 bg-gray-50 hover:bg-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-gray-500"
             >
               View All Services
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
function Navbar() {
  const { isLoggedIn, logout, openLogin, openSignup, openPreAuthModal, isPhoneVerified } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleAddProperty = () => {
    if (!isLoggedIn) {
      openLogin();
    } else {
      navigate('/sell');
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/97 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center h-16 lg:h-[72px] justify-between">

            {/* ── Left: Logo + Location ─────────────────────────── */}
            <div className="flex items-center gap-3 flex-shrink-0">
             <Link to="/" className="flex items-center gap-2">
  <img
    src={logo}
    alt="Revo Homes"
    className="h-8 lg:h-20 w-auto object-contain drop-shadow-sm mt-1"
  />
</Link>
              {/* Divider */}
              <div className="h-5 w-px bg-gray-200" />
              {/* Location selector */}
              <div className="relative">
                <CompactLocationDisplay />
              </div>
            </div>

            {/* ── Right: Nav links ──────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Add Property (Owners Only) — styled CTA */}
              <button
                onClick={handleAddProperty}
                className="flex flex-col items-center justify-center px-5 h-11 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl transition-all shadow-sm group"
              >
                <span className="text-[9px] font-black uppercase tracking-[0.05em] opacity-70 leading-tight">
                  Owners Only
                </span>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs font-black whitespace-nowrap">Add Property</span>
                </div>
              </button>

              {/* Login / Dashboard */}
              {isLoggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-6 h-11 flex items-center bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                  >
                    Dashboard
                  </Link>
                  <ToolsDropdown />
                </>
              ) : (
                <>
                  <button
                    onClick={openLogin}
                    className="px-6 h-11 border-2 border-primary text-primary text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all"
                  >
                    Login
                  </button>
                  <ToolsDropdown />
                </>
              )}
            </div>

            {/* ── Mobile Hamburger ──────────────────────────────── */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden ml-auto p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* ── Mobile Menu ────────────────────────────────────── */}
          {isMenuOpen && (
            <div className="lg:hidden py-3 border-t border-gray-100 animate-fade-in">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { handleAddProperty(); setIsMenuOpen(false); }}
                  className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl shadow-sm animate-fade-in"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Owners Only</span>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm font-bold">Add Property</span>
                  </div>
                </button>
                 {isLoggedIn ? (
                   <div className="flex flex-col gap-2">
                     <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="px-3 py-3 bg-primary text-white text-sm font-bold rounded-xl text-center shadow-lg">
                       Dashboard
                     </Link>
                   </div>
                 ) : (
                   <button
                     onClick={() => { 
                       openLogin(); 
                       setIsMenuOpen(false);
                     }}
                     className="px-3 py-3 border-2 border-primary text-primary text-sm font-bold rounded-xl hover:bg-primary hover:text-white transition-all"
                   >
                     Login
                   </button>
                 )}
                 <Link 
                   to="/tools" 
                   onClick={() => setIsMenuOpen(false)}
                   className="px-3 py-3 bg-gray-50 text-gray-700 text-sm font-bold rounded-xl text-center border border-gray-100 flex items-center justify-center gap-2"
                 >
                   <Wrench className="w-4 h-4" />
                   Tools & Services
                 </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
