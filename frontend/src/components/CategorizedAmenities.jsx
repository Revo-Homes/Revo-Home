import React from 'react';
import { 
  Check, 
  Waves, 
  Dumbbell, 
  Trees, 
  Gamepad2, 
  Activity, 
  Users, 
  ShieldCheck, 
  Video, 
  Lock, 
  Zap, 
  Droplets, 
  ArrowUpCircle, 
  Dog, 
  Car,
  Siren,
  Utensils,
  Wifi
} from 'lucide-react';

// Base amenity definitions
const BASE_AMENITIES = {
  swimmingPool: { name: 'Swimming Pool', icon: Waves },
  gym: { name: 'Gym', icon: Dumbbell },
  garden: { name: 'Garden', icon: Trees },
  kidsPlayArea: { name: 'Kids Play Area', icon: Gamepad2 },
  basketballCourt: { name: 'Basketball Court', icon: Activity },
  tennisCourt: { name: 'Tennis Court', icon: Activity },
  badmintonCourt: { name: 'Badminton Court', icon: Activity },
  joggingTrack: { name: 'Jogging Track', icon: Activity },
  communityHall: { name: 'Community Hall', icon: Users },
  restaurant: { name: 'Restaurant / Food', icon: Utensils },
  cafeteria: { name: 'Cafeteria', icon: Utensils }
};

const BASE_SECURITY = {
  security24: { name: '24/7 Security', icon: ShieldCheck },
  cctv: { name: 'CCTV', icon: Video },
  gatedCommunity: { name: 'Gated Community', icon: Lock },
  securityPatrol: { name: 'Security Patrol', icon: Siren },
  accessControl: { name: 'Access Control', icon: Lock },
  fireAlarm: { name: 'Fire Alarm', icon: Siren }
};

const BASE_UTILITIES = {
  water24: { name: '24/7 Water', icon: Droplets },
  powerBackup: { name: 'Power Backup', icon: Zap },
  elevator: { name: 'Elevator', icon: ArrowUpCircle },
  guestParking: { name: 'Guest Parking', icon: Car },
  wasteManagement: { name: 'Waste Management', icon: ArrowUpCircle },
  internet: { name: 'Internet Connectivity', icon: Video },
  wifi: { name: 'WiFi / Internet', icon: Wifi },
  waterSupply: { name: 'Water Supply', icon: Droplets },
  electricity: { name: 'Electricity Availability', icon: Zap },
  petFriendly: { name: 'Pet Friendly', icon: Dog }
};

// Property type-specific amenity configurations
const PROPERTY_AMENITIES_CONFIG = {
  Residential: {
    amenities: [
      BASE_AMENITIES.swimmingPool,
      BASE_AMENITIES.gym,
      BASE_AMENITIES.garden,
      BASE_AMENITIES.kidsPlayArea,
      BASE_AMENITIES.basketballCourt,
      BASE_AMENITIES.tennisCourt,
      BASE_AMENITIES.badmintonCourt,
      BASE_AMENITIES.joggingTrack,
      BASE_AMENITIES.communityHall
    ],
    security: [
      BASE_SECURITY.security24,
      BASE_SECURITY.cctv,
      BASE_SECURITY.gatedCommunity,
      BASE_SECURITY.securityPatrol,
      BASE_SECURITY.accessControl
    ],
    utilities: [
      BASE_UTILITIES.water24,
      BASE_UTILITIES.powerBackup,
      BASE_UTILITIES.elevator,
      BASE_UTILITIES.guestParking,
      BASE_UTILITIES.wasteManagement,
      BASE_UTILITIES.internet,
      BASE_UTILITIES.petFriendly
    ]
  },
  
  Commercial: {
    amenities: [
      BASE_AMENITIES.cafeteria
    ],
    security: [
      BASE_SECURITY.cctv,
      BASE_SECURITY.securityPatrol,
      BASE_SECURITY.accessControl,
      BASE_SECURITY.fireAlarm
    ],
    utilities: [
      BASE_UTILITIES.powerBackup,
      BASE_UTILITIES.elevator,
      BASE_UTILITIES.internet,
      BASE_UTILITIES.guestParking
    ]
  },
  
  Land: {
    utilities: [
      BASE_UTILITIES.waterSupply,
      BASE_UTILITIES.electricity
    ]
  },
  
  Industrial: {
    security: [
      BASE_SECURITY.cctv,
      BASE_SECURITY.securityPatrol,
      BASE_SECURITY.accessControl,
      BASE_SECURITY.fireAlarm
    ],
    utilities: [
      BASE_UTILITIES.powerBackup,
      BASE_UTILITIES.waterSupply,
      BASE_UTILITIES.wasteManagement
    ]
  },
  
  Hospitality: {
    amenities: [
      BASE_AMENITIES.swimmingPool,
      BASE_AMENITIES.gym,
      BASE_AMENITIES.garden,
      BASE_AMENITIES.restaurant,
      BASE_AMENITIES.communityHall
    ],
    security: [
      BASE_SECURITY.cctv,
      BASE_SECURITY.security24,
      BASE_SECURITY.fireAlarm
    ],
    utilities: [
      BASE_UTILITIES.wifi,
      BASE_UTILITIES.powerBackup,
      BASE_UTILITIES.elevator,
      BASE_UTILITIES.guestParking
    ]
  }
};

const getFilteredAmenities = (propertyType) => {
  return PROPERTY_AMENITIES_CONFIG[propertyType] || {};
};

function CategorizedAmenities({ formData, onChange, propertyType }) {
  const toggleAmenity = (category, item) => {
    const currentList = formData[category] || [];
    const newList = currentList.includes(item)
      ? currentList.filter(i => i !== item)
      : [...currentList, item];
    
    onChange(category, newList);
  };

  const filteredAmenities = getFilteredAmenities(propertyType);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {Object.entries(filteredAmenities).map(([category, items]) => (
        <div key={category} className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] pl-2 border-l-4 border-red-600">
              {category}
            </h3>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = formData[category]?.includes(item.name);
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => toggleAmenity(category, item.name)}
                  className={`group relative flex items-center gap-4 p-5 rounded-[24px] font-bold transition-all border-2 text-left focus:outline-none ${
                    isActive
                      ? 'bg-white border-red-600 text-red-600 shadow-xl shadow-red-100/50'
                      : 'bg-gray-50/50 border-transparent text-gray-500 hover:bg-white hover:border-gray-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    isActive ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white text-gray-400 group-hover:text-red-600'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm block leading-tight">{item.name}</span>
                  </div>
                  {isActive && (
                    <div className="absolute top-4 right-4 text-red-600">
                      <Check size={16} strokeWidth={4} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CategorizedAmenities;
