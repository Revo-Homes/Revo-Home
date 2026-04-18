import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { locationService } from '../services/locationService';

// Popular cities for quick selection
const POPULAR_CITIES = [
  { name: 'Mumbai', state: 'Maharashtra' },
  { name: 'Bangalore', state: 'Karnataka' },
  { name: 'Delhi NCR', state: 'Delhi' },
  { name: 'Hyderabad', state: 'Telangana' },
  { name: 'Pune', state: 'Maharashtra' },
  { name: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Kolkata', state: 'West Bengal' },
  { name: 'Bhubaneswar', state: 'Odisha' }
];

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('unknown');

  // Check if geolocation is supported
  const isSupported = locationService.isSupported;

  // Initialize location state and check permissions
  useEffect(() => {
    const initializeLocation = async () => {
      // Check permission status
      try {
        const status = await locationService.getPermissionStatus();
        setPermissionStatus(status);
      } catch (error) {
        console.error('Error checking permission status:', error);
      }

      // Load cached location if available
      const cachedLocation = locationService.getCachedLocation();
      if (cachedLocation) {
        setLocation(cachedLocation);
      }
    };

    initializeLocation();
  }, []);

  // Auto-detect location (only called manually, not on mount)
  const detectLocation = useCallback(async () => {
    console.log('LocationContext: Starting detectLocation...');
    
    if (!isSupported) {
      const error = 'Location services are not supported by your browser';
      console.error('LocationContext:', error);
      setError(error);
      return;
    }

    setLoading(true);
    setError(null);
    setIsDetecting(true);

    try {
      console.log('LocationContext: Calling locationService.detectLocation()...');
      const locationData = await locationService.detectLocation();
      console.log('LocationContext: Got location data:', locationData);
      
      setLocation(locationData);
      setError(null);
      console.log('LocationContext: Location detection successful!');
      return locationData;
    } catch (err) {
      const errorMessage = err.message || 'Failed to detect location';
      console.error('LocationContext: Detection failed:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
      setIsDetecting(false);
      console.log('LocationContext: Detection process completed');
    }
  }, [isSupported]);

  // Force fresh location detection (clears cache)
  const forceDetectLocation = useCallback(async () => {
    console.log('LocationContext: Force detecting location (clearing cache)...');
    locationService.clearCachedLocation();
    return await detectLocation();
  }, [detectLocation]);

  // Search for locations by query
  const searchLocations = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await locationService.searchLocations(query.trim());
      setSearchResults(results);
    } catch (err) {
      const errorMessage = err.message || 'Failed to search locations';
      setError(errorMessage);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Select a location (from search results or popular cities)
  const selectLocation = useCallback(async (locationData) => {
    setLoading(true);
    setError(null);

    try {
      // If we have coordinates but no full address, do reverse geocoding
      if (locationData.latitude && locationData.longitude && !locationData.formattedAddress) {
        const fullLocation = await locationService.reverseGeocode(
          locationData.latitude,
          locationData.longitude
        );
        setLocation(fullLocation);
        locationService.cacheLocation(fullLocation);
      } else {
        // Use the provided location data as-is
        setLocation(locationData);
        locationService.cacheLocation(locationData);
      }
      
      setSearchResults([]);
    } catch (err) {
      const errorMessage = err.message || 'Failed to set location';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Select popular city
  const selectPopularCity = useCallback(async (cityName, stateName) => {
    setLoading(true);
    setError(null);

    try {
      // Search for the city to get coordinates
      const results = await locationService.searchLocations(`${cityName}, ${stateName}`);
      
      if (results.length > 0) {
        const cityData = results[0];
        setLocation(cityData);
        locationService.cacheLocation(cityData);
      } else {
        throw new Error(`Could not find ${cityName}, ${stateName}`);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to select city';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear current location
  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
    setSearchResults([]);
    locationService.clearCache();
  }, []);

  // Format location for display
  const formatLocation = useCallback(() => {
    return locationService.formatLocation(location);
  }, [location]);

  // Calculate distance from user location
  const calculateDistance = useCallback((latitude, longitude) => {
    if (!location || !location.latitude || !location.longitude) {
      return null;
    }
    return locationService.calculateDistance(
      location.latitude,
      location.longitude,
      latitude,
      longitude
    );
  }, [location]);

  // Get current permission status
  const checkPermissionStatus = useCallback(async () => {
    try {
      const status = await locationService.getPermissionStatus();
      setPermissionStatus(status);
      return status;
    } catch (error) {
      console.error('Error checking permission status:', error);
      return 'unknown';
    }
  }, []);

  const value = {
    // State
    location,
    loading,
    error,
    searchResults,
    isDetecting,
    isSupported,
    permissionStatus,
    popularCities: POPULAR_CITIES,

    // Actions
    detectLocation,
    forceDetectLocation,
    searchLocations,
    selectLocation,
    selectPopularCity,
    clearLocation,
    formatLocation,
    calculateDistance,
    checkPermissionStatus
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;
