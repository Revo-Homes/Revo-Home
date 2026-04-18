import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '../contexts/LocationContext';
import { MapPin, Search, Loader2, X, Navigation, ChevronDown } from 'lucide-react';

const LocationSelector = ({ 
  onLocationChange, 
  showDistance = false,
  compact = false,
  className = '',
  placeholder = 'Enter city or area...'
}) => {
  const {
    location,
    loading,
    error,
    searchResults,
    isDetecting,
    isSupported,
    detectLocation,
    searchLocations,
    selectLocation,
    clearLocation,
    formatLocation
  } = useLocation();

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Check permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const status = await navigator.permissions?.query({ name: 'geolocation' });
        if (status) {
          setPermissionStatus(status.state);
          status.addEventListener('change', () => setPermissionStatus(status.state));
        }
      } catch (error) {
        // Permission API not supported
        setPermissionStatus('unknown');
      }
    };

    if (isSupported) {
      checkPermission();
    }
  }, [isSupported]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle location detection
  const handleDetectLocation = async () => {
    try {
      await detectLocation();
      setShowDropdown(false);
      onLocationChange?.();
    } catch (error) {
      console.error('Location detection failed:', error);
    }
  };

  // Handle search input
  const handleSearchInput = async (value) => {
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      setIsSearching(true);
      await searchLocations(value);
      setIsSearching(false);
    } else {
      setShowDropdown(false);
    }
  };

  // Handle location selection
  const handleSelectLocation = async (locationData) => {
    try {
      await selectLocation(locationData);
      setShowDropdown(false);
      setSearchQuery('');
      onLocationChange?.();
    } catch (error) {
      console.error('Location selection failed:', error);
    }
  };

  // Handle clear location
  const handleClearLocation = () => {
    clearLocation();
    setSearchQuery('');
    onLocationChange?.();
  };

  // Get display text
  const getDisplayText = () => {
    if (isSearching) return 'Searching...';
    if (isDetecting) return 'Detecting location...';
    if (location) return formatLocation();
    return placeholder;
  };

  const getIcon = () => {
    if (loading || isDetecting) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (location) return <MapPin className="w-4 h-4" />;
    return <Search className="w-4 h-4" />;
  };

  if (!isSupported) {
    return (
      <div className={`p-3 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <p className="text-sm text-yellow-800">
          Location services are not supported in your browser.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
        >
          {getIcon()}
          <span className="truncate">{getDisplayText()}</span>
          <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-3">
              {/* Detect current location */}
              <button
                onClick={handleDetectLocation}
                disabled={isDetecting}
                className="w-full flex items-center gap-2 p-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <Navigation className="w-4 h-4" />
                {isDetecting ? 'Detecting...' : 'Use my current location'}
              </button>

              {/* Search input */}
              <div className="mt-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    placeholder="Search for a location..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectLocation(result)}
                      className="w-full text-left p-2 text-sm hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        {result.city || result.formattedAddress.split(',')[0]}
                      </div>
                      <div className="text-gray-500 truncate">
                        {result.formattedAddress}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Clear location */}
              {location && (
                <button
                  onClick={handleClearLocation}
                  className="w-full mt-3 p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear location
                </button>
              )}

              {/* Error message */}
              {error && (
                <div className="mt-2 p-2 text-sm text-red-600 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Current location display */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {location ? 'Your Location' : 'Select Location'}
              </p>
              <p className="text-sm text-gray-600">
                {getDisplayText()}
              </p>
            </div>
          </div>
          
          {location && (
            <button
              onClick={handleClearLocation}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {error && (
          <div className="mt-2 p-2 text-sm text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Location controls */}
      <div className="border-t border-gray-200 p-4 space-y-3">
        {/* Detect current location */}
        <button
          onClick={handleDetectLocation}
          disabled={isDetecting}
          className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Navigation className="w-4 h-4" />
          {isDetecting ? 'Detecting location...' : 'Use my current location'}
        </button>

        {/* Search for location */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search for a city or area..."
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Search results dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelectLocation(result)}
                className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">
                  {result.city || result.formattedAddress.split(',')[0]}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {result.formattedAddress}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Permission note */}
      {permissionStatus === 'denied' && (
        <div className="px-4 pb-4">
          <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded-lg">
            Location access is denied. Please enable it in your browser settings to use automatic location detection.
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;