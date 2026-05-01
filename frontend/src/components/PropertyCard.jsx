import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProperty } from '../contexts/PropertyContext';
import { useAuth } from '../contexts/AuthContext';
import { useRevoLeadTracker } from '../hooks/useRevoLeadTracker';
const buildPropertyUrl = (id, title, location) => {
  const slugify = (str) =>
    (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

  const titleSlug = slugify(title);
  const citySlug = slugify((location || '').split(',')[0]);
  return `/properties/${titleSlug}-${citySlug}-rpid-r${id}`; // rpid-r hides the number
};

// Label configuration with colors and icons
const LABEL_CONFIG = {
  featured: { text: '🔥 Featured', classes: 'bg-orange-500 text-white' },
  top_selling: { text: '📈 Top Selling', classes: 'bg-blue-500 text-white' },
  exclusive: { text: '⭐ Exclusive', classes: 'bg-purple-500 text-white' },
  hot_sale: { text: '🔥 Hot Sale', classes: 'bg-red-500 text-white' },
  sold_out: { text: '🚫 Sold Out', classes: 'bg-gray-500 text-white' },
  few_units_left: { text: '⏰ Few Units Left', classes: 'bg-yellow-500 text-white' },
};

// Priority order for labels (higher index = lower priority)
const LABEL_PRIORITY = [
  'sold_out',      // Highest priority - overrides all
  'few_units_left',
  'hot_sale',
  'featured',
  'top_selling',
  'exclusive',
];

function PropertyCard({
  id: rawId,
  propertyId: rawPropertyId,
  image = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600',
  price,
  priceLabel = '/mo',
  location,
  title,
  bhk,
  bathrooms,
  area,
  propertyType = 'Apartment',
  isFavorite: initialFavorite = false,
  badge, // Legacy prop - kept for backward compatibility
  labels = [], // New prop: array of label slugs from property tags
  listingType = 'buy',
  showFavorite = true,
  footerActions,
  customBadge,
  showVerifiedImage = false,
  viewsAtBottomRight = false,
  disabled = false,
  distance = null, // Distance from user location in kilometers
  views = 0,
  owner = {},
  developer = '',
  rera_number = '',
  furnished = '',
  onPropertyClick, // New callback for lead tracking
  showCompare = false,
  isCompared = false,
  onCompareToggle,
}) {
  const { toggleFavorite, isSaved } = useProperty();
  const { isLoggedIn, openLogin, user } = useAuth();
  const { handlePropertyClick } = useRevoLeadTracker();
  const navigate = useNavigate();
  const idValue = rawId || rawPropertyId;
  const normalizedId = idValue ? (isNaN(Number(idValue)) ? idValue : Number(idValue)) : null;
  const favoriteId = rawPropertyId || rawId;
  const normalizedFavoriteId = favoriteId ? (isNaN(Number(favoriteId)) ? favoriteId : Number(favoriteId)) : null;

  const [localFavorite, setLocalFavorite] = useState(false);
  
  // Process labels with priority: sold_out overrides everything
  const processedLabels = (() => {
    const labelSlugs = labels || [];
    
    // If sold_out is present, only show that
    if (labelSlugs.includes('sold_out')) {
      return ['sold_out'];
    }
    
    // Sort by priority and take max 2
    return labelSlugs
      .sort((a, b) => LABEL_PRIORITY.indexOf(a) - LABEL_PRIORITY.indexOf(b))
      .slice(0, 2);
  })();
  
  // Legacy badge support (for backward compatibility)
  const badgeConfig = badge ? LABEL_CONFIG[badge] : null;

  useEffect(() => {
    if (normalizedFavoriteId) {
      setLocalFavorite(isSaved(normalizedFavoriteId));
    }
  }, [normalizedFavoriteId, isSaved]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    if (!normalizedFavoriteId) {
      console.error('PropertyCard: Missing ID for favorite toggle');
      return;
    }

    const targetState = !localFavorite;
    setLocalFavorite(targetState); // Optimistic update
    
    const success = await toggleFavorite(normalizedFavoriteId, targetState);
    if (!success) {
      setLocalFavorite(!targetState); // Revert on failure
      openLogin();
    }
  };

  // Handle property card click with lead generation (EVERY click)
  const handleCardClick = async (e) => {
    e.preventDefault();
    
    if (isLoggedIn && user && normalizedId) {
      // Generate lead on EVERY click for logged-in users
      await handlePropertyClick(normalizedId, user?.id, {
        listingId: normalizedId,
        propertyId: normalizedFavoriteId,
        title,
        price,
        location,
        propertyType,
        bhk,
        bathrooms,
        area,
        listingType,
        // User data from auth context
        userFirstName: user?.first_name,
        userLastName: user?.last_name,
        userEmail: user?.email,
        userPhone: user?.phone,
        // Organization data
        organizationId: user?.organization_id
      });

      if (onPropertyClick && typeof onPropertyClick === 'function') {
        onPropertyClick({
          property: { id: normalizedId, title, price, location },
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Always navigate — restriction handled in PropertyDetails
    if (normalizedId) {
      navigate(buildPropertyUrl(normalizedId, title, location));
    }
  };

  const formatPrice = (p) => {
    if (!p) return '—';
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
    return `₹${p.toLocaleString('en-IN')}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`group bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 flex flex-col h-full relative ${disabled ? 'grayscale' : ''}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 flex-shrink-0">
        <div onClick={handleCardClick} className="block w-full h-full cursor-pointer">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        </div>
        
        {/* Overlay Badges - Top Left */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
          {!showVerifiedImage && (
            <>
              {customBadge}
              {/* New labels system */}
              {processedLabels.map((labelSlug) => {
                const config = LABEL_CONFIG[labelSlug];
                if (!config) return null;
                return (
                  <span
                    key={labelSlug}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${config.classes}`}
                  >
                    {config.text}
                  </span>
                );
              })}
              {/* Legacy badge support (only show if no new labels) */}
              {badgeConfig && processedLabels.length === 0 && (
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${badgeConfig.classes}`}>
                  {badgeConfig.text}
                </span>
              )}
            </>
          )}
          <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-gray-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg w-fit">
            {propertyType}
          </span>
        </div>
        {/* Views badge bottom-right option */}
        {viewsAtBottomRight && (
          <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm text-white rounded-lg text-[10px] font-bold tracking-tight flex items-center gap-1 shadow-md pointer-events-none z-10 border border-white/10">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {views > 0 ? `${views.toLocaleString()} Views` : 'New'}
          </span>
        )}

        {/* Favorite Button (smaller) */}
        {showFavorite && (
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-lg ${
              localFavorite ? 'bg-black/60 text-red-500 scale-110' : 'bg-black/60 text-white hover:bg-black/80 hover:text-red-400'
            }`}
          >
            <svg className={`w-4 h-4 ${localFavorite ? 'fill-current' : 'none'}`} fill={localFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {/* Compare Button */}
        {showCompare && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCompareToggle?.();
            }}
            title={isCompared ? 'Remove from compare' : 'Add to compare'}
            className={`absolute top-14 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              isCompared
                ? 'bg-primary text-white scale-110 ring-2 ring-primary/30'
                : 'bg-black/60 text-white hover:bg-black/80 hover:text-primary'
            }`}
          >
            {isCompared ? (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-1">
            <h2 className="text-2xl font-black text-primary">
              {formatPrice(price)}
            </h2>
            {listingType === 'rent' && (
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {priceLabel}
              </span>
            )}
          </div>

          {/* ✅ VERIFIED BADGE HERE */}
          {(showVerifiedImage || owner?.verified) && (
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-md border-2 border-white">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          )}
        </div>

        <div onClick={handleCardClick} className="block">
          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>
        
        <p className="text-gray-500 text-sm font-medium flex items-center gap-1.5 mb-5 uppercase tracking-wide text-[11px]">
          <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          {location}
          {/* {distance !== null && distance !== undefined && (
            <span className="ml-auto text-primary font-bold text-xs bg-primary/5 px-2 py-1 rounded-full">
              {distance < 1 ? `${(distance * 1000).toFixed(0)}m away` : `${distance.toFixed(1)}km away`}
            </span>
          )} */}
        </p>

        <div className="mt-auto flex items-center gap-x-6 gap-y-3 border-t border-gray-100 pt-5 text-left flex-wrap">
         {bhk && String(bhk).trim() && (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Config</span>
              <span className="text-sm font-black text-gray-900">
                {String(bhk).includes('BHK') || String(bhk).includes('RK') ? bhk : `${bhk} BHK`}
              </span>
            </div>
          )} 

          {Number(area) > 0 && (
            <div className="flex flex-col">
              <span className="text-sm font-black text-gray-900">{area} sqft</span>
            </div>
          )}
          {furnished && (
            <div className="flex flex-col">
              <span className="text-sm font-black text-gray-900 capitalize">{furnished}</span>
            </div>
          )}
        </div>
        {/* Owner + RERA Strip — like MagicBricks/99acres */}
        {(owner?.verified || rera_number || (owner?.name && owner.name !== 'Property Owner')) && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.66 0 4.8-2.14 4.8-4.8S14.66 2.4 12 2.4 7.2 4.54 7.2 7.2 9.34 12 12 12zm0 2.4c-3.2 0-9.6 1.61-9.6 4.8v2.4h19.2v-2.4c0-3.19-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                {developer ? 'Builder' : 'Posted by'}
              </span>
              <span className="text-xs font-black text-gray-700 truncate block">
                {developer || (owner?.name && owner.name !== 'Property Owner' ? owner.name : 'Owner')}
              </span>
            </div>
          </div>
{rera_number ? (
  <span className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wide flex-shrink-0 border border-green-100">
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
    RERA Verified
  </span>
) : owner?.verified ? (
  <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wide flex-shrink-0 border border-blue-100">
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
    Verified
  </span>
) : null}
        </div>
        )}
        
        {footerActions && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            {footerActions}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default PropertyCard;