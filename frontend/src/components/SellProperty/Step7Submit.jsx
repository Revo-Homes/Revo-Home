import React from 'react';
import { 
  Rocket, 
  Search, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  Info
} from 'lucide-react';

const Step7Submit = ({ 
  formData, 
  setFormData, 
  handleChange,
  handleSubmit,
  submitting,
  errors,
  propertyKind
}) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1 mb-8">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Rocket className="w-6 h-6 text-primary" /> 
          Final Review & SEO
        </h2>
        <p className="text-sm text-gray-500 font-medium">Last step! Optimize your listing for search engines and publish.</p>
      </div>

      {/* SEO Optimization Section */}
      <div className="bg-white p-10 rounded-[48px] border-2 border-gray-100 shadow-2xl shadow-gray-200/40 space-y-10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex items-center gap-4 mb-2 relative z-10">
          <div className="w-14 h-14 bg-gray-900 text-white rounded-[20px] flex items-center justify-center shadow-xl shadow-gray-900/10">
            <Search size={28} />
          </div>
          <div>
            <h4 className="text-xl font-black text-gray-900">SEO Meta Settings</h4>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Control how your property appears on Google</p>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          {/* Meta Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Meta Title (Max 60 chars)</label>
            <div className="relative group">
              <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                placeholder="e.g. Luxury 3BHK Apartment in Andheri West | Revo Homes"
                className="w-full pl-14 pr-6 py-5 bg-gray-50/50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-primary outline-none text-base font-black text-gray-900 transition-all shadow-inner"
              />
            </div>
            <div className="flex justify-end pr-2">
              <span className={`text-[9px] font-black uppercase ${formData.metaTitle?.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                {formData.metaTitle?.length || 0} / 60
              </span>
            </div>
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Meta Description (Max 160 chars)</label>
            <div className="relative group">
              <Info className="absolute left-6 top-6 text-gray-400 group-focus-within:text-primary transition-colors w-6 h-6" />
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                placeholder="Briefly describe the property, amenities, and location benefits..."
                rows={4}
                className="w-full pl-16 pr-6 py-5 bg-gray-50/50 border-2 border-transparent rounded-[32px] focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all resize-none shadow-inner"
              />
            </div>
            <div className="flex justify-end pr-2">
              <span className={`text-[9px] font-black uppercase ${formData.metaDescription?.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                {formData.metaDescription?.length || 0} / 160
              </span>
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Keywords (Comma separated)</label>
            <input
              type="text"
              name="metaKeywords"
              value={formData.metaKeywords}
              onChange={handleChange}
              placeholder="3BHK, Luxury, Apartment, Mumbai, Real Estate..."
              className="w-full px-8 py-5 bg-gray-50/50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-primary outline-none text-sm font-bold text-gray-900 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Final Summary Card */}
      <div className="bg-primary/5 p-10 rounded-[48px] border-2 border-primary/10 space-y-8 animate-in zoom-in-95 duration-500">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-white text-primary rounded-[24px] flex items-center justify-center shadow-xl shadow-primary/5 border-2 border-primary/10">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h4 className="text-xl font-black text-gray-900">Ready to Publish?</h4>
            <p className="text-[11px] font-black text-primary uppercase tracking-widest mt-1">Check everything before submitting</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-primary/10 shadow-sm">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Property</span>
            <span className="text-sm font-black text-gray-900">{formData.name || 'Unnamed Property'}</span>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-primary/10 shadow-sm">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Location</span>
            <span className="text-sm font-black text-gray-900">{formData.city || 'N/A'}, {formData.locality || 'N/A'}</span>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-primary/10 shadow-sm">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Price</span>
            <span className="text-sm font-black text-gray-900">
              {formData.price_on_request ? 'On Request' : `₹${formData.price_min || formData.rent_amount || 0}`}
            </span>
          </div>
        </div>

        {/* Errors Display */}
        {Object.keys(errors).length > 0 && (
          <div className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl space-y-3 animate-in shake duration-500">
            <div className="flex items-center gap-2 text-red-600 font-black text-sm uppercase tracking-widest">
              <AlertCircle size={18} />
              Please fix the following:
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
              {Object.entries(errors).map(([key, msg]) => (
                <li key={key} className="text-xs font-bold text-red-500 list-disc ml-4 capitalize">
                  {msg}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Terms Agreement */}
        <div className="flex items-start gap-4 p-6 bg-white/50 rounded-[32px] border border-white/50">
          <div className="pt-1">
            <input
              type="checkbox"
              id="terms"
              required
              className="w-5 h-5 rounded-lg border-2 border-primary/30 text-primary focus:ring-primary/20 cursor-pointer"
            />
          </div>
          <label htmlFor="terms" className="text-xs font-bold text-gray-600 leading-relaxed cursor-pointer select-none">
            I certify that the information provided is accurate and that I have the legal right to list this property. I agree to Revo Homes' <span className="text-primary hover:underline">Terms of Service</span> and <span className="text-primary hover:underline">Privacy Policy</span>.
          </label>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-6 rounded-[32px] flex items-center justify-center gap-4 text-lg font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group shadow-2xl ${
              submitting 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary-dark shadow-primary/40 active:scale-[0.98]'
            }`}
          >
            {submitting ? (
              <>
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                Publishing Listing...
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                Submit Property Listing
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-gray-400">
        <ShieldCheck size={16} />
        <span className="text-[10px] font-black uppercase tracking-widest">Secure Bank-grade Data Encryption</span>
      </div>
    </div>
  );
};

export default Step7Submit;
