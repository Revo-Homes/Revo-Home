import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProperty } from '../contexts/PropertyContext';
import { useAuth } from '../contexts/AuthContext';
import { propertyApi } from '../services/api';
import PropertySubscriptionGuard from '../guards/PropertySubscriptionGuard';
import {
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  LayoutDashboard,
  Sparkles,
  IndianRupee,
  MapPin,
  ImagePlus,
  Rocket,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

// Sub-components
import Step1BasicInfo from '../components/SellProperty/Step1BasicInfo';
import Step2CategoryDetails from '../components/SellProperty/Step2CategoryDetails';
import Step3Amenities from '../components/SellProperty/Step3Amenities';
import Step4Pricing from '../components/SellProperty/Step4Pricing';
import Step5Location from '../components/SellProperty/Step5Location';
import Step6Media from '../components/SellProperty/Step6Media';
import Step7Submit from '../components/SellProperty/Step7Submit';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Building2 },
  { id: 2, title: 'Details', icon: LayoutDashboard },
  { id: 3, title: 'Amenities', icon: Sparkles },
  { id: 4, title: 'Pricing', icon: IndianRupee },
  { id: 5, title: 'Location', icon: MapPin },
  { id: 6, title: 'Media', icon: ImagePlus },
  { id: 7, title: 'Publish', icon: Rocket },
];

function SellProperty() {
  const [step, setStep] = useState(1);
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { getProperty, createProperty, updateProperty, uploadPropertyImages, loading: propertyLoading } = useProperty();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dynamic form options from database
  const [formOptions, setFormOptions] = useState({});
  const [loadingFormOptions, setLoadingFormOptions] = useState(true);
  const [builders, setBuilders] = useState([]);
  const [isLoadingBuilders, setIsLoadingBuilders] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    property_title_tagline: "",
    description: "",
    propertyType: "",
    propertySubType: "",
    property_type_id: "",
    property_category_id: "",
    listingType: "Sale",
    property_condition: "",
    sale_urgency: "",
    status: "draft",
    is_builder_listed: false,
    builder_id: "",
    builder_name: "",
    selectedBHKs: [],
    bhkDetails: [],
    total_area: "",
    builtup_area: "",
    area_unit: "sqft",
    total_floors: "",
    floor_number: "",
    age_of_property: "",
    price_min: "",
    price_max: "",
    rent_amount: "",
    security_deposit: "",
    maintenance_charges: "",
    maintenance_charges_frequency: "monthly",
    price_on_request: false,
    negotiable: true,
    available_from: "",
    lock_in_period: "",
    lease_appreciation: "",
    city: "",
    locality: "",
    zip_code: "",
    full_address: "",
    state: "Maharashtra",
    latitude: "",
    longitude: "",
    rera_registered: false,
    rera_id: "",
    rera_state: "",
    features: [],
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    images: [],
    imagePreviews: [],
    documents: [],
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [customBhkInput, setCustomBhkInput] = useState('');
  const [customFeatures, setCustomFeatures] = useState([]);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherFeature, setOtherFeature] = useState('');
  const [nearbyLocations, setNearbyLocations] = useState([]);

  // Fetch Form Options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await propertyApi.getFormOptions();
        setFormOptions(response?.data || response || {});
      } catch (err) {
        console.error('Failed to load form options:', err);
      } finally {
        setLoadingFormOptions(false);
      }
    };
    fetchOptions();
  }, []);

  // Fetch Builders
  useEffect(() => {
    if (formData.is_builder_listed) {
      const fetchBuilders = async () => {
        setIsLoadingBuilders(true);
        try {
          const response = await propertyApi.getBuilders();
          setBuilders(response?.data || response || []);
        } catch (err) {
          console.error('Failed to load builders:', err);
        } finally {
          setIsLoadingBuilders(false);
        }
      };
      fetchBuilders();
    }
  }, [formData.is_builder_listed]);

  // Handle Load for Edit
  useEffect(() => {
    if (editId) {
      const loadProperty = async () => {
        try {
          const p = await getProperty(editId);
          if (p) {
            // Map backend data to formData
            setFormData(prev => ({
              ...prev,
              ...p,
              listingType: p.listing_type ? p.listing_type.charAt(0).toUpperCase() + p.listing_type.slice(1) : prev.listingType,
              propertyType: p.property_type?.name || p.propertyType,
              propertySubType: p.property_category?.name || p.propertySubType,
              bhkDetails: p.bhk_details || [],
              selectedBHKs: (p.bhk_details || []).map(d => d.type_slug || d.type),
            }));
          }
        } catch (err) {
          console.error('Failed to load property:', err);
        }
      };
      loadProperty();
    }
  }, [editId, getProperty]);

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getOptionLabel = (opt) => opt?.name || opt?.label || opt?.title || String(opt || '');
  const getOptionValue = (opt) => opt?.slug || opt?.value || opt?.id || String(opt || '');

  const getPropertyKind = (data) => {
    const type = (data.propertyType || '').toLowerCase();
    const subType = (data.propertySubType || '').toLowerCase();

    if (
      type.includes('residential') || 
      type.includes('flat') || 
      type.includes('apartment') ||
      subType.includes('flat') ||
      subType.includes('apartment')
    ) return 'Residential';
    
    if (type.includes('commercial')) return 'Commercial';
    if (type.includes('land')) return 'Land';
    if (type.includes('industrial')) return 'Industrial';
    if (type.includes('hospitality')) return 'Hospitality';
    return type || 'Residential';
  };

  const propertyKind = getPropertyKind(formData);

  const getCategoriesForSelectedType = (data, options) => {
    const categories = options.property_categories || [];
    if (!data.property_type_id) return categories;
    return categories.filter(cat => 
      String(cat.type_id || cat.property_type_id) === String(data.property_type_id)
    );
  };

  const getAreaUnitOptions = (options) => {
    const units = options.area_units || [];
    if (units.length > 0) return units.map(u => ({ value: u.value || u, label: u.label || u }));
    return [
      { value: 'sqft', label: 'Sq. Ft.' },
      { value: 'sqm', label: 'Sq. Mtr.' },
      { value: 'acre', label: 'Acre' }
    ];
  };

  const toggleBHK = (slug) => {
    setFormData(prev => {
      const selected = prev.selectedBHKs.includes(slug)
        ? prev.selectedBHKs.filter(s => s !== slug)
        : [...prev.selectedBHKs, slug];
      
      const details = prev.selectedBHKs.includes(slug)
        ? prev.bhkDetails.filter(d => (d.type_slug || d.type) !== slug)
        : [...prev.bhkDetails, { type: slug, type_slug: slug, bathrooms: '1', kitchens: '1', carpet_area: '', price: '' }];

      return { ...prev, selectedBHKs: selected, bhkDetails: details };
    });
  };

  const updateBHKDetail = (index, field, value) => {
    setFormData(prev => {
      const details = [...prev.bhkDetails];
      details[index] = { ...details[index], [field]: value };
      return { ...prev, bhkDetails: details };
    });
  };

  const removeBHKConfiguration = (slug) => {
    setFormData(prev => ({
      ...prev,
      selectedBHKs: prev.selectedBHKs.filter(s => s !== slug),
      bhkDetails: prev.bhkDetails.filter(d => (d.type_slug || d.type) !== slug)
    }));
  };

  const addCustomBHK = () => {
    if (!customBhkInput.trim()) return;
    const slug = customBhkInput.trim().toLowerCase().replace(/\s+/g, '_');
    toggleBHK(slug);
    setCustomBhkInput('');
  };

  const getBhkFieldVisibility = (slug) => ({
    showHallField: !slug.includes('rk'),
    showBalconyField: true,
    showAdditionalSpaceField: slug.includes('bhk')
  });

  const handleNearbyLocationChange = (index, field, value) => {
    const updated = [...nearbyLocations];
    updated[index][field] = value;
    setNearbyLocations(updated);
  };

  const addNearbyLocation = () => {
    setNearbyLocations([...nearbyLocations, { type: 'School', name: '', distance: '' }]);
  };

  const removeNearbyLocation = (index) => {
    setNearbyLocations(nearbyLocations.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => URL.createObjectURL(f));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files],
      imagePreviews: [...prev.imagePreviews, ...previews]
    }));
  };

  const handleImageDelete = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index)
    }));
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const handleDocumentDelete = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = "Property name is required";
      if (!formData.property_type_id) newErrors.property_type_id = "Property type is required";
    }
    if (step === 2) {
      if (propertyKind === 'Residential' && formData.bhkDetails.length === 0) {
        newErrors.bhk = "Please select at least one BHK configuration";
      }
      if (!formData.total_area) newErrors.total_area = "Total area is required";
    }
    if (step === 4) {
      if (formData.listingType === 'Sale' && !formData.price_min && !formData.price_on_request) {
        newErrors.price = "Minimum price is required";
      }
      if (formData.listingType === 'Rent' && !formData.rent_amount && !formData.price_on_request) {
        newErrors.rent = "Rent amount is required";
      }
    }
    if (step === 5) {
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.locality) newErrors.locality = "Locality is required";
      if (!formData.full_address) newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        listing_type: formData.listingType.toLowerCase(),
        property_kind: propertyKind,
        nearby_locations: nearbyLocations,
        amenities: formData.features
      };

      let result;
      if (editId) {
        result = await updateProperty(editId, payload);
      } else {
        result = await createProperty(payload);
      }

      if (result && formData.images.length > 0) {
        const uploadId = result.propertyId || result.id || result.data?.id;
        await uploadPropertyImages(uploadId, formData.images);
      }

      const navigateId = result.id || result.data?.id || result.propertyId;
      navigate(`/property/${navigateId}`);
    } catch (err) {
      console.error('Submission failed:', err);
      setErrors({ submit: err.message || "Failed to save property. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PropertySubscriptionGuard>
      <div className="min-h-screen bg-secondary/30 pt-32 pb-20">
        <div className="container mx-auto max-w-5xl px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary hover:shadow-lg transition-all"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                  {editId ? 'Edit Your Property' : 'List Your Property'}
                </h1>
                <p className="text-gray-500 font-medium mt-1">Transform your property into a premium listing.</p>
              </div>
            </div>
            
            {/* Simple Step Counter */}
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex -space-x-2">
                {STEPS.map((s) => (
                  <div 
                    key={s.id}
                    className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-500 ${
                      s.id < step ? 'bg-green-500' : s.id === step ? 'bg-primary scale-125' : 'bg-gray-200'
                    }`}
                  ></div>
                ))}
              </div>
              <span className="text-xs font-black text-gray-900 uppercase tracking-widest ml-2">Step {step} of 7</span>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="bg-white rounded-[48px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-gray-50">
              <div 
                className="h-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${(step / STEPS.length) * 100}%` }}
              ></div>
            </div>

            <div className="p-8 md:p-16">
              <form onSubmit={(e) => e.preventDefault()}>
                {step === 1 && (
                  <Step1BasicInfo 
                    formData={formData} 
                    setFormData={setFormData} 
                    formOptions={formOptions} 
                    loadingFormOptions={loadingFormOptions}
                    handleChange={handleChange}
                    builders={builders}
                    isLoadingBuilders={isLoadingBuilders}
                    propertyKind={propertyKind}
                    getOptionLabel={getOptionLabel}
                    getOptionValue={getOptionValue}
                    getCategoriesForSelectedType={getCategoriesForSelectedType}
                  />
                )}
                {step === 2 && (
                  <Step2CategoryDetails 
                    formData={formData}
                    setFormData={setFormData}
                    formOptions={formOptions}
                    propertyKind={propertyKind}
                    handleChange={handleChange}
                    getAreaUnitOptions={getAreaUnitOptions}
                    toggleBHK={toggleBHK}
                    updateBHKDetail={updateBHKDetail}
                    removeBHKConfiguration={removeBHKConfiguration}
                    addCustomBHK={addCustomBHK}
                    customBhkInput={customBhkInput}
                    setCustomBhkInput={setCustomBhkInput}
                    getBhkFieldVisibility={getBhkFieldVisibility}
                  />
                )}
                {step === 3 && (
                  <Step3Amenities 
                    formData={formData}
                    setFormData={setFormData}
                    formOptions={formOptions}
                    handleChange={handleChange}
                    customFeatures={customFeatures}
                    setCustomFeatures={setCustomFeatures}
                    showOtherInput={showOtherInput}
                    setShowOtherInput={setShowOtherInput}
                    otherFeature={otherFeature}
                    setOtherFeature={setOtherFeature}
                  />
                )}
                {step === 4 && (
                  <Step4Pricing 
                    formData={formData}
                    setFormData={setFormData}
                    handleChange={handleChange}
                    propertyKind={propertyKind}
                  />
                )}
                {step === 5 && (
                  <Step5Location 
                    formData={formData}
                    setFormData={setFormData}
                    handleChange={handleChange}
                    nearbyLocations={nearbyLocations}
                    setNearbyLocations={setNearbyLocations}
                    handleNearbyLocationChange={handleNearbyLocationChange}
                    addNearbyLocation={addNearbyLocation}
                    removeNearbyLocation={removeNearbyLocation}
                    formOptions={formOptions}
                  />
                )}
                {step === 6 && (
                  <Step6Media 
                    formData={formData}
                    setFormData={setFormData}
                    handleImageUpload={handleImageUpload}
                    handleImageDelete={handleImageDelete}
                    handleDocumentUpload={handleDocumentUpload}
                    handleDocumentDelete={handleDocumentDelete}
                  />
                )}
                {step === 7 && (
                  <Step7Submit 
                    formData={formData}
                    setFormData={setFormData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    submitting={submitting}
                    errors={errors}
                    propertyKind={propertyKind}
                  />
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-16 pt-10 border-t-2 border-gray-50">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={step === 1 || submitting}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                      step === 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>

                  {step < STEPS.length ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2 bg-gray-900 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-gray-900/10 active:scale-95 group"
                    >
                      Next Step
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : null}
                </div>
              </form>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Verified Listings</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Safe Transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Premium Support</span>
            </div>
          </div>
        </div>
      </div>
    </PropertySubscriptionGuard>
  );
}

export default SellProperty;
