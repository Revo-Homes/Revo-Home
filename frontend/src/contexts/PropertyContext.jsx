import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLocation } from './LocationContext';
import { listingApi, userApi, propertyApi } from '../services/api';
import Logo from '../assets/Revo Homes Logo.png';

const PropertyContext = createContext(null);

const DEFAULT_IMAGE = Logo;

const PROPERTY_TYPE_LABELS = {
  1: 'Apartment',
  2: 'Villa',
  3: 'Independent House',
  4: 'Plot',
  5: 'Commercial',
};

const toNumber = (value, fallback = 0) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(normalized) ? normalized : fallback;
  }
  return fallback;
};

const extractCollection = (response, keys = []) => {
  const preferred = keys
    .map((key) => response?.data?.[key] ?? response?.[key])
    .find((value) => Array.isArray(value));

  if (preferred) return preferred;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const extractSingle = (response, keys = []) => {
  const preferred = keys
    .map((key) => response?.data?.[key] ?? response?.[key])
    .find(Boolean);

  return preferred || response?.data || response || null;
};

const extractPagination = (response) => {
  const pagination = response?.data?.pagination
    || response?.pagination
    || response?.data?.meta
    || response?.meta
    || null;

  if (!pagination || typeof pagination !== 'object') return null;

  const currentPage = Number(
    pagination.currentPage
    || pagination.current_page
    || pagination.page
    || 1
  );

  const totalPages = Number(
    pagination.totalPages
    || pagination.total_pages
    || pagination.last_page
    || 0
  );

  const totalItems = Number(
    pagination.totalItems
    || pagination.total_items
    || pagination.total
    || 0
  );

  return {
    currentPage: Number.isFinite(currentPage) ? currentPage : 1,
    totalPages: Number.isFinite(totalPages) ? totalPages : 0,
    totalItems: Number.isFinite(totalItems) ? totalItems : 0,
  };
};

const extractListingIdFromSlug = (value) => {
  if (!value) return null;
  const match = String(value).match(/rpid-r(\d+)$/i);
  if (match) return match[1];
  return null;
};

const buildPopularCities = (items) => {
  const counts = new Map();

  items.forEach((item) => {
    const city = item.city || item.property_city || item.location?.split(',')[0]?.trim();
    if (!city) return;
    counts.set(city, (counts.get(city) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
};

const safeJsonParse = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const toArray = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const parsed = safeJsonParse(value, null);
    if (Array.isArray(parsed)) return parsed;

    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return fallback;
};

const normalizeImageUrl = (image) => {
  if (!image) return null;
  if (typeof image === 'string') return image;

  return (
    image.image_url ||
    image.url ||
    image.src ||
    image.thumbnail_url ||
    image.cover_image_url ||
    null
  );
};

const formatBHK = (bedrooms) => {
  if (!bedrooms) return '';
  const beds = parseInt(bedrooms);
  if (!beds || beds < 1) return '';
  return `${beds} BHK`;
};

const normalizeListingType = (type) => {
  if (!type) return 'buy';
  const normalized = String(type).trim().toLowerCase();

  if (['sale', 'buy', 'sell', 'resale', 'purchase', 'owned'].includes(normalized)) return 'buy';
  if (['rent', 'lease', 'rental'].includes(normalized)) return 'rent';
  if (['commercial_rent', 'commercial rent', 'commercial-rent'].includes(normalized)) return 'commercial_rent';
  if (['commercial'].includes(normalized)) return 'commercial';
  if (['plot', 'plots'].includes(normalized)) return 'plots';
  if (['pg', 'paying guest'].includes(normalized)) return 'pg';
  if (['coworking', 'co-working', 'co working'].includes(normalized)) return 'coworking';

  return normalized;
};

const normalizeProperty = (item, userLocation = null) => {
  if (!item) return item;

  const meta = safeJsonParse(item.meta, {});
  const features = safeJsonParse(item.features, item.features);
  const amenities = toArray(
    item.amenities ||
    features?.amenities ||
    features?.community ||
    features?.infrastructure ||
    features?.security ||
    features?.utilities,
    []
  );
  const nearby = toArray(
    item.nearby ||
    meta?.nearby ||
    meta?.nearby_landmarks ||
    meta?.landmarks,
    []
  );
  const imageList = toArray(item.images, [])
    .map(normalizeImageUrl)
    .filter(Boolean);
  // Add secondary images from backend if available
  if (item.secondary_image_url_1) imageList.push(normalizeImageUrl(item.secondary_image_url_1));
  if (item.secondary_image_url_2) imageList.push(normalizeImageUrl(item.secondary_image_url_2));
  const primaryImage =
    normalizeImageUrl(item.image) ||
    normalizeImageUrl(item.primary_image_url) ||
    normalizeImageUrl(item.cover_image_url) ||
    normalizeImageUrl(item.thumbnail_url) ||
    imageList[0] ||
    DEFAULT_IMAGE;
  const listingId = item.listing_id || item.id || item.slug;
  const propertyId = item.property_id || item.id;
  const city = item.property_city || item.city || '';
  const state = item.property_state || item.state || '';
  const location = item.location
    || [city, state].filter(Boolean).join(', ')
    || item.property_address
    || item.address_line1
    || item.locality
    || '';

  // Calculate distance if user location is available and property has coordinates
  let distance = null;
  if (userLocation && userLocation.latitude && userLocation.longitude) {
    const propertyLat = parseFloat(item.latitude || item.lat);
    const propertyLng = parseFloat(item.longitude || item.lng || item.lon);

    if (!isNaN(propertyLat) && !isNaN(propertyLng)) {
      // Use haversine formula to calculate distance
      const R = 6371; // Earth's radius in kilometers
      const dLat = (propertyLat - userLocation.latitude) * Math.PI / 180;
      const dLng = (propertyLng - userLocation.longitude) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(userLocation.latitude * Math.PI / 180) * Math.cos(propertyLat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = R * c;
    }
  }

  return {
    ...item,
    meta,
    features,
    id: listingId,
    listingId,
    propertyId,
    title: item.title || item.name || item.property_title || 'Property',
    price: toNumber(item.price || item.price_min || item.price_max),
    location,
    city,
    state,
    bhk: item.bhk || formatBHK(item.bedrooms || item.property_bedrooms || item.unit_bedrooms || item.total_bedrooms || 2),
    bathrooms: item.bathrooms || item.property_bathrooms || item.unit_bathrooms || item.total_bathrooms || 0,
    area: toNumber(item.area || item.carpet_area || item.builtup_area || item.built_up_area || item.total_area),
    propertyType:
      item.propertyType ||
      item.property_type_name ||
      PROPERTY_TYPE_LABELS[item.property_type_id] ||
      item.type ||
      'Apartment',
    listingType: normalizeListingType(item.listingType || item.listing_type || 'sale'),
    image: primaryImage,
    images: imageList.length > 0 ? imageList : [primaryImage],
    description: item.description || '',
    owner_id: item.owner_id || item.created_by || item.user_id || null,
    ownerEmail: item.ownerEmail || item.owner_email || item.created_by_email || '',
    disabled: item.disabled || item.status === 'inactive' || item.status === 'withdrawn',
    labels: (() => {
      // Handle labels already provided
      if (item.labels && Array.isArray(item.labels)) return item.labels;

      // Parse tags if it's a JSON string from backend
      let tags = item.tags;
      if (typeof tags === 'string') {
        try {
          tags = JSON.parse(tags);
        } catch {
          tags = null;
        }
      }

      // Extract slugs from tags array
      if (Array.isArray(tags)) {
        const slugs = tags
          .filter(t => t !== null)
          .map(t => t.slug || t.tag_slug)
          .filter(Boolean);

        // Priority: sold_out overrides everything
        if (slugs.includes('sold_out')) return ['sold_out'];

        // Sort by priority and take max 2
        const priority = ['sold_out', 'few_units_left', 'hot_sale', 'featured', 'top_selling', 'exclusive'];
        return slugs
          .sort((a, b) => priority.indexOf(a) - priority.indexOf(b))
          .slice(0, 2);
      }

      return [];
    })(),
    badge: item.is_featured ? 'featured' : item.is_verified ? 'verified' : undefined,
    views: item.views_count || 0,
    inquiries_count: item.inquiries_count || 0,
    favorites_count: item.favorites_count || 0,
    furnished: item.furnished || item.furnished_status || item.unit_furnished_status || item.furnishing || '',
    amenities,
    nearby,
    pricePerSqft: toNumber(item.price_per_sqft),
    developer: item.developer || item.builder_name || item.organization_name || '',
    possessionDate: item.possession_date || item.available_from || '',
    rera_number: item.rera_number || item.rera || '',
    owner: {
      name: item.owner_name || item.organization_name || item.developer || 'Property Owner',
      phone: item.owner_phone || item.organization_phone || '',
      email: item.owner_email || item.organization_email || '',
      verified: Boolean(item.is_verified || item.property_is_verified),
    },
    distance, // Distance in kilometers from user location
    latitude: parseFloat(item.latitude || item.lat) || null,
    longitude: parseFloat(item.longitude || item.lng || item.lon) || null,
  };
};

const isBackendListingPayload = (data = {}) => {
  if (!data || typeof data !== 'object') return false;

  return Boolean(
    data.property_type_id ||
    data.property_category_id ||
    data.address_line1 ||
    data.listing_type ||
    data.price_min ||
    data.price_max ||
    data.property_id ||
    data.listing_id
  );
};

const LISTINGS_PAGE_SIZE = 100;
const LISTINGS_MAX_PAGES = 25;

export function PropertyProvider({ children }) {
  const { isLoggedIn, user } = useAuth();
  const { location: userLocation } = useLocation();
  const [properties, setProperties] = useState([]);
  const [listings, setListings] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [propertyTypes, setPropertyTypes] = useState({}); // { id: name } mapping

  // Fetch property types from database
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const response = await propertyApi.getFormOptions();
        const data = response?.data || response;
        
        // Transform property_types to object { id: name }
        const typesMap = {};
        (data.property_types || []).forEach(t => {
          typesMap[t.id] = t.name || t.label || t.title;
        });
        setPropertyTypes(typesMap);
      } catch (error) {
        console.error('Failed to fetch property types:', error);
        // Fallback to hardcoded values
        setPropertyTypes({ 1: 'Apartment', 2: 'Villa', 3: 'Independent House', 4: 'Plot', 5: 'Commercial', 6: 'PG', 7: 'Coworking' });
      }
    };
    fetchPropertyTypes();
  }, []);

  const fetchAllListingsFromBackend = useCallback(async (params = {}) => {
    const collected = [];
    const seenIds = new Set();
    let currentPage = 1;
    let totalPages = 1;

    do {
      const response = await listingApi.search({
        ...params,
        organization_id: 1, // Restrict to Revo Homes organization
        status: params.status || 'active', // Only show active properties by default
        page: currentPage,
        limit: params.limit || LISTINGS_PAGE_SIZE,
        page_size: params.page_size || LISTINGS_PAGE_SIZE,
        per_page: params.per_page || LISTINGS_PAGE_SIZE,
      });

      const rawItems = extractCollection(response, ['listings']);
      const pagination = extractPagination(response);
      let newItemsCount = 0;

      rawItems.forEach((item) => {
        const itemKey = item?.listing_id || item?.id || item?.slug || `${currentPage}-${collected.length}`;
        if (seenIds.has(itemKey)) return;
        seenIds.add(itemKey);
        collected.push(normalizeProperty(item, userLocation));
        newItemsCount += 1;
      });

      if (pagination?.totalPages > 0) {
        totalPages = pagination.totalPages;
      } else if (!rawItems.length || newItemsCount === 0) {
        totalPages = currentPage;
      } else if (rawItems.length < LISTINGS_PAGE_SIZE) {
        totalPages = currentPage;
      } else {
        totalPages = Math.min(currentPage + 1, LISTINGS_MAX_PAGES);
      }

      currentPage += 1;
    } while (currentPage <= totalPages && currentPage <= LISTINGS_MAX_PAGES);

    return collected;
  }, [userLocation]);

  const applyPropertyCatalog = useCallback((catalogItems, featuredItems = null) => {
    const nextProperties = catalogItems || [];

    const nextFeatured = Array.isArray(featuredItems) && featuredItems.length > 0
      ? featuredItems
      : (() => {
        const featuredProperties = nextProperties.filter((item) => item.featured);
        if (featuredProperties.length >= 8) {
          return featuredProperties.slice(0, 8);
        }

        return [
          ...featuredProperties,
          ...nextProperties
            .filter((item) => !item.featured)
            .slice(0, Math.max(0, 8 - featuredProperties.length))
            .map((item) => ({ ...item, featured: true })),
        ];
      })();

    setListings(nextProperties);
    setProperties(nextProperties);
    setFeatured(nextFeatured);
    setPopularCities(buildPopularCities(nextProperties));
  }, [userLocation]);

  useEffect(() => {
    const initializeProperties = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('PropertyContext: Fetching full listings catalog from backend...');
        const [catalogItems, featuredResponse] = await Promise.all([
          fetchAllListingsFromBackend(),
          listingApi.getFeatured().catch(() => null),
        ]);

        const featuredItems = extractCollection(featuredResponse, ['listings'])
          .map(item => normalizeProperty(item, userLocation));

        console.log('PropertyContext: Total normalized listings:', catalogItems.length);
        applyPropertyCatalog(catalogItems, featuredItems);
      } catch (fetchError) {
        console.error('PropertyContext: Backend fetch failed:', fetchError);
        applyPropertyCatalog([]);
        if (fetchError?.status !== 401) {
          setError(fetchError?.message || 'Failed to load properties');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeProperties();
  }, [applyPropertyCatalog, fetchAllListingsFromBackend, userLocation]);

  // Refresh properties function
  const refreshProperties = useCallback(async () => {
    setLoading(true);
    try {
      const [catalogItems, featuredResponse] = await Promise.all([
        fetchAllListingsFromBackend(),
        listingApi.getFeatured().catch(() => null),
      ]);
      const featuredItems = extractCollection(featuredResponse, ['listings'])
        .map(item => normalizeProperty(item, userLocation));
      applyPropertyCatalog(catalogItems, featuredItems);
    } catch (error) {
      console.error('PropertyContext: Refresh failed:', error);
    } finally {
      setLoading(false);
    }
  }, [applyPropertyCatalog, fetchAllListingsFromBackend, userLocation]);

  const loadSavedAndEnquiries = useCallback(async () => {
    if (!isLoggedIn || !user) return;

    try {
      const [favoritesResponse, enquiriesResponse] = await Promise.all([
        userApi.getFavorites(),
        userApi.getInquiriesMe(),
      ]);

      const favorites = extractCollection(favoritesResponse, ['favorites']).map(normalizeProperty);
      setSavedIds(new Set(favorites.map((item) => Number(item.propertyId || item.id)).filter(Number.isFinite)));

      const enquiryList = enquiriesResponse?.data?.inquiries || enquiriesResponse?.inquiries || enquiriesResponse?.data || [];
      setEnquiries(Array.isArray(enquiryList) ? enquiryList : []);
    } catch (err) {
      console.error('PropertyContext: Failed to sync saved items or enquiries:', err);
    }
  }, [isLoggedIn, user]);

  // Fetch nearby properties based on user location
  const fetchNearbyProperties = useCallback(async (radiusKm = 10) => {
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      console.log('No user location available for nearby properties');
      return [];
    }

    try {
      const response = await listingApi.search({
        limit: 20,
        // Note: Backend would need to support location-based filtering
        // For now, we'll fetch all properties and filter client-side
      });

      const allProperties = extractCollection(response, ['listings']).map(item => normalizeProperty(item, userLocation));

      // Filter properties within radius and have valid coordinates
      const nearby = allProperties.filter(property => {
        if (!property.distance || property.distance > radiusKm) return false;
        return property.latitude && property.longitude;
      }).sort((a, b) => (a.distance || 0) - (b.distance || 0));

      return nearby;
    } catch (err) {
      console.error('Failed to fetch nearby properties:', err);
      return [];
    }
  }, [userLocation]);

  // Fetch properties by city name
  const fetchPropertiesByCity = useCallback(async (cityName) => {
    try {
      const response = await listingApi.search({
        city: cityName,
        limit: 20
      });

      return extractCollection(response, ['listings']).map(item => normalizeProperty(item, userLocation));
    } catch (err) {
      console.error('Failed to fetch properties by city:', err);
      return [];
    }
  }, [userLocation]);

  useEffect(() => {
    if (isLoggedIn) {
      loadSavedAndEnquiries();
      return;
    }

    setSavedIds(new Set());
    setEnquiries([]);
  }, [isLoggedIn, loadSavedAndEnquiries]);

  const fetchFeatured = useCallback(async () => {
    const response = await listingApi.getFeatured();
    const list = extractCollection(response, ['listings']).map(item => normalizeProperty(item, userLocation));
    setFeatured(list);
    return list;
  }, [userLocation]);

  const fetchPopularCities = useCallback(async () => {
    if (properties.length > 0) {
      const list = buildPopularCities(properties);
      setPopularCities(list);
      return list;
    }

    const fetchedListings = await fetchAllListingsFromBackend();
    const list = buildPopularCities(fetchedListings);
    setPopularCities(list);
    return list;
  }, [fetchAllListingsFromBackend, properties]);

  const fetchProperties = useCallback(async (params = {}) => {
    try {
      const response = await listingApi.search(params);
      return extractCollection(response, ['listings']).map(item => normalizeProperty(item, userLocation));
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      return [];
    }
  }, [userLocation]);

  // Server-side filtering with backend API
  const fetchPropertiesWithFilters = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      
      // DEBUG: Log incoming filters
      console.log('DEBUG: fetchPropertiesWithFilters called with:', JSON.stringify(filters, null, 2));
      
      // Map frontend filter keys to backend API parameters
      const apiParams = {
        organization_id: 1, // Revo Homes organization
        status: 'active',
        limit: 100,
      };

      // Location text search
      if (filters.location && filters.location.trim()) {
        apiParams.search_query = filters.location.trim();
        apiParams.city = filters.location.trim();
      }

      // Budget/Price range
      if (filters.budgetMin && !isNaN(Number(filters.budgetMin))) {
        apiParams.min_price = Number(filters.budgetMin);
      }
      if (filters.budgetMax && !isNaN(Number(filters.budgetMax))) {
        apiParams.max_price = Number(filters.budgetMax);
      }

      // BHK (bedrooms) - handle array of BHK values
      if (filters.bhk && filters.bhk.length > 0) {
        // Convert BHK array to bedroom numbers (e.g., ['1', '2', '5+'] -> [1, 2, 5])
        const bedroomValues = filters.bhk.map(b => {
          if (b === '5+') return 5; // Backend will need to handle >= 5
          return parseInt(b, 10);
        }).filter(n => !isNaN(n));
        
        if (bedroomValues.length > 0) {
          // Send as comma-separated for multiple values
          apiParams.bedrooms = bedroomValues.join(',');
        }
      }

      // Property Type - map to backend numeric IDs using dynamic propertyTypes from database
      if (filters.propertyType && filters.propertyType.length > 0) {
        // Create reverse mapping from name to ID using dynamic propertyTypes
        const typeMapping = {};
        Object.entries(propertyTypes).forEach(([id, name]) => {
          typeMapping[name] = parseInt(id);
        });
        
        const backendTypeIds = filters.propertyType
          .map(t => typeMapping[t])
          .filter(id => id !== undefined && !isNaN(id));
        if (backendTypeIds.length > 0) {
          // Support multiple property types - send as comma-separated
          apiParams.property_type = backendTypeIds.join(',');
        }
      }

      // Listing Type (sale/rent/lease)
      if (filters.listingType && filters.listingType !== 'all') {
        apiParams.listing_type = filters.listingType;
      }

      // Furnishing - send to backend for server-side filtering
      if (filters.furnishing && filters.furnishing.length > 0) {
        const furnishingMapping = {
          'Fully Furnished': 'fully_furnished',
          'Semi Furnished': 'semi_furnished',
          'Unfurnished': 'unfurnished'
        };
        const backendFurnishingValues = filters.furnishing
          .map(f => furnishingMapping[f] || f.toLowerCase().replace(' ', '_'))
          .filter(f => f);
        if (backendFurnishingValues.length > 0) {
          apiParams.furnishing = backendFurnishingValues.join(',');
        }
      }

      // DEBUG: Log API params being sent
      console.log('DEBUG: API params sent to backend:', apiParams);
      
      const response = await listingApi.search(apiParams);
      
      // DEBUG: Log raw response count
      console.log('DEBUG: Raw response listings count:', response?.data?.listings?.length || response?.listings?.length || 0);
      
      const results = extractCollection(response, ['listings']).map(item => normalizeProperty(item, userLocation));
      
      // Apply client-side filtering for fields not supported by backend
      let filtered = results;
      
      // Furnishing filter (client-side)
      // Map UI values to database values
      const furnishingMapping = {
        'Fully Furnished': 'fully_furnished',
        'Semi Furnished': 'semi_furnished', 
        'Unfurnished': 'unfurnished'
      };
      
      if (filters.furnishing && filters.furnishing.length > 0) {
        const normalizedFilterValues = filters.furnishing.map(f => furnishingMapping[f] || f.toLowerCase().replace(' ', '_'));
        filtered = filtered.filter((p) => {
          const propFurnishing = String(p.furnished || p.furnishing || p.furnishing_status || '').toLowerCase();
          return normalizedFilterValues.some(filterVal => propFurnishing.includes(filterVal));
        });
      }

      // Area range filter (client-side fallback)
      if (filters.areaMin && !isNaN(Number(filters.areaMin))) {
        filtered = filtered.filter((p) => Number(p.area || p.carpet_area || 0) >= Number(filters.areaMin));
      }
      if (filters.areaMax && !isNaN(Number(filters.areaMax))) {
        filtered = filtered.filter((p) => Number(p.area || p.carpet_area || 0) <= Number(filters.areaMax));
      }

      // Amenities filter (client-side)
      if (filters.amenities && filters.amenities.length > 0) {
        filtered = filtered.filter((p) =>
          filters.amenities.every((selectedAmenity) =>
            (p.amenities || []).some((amenity) =>
              String(amenity).toLowerCase().includes(selectedAmenity.toLowerCase())
            )
          )
        );
      }
      
      setLoading(false);
      return filtered;
    } catch (err) {
      console.error('Failed to fetch filtered properties:', err);
      setLoading(false);
      return [];
    }
  }, [userLocation, propertyTypes]);

  const toggleFavorite = useCallback(async (itemId, shouldSave) => {
    try {
      const normalizedId = Number(itemId);
      if (shouldSave) {
        await userApi.addFavorite({ item_id: normalizedId, item_type: 'property' });
        setSavedIds((prev) => new Set([...prev, normalizedId]));
      } else {
        await userApi.removeFavorite(normalizedId, 'property');
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(normalizedId);
          return next;
        });
      }
      return true;
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      return false;
    }
  }, []);

  const transformToBackendPayload = (data) => {
    const title = data.title || `${data.bhk || ''} BHK ${data.propertyType || 'Property'} in ${data.locality || ''}`.trim();
    const slug = data.slug || title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .substring(0, 50) + '-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);

    const typeMapping = {
      Apartment: 1,
      Villa: 2,
      'Independent House': 3,
      Plot: 4,
      Commercial: 5,
    };

    const categoryMapping = {
      'Residential': 1,
      'Commercial': 2,
      'Industrial': 3,
      'Land': 4,
      'Mixed Use': 5,
    };

    return {
      // Basic Information
      organization_id: data.organization_id || 1,
      property_type_id: typeMapping[data.propertyType] || 1,
      property_category_id: categoryMapping[data.property_category] || 1,
      name: title,
      slug: slug,
      description: data.description || '',

      // RERA Details
      rera_number: data.rera_number || '',
      rera_expiry_date: data.rera_expiry_date || '',

      // Location Details
      address_line1: data.address_line1 || data.address || '',
      address_line2: data.address_line2 || '',
      city: data.city || '',
      state: data.state || '',
      country: data.country || 'IN',
      zip_code: data.zip_code || '',
      locality: data.locality || '',
      landmark: data.landmark || '',
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,

      // Property Specifications
      total_units: parseInt(data.total_units) || 0,
      total_floors: parseInt(data.total_floors) || 0,
      total_area: data.total_area ? parseFloat(data.total_area) : null,
      builtup_area: data.builtup_area ? parseFloat(data.builtup_area) : null,
      carpet_area: Number(data.area) || Number(data.carpet_area) || 0,
      area_unit: data.area_unit || 'sqft',
      year_built: data.year_built ? parseInt(data.year_built) : null,
      possession_date: data.possession_date || '',
      facing_direction: data.facing_direction || '',
      parking_spaces: parseInt(data.parking_spaces) || 0,

      // Pricing Information
      price_min: Number(data.price_min) || Number(data.price) || 0,
      price_max: Number(data.price_max) || Number(data.price) || 0,
      price_on_request: Boolean(data.price_on_request),
      currency: data.currency || 'INR',

      // Status and Features
      status: data.status || 'draft',
      is_featured: Boolean(data.is_featured),
      features: Array.isArray(data.features) ? data.features : [],
      meta_title: data.meta_title || '',
      meta_description: data.meta_description || '',
      meta: data.meta || {},

      created_by: user?.id
    };
  };

  const getProperty = useCallback(async (identifier, options = {}) => {
    const slug = options?.slug || null;
    const id = identifier ?? extractListingIdFromSlug(slug);

    // Revo Homes only uses listings - fetch from listing endpoint
    try {
      const listingResponse = await listingApi.getById(id);
      const listing = extractSingle(listingResponse, ['listing']);
      if (listing) {
        return normalizeProperty(listing, userLocation);
      }
    } catch (err) {
      console.error('PropertyContext: Listing fetch failed for id:', id, err);
    }

    if (slug) {
      try {
        const listingResponse = await listingApi.getBySlug(slug);
        const listing = extractSingle(listingResponse, ['listing']);
        if (listing) {
          return normalizeProperty(listing, userLocation);
        }
      } catch (err) {
        console.error('PropertyContext: Listing fetch failed for slug:', slug, err);
      }
    }

    const normalizedId = Number(id);
    const fallbackProperty = [...properties, ...listings].find((item) => (
      Number(item?.id) === normalizedId ||
      Number(item?.listingId) === normalizedId ||
      Number(item?.propertyId) === normalizedId ||
      String(item?.slug) === String(slug) ||
      String(item?.id) === String(id) ||
      String(item?.listingId) === String(id) ||
      String(item?.propertyId) === String(id)
    ));

    if (fallbackProperty) {
      console.warn('PropertyContext: Using cached property fallback for identifier:', id || slug);
      return fallbackProperty;
    }

    return null;
  }, [listings, properties, userLocation]);

  const createProperty = useCallback(async (data) => {
    try {
      console.log('PropertyContext: Creating listing with data:', data);
      const payload = isBackendListingPayload(data) ? data : transformToBackendPayload(data);
      console.log('PropertyContext: Transformed payload:', payload);

      // Revo Homes only uses listings - create via listing API
      const response = await listingApi.create(payload);
      console.log('PropertyContext: Listing API response:', response);
      const newListing = normalizeProperty(extractSingle(response));
      console.log('PropertyContext: Normalized listing:', newListing);
      return newListing;
    } catch (err) {
      console.error('Failed to create listing:', err);
      throw err;
    }
  }, []);

  const updateProperty = useCallback(async (id, data) => {
    try {
      console.log('PropertyContext: Updating listing with id:', id, 'data:', data);
      const payload = isBackendListingPayload(data) ? data : transformToBackendPayload(data);
      console.log('PropertyContext: Transformed update payload:', payload);

      // Revo Homes only uses listings - update via listing API
      const listingResponse = await listingApi.update(id, payload);
      console.log('PropertyContext: Listing update API response:', listingResponse);

      const updated = normalizeProperty(extractSingle(listingResponse, ['listing']) || extractSingle(listingResponse));
      console.log('PropertyContext: Normalized updated listing:', updated);

      setProperties((prev) => prev.map((item) =>
        Number(item.id) === Number(id) ? { ...item, ...updated } : item
      ));

      return updated;
    } catch (err) {
      console.error('Failed to update listing:', err);
      throw err;
    }
  }, []);

  const deleteProperty = useCallback(async (id) => {
    try {
      await listingApi.delete(id);
      setProperties((prev) => prev.filter((item) => item.id !== Number(id)));
    } catch (err) {
      console.error('Failed to delete listing:', err);
    }
  }, []);

  const togglePropertyVisibility = useCallback(async (id) => {
    try {
      const current = properties.find((item) => item.id === Number(id));
      const nextStatus = current?.disabled || current?.status === 'hidden' ? 'active' : 'hidden';
      await listingApi.update(id, { status: nextStatus });
      setProperties((prev) => prev.map((item) =>
        item.id === Number(id) ? { ...item, disabled: nextStatus === 'hidden', status: nextStatus } : item
      ));
      return true;
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
      return false;
    }
  }, [properties]);

  const uploadPropertyImages = useCallback(async (listingId, files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));

      // Note: Listing API doesn't have direct image upload, may need separate implementation
      console.log('PropertyContext: Image upload for listing', listingId, 'not yet implemented');
      return false;
    } catch (err) {
      console.error('Failed to upload images:', err);
      return false;
    }
  }, []);

  const fetchMyProperties = useCallback(async () => {
    if (!isLoggedIn) return [];

    try {
      // Revo Homes only uses listings - fetch from listing API
      const listings = await fetchAllListingsFromBackend();

      // Filter by current user only - show only properties created by the logged-in user
      const owned = listings.filter((item) => {
        const createdBy = item.audit?.created_by || item.created_by || item.creatorId;
        // Only include if created by current user
        return createdBy === user?.id;
      });

      console.log('fetchMyProperties: Found listings:', listings.length, 'owned:', owned.length);

      return owned;
    } catch (err) {
      console.error('Failed to fetch my listings:', err);
      return [];
    }
  }, [fetchAllListingsFromBackend, isLoggedIn, user]);

  const getUserProperties = useCallback(async () => {
    if (!isLoggedIn) return [];

    try {
      // Revo Homes only uses listings - fetch from listing API
      const listings = await fetchAllListingsFromBackend();

      // Filter by current user
      const owned = listings.filter((item) => {
        const createdBy = item.audit?.created_by || item.created_by || item.creatorId;
        return createdBy === user?.id;
      });

      return owned;
    } catch (err) {
      console.error('Failed to fetch user listings:', err);
      return [];
    }
  }, [fetchAllListingsFromBackend, isLoggedIn, user]);

  const addEnquiry = useCallback(async (listingId, message) => {
    try {
      await listingApi.inquiry(listingId, { message });
      await loadSavedAndEnquiries();
      return true;
    } catch (err) {
      console.error('Failed to add enquiry:', err);
      throw err;
    }
  }, [loadSavedAndEnquiries]);

  const deleteEnquiry = useCallback(async (enquiryId) => {
    try {
      setEnquiries((prev) => prev.filter((item) => item.id !== enquiryId));
      return true;
    } catch (err) {
      console.error('Failed to delete enquiry:', err);
      return false;
    }
  }, []);

  const fetchSaved = useCallback(() => {
    return properties.filter((item) => savedIds.has(Number(item.propertyId || item.id)));
  }, [properties, savedIds]);

  return (
    <PropertyContext.Provider
      value={{
        properties,
        listings, // For Revo Homes - only listings
        featured,
        popularCities,
        savedIds,
        loading,
        error,
        enquiries,
        fetchProperties,
        fetchPropertiesWithFilters,
        fetchFeatured,
        fetchPopularCities,
        fetchNearbyProperties,
        fetchPropertiesByCity,
        fetchSaved,
        refreshProperties,
        toggleFavorite,
        getProperty,
        createProperty,
        updateProperty,
        deleteProperty,
        togglePropertyVisibility,
        uploadPropertyImages,
        fetchMyProperties,
        getUserProperties,
        addEnquiry,
        deleteEnquiry,
        isSaved: (id) => savedIds.has(Number(id)),
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  return useContext(PropertyContext);
}