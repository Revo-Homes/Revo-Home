import { useState, useEffect, useRef } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

// Add console.log for payload debugging
console.log('SELL PROPERTY PAGE PAYLOAD:', {
  timestamp: new Date().toISOString(),
  page: 'SellProperty.jsx',
  userAgent: navigator.userAgent,
  url: window.location.href,
  payload: {
    action: 'page_load',
    component: 'SellProperty',
    features: ['property_submission', 'media_upload', 'form_validation']
  }
});

import { useProperty } from '../contexts/PropertyContext';

import { useAuth } from '../contexts/AuthContext';

import { propertyApi } from '../services/api';

import PropertySubscriptionGuard from '../guards/PropertySubscriptionGuard';

import PropertyMediaForm from '../components/PropertyMediaForm';

import RichTextEditor from '../components/RichTextEditor';

import CategorizedAmenities from '../components/CategorizedAmenities';

import {
  Home,
  BedDouble,
  Bath,
  Utensils,
  Wind,
  PlusSquare,
  CheckCircle2,
  ChevronRight,
  Info,
  Upload,
  X,
  Edit2,
  FileText,
  Image as ImageIcon,
  Building2,
  Tag,
  MapPin,
  IndianRupee,
  Hash,
  AlertCircle,
  Calendar,
  FileSearch,
  LayoutDashboard,
  ArrowLeft,
  Sparkles
} from 'lucide-react';



const STEPS = [
  { id: 1, title: 'Basic Information' },
  { id: 2, title: 'Category Details' },
  { id: 3, title: 'Features & Amenities' },
  { id: 4, title: 'Pricing Details' },
  { id: 5, title: 'Location & Compliance' },
  { id: 6, title: 'Media' },
  { id: 7, title: 'SEO & Submit' },
];

// Builder API helper (for builder selection feature)
const builderApi = {
  list: async (params = {}) => {
    try {
      const response = await propertyApi.getBuilders(params);
      console.log('Builder API response:', response);

      // Handle different response formats
      let builders = [];
      if (response?.data && Array.isArray(response.data)) {
        builders = response.data;
      } else if (Array.isArray(response)) {
        builders = response;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        // Handle nested data structure
        builders = response.data.data;
      }

      // Map builders to consistent format
      return builders.map(builder => ({
        id: builder.id,
        name: builder.name || builder.organization || 'Unknown Builder',
        city: builder.city || builder.address?.city || '',
        status: builder.status || 'active',
        type: builder.type || 'builder'
      }));
    } catch (error) {
      console.error('Builder API error:', error);
      return [];
    }
  }
};

// Property category mapping for subtypes
const PROPERTY_TYPE_ID_MAP = {
  'Residential': 1,
  'Commercial': 2,
  'Land': 3,
  'Industrial': 4,
  'Hospitality': 5
};

const PROPERTY_CATEGORY_ID_MAP = {
  'Residential': 1,
  'Commercial': 2,
  'Land': 3,
  'Industrial': 4,
  'Hospitality': 5
};

const PROPERTY_LABEL_OPTIONS = [
  { slug: 'featured', name: 'Featured', color: 'bg-orange-500', note: 'Priority display' },
  { slug: 'top_selling', name: 'Top Selling', color: 'bg-blue-500', note: 'High demand' },
  { slug: 'exclusive', name: 'Exclusive', color: 'bg-purple-500', note: 'Special listing' },
  { slug: 'hot_sale', name: 'Hot Sale', color: 'bg-red-500', note: 'Urgent attention' },
  { slug: 'sold_out', name: 'Sold Out', color: 'bg-gray-500', note: 'Overrides other labels' },
  { slug: 'few_units_left', name: 'Few Units Left', color: 'bg-yellow-500', note: 'Limited inventory' },
];

const AREA_UNIT_OPTIONS = [
  { value: 'sqft', label: 'Square Feet' },
  { value: 'sqm', label: 'Square Meter' },
  { value: 'sqyd', label: 'Square Yard' },
  { value: 'bigha', label: 'Bigha' },
  { value: 'katha', label: 'Katha' },
  { value: 'acre', label: 'Acre' },
  { value: 'hectare', label: 'Hectare' },
  { value: 'guntha', label: 'Guntha' },
];

function normalizeOptionText(value) {
  return String(value || '').trim().toLowerCase();
}

function getOptionLabel(option) {
  if (!option || typeof option !== 'object') return String(option || '');
  return String(option.label || option.name || option.title || option.slug || option.value || option.id || '');
}

function getOptionValue(option) {
  if (!option || typeof option !== 'object') return String(option || '');
  return String(option.value || option.slug || option.name || option.label || option.id || '');
}

function getOptionId(option) {
  if (!option || typeof option !== 'object') return '';
  return option.id ?? option.type_id ?? option.value ?? '';
}

function findPropertyTypeRecord(formData, formOptions) {
  const selectedId = normalizeOptionText(formData.property_type_id);
  const selectedType = normalizeOptionText(formData.propertyType);
  return (formOptions.property_types || []).find((type) => {
    const candidates = [
      type.id,
      type.value,
      type.slug,
      type.name,
      type.label,
    ].map(normalizeOptionText);
    return candidates.includes(selectedId) || candidates.includes(selectedType);
  });
}

function findPropertyCategoryRecord(formData, formOptions) {
  const selectedId = normalizeOptionText(formData.property_category_id);
  const selectedCategory = normalizeOptionText(formData.propertySubType || formData.property_subtype);
  return (formOptions.property_categories || []).find((category) => {
    const candidates = [
      category.id,
      category.value,
      category.slug,
      category.name,
      category.label,
    ].map(normalizeOptionText);
    return candidates.includes(selectedId) || candidates.includes(selectedCategory);
  });
}

function getPropertyKind(formData, formOptions) {
  const typeRecord = findPropertyTypeRecord(formData, formOptions);
  const categoryRecord = findPropertyCategoryRecord(formData, formOptions);
  const combined = normalizeOptionText([
    formData.propertyType,
    formData.propertySubType,
    formData.property_subtype,
    typeRecord?.slug,
    typeRecord?.name,
    typeRecord?.label,
    categoryRecord?.slug,
    categoryRecord?.name,
    categoryRecord?.label,
  ].filter(Boolean).join(' '));

  if (/(commercial|office|retail|showroom|shop|mall)/.test(combined)) return 'Commercial';
  if (/(industrial|warehouse|factory|shed|logistics)/.test(combined)) return 'Industrial';
  if (/(hospitality|hotel|resort|guest|hostel|pg|service apartment)/.test(combined)) return 'Hospitality';
  if (/(land|plot|farm|agricultural)/.test(combined)) return 'Land';
  if (/(residential|flat|apartment|villa|house|home|bhk|rk|studio|duplex|penthouse)/.test(combined)) return 'Residential';

  return formData.propertyType || '';
}

function getCategoriesForSelectedType(formData, formOptions) {
  const typeRecord = findPropertyTypeRecord(formData, formOptions);
  const selectedTypeIds = [
    formData.property_type_id,
    typeRecord?.id,
    typeRecord?.value,
    typeRecord?.slug,
    typeRecord?.name,
    typeRecord?.label,
  ].filter((value) => value !== undefined && value !== null && value !== '').map((value) => String(value));

  const categories = formOptions.property_categories || [];
  const filtered = categories.filter((category) => {
    if (!category.type_id && !category.property_type_id) return true;
    const categoryTypeIds = [
      category.type_id,
      category.property_type_id,
      category.type,
      category.property_type,
      category.type_slug,
    ].filter((value) => value !== undefined && value !== null && value !== '').map((value) => String(value));
    return categoryTypeIds.some((categoryTypeId) => selectedTypeIds.includes(categoryTypeId));
  });

  return filtered.length > 0 ? filtered : categories;
}

function getAreaUnitOptions(formOptions) {
  const backendOptions = formOptions?.area_units || [];
  const normalized = backendOptions.map((unit) => {
    if (unit && typeof unit === 'object') {
      return {
        value: unit.value || unit.slug || unit.label || unit.name || unit.id,
        label: unit.label || unit.name || unit.value || unit.slug || unit.id,
      };
    }
    return { value: unit, label: unit };
  }).filter((unit) => unit.value && unit.label);

  const merged = [...normalized];
  AREA_UNIT_OPTIONS.forEach((fallbackUnit) => {
    const exists = merged.some((unit) =>
      String(unit.value).toLowerCase() === fallbackUnit.value ||
      String(unit.label).toLowerCase() === fallbackUnit.label.toLowerCase()
    );
    if (!exists) merged.push(fallbackUnit);
  });

  return merged;
}

// Helper function to get RERA placeholder based on location
function normalizeLocationValue(value) {
  if (!value || typeof value !== 'string') return '';
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

function getReraExampleByLocation({ city, state }) {
  const normalizedCity = normalizeLocationValue(city);
  const normalizedState = normalizeLocationValue(state || '');

  // Odisha
  if (
    ['bhubaneswar', 'cuttack'].includes(normalizedCity) ||
    normalizedState === 'odisha'
  ) {
    return {
      placeholder: 'ORERA/PROJECT/2024/000123',
      hint: 'Sample: ORERA/PROJECT/2024/000123'
    };
  }

  // Maharashtra (Mumbai, Pune, etc.)
  if (
    ['mumbai', 'pune', 'thane', 'nagpur', 'nashik', 'aurangabad', 'kolhapur', 'sangli'].includes(normalizedCity) ||
    normalizedState === 'maharashtra'
  ) {
    return {
      placeholder: 'P51800012345',
      hint: 'Sample: P51800012345'
    };
  }

  // Karnataka (Bangalore, etc.)
  if (
    ['bangalore', 'bengaluru', 'mysore', 'mangalore', 'hubballi'].includes(normalizedCity) ||
    normalizedState === 'karnataka'
  ) {
    return {
      placeholder: 'PRM/KA/RERA/1251/310/PR/171014/000123',
      hint: 'Sample: PRM/KA/RERA/1251/310/PR/171014/000123'
    };
  }

  // Telangana (Hyderabad)
  if (normalizedCity === 'hyderabad' || normalizedState === 'telangana') {
    return {
      placeholder: 'P02400004567',
      hint: 'Sample: P02400004567'
    };
  }

  // Uttar Pradesh
  if (
    ['noida', 'greater noida', 'lucknow', 'kanpur', 'varanasi', 'agra', 'meerut', 'ghaziabad'].includes(normalizedCity) ||
    normalizedState === 'uttar pradesh'
  ) {
    return {
      placeholder: 'UPRERAPRJ123456',
      hint: 'Sample: UPRERAPRJ123456'
    };
  }

  // Delhi
  if (normalizedCity === 'delhi' || normalizedState === 'delhi') {
    return {
      placeholder: 'DLRERA2024P0001',
      hint: 'Sample: DLRERA2024P0001'
    };
  }

  // Haryana (Gurgaon, Faridabad)
  if (
    ['gurgaon', 'gurugram', 'faridabad'].includes(normalizedCity) ||
    normalizedState === 'haryana'
  ) {
    return {
      placeholder: 'HARERA/PROJECT/2024/001',
      hint: 'Sample: HARERA/PROJECT/2024/001'
    };
  }

  // Tamil Nadu (Chennai)
  if (
    ['chennai', 'coimbatore', 'madurai'].includes(normalizedCity) ||
    normalizedState === 'tamil nadu'
  ) {
    return {
      placeholder: 'TN/01/Building/0001/2024',
      hint: 'Sample: TN/01/Building/0001/2024'
    };
  }

  // West Bengal (Kolkata)
  if (
    ['kolkata', 'howrah'].includes(normalizedCity) ||
    normalizedState === 'west bengal'
  ) {
    return {
      placeholder: 'WBRERA/P/2024/0001',
      hint: 'Sample: WBRERA/P/2024/0001'
    };
  }

  // Gujarat (Ahmedabad, Surat)
  if (
    ['ahmedabad', 'surat', 'vadodara', 'rajkot'].includes(normalizedCity) ||
    normalizedState === 'gujarat'
  ) {
    return {
      placeholder: 'GJ/AA/2024/0001',
      hint: 'Sample: GJ/AA/2024/0001'
    };
  }

  // Rajasthan (Jaipur)
  if (
    ['jaipur', 'jodhpur', 'udaipur'].includes(normalizedCity) ||
    normalizedState === 'rajasthan'
  ) {
    return {
      placeholder: 'RERAJ/P/2024/001',
      hint: 'Sample: RERAJ/P/2024/001'
    };
  }

  // Kerala (Kochi, Trivandrum)
  if (
    ['kochi', 'trivandrum', 'kozhikode'].includes(normalizedCity) ||
    normalizedState === 'kerala'
  ) {
    return {
      placeholder: 'KERALA-KRERA/2024/01/0001',
      hint: 'Sample: KERALA-KRERA/2024/01/0001'
    };
  }

  // Punjab (Chandigarh, Ludhiana)
  if (
    ['chandigarh', 'ludhiana', 'amritsar'].includes(normalizedCity) ||
    normalizedState === 'punjab'
  ) {
    return {
      placeholder: 'PBRERA-2024-P-001',
      hint: 'Sample: PBRERA-2024-P-001'
    };
  }

  // Default/Generic
  return {
    placeholder: 'RERA/STATE/PROJECT/2024/0001',
    hint: 'Sample: RERA/STATE/PROJECT/2024/0001'
  };
}

function SellProperty() {

  const [step, setStep] = useState(1);
  const completionPercentage = Math.round((step / STEPS.length) * 100);

  const [searchParams] = useSearchParams();

  const editId = searchParams.get('edit');

  const { getProperty, createProperty, updateProperty, uploadPropertyImages, loading: propertyLoading } = useProperty();

  const { user, isLoggedIn } = useAuth();

  const navigate = useNavigate();

  // Dynamic form options from database
  const [formOptions, setFormOptions] = useState({});
  const [loadingFormOptions, setLoadingFormOptions] = useState(true);

  // Fetch all form options from database
  useEffect(() => {
    const fetchFormOptions = async () => {
      try {
        const response = await propertyApi.getFormOptions();
        const data = response?.data || response;
        console.log('Form options loaded:', Object.keys(data || {}));
        console.log('Property types count:', data?.property_types?.length, data?.property_types);
        console.log('Property categories count:', data?.property_categories?.length);
        console.log('States count:', data?.states?.length);
        console.log('Furnishing status count:', data?.furnishing_status?.length, data?.furnishing_status);
        console.log('Facing direction count:', data?.facing_direction?.length);
        console.log('Area units count:', data?.area_units?.length, data?.area_units);
        console.log('All group keys:', Object.keys(data || {}).filter(k => Array.isArray(data[k])));
        setFormOptions(data || {});
      } catch (err) {
        console.error('Failed to load form options:', err);
        // Fallback to empty object if API fails
        setFormOptions({});
      } finally {
        setLoadingFormOptions(false);
      }
    };
    fetchFormOptions();
  }, []);

  const [formData, setFormData] = useState({
    // Identity
    property_id: "",
    listing_id: "",
    name: "",
    property_title_tagline: "",
    slug: "",
    description: "",

    // Property Type & Classification
    propertyType: "",
    propertySubType: "",
    property_type_id: "",
    property_category_id: "",
    property_subtype: "",
    listingType: "",
    transaction_type: "new_booking",
    ownership_type: "individual",

    // Builder Selection
    is_builder_listed: false,
    builder_id: "",
    builder_name: "",

    // Listing Status
    property_condition: "",
    sale_urgency: "",
    status: "draft",

    // BHK Configuration (CRM style)
    selectedBHKs: [],
    bhk: [],
    bhkDetails: [], // Array of { type, type_slug, bedrooms, bathrooms, kitchens, halls, balconies, terrace, additionalSpace, carpet_area, builtup_area, price, floor_number, furnishing_status, unit_name }

    // Area & Dimensions
    total_area: "",
    builtup_area: "",
    carpet_area: "",
    super_builtup_area: "",
    plot_length: "",
    plot_width: "",
    area_unit: "sqft",

    // Property Structure
    total_floors: "",
    floor_number: "",
    total_units: "",
    year_built: "",
    age_of_property: "",
    possession_date: "",

    // Facing & Direction
    facing_direction: "",

    // Furnishing & Construction
    furnishing_status: "",
    construction_quality: "medium",

    // Utilities
    water_source: "",
    power_backup: "",
    lift_available: false,
    rainwater_harvesting: false,
    security_24x7: false,

    // Parking
    parking_type: "",
    parking_spaces: "",

    // Features
    is_corner_unit: false,
    vaastu_compliance: false,
    pet_friendly: false,
    vegan_friendly: false,
    smart_home_features: false,

    // Commercial Fields
    commercial_type: "",
    washrooms: "",
    visibility: "",
    footfall_tag: "",
    cabin_option: "",

    // Industrial Fields
    ceiling_height: "",
    power_supply: "",
    industrial_type: "",
    loading_dock: false,
    truck_access: false,
    fire_safety: "",
    flooring_type: "",
    office_space: "",

    // Hospitality Fields
    total_rooms: "",
    room_types: "",
    occupancy_type: "",
    food_included: "",
    operational_status: "",

    // Land Fields
    road_access: "",
    boundary_wall: false,
    electricity_availability: "",
    plot_type: "",
    gated_plot: false,

    // Location
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    country: "IN",
    zip_code: "",
    locality: "",
    landmark: "",
    latitude: "",
    longitude: "",

    // Nearby Distances (CRM style)
    near_metro_distance: "",
    near_metro_distance_custom: "",
    near_railway_distance: "",
    near_railway_distance_custom: "",
    near_busstand_distance: "",
    near_busstand_distance_custom: "",
    near_airport_distance: "",
    near_airport_distance_custom: "",
    near_highway_distance: "",
    near_highway_distance_custom: "",
    near_auto_taxi_distance: "",
    near_auto_taxi_distance_custom: "",
    near_hospital_distance: "",
    near_hospital_distance_custom: "",
    near_school_distance: "",
    near_school_distance_custom: "",
    near_market_distance: "",
    near_market_distance_custom: "",

    // Legacy distance fields (for backward compatibility)
    hospitalDistance: "",
    schoolDistance: "",
    metroDistance: "",
    busStandDistance: "",
    airportDistance: "",
    railwayDistance: "",

    // Compliance
    rera_number: "",
    rera_authority_id: "",
    rera_expiry_date: "",
    is_verified: false,

    // Resale Documents
    resale_documents: [],

    // Pricing - Sale
    price_min: "",
    price_max: "",
    price_per_sqft: "",
    price_on_request: false,

    // Pricing - Rent
    rent_amount: "",
    rent_frequency: "monthly",
    security_deposit: "",
    maintenance_charges: "",
    maintenance_charges_frequency: "monthly",
    maintenance_deposit: "",

    // Rent Specific
    available_from: "",
    available_until: "",
    lock_in_period: "",
    lease_appreciation: "",
    brokerage: "",
    brokerage_percent: "",

    // Negotiation
    negotiable: false,
    price_includes: [],

    // Currency
    currency: "INR",

    // Features & Amenities
    features: [],
    amenities: [],
    security: [],
    utilities: [],
    nearby_facilities: [],
    accessibility_features: [],

    // Media Items (CRM style)
    media_items: [],

    // Legacy Media (for backward compatibility)
    photos: [],
    floor_plan: [],
    master_plan: [],
    documents: [],
    virtual_tour: [],
    youtubeLinks: [],

    // SEO
    metaTitle: "",
    meta_description: "",
    meta_title: "",
    meta_text: "",

    // Labels/Tags
    selectedTags: [],

    // Feature flags
    otherFeatureEnabled: false,
    otherFeature: "",

    // Internal
    unit_number: "",
    unit_type: "",
    floor_plan_url: "",
    reference_no: "",
    virtual_tour_url: "",
    matterport_id: "",
    is_exclusive: false,
    is_featured: false,
    is_published: false,
    views_count: 0,
  });

  const propertyKind = getPropertyKind(formData, formOptions);

  const [otherFeature, setOtherFeature] = useState('');
  const [customFeatures, setCustomFeatures] = useState([]);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customBhkInput, setCustomBhkInput] = useState('');

  // Builder state
  const [builders, setBuilders] = useState([]);
  const [isLoadingBuilders, setIsLoadingBuilders] = useState(false);

  // Fetch builders when builder selection is enabled
  useEffect(() => {
    if (formData.is_builder_listed) {
      const fetchBuilders = async () => {
        setIsLoadingBuilders(true);
        try {
          // Fetch all builders without status filter to debug
          const data = await builderApi.list({});
          console.log('Fetched builders:', data);
          setBuilders(data || []);
        } catch (error) {
          console.error('Failed to fetch builders:', error);
          setBuilders([]);
        } finally {
          setIsLoadingBuilders(false);
        }
      };
      fetchBuilders();
    }
  }, [formData.is_builder_listed]);

  // ─── BHK Helper Functions ───────────────────────────────────────────────────

  function getBhkFieldVisibility(selectedCategorySlug) {
    const slug = String(selectedCategorySlug || '').toLowerCase();
    const isOneRk = slug.includes('rk');
    const isBhk = slug.includes('bhk');
    const bedroomCountMatch = slug.match(/(\d+)/);
    const bedroomCount = bedroomCountMatch ? parseInt(bedroomCountMatch[1], 10) : 0;
    const isTwoBhkAndAbove = bedroomCount >= 2;

    return {
      showBedroomField: isBhk || isOneRk,
      showRoomField: !isBhk && !isOneRk,
      showHallField: isTwoBhkAndAbove,
      showKitchenField: true,
      showWashroomField: true,
      showBalconyField: !isOneRk,
      showTerraceField: isTwoBhkAndAbove,
      showAdditionalSpaceField: true,
      isOneBhkFamily: bedroomCount === 1 && !isOneRk,
    };
  }

  function getBhkDefaultValues(categorySlug, formOpts) {
    const category = formOpts?.property_categories?.find(c => c.slug === categorySlug);
    const meta = category?.meta || {};

    return {
      bedrooms: String(meta.bedrooms || 1),
      halls: String(meta.halls || (meta.bedrooms >= 2 ? 1 : 0)),
      kitchens: String(meta.kitchens || 1),
      bathrooms: String(meta.bathrooms || meta.bedrooms || 1),
      balconies: String(meta.balconies || (meta.bedrooms >= 3 ? 2 : 1)),
      terrace: String(meta.terrace || 0),
      additionalSpace: String(meta.additionalSpace || (categorySlug.includes('.5') ? 1 : 0)),
    };
  }

  function isBhkFieldUnset(value) {
    return value === undefined || value === null || value === '';
  }

  function parseHalfBhkConfig(categorySlug) {
    const isHalfBhk = categorySlug.includes('.5') || categorySlug.includes('_5_');
    if (!isHalfBhk) return { isHalfBhk: false, mainBedrooms: 0, extraRoom: 0 };
    
    const match = categorySlug.match(/(\d+)(?:\.|_)(\d+)/);
    if (match) {
      return {
        isHalfBhk: true,
        mainBedrooms: parseInt(match[1], 10),
        extraRoom: 1
      };
    }
    return { isHalfBhk: false, mainBedrooms: 0, extraRoom: 0 };
  }

  function createBhkDetailFromType(categorySlug, formOpts, existingDetail = {}) {
    const defaults = getBhkDefaultValues(categorySlug, formOpts);
    const category = formOpts?.property_categories?.find(c => c.slug === categorySlug);
    const halfBhkConfig = parseHalfBhkConfig(categorySlug);

    let adjustedDefaults = { ...defaults };
    if (halfBhkConfig.isHalfBhk) {
      adjustedDefaults = {
        ...defaults,
        bedrooms: String(halfBhkConfig.mainBedrooms),
        bathrooms: String(halfBhkConfig.mainBedrooms),
        additionalSpace: '1'
      };
    }

    return {
      type: category?.label || categorySlug,
      type_slug: categorySlug,
      bedrooms: isBhkFieldUnset(existingDetail.bedrooms) ? adjustedDefaults.bedrooms : existingDetail.bedrooms,
      bathrooms: isBhkFieldUnset(existingDetail.bathrooms) ? adjustedDefaults.bathrooms : existingDetail.bathrooms,
      kitchens: isBhkFieldUnset(existingDetail.kitchens) ? adjustedDefaults.kitchens : existingDetail.kitchens,
      halls: isBhkFieldUnset(existingDetail.halls) ? adjustedDefaults.halls : existingDetail.halls,
      balconies: isBhkFieldUnset(existingDetail.balconies) ? adjustedDefaults.balconies : existingDetail.balconies,
      terrace: isBhkFieldUnset(existingDetail.terrace) ? adjustedDefaults.terrace : existingDetail.terrace,
      additionalSpace: isBhkFieldUnset(existingDetail.additionalSpace) ? adjustedDefaults.additionalSpace : existingDetail.additionalSpace,
      carpet_area: existingDetail.carpet_area || null,
      builtup_area: existingDetail.builtup_area || null,
      price: existingDetail.price || null,
      total_units: existingDetail.total_units || null,
      floor_number: existingDetail.floor_number || null,
      furnishing_status: existingDetail.furnishing_status || null,
      unit_name: existingDetail.unit_name || null,
    };
  }

  function syncBhkState(updatedSelected, updatedDetails) {
    setFormData(prev => ({
      ...prev,
      selectedBHKs: updatedSelected,
      bhkDetails: updatedDetails,
      bhk: updatedSelected.length > 0 ? updatedSelected : [],
      bathrooms: updatedDetails.length > 0 ? updatedDetails[0].bathrooms : '',
    }));
  }

  const updateBhkDetails = (newSelection) => {
    setFormData(prev => {
      const nextDetails = newSelection.map((bhkType) => {
        const existing = prev.bhkDetails?.find((d) => d.type === bhkType || d.type_slug === bhkType) || {};
        return createBhkDetailFromType(bhkType, formOptions, existing);
      });
      return {
        ...prev,
        selectedBHKs: newSelection,
        bhkDetails: nextDetails,
        bhk: newSelection,
      };
    });
  };

  const toggleBHK = (bhkSlug) => {
    setFormData(prev => {
      let updatedSelected = [...(prev.selectedBHKs || [])];
      if (updatedSelected.includes(bhkSlug)) {
        updatedSelected = updatedSelected.filter((b) => b !== bhkSlug);
      } else {
        updatedSelected.push(bhkSlug);
      }
      const nextDetails = updatedSelected.map((bhkType) => {
        const existing = prev.bhkDetails?.find((d) => d.type === bhkType || d.type_slug === bhkType) || {};
        return createBhkDetailFromType(bhkType, formOptions, existing);
      });
      return {
        ...prev,
        selectedBHKs: updatedSelected,
        bhkDetails: nextDetails,
        bhk: updatedSelected,
      };
    });
  };

  const updateBHKDetail = (index, key, value) => {
    setFormData(prev => {
      const updatedDetails = (prev.bhkDetails || []).map((detail, detailIndex) =>
        detailIndex === index ? { ...detail, [key]: value } : detail
      );
      return {
        ...prev,
        bhkDetails: updatedDetails,
        bathrooms: updatedDetails.length > 0 ? updatedDetails[0].bathrooms : prev.bathrooms,
      };
    });
  };

  const [mediaPreviews, setMediaPreviews] = useState({

    photos: [],

    floor_plan: [],

    master_plan: [],

    documents: [],

    virtual_tour: []

  });

  const [submitting, setSubmitting] = useState(false);

  // RERA validation state
  const [reraError, setReraError] = useState('');
  const [reraChecking, setReraChecking] = useState(false);
  const reraCheckTimeoutRef = useRef(null);



  useEffect(() => {

    if (editId) {

      const loadProperty = async () => {

        try {

          const p = await getProperty(editId);

          setFormData({

            // Basic Information

            property_id: p.propertyId || p.property_id || '',

            listing_id: p.listingId || p.listing_id || '',

            organization_id: p.organization_id || 1,

            property_type_id: p.property_type_id || '',

            property_category_id: p.property_category_id || '',

            property_subtype: p.property_subtype || '',

            name: p.name || '',

            slug: p.slug || '',

            description: p.description || '',



            // Listing Details

            listing_type: p.listing_type || 'sale',

            transaction_type: p.transaction_type || 'new_booking',

            ownership_type: p.ownership_type || 'individual',



            // RERA Details

            rera_number: p.rera_number || '',

            possession_date: p.possession_date || '', // Changed from rera_expiry_date



            // Location Details

            address_line1: p.address_line1 || '',

            address_line2: p.address_line2 || '',

            city: p.city || '',

            state: p.state || '',

            country: p.country || 'IN',

            zip_code: p.zip_code || '',

            locality: p.locality || '',

            landmark: p.landmark || '',

            latitude: p.latitude || '',

            longitude: p.longitude || '',



            // Property Specifications

            total_units: p.total_units || 0,

            total_floors: p.total_floors || 0,

            floor_number: p.floor_number || '',

            total_area: p.total_area || '',

            builtup_area: p.builtup_area || '',

            carpet_area: p.carpet_area || '',

            super_builtup_area: p.super_builtup_area || '',

            area_unit: p.area_unit || 'sqft',

            year_built: p.year_built || '',

            age_of_property: p.age_of_property || '',

            facing_direction: p.facing_direction || '',

            parking_spaces: p.parking_spaces || 0,

            parking_type: p.parking_type || 'open',



            // Additional Specifications

            bhk: p.bhk || '',

            bathrooms: p.bathrooms || 0,

            balconies: p.balconies || 0,

            furnished_status: p.furnished_status || 'semi_furnished',

            construction_quality: p.construction_quality || 'medium',

            water_source: p.water_source || 'municipal',

            power_backup: p.power_backup || false,

            lift: p.lift || false,

            rainwater_harvesting: p.rainwater_harvesting || false,

            security: p.security || false,

            maintenance_charges: p.maintenance_charges || '',

            maintenance_charges_frequency: p.maintenance_charges_frequency || 'monthly',



            // Pricing Information

            price_min: p.price_min || '',

            price_max: p.price_max || '',

            price_per_sqft: p.price_per_sqft || '',

            price_on_request: p.price_on_request || false,

            currency: p.currency || 'INR',



            // Rental Information

            rent_amount: p.rent_amount || '',

            rent_frequency: p.rent_frequency || 'monthly',

            security_deposit: p.security_deposit || '',

            maintenance_deposit: p.maintenance_deposit || '',



            // Negotiation

            negotiable: p.negotiable || false,

            price_includes: p.price_includes || [],



            // Status and Features

            status: p.status || 'draft',

            is_featured: p.is_featured || false,

            features: p.features || [],

            meta_title: p.meta_title || '',

            meta_description: p.meta_description || '',

            meta: p.meta || {},



            // Additional Features

            amenities: p.amenities || [],

            nearby_facilities: p.nearby_facilities || [],

            accessibility_features: p.accessibility_features || [],

            pet_friendly: p.pet_friendly || false,

            vegan_friendly: p.vegan_friendly || false,



            // Legacy fields for compatibility

            furnished: p.furnished || 'Semi Furnished',

            listingType: p.listingType || 'sale',

            photos: [],

            floor_plan: [],

            master_plan: [],

            documents: [],

            virtual_tour: [],

          });

          if (p.image) setMediaPreviews(prev => ({ ...prev, photos: [p.image] }));

          // If there are more images in gallery

          if (p.images) setMediaPreviews(prev => ({ ...prev, photos: p.images }));

        } catch (err) {

          console.error('Failed to load property for edit:', err);

        }

      };

      loadProperty();

    }

  }, [editId, getProperty]);



  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({

      ...prev,

      [name]: type === 'checkbox' ? checked : value,

    }));

    // RERA validation with debounce
    if (name === 'rera_number' && value.trim()) {
      // Clear previous timeout
      if (reraCheckTimeoutRef.current) {
        clearTimeout(reraCheckTimeoutRef.current);
      }

      setReraError('');
      setReraChecking(true);

      // Debounce the check for 500ms
      reraCheckTimeoutRef.current = setTimeout(async () => {
        try {
          const result = await propertyApi.checkReraExists(value.trim(), editId);
          if (result && result.exists) {
            setReraError('This RERA number is already registered. Please enter a unique RERA number.');
          } else {
            setReraError('');
          }
        } catch (error) {
          // Silently fail on API error - don't block user
          console.error('RERA check failed:', error);
        } finally {
          setReraChecking(false);
        }
      }, 500);
    } else if (name === 'rera_number' && !value.trim()) {
      setReraError('');
      setReraChecking(false);
      if (reraCheckTimeoutRef.current) {
        clearTimeout(reraCheckTimeoutRef.current);
      }
    }

  };



  const handleCategorizedMediaChange = (e, category) => {

    const files = Array.from(e.target.files);

    const newPreviews = files.map((f) => URL.createObjectURL(f));

    setFormData((prev) => ({

      ...prev,

      [category]: [...(prev[category] || []), ...files]

    }));

    setMediaPreviews((prev) => ({

      ...prev,

      [category]: [...(prev[category] || []), ...newPreviews]

    }));

  };



  const removeCategorizedMedia = (index, category) => {

    setFormData((prev) => ({

      ...prev,

      [category]: prev[category].filter((_, i) => i !== index),

    }));

    setMediaPreviews((prev) => ({

      ...prev,

      [category]: prev[category].filter((_, i) => i !== index),

    }));

  };



  const handleMediaReplace = (index, category, newFile) => {

    const newPreview = URL.createObjectURL(newFile);

    setFormData((prev) => {

      const updated = [...(prev[category] || [])];

      updated[index] = newFile;

      return { ...prev, [category]: updated };

    });

    setMediaPreviews((prev) => {

      const updated = [...(prev[category] || [])];

      updated[index] = newPreview;

      return { ...prev, [category]: updated };

    });

  };



  const addCustomFeature = () => {

    if (otherFeature.trim() && !customFeatures.includes(otherFeature.trim())) {

      setCustomFeatures([...customFeatures, otherFeature.trim()]);

      setOtherFeature('');

    }

  };



  const removeCustomFeature = (feature) => {

    setCustomFeatures(customFeatures.filter(f => f !== feature));

  };



  const toggleOtherInput = () => {

    setShowOtherInput(!showOtherInput);

  };




  // Location-based nearby facilities fetching



  const canProceed = () => {
    // Helper to check if a string/number value is filled
    const isFilled = (val) => val !== undefined && val !== null && String(val).trim() !== '';

    if (step === 1) {
      // Basic Information: Name, Property Type, and Listing Type are required
      // Builder validation: if builder listed is selected, builder_id is required
      const basicValid = isFilled(formData.name) && isFilled(formData.propertyType) && isFilled(formData.listingType);
      if (!basicValid) return false;
      if (formData.is_builder_listed && !isFilled(formData.builder_id)) return false;
      return true;
    }

    if (step === 2) { // Property Details
      // Total Area is required for ALL property types
      if (!isFilled(formData.total_area)) {
        return false;
      }

      // Property Type Specific Validations
      const pType = getPropertyKind(formData, formOptions);

      if (pType === 'Residential') {
        // RESIDENTIAL: Need BHK selection and details (CRM style - use selectedBHKs)
        const hasBHK = (formData.selectedBHKs && formData.selectedBHKs.length > 0) || 
                       (formData.bhk && formData.bhk.length > 0);
        const hasDetails = formData.bhkDetails && formData.bhkDetails.length > 0;
        
        if (!hasBHK || !hasDetails) {
          return false;
        }
        
        // Check each BHK has bathrooms and kitchens (but be more lenient)
        return formData.bhkDetails.every(detail =>
          isFilled(detail.bathrooms) && isFilled(detail.kitchens)
        );
      }

      if (pType === 'Commercial') {
        // COMMERCIAL: Need commercial type
        return isFilled(formData.commercial_type);
      }

      if (pType === 'Industrial') {
        // INDUSTRIAL: Need industrial type
        return isFilled(formData.industrial_type);
      }

      if (pType === 'Hospitality') {
        // HOSPITALITY: Need total rooms and room types
        return isFilled(formData.total_rooms) && isFilled(formData.room_types);
      }

      if (pType === 'Land') {
        // LAND: Only total area is required (already checked above)
        return true;
      }

      // Unknown property type - don't allow proceeding
      return false;
    }

    if (step === 3) { // Features & Amenities - optional fields
      return true;
    }

    if (step === 4) { // Pricing Details
      if (formData.listingType === 'Sale') {
        // For Sale: Need at least min price (also check price_min as fallback)
        return isFilled(formData.minPrice) || isFilled(formData.price_min);
      } else if (formData.listingType === 'Rent' || formData.listingType === 'Lease') {
        // For Rent/Lease: Need monthly rent (also check rent_amount as fallback)
        return isFilled(formData.monthlyRent) || isFilled(formData.rent_amount);
      }
      // If no listing type selected, don't allow proceeding
      return false;
    }

    if (step === 5) { // Location & Compliance
      // Required fields: address_line1, city, state, zip_code, locality
      const locationValid = isFilled(formData.address_line1) && 
             isFilled(formData.city) && 
             isFilled(formData.state) && 
             isFilled(formData.zip_code) && 
             isFilled(formData.locality);
      // Check for RERA error
      if (reraError) return false;
      return locationValid;
    }

    if (step === 6) return true; // Media is optional

    if (step === 7) return true; // SEO is optional

    return false;
  };

  const addCustomBHK = () => {
    const label = customBhkInput.trim();
    if (!label) return;
    const slug = label
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, '_')
      .replace(/^_+|_+$/g, '');
    if (!slug) return;
    setFormData(prev => {
      const selected = prev.selectedBHKs || [];
      if (selected.includes(slug)) return prev;
      const nextSelected = [...selected, slug];
      const nextDetails = [
        ...(prev.bhkDetails || []),
        createBhkDetailFromType(slug, formOptions, { type: label, type_slug: slug })
      ];
      return {
        ...prev,
        selectedBHKs: nextSelected,
        bhkDetails: nextDetails,
        bhk: nextSelected,
      };
    });
    setCustomBhkInput('');
  };

  const removeBHKConfiguration = (bhkSlug) => {
    setFormData(prev => {
      const nextSelected = (prev.selectedBHKs || []).filter((item) => item !== bhkSlug);
      const nextDetails = (prev.bhkDetails || []).filter((detail) => (detail.type_slug || detail.type) !== bhkSlug);
      return {
        ...prev,
        selectedBHKs: nextSelected,
        bhkDetails: nextDetails,
        bhk: nextSelected,
      };
    });
  };

  const togglePropertyLabel = (slug) => {
    setFormData(prev => {
      const current = prev.selectedTags || [];
      const selected = current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug];
      return { ...prev, selectedTags: selected };
    });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step < STEPS.length) {
      // Check for RERA error before proceeding (only relevant for step 5+)
      if (reraError && step >= 5) {
        alert('Please fix the RERA number error before proceeding.');
        return;
      }

      setStep(step + 1);
    } else {

      // Final submission validation - check for duplicate RERA
      if (reraError) {
        alert('Please fix the RERA number error before submitting.');
        setSubmitting(false);
        return;
      }

      // If RERA is entered, verify it's not duplicate before submitting
      if (formData.rera_number && formData.rera_number.trim()) {
        try {
          const result = await propertyApi.checkReraExists(formData.rera_number.trim(), editId);
          if (result && result.exists) {
            setReraError('This RERA number is already registered. Please enter a unique RERA number.');
            alert('This RERA number is already registered. Please enter a unique RERA number.');
            setSubmitting(false);
            return;
          }
        } catch (error) {
          console.error('RERA check failed on submit:', error);
          // Continue with submission if API fails
        }
      }

      setSubmitting(true);

      try {

        let propertyId = editId;



        // Prepare payload according to new API structure

        const payload = {

          property_id: formData.property_id ? Number(formData.property_id) : null,

          listing_id: formData.listing_id ? Number(formData.listing_id) : null,

          organization_id: formData.organization_id,

          property_type_id: String(Number(formData.property_type_id) || PROPERTY_TYPE_ID_MAP[getPropertyKind(formData, formOptions)] || 1),

          property_category_id: String(Number(formData.property_category_id) || PROPERTY_CATEGORY_ID_MAP[getPropertyKind(formData, formOptions)] || 1),

          property_subtype: formData.propertySubType,

          name: formData.name,

          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),

          description: formData.description,



          // Listing details

          listing_type: formData.listingType?.toLowerCase(),

          transaction_type: formData.transaction_type,

          ownership_type: formData.ownership_type,



          rera_number: formData.rera_number,

          rera_expiry_date: formData.rera_expiry_date,



          address_line1: formData.address_line1,

          address_line2: formData.address_line2,

          city: formData.city,

          state: formData.state,

          country: (formData.country || 'IN').slice(0, 2).toUpperCase(),

          zip_code: formData.zip_code,

          locality: formData.locality,

          landmark: formData.landmark,

          latitude: formData.latitude ? parseFloat(formData.latitude) : null,

          longitude: formData.longitude ? parseFloat(formData.longitude) : null,



          total_units: parseInt(formData.total_units) || 0,

          total_floors: parseInt(formData.total_floors) || 0,

          floor_number: formData.floor_number,

          total_area: formData.total_area ? parseFloat(formData.total_area) : null,

          builtup_area: formData.builtup_area ? parseFloat(formData.builtup_area) : null,

          carpet_area: formData.carpet_area ? parseFloat(formData.carpet_area) : null,

          super_builtup_area: formData.super_builtup_area ? parseFloat(formData.super_builtup_area) : null,

          area_unit: formData.area_unit,

          year_built: formData.year_built ? parseInt(formData.year_built) : null,

          possession_date: formData.possession_date,

          age_of_property: formData.age_of_property,

          facing_direction: formData.facing,

          parking_spaces: parseInt(formData.parking_spaces) || 0,

          parking_type: formData.parking_type,



          // Additional specifications

          bhk: formData.bhk.join(', '),

          // For multi-BHK, we might want to store the details in meta or a specific field

          // For now, we'll store the first one's stats in the primary fields for compatibility

          bedrooms: parseInt(formData.bhkDetails[0]?.bedrooms) || 0,

          bathrooms: parseInt(formData.bhkDetails[0]?.bathrooms) || 0,

          kitchens: parseInt(formData.bhkDetails[0]?.kitchens) || 0,

          balconies: parseInt(formData.balconies) || 0,

          half_bathrooms: parseInt(formData.half_bathrooms) || 0,

          furnished_status: formData.furnished_status,

          construction_quality: formData.construction_quality,

          water_source: formData.water_source,

          power_backup: formData.power_backup,

          lift: formData.lift,

          rainwater_harvesting: formData.rainwater_harvesting,

          security: formData.security, // category 2

          maintenance_charges: (formData.listingType === 'Sale' ? 0 : parseFloat(formData.maintenance)) || null,

          maintenance_charges_frequency: formData.maintenance_charges_frequency,



          // Additional fields from schema

          is_verified: formData.is_verified,

          is_published: formData.is_published,

          views_count: parseInt(formData.views_count) || 0,



          // Property unit specific fields

          unit_number: formData.unit_number,

          unit_type: formData.unit_type,

          is_corner_unit: formData.is_corner_unit,

          floor_plan_url: formData.floor_plan_url,



          // Listing specific fields

          reference_no: formData.reference_no,

          available_from: formData.available_from,

          available_until: formData.available_until,

          virtual_tour_url: formData.virtual_tour_url,

          matterport_id: formData.matterport_id,

          is_exclusive: formData.is_exclusive,

          brokerage_percent: formData.brokerage_percent ? parseFloat(formData.brokerage_percent) : null,



          // Pricing information

          price_min: formData.listingType === 'Sale' ? (formData.minPrice ? parseFloat(formData.minPrice) : null) : null,

          price_max: formData.listingType === 'Sale' ? (formData.maxPrice ? parseFloat(formData.maxPrice) : null) : null,

          price_per_sqft: formData.price_per_sqft ? parseFloat(formData.price_per_sqft) : null,

          price_on_request: formData.price_on_request,

          currency: formData.currency,



          // Rental information

          rent_amount: (formData.listingType === 'Rent' || formData.listingType === 'Lease') ? (formData.monthlyRent ? parseFloat(formData.monthlyRent) : null) : null,

          rent_frequency: formData.rent_frequency,

          security_deposit: (formData.listingType === 'Rent' || formData.listingType === 'Lease') ? (formData.securityDeposit ? parseFloat(formData.securityDeposit) : null) : null,

          maintenance_deposit: formData.maintenance_deposit ? parseFloat(formData.maintenance_deposit) : null,



          // Negotiation

          negotiable: formData.negotiable,

          price_includes: formData.price_includes,



          status: formData.status,

          is_featured: formData.is_featured,

          selectedTags: formData.selectedTags || [],

          labels: formData.selectedTags || [],



          meta_title: formData.metaTitle,

          meta_description: formData.metaDescription,

          features: [...formData.amenities, ...formData.security, ...formData.utilities],

          meta: {

            ...formData.meta,

            property_type: formData.propertyType,

            property_subtype: formData.propertySubType,

            selectedTags: formData.selectedTags || [],

            categorized_amenities: {

              amenities: formData.amenities,

              security: formData.security,

              utilities: formData.utilities

            },

            distances: {

              hospital: formData.hospitalDistance,

              school: formData.schoolDistance,

              metro: formData.metroDistance,

              busStand: formData.busStandDistance,

              airport: formData.airportDistance,

              railway: formData.railwayDistance

            }

          },



          // Additional features

          amenities: [...formData.amenities, ...formData.security, ...formData.utilities].join(', '),

          nearby_facilities: formData.nearby_facilities,

          accessibility_features: formData.accessibility_features,

          pet_friendly: formData.pet_friendly,

          vegan_friendly: formData.vegan_friendly,



          created_by: user?.id || 1, // Use authenticated user ID or fallback

        };

        // Add console.log for payload debugging at submission time
        console.log('SELL PROPERTY SUBMISSION PAYLOAD:', {
          timestamp: new Date().toISOString(),
          action: editId ? 'property_update' : 'property_creation',
          page: 'SellProperty.jsx',
          user: {
            organization_id: user?.organization_id || 'N/A',
            email: user?.email || 'N/A',
            phone: user?.phone || user?.phone_number || 'N/A',
            first_name: user?.first_name || user?.firstName || 'N/A',
            last_name: user?.last_name || user?.lastName || 'N/A',
            user_id: user?.id || 'N/A'
          },
          property_payload: {
            ...payload,
            // Ensure we have the key fields
            organization_id: payload.organization_id || user?.organization_id,
            name: payload.name,
            property_type: payload.property_type_id,
            city: payload.city,
            listing_type: payload.listing_type
          }
        });

        if (editId) {

          await updateProperty(editId, payload);

        } else {

          // Use propertyApi.createFromPayload for CRM-style property creation
          const res = await propertyApi.createFromPayload(payload);

          propertyId = res.id || res.property_id || res.propertyId;

        }



        // Upload photos if any

        if (formData.photos.length > 0 && propertyId) {

          await uploadPropertyImages(propertyId, formData.photos);

        }



        alert(editId ? 'Property updated successfully!' : 'Property listed successfully!');

        navigate('/dashboard/properties');

      } catch (err) {

        alert('Failed to save property: ' + (err.message || 'Unknown error'));

      } finally {

        setSubmitting(false);

      }

    }
  };



  if (editId && !formData.propertyType && propertyLoading) {

    return <div className="flex items-center justify-center min-h-[400px]">Loading property details...</div>;

  }



  return (

    <PropertySubscriptionGuard>

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-8">

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/properties')}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:border-primary/30 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Properties
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Step {step} of {STEPS.length}
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-primary/15 bg-[linear-gradient(135deg,#B91C1C,#991B1B_58%,#111827)] p-6 shadow-[0_28px_90px_-58px_rgba(185,28,28,0.8)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-white/85">
                  <Sparkles className="h-3.5 w-3.5" />
                  Property Onboarding
                </div>
                <h1 className="mt-3 text-3xl font-bold text-white">
                  {editId ? 'Edit Your Property' : 'List Your Property'}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                  {editId ? 'Update the details of your listing with a guided Revo Homes workflow.' : 'Fill in the details to list your property and reach thousands of buyers.'}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white shadow-inner">
                  <div className="flex items-center gap-2 text-white/80">
                    <Building2 className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">
                      Current Step
                    </span>
                  </div>
                  <p className="mt-3 text-lg font-semibold">
                    {STEPS.find((item) => item.id === step)?.title}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white shadow-inner">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                    Progress
                  </p>
                  <div className="mt-3 h-2 rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white/85">
                    {completionPercentage}% complete
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Step Navigation */}
        <div className="rounded-[24px] border border-gray-200 bg-white/95 p-3 shadow-[0_24px_70px_-56px_rgba(17,24,39,0.8)]">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {STEPS.map((s, index) => (
            <div key={s.id} className="flex shrink-0 sm:flex-1 relative items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  setStep(s.id);
                  window.requestAnimationFrame(() => {
                    document.getElementById('sell-property-form')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  });
                }}
                className={`flex items-center justify-center w-full whitespace-nowrap py-2.5 px-4 rounded-full text-sm font-semibold transition-all z-10 ${
                  step === s.id 
                    ? 'bg-primary text-white shadow-[0_18px_34px_-24px_rgba(185,28,28,0.8)]' 
                    : step > s.id 
                    ? 'text-primary bg-primary/10 border border-primary/15' 
                    : 'text-gray-400 border border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-5 h-5 flex items-center justify-center rounded-full bg-black/10 text-[11px]">{s.id}</span>}
                  <span>{s.title}</span>
                </span>
              </button>
            </div>
          ))}
        </div>
        </div>

        <form id="sell-property-form" onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm scroll-mt-24">

          {step === 1 && (

            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-xl flex items-center gap-2 font-bold text-gray-900"><LayoutDashboard className="w-5 h-5 text-primary" /> Basic Information</h3>
                <p className="text-xs text-gray-500 mt-1 ml-7">Enter the primary details for your property listing.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Property Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Premium 3BHK Apartment"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Property Title Tagline</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="property_title_tagline"
                      value={formData.property_title_tagline}
                      onChange={handleChange}
                      placeholder="e.g. Stunning view from balcony"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>



              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Property Type <span className="text-red-500">*</span></label>
                  {loadingFormOptions ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : (
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={(e) => {
                        const val = e.target.value;
                        const selectedType = (formOptions.property_types || []).find((type) => getOptionLabel(type) === val);
                        const id = selectedType?.id ?? selectedType?.value ?? PROPERTY_TYPE_ID_MAP[val] ?? '';
                        setFormData(prev => ({
                          ...prev,
                          propertyType: getOptionLabel(selectedType) || val,
                          property_type_id: id,
                          property_category_id: '',
                          propertySubType: '',
                          property_subtype: '',
                          selectedBHKs: [],
                          bhkDetails: []
                        }));
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                    >
                      <option value="">Select Type</option>
                      {(formOptions.property_types || []).map((type) => {
                        const typeName = getOptionLabel(type);
                        return (
                          <option key={type.id || type.value || typeName} value={typeName}>{typeName}</option>
                        );
                      })}
                    </select>
                  )}
                  {!loadingFormOptions && (!formOptions.property_types || formOptions.property_types.length === 0) && (
                    <p className="text-xs text-red-500 mt-1">No property types available. Please check database configuration.</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Property Sub-type</label>
                  <select
                    name="propertySubType"
                    value={formData.propertySubType}
                    onChange={(e) => {
                      const selectedCategory = (formOptions.property_categories || []).find((category) => getOptionLabel(category) === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        propertySubType: getOptionLabel(selectedCategory) || e.target.value,
                        property_subtype: getOptionValue(selectedCategory) || e.target.value,
                        property_category_id: selectedCategory?.id ?? selectedCategory?.value ?? ''
                      }));
                    }}
                    disabled={!formData.propertyType}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <option value="">Select Sub-type</option>
                    {formData.propertyType && getCategoriesForSelectedType(formData, formOptions)
                      .map((category) => (
                        <option key={category.value || category.id || category.slug} value={getOptionLabel(category)}>
                          {getOptionLabel(category)}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Builder Selection moved below description */}
              {false && (
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="is_builder_listed"
                    name="is_builder_listed"
                    checked={formData.is_builder_listed}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="is_builder_listed" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Is this property listed by a builder?
                  </label>
                </div>

                {formData.is_builder_listed && (
                  <div className="pl-6 space-y-3 border-l-2 border-gray-200">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                        Select Builder {formData.is_builder_listed && <span className="text-red-500">*</span>}
                      </label>
                      <select
                        name="builder_id"
                        value={formData.builder_id}
                        onChange={(e) => {
                          const selectedBuilder = builders.find(b => String(b.id) === e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            builder_id: e.target.value,
                            builder_name: selectedBuilder?.name || ''
                          }));
                        }}
                        disabled={isLoadingBuilders || builders.length === 0}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <option value="">
                          {isLoadingBuilders ? 'Loading builders...' : builders.length === 0 ? 'No builders available' : 'Choose a builder...'}
                        </option>
                        {builders.map((builder) => (
                          <option key={builder.id} value={String(builder.id)}>
                            {builder.name} {builder.city ? `(${builder.city})` : ''}
                          </option>
                        ))}
                      </select>
                      {builders.length === 0 && !isLoadingBuilders && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800">
                            <strong>No builders found.</strong> Either no builders exist in the database or they don't have <code>type='builder'</code>.
                          </p>
                          <p className="text-xs text-yellow-600 mt-1">
                            Check browser console for API response details.
                          </p>
                        </div>
                      )}
                      {builders.length > 0 && (
                        <p className="mt-1 text-xs text-green-600">
                          {builders.length} builder(s) available
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              )}



              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Listing Type <span className="text-red-500">*</span></label>
                  <select
                    name="listingType"
                    value={formData.listingType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                  >
                    <option value="">Select Listing Type</option>
                    {propertyKind === 'Land' ? (
                      <>
                        <option value="Sale">Sale</option>
                        <option value="Lease">Lease</option>
                      </>
                    ) : (
                      <>
                        <option value="Sale">Sale</option>
                        <option value="Rent">Rent</option>
                        <option value="Lease">Lease</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Property Condition</label>
                  <select
                    name="property_condition"
                    value={formData.property_condition}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                  >
                    {(formOptions.property_condition || []).map((c) => {
                      const cValue = c.value || c.label || c;
                      const cLabel = c.label || c.value || c;
                      return (
                        <option key={cValue} value={cValue}>{cLabel}</option>
                      );
                    })}
                  </select>
                </div>
              </div>



              {/* BHK and Bathrooms removed from Step 1 */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Possession Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      name="possession_date"
                      value={formData.possession_date}
                      onChange={handleChange}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Sale Urgency</label>
                  <select
                    name="sale_urgency"
                    value={formData.sale_urgency}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                  >
                    {(formOptions.sale_urgency || []).map((u) => {
                      const uValue = u.value || u.label || u;
                      const uLabel = u.label || u.value || u;
                      return (
                        <option key={uValue} value={uValue}>{uLabel}</option>
                      );
                    })}
                  </select>
                </div>
              </div>



              <div>

                <RichTextEditor
                  label="Description"
                  required
                  value={formData.description}
                  onChange={(val) => {
                    const plainText = typeof val === 'string' ? val.replace(/<[^>]+>/g, '').trim() : '';
                    const newMeta = plainText.substring(0, 160);
                    setFormData(prev => ({ 
                      ...prev, 
                      description: val,
                      metaDescription: newMeta 
                    }));
                  }}
                />

              </div>

              {/* Builder Selection - New from CRM */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="is_builder_listed"
                    name="is_builder_listed"
                    checked={formData.is_builder_listed}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="is_builder_listed" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Is this property listed by a builder?
                  </label>
                </div>

                {formData.is_builder_listed && (
                  <div className="pl-6 space-y-3 border-l-2 border-gray-200">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                        Select Builder {formData.is_builder_listed && <span className="text-red-500">*</span>}
                      </label>
                      <select
                        name="builder_id"
                        value={formData.builder_id}
                        onChange={(e) => {
                          const selectedBuilder = builders.find(b => String(b.id) === e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            builder_id: e.target.value,
                            builder_name: selectedBuilder?.name || ''
                          }));
                        }}
                        disabled={isLoadingBuilders || builders.length === 0}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <option value="">
                          {isLoadingBuilders ? 'Loading builders...' : builders.length === 0 ? 'No builders available' : 'Choose a builder...'}
                        </option>
                        {builders.map((builder) => (
                          <option key={builder.id} value={String(builder.id)}>
                            {builder.name} {builder.city ? `(${builder.city})` : ''}
                          </option>
                        ))}
                      </select>
                      {builders.length === 0 && !isLoadingBuilders && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800">
                            <strong>No builders found.</strong> Either no builders exist in the database or they don't have <code>type='builder'</code>.
                          </p>
                        </div>
                      )}
                      {builders.length > 0 && (
                        <p className="mt-1 text-xs text-green-600">
                          {builders.length} builder(s) available
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-xl flex items-center gap-2 font-bold text-gray-900"><LayoutDashboard className="w-5 h-5 text-primary" /> Category Details</h3>
                <p className="text-xs text-gray-500 mt-1 ml-7">
                  Showing fields for {formData.propertyType || 'the selected property type'}
                  {formData.propertySubType ? ` / ${formData.propertySubType}` : ''}.
                </p>
              </div>

              {/* Common Fields for All Property Types */}
              {propertyKind !== 'Residential' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Total Area <span className="text-red-500">*</span></label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      name="total_area"
                      value={formData.total_area}
                      onChange={handleChange}
                      placeholder="e.g. 1200"
                      className="flex-1 min-w-0 px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                    />
                    <div className="w-[110px] flex-shrink-0">
                      <select
                        name="area_unit"
                        value={formData.area_unit}
                        onChange={handleChange}
                        className="w-full px-2 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                      >
                        {getAreaUnitOptions(formOptions).map((unit) => {
                          const unitValue = unit.value;
                          const unitLabel = unit.label;
                          return (
                            <option key={unitValue} value={unitValue}>{unitLabel}</option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
                {(propertyKind !== 'Land') && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Total Built-up Area</label>
                    <input
                      type="number"
                      name="builtup_area"
                      value={formData.builtup_area}
                      onChange={handleChange}
                      placeholder="e.g. 1400"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                    />
                  </div>
                )}
              </div>
              )}

              {/* Property Type-Specific Fields */}

              {/* Residential Fields */}
              {propertyKind === 'Residential' && (
                <div className="border-t border-gray-100 pt-6 mt-6 space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Residential Details</h3>

                  {/* BHK Configuration - CRM Style */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 ml-1">BHK Configuration (Select Multiple) <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {(formOptions.bhk || formOptions.bhk_options || []).map((b) => {
                        const bhkValue = typeof b === 'object' ? (b.value || b.option_key || b.label) : b;
                        const bhkLabel = typeof b === 'object' ? (b.label || b.value || b.option_key || b) : b;
                        const bhkSlug = typeof b === 'object' ? (b.slug || b.value || b.option_key) : b;
                        const isSelected = formData.selectedBHKs?.includes(bhkSlug) || formData.bhk?.includes(bhkValue);
                        return (
                          <button
                            key={bhkSlug || bhkValue}
                            type="button"
                            onClick={() => toggleBHK(bhkSlug || bhkValue)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border flex items-center gap-2 ${isSelected
                                ? 'bg-primary text-white border-primary shadow-md'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                              }`}
                          >
                            <Home size={16} />
                            {bhkLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* BHK Detail Cards */}
                  <div className="space-y-6">
                    {formData.bhkDetails.map((detail, index) => (
                      <div key={detail.type} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-50 text-red-600 flex items-center justify-center rounded-2xl font-black text-lg">
                              {detail.type.split(' ')[0]}
                            </div>
                            <div>
                              <h4 className="text-xl font-black text-gray-900">{detail.type} Configuration</h4>
                              <p className="text-sm text-gray-400 font-bold">Manage details for {detail.type} units</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeBHKConfiguration(detail.type_slug || detail.type)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition-all hover:bg-red-600 hover:text-white"
                            title="Remove configuration"
                            aria-label="Remove configuration"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        {/* BHK Configuration Fields - CRM Style */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Bedrooms - Read only */}
                          <div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                              <BedDouble size={14} className="text-red-600" />
                              Bedrooms
                            </label>
                            <input
                              type="number"
                              value={detail.bedrooms}
                              readOnly
                              className="w-full px-5 py-4 bg-gray-100 border-none rounded-2xl font-bold text-gray-500 cursor-not-allowed"
                            />
                          </div>

                          {/* Bathrooms */}
                          <div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                              <Bath size={14} className="text-red-600" />
                              Bathrooms *
                            </label>
                            <select
                              value={detail.bathrooms || ''}
                              onChange={(e) => updateBHKDetail(index, 'bathrooms', e.target.value)}
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                            >
                              <option value="">Select Bathrooms</option>
                              {[1, 2, 3, 4, 5, '6+'].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </div>

                          {/* Kitchens */}
                          <div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                              <Utensils size={14} className="text-red-600" />
                              Kitchens *
                            </label>
                            <select
                              value={detail.kitchens || ''}
                              onChange={(e) => updateBHKDetail(index, 'kitchens', e.target.value)}
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                            >
                              <option value="">Select Kitchens</option>
                              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </div>

                          {/* Halls - For 2+ BHK */}
                          {getBhkFieldVisibility(detail.type_slug || detail.type).showHallField && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Hall</label>
                              <select
                                value={detail.halls || '1'}
                                onChange={(e) => updateBHKDetail(index, 'halls', e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                              >
                                {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                            </div>
                          )}

                          {/* Balconies */}
                          {getBhkFieldVisibility(detail.type_slug || detail.type).showBalconyField && (
                            <div>
                              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                                <Wind size={14} className="text-red-600" />
                                Balcony
                              </label>
                              <select
                                value={detail.balconies || '0'}
                                onChange={(e) => updateBHKDetail(index, 'balconies', e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                              >
                                {[0, 1, 2, 3, 4, '5+'].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                            </div>
                          )}

                          {/* Terrace - For 2+ BHK */}
                          {getBhkFieldVisibility(detail.type_slug || detail.type).showTerraceField && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Terrace</label>
                              <select
                                value={detail.terrace || '0'}
                                onChange={(e) => updateBHKDetail(index, 'terrace', e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                              >
                                {[0, 1, 2].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                            </div>
                          )}
                        </div>

                        <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                            Add Custom Configuration
                          </label>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                              type="text"
                              value={customBhkInput}
                              onChange={(e) => setCustomBhkInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addCustomBHK();
                                }
                              }}
                              placeholder="Add custom configuration, e.g. 2.5 BHK"
                              className="min-w-0 flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={addCustomBHK}
                              className="px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-primary transition-all shadow-sm"
                            >
                              Add Custom
                            </button>
                          </div>
                        </div>

                        {/* Per-BHK Configuration Details - New from CRM */}
                        <div className="mt-6 p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">📦</span>
                            <p className="text-sm font-semibold text-gray-900">Configuration-Specific Details</p>
                          </div>

                          {/* Smart summary display */}
                          {(detail.carpet_area || detail.price) && (
                            <div className="mb-4 px-3 py-2 bg-white rounded-lg text-xs font-medium text-gray-600 border border-gray-200">
                              {detail.type} • {detail.price ? `₹${Number(detail.price).toLocaleString('en-IN')}` : 'Price not set'} • {detail.carpet_area ? `${detail.carpet_area} sqft` : 'Area not set'}
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Carpet Area */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Carpet Area (sqft)</label>
                              <input
                                type="number"
                                value={detail.carpet_area || ''}
                                onChange={(e) => updateBHKDetail(index, 'carpet_area', e.target.value)}
                                placeholder="1200"
                                min="0"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                              />
                            </div>

                            {/* Built-up Area */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Built-up Area (sqft)</label>
                              <input
                                type="number"
                                value={detail.builtup_area || ''}
                                onChange={(e) => updateBHKDetail(index, 'builtup_area', e.target.value)}
                                placeholder="1400"
                                min="0"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                              />
                            </div>

                            {/* Price per Unit */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Price (₹)</label>
                              <input
                                type="number"
                                value={detail.price || ''}
                                onChange={(e) => updateBHKDetail(index, 'price', e.target.value)}
                                placeholder="6500000"
                                min="0"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                              />
                            </div>

                            {/* Floor Number */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Floor Number</label>
                              <input
                                type="number"
                                value={detail.floor_number || ''}
                                onChange={(e) => updateBHKDetail(index, 'floor_number', e.target.value)}
                                placeholder="0 (Ground)"
                                min="0"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                              />
                            </div>

                            {/* Furnishing Status */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Furnishing Status</label>
                              <select
                                value={detail.furnishing_status || ''}
                                onChange={(e) => updateBHKDetail(index, 'furnishing_status', e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                              >
                                <option value="">Select furnishing</option>
                                {(formOptions.furnishing_status || []).map((f) => {
                                  const val = f.value || f.key || f.label || f;
                                  const label = f.label || f.key || f.value || f;
                                  return <option key={val} value={val}>{label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>;
                                })}
                              </select>
                            </div>

                            {/* Unit Name */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Unit Name</label>
                              <input
                                type="text"
                                value={detail.unit_name || ''}
                                onChange={(e) => updateBHKDetail(index, 'unit_name', e.target.value)}
                                placeholder="e.g. A-1203"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                              />
                            </div>
                          </div>

                          {/* Additional Space (for half BHK) */}
                          {getBhkFieldVisibility(detail.type_slug || detail.type).showAdditionalSpaceField && (
                            <div className="mt-4">
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Additional Space Description</label>
                              <textarea
                                value={detail.additionalSpace === '0' ? '' : (detail.additionalSpace || '')}
                                onChange={(e) => updateBHKDetail(index, 'additionalSpace', e.target.value)}
                                placeholder="Describe study room, puja room, or extra space..."
                                rows={2}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm resize-none"
                              />
                            </div>
                          )}
                        </div>

                        {/* Floor Plan Upload for this BHK Type */}
                        <div className="mt-8 pt-8 border-t border-gray-50">
                          {/* Header matching Photos & Media style */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-50 text-gray-400 flex items-center justify-center rounded-[18px]">
                                <Upload size={24} />
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-gray-900">Floor Plan (PDF/Image) - {detail.type}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detailed floor layout</p>
                              </div>
                            </div>
                            
                            {/* Upload New Button */}
                            <div className="relative group overflow-hidden">
                              <button
                                type="button"
                                className="px-6 py-3 bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-primary transition-all shadow-lg shadow-gray-900/10"
                              >
                                Upload New
                              </button>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const updatedDetails = [...formData.bhkDetails];
                                    updatedDetails[index].floorPlan = file;
                                    updatedDetails[index].floorPlanPreview = URL.createObjectURL(file);
                                    setFormData(prev => ({ ...prev, bhkDetails: updatedDetails }));
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* File Preview or Empty State */}
                          {detail.floorPlanPreview ? (
                            <div className="max-w-sm">
                              <div className="relative group bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-50 mb-3 border border-gray-50">
                                  {(detail.floorPlan?.type?.startsWith('image/') || detail.floorPlanPreview.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                                    <img src={detail.floorPlanPreview} alt="Floor Plan Preview" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                      <FileText size={40} className="text-gray-200" />
                                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Document</span>
                                    </div>
                                  )}

                                  {/* Edit/Delete Overlay */}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                    <button
                                      type="button"
                                      onClick={() => document.getElementById(`floor-plan-replace-${index}`).click()}
                                      className="w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-xl backdrop-blur-md transition-all flex items-center justify-center"
                                      title="Replace File"
                                    >
                                      <Edit2 size={18} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedDetails = [...formData.bhkDetails];
                                        URL.revokeObjectURL(updatedDetails[index].floorPlanPreview);
                                        updatedDetails[index].floorPlan = null;
                                        updatedDetails[index].floorPlanPreview = null;
                                        setFormData(prev => ({ ...prev, bhkDetails: updatedDetails }));
                                      }}
                                      className="w-10 h-10 bg-red-500/80 hover:bg-red-500 text-white rounded-xl backdrop-blur-md transition-all flex items-center justify-center"
                                      title="Remove File"
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>
                                </div>

                                <div className="px-1">
                                  <p className="text-[11px] font-bold text-gray-500 truncate mb-1">{detail.floorPlan?.name || 'Floor Plan'}</p>
                                  <div className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${(detail.floorPlan?.type?.startsWith('image/') || detail.floorPlanPreview.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? 'bg-orange-400' : 'bg-blue-400'}`}></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                      {(detail.floorPlan?.type?.startsWith('image/') || detail.floorPlanPreview.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? 'Image' : 'PDF / Document'}
                                    </span>
                                  </div>
                                </div>

                                {/* Hidden input for replacement */}
                                <input
                                  type="file"
                                  id={`floor-plan-replace-${index}`}
                                  onChange={(e) => {
                                    const newFile = e.target.files?.[0];
                                    if (newFile) {
                                      const updatedDetails = [...formData.bhkDetails];
                                      URL.revokeObjectURL(updatedDetails[index].floorPlanPreview);
                                      updatedDetails[index].floorPlan = newFile;
                                      updatedDetails[index].floorPlanPreview = URL.createObjectURL(newFile);
                                      setFormData(prev => ({ ...prev, bhkDetails: updatedDetails }));
                                    }
                                  }}
                                  accept="image/*,application/pdf"
                                  className="hidden"
                                />
                              </div>
                            </div>
                          ) : (
                            /* Empty State - No files uploaded yet */
                            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[28px] bg-gray-50/50">
                              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                <Upload size={24} className="text-gray-300" />
                              </div>
                              <p className="text-sm font-bold text-gray-400">No files uploaded yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-gray-900">Property Area</h4>
                      <p className="text-xs text-gray-500">Add the overall property area after floor plan details.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Total Area <span className="text-red-500">*</span></label>
                        <div className="flex gap-3">
                          <input
                            type="number"
                            name="total_area"
                            value={formData.total_area}
                            onChange={handleChange}
                            placeholder="e.g. 1200"
                            className="flex-1 min-w-0 px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                          />
                          <div className="w-[110px] flex-shrink-0">
                            <select
                              name="area_unit"
                              value={formData.area_unit}
                              onChange={handleChange}
                              className="w-full px-2 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                            >
                              {getAreaUnitOptions(formOptions).map((unit) => {
                                const unitValue = unit.value;
                                const unitLabel = unit.label;
                                return (
                                  <option key={unitValue} value={unitValue}>{unitLabel}</option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Total Built-up Area</label>
                        <input
                          type="number"
                          name="builtup_area"
                          value={formData.builtup_area}
                          onChange={handleChange}
                          placeholder="e.g. 1400"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Residential Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Total Floors</label>
                      <input
                        type="number"
                        name="total_floors"
                        value={formData.total_floors}
                        onChange={handleChange}
                        placeholder="e.g. 10"
                        min="0"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Floor Number</label>
                      <input
                        type="text"
                        name="floor_number"
                        value={formData.floor_number}
                        onChange={handleChange}
                        placeholder="e.g. 5"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Property Age</label>
                      <select
                        name="age_of_property"
                        value={formData.age_of_property}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        {(formOptions.property_age || []).map((age) => {
                          const ageValue = age.value || age.label || age;
                          const ageLabel = age.label || age.value || age;
                          return (
                            <option key={ageValue} value={ageValue}>{ageLabel}</option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Gated Society</label>
                      <select
                        name="gated_society"
                        value={formData.gated_society}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Maintenance Charges</label>
                      <input
                        type="number"
                        name="maintenance_charges"
                        value={formData.maintenance_charges}
                        onChange={handleChange}
                        placeholder="e.g. 2000"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Facing Direction for Plots and Houses */}
                  {["Plot", "Residential Plot", "Independent House", "Villa"].includes(formData.propertySubType) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Facing Direction</label>
                        <select
                          name="facing"
                          value={formData.facing}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                        >
                          <option value="">Select Direction</option>
                          {(formOptions.facing_direction || []).map((dir) => {
                            const dirValue = dir.value || dir.label || dir;
                            const dirLabel = dir.label || dir.value || dir;
                            return (
                              <option key={dirValue} value={dirValue}>{dirLabel.charAt(0).toUpperCase() + dirLabel.slice(1)}</option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Commercial Fields */}
              {propertyKind === 'Commercial' && (
                <div className="border-t border-gray-100 pt-8 mt-8 space-y-8">
                  <h3 className="text-xl font-black text-gray-900 mb-6">Commercial Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Floor Number</label>
                      <input
                        type="text"
                        name="floor_number"
                        value={formData.floor_number}
                        onChange={handleChange}
                        placeholder="e.g. 3"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Property Age</label>
                      <select
                        name="age_of_property"
                        value={formData.age_of_property}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        {(formOptions.property_age || []).map((age) => {
                          const ageValue = age.value || age.label || age;
                          const ageLabel = age.label || age.value || age;
                          return (
                            <option key={ageValue} value={ageValue}>{ageLabel}</option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Commercial Type *</label>
                      <select
                        name="commercial_type"
                        value={formData.commercial_type}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select Type</option>
                        <option value="office">Office</option>
                        <option value="retail">Retail</option>
                        <option value="showroom">Showroom</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Washroom Availability</label>
                      <select
                        name="washrooms"
                        value={formData.washrooms}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        {[1, 2, 3, 4, 5, '6+'].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Visibility</label>
                      <select
                        name="visibility"
                        value={formData.visibility}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="main_road">Main Road</option>
                        <option value="inside">Inside</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Footfall / Visibility Tag</label>
                      <select
                        name="footfall_tag"
                        value={formData.footfall_tag}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Cabin / Open Space Option</label>
                      <select
                        name="cabin_option"
                        value={formData.cabin_option}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="cabin">Cabin</option>
                        <option value="open_space">Open Space</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Land/Plot Fields */}
              {propertyKind === 'Land' && (
                <div className="border-t border-gray-100 pt-8 mt-8 space-y-8">
                  <h3 className="text-xl font-black text-gray-900 mb-6">Land / Plot Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Plot Length</label>
                      <input
                        type="number"
                        name="plot_length"
                        value={formData.plot_length}
                        onChange={handleChange}
                        placeholder="e.g. 50"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Plot Width</label>
                      <input
                        type="number"
                        name="plot_width"
                        value={formData.plot_width}
                        onChange={handleChange}
                        placeholder="e.g. 40"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Plot Area *</label>
                      <div className="flex gap-4">
                        <input
                          type="number"
                          name="total_area"
                          value={formData.total_area}
                          onChange={handleChange}
                          placeholder="e.g. 2000"
                          className="flex-1 min-w-0 px-5 py-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:outline-none focus:ring-primary font-bold transition-all"
                        />
                        <div className="w-[110px] flex-shrink-0">
                          <select
                            name="area_unit"
                            value={formData.area_unit}
                            onChange={handleChange}
                            className="w-full px-2 py-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:outline-none focus:ring-primary font-bold appearance-none transition-all text-center tracking-tight"
                          >
                            {getAreaUnitOptions(formOptions).map((unit) => {
                              const unitValue = unit.value;
                              const unitLabel = unit.label;
                              return (
                                <option key={unitValue} value={unitValue}>{unitLabel}</option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Facing</label>
                      <select
                        name="facing"
                        value={formData.facing}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select Direction</option>
                        {(formOptions.facing_direction || []).map((dir) => {
                          const dirValue = dir.value || dir.label || dir;
                          const dirLabel = dir.label || dir.value || dir;
                          return (
                            <option key={dirValue} value={dirValue}>{dirLabel.charAt(0).toUpperCase() + dirLabel.slice(1)}</option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Road Access / Width</label>
                      <input
                        type="text"
                        name="road_access"
                        value={formData.road_access}
                        onChange={handleChange}
                        placeholder="e.g. 30 ft road access"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Boundary Wall</label>
                      <select
                        name="boundary_wall"
                        value={formData.boundary_wall}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Water Availability</label>
                      <select
                        name="water_source"
                        value={formData.water_source}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="municipal">Municipal</option>
                        <option value="borewell">Borewell</option>
                        <option value="well">Well</option>
                        <option value="tanker">Tanker</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Electricity Availability</label>
                      <select
                        name="electricity_availability"
                        value={formData.electricity_availability}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="available">Available</option>
                        <option value="not_available">Not Available</option>
                        <option value="partial">Partial</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Plot Type</label>
                      <select
                        name="plot_type"
                        value={formData.plot_type}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="corner">Corner</option>
                        <option value="regular">Regular</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Gated Plot</label>
                      <select
                        name="gated_plot"
                        value={formData.gated_plot}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>

                </div>
              )}

              {/* Industrial Fields */}
              {propertyKind === 'Industrial' && (
                <div className="border-t border-gray-100 pt-8 mt-8 space-y-8">
                  <h3 className="text-xl font-black text-gray-900 mb-6">Industrial Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Ceiling Height (ft)</label>
                      <input
                        type="number"
                        name="ceiling_height"
                        value={formData.ceiling_height}
                        onChange={handleChange}
                        placeholder="e.g. 20"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Power Supply (Phase / Load)</label>
                      <input
                        type="text"
                        name="power_supply"
                        value={formData.power_supply}
                        onChange={handleChange}
                        placeholder="e.g. 3 Phase 100 KVA"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Industrial Type *</label>
                      <select
                        name="industrial_type"
                        value={formData.industrial_type}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select Type</option>
                        <option value="factory">Factory</option>
                        <option value="warehouse">Warehouse</option>
                        <option value="shed">Industrial Shed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Loading Dock</label>
                      <select
                        name="loading_dock"
                        value={formData.loading_dock}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Truck Access</label>
                      <select
                        name="truck_access"
                        value={formData.truck_access}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Washroom</label>
                      <select
                        name="washrooms"
                        value={formData.washrooms}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        {[1, 2, 3, 4, 5, '6+'].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Office Space Availability</label>
                      <select
                        name="office_space"
                        value={formData.office_space}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Fire Safety Compliance</label>
                      <select
                        name="fire_safety"
                        value={formData.fire_safety}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="compliant">Compliant</option>
                        <option value="not_compliant">Not Compliant</option>
                        <option value="partial">Partial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Flooring Type</label>
                      <select
                        name="flooring_type"
                        value={formData.flooring_type}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="concrete">Concrete</option>
                        <option value="tiles">Tiles</option>
                        <option value="epoxy">Epoxy</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Hospitality Fields */}
              {propertyKind === 'Hospitality' && (
                <div className="border-t border-gray-100 pt-8 mt-8 space-y-8">
                  <h3 className="text-xl font-black text-gray-900 mb-6">Hospitality Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Total Rooms *</label>
                      <input
                        type="number"
                        name="total_rooms"
                        value={formData.total_rooms}
                        onChange={handleChange}
                        placeholder="e.g. 50"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Room Types *</label>
                      <select
                        name="room_types"
                        value={formData.room_types}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="standard">Standard</option>
                        <option value="deluxe">Deluxe</option>
                        <option value="suite">Suite</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Occupancy Type</label>
                      <select
                        name="occupancy_type"
                        value={formData.occupancy_type}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Food Included</label>
                      <select
                        name="food_included"
                        value={formData.food_included}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Operational Status</label>
                      <select
                        name="operational_status"
                        value={formData.operational_status}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="running">Running</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Common Fields for Non-Land Properties */}
              {propertyKind !== 'Land' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Furnishing Status</label>
                      <select
                        name="furnished_status"
                        value={formData.furnished_status}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                      >
                        {(formOptions.furnishing_status || []).map((status) => {
                          const statusValue = status.value || status.key || status.label || status;
                          const statusLabel = status.label || status.key || status.value || status;
                          return (
                            <option key={statusValue} value={statusValue}>
                              {statusLabel.replace(/_/g, ' ').charAt(0).toUpperCase() + statusLabel.replace(/_/g, ' ').slice(1)}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Water Supply Type</label>
                    <select
                      name="water_source"
                      value={formData.water_source}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                    >
                      {(formOptions.water_source || []).map((source) => {
                        const sourceValue = source.value || source.label || source;
                        const sourceLabel = source.label || source.value || source;
                        return (
                          <option key={sourceValue} value={sourceValue}>
                            {sourceLabel.charAt(0).toUpperCase() + sourceLabel.slice(1)}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Parking for Residential, Commercial, Hospitality */}
                  {(['Residential', 'Commercial', 'Hospitality'].includes(propertyKind)) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Parking Type</label>
                        <select
                          name="parking_type"
                          value={formData.parking_type}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                        >
                          {(formOptions.parking_type || []).map((type) => {
                            const typeValue = type.value || type.label || type;
                            const typeLabel = type.label || type.value || type;
                            return (
                              <option key={typeValue} value={typeValue}>
                                {typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1).replace('_', ' ')}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Parking Count</label>
                        <input
                          type="number"
                          name="parking_spaces"
                          value={formData.parking_spaces}
                          onChange={handleChange}
                          placeholder="e.g. 2"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Power Backup for Residential, Commercial, Hospitality */}
                  {(['Residential', 'Commercial', 'Hospitality'].includes(propertyKind)) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Power Backup</label>
                        <select
                          name="power_backup"
                          value={formData.power_backup}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                        >
                          <option value="">Select</option>
                          <option value="full">Full</option>
                          <option value="partial">Partial</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Lift for Residential, Commercial, Hospitality */}
                  {(['Residential', 'Commercial', 'Hospitality'].includes(propertyKind)) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Lift</label>
                        <select
                          name="lift"
                          value={formData.lift}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                        >
                          <option value="">Select</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Amenities for Residential, Commercial, Hospitality */}
                  <div className="mt-8">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6 font-black underline decoration-red-600 decoration-4 underline-offset-8">Property Amenities</label>
                    <CategorizedAmenities
                      formData={formData}
                      onChange={(category, newList) => setFormData(prev => ({ ...prev, [category]: newList }))}
                      propertyType={formData.propertyType}
                    />
                  </div>
                </>
              )}

            </div>

          )}



          {/* Specifications removed from flow */}
          {false && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-xl flex items-center gap-2 font-bold text-gray-900"><LayoutDashboard className="w-5 h-5 text-primary" /> Specifications</h3>
                <p className="text-xs text-gray-500 mt-1 ml-7">Project details, dimensions, and additional specifications.</p>
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Total Units</label>
                  <input
                    type="number"
                    name="total_units"
                    value={formData.total_units}
                    onChange={handleChange}
                    placeholder="e.g. 120"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Total Floors</label>
                  <input
                    type="number"
                    name="total_floors"
                    value={formData.total_floors}
                    onChange={handleChange}
                    placeholder="e.g. 15"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Project Area</label>
                  <input
                    type="number"
                    name="total_area"
                    value={formData.total_area}
                    onChange={handleChange}
                    placeholder="e.g. 50000"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Year Built</label>
                  <input
                    type="number"
                    name="year_built"
                    value={formData.year_built}
                    onChange={handleChange}
                    placeholder="e.g. 2024"
                    min="1900"
                    max="2099"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Facing Direction</label>
                  <select
                    name="facing_direction"
                    value={formData.facing_direction}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                  >
                    <option value="">Select direction</option>
                    {(formOptions.facing_direction || []).map((d) => {
                      const val = d.value || d.label || d;
                      const label = d.label || d.value || d;
                      return <option key={val} value={val}>{label}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Construction Quality</label>
                  <select
                    name="construction_quality"
                    value={formData.construction_quality}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
              </div>

              {/* Property Features Checkboxes */}
              {false && (
              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Property Features</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'power_backup', label: '⚡ Power Backup' },
                    { key: 'lift_available', label: '🛗 Lift / Elevator' },
                    { key: 'rainwater_harvesting', label: '💧 Rainwater Harvesting' },
                    { key: 'security_24x7', label: '🔒 24/7 Security' },
                    { key: 'pet_friendly', label: '🐕 Pet Friendly' },
                    { key: 'vegan_friendly', label: '🌿 Vegan Friendly' },
                    { key: 'is_corner_unit', label: '📐 Corner Unit / Plot' },
                    { key: 'vaastu_compliance', label: '🏛️ Vaastu Compliant' },
                    { key: 'smart_home_features', label: '🏠 Smart Home' },
                  ].map((feat) => (
                    <label
                      key={feat.key}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:bg-primary/5 has-[:checked]:border-primary"
                    >
                      <input
                        type="checkbox"
                        name={feat.key}
                        checked={formData[feat.key] || false}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-gray-700">{feat.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              )}
            </div>
          )}

          {/* Step 3: Features & Amenities */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-xl flex items-center gap-2 font-bold text-gray-900"><LayoutDashboard className="w-5 h-5 text-primary" /> Features & Amenities</h3>
                <p className="text-xs text-gray-500 mt-1 ml-7">Choose amenities and feature flags for this property category.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'power_backup', label: 'Power Backup' },
                  { key: 'lift_available', label: 'Lift / Elevator' },
                  { key: 'rainwater_harvesting', label: 'Rainwater Harvesting' },
                  { key: 'security_24x7', label: '24/7 Security' },
                  { key: 'pet_friendly', label: 'Pet Friendly' },
                  { key: 'vegan_friendly', label: 'Vegan Friendly' },
                  { key: 'is_corner_unit', label: 'Corner Unit / Plot' },
                  { key: 'vaastu_compliance', label: 'Vaastu Compliant' },
                  { key: 'smart_home_features', label: 'Smart Home' },
                ].map((feat) => (
                  <label
                    key={feat.key}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:bg-primary/5 has-[:checked]:border-primary"
                  >
                    <input
                      type="checkbox"
                      name={feat.key}
                      checked={formData[feat.key] || false}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">{feat.label}</span>
                  </label>
                ))}
              </div>

              {(['Residential', 'Commercial', 'Hospitality'].includes(propertyKind)) && (
                <div className="border-t border-gray-100 pt-8">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6 underline decoration-red-600 decoration-4 underline-offset-8">Category Amenities</label>
                  <CategorizedAmenities
                    formData={formData}
                    onChange={(category, newList) => setFormData(prev => ({ ...prev, [category]: newList }))}
                    propertyType={formData.propertyType}
                  />
                </div>
              )}

              <div className="border-t border-gray-100 pt-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      Property Labels
                    </h4>
                    <p className="mt-1 text-xs text-gray-500">Choose CRM-style labels to highlight this property on listing cards.</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    {(formData.selectedTags || []).length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PROPERTY_LABEL_OPTIONS.map((label) => {
                    const isSelected = (formData.selectedTags || []).includes(label.slug);
                    return (
                      <button
                        key={label.slug}
                        type="button"
                        onClick={() => togglePropertyLabel(label.slug)}
                        className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-gray-100 bg-white hover:border-primary/25 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white text-xs font-black ${label.color}`}>
                          {label.name.slice(0, 1)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-gray-900">{label.name}</span>
                          <span className="block text-xs text-gray-500">{label.note}</span>
                        </span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>

                {(formData.selectedTags || []).includes('sold_out') && (
                  <div className="mt-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                    Sold Out will be treated as the primary label on the property card.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Pricing Details */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Pricing Section */}
              <div className="space-y-8">
                <h3 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-4">Pricing Details</h3>



                {formData.listingType === 'Sale' ? (

                  <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div>

                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Min Price (INR) *</label>

                        <input

                          type="number"

                          name="minPrice"

                          value={formData.minPrice}

                          onChange={handleChange}

                          placeholder="e.g. 5000000"

                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"

                        />

                      </div>

                      <div>

                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Max Price (INR) *</label>

                        <input

                          type="number"

                          name="maxPrice"

                          value={formData.maxPrice}

                          onChange={handleChange}

                          placeholder="e.g. 7000000"

                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"

                        />

                      </div>

                    </div>

                    <div>

                      <label className="flex items-center gap-3 p-4 bg-gray-100 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">

                        <input

                          type="checkbox"

                          name="negotiable"

                          checked={formData.negotiable}

                          onChange={handleChange}

                          className="w-5 h-5 rounded-lg border-none bg-white text-primary focus:outline-none focus:ring-primary transition-all"

                        />

                        <span className="text-sm font-bold text-gray-600">Price is Negotiable</span>

                      </label>

                    </div>

                  </div>

                ) : (formData.listingType === 'Rent' || formData.listingType === 'Lease') && (

                  <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div>

                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Monthly Rent (INR) *</label>

                        <input

                          type="number"

                          name="monthlyRent"

                          value={formData.monthlyRent}

                          onChange={handleChange}

                          placeholder="e.g. 25000"

                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"

                        />

                      </div>

                      <div>

                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Security Deposit (INR)</label>

                        <input

                          type="number"

                          name="securityDeposit"

                          value={formData.securityDeposit}

                          onChange={handleChange}

                          placeholder="e.g. 100000"

                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"

                        />

                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div>

                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Maintenance Charges (INR)</label>

                        <input

                          type="number"

                          name="maintenance"

                          value={formData.maintenance}

                          onChange={handleChange}

                          placeholder="e.g. 3000"

                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"

                        />

                      </div>

                      <div className="flex items-end">

                        <label className="flex items-center gap-3 p-4 bg-gray-100 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all w-full">

                          <input

                            type="checkbox"

                            name="negotiable"

                            checked={formData.negotiable}

                            onChange={handleChange}

                            className="w-5 h-5 rounded-lg border-none bg-white text-primary focus:outline-none focus:ring-primary transition-all"

                          />

                          <span className="text-sm font-bold text-gray-600">Rent is Negotiable</span>

                        </label>

                      </div>

                    </div>

                  </div>

                )}

              </div>



              {/* SEO Section */}

              {false && (
              <div className="space-y-6 pt-12 border-t border-gray-100 mt-12">

                <h3 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-4">SEO Details</h3>



                <div className="space-y-6">

                  <div>

                    <div className="flex justify-between items-center mb-2">

                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400">Meta Title</label>

                      <span className={`text-[10px] font-black ${formData.metaTitle.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>

                        {formData.metaTitle.length} / 60

                      </span>

                    </div>

                    <input

                      type="text"

                      name="metaTitle"

                      value={formData.metaTitle}

                      onChange={(e) => {

                        if (e.target.value.length <= 60) handleChange(e);

                      }}

                      placeholder="Brief SEO title for the property"

                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"

                    />

                  </div>



                  <div>
                    <div className="flex justify-between items-center mb-1.5 ml-1">
                      <label className="block text-xs font-semibold text-gray-600">Meta Description</label>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.metaDescription.length > 160 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                        {formData.metaDescription.length} / 160
                      </span>
                    </div>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) => {
                        if (e.target.value.length <= 160) handleChange(e);
                      }}
                      rows={4}
                      placeholder="Short summary for search results..."
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm resize-none"
                    />
                  </div>

                </div>

              </div>
              )}

            </div>

          )}



          {/* Step 5: Location & Compliance */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-xl flex items-center gap-2 font-bold text-gray-900"><MapPin className="w-5 h-5 text-primary" /> Location & Compliance</h3>
                <p className="text-xs text-gray-500 mt-1 ml-7">Property location and legal compliance details.</p>
              </div>

              {/* Location Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Address Line 1 *</label>
                  <input
                    type="text"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleChange}
                    placeholder="e.g. 123, Main Street"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Address Line 2</label>
                  <input
                    type="text"
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleChange}
                    placeholder="e.g. Near Landmark"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Bangalore"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. Odisha"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Country</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                    >
                      <option value="IN">India</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">ZIP Code *</label>
                    <input
                      type="text"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleChange}
                      placeholder="e.g. 560001"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Locality *</label>
                    <input
                      type="text"
                      name="locality"
                      value={formData.locality}
                      onChange={handleChange}
                      placeholder="e.g. Koramangala"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      placeholder="e.g. Near Metro Station"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="e.g. 12.9716"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="e.g. 77.5946"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Nearby Connectivity - CRM Style */}
              <div className="mb-6 border-t border-gray-100 pt-8 mt-8">
                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Nearby Connectivity</label>
                <p className="text-xs text-gray-500 mb-4">Add distance for metro station, bus stand, railway station, and more.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* CRM-style distance fields with custom option */}
                  {[
                    { label: 'Near Metro Station', field: 'near_metro_distance', customField: 'near_metro_distance_custom' },
                    { label: 'Near Railway Station', field: 'near_railway_distance', customField: 'near_railway_distance_custom' },
                    { label: 'Near Bus Stand', field: 'near_busstand_distance', customField: 'near_busstand_distance_custom' },
                    { label: 'Near Airport', field: 'near_airport_distance', customField: 'near_airport_distance_custom' },
                    { label: 'Near Highway/Main Road', field: 'near_highway_distance', customField: 'near_highway_distance_custom' },
                    { label: 'Near Auto/Taxi Stand', field: 'near_auto_taxi_distance', customField: 'near_auto_taxi_distance_custom' },
                    { label: 'Near Hospital', field: 'near_hospital_distance', customField: 'near_hospital_distance_custom' },
                    { label: 'Near School', field: 'near_school_distance', customField: 'near_school_distance_custom' },
                    { label: 'Near Market', field: 'near_market_distance', customField: 'near_market_distance_custom' },
                  ].map(({ label, field, customField }) => (
                    <div key={field} className="space-y-3 rounded-xl border border-gray-200 bg-white p-3">
                      <p className="text-sm font-medium text-gray-700">{label}</p>
                      <select
                        name={field}
                        value={formData[field] || ''}
                        onChange={(e) => {
                          handleChange(e);
                          // Clear custom value if not using custom option
                          if (e.target.value !== 'custom') {
                            setFormData(prev => ({ ...prev, [customField]: '' }));
                          }
                        }}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 transition-all focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select km...</option>
                        <option value="0-1 km">0-1 km</option>
                        <option value="1-3 km">1-3 km</option>
                        <option value="3-5 km">3-5 km</option>
                        <option value="5+ km">5+ km</option>
                        <option value="custom">Custom</option>
                      </select>
                      {formData[field] === 'custom' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            name={customField}
                            value={formData[customField] || ''}
                            onChange={handleChange}
                            placeholder="Enter km"
                            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 transition-all focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary"
                          />
                          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">km</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Section - RERA */}
              <div className="border-t border-gray-100 pt-8 mt-8">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Compliance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                      RERA Number
                    </label>
                    <div className="relative">
                      <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="rera_number"
                        value={formData.rera_number}
                        onChange={handleChange}
                        placeholder={getReraExampleByLocation({ city: formData.city, state: formData.state }).placeholder}
                        className={`w-full pl-9 pr-10 py-2.5 bg-white border rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm ${
                          reraError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200'
                        }`}
                      />
                      {reraChecking && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                        </div>
                      )}
                      {reraError && !reraChecking && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {getReraExampleByLocation({ city: formData.city, state: formData.state }).hint}
                    </p>
                    {reraError && <p className="mt-1 text-xs text-red-500">{reraError}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">RERA Expiry Date</label>
                    <input
                      type="date"
                      name="rera_expiry_date"
                      value={formData.rera_expiry_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* Step 6: Media */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <PropertyMediaForm
                formData={formData}
                setFormData={setFormData}
                mediaPreviews={mediaPreviews}
                setMediaPreviews={setMediaPreviews}
                onMediaChange={handleCategorizedMediaChange}
                onMediaRemove={removeCategorizedMedia}
                onMediaReplace={handleMediaReplace}
              />

              {/* SEO Section */}
              {false && (
              <div className="border-t border-gray-100 pt-8 mt-8">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">SEO & Metadata</h4>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                      Meta Title
                      <span className="text-gray-400 font-normal ml-1">({(formData.meta_title || '').length}/60 chars)</span>
                    </label>
                    <input
                      type="text"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleChange}
                      placeholder="Skyline Towers - Premium Flats in Andheri"
                      maxLength={70}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                      Meta Description
                      <span className="text-gray-400 font-normal ml-1">({(formData.meta_description || '').length}/160 chars)</span>
                    </label>
                    <textarea
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => {
                        if (e.target.value.length <= 200) handleChange(e);
                      }}
                      rows={3}
                      placeholder="Enter 150-160 character search snippet for Google..."
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm resize-none"
                    />
                  </div>
                </div>
              </div>
              )}
            </div>
          )}

          {/* Step 7: SEO & Submit */}
          {step === 7 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-xl flex items-center gap-2 font-bold text-gray-900"><FileSearch className="w-5 h-5 text-primary" /> SEO & Submit</h3>
                <p className="text-xs text-gray-500 mt-1 ml-7">Final search metadata before submitting the property listing.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                    Meta Title
                    <span className="text-gray-400 font-normal ml-1">({(formData.meta_title || '').length}/60 chars)</span>
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleChange}
                    placeholder="Skyline Towers - Premium Flats in Andheri"
                    maxLength={70}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                    Meta Description
                    <span className="text-gray-400 font-normal ml-1">({(formData.meta_description || '').length}/160 chars)</span>
                  </label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => {
                      if (e.target.value.length <= 200) handleChange(e);
                    }}
                    rows={3}
                    placeholder="Enter 150-160 character search snippet for Google..."
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm resize-none"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
                <h4 className="text-sm font-semibold text-gray-900">Ready to submit</h4>
                <p className="mt-1 text-xs text-gray-500">
                  Review the category-wise steps above if needed, then finish the listing.
                </p>
              </div>
            </div>
          )}



          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 px-2 lg:px-4">
            <button
              type="button"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1 || submitting}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg disabled:opacity-50 transition-all hover:bg-gray-50 active:bg-gray-100 shadow-sm"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!canProceed() || submitting}
              className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm active:scale-95 flex items-center justify-center min-w-[120px]"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : step === STEPS.length ? 'Finish Listing' : 'Next Step'}
            </button>
          </div>

        </form>

      </div>

    </PropertySubscriptionGuard>

  );

}



export default SellProperty;

