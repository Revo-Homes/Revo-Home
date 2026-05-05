import React from 'react';
import { Sparkles, Wind, ShieldCheck, Heart, Plus, X, Layers, Check } from 'lucide-react';
import CategorizedAmenities from '../CategorizedAmenities';

const Step3Amenities = ({ 
  formData, 
  setFormData, 
  formOptions, 
  handleChange,
  customFeatures,
  setCustomFeatures,
  showOtherInput,
  setShowOtherInput,
  otherFeature,
  setOtherFeature
}) => {
  const addCustomFeature = () => {
    if (otherFeature.trim()) {
      setCustomFeatures(prev => [...prev, otherFeature.trim()]);
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), otherFeature.trim()]
      }));
      setOtherFeature('');
      setShowOtherInput(false);
    }
  };

  const removeCustomFeature = (feature) => {
    setCustomFeatures(prev => prev.filter(f => f !== feature));
    setFormData(prev => ({
      ...prev,
      features: (prev.features || []).filter(f => f !== feature)
    }));
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1 mb-8">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" /> 
          Features & Amenities
        </h2>
        <p className="text-sm text-gray-500 font-medium">Select all the features and amenities that make your property stand out.</p>
      </div>

      {/* Core Amenities Component */}
      <div className="bg-white rounded-[40px] border-2 border-gray-100 shadow-xl shadow-gray-200/40 p-2 overflow-hidden">
        <CategorizedAmenities 
          formData={formData} 
          setFormData={setFormData} 
          formOptions={formOptions} 
        />
      </div>

      {/* Modern Toggle Grid for Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: 'lift_available', label: 'Lift Available', icon: <Layers size={18} /> },
          { id: 'power_backup', label: 'Power Backup', icon: <Wind size={18} /> },
          { id: 'security_24x7', label: '24/7 Security', icon: <ShieldCheck size={18} /> },
          { id: 'rainwater_harvesting', label: 'Rainwater Harvesting', icon: <Sparkles size={18} /> },
          { id: 'vaastu_compliance', label: 'Vaastu Compliant', icon: <Heart size={18} /> },
          { id: 'pet_friendly', label: 'Pet Friendly', icon: <Heart size={18} /> },
          { id: 'smart_home_features', label: 'Smart Home', icon: <Sparkles size={18} /> },
        ].map((feature) => (
          <div 
            key={feature.id}
            onClick={() => setFormData(prev => ({ ...prev, [feature.id]: !prev[feature.id] }))}
            className={`p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between group ${
              formData[feature.id] 
                ? 'bg-primary border-primary shadow-lg shadow-primary/20 translate-y-[-2px]' 
                : 'bg-white border-gray-100 hover:border-primary/30'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                formData[feature.id] ? 'bg-white/20 text-white' : 'bg-gray-50 text-gray-400 group-hover:text-primary'
              }`}>
                {feature.icon}
              </div>
              <span className={`text-sm font-bold uppercase tracking-widest ${
                formData[feature.id] ? 'text-white' : 'text-gray-600'
              }`}>
                {feature.label}
              </span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              formData[feature.id] ? 'bg-white border-white scale-110' : 'border-gray-200'
            }`}>
              {formData[feature.id] && <Check size={14} className="text-primary" />}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Features Section */}
      <div className="space-y-6 pt-10 border-t-2 border-gray-50">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" /> Additional Features
        </h3>

        <div className="flex flex-wrap gap-3">
          {customFeatures.map((feature) => (
            <div key={feature} className="px-5 py-3 bg-gray-900 text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-gray-900/10 animate-in zoom-in-95 duration-300">
              <span className="text-[11px] font-black uppercase tracking-widest">{feature}</span>
              <button 
                type="button" 
                onClick={() => removeCustomFeature(feature)}
                className="hover:text-primary transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          
          {!showOtherInput ? (
            <button
              type="button"
              onClick={() => setShowOtherInput(true)}
              className="px-6 py-3 bg-white border-2 border-dashed border-gray-200 text-gray-400 rounded-2xl flex items-center gap-2 hover:border-primary/50 hover:text-primary transition-all duration-300 group"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-[11px] font-black uppercase tracking-widest">Add Custom Feature</span>
            </button>
          ) : (
            <div className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
              <input
                type="text"
                autoFocus
                value={otherFeature}
                onChange={(e) => setOtherFeature(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
                placeholder="Type feature..."
                className="px-5 py-3 bg-white border-2 border-primary rounded-2xl outline-none text-sm font-bold text-gray-900 shadow-xl shadow-primary/10 w-48"
              />
              <button
                type="button"
                onClick={addCustomFeature}
                className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all"
              >
                <Plus size={20} />
              </button>
              <button
                type="button"
                onClick={() => setShowOtherInput(false)}
                className="w-12 h-12 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-all"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step3Amenities;
