import { useState, useEffect } from 'react';
import { propertyApi } from '../services/api';

function FilterSidebar({ onFilterChange, onReset }) {
  const [formOptions, setFormOptions] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  const [filters, setFilters] = useState({
    location: '',
    budgetMin: '',
    budgetMax: '',
    bhk: [],
    propertyType: [],
    furnishing: [],
    areaMin: '',
    areaMax: '',
    amenities: [],
  });

  // Fetch all form options from database
  useEffect(() => {
    const fetchFormOptions = async () => {
      try {
        const response = await propertyApi.getFormOptions();
        const data = response?.data || response;
        setFormOptions(data);
      } catch (error) {
        console.error('Failed to fetch form options:', error);
        // Fallback to hardcoded values if API fails
        setFormOptions({
          property_types: [{ id: 1, name: 'Apartment' }, { id: 2, name: 'Villa' }, { id: 3, name: 'Independent House' }, { id: 4, name: 'Plot' }, { id: 5, name: 'Commercial' }],
          bhk: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5+', label: '5+' }],
          furnishing: [{ value: 'fully_furnished', label: 'Fully Furnished' }, { value: 'semi_furnished', label: 'Semi Furnished' }, { value: 'unfurnished', label: 'Unfurnished' }],
          amenities: [{ value: 'parking', label: 'Parking' }, { value: 'lift', label: 'Lift' }, { value: 'gym', label: 'Gym' }],
          budget: [
            { label: '5 Lac', value: 500000 },
            { label: '10 Lac', value: 1000000 },
            { label: '15 Lac', value: 1500000 },
            { label: '20 Lac', value: 2000000 },
            { label: '25 Lac', value: 2500000 },
            { label: '30 Lac', value: 3000000 },
            { label: '40 Lac', value: 4000000 },
            { label: '50 Lac', value: 5000000 },
            { label: '60 Lac', value: 6000000 },
            { label: '75 Lac', value: 7500000 },
            { label: '90 Lac', value: 9000000 },
            { label: '1 Cr', value: 10000000 },
            { label: '1.25 Cr', value: 12500000 },
            { label: '1.5 Cr', value: 15000000 },
            { label: '2 Cr', value: 20000000 },
            { label: '3 Cr', value: 30000000 },
            { label: '5 Cr+', value: 50000000 },
          ]
        });
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchFormOptions();
  }, []);

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const toggleArray = (key, item) => {
    const arr = filters[key];
    const newArr = arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
    handleChange(key, newArr);
  };

  const handleReset = () => {
    setFilters({
      location: '',
      budgetMin: '',
      budgetMax: '',
      bhk: [],
      propertyType: [],
      furnishing: [],
      areaMin: '',
      areaMax: '',
      amenities: [],
    });
    onReset?.();
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Filters</h3>
          <button
            onClick={handleReset}
            className="text-sm text-primary hover:underline"
          >
            Reset
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            placeholder="City or area"
            value={filters.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹)</label>
          <div className="flex gap-2">
            <select
              value={filters.budgetMin}
              onChange={(e) => handleChange('budgetMin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary text-sm bg-white"
            >
              <option value="">Min</option>
              {(formOptions.budget || []).map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
            <select
              value={filters.budgetMax}
              onChange={(e) => handleChange('budgetMax', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary text-sm bg-white"
            >
              <option value="">Max</option>
              {(formOptions.budget || []).map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">BHK</label>
          <div className="flex flex-wrap gap-2">
            {(formOptions.bhk || []).map((bhk) => {
              const bhkValue = bhk.value || bhk.label || bhk;
              const bhkLabel = bhk.label || bhk.value || bhk;
              return (
                <button
                  key={bhkValue}
                  onClick={() => toggleArray('bhk', bhkValue)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.bhk.includes(bhkValue)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {bhkLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
          {loadingOptions ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {(formOptions.property_types || []).map((type) => {
                const typeName = type.name || type.label || type;
                return (
                  <label key={type.id || type.value || typeName} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.propertyType.includes(typeName)}
                      onChange={() => toggleArray('propertyType', typeName)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-xs text-gray-600 group-hover:text-primary transition-colors">{typeName}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing</label>
          <div className="space-y-2">
            {(formOptions.furnishing || []).map((f) => {
              const furnishingValue = f.value || f.label || f;
              const furnishingLabel = f.label || f.value || f;
              return (
                <label key={furnishingValue} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.furnishing.includes(furnishingLabel)}
                    onChange={() => toggleArray('furnishing', furnishingLabel)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{furnishingLabel}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Area (sq.ft)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.areaMin}
              onChange={(e) => handleChange('areaMin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.areaMax}
              onChange={(e) => handleChange('areaMax', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
          <div className="grid grid-cols-2 gap-2">
            {(formOptions.amenities || []).map((amenity) => {
              const amenityValue = amenity.value || amenity.label || amenity;
              const amenityLabel = amenity.label || amenity.value || amenity;
              return (
                <label key={amenityValue} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenityLabel)}
                    onChange={() => toggleArray('amenities', amenityLabel)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-xs text-gray-600">{amenityLabel}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
