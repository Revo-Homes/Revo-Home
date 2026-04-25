import { useState } from 'react';
import { Home, ArrowRight, Building2, Hammer, ClipboardList, Users } from 'lucide-react';
import { buildStructuredMessage, submitPublicEnquiry } from '../services/publicEnquiry';

export default function HomeConstruction() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    constructionType: 'new-home',
    service: 'full-construction',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const services = [
    {
      id: 'architecture',
      title: 'Architecture Planning',
      description: 'Professional architectural planning and blueprint design',
      icon: ClipboardList,
      price: '₹10,000 onwards'
    },
    {
      id: 'construction',
      title: 'Construction',
      description: 'Complete house construction with quality materials',
      icon: Building2,
      price: '₹1,500/sq.ft'
    },
    {
      id: 'project-management',
      title: 'Project Management',
      description: 'End-to-end supervision and timely delivery',
      icon: Users,
      price: '₹50,000/project'
    },
    {
      id: 'renovation',
      title: 'Renovation',
      description: 'Upgrade and remodel your existing home',
      icon: Hammer,
      price: '₹800/sq.ft'
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
        subject: 'Home Construction Request',
        message: buildStructuredMessage('Home construction enquiry', {
          'Construction Type': formData.constructionType,
          Service: formData.service,
          Address: formData.address,
        }, formData.message),
        enquiryType: 'home_construction',
        preferredLocation: formData.address,
        sourcePage: '/services/home-construction',
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Home construction enquiry failed:', error);
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
            <Home className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Home Construction</h2>
            <p className="text-slate-500">Build your dream home with trusted professionals</p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-slate-800">{service.title}</h4>
              </div>
              <p className="text-sm text-slate-500 mb-2">{service.description}</p>
              <p className="text-sm font-bold text-primary">{service.price}</p>
            </div>
          );
        })}
      </div>

      {/* Contact Form */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Start Your Construction</h3>
        {submitted && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Your construction request has been submitted successfully.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Phone + Construction Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Construction Type</label>
              <select
                value={formData.constructionType}
                onChange={(e) => setFormData({ ...formData, constructionType: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="new-home">New Home</option>
                <option value="renovation">Renovation</option>
                <option value="extension">Extension</option>
              </select>
            </div>
          </div>
          {/* Address */}
<div>
  <label className="block text-sm font-medium text-slate-700 mb-2">
    Address
  </label>
  <textarea
    value={formData.address}
    onChange={(e) =>
      setFormData({ ...formData, address: e.target.value })
    }
    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
    rows={2}
    placeholder="Enter construction site address"
  />
</div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Service Required</label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="full-construction">Full Construction</option>
              <option value="architecture">Architecture Planning</option>
              <option value="project-management">Project Management</option>
              <option value="renovation">Renovation</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Project Details</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Tell us about your construction project..."
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            {submitting ? 'Submitting...' : 'Start Construction'}
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
