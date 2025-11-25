// QuotesManagement.jsx
import React, { useState, useEffect } from 'react';
import { X, Mail, User, Phone, Building, Calendar, FileText, CheckCircle, Download, Package, AlertCircle, UserCheck, Ban, Truck, Shirt, Flag, IdCard, Award, Sticker, Frame, Coffee } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Allapi from '../common';

const QuotesManagement = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(Allapi.quotes.getAll.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch quotes');
      const data = await response.json();
      setQuotes(data.quotes || []);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

// Fixed downloadImage function - converts image to blob first
  const downloadImage = async (url, filename) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
      toast.error(`Failed to download ${filename}`);
    }
  };

  // Fixed downloadAllImages function - uses async/await for better control
  const downloadAllImages = async (images) => {
    if (!images || images.length === 0) {
      toast.error('No images to download');
      return;
    }

    setDownloading(true);
    let completed = 0;
    let failed = 0;
    const total = images.length;

    for (let i = 0; i < images.length; i++) {
      try {
        await downloadImage(images[i], `bulk-img-${i + 1}.jpg`);
        completed++;
        // Small delay between downloads to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        failed++;
      }
    }

    setDownloading(false);
    if (failed > 0) {
      toast.error(`Downloaded ${completed}/${total} images. ${failed} failed.`);
    } else {
      toast.success(`Downloaded ${total} images successfully!`);
    }
  };
  const handleConfirmQuote = async (id) => {
    if (processing) return;
    setProcessing(true);
    try {
      const res = await fetch(Allapi.quotes.confirm.url(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success('Quote confirmed!');
        fetchQuotes();
        setSelectedQuote(prev => ({ ...prev, confirm: true }));
      }
    } catch (err) {
      toast.error('Failed to confirm');
    } finally {
      setProcessing(false);
    }
  };

  const handleAssignTracking = async (id) => {
    if (!trackingId.trim()) {
      toast.error('Please enter a tracking ID');
      return;
    }
    if (processing) return;
    setProcessing(true);

    try {
      const res = await fetch(Allapi.quotes.assignTracking.url(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trackingId: trackingId.trim() }),
      });

      if (res.ok) {
        toast.success('Tracking ID assigned!');
        fetchQuotes();
        setSelectedQuote(prev => ({ ...prev, trackingId: trackingId.trim() }));
        setTrackingId('');
      }
    } catch (err) {
      toast.error('Failed to assign tracking ID');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkDelivered = async (id) => {
    if (processing) return;
    setProcessing(true);

    try {
      const res = await fetch(Allapi.quotes.markDelivered.url(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success('Marked as delivered!');
        fetchQuotes();
        setSelectedQuote(prev => ({ ...prev, delivered: true }));
      }
    } catch (err) {
      toast.error('Failed to mark delivered');
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (quote) => {
    setSelectedQuote(quote);
    setTrackingId(quote.trackingId || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedQuote(null);
    setTrackingId('');
  };

  // Product config with icons
  const productConfig = {
    Tshirts: { icon: Shirt, label: "T-Shirts" },
    Banners: { icon: Flag, label: "Banners" },
    IdCards: { icon: IdCard, label: "ID Cards" },
    Certificates: { icon: Award, label: "Certificates" },
    Stickers: { icon: Sticker, label: "Stickers" },
    Photoframes: { icon: Frame, label: "Photo Frames" },
    Mugs: { icon: Coffee, label: "Mugs" },
  };

  const getActiveRequirements = (requirements) => {
    if (!requirements) return [];
    return Object.entries(requirements)
      .filter(([_, data]) => data && data.quantity > 0)
      .map(([key, data]) => ({
        name: key,
        ...data,
        config: productConfig[key] || { icon: Package, label: key }
      }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64 py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-600 text-xl">Error: {error}</div>;
  }

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent">
              Bulk Orders Management
            </h1>
            <div className="text-sm font-medium bg-gradient-to-r from-blue-100 to-orange-100 text-blue-700 px-4 py-2 rounded-full border border-blue-200">
              Total Quotes: {quotes.length}
            </div>
          </div>

          {quotes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow">
              <FileText className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">No quotes found yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {quotes.map((quote) => (
                <div
                  key={quote._id}
                  onClick={() => openModal(quote)}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-blue-100 hover:border-orange-300 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{quote.name}</h3>
                          <p className="text-xs text-blue-600">{quote.company}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">

                        {quote.cancelled ? (
                          // show cancelled button only
                          <Ban className="w-5 h-5 text-red-500" /> 
                        ) : (
                          <>
                            {quote.confirm ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-orange-500" />
                            )}

                            {quote.delivered && (
                              <Truck className="w-5 h-5 text-emerald-600" />
                            )}
                          </>
                        )}

                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600 flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500" /> {quote.email}</p>
                      <p className="text-gray-600 flex items-center gap-2"><Phone className="w-4 h-4 text-orange-500" /> {quote.mobile}</p>
                      {quote.username && <p className="text-xs text-blue-700 flex items-center gap-1"><UserCheck className="w-4 h-4" /> {quote.username}</p>}
                    </div>

                    <div className="mt-4 pt-4 border-t border-blue-100 text-xs text-gray-500">
                      <p>{new Date(quote.createdAt).toLocaleDateString()}</p>
                      {quote.trackingId && (
                        <p className="font-semibold text-blue-600 mt-1 flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {quote.trackingId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Modal */}
      {showModal && selectedQuote && ( 
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto" style={{scrollbarWidth:'none'}}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 max-h-screen overflow-y-auto"  style={{scrollbarWidth:'none'}}>
            <div className="sticky top-0 bg-white border-b border-blue-100 p-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent">Bulk Order Details</h2>
              <button onClick={closeModal} className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedQuote.name}</h3>
                  <p className="text-blue-600 font-medium">{selectedQuote.company}</p>
                  {selectedQuote.username && (
                    <p className="text-sm text-green-600 mt-1">
                      Registered User: {selectedQuote.username} ({selectedQuote.useremail})
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-orange-50 p-4 rounded-xl border border-blue-100"><div className="flex items-center gap-3"><Mail className="w-5 h-5 text-blue-600" /><div><p className="text-xs text-gray-600">Email</p><p className="font-semibold">{selectedQuote.email}</p></div></div></div>
                <div className="bg-gradient-to-br from-orange-50 to-blue-50 p-4 rounded-xl border border-orange-100"><div className="flex items-center gap-3"><Phone className="w-5 h-5 text-orange-600" /><div><p className="text-xs text-gray-600">Mobile</p><p className="font-semibold">{selectedQuote.mobile}</p></div></div></div>
              </div>

              {/* Requirements Section */}
              <div className="bg-gradient-to-br from-blue-50 to-orange-50 p-6 rounded-2xl border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  Order Items
                </h3>
                {getActiveRequirements(selectedQuote.requirements).length === 0 ? (
                  <p className="text-gray-500 italic">No specific items requested</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getActiveRequirements(selectedQuote.requirements).map((item) => {
                      const Icon = item.config.icon;
                      return (
                        <div key={item.name} className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-orange-50 border-b border-blue-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center">
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{item.config.label}</h4>
                              <p className="text-sm text-blue-700">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            {(item.type || item.size) && (
                              <p className="text-sm text-gray-900">
                                <span className="font-bold">Size/Type:</span> {item.type || item.size}
                              </p>
                            )}

                            {item.description && item.description.length > 0 && (
                              <p className="text-sm bg-orange-50 text-orange-800 px-3 py-2 rounded-lg border border-orange-200">
                                <span className="font-bold text-orange-900">Description:</span> {item.description}
                              </p>
                            )}
                            
                            {item.image ? (
                              <div className="mt-3">
                                <p className="text-xs font-bold text-gray-900 mb-2">Uploaded Design:</p>
                                <img
                                  src={item.image}
                                  alt={`${item.config.label} design`}
                                  className="w-full h-48 object-contain rounded-lg border border-blue-200 bg-gray-50"
                                />
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 italic">No design uploaded</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* General Description */}
              {selectedQuote.description && (
                <div className="bg-gradient-to-br from-blue-50 to-orange-50 p-5 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Additional Notes</p>
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedQuote.description}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Submitted: {new Date(selectedQuote.createdAt).toLocaleString()}</span>
              </div>

              {/* Status & Actions */}
              <div className="pt-6 border-t border-blue-200 space-y-6">
                <div className="flex flex-wrap gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${selectedQuote.confirm ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {selectedQuote.confirm ? 'Confirmed' : 'Pending'}
                  </span>
                  {selectedQuote.delivered && (
                    <span className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold flex items-center gap-2">
                      <Truck className="w-4 h-4" /> Delivered
                    </span>
                  )}
                  {selectedQuote.confirm && selectedQuote.trackingId && !selectedQuote.delivered && (
                    <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">In Transit</span>
                  )}
                  {selectedQuote.trackingId && (
                    <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center gap-2">
                      <Package className="w-4 h-4" /> {selectedQuote.trackingId}
                    </span>
                  )}
                  {selectedQuote.cancelled && (
                    <span className="px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-semibold">Cancelled</span>
                  )}
                </div>

                <div className="space-y-4">
                  {!selectedQuote.confirm && !selectedQuote.cancelled && (
                    <button
                      onClick={() => handleConfirmQuote(selectedQuote._id)}
                      disabled={processing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg hover:shadow-xl transition-all"
                    >
                      {processing ? (
                        <>
                          <span className="animate-pulse">Confirming... Quote</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" /> Confirm Quote
                        </>
                      )}
                    </button>

                  )}

                  {!selectedQuote.trackingId && selectedQuote.confirm && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Tracking ID"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                      />
                      <button
                        onClick={() => handleAssignTracking(selectedQuote._id)}
                        disabled={processing || !trackingId.trim()}
                        className="px-6 bg-gradient-to-r from-blue-500 to-orange-500 hover:shadow-xl text-white rounded-xl font-bold disabled:opacity-50 transition-all shadow-lg"
                      >
                        Assign
                      </button>
                    </div>
                  )}

                  {getActiveRequirements(selectedQuote.requirements).some(item => item.image) && (
                    <button
                      onClick={() => {
                        const images = getActiveRequirements(selectedQuote.requirements)
                          .map(item => item.image)
                          .filter(img => img);
                        downloadAllImages(images);
                      }}
                      disabled={downloading}
                      className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:shadow-xl text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Download All Images
                    </button>
                  )}

                  {selectedQuote.confirm && !selectedQuote.delivered && (
                  <button
                    onClick={() => {
                      const images = getActiveRequirements(selectedQuote.requirements)
                        .map(item => item.image)
                        .filter(img => img);

                      downloadAllImages(images);
                    }}
                    disabled={downloading}
                    className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:shadow-xl text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg transition-all"
                  >
                    <Download className="w-5 h-5" />
                    {downloading ? "Downloading..." : "Download All Images"}
                  </button>

                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </>
  );
};

export default QuotesManagement;