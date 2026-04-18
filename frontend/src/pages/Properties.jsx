import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import FilterSidebar from '../components/FilterSidebar';
import { useProperty } from '../contexts/PropertyContext';

function Properties() {
  const [searchParams] = useSearchParams();
  const { listings, loading: propertyLoading } = useProperty();
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [filters, setFilters] = useState({});
  
  // Debug logging
  console.log('Properties.jsx: Received listings from context:', listings);
  console.log('Properties.jsx: Property loading state:', propertyLoading);

  const handleFilterChange = React.useCallback((newFilters) => {
    setFilters(newFilters);
    if (!listings || listings.length === 0) return;
    
    let filtered = (listings || []).filter(p => !p.disabled);
    console.log('Properties.jsx: Filtering', listings.length, 'listings with filters:', newFilters);
    
    if (newFilters.location) {
      filtered = filtered.filter((p) =>
        p.location?.toLowerCase().includes(newFilters.location.toLowerCase()) ||
        p.title?.toLowerCase().includes(newFilters.location.toLowerCase())
      );
    }
    // ... rest of filters
    if (newFilters.listingType && newFilters.listingType !== 'all') {
      filtered = filtered.filter((p) => p.listingType === newFilters.listingType);
    }
    if (newFilters.bhk?.length > 0) {
      filtered = filtered.filter((p) => newFilters.bhk.includes(p.bhk?.toString()));
    }
    if (newFilters.budgetMin) {
      filtered = filtered.filter((p) => Number(p.price) >= Number(newFilters.budgetMin));
    }
    if (newFilters.budgetMax) {
      filtered = filtered.filter((p) => Number(p.price) <= Number(newFilters.budgetMax));
    }
    if (newFilters.propertyType?.length > 0) {
      filtered = filtered.filter((p) =>
        newFilters.propertyType.includes(p.propertyType)
      );
    }
    if (newFilters.areaMin) {
      filtered = filtered.filter((p) => Number(p.area) >= Number(newFilters.areaMin));
    }
    if (newFilters.areaMax) {
      filtered = filtered.filter((p) => Number(p.area) <= Number(newFilters.areaMax));
    }
    
    console.log('Properties.jsx: Resulting listings count:', filtered.length);
    setFilteredProperties(filtered);
  }, [listings]);

  useEffect(() => {
    // Sync all search parameters from URL
    const urlFilters = {};
    for (const [key, value] of searchParams.entries()) {
      if (['bhk', 'propertyType', 'furnishing', 'amenities'].includes(key)) {
        urlFilters[key] = value.split(',');
      } else {
        urlFilters[key] = value;
      }
    }
    
    handleFilterChange(urlFilters);
  }, [searchParams, handleFilterChange]); 
  // Removed duplicated lines

  const handleReset = () => {
    setFilters({});
    setFilteredProperties(listings);
    window.history.replaceState(null, '', '/properties');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Properties Listing</h1>
        <p className="text-gray-500 font-medium mt-1">
          {filteredProperties.length} results found
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />
        <div className="flex-1 min-w-0">
          {propertyLoading && filteredProperties.length === 0 ? (
            <div className="flex items-center justify-center py-20">
               <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  {...prop}
                />
              ))}
            </div>
          )}
          
          {filteredProperties.length === 0 && !propertyLoading && (
            <div className="bg-gray-50 rounded-[32px] p-20 text-center border-2 border-dashed border-gray-200">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-2">No properties found</h3>
               <p className="text-gray-500 mb-8 font-medium">Try adjusting your filters or searching in a different area.</p>
               <button
                 onClick={handleReset}
                 className="px-8 py-3 bg-primary text-white font-black rounded-xl hover:shadow-lg transition-all"
               >
                 Clear All Filters
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Properties;
