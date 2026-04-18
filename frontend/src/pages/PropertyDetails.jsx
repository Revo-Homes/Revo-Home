import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProperty } from '../contexts/PropertyContext';
import { useRevoLeadTracker } from '../hooks/useRevoLeadTracker';
import PropertyMap from "../components/PropertyMap";
import ImageGallery from "../components/ImageGallery";
import EMICalculator from './EMICalculator';
import RentalYieldCalculator from './RentalYield';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  BedDouble, 
  Maximize, 
  Home, 
  Lock, 
  CheckCircle2, 
  Phone, 
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Star,
  Award,
  Heart,
  Paintbrush,
  Trash2,
  IndianRupee,
  Building2,
  Car,
  Sparkles,
  Eye,
  Globe,
  Database,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Independent House', 'Plot', 'Commercial'];

// Safely normalize any value to an array (handles JSON strings, objects, null)
const toArray = (val, fallback = []) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    // Could be a JSON string like '["Parking", "Gym"]'
    try { const parsed = JSON.parse(val); if (Array.isArray(parsed)) return parsed; } catch (_) {}
    // Could be a comma-separated string
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return fallback;
};

// ============================================
// SCHEMA-DRIVEN PROPERTY FIELD CONFIGURATION
// ============================================

const PROPERTY_SECTIONS = [
  {
    title: "Basic Information",
    icon: "Home",
    fields: ["title", "name", "description", "reference_no", "listing_type", "property_type", "property_subtype", "property_type_id", "property_category_id", "property_category", "status", "slug"]
  },
  {
    title: "Pricing Details",
    icon: "IndianRupee",
    fields: ["price", "price_min", "price_max", "price_per_sqft", "currency", "is_negotiable", "price_on_request", "rent_amount", "rent_frequency", "security_deposit", "maintenance_charge", "maintenance_period", "brokerage_percent"]
  },
  {
    title: "Location",
    icon: "MapPin",
    fields: ["address_line1", "address_line2", "locality", "landmark", "city", "state", "country", "zip_code", "postal_code", "latitude", "longitude"]
  },
  {
    title: "Property Specifications",
    icon: "BedDouble",
    fields: ["bhk", "bedrooms", "bathrooms", "kitchens", "balconies", "total_units", "total_floors", "floor_number", "furnished_status", "furnished", "construction_quality"]
  },
  {
    title: "Area Details",
    icon: "Maximize",
    fields: ["total_area", "builtup_area", "carpet_area", "super_builtup_area", "area_unit", "area"]
  },
  {
    title: "Construction & Possession",
    icon: "Building2",
    fields: ["year_built", "possession_date", "age_of_property", "available_from", "available_until", "facing_direction"]
  },
  {
    title: "Parking & Utilities",
    icon: "Car",
    fields: ["parking_spaces", "parking", "parking_type", "power_backup", "lift", "water_source", "rainwater_harvesting"]
  },
  {
    title: "Features & Amenities",
    icon: "Sparkles",
    fields: ["features", "amenities", "meta"]
  },
  {
    title: "Verification & Compliance",
    icon: "ShieldCheck",
    fields: ["is_verified", "verified", "verification_status", "verification_notes", "verified_at", "is_featured", "is_exclusive", "is_published", "published_at", "rera_number", "rera_expiry_date"]
  },
  {
    title: "Engagement Metrics",
    icon: "Eye",
    fields: ["views_count", "inquiries_count", "favorites_count", "shares_count"]
  },
  {
    title: "SEO & Marketing",
    icon: "Globe",
    fields: ["meta_title", "meta_description", "virtual_tour_url"]
  },
  {
    title: "System Information",
    icon: "Database",
    fields: ["id", "property_id", "organization_id", "created_at", "updated_at", "expires_at", "created_by", "updated_by", "deleted_at"]
  }
];

// Fields to exclude from rendering (internal IDs, etc.)
const EXCLUDED_FIELDS = ['id', 'property_id', 'organization_id', 'deleted_at'];

// ============================================
// FIELD FORMATTING UTILITIES
// ============================================

const formatFieldLabel = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

const formatFieldValue = (key, value) => {
  // Handle null/undefined
  if (value === null || value === undefined) return null;
  
  // Handle boolean
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  // Handle dates
  if (key.includes('_at') || key.includes('_date') || key.includes('available_')) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-IN', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        });
      }
    } catch (e) {
      return value;
    }
  }
  
  // Handle currency/price fields
  if ((key.includes('price') || key.includes('rent') || key.includes('deposit') || key.includes('charge')) && !isNaN(Number(value))) {
    const num = Number(value);
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    } else if (num >= 1000) {
      return `₹${num.toLocaleString('en-IN')}`;
    }
    return `₹${num}`;
  }
  
  // Handle area fields
  if ((key.includes('area') || key.includes('_area')) && !key.includes('unit') && !isNaN(Number(value))) {
    const unit = ' sq.ft';
    return `${Number(value).toLocaleString('en-IN')}${unit}`;
  }
  
  return value;
};

const isValidValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === 'object' && Object.keys(value).length === 0) return false;
  return true;
};

const renderFieldValue = (key, value) => {
  if (!isValidValue(value)) return null;
  
  // Handle arrays (amenities, features, etc.)
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-2">
        {value.map((item, idx) => (
          <span 
            key={idx} 
            className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full capitalize"
          >
            {item}
          </span>
        ))}
      </div>
    );
  }
  
  // Handle objects (JSON meta data)
  if (typeof value === 'object' && value !== null) {
    return (
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <pre className="whitespace-pre-wrap font-mono text-xs">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    );
  }
  
  const formatted = formatFieldValue(key, value);
  return <span className="font-semibold text-gray-900">{formatted}</span>;
};

const MOCK_PROPERTY_EXTENDED = {
  id: 1,
  images: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
  ],
  price: 45000,
  location: 'Koramangala, Bangalore',
  title: 'Modern 3BHK Apartment with Premium Amenities',
  bhk: '3',
  area: '1850',
  propertyType: 'Apartment',
  furnished: 'Fully Furnished',
  description: 'Beautiful 3BHK apartment in prime Koramangala location. This spacious home features a large living room, modular kitchen, and 3 well-ventilated bedrooms with attached bathrooms. The property comes with premium fittings and is ready to move in.',
  amenities: ['Parking', 'Lift', 'Gym', 'Swimming Pool', 'Security', 'Power Backup', 'Club House'],
  nearby: ['Metro Station - 500m', 'Shopping Mall - 1km', 'Schools - 2km', 'Hospital - 1.5km'],
  owner: { name: 'Raj Kumar', phone: '+91 9876543210', verified: true },
};

function PropertyDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLoggedIn, isSubscribed, openLoginForPropertyDetails, user } = useAuth();
  const { getProperty, addEnquiry, isSaved, toggleFavorite } = useProperty();
  const { generateLead } = useRevoLeadTracker();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('I am interested in this property.');
  const [showEMI, setShowEMI] = useState(false);
  const [showRental, setShowRental] = useState(false);
  
  // Dynamic Reviews State
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [enquirySent, setEnquirySent] = useState(false);

  const saved = isSaved(property?.propertyId || property?.id || id);
  
  // Guest view mode - no login required to view limited preview
  const isGuestView = !isLoggedIn;

  // Load reviews from localStorage
  useEffect(() => {
    const savedReviews = JSON.parse(localStorage.getItem(`reviews_${id}`) || '[]');
    const initialReviews = [
      { id: '1', name: 'Amit Singh', date: '2 days ago', rating: 5, comment: 'Beautiful property, exactly as shown in the pictures. The owner was very helpful.' },
      { id: '2', name: 'Sneha Rao', date: '1 week ago', rating: 4, comment: 'Great location and amenities. The power backup is very reliable.' }
    ];
    setReviews(savedReviews.length > 0 ? savedReviews : initialReviews);
  }, [id]);

  const handleDeleteReview = (reviewId) => {
    const updatedReviews = reviews.filter(r => r.id !== reviewId);
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews));
    setReviewToDelete(null);
  };

  const handleAddReview = () => {
    if (!isLoggedIn) {
      openLoginForPropertyDetails();
      return;
    }
    const reviewObj = {
      id: Date.now().toString(),
      name: 'User', // In a real app, use auth user name
      date: 'Just now',
      rating: newReview.rating,
      comment: newReview.comment,
    };
    const updatedReviews = [reviewObj, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews));
    setShowReviewForm(false);
    setNewReview({ rating: 5, comment: '' });
  };

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      const data = await getProperty(id);
      if (data) {
        // Ensure fetched ID is used, and handle images plural vs singular
        const galleryImages = data.images && data.images.length > 0 
          ? data.images 
          : [data.image || MOCK_PROPERTY_EXTENDED.images[0]];
          
        // Preserve ALL backend fields - no selective mapping
        // Create comprehensive property data object with all fields from API
        const dynamicData = {
          // First, spread all raw data to preserve every field
          ...data,
          
          // UI-specific fallbacks (only if not present in data)
          images: galleryImages,
          
          // Ensure display title exists (falls back to name or generated title)
          title: data.title || data.name || `${data.bhk || '3'} BHK ${data.property_type_id ? PROPERTY_TYPES[data.property_type_id - 1] || 'Property' : 'Property'} in ${data.locality || 'Prime Location'}`,
          
          // Ensure location string exists
          location: data.location || `${data.locality || data.address_line1 || 'Prime Location'}, ${data.city || 'City'}`,
          
          // Ensure price display exists
          price: data.price || data.price_min || data.price_max || MOCK_PROPERTY_EXTENDED.price,
          
          // Ensure property type display exists  
          propertyType: data.property_type || data.propertyType || (data.property_type_id ? PROPERTY_TYPES[data.property_type_id - 1] || 'Property' : 'Apartment'),
          
          // Ensure BHK display exists
          bhk: data.bhk || data.bedrooms || '3',
          
          // Ensure area display exists
          area: data.area || data.carpet_area || data.total_area || data.super_builtup_area || MOCK_PROPERTY_EXTENDED.area,
          
          // Owner info with fallback
          owner: data.owner || { 
            name: data.created_by ? 'Premium Owner' : 'Premium Owner', 
            phone: '+91 9' + String(data.id || '').padEnd(9, '0'),
            verified: true 
          },
          
          // Normalize amenities to array
          amenities: toArray(
            data.amenities || data.features,
            Number(data.bhk) > 2
              ? ['Parking', 'Lift', 'Gym', 'Swimming Pool', 'Security', 'Power Backup', 'Club House']
              : ['Parking', 'Lift', 'Security', 'Power Backup']
          ),
          
          // Normalize nearby to array
          nearby: toArray(data.nearby, [
            `Metro Station - ${Math.floor(Math.random() * 2000) + 200}m`,
            `Shopping Mall - ${Math.floor(Math.random() * 3) + 1}km`,
            `Schools - ${Math.floor(Math.random() * 5) + 1}km`,
            `Hospital - ${Math.floor(Math.random() * 4) + 1}km`
          ]),
          
          // Listing type for UI
          listingType: data.listing_type || data.listingType || 'buy',
        };
        
        // Log all available fields for debugging
        console.log('🏠 Property Data Fields:', Object.keys(dynamicData).sort());
          
        setProperty(dynamicData);
      }
      setLoading(false);
    };
    fetchProperty();
  }, [id, getProperty]);

  // Lead Generation on Page View (Property Click Result)
  useEffect(() => {
    if (isLoggedIn && user && property) {
      console.log('?? Property viewed - generating/updating lead');
      
      // Determine if this is a listing or property based on available data
      const isListing = property.listingType || property.listing_id;
      const leadData = {
        title: property.title,
        price: property.price,
        location: property.location,
        propertyType: property.propertyType,
        bhk: property.bhk,
        area: property.area,
        listingType: property.listingType,
        city: property.city,
        state: property.state,
        userFirstName: user.first_name,
        userLastName: user.last_name,
        userEmail: user.email,
        userPhone: user.phone
      };

      if (isListing) {
        // This is a listing, use listing ID
        leadData.listingId = property.id;
        leadData.propertyId = property.propertyId || property.property_id;
      } else {
        // This is a property, use property ID
        leadData.propertyId = property.id;
        leadData.listingId = property.listing_id;
      }

      generateLead(property.id, user.id, leadData);
    }
  }, [isLoggedIn, user?.id, property?.id, generateLead]); // Only track specific IDs to prevent re-renders

  const handleEnquiry = () => {
    if (!isLoggedIn) {
      openLoginForPropertyDetails();
      return;
    }
    setShowEnquiryForm(true);
  };

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      openLoginForPropertyDetails();
      return;
    }
    await toggleFavorite(property?.propertyId || property?.id || id, !saved);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        {/* Gallery Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[550px] mb-10">
          <div className="md:col-span-2 md:row-span-2 bg-gray-200 rounded-2xl" />
          <div className="bg-gray-200 rounded-2xl hidden md:block" />
          <div className="bg-gray-200 rounded-2xl hidden md:block" />
          <div className="bg-gray-200 rounded-2xl hidden md:block" />
          <div className="bg-gray-200 rounded-2xl hidden md:block" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 h-[600px]" />
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 h-[400px]" />
            <div className="bg-white rounded-[2.5rem] p-8 h-[300px]" />
          </div>
        </div>
      </div>
    );
  }

  // Note: Guest users can now view limited property preview
  // Full details require authentication (handled via isGuestView flag)

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-50/50 min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/')}>Home</span>
          <ChevronRight size={14} />
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/properties')}>Properties</span>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium truncate">{property?.title || 'Property Details'}</span>
        </div>

        {/* Premium Image Gallery - Guest: Single Image | Authenticated: Full Gallery */}
        <div className="mb-10 relative">
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 pointer-events-none">
            <span className="px-6 py-2 bg-white/90 backdrop-blur-md text-gray-900 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl border border-white/50">
              {property.propertyType}
            </span>
          </div>
          {isGuestView ? (
            <div className="relative h-[400px] rounded-2xl overflow-hidden">
              <img 
                src={property.images?.[0] || property.image || MOCK_PROPERTY_EXTENDED.images[0]} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <p className="text-white/90 text-sm font-medium flex items-center gap-2">
                  <Lock size={16} className="text-primary" />
                  Sign in to see all {property.images?.length || 1} photos
                </p>
                <button 
                  onClick={openLoginForPropertyDetails}
                  className="px-4 py-2 bg-white text-gray-900 font-semibold rounded-xl text-sm hover:bg-gray-100 transition-all"
                >
                  Sign In
                </button>
              </div>
            </div>
          ) : (
            <ImageGallery images={property.images} title={property.title} />
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-3">
                    {property.title}
                  </h1>
                  <p className="text-gray-500 flex items-center gap-2 text-lg">
                    <MapPin className="text-primary" size={20} />
                    {property.location}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={handleToggleFavorite}
                      className={`p-4 rounded-2xl transition-all duration-300 shadow-xl flex items-center justify-center ${
                        saved 
                          ? 'bg-red-50 text-red-500 scale-110 shadow-red-200/50' 
                          : 'bg-gray-50 text-gray-400 hover:text-red-400 hover:bg-white hover:scale-105 shadow-gray-200/50'
                      } border border-white`}
                      title={saved ? 'Remove from saved' : 'Save property'}
                    >
                      <Heart size={28} className={saved ? 'fill-current' : ''} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Pricing Reference</p>
                    <p className="text-5xl font-black text-primary tracking-tighter">
                      ₹{property.price?.toLocaleString()}<span className="text-2xl font-bold text-gray-400">{property.listingType === 'rent' ? '/mo' : ''}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-3xl mb-10">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-2">
                    <BedDouble className="text-primary" size={24} />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Beds</p>
                  <p className="font-black text-gray-900">{property.bhk} BHK</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-2">
                    <Maximize className="text-primary" size={24} />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Area</p>
                  <p className="font-black text-gray-900">{property.area} sq.ft</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-2">
                    <Home className="text-primary" size={24} />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Status</p>
                  <p className="font-black text-gray-900">{property.furnished}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-2">
                    <ShieldCheck className="text-primary" size={24} />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Security</p>
                  <p className="font-black text-gray-900">24/7 Gate</p>
                </div>
              </div>

              <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg italic">
                    {isGuestView && property.description && property.description.length > 150 ? (
                      <>
                        {property.description.substring(0, 150)}...
                        <button 
                          onClick={openLoginForPropertyDetails}
                          className="text-primary font-bold ml-1 hover:underline"
                        >
                          Sign in to read more
                        </button>
                      </>
                    ) : (
                      property.description
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-6">
                    Premium Amenities
                    {isGuestView && property.amenities?.length > 4 && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        (4 of {property.amenities.length})
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(isGuestView ? property.amenities?.slice(0, 4) : property.amenities)?.map((a) => (
                      <button 
                        key={a} 
                        onClick={() => navigate(`/properties?amenity=${encodeURIComponent(a)}`)}
                        className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/5 hover:border-primary/20 transition-all group cursor-pointer text-left w-full"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-150 transition-transform" />
                        <span className="font-bold text-gray-700">{a}</span>
                      </button>
                    ))}
                    {isGuestView && property.amenities?.length > 4 && (
                      <button 
                        onClick={openLoginForPropertyDetails}
                        className="flex items-center justify-center gap-2 p-4 bg-gray-100 rounded-2xl border border-gray-200 hover:bg-gray-200 transition-all cursor-pointer text-left w-full group"
                      >
                        <Lock size={16} className="text-gray-500" />
                        <span className="font-semibold text-gray-600 text-sm">
                          +{property.amenities.length - 4} more - Sign in
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {!isGuestView && (
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-6">Nearby Essentials</h3>
                    <div className="space-y-3">
                      {property.nearby.map((place) => (
                        <div key={place} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <div className="flex items-center gap-3">
                            <MapPin size={18} className="text-primary" />
                            <span className="font-bold text-gray-700 tracking-tight">{place.split('-')[0]}</span>
                          </div>
                          <span className="text-sm font-black text-primary bg-primary/5 px-3 py-1 rounded-lg">
                            {place.split('-')[1]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isGuestView && (
                  <div className="mt-8 border-t border-gray-100 pt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 text-xl">Property Location</h3>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100 uppercase tracking-widest flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                        </svg>
                        Map View
                      </span>
                    </div>

                    <div className="relative h-[300px] w-full rounded-2xl overflow-hidden border border-gray-200">
                      <iframe
                        title="Property Location"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`}
                        className="w-full h-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                  </div>
                )}

                {/* ============================================
                    DYNAMIC PROPERTY SECTIONS - ALL DB FIELDS
                    (HIDDEN FOR GUEST USERS)
                    ============================================ */}
                {!isGuestView && (
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                      <Database className="text-primary" size={24} />
                      Complete Property Details
                    </h3>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {Object.keys(property).filter(k => !EXCLUDED_FIELDS.includes(k) && isValidValue(property[k])).length} fields
                    </span>
                  </div>
                  
                  <div className="space-y-6">
                    {PROPERTY_SECTIONS.map((section, sectionIndex) => {
                      // Get valid fields for this section (non-null values)
                      const validFields = section.fields.filter(fieldKey => {
                        // Skip excluded fields
                        if (EXCLUDED_FIELDS.includes(fieldKey)) return false;
                        // Check if property has this field with valid value
                        const value = property[fieldKey];
                        return isValidValue(value);
                      });
                      
                      // Skip section if no valid fields
                      if (validFields.length === 0) return null;
                      
                      return (
                        <motion.div
                          key={section.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: sectionIndex * 0.05 }}
                          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                        >
                          {/* Section Header */}
                          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              {section.icon === 'Home' && <Home size={16} className="text-primary" />}
                              {section.icon === 'IndianRupee' && <IndianRupee size={16} className="text-primary" />}
                              {section.icon === 'MapPin' && <MapPin size={16} className="text-primary" />}
                              {section.icon === 'BedDouble' && <BedDouble size={16} className="text-primary" />}
                              {section.icon === 'Maximize' && <Maximize size={16} className="text-primary" />}
                              {section.icon === 'Building2' && <Building2 size={16} className="text-primary" />}
                              {section.icon === 'Car' && <Car size={16} className="text-primary" />}
                              {section.icon === 'Sparkles' && <Sparkles size={16} className="text-primary" />}
                              {section.icon === 'ShieldCheck' && <ShieldCheck size={16} className="text-primary" />}
                              {section.icon === 'Eye' && <Eye size={16} className="text-primary" />}
                              {section.icon === 'Globe' && <Globe size={16} className="text-primary" />}
                              {section.icon === 'Database' && <Database size={16} className="text-primary" />}
                            </div>
                            <h4 className="font-black text-gray-900">{section.title}</h4>
                            <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                              {validFields.length}
                            </span>
                          </div>
                          
                          {/* Section Fields Grid */}
                          <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {validFields.map((fieldKey) => {
                                const value = property[fieldKey];
                                const renderedValue = renderFieldValue(fieldKey, value);
                                
                                if (!renderedValue) return null;
                                
                                return (
                                  <div key={fieldKey} className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                      {formatFieldLabel(fieldKey)}
                                    </p>
                                    <div className="text-sm">
                                      {renderedValue}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
                )}

                {/* Reviews Section - Hidden for Guests */}
                {!isGuestView && (
                <div className="pt-10 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Reviews & Ratings</h3>
                    <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                      <Star className="text-amber-500 fill-amber-500" size={18} />
                      <span className="font-black text-amber-700">4.8</span>
                      <span className="text-xs font-bold text-amber-600/60 uppercase tracking-widest">(24 Reviews)</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {reviews.map((review, i) => (
                      <div key={i} className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100/50">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-primary">
                                {review.name[0]}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{review.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{review.date}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex text-amber-500">
                                {[...Array(5)].map((_, starIdx) => (
                                  <Star 
                                    key={starIdx} 
                                    size={14} 
                                    className={starIdx < review.rating ? "fill-current" : "text-gray-200"} 
                                  />
                                ))}
                              </div>
                              {reviewToDelete === review.id ? (
                                <div className="flex items-center gap-2 bg-red-50 p-1 rounded-xl border border-red-100 animate-in fade-in slide-in-from-right-2">
                                  <span className="text-[10px] font-black text-red-600 uppercase px-2">Delete?</span>
                                  <button 
                                    onClick={() => handleDeleteReview(review.id)}
                                    className="px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded-lg hover:bg-red-600 transition-all uppercase"
                                  >
                                    Yes
                                  </button>
                                  <button 
                                    onClick={() => setReviewToDelete(null)}
                                    className="px-3 py-1 bg-white text-gray-500 text-[10px] font-black rounded-lg hover:bg-gray-100 transition-all uppercase border border-gray-100"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setReviewToDelete(review.id)}
                                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                  title="Delete Review"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 font-medium leading-relaxed italic">&ldquo;{review.comment}&rdquo;</p>
                      </div>
                    ))}
                    
                    {showReviewForm ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 bg-primary/5 rounded-[2.5rem] border-2 border-primary/10 shadow-inner"
                      >
                        <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                          <Paintbrush className="text-primary" size={20} />
                          Share your experience
                        </h4>
                        
                        <div className="space-y-6">
                          <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Your Rating</label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setNewReview({ ...newReview, rating: star })}
                                  className={`p-2 rounded-xl transition-all ${
                                    star <= newReview.rating ? 'bg-amber-500 text-white' : 'bg-white text-gray-300'
                                  }`}
                                >
                                  <Star size={20} className={star <= newReview.rating ? "fill-current" : ""} />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Comment</label>
                            <textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              className="w-full p-5 bg-white border border-gray-100 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-700"
                              rows={3}
                              placeholder="Describe your visit..."
                            />
                          </div>
                          
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={handleAddReview}
                              disabled={!newReview.comment.trim()}
                              className="flex-1 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
                            >
                              Post Review
                            </button>
                            <button
                              onClick={() => setShowReviewForm(false)}
                              className="px-8 py-4 bg-white text-gray-500 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <button 
                        onClick={() => setShowReviewForm(true)}
                        className="w-full py-5 bg-white border-2 border-dashed border-gray-200 rounded-[2rem] text-gray-400 font-black text-sm uppercase tracking-widest hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-3 group"
                      >
                        <Paintbrush size={18} className="group-hover:rotate-12 transition-transform" />
                        Write a review
                      </button>
                    )}
                  </div>
                </div>
                )}
                
                {/* Guest Login Prompt Banner */}
                {isGuestView && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Lock className="text-primary" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">Sign in to view complete details</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Get access to full property information, owner contact details, save favorites, and schedule visits.
                        </p>
                        <div className="flex gap-3">
                          <button 
                            onClick={openLoginForPropertyDetails}
                            className="px-6 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all"
                          >
                            Sign In / Sign Up
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar - Conditional for Guest vs Authenticated */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card - Visible to All Users */}
              <motion.div 
                className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-2xl shadow-gray-200/50 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <h3 className="text-xl font-black text-gray-900 mb-6 relative">Contact Details</h3>
                
                <div className="relative group mb-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-[1.25rem] flex items-center justify-center text-white text-2xl font-black shadow-lg">
                        {property.owner?.name?.charAt(0) || 'O'}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-lg leading-tight">{property.owner?.name || 'Owner'}</h4>
                        <p className="text-xs font-black text-primary uppercase tracking-widest mt-1 italic flex items-center gap-1">
                          <Award size={12} /> Verified Owner
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Phone size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                        {/* Phone: +91 shown clear, rest blurred like barcode */}
                        <div className="flex items-center gap-1 mt-1">
                          <span className="font-black text-lg text-gray-900">+91</span>
                          <span 
                            className="font-black text-lg blur-[5px] select-none pointer-events-none text-gray-900 tracking-wider"
                            title="Contact details are hidden for privacy"
                          >
                            {(property.owner?.phone || '+91 9876543210').replace('+91', '').trim()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleEnquiry}
                    className="w-full py-5 bg-cta text-white font-black text-lg rounded-[1.25rem] hover:bg-cta-hover transition-all shadow-xl shadow-cta/20 hover:shadow-2xl hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-3 group"
                  >
                    <MessageSquare className="group-hover:rotate-12 transition-transform" size={24} />
                    Enquiry Now
                  </button>
                  <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    Usually responds within ~2 hours
                  </p>
                </div>
              </motion.div>

              {/* Calculators - Premium Segmented Action Bar (Visible to all, login-gated) */}
              <div className="mt-4 mb-2">
                <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-1.5 shadow-sm">
                  {/* EMI Calculator Button */}
                  <div
                    onClick={() => {
                      if (!isLoggedIn) {
                        openLoginForPropertyDetails();
                        return;
                      }
                      setShowEMI(true);
                    }}
                    className="group flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-300 text-gray-700 hover:text-red-600 hover:bg-red-50 hover:scale-[1.03] hover:shadow-sm active:scale-[0.96]"
                  >
                    <svg className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="flex flex-col leading-tight">
                      <span>EMI Calculator</span>
                      <small className="text-[11px] text-gray-400 font-medium">Monthly estimate</small>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-6 bg-gray-200" />

                  {/* Rental Yield Button */}
                  <div
                    onClick={() => {
                      if (!isLoggedIn) {
                        openLoginForPropertyDetails();
                        return;
                      }
                      setShowRental(true);
                    }}
                    className="group flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-300 text-gray-700 hover:text-red-600 hover:bg-red-50 hover:scale-[1.03] hover:shadow-sm active:scale-[0.96]"
                  >
                    <svg className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <div className="flex flex-col leading-tight">
                      <span>Rental Yield</span>
                      <small className="text-[11px] text-gray-400 font-medium">Investment return</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Enquiry Now Section - Authenticated Only */}
      {!isGuestView && (
      <section className="bg-white border-t border-gray-100 py-10 mt-8 relative z-10">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gray-950 rounded-[2rem] p-8 md:p-10 relative overflow-hidden group shadow-xl shadow-gray-900/40"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl -mr-24 -mt-24 group-hover:bg-primary/10 transition-all duration-700" />
            
            <div className="relative z-10">
              <h2 className="text-xl md:text-2xl font-black text-white mb-2 uppercase tracking-tight">
                Interested in <span className="text-primary">this property?</span>
              </h2>
              <p className="text-gray-400 text-xs md:text-sm font-medium mb-8 leading-relaxed max-w-md mx-auto italic">
                Get more details, schedule a priority visit, or connect for pricing negotiations. Our support team is here to help.
              </p>
              
              <button
                onClick={handleEnquiry}
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-black text-lg rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 group"
              >
                <MessageSquare className="group-hover:rotate-12 transition-transform" size={20} />
                ENQUIRY NOW
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Active Response</span>
                </div>
                <div className="w-0.5 h-0.5 bg-gray-800 rounded-full" />
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Secure Enquiry</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      )}

      {/* Enquiry Modal */}
      <AnimatePresence>
        {showEnquiryForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setShowEnquiryForm(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl border border-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Direct Enquiry</h3>
                  <p className="text-sm text-gray-500 font-medium">Message will be sent to {property.owner.name}</p>
                </div>
                <button 
                  onClick={() => setShowEnquiryForm(false)} 
                  className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-2xl transition-all"
                >
                  <Maximize size={20} className="text-gray-500 rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">Your Message</label>
                  <textarea 
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-3xl outline-none font-bold text-gray-800 transition-all resize-none shadow-inner"
                    rows={4}
                    placeholder="Tell the owner why you are interested..."
                  />
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowEnquiryForm(false)}
                    className="flex-1 py-4 text-gray-500 font-black uppercase tracking-widest text-xs hover:bg-gray-50 rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      if (enquiryMessage.trim()) {
                        // Generate a HIGH INTENT lead for the CRM
                        await generateLead(property.id, user.id, {
                          listingId: property.id,
                          propertyId: property.propertyId,
                          title: property.title,
                          price: property.price,
                          location: property.location,
                          propertyType: property.propertyType,
                          bhk: property.bhk,
                          area: property.area,
                          listingType: property.listingType,
                          city: property.city,
                          state: property.state,
                          userFirstName: user.first_name,
                          userLastName: user.last_name,
                          userEmail: user.email,
                          userPhone: user.phone,
                          // High intent markers
                          priority: 'high',
                          is_hot: true,
                          score: 80,
                          notes: `ENQUIRY: ${enquiryMessage}`,
                          utm_content: 'enquiry_submission',
                          leadEvent: 'inquiry'
                        });

                        // Original enquiry logic
                        await addEnquiry(property.id, enquiryMessage);
                        setShowEnquiryForm(false);
                        setEnquiryMessage('I am interested in this property.');
                      }
                    }}
                    className="flex-1 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary/30 hover:bg-primary-dark hover:-translate-y-1"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
  {showEMI && (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowEMI(false)}
    >
      <motion.div
        className="bg-white/95 backdrop-blur-xl w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border border-white/60 overflow-hidden"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white/80 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md shadow-red-200">
              <IndianRupee size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 leading-tight">EMI Calculator</h3>
              <p className="text-xs text-gray-400 font-medium">Estimate your monthly installments</p>
            </div>
          </div>
          <button
            onClick={() => setShowEMI(false)}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-400 flex items-center justify-center transition-all duration-200 group"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          <EMICalculator />
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
      <AnimatePresence>
  {showRental && (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowRental(false)}
    >
      <motion.div
        className="bg-white/95 backdrop-blur-xl w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border border-white/60 overflow-hidden"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white/80 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-200">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 leading-tight">Rental Yield Calculator</h3>
              <p className="text-xs text-gray-400 font-medium">Analyse your return on investment</p>
            </div>
          </div>
          <button
            onClick={() => setShowRental(false)}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-400 flex items-center justify-center transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          <RentalYieldCalculator />
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </motion.div>
  );
}

export default PropertyDetails;

