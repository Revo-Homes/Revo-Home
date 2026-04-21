import { useState } from 'react';
import { Home, ArrowRight, Compass, Sparkles, Building2, Sun } from 'lucide-react';

export default function VastuConsultancy() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
     address: '', 
    propertyType: 'home',
    service: 'home-vastu',
    message: ''
  });

  const services = [
    {
      id: 'home-vastu',
      title: 'Home Vastu Check',
      description: 'Detailed vastu analysis for your home layout and energy flow',
      icon: Home,
      price: '₹1,999'
    },
    {
      id: 'office-vastu',
      title: 'Office Vastu',
      description: 'Improve productivity and growth with office vastu planning',
      icon: Building2,
      price: '₹2,999'
    },
    {
      id: 'direction-analysis',
      title: 'Direction Analysis',
      description: 'Check ideal directions for rooms, entrance, and placements',
      icon: Compass,
      price: '₹999'
    },
    {
      id: 'vastu-remedies',
      title: 'Vastu Remedies',
      description: 'Simple remedies to fix vastu defects without reconstruction',
      icon: Sparkles,
      price: '₹1,499'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Vastu consultancy form submitted:', formData);
  };

  return (
    <div className="p-6 md:p-8">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sun className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Vastu Consultancy</h2>
            <p className="text-slate-500">
              Improve positivity, harmony, and energy flow in your space
            </p>
          </div>
        </div>
      </div>


      {/* Contact Form */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Book Vastu Consultation
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Phone + Property Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Property Type
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) =>
                  setFormData({ ...formData, propertyType: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="home">Home</option>
                <option value="office">Office</option>
                <option value="commercial">Commercial</option>
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
    placeholder="Enter your property address"
  />
</div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Details
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Describe your property or vastu concerns..."
            />
          </div>

          {/* Selected Service */}
          <p className="text-sm text-slate-500">
            Selected Service:
            <span className="font-semibold text-primary ml-1">
              {services.find(s => s.id === formData.service)?.title}
            </span>
          </p>

          {/* Submit */}
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            Book Consultation
            <ArrowRight className="h-4 w-4" />
          </button>

        </form>
      </div>
    </div>
  );
}