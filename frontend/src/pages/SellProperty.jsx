import { useState, useEffect } from 'react';

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
  LayoutDashboard
} from 'lucide-react';



const STEPS = [

  { id: 1, title: 'Basic Information' },

  { id: 2, title: 'Property Details' },

  { id: 3, title: 'Pricing Details' },

  { id: 4, title: 'Location Details' },

  { id: 5, title: 'Photos & Media' },

];



// Enhanced property types based on schema

const PROPERTY_TYPES = {

  1: 'Residential',

  2: 'Commercial',

  3: 'Land',

  4: 'Industrial',

  5: 'Hospitality'

};



// Property sub-types based on schema

const PROPERTY_SUBTYPES = {

  Residential: [

    'Apartment', 'Villa', 'Independent House', 'Gated Community Villa',

    'Studio', 'Penthouse', 'Duplex', 'Triplex', 'Townhouse', 'Condo'

  ],

  Commercial: [

    'Office Space', 'Retail Shop', 'Showroom', 'Business Center',

    'Coworking Space', 'Warehouse', 'Godown', 'Commercial Complex'

  ],

  Land: [

    'Residential Plot', 'Commercial Plot', 'Agricultural Land',

    'Industrial Land', 'Farm House Plot', 'Plot'

  ],

  Industrial: [

    'Factory', 'Manufacturing Unit', 'Industrial Shed', 'Workshop',

    'Cold Storage', 'Processing Unit'

  ],

  Hospitality: [

    'Hotel', 'Resort', 'Guest House', 'Service Apartment',

    'Hostel', 'PG Accommodation'

  ]

};



// Property categories based on schema

const PROPERTY_CATEGORIES = {

  1: 'Residential',

  2: 'Commercial',

  3: 'Industrial',

  4: 'Land',

  5: 'Mixed Use'

};

const PROPERTY_TYPE_ID_MAP = {
  Residential: 1,
  Commercial: 2,
  Land: 3,
  Industrial: 4,
  Hospitality: 5,
};

const PROPERTY_CATEGORY_ID_MAP = {
  Residential: 1,
  Commercial: 2,
  Industrial: 3,
  Land: 4,
  Hospitality: 5,
};



// Listing types based on schema

const LISTING_TYPES = ['sale', 'rent', 'lease', 'auction'];



// Transaction types based on schema

const TRANSACTION_TYPES = ['new_booking', 'resale', 'redevelopment'];



// BHK options

const BHK_OPTIONS = ['1 RK', '1 BHK', '1.5 BHK', '2 BHK', '2.5 BHK', '3 BHK', '3.5 BHK', '4 BHK', '4.5 BHK', '5 BHK', '5.5 BHK', '6 BHK+'];

// Property Age options

const PROPERTY_AGE = ['New', '0-1 years', '1-5 years', '5-10 years', '10-20 years', '20+ years'];



// Area units with additional Indian land measurement units

const AREA_UNITS = [

  'sqft', 'sqm', 'sqyd', 'acre', 'hectare', 'cents', 'grounds',

  'bigha', 'katha', 'decimal', 'guntha'

];



// Currency options

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'];



// Property statuses based on schema

const PROPERTY_STATUSES = ['draft', 'active', 'inactive', 'sold', 'rented', 'under_construction', 'pending_approval'];



// Ownership types

const OWNERSHIP_TYPES = ['Freehold', 'Leasehold'];



// Property status options

const PROPERTY_STATUS_OPTIONS = ['Draft', 'Published', 'Sold', 'Rented', 'Under Construction'];



// Possession status

const POSSESSION_STATUS = ['Ready', 'Under Construction'];



// Facing directions

const FACING_DIRECTIONS = ['North', 'South', 'East', 'West', 'Northeast', 'Northwest', 'Southeast', 'Southwest'];



// Furnishing status

const FURNISHING_OPTIONS = ['Furnished', 'Semi Furnished', 'Unfurnished'];



// Furnishing status for compatibility

const FURNISHING_STATUS = ['unfurnished', 'semi_furnished', 'fully_furnished', 'luxury_furnished'];



// Age of property

const PROPERTY_AGE_OPTIONS = ['New', '0-1 years', '1-5 years', '5-10 years', '10-20 years', '20+ years'];



// Water source based on schema

const WATER_SOURCES = ['municipal', 'borewell', 'tanker', 'well', 'both'];



// Construction quality based on schema

const CONSTRUCTION_QUALITY = ['low', 'medium', 'high', 'premium', 'luxury'];



// Parking types based on schema

const PARKING_TYPES = ['open', 'covered', 'both', 'street_parking'];



// Connectivity options

const CONNECTIVITY_OPTIONS = ['Highway Access', 'Metro Connected', 'Good Road Network'];



// Security features

const SECURITY_FEATURES = [

  'CCTV Coverage', 'Gated Community', 'Fire Safety System',

  'Earthquake Resistant Structure', 'Intercom Facility', 'Smart Locks / Digital Security'

];



// Utilities

const UTILITIES = [

  'Electricity Backup (Full/Partial)', 'Water Availability (24x7 / Limited)',

  'Sewage System', 'Internet Providers Available', 'Gas Connection (Pipeline / Cylinder)'

];



// Sustainability features

const SUSTAINABILITY_FEATURES = [

  'Solar Panels', 'Rainwater Harvesting', 'Waste Management System',

  'Energy Efficiency Rating', 'Green Building Certification'

];



// Room features

const ROOM_FEATURES = [

  'Servant Room', 'Study Room', 'Store Room', 'Puja Room'

];



// Community amenities

const COMMUNITY_AMENITIES = [

  'Garden / Park', 'Gym', 'Swimming Pool', 'Clubhouse',

  'Children Play Area', 'Jogging Track', 'Community Hall'

];



// Infrastructure

const INFRASTRUCTURE_FEATURES = [

  'Lift', 'Power Backup', 'Water Supply', 'Security (24x7 / CCTV)',

  'Internet / WiFi', 'Gas Pipeline', 'Intercom'

];



// Legal status

const LEGAL_STATUS = ['Title Clear', 'Loan Approved'];



// Special tags

const SPECIAL_TAGS = ['New', 'Hot Deal', 'Premium', 'Exclusive'];



// Enhanced property options

const PROPERTY_CONDITIONS = ['New', 'Resale', 'Renovated'];

const OCCUPANCY_STATUSES = ['Vacant', 'Rented', 'Owner-occupied'];

const SALE_URGENCY = ['Urgent', 'Normal'];

const PET_POLICIES = ['Allowed', 'Not Allowed'];

const LISTING_VISIBILITIES = ['Public', 'Private'];

const PROPERTY_VIEWS = ['Park', 'Road', 'Sea'];

const POWER_BACKUP_TYPES = ['Full', 'Partial'];

const FLOORING_TYPES = ['Tiles', 'Marble', 'Wood', 'Carpet', 'Vinyl'];

const WALL_FINISH_TYPES = ['Paint', 'Texture', 'Wallpaper', 'Tiles'];

const KITCHEN_TYPES = ['Modular', 'Normal', 'Semi-Modular'];

const AREA_TYPES = ['Residential', 'Commercial', 'Mixed'];

const TRAFFIC_CONDITIONS = ['Low', 'Medium', 'High'];

const NOISE_LEVELS = ['Low', 'Medium', 'High'];

const BATHROOM_FITTINGS_QUALITIES = ['Basic', 'Standard', 'Premium', 'Luxury'];



function SellProperty() {

  const [step, setStep] = useState(1);

  const [searchParams] = useSearchParams();

  const editId = searchParams.get('edit');

  const { getProperty, createProperty, updateProperty, uploadPropertyImages, loading: propertyLoading } = useProperty();

  const { user, isLoggedIn } = useAuth();

  const navigate = useNavigate();



  const [formData, setFormData] = useState({

    property_id: "",

    listing_id: "",

    listingType: "", // No default

    propertyType: "",

    propertySubType: "",



    // Pricing

    minPrice: "",

    maxPrice: "",

    monthlyRent: "",

    securityDeposit: "",

    maintenance: "",

    negotiable: false,



    // Residential

    bhk: [],

    bhkDetails: [], // Array of { type: "2 BHK", bedrooms: 2, bathrooms: "", kitchens: "", balconies: "0", additionalRooms: "0" }

    // Commercial

    commercial_type: "",

    washrooms: "",

    visibility: "",

    footfall_tag: "",

    cabin_option: "",

    // Industrial

    ceiling_height: "",

    power_supply: "",

    industrial_type: "",

    loading_dock: false,

    truck_access: false,

    fire_safety: "",

    flooring_type: "",

    office_space: "",

    // Hospitality

    total_rooms: "",

    room_types: "",

    occupancy_type: "",

    food_included: "",

    operational_status: "",

    // Land

    plot_length: "",

    plot_width: "",

    road_access: "",

    boundary_wall: false,

    water_source_land: "",

    electricity_availability: "",

    plot_type: "",

    gated_plot: false,

    // Additional Residential Fields

    gated_society: "",

    maintenance_charges: "",

    // Common Fields for All Property Types

    total_area: "",

    builtup_area: "",

    area_unit: "sqft",

    floor_number: "",

    total_floors: "",

    age_of_property: "",

    furnished_status: "",

    water_source: "",

    // Common Fields for Non-Land

    parking_type: "",

    parking_spaces: "",

    power_backup: "",

    lift: "",

    facing: "",

    description: "",

    name: "", // Added name for UI

    property_type_id: "", // For compatibility with existing logic

    property_subtype: "", // For compatibility



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



    hospitalDistance: "",

    schoolDistance: "",

    metroDistance: "",

    busStandDistance: "",

    airportDistance: "",

    railwayDistance: "",



    // Amenities

    amenities: [],

    security: [],

    utilities: [],



    // SEO

    metaTitle: "",

    metaDescription: "",



    // Legacy/Existing fields for compatibility

    photos: [],

    floor_plan: [],

    master_plan: [],

    documents: [],

    virtual_tour: [],

    youtubeLinks: [],

    currency: 'INR',

    possession_date: '',

    rera_number: '',

    sale_urgency: 'Normal',

    property_condition: 'New',

  });

  const [otherFeature, setOtherFeature] = useState('');

  const [customFeatures, setCustomFeatures] = useState([]);

  const [showOtherInput, setShowOtherInput] = useState(false);

  const [mediaPreviews, setMediaPreviews] = useState({

    photos: [],

    floor_plan: [],

    master_plan: [],

    documents: [],

    virtual_tour: []

  });

  const [submitting, setSubmitting] = useState(false);



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
      return isFilled(formData.name) && isFilled(formData.propertyType) && isFilled(formData.listingType);
    }

    if (step === 2) { // Property Details
      // Total Area is required for ALL property types
      if (!isFilled(formData.total_area)) {
        return false;
      }

      // Property Type Specific Validations
      const pType = String(formData.propertyType).trim();

      if (pType === 'Residential') {
        // RESIDENTIAL: Need BHK selection and details
        const hasBHK = formData.bhk && Array.isArray(formData.bhk) && formData.bhk.length > 0;
        const hasDetails = formData.bhkDetails && Array.isArray(formData.bhkDetails) && formData.bhkDetails.length > 0;
        
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

    if (step === 3) { // Pricing Details
      if (formData.listingType === 'Sale') {
        // For Sale: Need at least min price, max price is optional
        return isFilled(formData.minPrice);
      } else if (formData.listingType === 'Rent' || formData.listingType === 'Lease') {
        // For Rent/Lease: Need monthly rent
        return isFilled(formData.monthlyRent);
      }
      // If no listing type selected, don't allow proceeding
      return false;
    }

    if (step === 4) { // Location Details
      // Required fields: address_line1, city, state, zip_code, locality
      return isFilled(formData.address_line1) && 
             isFilled(formData.city) && 
             isFilled(formData.state) && 
             isFilled(formData.zip_code) && 
             isFilled(formData.locality);
    }

    if (step === 5) return true; // Photos are optional

    return false;
  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    if (step < 5) {

      setStep(step + 1);

    } else {

      setSubmitting(true);

      try {

        let propertyId = editId;



        // Prepare payload according to new API structure

        const payload = {

          property_id: formData.property_id ? Number(formData.property_id) : null,

          listing_id: formData.listing_id ? Number(formData.listing_id) : null,

          organization_id: formData.organization_id,

          property_type_id: String(PROPERTY_TYPE_ID_MAP[formData.propertyType] || Number(formData.property_type_id) || 1),

          property_category_id: String(PROPERTY_CATEGORY_ID_MAP[formData.propertyType] || Number(formData.property_category_id) || 1),

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



          meta_title: formData.metaTitle,

          meta_description: formData.metaDescription,

          features: [...formData.amenities, ...formData.security, ...formData.utilities],

          meta: {

            ...formData.meta,

            property_type: formData.propertyType,

            property_subtype: formData.propertySubType,

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

          const res = await createProperty(payload);

          propertyId = res.id || res.propertyId;

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

      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{editId ? 'Edit Your Property' : 'List Your Property'}</h1>
          <p className="text-sm text-gray-500">{editId ? 'Update the details of your listing' : 'Fill in the details to list your property and reach thousands of buyers'}</p>
        </div>

        {/* Modern Step Navigation */}
        <div className="mb-8 bg-white border border-gray-200 rounded-xl p-2 hidden sm:flex justify-between items-center shadow-sm">
          {STEPS.map((s, index) => (
            <div key={s.id} className="flex relative flex-1 items-center justify-center">
              <div 
                className={`flex items-center justify-center w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all z-10 ${
                  step === s.id 
                    ? 'bg-primary text-white shadow-md' 
                    : step > s.id 
                    ? 'text-primary bg-primary/5' 
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-5 h-5 flex items-center justify-center rounded-full bg-black/10 text-[11px]">{s.id}</span>}
                  <span className="hidden md:inline">{s.title}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">

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
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={(e) => {
                      const val = e.target.value;
                      const id = Object.keys(PROPERTY_TYPES).find(key => PROPERTY_TYPES[key] === val);
                      setFormData(prev => ({
                        ...prev,
                        propertyType: val,
                        property_type_id: id || '',
                        propertySubType: '',
                      }));
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                  >
                    <option value="">Select Type</option>
                    {Object.values(PROPERTY_TYPES).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Property Sub-type</label>
                  <select
                    name="propertySubType"
                    value={formData.propertySubType}
                    onChange={handleChange}
                    disabled={!formData.propertyType}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <option value="">Select Sub-type</option>
                    {formData.propertyType && PROPERTY_SUBTYPES[formData.propertyType]?.map((subtype) => (
                      <option key={subtype} value={subtype}>{subtype}</option>
                    ))}
                  </select>
                </div>
              </div>



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
                    {formData.propertyType === 'Land' ? (
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
                    {PROPERTY_CONDITIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>



              {/* BHK and Bathrooms removed from Step 1 */}



              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">RERA Number</label>
                  <div className="relative">
                    <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="rera_number"
                      value={formData.rera_number}
                      onChange={handleChange}
                      placeholder="PRM-KA-RAA..."
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"
                    />
                  </div>
                </div>
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
                    {SALE_URGENCY.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
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

            </div>

          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-xl flex items-center gap-2 font-bold text-gray-900"><LayoutDashboard className="w-5 h-5 text-primary" /> Property Details</h3>
                <p className="text-xs text-gray-500 mt-1 ml-7">Enter dimensions, configuration, and other physical aspects.</p>
              </div>

              {/* Common Fields for All Property Types */}
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
                        {AREA_UNITS.map((unit) => (
                          <option key={unit} value={unit}>{unit.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                {(formData.propertyType !== 'Land') && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Built-up Area</label>
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

              {/* Property Type-Specific Fields */}

              {/* Residential Fields */}
              {formData.propertyType === 'Residential' && (
                <div className="border-t border-gray-100 pt-6 mt-6 space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Residential Details</h3>

                  {/* BHK Configuration */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 ml-1">BHK Configuration (Select Multiple) <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {BHK_OPTIONS.map((b) => {
                        const isSelected = formData.bhk.includes(b);
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              let updatedSelected = [...formData.bhk];
                              let updatedDetails = [...formData.bhkDetails];

                              if (isSelected) {
                                updatedSelected = updatedSelected.filter(item => item !== b);
                                updatedDetails = updatedDetails.filter(d => d.type !== b);
                              } else {
                                updatedSelected.push(b);
                                const bedrooms = parseInt(b) || 1;
                                updatedDetails.push({
                                  type: b,
                                  bedrooms: bedrooms,
                                  bathrooms: '',
                                  kitchens: '',
                                  balconies: '0',
                                  additionalRooms: '0',
                                  floorPlan: null,
                                  floorPlanPreview: null
                                });
                              }
                              setFormData(prev => ({ ...prev, bhk: updatedSelected, bhkDetails: updatedDetails }));
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border flex items-center gap-2 ${isSelected
                                ? 'bg-primary text-white border-primary shadow-md'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                              }`}
                          >
                            <Home size={16} />
                            {b}
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          <div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                              <Bath size={14} className="text-red-600" />
                              Bathrooms *
                            </label>
                            <select
                              value={detail.bathrooms}
                              onChange={(e) => {
                                const updatedDetails = [...formData.bhkDetails];
                                updatedDetails[index].bathrooms = e.target.value;
                                setFormData(prev => ({ ...prev, bhkDetails: updatedDetails }));
                              }}
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                            >
                              <option value="">Select Bathrooms</option>
                              {[1, 2, 3, 4, 5, '6+'].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                              <Utensils size={14} className="text-red-600" />
                              Kitchens *
                            </label>
                            <select
                              value={detail.kitchens}
                              onChange={(e) => {
                                const updatedDetails = [...formData.bhkDetails];
                                updatedDetails[index].kitchens = e.target.value;
                                setFormData(prev => ({ ...prev, bhkDetails: updatedDetails }));
                              }}
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                            >
                              <option value="">Select Kitchens</option>
                              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                              <Wind size={14} className="text-red-600" />
                              Balcony (Optional)
                            </label>
                            <select
                              value={detail.balconies}
                              onChange={(e) => {
                                const updatedDetails = [...formData.bhkDetails];
                                updatedDetails[index].balconies = e.target.value;
                                setFormData(prev => ({ ...prev, bhkDetails: updatedDetails }));
                              }}
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                            >
                              {[0, 1, 2, 3, 4, '5+'].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </div>
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
                        {PROPERTY_AGE.map((age) => (
                          <option key={age} value={age}>{age}</option>
                        ))}
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
                          {FACING_DIRECTIONS.map((dir) => (
                            <option key={dir} value={dir}>{dir.charAt(0).toUpperCase() + dir.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Commercial Fields */}
              {formData.propertyType === 'Commercial' && (
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
                        {PROPERTY_AGE.map((age) => (
                          <option key={age} value={age}>{age}</option>
                        ))}
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
              {formData.propertyType === 'Land' && (
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
                            {AREA_UNITS.map((unit) => (
                              <option key={unit} value={unit}>{unit.toUpperCase()}</option>
                            ))}
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
                        {FACING_DIRECTIONS.map((dir) => (
                          <option key={dir} value={dir}>{dir.charAt(0).toUpperCase() + dir.slice(1)}</option>
                        ))}
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
                        name="water_source_land"
                        value={formData.water_source_land}
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
              {formData.propertyType === 'Industrial' && (
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
              {formData.propertyType === 'Hospitality' && (
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
              {formData.propertyType !== 'Land' && (
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
                        {FURNISHING_STATUS.map((status) => (
                          <option key={status} value={status}>
                            {status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.replace(/_/g, ' ').slice(1)}
                          </option>
                        ))}
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
                      {WATER_SOURCES.map((source) => (
                        <option key={source} value={source}>
                          {source.charAt(0).toUpperCase() + source.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Parking for Residential, Commercial, Hospitality */}
                  {(formData.propertyType === 'Residential' || formData.propertyType === 'Commercial' || formData.propertyType === 'Hospitality') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Parking Type</label>
                        <select
                          name="parking_type"
                          value={formData.parking_type}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"
                        >
                          {PARKING_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                            </option>
                          ))}
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
                  {(formData.propertyType === 'Residential' || formData.propertyType === 'Commercial' || formData.propertyType === 'Hospitality') && (
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
                  {(formData.propertyType === 'Residential' || formData.propertyType === 'Commercial' || formData.propertyType === 'Hospitality') && (
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



          {step === 3 && (

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

            </div>

          )}



          {step === 4 && (

            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

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

                    placeholder="e.g. Karnataka"

                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm"

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



              <div className="mb-6 border-t border-gray-100 pt-8 mt-8">

                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Distance from Popular Places</label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {[

                    { label: 'Hospital', name: 'hospitalDistance' },

                    { label: 'School', name: 'schoolDistance' },

                    { label: 'Metro Station', name: 'metroDistance' },

                    { label: 'Bus Stand', name: 'busStandDistance' },

                    { label: 'Airport', name: 'airportDistance' },

                    { label: 'Railway Station', name: 'railwayDistance' }

                  ].map((field) => (

                    <div key={field.name}>

                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">{field.label}</label>

                      <select

                        name={field.name}

                        value={formData[field.name]}

                        onChange={handleChange}

                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:outline-none focus:ring-primary focus:border-primary text-sm font-medium text-gray-900 transition-all shadow-sm appearance-none"

                      >

                        <option value="">Select Distance</option>

                        <option value="0-1 km">0-1 km</option>

                        <option value="1-3 km">1-3 km</option>

                        <option value="3-5 km">3-5 km</option>

                        <option value="5+ km">5+ km</option>

                      </select>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          )}



          {step === 5 && (

            <PropertyMediaForm

              formData={formData}

              setFormData={setFormData}

              mediaPreviews={mediaPreviews}

              setMediaPreviews={setMediaPreviews}

              onMediaChange={handleCategorizedMediaChange}

              onMediaRemove={removeCategorizedMedia}

              onMediaReplace={handleMediaReplace}

            />

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
              ) : step === 5 ? 'Finish Listing' : 'Next Step'}
            </button>
          </div>

        </form>

      </div>

    </PropertySubscriptionGuard>

  );

}



export default SellProperty;

