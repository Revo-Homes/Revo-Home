import { useState } from 'react';
import { TrendingUp, CheckCircle2, ArrowRight, MapPin, Home, Calculator } from 'lucide-react';

export default function PropertyValuation() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyType: 'residential',
    area: '',
    location: '',
    message: ''
  });

  const [valuationResult, setValuationResult] = useState(null);

  const services = [
    {
      id: 'market-analysis',
      title: 'Market Analysis',
      description: 'Real-time market trends and comparative analysis',
      icon: TrendingUp,
      price: '₹2,000'
    },
    {
      id: 'locality-trends',
      title: 'Locality Trends',
      description: 'In-depth analysis of locality development and growth',
      icon: MapPin,
      price: '₹1,500'
    },
    {
      id: 'historical-data',
      title: 'Historical Data',
      description: 'Property price trends and appreciation analysis',
      icon: Calculator,
      price: '₹1,000'
    },
    {
      id: 'expert-valuation',
      title: 'Expert Valuation',
      description: 'Certified expert valuation with detailed report',
      icon: CheckCircle2,
      price: '₹3,000'
    }
  ];

  const recentValuations = [
    {
      id: 1,
      property: '3 BHK Apartment',
      location: 'Patia, Bhubaneswar',
      area: '1,650 sq ft',
      estimatedValue: '₹85 Lakhs',
      marketRate: '₹5,150/sq ft'
    },
    {
      id: 2,
      property: '2 BHK Flat',
      location: 'Saheed Nagar, Bhubaneswar',
      area: '1,200 sq ft',
      estimatedValue: '₹72 Lakhs',
      marketRate: '₹6,000/sq ft'
    },
    {
      id: 3,
      property: 'Independent House',
      location: 'Cuttack',
      area: '2,500 sq ft',
      estimatedValue: '₹1.2 Cr',
      marketRate: '₹4,800/sq ft'
    }
  ];

  const handleQuickValuation = (e) => {
    e.preventDefault();
    // Simulate valuation calculation
    const baseRate = formData.propertyType === 'residential' ? 5000 : 4000;
    const estimatedValue = parseInt(formData.area) * baseRate;
    setValuationResult({
      estimatedValue: estimatedValue,
      perSqFt: baseRate,
      confidence: '85%'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Property valuation form submitted:', formData);
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Property Valuation</h2>
            <p className="text-slate-500">Accurate market value assessment using real-time data</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Valuation */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Property Valuation</h3>
            <form onSubmit={handleQuickValuation} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Property Type</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Area (sq ft)</label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter area in sq ft"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter location/area"
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                Calculate Estimated Value
                <Calculator className="h-4 w-4" />
              </button>
            </form>

            {valuationResult && (
              <div className="mt-6 bg-white rounded-xl p-6 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-4">Estimated Valuation</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-500 mb-1">Estimated Value</p>
                    <p className="text-2xl font-bold text-primary">₹{(valuationResult.estimatedValue / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-500 mb-1">Rate per sq ft</p>
                    <p className="text-2xl font-bold text-slate-900">₹{valuationResult.perSqFt}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-500 mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-green-600">{valuationResult.confidence}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-4 text-center">
                  *This is an estimated value. For accurate valuation, please consult our experts.
                </p>
              </div>
            )}
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Our Valuation Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div key={service.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                      <service.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-primary">{service.price}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">{service.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Valuations */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Valuations</h3>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Property</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Area</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Est. Value</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Rate/sq ft</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {recentValuations.map((valuation) => (
                      <tr key={valuation.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{valuation.property}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{valuation.location}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{valuation.area}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-primary">{valuation.estimatedValue}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{valuation.marketRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Get Professional Valuation</h3>
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">Property Type</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Property Details</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  placeholder="Tell us about your property..."
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                Get Expert Valuation
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Market Insights */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h4 className="font-semibold text-slate-900 mb-4">Market Insights</h4>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">Bhubaneswar</span>
                  <span className="text-sm font-semibold text-green-600">+12.5%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">Cuttack</span>
                  <span className="text-sm font-semibold text-green-600">+8.3%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">Puri</span>
                  <span className="text-sm font-semibold text-green-600">+15.2%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '82%'}}></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">*Year-on-year price appreciation</p>
          </div>

          {/* Why Choose Us */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
            <h4 className="font-semibold text-slate-900 mb-4">Why Choose Our Valuation?</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700">RERA certified valuers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700">Real-time market data</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700">Detailed valuation reports</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700">Bank approved valuations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
