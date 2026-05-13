import React from 'react';
import {
  MapPin, Navigation, Map, ShieldCheck, Globe, MapPinned,
  Train, Bus, Plane, Car, School, Hospital, ShoppingBag
} from 'lucide-react';

const CONNECTIVITY_FIELDS = [
  { key: 'near_metro_distance', customKey: 'near_metro_distance_custom', label: 'Near Metro Station', icon: Train },
  { key: 'near_railway_distance', customKey: 'near_railway_distance_custom', label: 'Near Railway Station', icon: Train },
  { key: 'near_busstand_distance', customKey: 'near_busstand_distance_custom', label: 'Near Bus Stand', icon: Bus },
  { key: 'near_airport_distance', customKey: 'near_airport_distance_custom', label: 'Near Airport', icon: Plane },
  { key: 'near_highway_distance', customKey: 'near_highway_distance_custom', label: 'Near Highway / Main Road', icon: Car },
  { key: 'near_auto_taxi_distance', customKey: 'near_auto_taxi_distance_custom', label: 'Near Auto / Taxi Stand', icon: Car },
  { key: 'near_hospital_distance', customKey: 'near_hospital_distance_custom', label: 'Near Hospital', icon: Hospital },
  { key: 'near_school_distance', customKey: 'near_school_distance_custom', label: 'Near School', icon: School },
  { key: 'near_market_distance', customKey: 'near_market_distance_custom', label: 'Near Market', icon: ShoppingBag },
];

const DEFAULT_DISTANCE_OPTIONS = [
  { value: '0.5', label: '< 0.5 km' },
  { value: '1', label: '1 km' },
  { value: '2', label: '2 km' },
  { value: '3', label: '3 km' },
  { value: '5', label: '5 km' },
  { value: '10', label: '10 km' },
  { value: '15', label: '15 km' },
  { value: '20', label: '20 km' },
  { value: 'custom', label: 'Custom' },
];

function ConnectivityField({ label, icon: Icon, value, customValue, onValueChange, onCustomChange, options }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
        {label}
      </label>
      <select
        value={value ?? ''}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full px-4 py-3.5 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-700 transition-all shadow-inner appearance-none cursor-pointer"
      >
        <option value="">Select km...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {value === 'custom' && (
        <div className="flex items-center gap-2 mt-1">
          <input
            type="number"
            step="0.1"
            value={customValue ?? ''}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder="Enter km"
            className="flex-1 px-4 py-3 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all shadow-inner"
          />
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">km</span>
        </div>
      )}
    </div>
  );
}

const Step5Location = ({
  formData,
  setFormData,
  handleChange,
  formOptions
}) => {
  const states = formOptions?.states || [];
  const distanceOptions = (formOptions?.distance_options?.length > 0)
    ? formOptions.distance_options
    : DEFAULT_DISTANCE_OPTIONS;

  const reraAuthorities = formOptions?.rera_authorities || [];
  const selectedStateInfo = states.find(s => s.value === formData.state);
  const reraPlaceholder = selectedStateInfo?.placeholder || `e.g. ORERA/PROJECT/2024/000123`;

  const handleConnectivityChange = (distanceKey, customKey, value) => {
    setFormData(prev => ({
      ...prev,
      [distanceKey]: value,
      ...(value !== 'custom' ? { [customKey]: '' } : {})
    }));
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1 mb-8">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          Location &amp; Connectivity
        </h2>
        <p className="text-sm text-gray-500 font-medium">Help buyers find your property easily.</p>
      </div>

      {/* Address Card */}
      <div className="bg-white p-10 rounded-[48px] border-2 border-gray-100 shadow-2xl shadow-gray-200/40 space-y-10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {/* Address Line 1 */}
          <div className="md:col-span-2 lg:col-span-3 space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Address Line 1 *</label>
            <div className="relative group">
              <MapPinned className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
              <input
                type="text"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleChange}
                placeholder="Building name, street address..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Address Line 2 */}
          <div className="md:col-span-2 lg:col-span-3 space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Address Line 2</label>
            <div className="relative group">
              <MapPinned className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
              <input
                type="text"
                name="address_line2"
                value={formData.address_line2}
                onChange={handleChange}
                placeholder="Sector / Phase / Wing"
                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">City *</label>
            <div className="relative group">
              <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Mumbai"
                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Locality */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Locality</label>
            <div className="relative group">
              <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
              <input
                type="text"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                placeholder={formData.city ? `Enter locality in ${formData.city}...` : 'e.g. Andheri West'}
                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* State */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">State *</label>
            <div className="relative group">
              <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
              {states.length > 0 ? (
                <select
                  name="state"
                  value={formData.state}
                  onChange={(e) => {
                    const stateVal = e.target.value;
                    setFormData(prev => ({ ...prev, state: stateVal, rera_state: stateVal }));
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all shadow-inner appearance-none cursor-pointer"
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all shadow-inner"
                />
              )}
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Country</label>
            <div className="relative group">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="IN"
                disabled={!!formData.country}
                className="w-full pl-12 pr-4 py-4 bg-primary/5 border-2 border-transparent rounded-2xl outline-none text-sm font-bold text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* ZIP / Pincode */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">PIN Code</label>
            <div className="relative group">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                placeholder="e.g. 400053"
                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Landmark */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Landmark</label>
            <div className="relative group">
              <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                placeholder="Near Metro Station..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Map Coordinates */}
        <div className="pt-8 border-t-2 border-gray-50 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Navigation size={20} />
            </div>
            <div>
              <h4 className="text-base font-black text-gray-900">Map Coordinates</h4>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Optional — for precise mapping</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-3 items-center">
              <span className="text-[10px] font-black text-gray-400 w-20">LATITUDE</span>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="19.0760"
                className="flex-1 px-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all shadow-inner"
              />
            </div>
            <div className="flex gap-3 items-center">
              <span className="text-[10px] font-black text-gray-400 w-20">LONGITUDE</span>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="72.8777"
                className="flex-1 px-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Connectivity Section */}
      <div className="bg-white p-10 rounded-[48px] border-2 border-gray-100 shadow-2xl shadow-gray-200/40 space-y-8 relative overflow-hidden">
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-blue-50/50 rounded-full blur-[100px]" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
            <Train size={24} />
          </div>
          <div>
            <h4 className="text-xl font-black text-gray-900">Nearby Connectivity</h4>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Distance to key transport &amp; services</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {CONNECTIVITY_FIELDS.map(({ key, customKey, label, icon }) => (
            <ConnectivityField
              key={key}
              label={label}
              icon={icon}
              value={formData[key]}
              customValue={formData[customKey]}
              onValueChange={(val) => handleConnectivityChange(key, customKey, val)}
              onCustomChange={(val) => setFormData(prev => ({ ...prev, [customKey]: val }))}
              options={distanceOptions}
            />
          ))}
        </div>
      </div>

      {/* RERA Section */}
      <div className="bg-primary/5 p-10 rounded-[48px] border-2 border-primary/10 space-y-8 relative overflow-hidden group">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white text-primary rounded-[24px] flex items-center justify-center shadow-xl shadow-primary/5 border-2 border-primary/10">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900">RERA Registration</h4>
              <p className="text-[11px] font-black text-primary uppercase tracking-widest mt-1">Legally required for commercial listings &amp; new projects</p>
            </div>
          </div>

          <div className="flex items-center bg-white p-2 rounded-2xl shadow-inner gap-2">
            <div
              onClick={() => setFormData(prev => ({ ...prev, rera_registered: true }))}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                formData.rera_registered
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Registered
            </div>
            <div
              onClick={() => setFormData(prev => ({ ...prev, rera_registered: false, rera_number: '', rera_authority_id: '' }))}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                !formData.rera_registered
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Not Applied
            </div>
          </div>
        </div>

        {formData.rera_registered && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-500 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">RERA Number *</label>
              <input
                type="text"
                name="rera_number"
                value={formData.rera_number}
                onChange={handleChange}
                placeholder={reraPlaceholder}
                className="w-full px-6 py-5 bg-white border-2 border-primary/20 rounded-[24px] focus:border-primary outline-none text-base font-black text-gray-900 transition-all shadow-xl shadow-primary/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">State / RERA Authority</label>
              {reraAuthorities.length > 0 ? (
                <select
                  name="rera_authority_id"
                  value={formData.rera_authority_id}
                  onChange={handleChange}
                  className="w-full px-6 py-5 bg-white border-2 border-primary/20 rounded-[24px] focus:border-primary outline-none text-base font-black text-gray-900 transition-all shadow-xl shadow-primary/5 appearance-none cursor-pointer"
                >
                  <option value="">Select authority...</option>
                  {reraAuthorities.map(auth => (
                    <option key={auth.id} value={auth.id}>{auth.state_name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="rera_state"
                  value={formData.rera_state}
                  onChange={handleChange}
                  placeholder={formData.state ? `e.g. ${formData.state}RERA` : 'e.g. MahaRERA'}
                  className="w-full px-6 py-5 bg-white border-2 border-primary/20 rounded-[24px] focus:border-primary outline-none text-base font-black text-gray-900 transition-all shadow-xl shadow-primary/5"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step5Location;