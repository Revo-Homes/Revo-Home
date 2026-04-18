import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProperty } from '../contexts/PropertyContext';
import { useAuth } from '../contexts/AuthContext';
import { useRevoLeadTracker } from '../hooks/useRevoLeadTracker';

const BADGE_CONFIG = {
  verified: { label: '✓ Verified', classes: 'bg-green-500 text-white' },
  new: { label: 'New', classes: 'bg-blue-500 text-white' },
  premium: { label: '⭐ Premium', classes: 'bg-yellow-500 text-white' },
  featured: { label: '🔥 Featured', classes: 'bg-orange-500 text-white' },
};

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
  badge, 
  listingType = 'buy',
  showFavorite = true,
  footerActions,
  customBadge,
  showVerifiedImage = false,
  viewsAtBottomRight = false,
  disabled = false,
  distance = null, // Distance from user location in kilometers
  onPropertyClick, // New callback for lead tracking
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
  const badgeConfig = badge ? BADGE_CONFIG[badge] : null;

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
      navigate(`/properties/${normalizedId}`);
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
              {badgeConfig && (
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${badgeConfig.classes}`}>
                  {badgeConfig.label}
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
            {(normalizedId * 13) + 42} Views
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
          {showVerifiedImage && (
            <img 
              src="/src/assets/verifiedImage.jpeg" 
              alt="Verified" 
              className="w-8 h-8 object-contain rounded-full shadow-md border border-gray-200 bg-white"
            />
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
          {distance !== null && distance !== undefined && (
            <span className="ml-auto text-primary font-bold text-xs bg-primary/5 px-2 py-1 rounded-full">
              {distance < 1 ? `${(distance * 1000).toFixed(0)}m away` : `${distance.toFixed(1)}km away`}
            </span>
          )}
        </p>

        <div className="mt-auto flex items-center gap-x-6 gap-y-3 border-t border-gray-100 pt-5 text-left flex-wrap">
          {Number(bhk) > 0 && (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Beds</span>
              <span className="text-sm font-black text-gray-900">{bhk} BHK</span>
            </div>
          )}
          {Number(bathrooms) > 0 && (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Baths</span>
              <span className="text-sm font-black text-gray-900">{bathrooms}</span>
            </div>
          )}
          {Number(area) > 0 && (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Area</span>
              <span className="text-sm font-black text-gray-900">{area} sqft</span>
            </div>
          )}
        </div>
        
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
