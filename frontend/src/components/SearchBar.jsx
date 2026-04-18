import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Independent House', 'Plot', 'Commercial', 'PG'];
const LOCATIONS = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'];

function SearchBar({ variant = 'hero', initialTab = 'buy' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (propertyType) params.set('type', propertyType);
    if (searchQuery) params.set('q', searchQuery);
    params.set('listing', activeTab);
    navigate(`/properties?${params.toString()}`);
  };

  const isCompact = variant === 'compact';

  return (
    <form onSubmit={handleSearch} className={`w-full ${isCompact ? 'max-w-4xl' : ''}`}>
      <div className={`bg-white rounded-xl shadow-property-hover overflow-hidden ${isCompact ? 'p-4' : 'p-2'}`}>
        <div className={`flex ${isCompact ? 'flex-wrap gap-2' : 'flex-wrap lg:flex-nowrap'} gap-2`}>
          <div className={`flex rounded-lg overflow-hidden border border-gray-200 ${!isCompact && 'flex-1 min-w-[120px]'}`}>
            {['buy', 'rent', 'sell'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-primary text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className={`flex-1 min-w-[200px] ${isCompact ? 'w-full' : ''}`}>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className={`min-w-[180px] ${isCompact ? 'flex-1' : ''}`}>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
            >
              <option value="">Property Type</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type.toLowerCase()}>{type}</option>
              ))}
            </select>
          </div>

          {!isCompact && (
            <div className="min-w-[180px]">
              <input
                type="text"
                placeholder="Keyword (optional)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            className="px-6 py-3 bg-cta text-white font-semibold rounded-lg hover:bg-cta-hover transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </div>
      </div>
    </form>
  );
}

export default SearchBar;
