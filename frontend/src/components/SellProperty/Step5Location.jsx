import React from 'react';
import { MapPin, Navigation, Map, ShieldCheck, GraduationCap, Hospital, ShoppingBag, Plus, X, Globe, MapPinned } from 'lucide-react';

const Step5Location = ({ 
  formData, 
  setFormData, 
  handleChange,
  nearbyLocations,
  setNearbyLocations,
  handleNearbyLocationChange,
  addNearbyLocation,
  removeNearbyLocation,
  formOptions
}) => {
  const states = formOptions?.states || [];
  const selectedStateInfo = states.find(s => s.value === formData.state);
  const reraPlaceholder = selectedStateInfo?.placeholder || `e.g. ${selectedStateInfo?.code || ''}123456789`;
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1 mb-8">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" /> 
          Location & Connectivity
        </h2>
        <p className="text-sm text-gray-500 font-medium">Help users find your property easily.</p>
      </div>

      {/* Address Information Card */}
      <div className="bg-white p-10 rounded-[48px] border-2 border-gray-100 shadow-2xl shadow-gray-200/40 space-y-10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
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
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Locality *</label>
            <div className="relative group">
              <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
              <input
                type="text"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                placeholder="e.g. Andheri West"
                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* State */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">State *</label>
            <div className="relative group">
              <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
              <select
                name="state"
                value={formData.state}
                onChange={(e) => {
                  const stateVal = e.target.value;
                  const stateObj = states.find(s => s.value === stateVal);
                  setFormData(prev => ({
                    ...prev,
                    state: stateVal,
                    rera_state: stateVal // Auto-fill RERA state
                  }));
                }}
                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all shadow-inner appearance-none cursor-pointer"
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* PIN Code */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">PIN Code *</label>
            <div className="relative group">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
              <input
                type="number"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                placeholder="e.g. 400053"
                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Full Address */}
          <div className="md:col-span-2 lg:col-span-3 space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Address / Landmark *</label>
            <div className="relative group">
              <MapPinned className="absolute left-5 top-5 text-gray-400 group-focus-within:text-primary transition-colors w-6 h-6" />
              <textarea
                name="full_address"
                value={formData.full_address}
                onChange={handleChange}
                placeholder="Building name, street, floor, landmark..."
                rows={3}
                className="w-full pl-14 pr-6 py-5 bg-gray-50/50 border-2 border-transparent rounded-[32px] focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all resize-none shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Coordinates (Optional) */}
        <div className="pt-8 border-t-2 border-gray-50 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Navigation size={20} />
            </div>
            <div>
              <h4 className="text-base font-black text-gray-900">Map Coordinates</h4>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Optional for precise mapping</p>
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

      {/* RERA Section */}
      <div className="bg-primary/5 p-10 rounded-[48px] border-2 border-primary/10 space-y-8 relative overflow-hidden group">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white text-primary rounded-[24px] flex items-center justify-center shadow-xl shadow-primary/5 border-2 border-primary/10">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900">RERA Registration</h4>
              <p className="text-[11px] font-black text-primary uppercase tracking-widest mt-1">Legally required for commercial listings & new projects</p>
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
              onClick={() => setFormData(prev => ({ ...prev, rera_registered: false }))}
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
                name="rera_id"
                value={formData.rera_id}
                onChange={handleChange}
                placeholder={reraPlaceholder}
                className="w-full px-6 py-5 bg-white border-2 border-primary/20 rounded-[24px] focus:border-primary outline-none text-base font-black text-gray-900 transition-all shadow-xl shadow-primary/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">State / Authority</label>
              <input
                type="text"
                name="rera_state"
                value={formData.rera_state}
                onChange={handleChange}
                placeholder={formData.state ? `e.g. ${formData.state}RERA` : "e.g. MahaRERA"}
                className="w-full px-6 py-5 bg-white border-2 border-primary/20 rounded-[24px] focus:border-primary outline-none text-base font-black text-gray-900 transition-all shadow-xl shadow-primary/5"
              />
            </div>
          </div>
        )}
      </div>

      {/* Nearby Locations */}
      <div className="space-y-8 pt-8 border-t-2 border-gray-50">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <MapPinned className="w-5 h-5 text-primary" /> Key Locations & Connectivity
          </h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Add distance to important landmarks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {nearbyLocations.map((loc, index) => (
            <div key={index} className="bg-white p-8 rounded-[40px] border-2 border-gray-100 shadow-xl shadow-gray-200/40 relative group hover:border-primary/20 transition-all animate-in zoom-in-95 duration-300">
              <button 
                type="button" 
                onClick={() => removeNearbyLocation(index)}
                className="absolute top-4 right-4 w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location Type</label>
                  <div className="relative">
                    <select
                      value={loc.type}
                      onChange={(e) => handleNearbyLocationChange(index, 'type', e.target.value)}
                      className="w-full pl-6 pr-10 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all appearance-none cursor-pointer"
                    >
                      <option value="School">School / College</option>
                      <option value="Hospital">Hospital / Clinic</option>
                      <option value="Mall">Mall / Market</option>
                      <option value="Station">Station / Bus Stop</option>
                      <option value="Airport">Airport</option>
                      <option value="Bank">Bank / ATM</option>
                      <option value="Gym">Gym / Park</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                      <Plus size={16} className="rotate-45" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</label>
                    <input
                      type="text"
                      value={loc.name}
                      onChange={(e) => handleNearbyLocationChange(index, 'name', e.target.value)}
                      placeholder="St. Mary's School"
                      className="w-full px-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Distance (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={loc.distance}
                      onChange={(e) => handleNearbyLocationChange(index, 'distance', e.target.value)}
                      placeholder="1.5"
                      className="w-full px-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Nearby Location Button */}
          <button
            type="button"
            onClick={addNearbyLocation}
            className="h-full min-h-[160px] border-4 border-dashed border-gray-100 rounded-[40px] flex flex-col items-center justify-center gap-4 text-gray-300 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all duration-500 group"
          >
            <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-[24px] flex items-center justify-center group-hover:bg-white group-hover:text-primary transition-all shadow-inner">
              <Plus size={32} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest">Add Nearby Landmark</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step5Location;
