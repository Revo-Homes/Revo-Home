import { useState } from 'react';
import { Link } from 'react-router-dom';

function RentAgreement() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rentAmount: '',
    income: '',
    employment: 'Salaried',
    city: '',
    agree: false,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8">
          <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
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

      {/* HEADER (same as PropertyAgreement) */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">
          Rent Agreement
        </h2>
        <p className="text-slate-500 mt-1">
          Create your rent agreement easily with professional assistance.
        </p>
      </div>

      {/* FORM CARD (same UI style) */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          Fill Agreement Details
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NAME + EMAIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* RENT + INCOME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Monthly Rent (₹)
              </label>
              <input
                type="number"
                name="rentAmount"
                value={formData.rentAmount}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Annual Income (₹)
              </label>
              <input
                type="number"
                name="income"
                value={formData.income}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
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

          {/* CITY */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

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
              I agree to be contacted by REVO HOMES
            </span>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            Submit Request
          </button>

        </form>
      </div>
    </div>
  );
}

export default RentAgreement;