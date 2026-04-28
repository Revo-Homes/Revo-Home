import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import FilterSidebar from '../components/FilterSidebar';
import { useProperty } from '../contexts/PropertyContext';
import { useLocation } from '../contexts/LocationContext';

function Properties() {
  const [searchParams] = useSearchParams();
  const { listings = [], featured = [], loading: propertyLoading, error, fetchPropertiesWithFilters } = useProperty();
  const { calculateDistance } = useLocation();
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [filters, setFilters] = useState({});
  const [isFiltering, setIsFiltering] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  // Server-side filtering with backend API
  const handleFilterChange = React.useCallback(async (newFilters) => {
    setFilters(newFilters);
    setIsFiltering(true);

    // Check if any filters are active
    const hasActiveFilters = Object.values(newFilters).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value && value !== '' && value !== 'all';
    });

    if (!hasActiveFilters) {
      // No filters - show all listings
      setFilteredProperties((listings || []).filter((item) => !item.disabled));
      setIsFiltering(false);
      return;
    }

    try {
      // Call server-side filter function
      const results = await fetchPropertiesWithFilters(newFilters);
      setFilteredProperties(results);
    } catch (err) {
      console.error('Server-side filtering failed:', err);
      // Fallback to client-side filtering on all listings
      let filtered = (listings || []).filter(p => !p.disabled);
      
      if (newFilters.location) {
        filtered = filtered.filter((p) =>
          p.location?.toLowerCase().includes(newFilters.location.toLowerCase()) ||
          p.title?.toLowerCase().includes(newFilters.location.toLowerCase())
        );
      }
      if (newFilters.listingType && newFilters.listingType !== 'all') {
        filtered = filtered.filter((p) => p.listingType === newFilters.listingType);
      }
      if (newFilters.bhk?.length > 0) {
        filtered = filtered.filter((p) => {
          const bhkValue = Number.parseInt(String(p.bhk), 10);
          return newFilters.bhk.some((selected) => {
            if (selected === '5+') return bhkValue >= 5;
            return String(bhkValue) === String(selected);
          });
        });
      }
      if (newFilters.budgetMin) {
        filtered = filtered.filter((p) => Number(p.price) >= Number(newFilters.budgetMin));
      }
      if (newFilters.budgetMax) {
        filtered = filtered.filter((p) => Number(p.price) <= Number(newFilters.budgetMax));
      }
      if (newFilters.propertyType?.length > 0) {
        filtered = filtered.filter((p) =>
          newFilters.propertyType.some((type) => type.toLowerCase() === String(p.propertyType).toLowerCase())
        );
      }
      if (newFilters.furnishing?.length > 0) {
        filtered = filtered.filter((p) =>
          newFilters.furnishing.some((item) => item.toLowerCase() === String(p.furnished).toLowerCase())
        );
      }
      if (newFilters.areaMin) {
        filtered = filtered.filter((p) => Number(p.area) >= Number(newFilters.areaMin));
      }
      if (newFilters.areaMax) {
        filtered = filtered.filter((p) => Number(p.area) <= Number(newFilters.areaMax));
      }
      if (newFilters.amenities?.length > 0) {
        filtered = filtered.filter((p) =>
          newFilters.amenities.every((selectedAmenity) =>
            (p.amenities || []).some((amenity) =>
              String(amenity).toLowerCase().includes(selectedAmenity.toLowerCase())
            )
          )
        );
      }
      setFilteredProperties(filtered);
    } finally {
      setIsFiltering(false);
    }
  }, [listings, fetchPropertiesWithFilters]);

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

  const handleReset = () => {
    setFilters({});
    setFilteredProperties((listings || []).filter((item) => !item.disabled));
    window.history.replaceState(null, '', '/properties');
  };
   const getSortedProperties = (properties, sort) => {
    const sorted = [...properties];

    // Build featured ID set from the separately fetched featured list
    // Normalize IDs to strings to handle type mismatches (string vs number)
    // This fixes the case where /listings endpoint doesn't return is_featured
    const featuredIds = new Set(
      featured
        .map(f => {
          const id = f.id || f.listingId;
          return id ? String(id) : null;
        })
        .filter(Boolean)
    );

    const isFeatured = (p) => {
      const id = String(p.id || p.listingId);
      return (
        featuredIds.has(id) ||
        p.badge === 'featured' ||
        Boolean(p.is_featured)
      );
    };

    // Live distance calculator — fixes the case where location was granted
    // after properties were already fetched (distance would be null on all)
    // Also handles missing latitude/longitude and null calculateDistance returns
    const getDistance = (p) => {
      if (p.distance !== null && p.distance !== undefined && p.distance !== Infinity) {
        return p.distance;
      }
      if (p.latitude && p.longitude) {
        const distance = calculateDistance(p.latitude, p.longitude);
        if (distance !== null && distance !== undefined) {
          return distance;
        }
      }
      return Infinity; // Properties without coordinates sort last
    };

    switch (sort) {
      case 'price_asc':
        return sorted.sort((a, b) => Number(a.price) - Number(b.price));
      case 'price_desc':
        return sorted.sort((a, b) => Number(b.price) - Number(a.price));
      case 'area_asc':
        return sorted.sort((a, b) => Number(a.area) - Number(b.area));
      case 'area_desc':
        return sorted.sort((a, b) => Number(b.area) - Number(a.area));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      case 'featured':
        return sorted.sort((a, b) => (isFeatured(b) ? 1 : 0) - (isFeatured(a) ? 1 : 0));
      case 'verified':
        return sorted.sort((a, b) => {
          const aV = a.owner?.verified || Boolean(a.is_verified) ? 1 : 0;
          const bV = b.owner?.verified || Boolean(b.is_verified) ? 1 : 0;
          return bV - aV;
        });
      case 'most_viewed':
        return sorted.sort((a, b) => Number(b.views || 0) - Number(a.views || 0));
      case 'most_enquired':
        return sorted.sort((a, b) => Number(b.inquiries_count || 0) - Number(a.inquiries_count || 0));
      case 'most_saved':
        return sorted.sort((a, b) => Number(b.favorites_count || 0) - Number(a.favorites_count || 0));
      case 'nearest':
        return sorted.sort((a, b) => getDistance(a) - getDistance(b));
      case 'top_rated':
  return sorted.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
      default:
        return sorted;
    }
  };


  const activeFilterCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    return value ? count + 1 : count;
  }, 0);
  const displayProperties = getSortedProperties(filteredProperties, sortBy);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      <div className="mb-8 rounded-[28px] border border-gray-200 bg-gradient-to-br from-white via-orange-50/50 to-amber-50 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-primary/80">Property Search</p>
            <h1 className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl">Find the right property faster</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-gray-600 sm:text-base">
              We&apos;re now showing the full catalog coming from the backend, with filters for budget, furnishing, amenities, and location.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Available</p>
              <p className="mt-1 text-2xl font-black text-gray-900">{listings.filter((item) => !item.disabled).length}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Filtered</p>
              <p className="mt-1 text-2xl font-black text-primary">{filteredProperties.length}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-white px-4 py-2 font-semibold text-gray-700 shadow-sm ring-1 ring-gray-100">
            {filteredProperties.length} results found
          </span>
          <span className="rounded-full bg-gray-900 px-4 py-2 font-semibold text-white shadow-sm">
            {activeFilterCount} active filters
          </span>
          {error && (
            <span className="rounded-full bg-red-50 px-4 py-2 font-semibold text-red-600 ring-1 ring-red-100">
              {error}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-end mb-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="default">Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="area_asc">Area: Low to High</option>
              <option value="area_desc">Area: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="verified">Verified First</option>
              <option value="most_viewed">Most Viewed</option>
              <option value="most_enquired">Most Enquired</option>
              <option value="featured">Featured First</option>
              <option value="top_rated">Top Rated</option>
              <option value="most_saved">Most Saved</option>
              <option value="nearest">Nearest First</option>
            </select>
          </div>
          {(propertyLoading || isFiltering) && filteredProperties.length === 0 ? (
            <div className="flex items-center justify-center py-20">
               <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {displayProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  {...prop}
                />
              ))}
            </div>
          )}
          
          {displayProperties.length === 0 && !propertyLoading && !isFiltering && (
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