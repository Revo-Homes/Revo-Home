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

        {/* Meta Title / Tagline */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
            Property Title / Tagline
          </label>
          <div className="relative group">
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
            <input
              type="text"
              name="meta_title"
              value={formData.meta_title}
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
              name="property_type_id"
              value={formData.property_type_id}
              onChange={(e) => {
                const id = e.target.value;
                const selectedType = (formOptions.property_types || []).find((type) => String(type.id || type.value) === String(id));
                const typeName = getOptionLabel(selectedType);
                const typeSlug = getOptionValue(selectedType);

                setFormData(prev => ({
                  ...prev,
                  propertyType: typeName,
                  property_type_id: id,
                  property_type_slug: typeSlug,
                  property_category_id: '',
                  property_category_slug: '',
                  propertySubType: '',
                  property_subtype: '',
                  property_subcategory_id: '',
                  property_subcategory_slug: '',
                  selectedBHKs: [],
                  bhkDetails: []
                }));
              }}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all appearance-none cursor-pointer shadow-sm relative z-0"
            >
              <option value="">Select Type</option>
              {(formOptions.property_types || []).map((type) => {
                const typeId = type.id || type.value;
                const typeName = getOptionLabel(type);
                return (
                  <option key={typeId} value={typeId}>{typeName}</option>
                );
              })}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </div>

        {/* Property Sub-type / Category */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
            Property Category
          </label>
          <div className="relative group">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5 z-10" />
            <select
              name="property_category_id"
              value={formData.property_category_id}
              onChange={(e) => {
                const id = e.target.value;
                const selectedCategory = (formOptions.property_categories || []).find((category) => String(category.id || category.value) === String(id));
                const categoryLabel = getOptionLabel(selectedCategory);
                const categorySlug = getOptionValue(selectedCategory);

                setFormData(prev => {
                  let updatedSelectedBHKs = [...prev.selectedBHKs];
                  let updatedBhkDetails = [...prev.bhkDetails];

                  // If previous category was a BHK, remove it to keep in sync with new selection
                  const prevIsBhk = prev.propertySubType?.toLowerCase().includes('bhk') || prev.propertySubType?.toLowerCase().includes('rk');
                  if (prevIsBhk && prev.propertySubType !== categoryLabel) {
                    updatedSelectedBHKs = updatedSelectedBHKs.filter(s => s !== prev.propertySubType);
                    updatedBhkDetails = updatedBhkDetails.filter(d => (d.type_slug || d.type) !== prev.propertySubType);
                  }

                  const newState = {
                    ...prev,
                    propertySubType: categoryLabel,
                    property_subtype: categorySlug,
                    property_category_id: id,
                    property_category_slug: categorySlug,
                    selectedBHKs: updatedSelectedBHKs,
                    bhkDetails: updatedBhkDetails
                  };

                  // Auto-sync new BHK configuration if category is a BHK type
                  const isBhk = categoryLabel.toLowerCase().includes('bhk') || categoryLabel.toLowerCase().includes('rk');
                  if (isBhk) {
                    const bhkValue = categoryLabel;
                    // Check if already selected to avoid duplicates
                    if (!newState.selectedBHKs.includes(bhkValue)) {
                      newState.selectedBHKs = [...newState.selectedBHKs, bhkValue];
                      newState.bhkDetails = [
                        ...newState.bhkDetails,
                        {
                          type: bhkValue,
                          type_slug: categorySlug,
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
              disabled={!formData.property_type_id}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold text-gray-900 transition-all appearance-none cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed shadow-sm relative z-0"
            >
              <option value="">Select Category</option>
              {formData.property_type_id && getCategoriesForSelectedType(formData, formOptions)
                .map((category) => {
                  const catId = category.id || category.value || category.slug;
                  const catName = getOptionLabel(category);
                  return (
                    <option key={catId} value={catId}>
                      {catName}
                    </option>
                  );
                })}
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
                  onClick={() => setFormData(prev => ({ ...prev, listingType: type, listing_type: type.toLowerCase() }))}
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
                meta_description: newMeta
              }));
            }}
          />
        </div>
      </div>


    </div>
  );
};

export default Step1BasicInfo;