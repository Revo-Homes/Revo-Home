import { useState } from 'react';
import { Paintbrush, CheckCircle2, ArrowRight, Palette, Home, Star } from 'lucide-react';

export default function InteriorDesign() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    spaceType: 'living-room',
    budget: '2-5-lakhs',
    message: ''
  });

  const services = [
    {
      id: '3d-visualization',
      title: '3D Visualization',
      description: 'Realistic 3D renderings of your dream space',
      icon: Home,
      price: '₹10,000'
    },
    {
      id: 'modular-kitchen',
      title: 'Modular Kitchen',
      description: 'Custom modular kitchen design and installation',
      icon: Paintbrush,
      price: '₹50,000'
    },
    {
      id: 'end-to-end',
      title: 'End-to-end Execution',
      description: 'Complete interior project management from concept to reality',
      icon: Star,
      price: 'Custom Quote'
    },
    {
      id: 'quality-assurance',
      title: 'Quality Assurance',
      description: 'Premium materials and craftsmanship guarantee',
      icon: CheckCircle2,
      price: 'Included'
    },
    {
      id: 'business-plan',
      title: 'Business Plan',
      description: 'Get a complete interior business strategy including budgeting, vendor planning, and execution roadmap.',
      icon: Palette,
      price: '₹25,000'
    }
  ];
  const portfolio = [
    {
      id: 1,
      title: 'Modern Living Room',
      category: 'Residential',
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      title: 'Luxury Bedroom',
      category: 'Residential',
      image: '/api/placeholder/300/200'
    },
    {
      id: 3,
      title: 'Office Interior',
      category: 'Commercial',
      image: '/api/placeholder/300/200'
    },
    {
      id: 4,
      title: 'Kitchen Design',
      category: 'Residential',
      image: '/api/placeholder/300/200'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Interior design form submitted:', formData);
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Paintbrush className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Interior Design</h2>
            <p className="text-slate-500">Transform your space with curated partner designers</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Our Design Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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

          {/* Portfolio */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Projects</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {portfolio.map((item) => (
                <div key={item.id} className="group relative overflow-hidden rounded-xl border border-slate-200 hover:border-primary/30 transition-all">
                  <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center">
                    <Palette className="h-8 w-8 text-slate-400" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-semibold text-sm">{item.title}</p>
                      <p className="text-white/80 text-xs">{item.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Design Process */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Our Design Process</h3>
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-3 font-semibold">1</div>
                  <h4 className="font-semibold text-slate-900 mb-1">Consultation</h4>
                  <p className="text-sm text-slate-600">Understanding your vision and requirements</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-3 font-semibold">2</div>
                  <h4 className="font-semibold text-slate-900 mb-1">Design Concept</h4>
                  <p className="text-sm text-slate-600">Creating mood boards and 3D visualizations</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-3 font-semibold">3</div>
                  <h4 className="font-semibold text-slate-900 mb-1">Material Selection</h4>
                  <p className="text-sm text-slate-600">Choosing premium materials and finishes</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-3 font-semibold">4</div>
                  <h4 className="font-semibold text-slate-900 mb-1">Execution</h4>
                  <p className="text-sm text-slate-600">Professional installation and finishing</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Get a Design Quote</h3>
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">Space Type</label>
                  <select
                    value={formData.spaceType}
                    onChange={(e) => setFormData({...formData, spaceType: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="living-room">Living Room</option>
                    <option value="bedroom">Bedroom</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="bathroom">Bathroom</option>
                    <option value="entire-home">Entire Home</option>
                    <option value="office">Office</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Budget Range</label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="1-2-lakhs">₹1-2 Lakhs</option>
                  <option value="2-5-lakhs">₹2-5 Lakhs</option>
                  <option value="5-10-lakhs">₹5-10 Lakhs</option>
                  <option value="10+ lakhs">₹10+ Lakhs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Design Requirements</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  placeholder="Describe your design vision..."
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                Get Design Quote
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Why Choose Us */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h4 className="font-semibold text-slate-900 mb-4">Why Choose Our Designers?</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700">15+ years of experience</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700">500+ projects completed</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700">Premium quality materials</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700">On-time delivery guarantee</span>
              </li>
            </ul>
          </div>

          {/* Testimonials */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
            <h4 className="font-semibold text-slate-900 mb-4">Client Testimonials</h4>
            <div className="space-y-4">
              <div className="bg-white/60 rounded-lg p-4">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic">"Amazing transformation of our living room. The designer understood our vision perfectly!"</p>
                <p className="text-xs text-slate-500 mt-2">- Priya Sharma, Bhubaneswar</p>
              </div>
              <div className="bg-white/60 rounded-lg p-4">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic">"Professional service and excellent quality. Our modular kitchen looks stunning!"</p>
                <p className="text-xs text-slate-500 mt-2">- Rahul Verma, Cuttack</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}