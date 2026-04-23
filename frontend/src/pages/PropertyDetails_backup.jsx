import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
  ChevronUp,
  Waves,
  Dumbbell,
  Trees,
  Gamepad2,
  Activity,
  Users,
  Video,
  Siren,
  Utensils,
  Zap,
  Droplets,
  ArrowUpCircle,
  Dog,
  Wifi,
  Calendar,
  FileText,
  Check,
  Train,
  Bus,
  School,
  Hospital,
  ShoppingBag,
  TrendingUp,
  Clock,
  Info,
  Download,
  Share2,
  Navigation,
  Landmark,
  Briefcase,
  Coffee,
  Plane,
  TrainFront,
  Flame,
  MoreHorizontal,
  FileCheck,
  TrendingDown,
  BarChart3,
  ExternalLink,
  HelpCircle,
  Copy,
  CheckCheck,
  Menu
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Independent House', 'Plot', 'Commercial'];

// ============================================
// SQUAREYARDS-STYLE DATA CONSTANTS
// ============================================

// Why Consider Section - Key Highlights
const WHY_CONSIDER_DATA = [
  { icon: MapPin, text: 'Prime location with excellent connectivity to highways and metro' },
  { icon: Trees, text: 'Green surroundings with landscaped gardens and open spaces' },
  { icon: ShieldCheck, text: '24x7 security with CCTV surveillance and video door phones' },
  { icon: Building2, text: 'Premium construction quality with modern architecture' },
  { icon: Car, text: 'Ample parking space with dedicated visitor parking' },
  { icon: Zap, text: 'Power backup for common areas and apartments' },
];

// Location Benefits - Nearby Landmarks
const LOCATION_BENEFITS_DATA = [
  { name: 'Metro Station', distance: '0.5 km', icon: Train },
  { name: 'Railway Station', distance: '3.2 km', icon: TrainFront },
  { name: 'Shopping Mall', distance: '1.2 km', icon: ShoppingBag },
  { name: 'Hospital', distance: '2.1 km', icon: Hospital },
  { name: 'School', distance: '1.8 km', icon: School },
  { name: 'Bus Stop', distance: '0.3 km', icon: Bus },
  { name: 'Airport', distance: '12 km', icon: Plane },
  { name: 'Highway', distance: '2.5 km', icon: Navigation },
];

// Price Configuration Data (Hardcoded fallback)
const PRICE_CONFIG_DATA = [
  { bhk: '1', area: '450-550', price: '45-55', unit: 'L' },
  { bhk: '2', area: '850-1050', price: '85-105', unit: 'L' },
  { bhk: '3', area: '1200-1500', price: '1.2-1.5', unit: 'Cr' },
  { bhk: '4', area: '1800-2200', price: '1.8-2.5', unit: 'Cr' },
];

// Recent Updates Data
const RECENT_UPDATES_DATA = [
  { date: 'Dec 2025', text: 'Structural works reach 65% completion' },
  { date: 'Nov 2025', text: 'Tower B construction completed up to 15th floor' },
  { date: 'Oct 2025', text: 'RERA approval received for Phase 2' },
  { date: 'Sep 2025', text: 'Sample flat inaugurated for site visits' },
];

// Price Trend Data for Chart
const PRICE_TREND_DATA = [
  { month: 'Jan', price: 18500, trend: 18200 },
  { month: 'Feb', price: 18800, trend: 18500 },
  { month: 'Mar', price: 19200, trend: 18900 },
  { month: 'Apr', price: 19500, trend: 19200 },
  { month: 'May', price: 19800, trend: 19500 },
  { month: 'Jun', price: 20200, trend: 19900 },
  { month: 'Jul', price: 20500, trend: 20200 },
  { month: 'Aug', price: 20800, trend: 20500 },
  { month: 'Sep', price: 21200, trend: 20900 },
  { month: 'Oct', price: 21500, trend: 21200 },
  { month: 'Nov', price: 21800, trend: 21500 },
  { month: 'Dec', price: 22200, trend: 21900 },
];

// Similar Properties Data
const SIMILAR_PROPERTIES_DATA = [
  { id: 1051, title: 'Luxury 3BHK in Prime Location', location: 'Koramangala, Bangalore', price: '1.85 Cr', bhk: '3', area: '1650', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400' },
  { id: 1052, title: 'Spacious 2BHK with Garden View', location: 'HSR Layout, Bangalore', price: '95 L', bhk: '2', area: '1200', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400' },
  { id: 1053, title: 'Premium 4BHK Penthouse', location: 'Indiranagar, Bangalore', price: '3.2 Cr', bhk: '4', area: '2800', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400' },
];

// RERA Details
const RERA_DETAILS_DATA = {
  number: 'PRM/KA/RERA/1251/446/PR/190924/002836',
  url: 'https://rera.karnataka.gov.in',
  validity: '31-Dec-2028',
  promoter: 'Revo Realty Pvt Ltd',
};

// Map backend amenity names to display format
const mapAmenityName = (amenityName) => {
  const name = amenityName.toLowerCase();
  
  // Convert snake_case to Title Case
  if (name.includes('security_24x7')) return '24x7 Security';
  if (name.includes('power_backup')) return 'Power Backup';
  if (name.includes('elevator') || name.includes('lift')) return 'Elevator/Lift';
  if (name.includes('parking')) return 'Parking';
  if (name.includes('gym')) return 'Gym';
  if (name.includes('swimming_pool')) return 'Swimming Pool';
  if (name.includes('garden')) return 'Garden';
  if (name.includes('kids_play_area')) return 'Kids Play Area';
  if (name.includes('community_hall')) return 'Community Hall';
  if (name.includes('cctv')) return 'CCTV Surveillance';
  if (name.includes('fire_alarm')) return 'Fire Alarm';
  if (name.includes('wifi')) return 'WiFi';
  if (name.includes('pet_friendly')) return 'Pet Friendly';
  
  // Default: convert underscores to spaces and capitalize
  return amenityName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Amenity icon mapping - comprehensive mapping from backend amenity names to icons
const getAmenityIcon = (amenityName) => {
  const name = amenityName.toLowerCase();
  
  // Swimming related
  if (name.includes('swimming') || name.includes('pool')) return Waves;
  
  // Fitness related
  if (name.includes('gym') || name.includes('fitness') || name.includes('dumbbell')) return Dumbbell;
  
  // Outdoor/Garden related
  if (name.includes('garden') || name.includes('park') || name.includes('trees')) return Trees;
  
  // Kids/Play related
  if (name.includes('kids') || name.includes('play') || name.includes('game')) return Gamepad2;
  
  // Sports related
  if (name.includes('basketball') || name.includes('tennis') || name.includes('badminton') || 
      name.includes('jogging') || name.includes('sport') || name.includes('court')) return Activity;
  
  // Community related
  if (name.includes('community') || name.includes('hall') || name.includes('club') || name.includes('party')) return Users;
  
  // Food related
  if (name.includes('restaurant') || name.includes('cafeteria') || name.includes('food') || name.includes('utensils')) return Utensils;
  
  // Security related
  if (name.includes('security') || name.includes('guard') || name.includes('cctv') || name.includes('surveillance')) return ShieldCheck;
  if (name.includes('video') || name.includes('camera')) return Video;
  if (name.includes('siren') || name.includes('alarm') || name.includes('fire')) return Siren;
  if (name.includes('gate') || name.includes('access') || name.includes('lock')) return Lock;
  
  // Utilities related
  if (name.includes('water') || name.includes('droplet')) return Droplets;
  if (name.includes('power') || name.includes('electricity') || name.includes('backup') || name.includes('zap')) return Zap;
  if (name.includes('elevator') || name.includes('lift') || name.includes('up')) return ArrowUpCircle;
  if (name.includes('parking') || name.includes('car') || name.includes('vehicle')) return Car;
  if (name.includes('wifi') || name.includes('internet') || name.includes('network')) return Wifi;
  if (name.includes('pet') || name.includes('dog') || name.includes('animal')) return Dog;
  
  // Building/Property related
  if (name.includes('building') || name.includes('commercial') || name.includes('office')) return Building2;
  
  // Default icon
  return Sparkles;
};

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
  // Extended data for SquareYards-style sections
  developer: 'Revo Developers',
  projectName: 'Revo Meridian Heights',
  totalArea: '5.2 Acres',
  totalUnits: '240',
  totalTowers: '4',
  totalFloors: 'G+24',
  possessionDate: 'Dec 2024',
  launchDate: 'Jan 2022',
  pricePerSqft: '22,200',
  priceTrend: '+5.8%',
  rentalYield: '3.2%',
};

// Sticky Navigation Items
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'why-consider', label: 'Why Consider' },
  { id: 'floor-plans', label: 'Floor Plans' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'location', label: 'Location' },
  { id: 'price-trends', label: 'Price Trends' },
  { id: 'reviews', label: 'Reviews' },
];

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
  
  // SquareYards-style UI States
  const [activeTab, setActiveTab] = useState('overview');
  const [activeBhkTab, setActiveBhkTab] = useState('all');
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [copiedRera, setCopiedRera] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

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
      className="bg-gradient-to-br from-gray-50 via-white to-gray-50/30 min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 lg:mb-8">
          <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/')}>Home</span>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/properties')}>Properties</span>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-900 font-medium truncate max-w-xs sm:max-w-none">{property?.title || 'Property Details'}</span>
        </div>

        {/* Premium HERO SECTION - Immersive Image with Gallery */}
        <div className="mb-6 lg:mb-8 relative">
          {/* Overlay Badges */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
            <span className="px-3 py-1.5 bg-white/95 backdrop-blur-lg text-gray-900 rounded-full text-xs font-semibold uppercase tracking-wide shadow-lg border border-white/50">
              {property.propertyType}
            </span>
            <span className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-xs font-semibold uppercase tracking-wide shadow-lg flex items-center gap-1">
              <Star size={10} className="fill-current" />
              Featured
            </span>
          </div>

          {isGuestView ? (
            <div className="relative h-[280px] sm:h-[360px] lg:h-[420px] rounded-2xl overflow-hidden shadow-xl shadow-black/10">
              <img 
                src={property.images?.[0] || property.image || MOCK_PROPERTY_EXTENDED.images[0]} 
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              {/* Thumbnail Gallery Preview */}
              <div className="absolute bottom-3 left-3 right-3 flex gap-1.5">
                {property.images?.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shadow-md border-2 border-white/50">
                    <img src={img} alt={`Property ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-black/60 flex items-center justify-center border-2 border-white/50">
                  <span className="text-white text-xs font-semibold">+{Math.max(0, (property.images?.length || 0) - 4)}</span>
                </div>
              </div>
              
              <div className="absolute bottom-20 sm:bottom-24 left-3 right-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-primary/90" />
                  <p className="text-white/95 text-sm">
                    Sign in to see all {property.images?.length || 1} photos
                  </p>
                </div>
                <button 
                  onClick={openLoginForPropertyDetails}
                  className="px-4 py-2 bg-white/95 backdrop-blur-lg text-gray-900 font-semibold rounded-lg text-sm hover:bg-white transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  Sign In
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden shadow-xl shadow-black/10">
              <ImageGallery images={property.images} title={property.title} />
            </div>
          )}

          {/* View All Photos CTA */}
          <div className="mt-4 text-center">
            <button 
              onClick={() => setShowEMI(false) || setShowRental(false) || console.log('View all photos')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:from-primary-dark hover:to-primary transition-all shadow-md hover:shadow-lg active:scale-95 text-sm"
            >
              <Eye size={16} />
              View All Photos ({property.images?.length || 1})
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <section className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg shadow-gray-200/20 border border-gray-100/50">
              {/* Property Title and Location */}
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-6 mb-6">
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600 text-base">
                    <MapPin className="text-primary flex-shrink-0" size={18} />
                    <span className="font-medium">{property.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                  <button
                    onClick={handleToggleFavorite}
                    className={`p-3 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center ${
                      saved 
                        ? 'bg-red-50 text-red-500 scale-105 shadow-red-200/50 hover:scale-110' 
                        : 'bg-gray-50 text-gray-400 hover:text-red-400 hover:bg-white hover:scale-105 shadow-gray-200/50'
                    } border border-white`}
                    title={saved ? 'Remove from saved' : 'Save property'}
                  >
                    <Heart size={22} className={saved ? 'fill-current' : ''} />
                  </button>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Price</p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                      &#8377;{property.price?.toLocaleString()}<span className="text-lg sm:text-xl font-medium text-gray-400">{property.listingType === 'rent' ? '/mo' : ''}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Highlights Row */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <BedDouble className="text-primary" size={16} />
                    <span className="text-sm font-semibold text-gray-700">{property.bhk} BHK</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <Maximize className="text-primary" size={16} />
                    <span className="text-sm font-semibold text-gray-700">{property.area} sq.ft</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <Home className="text-primary" size={16} />
                    <span className="text-sm font-semibold text-gray-700">{property.furnished}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <ShieldCheck className="text-primary" size={16} />
                    <span className="text-sm font-semibold text-gray-700">24/7 Security</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <Calendar className="text-primary" size={16} />
                    <span className="text-sm font-semibold text-gray-700">Ready to Move</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="text-primary" size={18} />
                    Description
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {isGuestView && property.description && property.description.length > 200 ? (
                      <>
                        <p className="text-gray-700 leading-relaxed text-sm mb-3">
                          {property.description.substring(0, 200)}...
                        </p>
                        <button 
                          onClick={openLoginForPropertyDetails}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-all"
                        >
                          <Lock size={14} />
                          Sign in to read more
                        </button>
                      </>
                    ) : (
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {property.description || 'No description available'}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="text-primary" size={18} />
                    Features & Amenities
                    {isGuestView && property.amenities?.length > 4 && (
                      <span className="text-xs text-gray-500 ml-1">
                        (4 of {property.amenities.length})
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(isGuestView ? property.amenities?.slice(0, 4) : property.amenities)?.map((a) => {
                      if (!a) return null;
                      const displayAmenity = mapAmenityName(a);
                      const AmenityIcon = getAmenityIcon(displayAmenity);
                      
                      return (
                        <div 
                          key={a} 
                          className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => navigate(`/properties?amenity=${encodeURIComponent(displayAmenity)}`)}
                        >
                          <AmenityIcon size={14} className="text-primary" />
                          <span className="text-sm text-gray-700">{displayAmenity}</span>
                        </div>
                      );
                    })}
                    
                    {/* Fallback amenities if no backend data */}
                    {(!property.amenities || property.amenities.length === 0) && [
                      '24x7 Security', 'Power Backup', 'Elevator', 'Parking', 'Gym', 'Swimming Pool'
                    ].map((amenity, idx) => {
                      const AmenityIcon = getAmenityIcon(amenity);
                      return (
                        <div 
                          key={idx} 
                          className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <AmenityIcon size={14} className="text-primary" />
                          <span className="text-sm text-gray-700">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {isGuestView && property.amenities?.length > 4 && (
                    <div className="mt-3">
                      <button 
                        onClick={openLoginForPropertyDetails}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-all"
                      >
                        <Lock size={14} />
                        Sign in to see all {property.amenities.length} amenities
                      </button>
                    </div>
                  )}
                </div>

                {!isGuestView && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="text-primary" size={18} />
                      Nearby
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {property.nearby.map((place) => {
                        const [name, distance] = place.includes('-') ? [place.split('-')[0].trim(), place.split('-')[1].trim()] : [place, ''];
                        return (
                          <div key={place} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-sm text-gray-700">{name}</span>
                            <span className="text-xs text-primary font-semibold">{distance}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!isGuestView && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="text-primary" size={18} />
                      Location
                    </h3>
                    <div className="relative h-[200px] w-full rounded-lg overflow-hidden border border-gray-200">
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

                
                {/* Reviews Section - Hidden for Guests */}
                {!isGuestView && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Reviews</h3>
                    <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                      <Star className="text-amber-500 fill-amber-500" size={14} />
                      <span className="font-semibold text-amber-700 text-sm">4.8</span>
                      <span className="text-xs text-amber-600">(24)</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {reviews.map((review, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center font-semibold text-primary text-sm">
                              {review.name[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                              <p className="text-xs text-gray-400">{review.date}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex text-amber-500">
                              {[...Array(5)].map((_, starIdx) => (
                                <Star 
                                  key={starIdx} 
                                  size={12} 
                                  className={starIdx < review.rating ? "fill-current" : "text-gray-200"} 
                                />
                              ))}
                            </div>
                            {reviewToDelete === review.id ? (
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                >
                                  Yes
                                </button>
                                <button 
                                  onClick={() => setReviewToDelete(null)}
                                  className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setReviewToDelete(review.id)}
                                className="p-1 text-gray-300 hover:text-red-500"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">&ldquo;{review.comment}&rdquo;</p>
                      </div>
                    ))}
                    
                    {showReviewForm ? (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Write a review</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-500 block mb-2">Rating</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setNewReview({ ...newReview, rating: star })}
                                  className={`p-1 rounded transition-all ${
                                    star <= newReview.rating ? 'text-amber-500' : 'text-gray-300'
                                  }`}
                                >
                                  <Star size={18} className={star <= newReview.rating ? "fill-current" : ""} />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-xs text-gray-500 block mb-2">Comment</label>
                            <textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                              rows={2}
                              placeholder="Your review..."
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={handleAddReview}
                              disabled={!newReview.comment.trim()}
                              className="flex-1 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-all disabled:opacity-50"
                            >
                              Post
                            </button>
                            <button
                              onClick={() => setShowReviewForm(false)}
                              className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowReviewForm(true)}
                        className="w-full py-2.5 bg-white border border-dashed border-gray-300 rounded-lg text-gray-500 text-sm font-medium hover:border-primary hover:text-primary transition-all"
                      >
                        + Write a review
                      </button>
                    )}
                  </div>
                </div>
                )}
                
                {/* Guest Login Prompt Banner */}
                {isGuestView && (
                  <div className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Lock className="text-primary" size={18} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">Sign in to view complete details</h3>
                        <p className="text-xs text-gray-600 mb-2">
                          Get access to full property information, owner contact details, save favorites.
                        </p>
                        <button 
                          onClick={openLoginForPropertyDetails}
                          className="px-4 py-1.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-all"
                        >
                          Sign In / Sign Up
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* FLOOR PLAN SECTION */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Maximize className="text-primary" size={18} />
                    Floor Plans
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                      <div className="h-24 bg-gray-100 flex items-center justify-center">
                        <Maximize className="text-gray-400" size={32} />
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-gray-900 text-sm">2 BHK</h4>
                        <p className="text-gray-600 text-xs">1200 sq.ft</p>
                        <p className="text-primary font-semibold text-sm mt-1">&#8377;45L</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                      <div className="h-24 bg-gray-100 flex items-center justify-center">
                        <Maximize className="text-gray-400" size={32} />
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-gray-900 text-sm">3 BHK</h4>
                        <p className="text-gray-600 text-xs">1500 sq.ft</p>
                        <p className="text-primary font-semibold text-sm mt-1">&#8377;65L</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PRICE BREAKUP SECTION */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <IndianRupee className="text-primary" size={18} />
                    Price Breakup
                  </h3>
                  <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Base Price</span>
                      <span className="font-semibold text-gray-900">&#8377;{property.price ? (property.price * 0.85).toLocaleString() : '42.5L'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Maintenance</span>
                      <span className="font-semibold text-gray-900">&#8377;{property.price ? (property.price * 0.05).toLocaleString() : '2.5L'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Registration</span>
                      <span className="font-semibold text-gray-900">&#8377;{property.price ? (property.price * 0.07).toLocaleString() : '3.5L'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">GST</span>
                      <span className="font-semibold text-gray-900">&#8377;{property.price ? (property.price * 0.03).toLocaleString() : '1.5L'}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-primary">&#8377;{property.price?.toLocaleString() || '50L'}</span>
                    </div>
                  </div>
                </div>

                {/* PROJECT OVERVIEW SECTION */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="text-primary" size={18} />
                    Project Overview
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
                      <Maximize className="text-primary mx-auto mb-1" size={16} />
                      <p className="text-xs text-gray-500">Area</p>
                      <p className="font-semibold text-gray-900 text-sm">5.2 Acres</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
                      <Home className="text-primary mx-auto mb-1" size={16} />
                      <p className="text-xs text-gray-500">Units</p>
                      <p className="font-semibold text-gray-900 text-sm">240</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
                      <Building2 className="text-primary mx-auto mb-1" size={16} />
                      <p className="text-xs text-gray-500">Towers</p>
                      <p className="font-semibold text-gray-900 text-sm">4</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
                      <ArrowUpCircle className="text-primary mx-auto mb-1" size={16} />
                      <p className="text-xs text-gray-500">Floors</p>
                      <p className="font-semibold text-gray-900 text-sm">G+24</p>
                    </div>
                  </div>
                  <div className="mt-2 bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-amber-600" size={16} />
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-amber-900">Possession:</p>
                        <p className="text-sm text-amber-700">Dec 2024</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar - Conditional for Guest vs Authenticated */}
          <div className="space-y-4 sm:space-y-6">
            <div className="sticky top-20 sm:top-24 space-y-4 sm:space-y-6">
              {/* Contact Card - Visible to All Users */}
              <motion.div 
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Phone className="text-primary" size={16} />
                  Contact
                </h3>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white text-lg font-semibold">
                    {property.owner?.name?.charAt(0) || 'O'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{property.owner?.name || 'Owner'}</h4>
                    <p className="text-xs text-primary flex items-center gap-1">
                      <Award size={10} /> Verified
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-4">
                  <Phone size={14} className="text-primary" />
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-900 text-sm">+91</span>
                    <span 
                      className="font-semibold text-sm blur-[3px] select-none text-gray-900"
                      title="Hidden for privacy"
                    >
                      {(property.owner?.phone || '9876543210').replace('+91', '').trim()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleEnquiry}
                    className="w-full py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-dark transition-all shadow-md flex justify-center items-center gap-2"
                  >
                    <MessageSquare size={16} />
                    Enquiry Now
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          openLoginForPropertyDetails();
                          return;
                        }
                        console.log('Request callback');
                      }}
                      className="py-2 bg-emerald-50 text-emerald-700 font-medium text-xs rounded-lg hover:bg-emerald-100 transition-all flex items-center justify-center gap-1"
                    >
                      <Phone size={14} />
                      Call Back
                    </button>
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          openLoginForPropertyDetails();
                          return;
                        }
                        console.log('Get brochure');
                      }}
                      className="py-2 bg-blue-50 text-blue-700 font-medium text-xs rounded-lg hover:bg-blue-100 transition-all flex items-center justify-center gap-1"
                    >
                      <Database size={14} />
                      Brochure
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Calculators */}
              <div className="space-y-2">
                <div
                  onClick={() => {
                    if (!isLoggedIn) {
                      openLoginForPropertyDetails();
                      return;
                    }
                    setShowEMI(true);
                  }}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">EMI Calculator</h4>
                    <p className="text-xs text-gray-500">Monthly estimate</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>

                <div
                  onClick={() => {
                    if (!isLoggedIn) {
                      openLoginForPropertyDetails();
                      return;
                    }
                    setShowRental(true);
                  }}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">Rental Yield</h4>
                    <p className="text-xs text-gray-500">Investment return</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      {/* Bottom Enquiry Now Section - Authenticated Only */}
      {!isGuestView && (
      <section className="bg-white border-t border-gray-100 py-16 mt-8 relative z-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Interested in this property?</h2>
              <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">
                Get in touch with the owner to schedule a visit or get more information about this premium property
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleEnquiry}
                className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl hover:from-primary-dark hover:to-primary transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
              >
                <MessageSquare size={20} />
                Send Enquiry
              </button>
              <button
                onClick={() => window.open(`tel:+91${property.owner?.phone || '9876543210'}`)}
                className="flex-1 sm:flex-none px-8 py-4 bg-white text-primary font-bold rounded-xl border-2 border-primary hover:bg-primary hover:text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
              >
                <Phone size={20} />
                Call Owner
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

