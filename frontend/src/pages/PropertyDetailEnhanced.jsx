import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Heart, 
  Share2, 
  Phone, 
  Calendar, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  ArrowLeft,
  Check,
  Home,
  Building,
  Clock,
  User,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import leadInteractionTracker from '../services/leadInteractionTracker';
import api from '../services/api';

const PropertyDetailEnhanced = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(searchParams.get('contact') === 'true');
  const [showScheduleModal, setShowScheduleModal] = useState(searchParams.get('schedule') === 'true');
  const [scrollDepth, setScrollDepth] = useState(0);
  const [deepEngagementTracked, setDeepEngagementTracked] = useState(false);
  const [fullReadTracked, setFullReadTracked] = useState(false);
  
  const pageStartTime = useRef(Date.now());
  const imagesViewed = useRef(new Set());

  // Fetch property data
  useEffect(() => {
    fetchProperty();
    
    // Track property view on mount
    const timer = setTimeout(() => {
      trackPropertyView();
    }, 1000);

    return () => {
      clearTimeout(timer);
      trackTimeOnPage();
    };
  }, [id]);

  // Scroll depth tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = Math.round((scrollTop / docHeight) * 100);
      setScrollDepth(percent);

      // Track deep engagement at 50% scroll
      if (percent >= 50 && !deepEngagementTracked) {
        setDeepEngagementTracked(true);
        trackDeepEngagement();
      }

      // Track full read at 80% scroll
      if (percent >= 80 && !fullReadTracked) {
        setFullReadTracked(true);
        trackFullRead();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [deepEngagementTracked, fullReadTracked]);

  // 30-second engagement tracking
  useEffect(() => {
    const timer = setTimeout(() => {
      track30SecondEngagement();
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/properties/${id}`);
      setProperty(response.data.data);
    } catch (err) {
      setError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const trackPropertyView = () => {
    leadInteractionTracker.trackPropertyView(id, {
      propertyName: property?.name,
      propertyType: property?.property_type,
      propertyPrice: property?.price_min,
      fromSearch: document.referrer.includes('/search') || document.referrer.includes('/properties')
    });
  };

  const trackDeepEngagement = () => {
    leadInteractionTracker.trackEvent('page_scroll', {
      property_id: id,
      scrollDepth: 50,
      timeOnPage: Date.now() - pageStartTime.current
    });
  };

  const trackFullRead = () => {
    leadInteractionTracker.trackEvent('page_scroll', {
      property_id: id,
      scrollDepth: 80,
      timeOnPage: Date.now() - pageStartTime.current
    });
  };

  const track30SecondEngagement = () => {
    leadInteractionTracker.trackEvent('time_on_page', {
      property_id: id,
      duration: 30000,
      scrollDepth
    });
  };

  const trackTimeOnPage = () => {
    const timeSpent = Date.now() - pageStartTime.current;
    leadInteractionTracker.trackPropertyView(id, {
      timeOnPage: timeSpent,
      scrollDepth,
      imagesViewed: imagesViewed.current.size
    });
  };

  const handleFavorite = () => {
    const newState = !isFavorite;
    setIsFavorite(newState);
    
    leadInteractionTracker.trackFavorite(id, newState ? 'add' : 'remove', {
      propertyName: property?.name,
      fromDetailPage: true
    });

    if (newState) {
      showToast('Added to favorites (+15 points!)', 'success');
    }
  };

  const handleShare = (platform) => {
    leadInteractionTracker.trackShare(id, platform, {
      propertyName: property?.name,
      fromDetailPage: true
    });

    const shareUrl = window.location.href;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this property: ${shareUrl}`)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(property?.name || 'Check this property')}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        showToast('Link copied! (+20 points)', 'success');
        break;
    }
  };

  const handleContactSubmit = (formData) => {
    leadInteractionTracker.trackContactRequest(id, {
      ...formData,
      contactMethod: 'detail_page_form',
      inquiryType: 'property_inquiry'
    }, {
      propertyName: property?.name
    });

    setShowContactModal(false);
    showToast('Message sent! (+25 points)', 'success');
  };

  const handleScheduleSubmit = (formData) => {
    leadInteractionTracker.trackViewingRequest(id, formData.preferredDate, {
      propertyName: property?.name,
      preferredTime: formData.preferredTime,
      partySize: formData.partySize
    });

    setShowScheduleModal(false);
    showToast('Viewing scheduled! (+30 points)', 'success');
  };

  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-xl z-50 transform transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
    }`;
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <Zap class="w-5 h-5" />
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Property not found'}</p>
          <button 
            onClick={() => navigate('/properties')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const images = [
    property.primary_image_url,
    property.secondary_image_url_1,
    property.secondary_image_url_2
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleFavorite}
              className={`p-2 rounded-full ${isFavorite ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <div className="relative group">
              <button className="p-2 rounded-full bg-gray-100 text-gray-600">
                <Share2 className="w-6 h-6" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 hidden group-hover:block">
                <button onClick={() => handleShare('whatsapp')} className="w-full px-4 py-2 text-left hover:bg-gray-50">WhatsApp</button>
                <button onClick={() => handleShare('facebook')} className="w-full px-4 py-2 text-left hover:bg-gray-50">Facebook</button>
                <button onClick={() => handleShare('twitter')} className="w-full px-4 py-2 text-left hover:bg-gray-50">Twitter</button>
                <button onClick={() => handleShare('copy')} className="w-full px-4 py-2 text-left hover:bg-gray-50">Copy Link</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200">
              <img 
                src={images[currentImageIndex] || '/placeholder-property.jpg'}
                alt={property.name}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden ${currentImageIndex === idx ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
              <p className="text-gray-600 mt-2 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {property.locality}, {property.city}
              </p>
            </div>

            <div className="flex items-center gap-6 text-sm">
              {property.bedrooms > 0 && (
                <div className="flex items-center text-gray-700">
                  <Bed className="w-5 h-5 mr-2" />
                  <span>{property.bedrooms} Bedrooms</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center text-gray-700">
                  <Bath className="w-5 h-5 mr-2" />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
              )}
              {property.total_area > 0 && (
                <div className="flex items-center text-gray-700">
                  <Square className="w-5 h-5 mr-2" />
                  <span>{property.total_area} {property.area_unit}</span>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <p className="text-3xl font-bold text-blue-900">
                ₹{property.price_min?.toLocaleString()}
              </p>
              {property.price_per_sqft && (
                <p className="text-blue-700 mt-1">
                  ₹{property.price_per_sqft.toLocaleString()} per sq.ft
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-lg"
              >
                <Phone className="w-5 h-5" />
                Contact Agent (+25 points)
              </button>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-lg"
              >
                <Calendar className="w-5 h-5" />
                Schedule Viewing (+30 points)
              </button>
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Features */}
            {property.features && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Features & Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(property.features).map(([key, value]) => (
                    value && (
                      <div key={key} className="flex items-center text-gray-700">
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                        <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <ContactModal 
          property={property} 
          onClose={() => setShowContactModal(false)}
          onSubmit={handleContactSubmit}
        />
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleModal 
          property={property}
          onClose={() => setShowScheduleModal(false)}
          onSubmit={handleScheduleSubmit}
        />
      )}
    </div>
  );
};

// Simple Contact Modal Component
const ContactModal = ({ property, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Contact About {property.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <textarea
            placeholder="Message"
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg h-24"
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Send (+25 pts)</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Simple Schedule Modal Component
const ScheduleModal = ({ property, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ preferredDate: '', preferredTime: 'any', partySize: 1 });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Schedule Viewing - {property.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preferred Date</label>
            <input
              type="date"
              value={formData.preferredDate}
              onChange={e => setFormData({...formData, preferredDate: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Preferred Time</label>
            <select
              value={formData.preferredTime}
              onChange={e => setFormData({...formData, preferredTime: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="any">Any Time</option>
              <option value="morning">Morning (9AM - 12PM)</option>
              <option value="afternoon">Afternoon (12PM - 5PM)</option>
              <option value="evening">Evening (5PM - 8PM)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Party Size</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.partySize}
              onChange={e => setFormData({...formData, partySize: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Schedule (+30 pts)</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyDetailEnhanced;
