import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Home, 
  Maximize, 
  Layers, 
  Clock, 
  Plus, 
  X, 
  Upload,
  FileText,
  Edit2,
  BedDouble,
  Bath,
  Utensils,
  Wind
} from 'lucide-react';

const Step2CategoryDetails = ({ 
  formData, 
  setFormData, 
  formOptions, 
  propertyKind,
  handleChange,
  getAreaUnitOptions,
  toggleBHK,
  updateBHKDetail,
  removeBHKConfiguration,
  addCustomBHK,
  customBhkInput,
  setCustomBhkInput,
  getBhkFieldVisibility
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1 mb-8">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-primary" /> 
          Category Details
        </h2>
        <p className="text-sm text-gray-500 font-medium">
          Showing specific fields for {formData.propertyType || 'the selected property type'}
          {formData.propertySubType ? ` / ${formData.propertySubType}` : ''}.
        </p>
      </div>

      {/* Common Area Fields (if not Residential) */}
      {propertyKind !== 'Residential' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50 p-8 rounded-[32px] border-2 border-gray-100">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              Total Area <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1 group">
                <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                <input
                  type="number"
                  name="total_area"
                  value={formData.total_area}
                  onChange={handleChange}
                  placeholder="e.g. 1200"
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all placeholder:text-gray-300 shadow-sm"
                />
              </div>
              <div className="w-[140px]">
                <select
                  name="area_unit"
                  value={formData.area_unit}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all appearance-none cursor-pointer shadow-sm"
                >
                  {getAreaUnitOptions(formOptions).map((unit) => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {propertyKind !== 'Land' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                Built-up Area
              </label>
              <div className="relative group">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                <input
                  type="number"
                  name="builtup_area"
                  value={formData.builtup_area}
                  onChange={handleChange}
                  placeholder="e.g. 1400"
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all placeholder:text-gray-300 shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Residential Specific: BHK Configuration */}
      {propertyKind === 'Residential' && (
        <div className="space-y-12">
          {/* BHK Multi-select */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              BHK Configuration (Select Multiple) <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {(formOptions.bhk || formOptions.bhk_options || []).map((b) => {
                const bhkValue = typeof b === 'object' ? (b.value || b.option_key || b.label) : b;
                const bhkLabel = typeof b === 'object' ? (b.label || b.value || b.option_key || b) : b;
                const bhkSlug = typeof b === 'object' ? (b.slug || b.value || b.option_key) : b;
                const isSelected = formData.selectedBHKs?.includes(bhkSlug) || formData.bhk?.includes(bhkValue);
                
                return (
                  <button
                    key={bhkSlug || bhkValue}
                    type="button"
                    onClick={() => toggleBHK(bhkSlug || bhkValue)}
                    className={`px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border-2 flex items-center gap-2 ${isSelected
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                        : 'bg-white text-gray-400 border-gray-100 hover:border-primary/30 hover:text-primary/70'
                      }`}
                  >
                    <Home size={16} />
                    {bhkLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BHK Detail Cards */}
          <div className="grid grid-cols-1 gap-8">
            {formData.bhkDetails.map((detail, index) => (
              <div key={detail.type} className="bg-white p-8 rounded-[40px] border-2 border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
                {/* Accent Background */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                
                <div className="flex items-center justify-between mb-10 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-[24px] font-black text-xl shadow-inner border-2 border-white">
                      {detail.type.split(' ')[0]}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-gray-900">{detail.type} Configuration</h4>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Configure unit specific details</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBHKConfiguration(detail.type_slug || detail.type)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-red-50 text-red-100 bg-red-50/30 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                  {/* Bathrooms */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                      <Bath size={14} className="text-primary" />
                      Bathrooms *
                    </label>
                    <select
                      value={detail.bathrooms || ''}
                      onChange={(e) => updateBHKDetail(index, 'bathrooms', e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5, '6+'].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>

                  {/* Kitchens */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                      <Utensils size={14} className="text-primary" />
                      Kitchens *
                    </label>
                    <select
                      value={detail.kitchens || ''}
                      onChange={(e) => updateBHKDetail(index, 'kitchens', e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>

                  {/* Halls */}
                  {getBhkFieldVisibility(detail.type_slug || detail.type).showHallField && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Halls</label>
                      <select
                        value={detail.halls || '1'}
                        onChange={(e) => updateBHKDetail(index, 'halls', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all appearance-none cursor-pointer"
                      >
                        {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Balconies */}
                  {getBhkFieldVisibility(detail.type_slug || detail.type).showBalconyField && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                        <Wind size={14} className="text-primary" />
                        Balcony
                      </label>
                      <select
                        value={detail.balconies || '0'}
                        onChange={(e) => updateBHKDetail(index, 'balconies', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all appearance-none cursor-pointer"
                      >
                        {[0, 1, 2, 3, 4, '5+'].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Carpet Area */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Carpet Area (sqft)</label>
                    <input
                      type="number"
                      value={detail.carpet_area || ''}
                      onChange={(e) => updateBHKDetail(index, 'carpet_area', e.target.value)}
                      placeholder="1200"
                      className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all"
                    />
                  </div>

                  {/* Price per Unit */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Price (₹)</label>
                    <input
                      type="number"
                      value={detail.price || ''}
                      onChange={(e) => updateBHKDetail(index, 'price', e.target.value)}
                      placeholder="65,00,000"
                      className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all"
                    />
                  </div>
                </div>

                {/* Additional Space */}
                {getBhkFieldVisibility(detail.type_slug || detail.type).showAdditionalSpaceField && (
                  <div className="mt-8 space-y-2 relative z-10">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Additional Space Description</label>
                    <textarea
                      value={detail.additionalSpace === '0' ? '' : (detail.additionalSpace || '')}
                      onChange={(e) => updateBHKDetail(index, 'additionalSpace', e.target.value)}
                      placeholder="Describe study room, puja room, or extra space..."
                      rows={2}
                      className="w-full px-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all resize-none shadow-inner"
                    />
                  </div>
                )}

                {/* Floor Plan Upload for this BHK */}
                <div className="mt-10 pt-10 border-t-2 border-gray-50 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-100 text-gray-400 flex items-center justify-center rounded-[20px] shadow-inner">
                        <Upload size={24} />
                      </div>
                      <div>
                        <h5 className="text-lg font-black text-gray-900">Floor Plan - {detail.type}</h5>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Image or PDF format</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const updatedDetails = [...formData.bhkDetails];
                            updatedDetails[index].floorPlan = file;
                            updatedDetails[index].floorPlanPreview = URL.createObjectURL(file);
                            setFormData(prev => ({ ...prev, bhkDetails: updatedDetails }));
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <button className="px-8 py-4 bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary transition-all shadow-xl shadow-gray-900/10">
                        Upload Plan
                      </button>
                    </div>
                  </div>

                  {detail.floorPlanPreview ? (
                    <div className="max-w-md relative group">
                      <div className="aspect-video rounded-[32px] overflow-hidden bg-gray-50 border-4 border-white shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                        {(detail.floorPlan?.type?.startsWith('image/') || detail.floorPlanPreview.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                          <img src={detail.floorPlanPreview} alt="Floor Plan" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-3">
                            <FileText size={48} />
                            <span className="text-[10px] font-black uppercase tracking-widest tracking-tighter">PDF Document</span>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedDetails = [...formData.bhkDetails];
                              URL.revokeObjectURL(updatedDetails[index].floorPlanPreview);
                              updatedDetails[index].floorPlan = null;
                              updatedDetails[index].floorPlanPreview = null;
                              setFormData(prev => ({ ...prev, bhkDetails: updatedDetails }));
                            }}
                            className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors shadow-xl"
                          >
                            <X size={24} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 px-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 truncate max-w-[70%]">{detail.floorPlan?.name || 'Uploaded Plan'}</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-[10px] font-black text-green-600 uppercase">Ready</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[40px] bg-gray-50/50 group-hover:bg-white transition-colors duration-500">
                      <Upload className="w-12 h-12 text-gray-200 mb-4" />
                      <p className="text-sm font-bold text-gray-400">No floor plan uploaded for this configuration</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Custom BHK Adder */}
          <div className="bg-gray-900 p-10 rounded-[40px] shadow-2xl shadow-gray-900/20">
            <div className="flex flex-col gap-1 mb-6">
              <h4 className="text-xl font-black text-white">Can't find your configuration?</h4>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Add a custom BHK type below</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                <input
                  type="text"
                  value={customBhkInput}
                  onChange={(e) => setCustomBhkInput(e.target.value)}
                  placeholder="e.g. 2.5 BHK, 4+ BHK"
                  className="w-full pl-12 pr-4 py-5 bg-white/10 border-2 border-white/5 rounded-[24px] focus:bg-white focus:text-gray-900 outline-none text-sm font-bold text-white transition-all placeholder:text-gray-500"
                />
              </div>
              <button
                type="button"
                onClick={addCustomBHK}
                className="px-10 py-5 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-[24px] hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
              >
                Add Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Structure & Age */}
      <div className="space-y-6 pt-8 border-t-2 border-gray-50">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" /> Structure & Age
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Total Floors */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Total Floors</label>
            <div className="relative group">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
              <input
                type="number"
                name="total_floors"
                value={formData.total_floors}
                onChange={handleChange}
                placeholder="e.g. 15"
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Floor Number */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Floor Number</label>
            <div className="relative group">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
              <input
                type="text"
                name="floor_number"
                value={formData.floor_number}
                onChange={handleChange}
                placeholder="e.g. 5"
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Age of Property */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Property Age</label>
            <div className="relative group">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5 z-10" />
              <select
                name="age_of_property"
                value={formData.age_of_property}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all appearance-none cursor-pointer shadow-sm relative z-0"
              >
                <option value="">Select Age</option>
                {(formOptions.property_age || []).map((age) => (
                  <option key={age.value || age} value={age.value || age}>{age.label || age}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Area for Residential (Consolidated) */}
      {propertyKind === 'Residential' && (
        <div className="space-y-6 pt-8 border-t-2 border-gray-50">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Maximize className="w-5 h-5 text-primary" /> Overall Property Area
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-primary/5 p-8 rounded-[32px] border-2 border-primary/10">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                Total Area <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1 group">
                  <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                  <input
                    type="number"
                    name="total_area"
                    value={formData.total_area}
                    onChange={handleChange}
                    placeholder="e.g. 1200"
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all shadow-sm"
                  />
                </div>
                <div className="w-[140px]">
                  <select
                    name="area_unit"
                    value={formData.area_unit}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all appearance-none cursor-pointer shadow-sm"
                  >
                    {getAreaUnitOptions(formOptions).map((unit) => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Built-up Area</label>
              <div className="relative group">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                <input
                  type="number"
                  name="builtup_area"
                  value={formData.builtup_area}
                  onChange={handleChange}
                  placeholder="e.g. 1400"
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2CategoryDetails;
