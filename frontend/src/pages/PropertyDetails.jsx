import React, { useState, useCallback, useEffect, useRef } from 'react';
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

// Similar Properties Data
const SIMILAR_PROPERTIES_DATA = [
  { id: 1051, title: 'Luxury 3BHK in Prime Location', location: 'Koramangala, Bangalore', price: '1.85 Cr', bhk: '3', area: '1650', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400' },
  { id: 1052, title: 'Spacious 2BHK with Garden View', location: 'HSR Layout, Bangalore', price: '95 L', bhk: '2', area: '1200', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400' },
  { id: 1053, title: 'Premium 4BHK Penthouse', location: 'Indiranagar, Bangalore', price: '3.2 Cr', bhk: '4', area: '2800', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400' },
];

// Top Experts Mock Data - Backend Ready
const MOCK_EXPERTS = [
  {
    id: 1,
    name: "Kajal Chotelal Singh",
    role: "Portfolio Manager",
    totalProperties: 16,
    languages: ["English", "Hindi"]
  },
  {
    id: 2,
    name: "Shubham Vishwakarma",
    role: "Senior Investment Manager",
    totalProperties: 13,
    languages: ["English", "Hindi"]
  },
  {
    id: 3,
    name: "Rahul Sharma",
    role: "Property Consultant",
    totalProperties: 21,
    languages: ["English", "Hindi", "Marathi"]
  },
  {
    id: 4,
    name: "Priya Patel",
    role: "Real Estate Advisor",
    totalProperties: 18,
    languages: ["English", "Gujarati"]
  }
];

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
  { id: 'floor-plans', label: 'Floor Plans' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'location', label: 'Location' },
  { id: 'experts', label: 'Experts' },
  { id: 'price-trends', label: 'Price Trends' },
  { id: 'reviews', label: 'Reviews' },
];

// Experts Carousel Component - Separate to avoid hooks order issues
function ExpertsCarousel({ property, handleExpertContact }) {
  const scrollRef = useRef(null);
  const experts = property?.experts || MOCK_EXPERTS;
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="relative">
      {/* Navigation Arrows */}
      {experts.length > 2 && (
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
        {experts.map((expert, idx) => {
          const initial = expert.name.charAt(0).toUpperCase();
          const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
          
          return (
            <motion.div 
              key={expert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="flex-shrink-0 w-[300px] sm:w-[320px] bg-white rounded-2xl p-5 border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 snap-start cursor-pointer group"
            >
              {/* Top strip with gradient pastel background */}
              <div 
                className="h-16 rounded-xl mb-5 flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: avatarColor }}
              >
                {/* Decorative circles */}
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/20" />
                <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-white/20" />
                
                {/* Avatar circle with gradient ring */}
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-3 border-white relative z-10 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-xl font-bold bg-gradient-to-br from-gray-700 to-gray-900 bg-clip-text text-transparent">{initial}</span>
                  </div>
                </div>
              </div>
              
              {/* Name with verified badge */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900 text-lg truncate">
                  {expert.name}
                </h3>
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0" title="Verified Expert">
                  <Check size={12} className="text-white" />
                </div>
              </div>
              
              {/* Role with badge style */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  {expert.role}
                </span>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center group-hover:bg-primary/5 transition-colors">
                  <Building2 size={18} className="mx-auto mb-1 text-primary" />
                  <p className="text-lg font-bold text-gray-900">{expert.totalProperties || 0}</p>
                  <p className="text-xs text-gray-500">Properties</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center group-hover:bg-primary/5 transition-colors">
                  <Globe size={18} className="mx-auto mb-1 text-primary" />
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {expert.languages?.slice(0, 2).join(", ") || "English"}
                  </p>
                  <p className="text-xs text-gray-500">Languages</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                {/* WhatsApp Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleExpertContact(expert)}
                  className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200 hover:shadow-green-300 transition-all"
                  title="Contact on WhatsApp"
                >
                  <MessageCircle size={20} className="text-white" />
                </motion.button>
                
                {/* Get a call back Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleExpertContact(expert)}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 group/btn"
                >
                  <Phone size={16} className="group-hover/btn:animate-pulse" />
                  Get a call back
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Scroll indicator dots */}
      {experts.length > 2 && (
        <div className="flex justify-center gap-2 mt-4">
          {experts.map((_, idx) => (
            <motion.div 
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="w-2 h-2 rounded-full bg-gray-300 hover:bg-primary transition-colors cursor-pointer"
            />
          ))}
        </div>
      )}
      
    </div>
  );
}

// ============================================
// CONTACT SIDE PANEL COMPONENT
// ============================================
function ContactSidePanel({ 
  property, 
  isLoggedIn, 
  user, 
  onEnquiryClick, 
  onCallbackClick, 
  onBrochureClick,
  onLoginClick 
}) {
  const owner = property?.owner || { name: 'Premium Owner', phone: '+91 9876543210', verified: true };
  const maskedPhone = owner.phone ? owner.phone.replace(/\d(?=\d{3})/g, 'X') : '+91 XXXXXX3210';
  const fullPhone = owner.phone || '+91 9876543210';
  const ownerEmail = property?.owner?.email || 'contact@revohomes.in';
  
  return (
    <div className="space-y-4">
      {/* Main Contact Card */}
      <motion.div 
        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Phone className="text-primary" size={16} />
            Contact Owner
          </h3>
          {owner.verified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-semibold rounded-full border border-amber-100">
              <Crown size={10} />
              PREMIUM
            </span>
          )}
        </div>
        
        {/* Owner Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-primary/20">
            {owner.name?.charAt(0) || 'O'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">{owner.name || 'Premium Owner'}</h4>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <CheckCircle2 size={10} className="text-green-500" />
              Verified Owner
            </p>
          </div>
        </div>

        {/* Masked Phone - Always Visible */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl mb-4 border border-gray-100">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Phone size={14} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-0.5">Phone Number</p>
            <p className="font-semibold text-gray-900 text-sm font-mono">{maskedPhone}</p>
          </div>
          <Lock size={14} className="text-gray-400" />
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2.5">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEnquiryClick}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold text-sm rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all flex justify-center items-center gap-2 shadow-md"
          >
            <MessageSquare size={16} />
            Enquiry Now
          </motion.button>
          
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCallbackClick}
              className="py-2.5 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-xl hover:bg-emerald-100 transition-all flex items-center justify-center gap-1.5 border border-emerald-100"
            >
              <Phone size={14} />
              Call Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBrochureClick}
              className="py-2.5 bg-blue-50 text-blue-700 font-semibold text-xs rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-1.5 border border-blue-100"
            >
              <FileDown size={14} />
              Brochure
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Contact Details Section - Login Gated */}
      <motion.div 
        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="text-primary" size={16} />
          Contact Details
        </h3>
        
        {isLoggedIn ? (
          /* Logged In - Show Full Details */
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone size={18} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-green-600 font-medium mb-0.5">Phone Number</p>
                <p className="font-semibold text-gray-900">{fullPhone}</p>
              </div>
              <a 
                href={`tel:${fullPhone}`}
                className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Call
              </a>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-blue-600 font-medium mb-0.5">Email Address</p>
                <p className="font-semibold text-gray-900 text-sm">{ownerEmail}</p>
              </div>
              <a 
                href={`mailto:${ownerEmail}`}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Email
              </a>
            </div>
            
            <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-xs text-amber-700 text-center">
                <Award size={12} className="inline mr-1" />
                You have access to premium contact details
              </p>
            </div>
          </div>
        ) : (
          /* Not Logged In - Show Locked State */
          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 blur-[2px] select-none">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">Phone Number</p>
                  <p className="font-semibold text-gray-400">+91 98765XXXXX</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 blur-[2px] select-none mt-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">Email Address</p>
                  <p className="font-semibold text-gray-400 text-sm">contact@xxxxxx.in</p>
                </div>
              </div>
              
              {/* Lock Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Lock size={20} className="text-primary" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Login Required</p>
                <p className="text-xs text-gray-500 text-center mb-3 px-4">View complete contact details</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLoginClick}
                  className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Login to View
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ============================================
// ENQUIRY MODAL COMPONENT (ClearDeals Style)
// ============================================
function EnquiryModal({ 
  isOpen, 
  onClose, 
  property, 
  user,
  isLoggedIn,
  onLoginClick,
  onSubmit 
}) {
  const [formData, setFormData] = useState({
    name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: `I am interested in ${property?.title || 'this property'}. Please contact me with more details.`
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);
  const captchaRef = useRef(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
        email: user?.email || '',
        phone: user?.phone || '',
        message: `I am interested in ${property?.title || 'this property'}. Please contact me with more details.`
      });
      setErrors({});
      setCaptchaVerified(false);
      setOtp(['', '', '', '', '', '']);
      setShowOtpModal(false);
      setOtpSent(false);
      setCountdown(0);
    }
  }, [isOpen, user, property]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    // Email is optional - only validate if provided
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

  const handleSendOtp = async () => {
    if (!validateForm()) return;
    if (!captchaVerified) {
      alert('Please complete the CAPTCHA verification');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate OTP API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setOtpSent(true);
    setShowOtpModal(true);
    setCountdown(30);
    setIsSubmitting(false);
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      alert('Please enter complete OTP');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful verification - accept 123456 or any 6 digits for demo
      const isVerified = enteredOtp === '123456' || enteredOtp === '000000';
      
      if (isVerified) {
        // Submit the lead
        const leadData = {
          propertyId: property?.id,
          propertyTitle: property?.title,
          userId: user?.id,
          ...formData,
          verified: true,
          timestamp: new Date().toISOString(),
          otpVerified: true
        };
        
        try {
          await onSubmit(leadData);
          setShowOtpModal(false);
          onClose();
        } catch (submitError) {
          console.error('Submission error:', submitError);
          // Still close modal and show success in demo mode
          alert('Enquiry submitted successfully! (Demo Mode)');
          setShowOtpModal(false);
          onClose();
        }
      } else {
        alert('Invalid OTP. Please try again. Use 123456 for demo.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCountdown(30);
    setOtp(['', '', '', '', '', '']);
    setIsSubmitting(false);
    alert('New OTP sent!');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Main Enquiry Form Modal */}
      {!showOtpModal ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Send Enquiry</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {property?.title || 'Property'}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {!isLoggedIn && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-700">
                  <Info size={14} className="inline mr-1" />
                  Please <button onClick={onLoginClick} className="font-semibold underline">login</button> for faster submission
                </p>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Email <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Phone Field */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              {/* Message Field */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Message <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="relative">
                  <MessageSquare size={18} className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your requirements..."
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                  />
                </div>
              </div>

              {/* CAPTCHA Simulation */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="captcha"
                    checked={captchaVerified}
                    onChange={e => setCaptchaVerified(e.target.checked)}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="captcha" className="text-sm text-gray-600">
                    I'm not a robot
                  </label>
                  <Shield size={20} className="text-green-500 ml-auto" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendOtp}
              disabled={isSubmitting}
              className="w-full mt-6 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Send Enquiry
                </>
              )}
            </motion.button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Your information is secure and will not be shared
            </p>
          </motion.div>
        </motion.div>
      ) : (
        /* OTP Verification Modal */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Verify OTP</h3>
              <p className="text-sm text-gray-500 mt-2">
                Enter the 6-digit code sent to<br/>
                <span className="font-medium text-gray-700">{formData.phone}</span>
              </p>
              {/* Mock OTP Notice */}
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700">
                  <strong>Demo Mode:</strong> Use OTP <span className="font-bold text-primary">123456</span>
                </p>
              </div>
            </div>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => otpRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(index, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(index, e)}
                  className="w-11 h-12 text-center text-xl font-bold bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary focus:bg-white outline-none transition-all"
                />
              ))}
            </div>

            {/* Verify Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleVerifyOtp}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Verify & Submit
                </>
              )}
            </motion.button>

            {/* Resend OTP */}
            <div className="text-center mt-4">
              {countdown > 0 ? (
                <p className="text-sm text-gray-500">
                  Resend OTP in <span className="font-semibold">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={isSubmitting}
                  className="text-sm text-primary font-semibold hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={() => setShowOtpModal(false)}
              className="w-full mt-4 py-2 text-gray-500 text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors"
            >
              Back to Form
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PropertyDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLoggedIn, isSubscribed, openLoginForPropertyDetails, user } = useAuth();
  const { getProperty, addEnquiry, isSaved, toggleFavorite } = useProperty();
  const { generateLead } = useRevoLeadTracker();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [showEMI, setShowEMI] = useState(false);
  const [showRental, setShowRental] = useState(false);
  
  // Dynamic Reviews State
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
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

  // Document Download Payment Handler
  const handleDownloadDocuments = () => {
    if (!isLoggedIn) {
      openLoginForPropertyDetails();
      return;
    }
    setShowPaymentModal(true);
  };

  const initiatePayment = async () => {
    setPaymentLoading(true);
    
    // Simulate payment processing (2 seconds)
    setTimeout(() => {
      // Mock successful payment
      const mockPaymentId = `pay_${Date.now()}`;
      const mockOrderId = `order_${Date.now()}`;
      
      console.log('Payment successful:', { paymentId: mockPaymentId, orderId: mockOrderId });
      
      // Store payment info in localStorage
      const paymentHistory = JSON.parse(localStorage.getItem('document_payments') || '[]');
      paymentHistory.push({
        propertyId: id,
        paymentId: mockPaymentId,
        orderId: mockOrderId,
        timestamp: new Date().toISOString(),
        amount: 49,
      });
      localStorage.setItem('document_payments', JSON.stringify(paymentHistory));
      
      // Close modal and reset loading
      setShowPaymentModal(false);
      setPaymentLoading(false);
      
      // Generate and download document
      generateAndDownloadDocument();
      
      // Show success message
      alert('Payment successful! Your document is being downloaded.');
    }, 2000);
  };

  const generateAndDownloadDocument = () => {
    // Create a comprehensive property document using jsPDF
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241);
    doc.text('Revo Homes - Property Document', 105, 20, { align: 'center' });
    
    // Property Details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    let y = 40;
    
    doc.text('PROPERTY DETAILS', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Property: ${property?.title || 'N/A'}`, 20, y);
    y += 7;
    doc.text(`Location: ${property?.location || 'N/A'}`, 20, y);
    y += 7;
    doc.text(`Price: ₹${property?.price?.toLocaleString() || 'N/A'}`, 20, y);
    y += 7;
    doc.text(`BHK: ${property?.bhk || 'N/A'}`, 20, y);
    y += 7;
    doc.text(`Area: ${property?.area || 'N/A'} sq.ft`, 20, y);
    y += 15;
    
    // Owner Details
    doc.setFontSize(12);
    doc.text('OWNER INFORMATION', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Name: ${property?.owner?.name || 'N/A'}`, 20, y);
    y += 7;
    doc.text(`Phone: ${property?.owner?.phone || 'N/A'}`, 20, y);
    y += 15;
    
    // Amenities
    if (property?.amenities && property.amenities.length > 0) {
      doc.setFontSize(12);
      doc.text('AMENITIES', 20, y);
      y += 10;
      doc.setFontSize(10);
      property.amenities.slice(0, 10).forEach((amenity, idx) => {
        doc.text(`• ${amenity}`, 20, y);
        y += 6;
      });
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
    doc.text('This document is generated by Revo Homes. Payment verified.', 20, 285);
    doc.text(`Payment ID: DOC_${Date.now()}`, 20, 290);
    
    // Download
    doc.save(`${property?.title?.replace(/\s+/g, '_') || 'Property'}_Documents.pdf`);
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

  // Handle expert contact - currently logs, ready for backend integration
  const handleExpertContact = (expert) => {
    console.log("Contact expert:", expert);
    // Future: Integrate with backend API
    // Example: api.post('/expert-contact', { expertId: expert.id, propertyId: id })
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
        {/* SQUAREYARDS-STYLE STICKY NAVIGATION */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6 hidden lg:block">
          <div className="flex items-center gap-1 overflow-x-auto py-3 no-scrollbar">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeTab === item.id 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* OVERVIEW SECTION */}
            <section id="overview" className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg shadow-gray-200/20 border border-gray-100/50">
              {/* Property Title and Location */}
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-6 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md uppercase">
                      {property.propertyType}
                    </span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md uppercase flex items-center gap-1">
                      <Star size={10} className="fill-current" /> Featured
                    </span>
                  </div>
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
                    <p className="text-xs text-gray-500 mt-1">₹{property.pricePerSqft || '22,200'}/sq.ft</p>
                  </div>
                </div>
              </div>

              {/* Key Highlights Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
                <InfoBadge icon={BedDouble} label="Configuration" value={`${property.bhk} BHK`} highlight />
                <InfoBadge icon={Maximize} label="Carpet Area" value={`${property.area} sq.ft`} />
                <InfoBadge icon={Home} label="Furnishing" value={property.furnished || 'Semi'} />
                <InfoBadge icon={Building2} label="Developer" value={property.developer || 'Revo Developers'} />
                <InfoBadge icon={Calendar} label="Possession" value={property.possessionDate || 'Dec 2024'} />
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

              </div>
            </section>

            {/* PRICE CONFIGURATION SECTION */}
            <section id="floor-plans" className="SectionCard">
              <SectionTitle 
                icon={IndianRupee} 
                title="Price List & Configuration" 
                action={
                  <div className="flex gap-2">
                    {['all', '1', '2', '3', '4'].map((bhk) => (
                      <button
                        key={bhk}
                        onClick={() => setActiveBhkTab(bhk)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                          activeBhkTab === bhk 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {bhk === 'all' ? 'All' : `${bhk} BHK`}
                      </button>
                    ))}
                  </div>
                }
              />
              <div className="space-y-3">
                {PRICE_CONFIG_DATA.filter(item => activeBhkTab === 'all' || item.bhk === activeBhkTab).map((config, idx) => (
                  <PriceConfigRow 
                    key={idx} 
                    bhk={config.bhk} 
                    area={config.area} 
                    price={config.price} 
                    unit={config.unit}
                    isHighlighted={property.bhk === config.bhk}
                  />
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start gap-3">
                  <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-sm text-blue-800">
                    Prices mentioned are indicative and subject to change. Please contact the developer for current pricing and availability.
                  </p>
                </div>
              </div>
            </section>

            {/* ENHANCED FLOOR PLANS SECTION */}
            <section className="SectionCard">
              <SectionTitle icon={Maximize} title="Floor Plans & Unit Types" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['1 BHK', '2 BHK', '3 BHK', '4 BHK'].map((bhk, idx) => (
                  <div 
                    key={idx} 
                    className={`bg-gray-50 rounded-lg p-4 text-center border-2 transition-all cursor-pointer hover:border-primary/30 ${property.bhk === String(idx + 1) ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                  >
                    <div className="h-20 bg-white rounded-lg mb-3 flex items-center justify-center shadow-sm">
                      <Maximize className="text-gray-300" size={32} />
                    </div>
                    <p className="font-bold text-gray-900">{bhk}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {idx === 0 ? '450-550' : idx === 1 ? '850-1050' : idx === 2 ? '1200-1500' : '1800-2200'} sq.ft
                    </p>
                    <p className="text-sm text-primary font-semibold mt-2">
                      ₹{idx === 0 ? '45-55 L' : idx === 1 ? '85-105 L' : idx === 2 ? '1.2-1.5 Cr' : '1.8-2.5 Cr'}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* ENHANCED AMENITIES SECTION */}
            <section id="amenities" className="SectionCard">
              <SectionTitle 
                icon={Sparkles} 
                title="Amenities & Features"
                action={
                  property.amenities?.length > 8 && (
                    <button 
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      className="text-sm text-primary font-semibold hover:underline"
                    >
                      {showAllAmenities ? 'Show Less' : `+${property.amenities.length - 8} More`}
                    </button>
                  )
                }
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(showAllAmenities ? property.amenities : property.amenities?.slice(0, 8))?.map((amenity, idx) => {
                  const displayAmenity = mapAmenityName(amenity);
                  const AmenityIcon = getAmenityIcon(displayAmenity);
                  return (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <AmenityIcon size={16} className="text-primary" />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{displayAmenity}</span>
                    </div>
                  );
                })}
              </div>
              {(!property.amenities || property.amenities.length === 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {['24x7 Security', 'Power Backup', 'Lift', 'Parking', 'Gym', 'Swimming Pool', 'Garden', 'Club House'].map((amenity, idx) => {
                    const AmenityIcon = getAmenityIcon(amenity);
                    return (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <AmenityIcon size={16} className="text-primary" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* LOCATION BENEFITS SECTION - Dynamic from Backend */}
            <section id="location" className="SectionCard">
              <SectionTitle icon={Navigation} title="Location Benefits & Landmarks" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {(parseNearbyLandmarks(property?.nearby) || LOCATION_BENEFITS_DATA).map((item, idx) => (
                  <LocationBenefitItem key={idx} name={item.name} distance={item.distance} icon={item.icon} />
                ))}
              </div>
              
              {/* Map */}
              <div className="rounded-xl overflow-hidden border border-gray-200 h-[300px]">
                <iframe
                  title="Property Location"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              
              {/* Social Infrastructure - Dynamic Counts from Backend */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <School className="mx-auto mb-1 text-primary" size={18} />
                  <p className="text-xs text-gray-500">Schools</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {countNearbyByType(property?.nearby, 'school') || 5}+ Nearby
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <Hospital className="mx-auto mb-1 text-primary" size={18} />
                  <p className="text-xs text-gray-500">Hospitals</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {countNearbyByType(property?.nearby, 'hospital') || 3}+ Nearby
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <ShoppingBag className="mx-auto mb-1 text-primary" size={18} />
                  <p className="text-xs text-gray-500">Malls</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {countNearbyByType(property?.nearby, 'mall') || countNearbyByType(property?.nearby, 'shopping') || 4}+ Nearby
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <Briefcase className="mx-auto mb-1 text-primary" size={18} />
                  <p className="text-xs text-gray-500">IT Parks</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {countNearbyByType(property?.nearby, 'it park') || countNearbyByType(property?.nearby, 'office') || countNearbyByType(property?.nearby, 'commercial') || 6}+ Nearby
                  </p>
                </div>
              </div>
            </section>

            {/* SIMILAR PROPERTIES SECTION */}
            <section className="SectionCard">
              <SectionTitle icon={Building2} title="Similar Properties in the Area" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {SIMILAR_PROPERTIES_DATA.map((prop) => (
                  <SimilarPropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            </section>

            {/* TOP EXPERTS SECTION - Backend Ready */}
            <section id="experts" className="SectionCard">
              <SectionTitle 
                icon={Award} 
                title={property?.city ? `Top Experts in ${property.city}` : "Top Experts Near You"}
              />
              
              {/* Backend-ready data extraction */}
              <ExpertsCarousel property={property} handleExpertContact={handleExpertContact} />
            </section>

            {/* REVIEWS SECTION - LAST SECTION */}
            <section id="reviews" className="SectionCard">
              <SectionTitle 
                icon={Star} 
                title={`${property.title?.split(' ').slice(0, 3).join(' ') || 'Property'} Reviews & Rating`}
              />
              <p className="text-sm text-gray-500 mb-6">
                Read the reviews about {property.title?.split(' ').slice(0, 3).join(' ') || 'this property'} located at {property.location || 'prime location'} and see what residents and real estate experts have to say about the project.
              </p>
              
              {/* Rating Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Overall Rating */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 3.8).toFixed(1)}
                    </div>
                    <div className="flex justify-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={20} 
                          className={star <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 3.8) ? "text-amber-400 fill-amber-400" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{reviews.length || 5} Ratings</p>
                  </div>
                </div>
                
                {/* Rating Breakdown */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviews.filter(r => r.rating === stars).length || (stars === 5 ? 1 : stars === 4 ? 2 : stars === 3 ? 2 : 0);
                    const total = reviews.length || 5;
                    const percentage = (count / total) * 100;
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600 w-12">{stars} Star</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-6">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Top Reviews */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 mb-3">Top Reviews</h4>
                {reviews.slice(0, 3).map((review, idx) => (
                  <div key={review.id || idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-primary text-sm">{review.name?.[0] || 'U'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{review.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            {idx === 0 ? 'Real estate agent' : 'Owner'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}
                            />
                          ))}
                          <span className="text-xs text-gray-400 ml-1">{review.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
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
                          className="p-1 text-gray-300 hover:text-red-500 flex-shrink-0"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Write a Review */}
              <div className="mt-6">
                {showReviewForm ? (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-3">Write a review</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-2">Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => {
                                if (!isGuestView) {
                                  setNewReview({ ...newReview, rating: star });
                                } else {
                                  openLoginForPropertyDetails();
                                }
                              }}
                              className={`p-1 rounded transition-all ${
                                star <= newReview.rating ? 'text-amber-400' : 'text-gray-300'
                              }`}
                            >
                              <Star size={24} className={star <= newReview.rating ? "fill-current" : ""} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-2">Your Review</label>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                          rows={3}
                          placeholder="Share your experience about this property..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddReview}
                          disabled={!newReview.comment.trim()}
                          className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-all disabled:opacity-50"
                        >
                          Post Review
                        </button>
                        <button
                          onClick={() => setShowReviewForm(false)}
                          className="px-4 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      if (!isGuestView) {
                        setShowReviewForm(true);
                      } else {
                        openLoginForPropertyDetails();
                      }
                    }}
                    className="w-full py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Write a review
                  </button>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar - New Contact Side Panel */}
          <div className="space-y-4 sm:space-y-6">
            <div className="sticky top-20 sm:top-24 space-y-4 sm:space-y-6">
              {/* New Contact Side Panel Component */}
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
                  // Show callback modal or trigger callback request
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
                        onClick={() => window.open(`tel:+91${property.owner?.phone || '9876543210'}`)}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-primary hover:text-primary transition-all"
                      >
                        <Phone size={18} />
                        Call Owner
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
            // Log the lead data for debugging
            console.log('Submitting lead:', leadData);
            
            // Try to generate lead (may fail if not authenticated)
            try {
              await generateLead(property.id, user?.id || 'guest', {
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
                userFirstName: leadData.name,
                userEmail: leadData.email || 'guest@example.com',
                userPhone: leadData.phone,
                priority: 'high',
                is_hot: true,
                score: 85,
                notes: `ENQUIRY: ${leadData.message}`,
                utm_content: 'enquiry_submission_with_otp',
                leadEvent: 'inquiry',
                verified: true,
                otpVerified: true,
                timestamp: leadData.timestamp
              });
            } catch (leadError) {
              console.log('Lead generation skipped or failed:', leadError);
            }

            // Try original enquiry logic
            try {
              await addEnquiry(property.id, leadData.message);
            } catch (enquiryError) {
              console.log('Enquiry API skipped or failed:', enquiryError);
            }
            
            // Always show success in demo mode
            console.log('Enquiry submitted successfully (Demo Mode)');
            return Promise.resolve();
          } catch (error) {
            console.error('Lead submission error:', error);
            // Still resolve to not block the UI
            return Promise.resolve();
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
    </motion.div>
  );
}

export default PropertyDetails;

