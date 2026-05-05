import React from 'react';
import {
  Building2,
  FileText,
  Calendar,
  Tag,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
  Info
} from 'lucide-react';
import RichTextEditor from '../RichTextEditor';

const Step1BasicInfo = ({
  formData,
  setFormData,
  formOptions,
  loadingFormOptions,
  handleChange,
  builders,
  isLoadingBuilders,
  propertyKind,
  getOptionLabel,
  getOptionValue,
  getCategoriesForSelectedType
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1 mb-8">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          Basic Information
        </h2>
        <p className="text-sm text-gray-500 font-medium">Let's start with the essential details of your property.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Property Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
            Property Name <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Skyline Apartments"
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all placeholder:text-gray-300 shadow-sm"
            />
          </div>
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
            Property Tagline / Title
          </label>
          <div className="relative group">
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
            <input
              type="text"
              name="property_title_tagline"
              value={formData.property_title_tagline}
              onChange={handleChange}
              placeholder="e.g. Luxury Living at its Best"
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all placeholder:text-gray-300 shadow-sm"
            />
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
            Property Type <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <LayoutDashboard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5 z-10" />
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={(e) => {
                const val = e.target.value;
                const selectedType = (formOptions.property_types || []).find((type) => getOptionLabel(type) === val);
                const id = selectedType?.id ?? selectedType?.value ?? '';
                setFormData(prev => ({
                  ...prev,
                  propertyType: getOptionLabel(selectedType) || val,
                  property_type_id: id,
                  property_category_id: '',
                  propertySubType: '',
                  property_subtype: '',
                  selectedBHKs: [],
                  bhkDetails: []
                }));
              }}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all appearance-none cursor-pointer shadow-sm relative z-0"
            >
              <option value="">Select Type</option>
              {(formOptions.property_types || []).map((type) => {
                const typeName = getOptionLabel(type);
                return (
                  <option key={type.id || type.value || typeName} value={typeName}>{typeName}</option>
                );
              })}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </div>

        {/* Property Sub-type */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
            Property Sub-type
          </label>
          <div className="relative group">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5 z-10" />
            <select
              name="propertySubType"
              value={formData.propertySubType}
              onChange={(e) => {
                const val = e.target.value;
                const selectedCategory = (formOptions.property_categories || []).find((category) => getOptionLabel(category) === val);
                const subTypeLabel = getOptionLabel(selectedCategory) || val;
                const subTypeSlug = getOptionValue(selectedCategory) || val;

                setFormData(prev => {
                  let updatedSelectedBHKs = [...prev.selectedBHKs];
                  let updatedBhkDetails = [...prev.bhkDetails];

                  // If previous sub-type was a BHK, remove it to keep in sync with new selection
                  const prevIsBhk = prev.propertySubType?.toLowerCase().includes('bhk') || prev.propertySubType?.toLowerCase().includes('rk');
                  if (prevIsBhk && prev.propertySubType !== subTypeLabel) {
                    updatedSelectedBHKs = updatedSelectedBHKs.filter(s => s !== prev.propertySubType);
                    updatedBhkDetails = updatedBhkDetails.filter(d => (d.type_slug || d.type) !== prev.propertySubType);
                  }

                  const newState = {
                    ...prev,
                    propertySubType: subTypeLabel,
                    property_subtype: subTypeSlug,
                    property_category_id: selectedCategory?.id ?? selectedCategory?.value ?? '',
                    selectedBHKs: updatedSelectedBHKs,
                    bhkDetails: updatedBhkDetails
                  };

                  // Auto-sync new BHK configuration if sub-type is a BHK type
                  const isBhk = subTypeLabel.toLowerCase().includes('bhk') || subTypeLabel.toLowerCase().includes('rk');
                  if (isBhk) {
                    const bhkValue = subTypeLabel;
                    // Check if already selected to avoid duplicates
                    if (!newState.selectedBHKs.includes(bhkValue)) {
                      newState.selectedBHKs = [...newState.selectedBHKs, bhkValue];
                      newState.bhkDetails = [
                        ...newState.bhkDetails,
                        {
                          type: bhkValue,
                          type_slug: subTypeSlug,
                          bathrooms: '1',
                          kitchens: '1',
                          carpet_area: '',
                          price: ''
                        }
                      ];
                    }
                  }

                  return newState;
                });
              }}
              disabled={!formData.propertyType}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all appearance-none cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed shadow-sm relative z-0"
            >
              <option value="">Select Sub-type</option>
              {formData.propertyType && getCategoriesForSelectedType(formData, formOptions)
                .map((category) => (
                  <option key={category.value || category.id || category.slug} value={getOptionLabel(category)}>
                    {getOptionLabel(category)}
                  </option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </div>

        {/* Listing Type */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
            Listing Type <span className="text-red-500">*</span>
          </label>
          <div className="flex bg-gray-50 p-1.5 rounded-2xl border-2 border-gray-100 shadow-inner gap-1">
            {['Sale', 'Rent', 'Lease'].map((type) => {
              if (propertyKind === 'Land' && type === 'Rent') return null;
              const isSelected = formData.listingType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, listingType: type }))}
                  className={`flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all ${isSelected
                      ? 'bg-white text-primary shadow-md border-2 border-primary/10'
                      : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Property Condition */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
            Property Condition
          </label>
          <div className="relative group">
            <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5 z-10" />
            <select
              name="property_condition"
              value={formData.property_condition}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all appearance-none cursor-pointer shadow-sm relative z-0"
            >
              <option value="">Select Condition</option>
              {(formOptions.property_condition || []).map((c) => {
                const cValue = c.value || c.label || c;
                const cLabel = c.label || c.value || c;
                return (
                  <option key={cValue} value={cValue}>{cLabel}</option>
                );
              })}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </div>

        {/* Possession Date */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
            Possession Date
          </label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
            <input
              type="date"
              name="possession_date"
              value={formData.possession_date}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Sale Urgency */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
            Sale Urgency
          </label>
          <div className="relative group">
            <Info className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5 z-10" />
            <select
              name="sale_urgency"
              value={formData.sale_urgency}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all appearance-none cursor-pointer shadow-sm relative z-0"
            >
              <option value="">Select Urgency</option>
              {(formOptions.sale_urgency || []).map((u) => {
                const uValue = u.value || u.label || u;
                const uLabel = u.label || u.value || u;
                return (
                  <option key={uValue} value={uValue}>{uLabel}</option>
                );
              })}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
          Detailed Description <span className="text-red-500">*</span>
        </label>
        <div className="rounded-3xl border-2 border-gray-100 overflow-hidden shadow-sm">
          <RichTextEditor
            value={formData.description}
            onChange={(val) => {
              const plainText = typeof val === 'string' ? val.replace(/<[^>]+>/g, '').trim() : '';
              const newMeta = plainText.substring(0, 160);
              setFormData(prev => ({
                ...prev,
                description: val,
                metaDescription: newMeta
              }));
            }}
          />
        </div>
      </div>

      {/* Builder Selection */}
      {/* <div className="pt-8 border-t-2 border-gray-50">
        <div className="bg-primary/5 p-8 rounded-[32px] border-2 border-primary/10">
          <div className="flex items-center gap-4 mb-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="is_builder_listed"
                name="is_builder_listed"
                checked={formData.is_builder_listed}
                onChange={handleChange}
                className="peer sr-only"
              />
              <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary transition-colors"></div>
            </label>
            <label htmlFor="is_builder_listed" className="text-lg font-black text-gray-900 cursor-pointer select-none">
              Is this property listed by a builder?
            </label>
          </div>

          {formData.is_builder_listed && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Select Builder <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5 z-10" />
                <select
                  name="builder_id"
                  value={formData.builder_id}
                  onChange={(e) => {
                    const selectedBuilder = builders.find(b => String(b.id) === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      builder_id: e.target.value,
                      builder_name: selectedBuilder?.name || ''
                    }));
                  }}
                  disabled={isLoadingBuilders || builders.length === 0}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:bg-gray-100 shadow-sm relative z-0"
                >
                  <option value="">
                    {isLoadingBuilders ? 'Loading builders...' : builders.length === 0 ? 'No builders available' : 'Choose a builder...'}
                  </option>
                  {builders.map((builder) => (
                    <option key={builder.id} value={String(builder.id)}>
                      {builder.name} {builder.city ? `(${builder.city})` : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
              
              {builders.length === 0 && !isLoadingBuilders && (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 border-2 border-yellow-100 rounded-2xl text-yellow-800 text-sm font-bold">
                  <Info className="w-5 h-5 flex-shrink-0" />
                  No builders found in the database.
                </div>
              )}
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default Step1BasicInfo;
