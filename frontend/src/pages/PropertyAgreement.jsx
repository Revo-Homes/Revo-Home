import { useState } from "react";
import { Link } from "react-router-dom";
import { buildStructuredMessage, submitPublicEnquiry } from '../services/publicEnquiry';

const BANKS = ["HDFC", "ICICI", "SBI", "Axis Bank", "Kotak", "PNB"];

function PropertyAgreement() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    loanAmount: "",
    income: "",
    employment: "Salaried",
    city: "",
    bank: "",
    agree: false,
    propertyType: "",
    propertyValue: "",
    address: "",
    agreementType: "",
    pan: "",
    aadhaar: "",
    contactTime: "",
    startDate: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      await submitPublicEnquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: 'Property Agreement Request',
        message: buildStructuredMessage('Property agreement service request', {
          'PAN Number': formData.pan,
          'Aadhaar Number': formData.aadhaar,
          'Property Type': formData.propertyType,
          'Agreement Type': formData.agreementType,
          'Property Value': formData.propertyValue,
          City: formData.city,
          'Property Address': formData.address,
          'Loan Amount': formData.loanAmount,
          'Annual Income': formData.income,
          'Employment Type': formData.employment,
          'Preferred Contact Time': formData.contactTime,
        }),
        enquiryType: 'property_agreement',
        budgetMax: formData.propertyValue ? Number(formData.propertyValue) : undefined,
        preferredLocation: formData.city,
        preferredPropertyTypes: formData.propertyType,
        sourcePage: '/tools/property-agreement',
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Property agreement enquiry failed:', error);
      setSubmitError(error?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8">
          <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            ✓
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Request Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Our experts will contact you within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">

      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">
          Property Agreement
        </h2>
        <p className="text-slate-500 mt-1">
          Complete KYC, Property, Financial & Legal Verification Form
        </p>
      </div>

      {/* FORM CARD */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          Fill Agreement Details
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NAME + EMAIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("Full Name", "name", formData, handleChange)}
            {renderInput("Email Address", "email", formData, handleChange, "email")}
          </div>

          {/* PHONE */}
          {renderInput("Phone Number", "phone", formData, handleChange)}

          {/* PAN + AADHAAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("PAN Number", "pan", formData, handleChange)}
            {renderInput("Aadhaar Number", "aadhaar", formData, handleChange)}
          </div>

          {/* PROPERTY TYPE + AGREEMENT TYPE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderSelect("Property Type", "propertyType", formData, handleChange, [
              "Flat",
              "House",
              "Plot",
              "Commercial",
            ])}

            {renderSelect("Agreement Type", "agreementType", formData, handleChange, [
              "Sale Agreement",
              "Rent Agreement",
              "Lease Agreement",
            ])}
          </div>

          {/* PROPERTY VALUE + CITY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("Property Value (₹)", "propertyValue", formData, handleChange)}
            {renderInput("City", "city", formData, handleChange)}
          </div>

          {/* ADDRESS */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Property Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          {/* LOAN + INCOME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("Loan Amount (₹)", "loanAmount", formData, handleChange)}
            {renderInput("Annual Income (₹)", "income", formData, handleChange)}
          </div>

          {/* EMPLOYMENT */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Employment Type
            </label>
            <select
              name="employment"
              value={formData.employment}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="Salaried">Salaried</option>
              <option value="Self-Employed">Self-Employed</option>
              <option value="Business">Business</option>
            </select>
          </div>

          {/* BANK */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

  {renderInput("Bank Name", "bank", formData, handleChange)}

  {renderInput("Account Number", "accountNumber", formData, handleChange)}

  {renderInput("IFSC Code", "ifsc", formData, handleChange)}

  {renderInput("Branch Name", "branch", formData, handleChange)}

</div> */}

          {/* CONTACT TIME */}
          {renderSelect("Preferred Contact Time", "contactTime", formData, handleChange, [
            "Morning",
            "Afternoon",
            "Evening",
          ])}

          {/* CHECKBOX */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
              required
              className="mt-1 w-4 h-4 text-primary border-slate-300 rounded"
            />
            <span className="text-sm text-slate-600">
              I hereby confirm that all details provided are correct and I authorize
              REVO HOMES legal & banking partners to verify and contact me.
            </span>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
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
function renderInput(label, name, formData, handleChange, type = "text") {
  return (
    <div>
      <label className="block text-sm text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  );
}

/* SELECT */
function renderSelect(label, name, formData, handleChange, options) {
  return (
    <div>
      <label className="block text-sm text-slate-600 mb-1">{label}</label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export default PropertyAgreement;
