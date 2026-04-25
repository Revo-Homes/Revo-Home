import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProperty } from '../contexts/PropertyContext';
import { useRevoLeadTracker } from '../hooks/useRevoLeadTracker';
import { buildStructuredMessage, splitFullName, submitPublicEnquiry } from '../services/publicEnquiry';
import reviewService from '../services/reviewService';
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
  MessageCircle,
  ChevronRight,
  ShieldCheck,
  Star,
  Award,
  Heart,
  Paintbrush,
  Trash2,
  Plus,
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
  ExternalLink,
  HelpCircle,
  Menu,
  Mail,
  User,
  Shield,
  X,
  Loader2,
  FileDown,
  Crown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
const extractIdFromSlug = (slug) => {
  if (!slug) return null;
  // Matches rpid-r1050 pattern at end of slug
  const match = slug.match(/rpid-r(\d+)$/);
  if (match) return match[1];
  // Fallback: last segment is plain number (old URLs still work)
  const parts = slug.split('-');
  const last = parts[parts.length - 1];
  return isNaN(Number(last)) ? slug : last;
};

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Independent House', 'Plot', 'Commercial'];

// ============================================
// SQUAREYARDS-STYLE DATA CONSTANTS
// ============================================

// Why Consider Section - Key Highlights
const WHY_CONSIDER_DATA = [];

// Location Benefits - Nearby Landmarks
const LOCATION_BENEFITS_DATA = [];

// Top Experts Mock Data - Backend Ready

// Avatar background colors
const AVATAR_COLORS = ["#E8F0FE", "#FCE8E6", "#E6F4EA", "#FFF4E5"];

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

// Parse nearby landmarks from backend data
const parseNearbyLandmarks = (nearbyData) => {
  if (!nearbyData || !Array.isArray(nearbyData) || nearbyData.length === 0) {
    return null; // Return null to trigger fallback
  }
  
  return nearbyData.map(item => {
    // Handle string format like "Metro Station - 0.5 km"
    if (typeof item === 'string') {
      const parts = item.split('-');
      const name = parts[0]?.trim() || item;
      const distance = parts[1]?.trim() || 'Nearby';
      return { name, distance, icon: getNearbyIcon(name) };
    }
    // Handle object format
    if (typeof item === 'object' && item !== null) {
      return {
        name: item.name || item.landmark || 'Landmark',
        distance: item.distance || item.dist || 'Nearby',
        icon: getNearbyIcon(item.name || item.landmark || '')
      };
    }
    return { name: String(item), distance: 'Nearby', icon: MapPin };
  });
};

// Get appropriate icon for nearby landmark
const getNearbyIcon = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('metro') || lower.includes('subway')) return Train;
  if (lower.includes('railway') || lower.includes('train')) return TrainFront;
  if (lower.includes('mall') || lower.includes('shopping')) return ShoppingBag;
  if (lower.includes('hospital') || lower.includes('clinic') || lower.includes('medical')) return Hospital;
  if (lower.includes('school') || lower.includes('college') || lower.includes('university')) return School;
  if (lower.includes('bus')) return Bus;
  if (lower.includes('airport')) return Plane;
  if (lower.includes('highway') || lower.includes('road')) return Navigation;
  if (lower.includes('park')) return Trees;
  if (lower.includes('temple') || lower.includes('mosque') || lower.includes('church')) return Landmark;
  if (lower.includes('bank') || lower.includes('atm')) return Building2;
  if (lower.includes('restaurant') || lower.includes('food')) return Coffee;
  return MapPin;
};

// Count nearby places by type
const countNearbyByType = (nearbyData, type) => {
  if (!nearbyData || !Array.isArray(nearbyData)) return 0;
  const lowerType = type.toLowerCase();
  return nearbyData.filter(item => {
    const name = typeof item === 'string' ? item : (item.name || item.landmark || '');
    return name.toLowerCase().includes(lowerType);
  }).length;
};

// Parse highlights from property data
const parseHighlights = (property) => {
  // Try to get highlights from various possible backend fields
  const highlights = 
    toArray(property.highlights, null) ||
    toArray(property.features, null) ||
    toArray(property.selling_points, null);
  
  if (highlights && highlights.length > 0) {
    return highlights.map((text, idx) => ({
      icon: getHighlightIcon(text, idx),
      text: typeof text === 'string' ? text : text.description || text.title || String(text)
    }));
  }
  
  return null; // Return null to trigger fallback
};

// Get icon for highlight based on text content
const getHighlightIcon = (text, idx) => {
  const lower = (text || '').toLowerCase();
  if (lower.includes('location') || lower.includes('connectivity') || lower.includes('highway') || lower.includes('metro')) return MapPin;
  if (lower.includes('green') || lower.includes('garden') || lower.includes('landscape') || lower.includes('park')) return Trees;
  if (lower.includes('security') || lower.includes('cctv') || lower.includes('guard') || lower.includes('safe')) return ShieldCheck;
  if (lower.includes('construction') || lower.includes('quality') || lower.includes('architecture') || lower.includes('modern')) return Building2;
  if (lower.includes('parking')) return Car;
  if (lower.includes('power') || lower.includes('backup') || lower.includes('electricity')) return Zap;
  if (lower.includes('amenities') || lower.includes('facility')) return Sparkles;
  if (lower.includes('school') || lower.includes('education')) return School;
  if (lower.includes('hospital') || lower.includes('medical')) return Hospital;
  if (lower.includes('mall') || lower.includes('shopping')) return ShoppingBag;
  // Rotate through default icons
  const defaults = [MapPin, Trees, ShieldCheck, Building2, Car, Zap, Sparkles, CheckCircle2];
  return defaults[idx % defaults.length];
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

const formatShortPrice = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Price on request';
  if (amount >= 10000000) return `Rs ${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `Rs ${(amount / 100000).toFixed(2)} L`;
  return `Rs ${amount.toLocaleString('en-IN')}`;
};

const buildPriceConfigurations = (property) => {
  const unitSources = toArray(
    property?.unitConfigurations || property?.units || property?.pricing || property?.price_configurations,
    []
  );

  const normalizedUnits = unitSources
    .map((unit, index) => {
      if (typeof unit !== 'object' || unit === null) return null;
      const bhk = unit.bhk || unit.configuration || unit.unit_type || property?.bhk || 'N/A';
      const areaMin = unit.area_min || unit.areaMin || unit.carpet_area || unit.area || property?.area;
      const areaMax = unit.area_max || unit.areaMax || unit.super_builtup_area || areaMin;
      const priceMin = unit.price_min || unit.priceMin || unit.price || property?.price_min || property?.price;
      const priceMax = unit.price_max || unit.priceMax || unit.price || property?.price_max || property?.price;

      return {
        id: unit.id || `${bhk}-${index}`,
        bhk: String(bhk).replace(/[^0-9A-Za-z.+ -]/g, '').trim() || 'N/A',
        area: areaMin && areaMax && String(areaMin) !== String(areaMax) ? `${areaMin}-${areaMax}` : `${areaMin || areaMax || 'N/A'}`,
        priceLabel: priceMin && priceMax && Number(priceMin) !== Number(priceMax)
          ? `${formatShortPrice(priceMin)} - ${formatShortPrice(priceMax)}`
          : formatShortPrice(priceMin || priceMax),
      };
    })
    .filter(Boolean);

  if (normalizedUnits.length > 0) return normalizedUnits;

  return [{
    id: property?.id || 'current-property',
    bhk: property?.bhk || 'N/A',
    area: property?.area ? `${property.area}` : 'N/A',
    priceLabel: formatShortPrice(property?.price || property?.price_min || property?.price_max),
  }];
};

const normalizeBhkLabel = (value) => {
  if (!value && value !== 0) return 'N/A';
  const text = String(value).trim();
  if (!text) return 'N/A';
  return /bhk/i.test(text) ? text : `${text} BHK`;
};

const formatCompactCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return `₹${amount.toLocaleString('en-IN')}`;
};

const formatDateLabel = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
};

const buildSimilarProperties = (allListings, currentProperty) => {
  if (!Array.isArray(allListings) || !currentProperty) return [];

  return allListings
    .filter((item) => item?.id !== currentProperty?.id)
    .filter((item) => {
      const sameCity = item?.city && currentProperty?.city && item.city === currentProperty.city;
      const sameType = item?.propertyType && currentProperty?.propertyType && item.propertyType === currentProperty.propertyType;
      return sameCity || sameType;
    })
    .slice(0, 3);
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

// ============================================
// SQUAREYARDS-STYLE HELPER COMPONENTS
// ============================================

const SectionCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg shadow-gray-200/20 border border-gray-100/50 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title, action }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
      {Icon && <Icon className="text-primary" size={20} />}
      {title}
    </h3>
    {action && <div>{action}</div>}
  </div>
);

const InfoBadge = ({ icon: Icon, label, value, highlight = false }) => (
  <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${highlight ? 'bg-primary/5 border border-primary/10' : 'bg-gray-50'}`}>
    {Icon && <Icon size={16} className={highlight ? 'text-primary' : 'text-gray-500'} />}
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-primary' : 'text-gray-900'}`}>{value}</p>
    </div>
  </div>
);

const HighlightCard = ({ icon: Icon, text }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon size={16} className="text-primary" />
    </div>
    <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
  </div>
);

const LocationBenefitItem = ({ name, distance, icon: Icon }) => (
  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-primary/20 hover:shadow-sm transition-all">
    <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center">
      <Icon size={18} className="text-primary" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-gray-900">{name}</p>
      <p className="text-xs text-primary font-medium">{distance}</p>
    </div>
  </div>
);

const PriceConfigRow = ({ bhk, area, price, unit, isHighlighted = false }) => (
  <div className={`flex items-center justify-between p-4 rounded-lg border ${isHighlighted ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-gray-200'} transition-all cursor-pointer`}>
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isHighlighted ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}>
        <BedDouble size={20} />
      </div>
      <div>
        <p className="font-bold text-gray-900">{bhk} BHK</p>
        <p className="text-sm text-gray-500">{area} sq.ft</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-bold text-primary text-lg">₹{price} {unit}</p>
      <p className="text-xs text-gray-500">Onwards</p>
    </div>
  </div>
);

const UpdateItem = ({ date, text }) => (
  <div className="flex gap-4 pb-4 border-l-2 border-primary/20 pl-4 last:border-0 last:pb-0 relative">
    <div className="absolute -left-[5px] top-1 w-2 h-2 bg-primary rounded-full" />
    <div>
      <p className="text-xs font-semibold text-primary mb-1">{date}</p>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  </div>
);

const SimilarPropertyCard = ({ property }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/properties/${property.id}`)}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="relative h-40 overflow-hidden">
        <img src={property.image} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-semibold text-gray-900">
          {property.bhk} BHK
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{property.title}</h4>
        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <MapPin size={12} /> {property.location}
        </p>
        <div className="flex items-center justify-between">
          <p className="font-bold text-primary">{property.price}</p>
          <p className="text-xs text-gray-500">{property.area} sq.ft</p>
        </div>
      </div>
    </div>
  );
};


// Sticky Navigation Items
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'floor-plans', label: 'Floor Plans' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'location', label: 'Location' },
  { id: 'agents', label: 'Agents' },
  { id: 'price-trends', label: 'Price Trends' },
  { id: 'reviews', label: 'Reviews' },
];

// Agents Carousel Component - Separate to avoid hooks order issues
function AgentsCarousel({ property, handleAgentContact }) {
  const scrollRef = useRef(null);
  const agents = property?.agents || property?.assigned_agents || [];
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="relative">
      {/* Navigation Arrows */}
      {agents.length > 2 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-300 group"
          >
            <ChevronRight size={20} className="text-gray-600 rotate-180 group-hover:text-primary transition-colors" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-300 group"
          >
            <ChevronRight size={20} className="text-gray-600 group-hover:text-primary transition-colors" />
          </button>
        </>
      )}
      
      {/* Horizontal scroll container */}
      <div 
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide scroll-smooth" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {agents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No agents assigned to this property yet.
          </div>
        ) : (
          agents.map((agent, idx) => {
            const initial = agent.name?.charAt(0).toUpperCase() || 'A';
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            
            return (
              <motion.div
                key={agent.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex-shrink-0 w-[280px] bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow snap-start"
              >
                {/* Avatar & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {initial}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{agent.name || 'Agent'}</h4>
                    <p className="text-xs text-gray-500">{agent.role || 'Real Estate Agent'}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Briefcase size={14} className="text-gray-400" />
                    <span className="text-gray-600">{agent.experience || '5+'} yrs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 size={14} className="text-gray-400" />
                    <span className="text-gray-600">{agent.deals || '50+'} deals</span>
                  </div>
                </div>

                {/* Contact Button */}
                <button
                  onClick={() => handleAgentContact(agent)}
                  className="w-full py-2.5 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary hover:text-white transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Phone size={14} />
                  Contact Agent
                </button>
              </motion.div>
            );
          })
        )}
      </div>
      
      {/* Scroll indicator dots */}
      {agents.length > 2 && (
        <div className="flex justify-center gap-2 mt-4">
          {agents.map((_, idx) => (
            <motion.div 
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="w-2 h-2 rounded-full bg-primary/30"
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// CONTACT SIDE PANEL COMPONENT
// ============================================

function ContactSidePanel({ property, isLoggedIn, isSubscribed, user, onUpgrade, onShowPayment, onToggleFavorite, saved, isGuestView, openLoginForPropertyDetails }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { addEnquiry } = useProperty();
  const { generateLead } = useRevoLeadTracker();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
        email: user?.email || '',
        phone: user?.phone || '',
        message: `I am interested in ${property?.title || 'this property'}. Please contact me with more details.`
      });
      setErrors({});
    }
  }, [isOpen, user, property]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await addEnquiry({
        propertyId: property?.id,
        propertyTitle: property?.title,
        userId: user?.id,
        ...formData,
        timestamp: new Date().toISOString(),
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Enquiry submission error:', error);
      alert(error?.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg shadow-gray-200/20 border border-gray-100/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-semibold text-primary">
              {property?.owner?.name?.[0] || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">
              {property?.owner?.name || 'Property Agent'}
            </h4>
            <p className="text-xs text-gray-500">Verified Agent</p>
          </div>
          <FavoriteButton saved={saved} onClick={onToggleFavorite} />
        </div>
      </div>

      {/* Contact Form or CTA */}
      <div className="p-4 sm:p-5">
        {isLoggedIn ? (
          <div className="space-y-3">
            <button
              onClick={() => setIsOpen(true)}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              Get a Call Back
            </button>
            <button
              onClick={() => window.open(`tel:${property?.owner?.phone || '+1234567890'}`)}
              className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              Call Agent
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={openLoginForPropertyDetails}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all"
            >
              Login to Contact Agent
            </button>
            <p className="text-xs text-center text-gray-500">
              Login to view agent details and contact information
            </p>
          </div>
        )}
      </div>

      {/* Enquiry Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Send Enquiry</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg"
                  placeholder="Your name"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg"
                  placeholder="Your phone number"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg"
                  placeholder="Your email (optional)"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg"
                  rows={3}
                  placeholder="Your message"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN PROPERTY DETAILS COMPONENT
// ============================================

function PropertyDetails() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const listingIdentifier = extractIdFromSlug(slug);
  const { isLoggedIn, isSubscribed, openLoginForPropertyDetails, user } = useAuth();
  const { getProperty, addEnquiry, isSaved, toggleFavorite, listings = [] } = useProperty();
  const { generateLead } = useRevoLeadTracker();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [showEMI, setShowEMI] = useState(false);
  const [showRental, setShowRental] = useState(false);
  
  // Dynamic Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    average_rating: 0,
    total_reviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', title: '' });
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [enquirySent, setEnquirySent] = useState(false);
  
  // Document Download Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [hasPaidForDocuments, setHasPaidForDocuments] = useState(false);
  
  // SquareYards-style UI States
  const [activeTab, setActiveTab] = useState('overview');
  const [activeBhkTab, setActiveBhkTab] = useState('all');
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const saved = isSaved(property?.propertyId || property?.id || listingIdentifier);
  
  // Guest view mode - no login required to view limited preview
  const isGuestView = !isLoggedIn;
  const priceConfigurations = buildPriceConfigurations(property);
  const similarProperties = buildSimilarProperties(listings, property);

  // Get property ID for reviews (propertyId from property data, not listing ID)
  const propertyIdForReviews = property?.propertyId || property?.property_id || property?.id || listingIdentifier;

  // Handle agent contact
  const handleAgentContact = (agent) => {
    console.log("Contact agent:", agent);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="space-y-4">
          <div className="bg-gray-200 rounded-lg h-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-200 p-4 rounded-lg h-32"></div>
            <div className="bg-gray-200 p-4 rounded-lg h-32"></div>
            <div className="bg-gray-200 p-4 rounded-lg h-32"></div>
          </div>
          <div className="bg-gray-200 rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
              {property?.title || 'Property Details'}
            </h1>
            <FavoriteButton saved={saved} onClick={handleToggleFavorite} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="relative h-96">
                <img
                  src={property?.image || 'https://via.placeholder.com/800x600'}
                  alt={property?.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Overview Section */}
            <section id="overview" className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-600 leading-relaxed">
                {property?.description || 'No description available'}
              </p>
            </section>

            {/* Agents Section */}
            <section id="agents" className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {property?.city ? `Agents in ${property.city}` : 'Property Agents'}
              </h2>
              <AgentsCarousel property={property} handleAgentContact={handleAgentContact} />
            </section>

            {/* Reviews Section */}
            <section id="reviews" className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
              <p className="text-gray-500">Reviews section placeholder</p>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <div className="sticky top-20 sm:top-24 space-y-4 sm:space-y-6">
              <ContactSidePanel
                property={property}
                isLoggedIn={isLoggedIn}
                user={user}
                onEnquiryClick={() => setShowEnquiryForm(true)}
                onCallbackClick={() => {
                  if (!isLoggedIn) {
                    openLoginForPropertyDetails();
                    return;
                  }
                  alert('Callback request submitted! We will contact you shortly.');
                }}
                onBrochureClick={() => {
                  if (!isLoggedIn) {
                    openLoginForPropertyDetails();
                    return;
                  }
                  setShowPaymentModal(true);
                }}
                onLoginClick={openLoginForPropertyDetails}
              />

              {/* Calculators */}
              <div className="space-y-2">
                <div
                  onClick={() => setShowEMI(true)}
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
                  onClick={() => setShowRental(true)}
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

      
      {/* CTA Section - Authenticated Only */}
      {!isGuestView && (
        <section className="bg-gray-50 border-t border-gray-200 mt-12">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Top bar with status */}
              <div className="bg-green-50 border-b border-green-100 px-6 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-700 text-sm font-medium">Owner is actively responding</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><ShieldCheck size={12} /> Secure</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> 2h response</span>
                </div>
              </div>
              
              <div className="p-8 sm:p-10">
                <div className="flex flex-col lg:flex-row items-start gap-8">
                  {/* Left content */}
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                      Interested in this property?
                    </h2>
                    <p className="text-gray-600 mb-6 max-w-xl">
                      Get in touch with the owner to schedule a visit or get more information about this premium property
                    </p>
                    
                    {/* Contact buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setShowEnquiryForm(true)}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                      >
                        <MessageSquare size={18} />
                        Send Enquiry
                      </button>
                      <button
                        onClick={() => property.owner?.phone && window.open(`tel:${property.owner.phone}`)}
                        disabled={!property.owner?.phone}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-primary hover:text-primary transition-all"
                      >
                        <Phone size={18} />
                        {property.owner?.phone ? 'Call Owner' : 'Phone Not Available'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Right - Download Documents */}
                  <div className="lg:w-auto w-full">
                    <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                          <Download size={20} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Property Documents</h3>
                          <p className="text-sm text-gray-500 mb-3">Download complete property details, legal documents & more</p>
                          <button
                            onClick={handleDownloadDocuments}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                          >
                            <IndianRupee size={14} />
                            49 - Download Documents
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* New Enquiry Modal with OTP & CAPTCHA */}
      <EnquiryModal
        isOpen={showEnquiryForm}
        onClose={() => setShowEnquiryForm(false)}
        property={property}
        user={user}
        isLoggedIn={isLoggedIn}
        onLoginClick={openLoginForPropertyDetails}
        onSubmit={async (leadData) => {
          try {
            const { firstName, lastName } = splitFullName(leadData.name);
            const enquiryMessage = buildStructuredMessage(
              `Property enquiry for ${property.title || 'listing'}`,
              {
                'Listing Type': property.listingType,
                'Property Type': property.propertyType,
                'Location': property.location,
              },
              leadData.message
            );

            await generateLead(property.id, user?.id || null, {
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
              userFirstName: firstName,
              userLastName: lastName,
              userEmail: leadData.email,
              userPhone: leadData.phone,
              priority: 'high',
              is_hot: true,
              score: 85,
              notes: enquiryMessage,
              utm_content: 'enquiry_submission',
              leadEvent: 'inquiry',
              timestamp: leadData.timestamp
            });

            await submitPublicEnquiry({
              name: leadData.name,
              email: leadData.email,
              phone: leadData.phone,
              subject: `Property enquiry: ${property.title || 'Listing'}`,
              message: enquiryMessage,
              enquiryType: 'property_inquiry',
              preferredLocation: property.location,
              preferredPropertyTypes: property.propertyType,
              propertyId: property.propertyId,
              listingId: property.id,
              sourcePage: window.location.pathname,
            });

            try {
              await addEnquiry(property.id, enquiryMessage);
            } catch (enquiryError) {
              console.log('Listing enquiry API skipped or failed:', enquiryError);
            }

            return Promise.resolve();
          } catch (error) {
            console.error('Lead submission error:', error);
            return Promise.reject(error);
          }
        }}
      />

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

      {/* Payment Modal for Document Download */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !paymentLoading && setShowPaymentModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-primary px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Download size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Download Documents</h3>
                      <p className="text-white/80 text-xs">Complete property information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => !paymentLoading && setShowPaymentModal(false)}
                    className="text-white/80 hover:text-white transition-colors"
                    disabled={paymentLoading}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <FileText size={28} className="text-primary" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Property Document Package</h4>
                  <p className="text-gray-500 text-sm">
                    Get complete property details including legal documents, floor plans, and specifications
                  </p>
                </div>
                
                {/* What's Included */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">What's included:</h5>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      Complete property details
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      Legal documents & clearances
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      Floor plans & layout
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      Amenities & specifications
                    </li>
                  </ul>
                </div>
                
                {/* Price */}
                <div className="flex items-center justify-between bg-primary/10 rounded-xl p-4 mb-6">
                  <div>
                    <span className="text-gray-600 text-sm">One-time payment</span>
                    <p className="text-xs text-gray-500 mt-0.5">Instant download after payment</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">₹49</span>
                    <span className="text-gray-400 line-through text-sm ml-2">₹99</span>
                  </div>
                </div>
                
                {/* Pay Button */}
                <button
                  onClick={initiatePayment}
                  disabled={paymentLoading}
                  className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {paymentLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <IndianRupee size={18} />
                      Pay ₹49 & Download
                    </>
                  )}
                </button>
                
                <p className="text-center text-xs text-gray-400 mt-4">
                  Secure payment powered by Razorpay
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
   
  );
}

export default PropertyDetails;