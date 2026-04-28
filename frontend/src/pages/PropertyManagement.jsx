import { useState } from 'react';
import { Home, ArrowRight } from 'lucide-react';
import { buildStructuredMessage, submitPublicEnquiry } from '../services/publicEnquiry';

export default function PropertyManagement() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyType: 'residential',
    service: 'full-management',
    message: '',

    propertyAddress: '',
    propertyValue: '',
    city: '',
    occupancyStatus: '',
    expectedRent: '',
    ownerType: '',
    agreementDuration: '',
    maintenanceBudget: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      await submitPublicEnquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: 'Property Management Request',
        message: buildStructuredMessage('Property management enquiry', {
          'Owner Type': formData.ownerType,
          'Property Type': formData.propertyType,
          'Occupancy Status': formData.occupancyStatus,
          'Property Value': formData.propertyValue,
          'Expected Monthly Rent': formData.expectedRent,
          'Property Address': formData.propertyAddress,
          City: formData.city,
          'Service Required': formData.service,
          'Maintenance Budget': formData.maintenanceBudget,
          'Agreement Duration': formData.agreementDuration,
        }, formData.message),
        enquiryType: 'property_management',
        budgetMin: formData.maintenanceBudget ? Number(formData.maintenanceBudget) : undefined,
        budgetMax: formData.propertyValue ? Number(formData.propertyValue) : undefined,
        preferredLocation: formData.city,
        preferredPropertyTypes: formData.propertyType,
        sourcePage: '/services/property-management',
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Property management enquiry failed:', error);
      setSubmitError(error?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8">

      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">
          Property Management
        </h2>
        <p className="text-slate-500 mt-1">
          Complete property handling, tenant management, rent & maintenance system
        </p>
      </div>

      {/* FORM CARD */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          Fill Property Management Details
        </h3>
        {submitted && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Your property management request has been submitted successfully.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* OWNER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" value={formData.name} onChange={(e)=>setFormData({...formData,name:e.target.value})} />
            <Input label="Email Address" value={formData.email} onChange={(e)=>setFormData({...formData,email:e.target.value})} />
          </div>

          <Input label="Phone Number" value={formData.phone} onChange={(e)=>setFormData({...formData,phone:e.target.value})} />

          <Select label="Owner Type" value={formData.ownerType} onChange={(e)=>setFormData({...formData,ownerType:e.target.value})}
            options={["Individual","Company","NRI Owner"]}/>

          {/* PROPERTY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Property Type" value={formData.propertyType} onChange={(e)=>setFormData({...formData,propertyType:e.target.value})}
              options={["residential","commercial","industrial"]}/>

            <Select label="Occupancy Status" value={formData.occupancyStatus} onChange={(e)=>setFormData({...formData,occupancyStatus:e.target.value})}
              options={["Vacant","Occupied","Under Renovation"]}/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Property Value (₹)" value={formData.propertyValue} onChange={(e)=>setFormData({...formData,propertyValue:e.target.value})} />
            <Input label="Expected Monthly Rent (₹)" value={formData.expectedRent} onChange={(e)=>setFormData({...formData,expectedRent:e.target.value})} />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Property Address
            </label>
            <textarea
              value={formData.propertyAddress}
              onChange={(e)=>setFormData({...formData,propertyAddress:e.target.value})}
              rows="3"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <Input label="City" value={formData.city} onChange={(e)=>setFormData({...formData,city:e.target.value})} />

          {/* SERVICE */}
          <Select
            label="Service Required"
            value={formData.service}
            onChange={(e)=>setFormData({...formData,service:e.target.value})}
            options={[
              "full-management",
              "tenant-only",
              "rent-only",
              "maintenance-only"
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Maintenance Budget (₹/month)" value={formData.maintenanceBudget} onChange={(e)=>setFormData({...formData,maintenanceBudget:e.target.value})} />
            <Input label="Agreement Duration (months)" value={formData.agreementDuration} onChange={(e)=>setFormData({...formData,agreementDuration:e.target.value})} />
          </div>

          {/* NOTES */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Additional Notes
            </label>
            <textarea
              value={formData.message}
              onChange={(e)=>setFormData({...formData,message:e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Tell us about your property requirements..."
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? 'Submitting...' : 'Submit Property Management Request'}
            <ArrowRight className="h-4 w-4" />
          </button>

          {submitError && (
            <p className="text-sm text-red-600">{submitError}</p>
          )}

        </form>
      </div>
    </div>
  );
}

/* INPUT */
function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm text-slate-600 mb-1">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  );
}

/* SELECT */
function Select({ label, options, ...props }) {
  return (
    <div>
      <label className="block text-sm text-slate-600 mb-1">{label}</label>
      <select
        {...props}
        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
