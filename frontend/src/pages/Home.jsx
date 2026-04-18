import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import SmartSearchBar from '../components/SmartSearchBar';
import PropertyCard from '../components/PropertyCard';
import { useProperty } from '../contexts/PropertyContext';
import { useLocation } from '../contexts/LocationContext';
import { MapPin, Navigation } from 'lucide-react';

const HERO_IMAGES = [
  'https://revo.homes/wp-content/uploads/2026/01/Lingaraj_Temple_in_the_evening.jpg',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80',
];

const CITIES = [
  { name: 'Mumbai', count: 12500, image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400' },
  { name: 'Bangalore', count: 9800, image: 'https://images.unsplash.com/photo-1587492381279-7dc62e704bb6?w=400' },
  { name: 'Delhi NCR', count: 11200, image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400' },
  { name: 'Hyderabad', count: 7600, image: 'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=400' },
  { name: 'Pune', count: 6200, image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400' },
  { name: 'Chennai', count: 5400, image: 'https://images.unsplash.com/photo-1582961467288-50b7c9041086?w=400' },
];

const SERVICES = [
  {
    title: 'Home Loans',
    description: 'Best rates from top banks',
    link: '/tools/home-loan',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
  },
  {
    title: 'EMI Calculator',
    description: 'Calculate monthly EMI',
    link: '/tools/emi-calculator',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
  },
  {
    title: 'Loan Insurance',
    description: 'Secure your family future',
    link: '/tools?tab=loan-insurance',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
  },
  {
    title: 'Property Agreement',
    description: 'Expert documentation assistance',
    link: '/tools/property-agreement',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
  },
  {
    title: 'Property Valuation',
    description: 'Free estimates',
    link: '/tools?tab=valuation',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
  },
  {
    title: 'Interior Design',
    description: 'Beautiful designs',
    link: '/tools?tab=interior',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400',
  },
  {
    title: 'Property Management',
    description: 'Expert management',
    link: '/tools?tab=management',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400',
  },
  {
    title: 'Rental Yield',
    description: 'Check ROI potential',
    link: '/tools/rental-yield',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
  }
];

const BUILDERS = [
  { 
    name: 'DLF Limited', 
    city: 'Delhi NCR', 
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'
  },
  { 
    name: 'Lodha Group', 
    city: 'Mumbai', 
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'
  },
  { 
    name: 'Prestige Group', 
    city: 'Bangalore', 
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'
  },
  { 
    name: 'Brigade Group', 
    city: 'Hyderabad', 
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80'
  },
  { 
    name: 'Godrej Properties', 
    city: 'Pune', 
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'
  },
  { 
    name: 'Sobha Limited', 
    city: 'Chennai', 
    image: 'https://images.unsplash.com/photo-1448630360428-654a9d902e17?w=800&q=80'
  },
  { 
    name: 'Puravankara', 
    city: 'Bangalore', 
    image: 'https://images.unsplash.com/photo-1460317442991-0ec239397118?w=800&q=80'
  },
  { 
    name: 'Kolte Patil', 
    city: 'Pune', 
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'
  },
];

const TRUST_INDICATORS = [
  { label: '50,000+', sub: 'Properties Listed' },
  { label: '1M+', sub: 'Happy Customers' },
  { label: '500+', sub: 'Verified Agents' },
  { label: '24/7', sub: 'Support' },
  { label: '100%', sub: 'Verified' },
  { label: '0%', sub: 'Brokerage Charge' },
];

const TESTIMONIALS = [
  {
    quote: 'Found my dream home in just 2 weeks. REVO HOMES made the process seamless and stress-free.',
    author: 'Priya Sharma',
    role: 'Home Buyer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  },
  {
    quote: 'As a seller, I got multiple genuine enquiries. The platform is professional and trustworthy.',
    author: 'Rahul Mehta',
    role: 'Property Seller',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
  },
  {
    quote: 'The EMI calculator and loan assistance helped me plan my purchase perfectly. Highly recommend!',
    author: 'Anita Reddy',
    role: 'First-time Buyer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anita',
  },
];

function ServiceIcon({ name }) {
  const icons = {
    bank: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    calculator: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    legal: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    chart: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    home: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    user: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  };
  return icons[name] || null;
}

function Home() {
  const { listings, featured } = useProperty();
  const { location, formatLocation } = useLocation();
  const filters = useSelector((state) => state.properties.filters);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);

  const filteredResults = useMemo(() => {
    if (!listings || listings.length === 0) return [];
    
    // Check if any filter is non-default
    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
      if (key === 'listingType') return value !== 'buy';
      if (Array.isArray(value)) return value.length > 0;
      return value !== '' && value !== null && value !== undefined;
    });

    if (!hasActiveFilters) return null; // Use null to indicate "no filters active"

    const results = listings.filter(p => {
      if (filters.location && !p.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.listingType && p.listingType !== filters.listingType) return false;
      if (filters.bhk.length > 0 && !filters.bhk.includes(p.bhk?.toString())) return false;
      if (filters.propertyType.length > 0 && !filters.propertyType.includes(p.propertyType)) return false;
      if (filters.budgetMin && p.price < Number(filters.budgetMin)) return false;
      if (filters.budgetMax && p.price > Number(filters.budgetMax)) return false;
      if (filters.areaMin && Number(p.area) < Number(filters.areaMin)) return false;
      if (filters.areaMax && Number(p.area) > Number(filters.areaMax)) return false;
      return true;
    });

    return results;
  }, [filters, listings]);

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const heroTimer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(heroTimer);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveServiceIndex((prev) => (prev + 1) % SERVICES.length);
    }, 2000); // Fastened from 3000ms
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gray-950 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={heroIndex}
            src={HERO_IMAGES[heroIndex]}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/60 to-gray-950" />
        
        {/* Location Badge */}
        {location && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20"
          >
            <div className="relative group">
              {/* Glassmorphism background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-full border border-white/20 shadow-xl" />
              
              {/* Animated pulse ring */}
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full animate-pulse" />
              
              {/* Content */}
              <div className="relative px-6 py-3 flex items-center gap-3">
                <div className="relative">
                  <Navigation className="w-5 h-5 text-white animate-pulse" />
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-sm" />
                </div>
                <div className="text-white">
                  <p className="text-sm font-bold">{formatLocation()}</p>
                  <p className="text-xs text-white/80 font-medium">Showing nearby properties</p>
                </div>
              </div>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            </div>
          </motion.div>
        )}
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-8 pb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 animate-fade-in">
            Find Your Perfect Space
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Buy, sell, and rent properties with confidence. Your trusted real estate marketplace.
          </p>
          <SmartSearchBar variant="hero" />
        </div>
      </section>

      {/* Dynamic Search Results (Only shown when filters active) */}
      <AnimatePresence mode="wait">
        {filteredResults !== null && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="py-16 bg-white px-4 border-b border-gray-100"
          >
            <div className="max-w-7xl mx-auto">
              {filteredResults.length > 0 ? (
                <>
                  <div className="flex justify-between items-end mb-10">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Results for You</h2>
                      <p className="text-gray-500">Found {filteredResults.length} properties matching your filters</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredResults.map((prop) => (
                      <PropertyCard key={prop.id} {...prop} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No properties match your filter</h3>
                  <p className="text-gray-500">Try adjusting your filters or location to find more properties.</p>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Location-Based Results (Shown when location is detected) */}
      {location && filteredResults === null && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="py-16 bg-white px-4 border-b border-gray-100"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Results for You</h2>
                <p className="text-gray-500">
                  Found {listings && listings.length > 0 ? listings.length : 0} listings near {formatLocation()}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{formatLocation()}</span>
              </div>
            </div>
            
            {listings && listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {listings.slice(0, 8).map((prop) => (
                  <PropertyCard 
                    key={prop.id} 
                    {...prop} 
                    showDistance={true}
                    showVerifiedImage={true} 
                    viewsAtBottomRight={true} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found nearby</h3>
                <p className="text-gray-500">Try searching in a different location or check back later.</p>
              </div>
            )}
            
            {listings && listings.length > 8 && (
              <div className="text-center mt-12">
                <Link
                  to="/properties"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/20"
                >
                  View All {listings.length} Listings
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* Featured Properties (Always shown, or shown as default) */}
      <section className="py-16 lg:py-24 px-4 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Properties</h2>
            <p className="text-gray-500">Handpicked homes you'll love</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Show featured listings if available, otherwise show random listings */}
            {(featured && featured.length > 0 ? featured : 
              // Fallback: get 8 random listings from all listings
              listings && listings.length > 0 
                ? [...listings].sort(() => Math.random() - 0.5).slice(0, 8)
                : []
            ).map((prop) => (
              <PropertyCard 
                key={prop.id} 
                {...prop} 
                showVerifiedImage={true} 
                viewsAtBottomRight={true} 
              />
            ))}
            
            {/* Show placeholder cards if no listings available */}
            {(!featured || featured.length === 0) && (!listings || listings.length === 0) && 
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            }
          </div>
          <div className="text-center mt-12">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/20"
            >
              View All Properties
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-20 lg:py-28 bg-accent/30 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Popular Cities</h2>
            <p className="text-gray-500 text-lg">Explore properties in top Indian cities</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {CITIES.map((city) => (
              <a
                key={city.name}
                href={`/properties?location=${encodeURIComponent(city.name)}`}
                className="group block rounded-3xl overflow-hidden aspect-[4/5] relative shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform group-hover:-translate-y-1 transition-transform">
                  <h3 className="font-black text-xl mb-1">{city.name}</h3>
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{city.count.toLocaleString()} properties</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Builders Section */}
      <section className="py-20 lg:py-28 bg-white px-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4 text-center md:text-left">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Popular Builders</h2>
              <p className="text-gray-500 text-lg">Work with the most trusted names in real estate</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Primary CTA - Become a Builder/Agent */}
              <Link 
                to="/become-builder" 
                className="group relative flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:border-red-700 hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 rounded-lg text-sm font-semibold transition-all duration-300 ease-out overflow-hidden shadow-md shadow-red-500/20"
              >
                {/* Animated dot indicator with ring */}
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white ring-2 ring-white/50"></span>
                </span>
                
                {/* Icon with hover animation */}
                <svg 
                  className="w-4 h-4 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                
                {/* Text with slide effect */}
                <span className="relative transition-transform duration-300 ease-out group-hover:translate-x-0.5">Become Builder/Agent</span>
                
                {/* Subtle shimmer effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </Link>

              {/* Secondary CTA - View All Builders */}
              <Link 
                to="/builders" 
                className="group flex items-center px-4 py-2.5 bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900 hover:shadow-sm hover:-translate-y-0.5 rounded-lg text-sm font-medium transition-all duration-300 ease-out"
              >
                <span className="transition-transform duration-300 ease-out group-hover:translate-x-0.5">View All Builders</span>
                <svg 
                  className="w-3.5 h-3.5 ml-1.5 text-gray-400 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:text-gray-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BUILDERS.map((builder) => (
              <Link
                key={builder.name}
                to="/properties"
                className="group relative h-[240px] rounded-[1.5rem] overflow-hidden shadow-xl hover:shadow-primary/20 transition-all duration-700"
              >
                <img
                  src={builder.image}
                  alt={builder.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="transform group-hover:-translate-y-2 transition-transform duration-500">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2 drop-shadow-md">
                      Featured Builder
                    </p>
                    <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                      {builder.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin size={14} className="text-primary" />
                      <span className="text-sm font-bold tracking-wide">Main Office: {builder.city}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest bg-primary px-4 py-2 rounded-full shadow-lg">
                      Explore Properties
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section with Full BG and Refined Cards */}
      <section className="relative py-24 lg:py-32 px-4 overflow-hidden">
        {/* Full Section Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80" 
            alt="" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/40 to-white" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">Our Services</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">Elevate your property experience with our specialized suite of expert services.</p>
          </div>

          <div 
            className="relative h-[480px] lg:h-[400px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="flex justify-center items-center h-full perspective-3000 relative">
              {/* Manual Navigation Arrows */}
              <button 
                onClick={() => setActiveServiceIndex((prev) => (prev - 1 + SERVICES.length) % SERVICES.length)}
                className="absolute left-0 lg:-left-12 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 border border-white/20 transition-all shadow-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <AnimatePresence mode="popLayout" initial={false}>
                {SERVICES.map((service, index) => {
                  const offset = ((index - activeServiceIndex + SERVICES.length) % SERVICES.length);
                  let displayOffset = offset;
                  if (offset > SERVICES.length / 2) displayOffset = offset - SERVICES.length;

                  const absOffset = Math.abs(displayOffset);
                  if (absOffset > 2) return null;

                  return (
                    <motion.div
                      key={service.title}
                      layout
                      initial={{ opacity: 0, x: displayOffset * 300, scale: 0.8, rotateY: displayOffset * 15 }}
                      animate={{ 
                        opacity: absOffset === 0 ? 1 : 0.6 / absOffset, 
                        x: displayOffset * (window.innerWidth > 1024 ? 320 : 200), 
                        scale: absOffset === 0 ? 1 : 0.85,
                        rotateY: displayOffset * 10,
                        zIndex: 10 - absOffset,
                      }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 400, // Faster spring (from 260)
                        damping: 30,    // Snappier dampening (from 25)
                      }}
                      className="absolute"
                    >
                      <Link
                        to={service.link}
                        className={`block w-[240px] sm:w-[280px] lg:w-[300px] overflow-hidden bg-white/40 backdrop-blur-xl rounded-[2.5rem] border-2 transition-all duration-500 ${
                          absOffset === 0 
                            ? 'border-primary shadow-2xl shadow-primary/20 ring-8 ring-primary/5 scale-110' 
                            : 'border-transparent grayscale opacity-50'
                        }`}
                      >
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img 
                            src={service.image} 
                            alt={service.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                        </div>
                        
                        <div className="p-8 text-center">
                          <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">
                            {service.title}
                          </h3>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            {service.description}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <button 
                onClick={() => setActiveServiceIndex((prev) => (prev + 1) % SERVICES.length)}
                className="absolute right-0 lg:-right-12 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 border border-white/20 transition-all shadow-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="flex justify-center gap-3 mt-16">
              {SERVICES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveServiceIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === activeServiceIndex 
                      ? 'bg-primary w-12 shadow-lg shadow-primary/30' 
                      : 'bg-gray-200 w-3 hover:bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose REVO HOMES with Sliding Animation */}
      <section className="py-20 lg:py-32 bg-primary px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Why Choose REVO HOMES</h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">Trusted by thousands of buyers and sellers for a seamless and transparent property experience.</p>
        </div>
        
        <div className="relative flex overflow-x-hidden group">
          <motion.div
            className="flex whitespace-nowrap gap-12 sm:gap-24 items-center"
            animate={{
              x: [0, -1032], // This value should ideally match the width of one set of items
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 25,
                ease: "linear",
              },
            }}
          >
            {/* Duplicate the list to create a seamless loop */}
            {[...TRUST_INDICATORS, ...TRUST_INDICATORS].map((item, index) => (
              <div key={`${item.sub}-${index}`} className="flex flex-col items-center min-w-[150px] sm:min-w-[200px]">
                <div className="text-3xl lg:text-5xl font-extrabold text-white mb-2 leading-none">{item.label}</div>
                <div className="text-white/70 font-semibold uppercase tracking-widest text-[10px] lg:text-xs whitespace-nowrap">{item.sub}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">What Our Customers Say</h2>
            <p className="text-gray-500">Real stories from real people</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, index) => (
              <div
                key={`${t.author}-${index}`}
                className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="flex text-primary mb-6">
                   {[...Array(5)].map((_, i) => (
                     <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                       <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                     </svg>
                   ))}
                </div>
                <p className="text-gray-600 mb-8 italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{t.author}</p>
                    <p className="text-sm text-gray-500 font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;