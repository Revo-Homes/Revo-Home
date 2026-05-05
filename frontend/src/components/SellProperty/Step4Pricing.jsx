import React from 'react';
import { IndianRupee, Tag, Clock, Calendar, Info, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

const Step4Pricing = ({ 
  formData, 
  setFormData, 
  handleChange,
  propertyKind
}) => {
  const isSale = formData.listingType === 'Sale';
  const isRent = formData.listingType === 'Rent';
  const isLease = formData.listingType === 'Lease';

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1 mb-8">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <IndianRupee className="w-6 h-6 text-primary" /> 
          Pricing Details
        </h2>
        <p className="text-sm text-gray-500 font-medium">Configure the financial aspects of your listing.</p>
      </div>

      {/* Main Pricing Section */}
      <div className="bg-gray-900 p-10 rounded-[48px] shadow-2xl shadow-gray-900/30 relative overflow-hidden">
        {/* Abstract Pattern */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 text-white flex items-center justify-center rounded-[20px] backdrop-blur-md border border-white/10">
                <Tag size={24} />
              </div>
              <div>
                <h4 className="text-xl font-black text-white">{isSale ? 'Selling Price' : isRent ? 'Monthly Rent' : 'Lease Amount'}</h4>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Base financial requirement</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
              <div 
                onClick={() => setFormData(prev => ({ ...prev, price_on_request: !prev.price_on_request }))}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                  formData.price_on_request 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Price on Request
              </div>
              <div 
                onClick={() => setFormData(prev => ({ ...prev, negotiable: !prev.negotiable }))}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                  formData.negotiable 
                    ? 'bg-white text-gray-900 shadow-lg' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Negotiable
              </div>
            </div>
          </div>

          {!formData.price_on_request ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                  {isSale ? 'Minimum Price' : 'Amount'} (₹)
                </label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-xl">₹</div>
                  <input
                    type="number"
                    name={isSale ? "price_min" : isRent ? "rent_amount" : "price_min"}
                    value={isSale ? formData.price_min : isRent ? formData.rent_amount : formData.price_min}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full pl-12 pr-6 py-6 bg-white/5 border-2 border-white/10 rounded-[28px] focus:bg-white focus:border-white focus:text-gray-900 outline-none text-2xl font-black text-white transition-all placeholder:text-gray-700 shadow-inner"
                  />
                </div>
              </div>

              {isSale && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Maximum Price (₹)</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-xl">₹</div>
                    <input
                      type="number"
                      name="price_max"
                      value={formData.price_max}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full pl-12 pr-6 py-6 bg-white/5 border-2 border-white/10 rounded-[28px] focus:bg-white focus:border-white focus:text-gray-900 outline-none text-2xl font-black text-white transition-all placeholder:text-gray-700 shadow-inner"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[40px] bg-white/5 animate-in fade-in duration-700">
              <AlertCircle className="w-10 h-10 text-primary mb-3" />
              <p className="text-lg font-black text-white">Price Hidden from Public</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Users will see "Price on Request"</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Costs Section */}
      {(isRent || isLease || isSale) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Security Deposit */}
          {(isRent || isLease) && (
            <div className="bg-white p-8 rounded-[40px] border-2 border-gray-100 shadow-xl shadow-gray-200/40 space-y-4 hover:border-primary/20 transition-all group">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary rounded-[18px] flex items-center justify-center transition-colors">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-900">Security Deposit</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Refundable amount</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 font-black text-lg">₹</div>
                <input
                  type="number"
                  name="security_deposit"
                  value={formData.security_deposit}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-6 py-5 bg-gray-50/50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-primary outline-none text-xl font-black text-gray-900 transition-all shadow-inner"
                />
              </div>
            </div>
          )}

          {/* Maintenance Charges */}
          <div className="bg-white p-8 rounded-[40px] border-2 border-gray-100 shadow-xl shadow-gray-200/40 space-y-4 hover:border-primary/20 transition-all group">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary rounded-[18px] flex items-center justify-center transition-colors">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900">Maintenance</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Regular service fees</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 font-black text-lg">₹</div>
                <input
                  type="number"
                  name="maintenance_charges"
                  value={formData.maintenance_charges}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-6 py-5 bg-gray-50/50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-primary outline-none text-xl font-black text-gray-900 transition-all shadow-inner"
                />
              </div>
              <div className="w-32">
                <select
                  name="maintenance_charges_frequency"
                  value={formData.maintenance_charges_frequency}
                  onChange={handleChange}
                  className="w-full h-full px-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-primary outline-none text-[10px] font-black uppercase tracking-widest text-gray-600 transition-all appearance-none cursor-pointer"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lease/Rent Specifics */}
      {(isRent || isLease) && (
        <div className="space-y-6 pt-10 border-t-2 border-gray-50">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Availability & Terms
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Available From */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Available From</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                <input
                  type="date"
                  name="available_from"
                  value={formData.available_from}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary outline-none text-sm font-bold text-gray-900 shadow-sm"
                />
              </div>
            </div>

            {/* Lock-in Period */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Lock-in Period (Months)</label>
              <div className="relative group">
                <Info className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                <input
                  type="number"
                  name="lock_in_period"
                  value={formData.lock_in_period}
                  onChange={handleChange}
                  placeholder="e.g. 6"
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary outline-none text-sm font-bold text-gray-900 shadow-sm"
                />
              </div>
            </div>

            {/* Lease Appreciation */}
            {isLease && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Lease Appreciation (%)</label>
                <div className="relative group">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                  <input
                    type="number"
                    name="lease_appreciation"
                    value={formData.lease_appreciation}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary outline-none text-sm font-bold text-gray-900 shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4Pricing;
