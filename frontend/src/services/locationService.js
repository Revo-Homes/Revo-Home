// Location Service - Handles geolocation and reverse geocoding
const CACHE_KEY = 'revo_location_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

class LocationService {
  constructor() {
    this.isSupported = 'geolocation' in navigator;
  }

  // Get cached location
  getCachedLocation() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { timestamp, location } = JSON.parse(cached);
      const now = Date.now();
      
      // Return if cache is still valid
      if (now - timestamp < CACHE_DURATION) {
        return location;
      }
      
      // Clear expired cache
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (error) {
      console.error('Error reading location cache:', error);
      return null;
    }
  }

  // Cache location with timestamp
  cacheLocation(location) {
    try {
      const cacheData = {
        timestamp: Date.now(),
        location
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching location:', error);
    }
  }

  // Clear location cache
  clearCache() {
    localStorage.removeItem(CACHE_KEY);
  }

  // Get current position using browser geolocation
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      console.log('LocationService: Requesting geolocation...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('LocationService: Geolocation success:', position);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('LocationService: Geolocation error:', error);
          let message = 'Unable to retrieve your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied. Please enable location services in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out.';
              break;
          }
          
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Reverse geocoding using OpenStreetMap Nominatim API
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RevoHomes/1.0 (contact@revohomes.com)' // Required by Nominatim policy
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();
      
      if (!data || data.error) {
        throw new Error('Location not found');
      }

      // Extract relevant location information
      const address = data.address || {};
      const locationData = {
        latitude: parseFloat(data.lat),
        longitude: parseFloat(data.lon),
        formattedAddress: data.display_name || '',
        city: address.city || address.town || address.village || '',
        state: address.state || '',
        country: address.country || '',
        postcode: address.postcode || '',
        district: address.district || address.suburb || '',
        raw: data
      };

      return locationData;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Failed to get location details');
    }
  }

  // Search for locations by query using Nominatim
  async searchLocations(query) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RevoHomes/1.0 (contact@revohomes.com)'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search locations');
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        return [];
      }

      return data.map(item => ({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        formattedAddress: item.display_name || '',
        city: item.address?.city || item.address?.town || item.address?.village || '',
        state: item.address?.state || '',
        country: item.address?.country || '',
        postcode: item.address?.postcode || '',
        district: item.address?.district || item.address?.suburb || '',
        importance: parseFloat(item.importance) || 0,
        raw: item
      })).sort((a, b) => b.importance - a.importance); // Sort by importance
    } catch (error) {
      console.error('Location search error:', error);
      throw new Error('Failed to search locations');
    }
  }

  // Clear cached location
  clearCachedLocation() {
    localStorage.removeItem(CACHE_KEY);
    console.log('LocationService: Cache cleared');
  }

  // Auto-detect location (geolocation + reverse geocoding)
  async detectLocation() {
    try {
      console.log('LocationService: Starting location detection...');
      
      // Check cache first
      const cached = this.getCachedLocation();
      if (cached) {
        console.log('LocationService: Using cached location:', cached);
        return cached;
      }

      console.log('LocationService: Getting current position...');
      // Get current position
      const position = await this.getCurrentPosition();
      console.log('LocationService: Got position:', position);
      
      console.log('LocationService: Reverse geocoding...');
      // Reverse geocode to get address details
      const locationData = await this.reverseGeocode(position.latitude, position.longitude);
      console.log('LocationService: Reverse geocoded data:', locationData);
      
      // Cache the result
      this.cacheLocation(locationData);
      
      return locationData;
    } catch (error) {
      console.error('LocationService: Auto-detection error:', error);
      throw error;
    }
  }

  // Calculate distance between two points in kilometers
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Format location for display
  formatLocation(location) {
    if (!location) return '';
    
    // Always return only the city name
    if (location.city) {
      // Clean up city name by removing administrative suffixes
      let cityName = location.city.trim();
      
      // Remove common administrative suffixes
      const suffixes = [
        ' Municipal Corporation',
        ' Municipal Council',
        ' Municipality',
        ' City Corporation',
        ' City',
        ' Nagar Nigam',
        ' Nagar Palika',
        ' M.C.',
        ' M.C',
        ' Corporation'
      ];
      
      for (const suffix of suffixes) {
        if (cityName.endsWith(suffix)) {
          cityName = cityName.slice(0, -suffix.length).trim();
          break;
        }
      }
      
      return cityName;
    } else if (location.formattedAddress) {
      // Extract city from formatted address if available
      const parts = location.formattedAddress.split(',');
      if (parts.length >= 2) {
        let potentialCity = parts[parts.length - 2].trim();
        
        // Clean up the extracted city name
        const suffixes = [
          ' Municipal Corporation',
          ' Municipal Council',
          ' Municipality',
          ' City Corporation',
          ' City',
          ' Nagar Nigam',
          ' Nagar Palika',
          ' M.C.',
          ' M.C',
          ' Corporation'
        ];
        
        for (const suffix of suffixes) {
          if (potentialCity.endsWith(suffix)) {
            potentialCity = potentialCity.slice(0, -suffix.length).trim();
            break;
          }
        }
        
        return potentialCity;
      }
      // If we can't extract city, try to get the first meaningful part
      const firstPart = parts[0].trim();
      return firstPart;
    }
    
    return 'Unknown Location';
  }

  // Get permission status
  async getPermissionStatus() {
    try {
      if ('permissions' in navigator) {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        return status.state;
      }
      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;
