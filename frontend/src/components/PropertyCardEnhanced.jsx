import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Share2, 
  Phone, 
  Calendar, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  Eye,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import leadInteractionTracker from '../services/leadInteractionTracker';

const PropertyCardEnhanced = ({ property, variant = 'default' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Track image view on mount
  useEffect(() => {
    if (property?.id) {
      const img = document.querySelector(`[data-property-id="${property.id}"]`);
      if (img && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                // Image viewed
              }
            });
          },
          { threshold: 0.5 }
        );
        observer.observe(img);
        return () => observer.disconnect();
      }
    }
  }, [property?.id]);

  const handleCardClick = () => {
    // Track property click
    leadInteractionTracker.trackPropertyClick(property.id, {
      propertyName: property.name,
      propertyType: property.property_type,
      propertyPrice: property.price_min,
      propertyCity: property.city,
      clickSource: 'property_card'
    });

    // Navigate to property detail
    navigate(`/properties/${property.id}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    
    const newState = !isFavorite;
    setIsFavorite(newState);
    
    // Track favorite action
    leadInteractionTracker.trackFavorite(property.id, newState ? 'add' : 'remove', {
      propertyName: property.name,
      propertyType: property.property_type,
      fromCard: true
    });

    // Show visual feedback
    if (newState) {
      showToast('Added to favorites (+15 points!)', 'success');
    }
  };

  const handleShare = (platform) => {
    setShowShareMenu(false);
    
    leadInteractionTracker.trackShare(property.id, platform, {
      propertyName: property.name,
      fromCard: true
    });

    // Execute share action
    const shareUrl = `${window.location.origin}/properties/${property.id}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this property: ${shareUrl}`)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=Property Recommendation&body=Check out this property: ${shareUrl}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        showToast('Link copied to clipboard! (+20 points)', 'success');
        break;
    }
  };

  const handleQuickContact = (e) => {
    e.stopPropagation();
    
    leadInteractionTracker.trackContactRequest(property.id, {
      contactMethod: 'quick_button',
      inquiryType: 'general',
      name: user?.first_name || '',
      email: user?.email || ''
    }, {
      propertyName: property.name
    });

    navigate(`/properties/${property.id}?contact=true`);
  };

  const handleScheduleViewing = (e) => {
    e.stopPropagation();
    
    leadInteractionTracker.trackViewingRequest(property.id, new Date().toISOString(), {
      propertyName: property.name,
      preferredTime: 'any'
    });

    navigate(`/properties/${property.id}?schedule=true`);
  };

  const showToast = (message, type = 'info') => {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-y-0 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
    }`;
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <Zap class="w-4 h-4" />
        <span class="font-medium">${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: property.currency || 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!property) return null;

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.primary_image_url || '/placeholder-property.jpg'}
          alt={property.name}
          data-property-id={property.id}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {property.is_featured && (
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-md flex items-center">
              <Zap className="w-3 h-3 mr-1" />
              Featured
            </span>
          )}
          {property.is_verified && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-md">
              Verified
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full transition-all duration-200 ${
              isFavorite 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites (+15 pts)'}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareMenu(!showShareMenu);
              }}
              className="p-2 rounded-full bg-white/90 text-gray-600 hover:bg-white hover:text-blue-500 transition-all duration-200"
              title="Share property (+20 pts)"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Share Menu */}
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-20">
                <button
                  onClick={(e) => { e.stopPropagation(); handleShare('whatsapp'); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                >
                  WhatsApp
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleShare('email'); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                >
                  Email
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleShare('copy'); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                >
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-gradient-to-r from-black/70 to-black/50 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
            <p className="font-bold text-lg">
              {formatPrice(property.price_min)}
            </p>
            {property.price_per_sqft && (
              <p className="text-xs text-white/80">
                ₹{property.price_per_sqft.toLocaleString()} per sq.ft
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {property.name || 'Unnamed Property'}
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">
            {property.locality || property.city || property.address_line1 || 'Location not available'}
          </span>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          {property.bedrooms > 0 && (
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              <span>{property.bedrooms} BHK</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span>{property.bathrooms} Baths</span>
            </div>
          )}
          {property.total_area > 0 && (
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1" />
              <span>{property.total_area} {property.area_unit || 'sq.ft'}</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleQuickContact}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Phone className="w-4 h-4" />
            <span>I'm Interested (+25 pts)</span>
          </button>
          <button
            onClick={handleScheduleViewing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Visit (+30 pts)</span>
          </button>
        </div>

        {/* View Count (if available) */}
        {property.views_count > 0 && (
          <div className="mt-3 flex items-center text-xs text-gray-400">
            <Eye className="w-3 h-3 mr-1" />
            <span>{property.views_count.toLocaleString()} views</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCardEnhanced;
