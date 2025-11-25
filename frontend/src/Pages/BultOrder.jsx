import React, { useState, useEffect } from 'react';
import { Send, Check, Upload, X, Shirt, Flag, Award, Sticker, Frame, Coffee, Phone, ChevronDown, Star } from 'lucide-react';
import { useToast } from '../Providers/ToastProvider';
import Allapi from '../common';
import useUser from '../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import bulk from '../assets/bulk.png';
import bulk1 from '../assets/bulk1.webp';
import bulk2 from '../assets/bulk2.jpg';
import bulk3 from '../assets/bulk3.jpeg';
import bulk4 from '../assets/bulk4.webp';
import shirt1 from '../assets/shirts/shirt1.jpeg';
import shirt2 from '../assets/shirts/shirt2.jpeg';
import shirt3 from '../assets/shirts/shirt3.jpeg';
import shirt4 from '../assets/shirts/shirt4.jpeg';
import shirt5 from '../assets/shirts/shirt5.jpeg';
import shirt6 from '../assets/shirts/shirt6.jpeg';
import shirt7 from '../assets/shirts/shirt7.jpeg';
import shirt8 from '../assets/shirts/shirt8.jpeg';
import shirt9 from '../assets/shirts/shirt9.jpeg';
import shirt10 from '../assets/shirts/shirt10.jpeg';
import r1 from '../assets/remaining/r1.jpeg';
import r2 from '../assets/remaining/r2.jpeg';
import r3 from '../assets/remaining/r3.jpeg';
import r4 from '../assets/remaining/r4.jpeg';
import r5 from '../assets/remaining/r5.jpeg';
import r6 from '../assets/remaining/r6.jpeg';
import r7 from '../assets/remaining/r7.jpeg';

// Centralized size/type options for dropdowns
const SIZE_OPTIONS = {
  Banners: ['18x24', '24x36', '36x48', '48x72', 'Custom'],
  IdCards: ['3.5x2', '3.375x2.125 (CR80)', 'Custom'],
  Certificates: ['A4 (8.3x11.7)', 'A5 (5.8x8.3)', 'Letter (8.5x11)', 'Custom'],
  Stickers: ['2x2', '3x3', '4x4', '5x5', 'Custom'],
  Photoframes: ['4x6', '5x7', '8x10', 'A4', 'Custom'],
  Mugs: ['11oz Standard', '15oz Large', 'Magic Mug', 'Custom']
};

const BulkOrder = () => {
  const { user, token } = useUser();
  const toastMsg = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    company: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploading, setUploading] = useState(false);

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const [requirementsData, setRequirementsData] = useState({
    Tshirts: { type: '', quantity: 0, image: '', description: '' },
    Banners: { size: '', quantity: 0, image: '', description: '' },
    IdCards: { size: '', quantity: 0, image: '', description: '' },
    Certificates: { size: '', quantity: 0, image: '', description: '' },
    Stickers: { size: '', quantity: 0, image: '', description: '' },
    Photoframes: { size: '', quantity: 0, image: '', description: '' },
    Mugs: { size: '', quantity: 0, image: '', description: '' },
  });

  const products = [
    { key: 'Tshirts', icon: Shirt, label: 'T-Shirts' },
    { key: 'Banners', icon: Flag, label: 'Banners' },
    { key: 'IdCards', icon: Award, label: 'ID Cards' },
    { key: 'Certificates', icon: Award, label: 'Certificates' },
    { key: 'Stickers', icon: Sticker, label: 'Stickers' },
    { key: 'Photoframes', icon: Frame, label: 'Photo Frames' },
    { key: 'Mugs', icon: Coffee, label: 'Mugs' },
  ];

  const tshirtModels = ['Rounded Neck', 'Collar', 'Full hand T shirt', 'Hoodies', 'Sports'];
  const tshirtSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
  const tshirtFrontOptions = ['Printed front', 'Non printed front'];
  const tshirtBackOptions = ['Printed Back', 'Non Printed Back'];

  const [tshirtModel, setTshirtModel] = useState('');
  const [tshirtColor, setTshirtColor] = useState('');
  const [tshirtSize, setTshirtSize] = useState('');
  const [tshirtFront, setTshirtFront] = useState('');
  const [tshirtBack, setTshirtBack] = useState('');

  const preBuiltShirts = [shirt1, shirt2, shirt3, shirt4, shirt5, shirt6, shirt7, shirt8, shirt9, shirt10];
  const otherWorks = [r1, r2, r3, r4, r5, r6, r7];

  // Hero images array
  const heroImages = [bulk, bulk1, bulk2, bulk3, bulk4];

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('bulkOrderForm');
    const savedRequirements = localStorage.getItem('bulkOrderRequirements');
    const savedSelections = localStorage.getItem('bulkOrderSelections');

    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
    if (savedRequirements) {
      setRequirementsData(JSON.parse(savedRequirements));
    }
    if (savedSelections) {
      const { selectedProduct: selProd, tshirtModel: model, tshirtColor: color, tshirtSize: size, tshirtFront: front, tshirtBack: back } = JSON.parse(savedSelections);
      setSelectedProduct(selProd);
      setTshirtModel(model);
      setTshirtColor(color);
      setTshirtSize(size);
      setTshirtFront(front);
      setTshirtBack(back);
    }
  }, []);

  // Save to localStorage whenever form data changes
  useEffect(() => {
    localStorage.setItem('bulkOrderForm', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('bulkOrderRequirements', JSON.stringify(requirementsData));
  }, [requirementsData]);

  useEffect(() => {
    localStorage.setItem('bulkOrderSelections', JSON.stringify({
      selectedProduct,
      tshirtModel,
      tshirtColor,
      tshirtSize,
      tshirtFront,
      tshirtBack
    }));
  }, [selectedProduct, tshirtModel, tshirtColor, tshirtSize, tshirtFront, tshirtBack]);

  // Clear localStorage on successful submit
  const clearFormData = () => {
    localStorage.removeItem('bulkOrderForm');
    localStorage.removeItem('bulkOrderRequirements');
    localStorage.removeItem('bulkOrderSelections');
  };

  // Update T-shirt type string when selections change
  useEffect(() => {
    if (selectedProduct === 'Tshirts') {
      const type = [tshirtModel, tshirtColor, tshirtSize, tshirtFront, tshirtBack].filter(Boolean).join(' - ');
      setRequirementsData(prev => ({
        ...prev,
        Tshirts: { ...prev.Tshirts, type }
      }));
    }
  }, [tshirtModel, tshirtColor, tshirtSize, tshirtFront, tshirtBack, selectedProduct]);

  const uploadToCloudinary = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: fd
    });
    const data = await res.json();
    return data.secure_url;
  };

  const handleImageUpload = async (e, productKey) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setRequirementsData(prev => ({
        ...prev,
        [productKey]: { ...prev[productKey], image: url }
      }));
    } catch (err) {
      toastMsg('error', 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (productKey) => {
    setRequirementsData(prev => ({
      ...prev,
      [productKey]: { ...prev[productKey], image: '' }
    }));
  };

  const handleQuantityChange = (productKey, value) => {
    const num = parseInt(value) || 0;
    setRequirementsData(prev => ({
      ...prev,
      [productKey]: { ...prev[productKey], quantity: num }
    }));
  };

  const handleSizeChange = (productKey, value) => {
    setRequirementsData(prev => ({
      ...prev,
      [productKey]: { ...prev[productKey], size: value }
    }));
  };

  const handleDescriptionChange = (productKey, value) => {
    setRequirementsData(prev => ({
      ...prev,
      [productKey]: { ...prev[productKey], description: value }
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!user) {
      toastMsg('error',"Please Login")
      return;
    }

    if (!formData.mobile || !formData.company) {
      toastMsg('error', 'Please fill all required fields (Mobile & Company)');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        requirements: requirementsData,
        userId: user._id,
        username: user.name,
        useremail: user.email
      };

      const response = await fetch(Allapi.quotes.create.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toastMsg('success', 'Quote submitted successfully! We\'ll contact you soon.');
        
        // Reset form and clear localStorage only after successful submission
        clearFormData();
        setFormData({ name: '', email: '', mobile: '', company: '', description: '' });
        setRequirementsData({
          Tshirts: { type: '', quantity: 0, image: '', description: '' },
          Banners: { size: '', quantity: 0, image: '', description: '' },
          IdCards: { size: '', quantity: 0, image: '', description: '' },
          Certificates: { size: '', quantity: 0, image: '', description: '' },
          Stickers: { size: '', quantity: 0, image: '', description: '' },
          Photoframes: { size: '', quantity: 0, image: '', description: '' },
          Mugs: { size: '', quantity: 0, image: '', description: '' },
        });
        setSelectedProduct(null);
        setTshirtModel('');
        setTshirtColor('');
        setTshirtSize('');
        setTshirtFront('');
        setTshirtBack('');
      } else {
        throw new Error(result.message || 'Failed to submit quote');
      }
    } catch (error) {
      console.error('Quote submission error:', error);
      toastMsg('error', error.message || 'Failed to submit quote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans pt-16">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-blue-100 px-4 md:px-6 py-3 flex justify-between items-center z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <img src={logo} alt="PrintMaania" className="h-8 w-auto" />
          <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">PrintMaania</div>
        </div>

        <div className="flex items-center space-x-1 md:space-x-2">
          <button
            onClick={() => window.open('https://wa.me/919063347447', '_blank', 'noopener,noreferrer')}
            className={`flex items-center justify-center  w-9 h-9 md:w-11 md:h-11 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-md transition-all duration-300 `}
            aria-label="WhatsApp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.149-.198.297-.768.967-.94 1.166-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.173.198-.297.298-.495.099-.198.05-.371-.025-.52-.074-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.298-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.718 2.007-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M20.52 3.48A11.92 11.92 0 0012 0C5.383 0 0 5.383 0 12c0 2.116.553 4.19 1.602 6.02L0 24l6.18-1.584A11.936 11.936 0 0012 24c6.617 0 12-5.383 12-12 0-3.197-1.247-6.203-3.48-8.52zM12 21.6a9.56 9.56 0 01-4.91-1.36l-.35-.21-3.67.94.98-3.58-.23-.37A9.55 9.55 0 012.4 12c0-5.283 4.317-9.6 9.6-9.6 5.283 0 9.6 4.317 9.6 9.6 0 5.283-4.317 9.6-9.6 9.6z" />
            </svg>
          </button>

          {/* Instagram */}
          <button
            onClick={() => window.open('https://www.instagram.com/print_maania?igsh=NGc4dGF5aTBtbWRm', '_blank', 'noopener,noreferrer')}
            className={`flex items-center justify-center mr-3 w-9 h-9 md:w-11 md:h-11 rounded-full bg-pink-600 hover:bg-pink-700 text-white shadow-md transition-all duration-300`}
            aria-label="Instagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.8-.9a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z"/>
            </svg>
          </button>

          <a href="tel:9063347447" className="bg-gradient-to-r from-blue-500 to-orange-500 text-white px-3 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-1 md:gap-2">
            <Phone className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">9063347447</span>
            <span className="sm:hidden">Call</span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-orange-50 px-4 py-16 md:py-20 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16">
            <div className="space-y-6 md:space-y-8">
              <div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 md:mb-6">
                  Empower Your Brand With
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">Innovation & Excellence</span>
                </h1>
                <p className="text-base md:text-xl text-gray-700 leading-relaxed">
                  We deliver top-notch quality customized bulk printing solutions across all verticals, helping your business improve visibility and gain customers' attention with precision and care.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {['Best Quality', 'Lowest Price', 'Free Shipping', '100% Guaranteed'].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 md:gap-3 bg-white p-3 md:p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-800 text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="bg-gradient-to-br from-blue-100 to-orange-50 rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  {heroImages.map((image, idx) => (
                    <img
                      key={idx}
                      src={image}
                      alt="Printing"
                      className="rounded-2xl h-48 object-cover shadow-lg hover:scale-105 transition-transform duration-300"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Quote Form Section */}
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl border-2 border-blue-100">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Get Your Custom Quote</h2>

            {/* Contact Details */}
            <div className="space-y-4 mb-10">
              <input 
                type="text" 
                name="name" 
                placeholder="Full Name" 
                value={formData.name} 
                onChange={handleInputChange} 
                className="w-full px-4 md:px-5 py-3 md:py-3.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-600 bg-blue-50 font-medium transition-all placeholder-gray-500 text-sm md:text-base" 
                required 
                disabled={isSubmitting}
              />
              <input 
                type="email" 
                name="email" 
                placeholder="Email Address" 
                value={formData.email} 
                onChange={handleInputChange} 
                className="w-full px-4 md:px-5 py-3 md:py-3.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-600 bg-blue-50 font-medium transition-all placeholder-gray-500 text-sm md:text-base" 
                required 
                disabled={isSubmitting}
              />
              <input 
                type="tel" 
                name="mobile" 
                placeholder="Mobile Number *" 
                value={formData.mobile} 
                onChange={handleInputChange} 
                className="w-full px-4 md:px-5 py-3 md:py-3.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-600 bg-blue-50 font-medium transition-all placeholder-gray-500 text-sm md:text-base" 
                required 
                disabled={isSubmitting}
              />
              <input 
                type="text" 
                name="company" 
                placeholder="Company / Organization Name *" 
                value={formData.company} 
                onChange={handleInputChange} 
                className="w-full px-4 md:px-5 py-3 md:py-3.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-600 bg-blue-50 font-medium transition-all placeholder-gray-500 text-sm md:text-base" 
                required 
                disabled={isSubmitting}
              />
              <textarea 
                name="description" 
                placeholder="Any additional notes (optional)..." 
                value={formData.description} 
                onChange={handleInputChange} 
                rows="3" 
                className="w-full px-4 md:px-5 py-3 md:py-3.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-600 bg-blue-50 font-medium transition-all placeholder-gray-500 resize-none text-sm md:text-base" 
                disabled={isSubmitting}
              />
            </div>

            {/* Select Requirements */}
            <div className="mb-10">
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-6 text-center">Select Your Requirements</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 md:gap-4">
                {products.map(({ key, icon: Icon, label }) => {
                  const req = requirementsData[key];
                  const hasQty = req.quantity > 0;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedProduct(key)}
                      className={`relative bg-gradient-to-br from-blue-50 to-orange-100 rounded-2xl p-3 md:p-5 flex flex-col items-center gap-2 md:gap-3 hover:from-blue-100 hover:to-orange-200 transition-all transform hover:scale-105 shadow-md ${selectedProduct === key ? 'ring-4 ring-blue-500' : ''}`}
                    >
                      <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center shadow">
                        <Icon className="w-5 h-5 md:w-8 md:h-8 text-blue-600" />
                      </div>
                      <span className="text-xs md:text-sm font-semibold text-center line-clamp-2">{label}</span>
                      {hasQty && <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center font-bold">{req.quantity}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Product Configuration */}
            {selectedProduct && (
              <div className="bg-gradient-to-br from-blue-50 to-orange-100 rounded-2xl p-5 md:p-8 mb-8 border-2 border-blue-300 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg md:text-2xl font-bold text-blue-900">
                    Configure {products.find(p => p.key === selectedProduct)?.label}
                  </h4>
                  <button onClick={() => setSelectedProduct(null)} className="text-blue-600 hover:text-blue-800 p-1">
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>

                {selectedProduct === 'Tshirts' ? (
                  <div>
                    <div className="mb-6">
                      <h5 className="text-lg font-bold text-blue-900 mb-4">Our Pre-built Designs</h5>
                      <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
                        {preBuiltShirts.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Pre-built shirt ${idx + 1}`}
                            className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg shadow-md"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-5 md:space-y-6">
                      <div>
                        <label className="block text-xs md:text-sm font-bold text-blue-900 mb-3">Model</label>
                        <div className="grid grid-cols-2 gap-3">
                          {tshirtModels.map(m => (
                            <button key={m} onClick={() => setTshirtModel(m)} className={`py-2 md:py-3 px-3 rounded-xl font-bold transition-all text-sm md:text-base ${tshirtModel === m ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-800 border-2 border-blue-300 hover:border-blue-500'}`}>
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-bold text-blue-900 mb-3">Color</label>
                        <input 
                          type="text" 
                          value={tshirtColor} 
                          onChange={(e) => setTshirtColor(e.target.value)} 
                          placeholder="Type the color (e.g., White, Black, Red)" 
                          className="w-full px-3 md:px-4 py-2 md:py-3 rounded-xl border-2 border-blue-300 focus:border-blue-600 bg-white focus:outline-none text-sm md:text-base" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-bold text-blue-900 mb-3">Size</label>
                        <div className="relative">
                          <select
                            value={tshirtSize}
                            onChange={(e) => setTshirtSize(e.target.value)}
                            className="w-full px-4 py-3 md:py-3.5 rounded-xl border-2 border-blue-300 focus:border-blue-600 bg-white appearance-none cursor-pointer text-sm md:text-base font-medium text-gray-800"
                          >
                            <option value="">Select Size</option>
                            {tshirtSizes.map(size => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-bold text-blue-900 mb-3">Front</label>
                        <div className="grid grid-cols-2 gap-3">
                          {tshirtFrontOptions.map(f => (
                            <button key={f} onClick={() => setTshirtFront(f)} className={`py-2 md:py-3 px-3 rounded-xl font-bold transition-all text-sm md:text-base ${tshirtFront === f ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-800 border-2 border-blue-300 hover:border-blue-500'}`}>
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-bold text-blue-900 mb-3">Back</label>
                        <div className="grid grid-cols-2 gap-3">
                          {tshirtBackOptions.map(o => (
                            <button key={o} onClick={() => setTshirtBack(o)} className={`py-2 md:py-3 px-3 rounded-xl font-bold transition-all text-sm md:text-base ${tshirtBack === o ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-800 border-2 border-blue-300 hover:border-blue-500'}`}>
                              {o}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-bold text-blue-900 mb-2">Quantity</label>
                        <input type="number" min="1" value={requirementsData.Tshirts.quantity || ''} onChange={(e) => handleQuantityChange('Tshirts', e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 rounded-xl border-2 border-blue-300 focus:border-blue-600 bg-white focus:outline-none text-sm md:text-base" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs md:text-sm font-bold text-blue-900 mb-3">Size</label>
                      <div className="relative">
                        <select
                          value={requirementsData[selectedProduct].size}
                          onChange={(e) => handleSizeChange(selectedProduct, e.target.value)}
                          className="w-full px-4 py-3 md:py-3.5 rounded-xl border-2 border-blue-300 focus:border-blue-600 bg-white appearance-none cursor-pointer text-sm md:text-base font-medium text-gray-800"
                        >
                          <option value="">Select Size</option>
                          {SIZE_OPTIONS[selectedProduct]?.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-bold text-blue-900 mb-3">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={requirementsData[selectedProduct].quantity || ''}
                        onChange={(e) => handleQuantityChange(selectedProduct, e.target.value)}
                        className="w-full px-4 py-3 md:py-3.5 rounded-xl border-2 border-blue-300 focus:border-blue-600 bg-white focus:outline-none text-sm md:text-base font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="mt-6">
                  <label className="block text-xs md:text-sm font-bold text-blue-900 mb-2">Description (Optional)</label>
                  <textarea 
                    value={requirementsData[selectedProduct].description || ''} 
                    onChange={(e) => handleDescriptionChange(selectedProduct, e.target.value)}
                    rows="3" 
                    placeholder="Add any specific details about this requirement..."
                    className="w-full px-4 md:px-5 py-3 md:py-3.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-600 bg-blue-50 font-medium transition-all placeholder-gray-500 resize-none text-sm md:text-base" 
                  />
                </div>

                {/* Image Upload */}
                <div className="mt-8">
                  <label className="block text-xs md:text-sm font-bold text-blue-900 mb-4">Upload Design (Optional)</label>
                  <div className="min-h-64">
                    {requirementsData[selectedProduct].image ? (
                      <div className="relative">
                        <img
                          src={requirementsData[selectedProduct].image}
                          alt="Uploaded design"
                          className="w-full h-64 md:h-80 object-contain rounded-xl border-2 border-blue-300 bg-white p-4 shadow-md"
                        />
                        <button
                          onClick={() => removeImage(selectedProduct)}
                          className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transition"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="w-full h-64 md:h-80 border-4 border-dashed border-blue-400 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all duration-300 flex flex-col items-center justify-center">
                          {uploading ? (
                            <div className="text-blue-600 font-bold text-lg">Uploading...</div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 md:h-12 md:w-12 text-blue-500 mb-4" />
                              <span className="text-blue-700 text-sm font-bold ">Click to upload design</span>
                              <span className="text-gray-600 text-sm mt-2">Supports JPG, PNG, PDF</span>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, selectedProduct)}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full mt-6 md:mt-8 bg-gradient-to-r from-blue-600 to-orange-500 text-white py-4 md:py-5 rounded-2xl text-sm md:text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 md:gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                  <span>SUBMITTING...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 md:w-6 md:h-6" />
                  GET YOUR QUOTE NOW
                </>
              )}
            </button>
            <p className="text-xs md:text-sm text-gray-500 mt-3 text-center">
              {user ? "We'll get back to you within 24 hours with a customized quote" : "Please log in to submit your quote request"}
            </p>

            {/* Our Other Works */}
            <div className="mt-12">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">Our Other Works</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {otherWorks.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Other work ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Provide Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-gray-900">
            What We Provide
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shirt,
                title: 'Custom Apparel',
                desc: 'High-quality T-shirts, hoodies, and polos with vibrant, long-lasting prints tailored to your brand.'
              },
              {
                icon: Flag,
                title: 'Large Format Banners',
                desc: 'Eye-catching vinyl banners and backdrops for events, promotions, and outdoor advertising that stand out.'
              },
              {
                icon: Award,
                title: 'Professional Documents',
                desc: 'Crisp ID cards, certificates, and stationery on premium paper stock for official and corporate needs.'
              },
              {
                icon: Sticker,
                title: 'Adhesive Solutions',
                desc: 'Durable stickers, labels, and decals in various shapes and finishes for packaging and branding.'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Static Reviews Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-gray-900">
            What Our Clients Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Ravi Kumar',
                company: 'Andhra University',
                text: 'PrintMaania delivered 500 custom banners on time with impeccable quality. Our university event was a huge success—highly recommend!',
                rating: 5
              },
              {
                name: 'Sita Reddy',
                company: 'Osmania University',
                text: 'The T-shirt printing was spot-on, vibrant colors and comfortable fabric. Bulk order of 200 pieces for our Hyderabad fest arrived perfectly packaged.',
                rating: 5
              },
              {
                name: 'Anil Naidu',
                company: 'JNTU Hyderabad',
                text: 'Affordable rates, fast turnaround, and excellent customer service. Our stickers and certificates for the college looked professional—5 stars!',
                rating: 5
              }
            ].map((review, idx) => (
              <div key={idx} className="bg-blue-50 rounded-2xl p-6 md:p-8 border border-blue-100 shadow-md">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                <div className="flex items-center">
                  <div className="font-semibold text-gray-900 mr-2">{review.name}</div>
                  <div className="text-sm text-blue-600">{review.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-r from-blue-50 to-orange-50 text-blue-800">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-blue-700">About PrintMaania</h3>
              <p className="text-xs md:text-sm leading-relaxed text-blue-600">
                Committed to bringing you the finest Printing Service, sourced responsibly and crafted with care.
              </p>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-blue-700">Quick Links</h3>
              <ul className="space-y-2 text-xs md:text-sm">
                <li><a href="#" className="hover:text-blue-700 transition-colors text-blue-600">About Us</a></li>
                <li><a href="#" className="hover:text-blue-700 transition-colors text-blue-600">Products</a></li>
                <li><a href="#" className="hover:text-blue-700 transition-colors text-blue-600">Common Queries</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-blue-700">Contact Us</h3>
              <div className="space-y-2 text-xs md:text-sm">
                <p className="text-blue-600"><span className="font-medium">Name:</span> Dr Owner</p>
                <p className="text-blue-600"><span className="font-medium">Email:</span> printmaania@gmail.com</p>
                <p className="text-blue-600"><span className="font-medium">Phone:</span> +91 98491 1105</p>
                <p className="text-blue-600"><span className="font-medium">Address:</span> Vijayawada, Andhra Pradesh</p>
              </div>
            </div>
          </div>
          <div className="border-t border-blue-200 pt-4 md:pt-6 text-center text-xs md:text-sm text-blue-600">
            © 2025 PrintMaania. All rights reserved.
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar { 
          display: none;  /* Safari and Chrome */
        }
      `}</style>
    </div>
  );
};

export default BulkOrder;