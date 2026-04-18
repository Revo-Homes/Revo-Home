import React, { useState } from 'react';
import PropertyCard from '../components/PropertyCard';

/**
 * Demo component showing PropertyCard with lead tracking functionality
 * Demonstrates how to use the new lead tracking features
 */
const PropertyCardDemo = () => {
  // Sample property data
  const [properties] = useState([
    {
      id: 'prop-1',
      title: 'Luxury 3BHK Apartment in Koramangala',
      price: 45000000,
      priceLabel: '/mo',
      location: 'Koramangala, Bangalore',
      bhk: 3,
      bathrooms: 2,
      area: 1500,
      propertyType: 'Apartment',
      imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600',
      badge: 'featured'
    },
    {
      id: 'prop-2',
      title: 'Modern 2BHK Flat in Indiranagar',
      price: 28000000,
      priceLabel: '/mo',
      location: 'Indiranagar, Bangalore',
      bhk: 2,
      bathrooms: 2,
      area: 1100,
      propertyType: 'Apartment',
      imageUrl: 'https://images.unsplash.com/photo-1600584153206-5282e4f6b71?w=600',
      badge: 'new'
    },
    {
      id: 'prop-3',
      title: 'Spacious 4BHK Villa in Whitefield',
      price: 75000000,
      priceLabel: '/mo',
      location: 'Whitefield, Bangalore',
      bhk: 4,
      bathrooms: 3,
      area: 2200,
      propertyType: 'Villa',
      imageUrl: 'https://images.unsplash.com/photo-1600607225277-9bb24d1cb94?w=600',
      badge: 'premium'
    }
  ]);

  // Handle property card click events
  const handlePropertyClick = (data) => {
    console.log('📊 Property Card Click Data:', data);
    
    // You can add additional logic here:
    // - Analytics tracking
    // - Custom navigation logic
    // - Additional user interactions
    
    if (data.leadGenerated) {
      console.log('🎉 LEAD GENERATED for:', data.property.id);
      console.log('📋 Property Details:', {
        title: data.property.title,
        price: data.property.price,
        location: data.property.location,
        type: data.property.propertyType,
        timestamp: data.timestamp
      });
    } else {
      console.log('⚠️ Lead generation attempted (may have failed):', data.property.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Cards with Lead Tracking</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Click on any property card to navigate to property details. The system generates a lead on EVERY click for logged-in users and sends it to your backend API. 
            <strong>Note:</strong> Property details are restricted to logged-in users only.
          </p>
        </div>

        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
              onPropertyClick={handlePropertyClick}
            />
          ))}
        </div>

        {/* Instructions Panel */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 How Lead Tracking Works</h2>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="text-green-500 font-semibold">🎯 Every Click:</span>
              <span>Generates lead for logged-in users, sends to backend API</span>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-blue-500 font-semibold">🔒 Property Details:</span>
              <span>Restricted to logged-in users only (login prompt shown)</span>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-purple-500 font-semibold">🔄 No Restrictions:</span>
              <span>Lead generated on every property click (no first-time limits)</span>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-orange-500 font-semibold">📡 API Integration:</span>
              <span>Sends complete lead payload to your backend</span>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-red-500 font-semibold">🚫 Non-Logged-in Users:</span>
              <span>Can view cards but get login prompt on property details</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">🔧 Console Output Examples:</h3>
            <div className="text-xs text-gray-600 space-y-2">
              <div className="bg-black p-2 rounded text-red-400 font-mono">
                🔒 User not logged in - showing login modal
              </div>
              <div className="bg-black p-2 rounded text-green-400 font-mono">
                🎯 Generating lead for property: prop-1
              </div>
              <div className="bg-black p-2 rounded text-blue-400 font-mono">
                📋 Lead payload: {"{first_name: \"Property\", email: \"...\", ...}"}
              </div>
              <div className="bg-black p-2 rounded text-yellow-400 font-mono">
                ✅ Lead generated successfully: {"{success: true, data: {...}}"}
              </div>
              <div className="bg-black p-2 rounded text-purple-400 font-mono">
                🎉 NEW LEAD CREATED for property prop-1 by user user-123
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Open browser console and click property cards to see the detailed lead generation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCardDemo;
