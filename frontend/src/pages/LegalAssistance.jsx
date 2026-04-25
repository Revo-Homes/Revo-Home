import { useState } from 'react';
import { Scale, CheckCircle2, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';
import { buildStructuredMessage, submitPublicEnquiry } from '../services/publicEnquiry';

export default function LegalAssistance() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'title-search',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const services = [
    {
      id: 'title-search',
      title: 'Title Search Report',
      description: 'Comprehensive verification of property title and ownership history',
      price: '₹5,000'
    },
    {
      id: 'sales-deed',
      title: 'Sales Deed Drafting',
      description: 'Professional drafting of sales agreement with legal clauses',
      price: '₹3,000'
    },
    {
      id: 'property-registration',
      title: 'Property Registration',
      description: 'Complete registration process with government authorities',
      price: '₹8,000'
    },
    {
      id: 'legal-verification',
      title: 'Legal Verification',
      description: 'Thorough legal due diligence of property documents',
      price: '₹4,000'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      await submitPublicEnquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: 'Legal Assistance Request',
        message: buildStructuredMessage('Legal assistance enquiry', {
          'Service Required': formData.service,
        }, formData.message),
        enquiryType: 'legal_assistance',
        sourcePage: '/services/legal-assistance',
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Legal assistance enquiry failed:', error);
      setSubmitError(error?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Legal Assistance</h2>
            <p className="text-slate-500">Expert legal guidance for all your property needs</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form Only */}
        <div className="lg:col-span-3">
          {/* Contact Form */}
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Consult an Expert</h3>
            {submitted && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Your legal assistance request has been submitted successfully.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Service Required</label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="title-search">Title Search Report</option>
                    <option value="sales-deed">Sales Deed Drafting</option>
                    <option value="property-registration">Property Registration</option>
                    <option value="legal-verification">Legal Verification</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  placeholder="Tell us about your legal requirements..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting...' : 'Get Legal Consultation'}
                <ArrowRight className="h-4 w-4" />
              </button>
              {submitError && (
                <p className="text-sm text-red-600">{submitError}</p>
              )}
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h4 className="font-semibold text-slate-900 mb-4">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm text-slate-600">+91 80937 28472</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm text-slate-600">legal@revohomes.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm text-slate-600">Bhubaneswar, Odisha</span>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
            <h4 className="font-semibold text-slate-900 mb-3">Why Choose Our Legal Services?</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700">Experienced property lawyers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700">Transparent pricing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700">Quick turnaround time</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700">End-to-end documentation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
