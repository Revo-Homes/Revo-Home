import { useState } from 'react';

const BHK_OPTIONS = ['1', '2', '3', '4', '5+'];
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Independent House', 'Plot', 'Commercial', 'Plots', 'PG', 'Coworking'];
const FURNISHING = ['Fully Furnished', 'Semi Furnished', 'Unfurnished'];
const AMENITIES = ['Parking', 'Lift', 'Gym', 'Swimming Pool', 'Security', 'Power Backup', 'Club House', 'Garden'];

const BUDGET_LEVELS = [
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
];

function FilterSidebar({ onFilterChange, onReset }) {
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
              {BUDGET_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
            <select
              value={filters.budgetMax}
              onChange={(e) => handleChange('budgetMax', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary text-sm bg-white"
            >
              <option value="">Max</option>
              {BUDGET_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">BHK</label>
          <div className="flex flex-wrap gap-2">
            {BHK_OPTIONS.map((bhk) => (
              <button
                key={bhk}
                onClick={() => toggleArray('bhk', bhk)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filters.bhk.includes(bhk)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {bhk}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
          <div className="grid grid-cols-2 gap-2">
            {PROPERTY_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.propertyType.includes(type)}
                  onChange={() => toggleArray('propertyType', type)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-xs text-gray-600 group-hover:text-primary transition-colors">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing</label>
          <div className="space-y-2">
            {FURNISHING.map((f) => (
              <label key={f} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.furnishing.includes(f)}
                  onChange={() => toggleArray('furnishing', f)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">{f}</span>
              </label>
            ))}
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
            {AMENITIES.map((a) => (
              <label key={a} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(a)}
                  onChange={() => toggleArray('amenities', a)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-xs text-gray-600 group-hover:text-primary transition-colors">{a}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default FilterSidebar;
