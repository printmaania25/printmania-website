import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import useUser from "../hooks/useUser";
import Allapi from "../common";
import toast from "react-hot-toast";
import Navbar from "../Components/Navbar";


function Order() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useUser();

  const [order, setOrder] = useState(null);
  const [qr, setQr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [pendingScreenshots, setPendingScreenshots] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    fetchOrder();
  }, []);

  async function fetchOrder() {
    const res = await fetch(Allapi.orders.getMyOrders.url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!data.success) return;

    const found = data.orders.find((o) => o._id === id);
    setOrder(found);

    generateQR(found.product.total_price);
  }

  async function generateQR(amount) {
    const upi = `upi://pay?pa=8008791893@axl&pn=Paintmaania&am=${amount}&cu=INR`;

    const qrData = await QRCode.toDataURL(upi);
    setQr(qrData);
  }

  async function uploadScreenshot(file) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: fd }
    );

    const data = await res.json();
    return data.secure_url;
  }

  const nextImage = () => {
    if (isTransitioning || !order?.product?.pictures) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => (prev + 1) % order.product.pictures.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevImage = () => {
    if (isTransitioning || !order?.product?.pictures) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => (prev - 1 + order.product.pictures.length) % order.product.pictures.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToImage = (index) => {
    if (isTransitioning || index === currentImageIndex) return;
    setIsTransitioning(true);
    setCurrentImageIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleUploadScreenshots = async (e) => {
    try {
      setUploading(true);

      const files = Array.from(e.target.files);
      const uploaded = [];

      for (const f of files) {
        const link = await uploadScreenshot(f);
        uploaded.push(link);
      }

      setPendingScreenshots(prev => [...prev, ...uploaded]);
      toast.success("Screenshots uploaded to Cloudinary. They will be saved to your order when you click Done.");

      setUploading(false);

    } catch (err) {
      console.log(err);
      toast.error("Upload error. Please try again.");
      setUploading(false);
    }
  };

  const handleDeleteUploadedScreenshot = async (imgUrl) => {
    try {
      setDeletingIndex(imgUrl);

      // Optimistic update: Remove from local state immediately
      const updatedScreenshots = order.transactionscreenshot.filter(u => u !== imgUrl);
      setOrder(prev => ({ ...prev, transactionscreenshot: updatedScreenshots }));

      const res = await fetch(Allapi.orders.uploadScreenshots.url(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ screenshots: updatedScreenshots }),
      });

      const data = await res.json();

      if (!data.success) {
        // Revert optimistic update on failure
        fetchOrder();
        toast.error("Delete failed. Please try again.");
      } else {
        toast.success("Screenshot deleted!");
        // Rely on optimistic update, no refetch to avoid flash
      }

      setDeletingIndex(null);

    } catch (err) {
      console.log(err);
      // Revert on error
      fetchOrder();
      toast.error("Delete error. Please try again.");
      setDeletingIndex(null);
    }
  };

  const handleDeletePendingScreenshot = (imgUrl) => {
    setPendingScreenshots(prev => prev.filter(u => u !== imgUrl));
    toast.success("Pending screenshot removed.");
  };

  const handleDone = async () => {
    try {
      let success = true;
      if (pendingScreenshots.length > 0) {
        const allScreenshots = [...(order.transactionscreenshot || []), ...pendingScreenshots];
        const res = await fetch(Allapi.orders.uploadScreenshots.url(id), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ screenshots: allScreenshots }),
        });

        const data = await res.json();
        if (!data.success) {
          toast.error("Failed to save pending screenshots.");
          success = false;
        } else {
          setPendingScreenshots([]);
        }
      }

      if (success) {
        toast.success("Order placed successfully!");
        navigate("/myorders");
      }
    } catch (err) {
      console.log(err);
      toast.error("Error completing order. Please try again.");
    }
  };

  if (!order) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-purple-50 pt-16">
      {/* Header with Back Button */}
        <Navbar />

      <div className="pb-8">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="w-full h-16 bg-white  flex items-center px-4 md:px-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-colors duration-300"
          >
            <span className="text-purple-600 text-xl font-bold">←</span>
          </button>
          <h1 className="ml-4 text-lg font-bold text-gray-800">Order Details</h1>
        </div>
          
          {/* Product Details Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            {/* Product Images */}
            {order.product.pictures && order.product.pictures.length > 0 && (
              <div className="relative">
                <div className="relative h-80 md:h-96 overflow-hidden bg-gray-50">
                  {order.product.pictures.map((pic, idx) => (
                    <img
                      key={idx}
                      src={pic}
                      alt={`${order.product.name} ${idx + 1}`}
                      className={`absolute top-0 left-0 w-full h-full object-contain transition-all duration-500 ${
                        idx === currentImageIndex 
                          ? 'opacity-100 translate-x-0' 
                          : idx < currentImageIndex
                          ? 'opacity-0 -translate-x-full'
                          : 'opacity-0 translate-x-full'
                      }`}
                    />
                  ))}
                </div>

                {order.product.pictures.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 text-2xl font-bold"
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 text-2xl font-bold"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {order.product.pictures.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => goToImage(idx)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            idx === currentImageIndex ? 'bg-purple-600 w-8' : 'bg-gray-400 w-2'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Product Info */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{order.product.name}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Price per item</p>
                  <p className="text-2xl font-bold text-purple-600">₹{order.product.price}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Quantity</p>
                  <p className="text-2xl font-bold text-purple-600">{order.product.quantity}</p>
                </div>
              </div>

              {order.product.size && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Selected Size</p>
                  <div className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold">
                    {order.product.size}
                  </div>
                </div>
              )}

              {order.product.uploadrequired && order.product.uploaded && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Your Uploaded Image:</p>
                  <img
                    src={order.product.uploaded}
                    className="w-full h-auto max-h-64 object-contain rounded-xl border-2 border-purple-200"
                    alt="Uploaded"
                  />
                </div>
              )}

              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-700">Total Amount</span>
                  <span className="text-3xl font-bold text-purple-600">₹{order.product.total_price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Details</h3>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 mb-4">
              <p className="text-gray-700 mb-2 text-center">
                For queries, contact:
              </p>
              <p className="text-center">
                <a href="tel:+918008791893" className="text-lg font-bold text-purple-600 hover:text-purple-800 transition-colors">
                  +91 8008791893
                </a>
              </p>
            </div>

            {qr && (
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-2xl shadow-lg">
                  <img src={qr} className="w-64 h-64" alt="Payment QR Code" />
                </div>
                <p className="text-gray-600 mt-4 font-semibold">Scan & Pay ₹{order.product.total_price}</p>
              </div>
            )}
          </div>

          {/* Transaction Screenshots Upload */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Upload Payment Screenshots</h3>
            
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors duration-300 mb-4">
              <div className="flex flex-col items-center justify-center">
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-purple-600 mb-2"></div>
                    <p className="text-purple-600 font-semibold">Uploading...</p>
                  </>
                ) : (
                  <>
                    <svg className="w-10 h-10 mb-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-purple-600 font-semibold">Click to upload screenshots</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG (Multiple files allowed)</p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={handleUploadScreenshots}
              />
            </label>

            {/* Uploaded Screenshots */}
            {order.transactionscreenshot && order.transactionscreenshot.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3 font-semibold">
                  Uploaded Screenshots ({order.transactionscreenshot.length})
                </p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {order.transactionscreenshot.map((img) => (
                    <div key={img} className="relative group">
                      <img
                        src={img}
                        className="w-full h-24 object-cover rounded-lg shadow-md border-2 border-purple-200 group-hover:border-purple-400 transition-all duration-300"
                        alt="Uploaded Screenshot"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg"></div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteUploadedScreenshot(img)}
                        disabled={deletingIndex === img}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50"
                      >
                        {deletingIndex === img ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                        ) : (
                          <span className="text-xs font-bold">✕</span>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Screenshots */}
            {pendingScreenshots.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-3 font-semibold">
                  Pending Screenshots ({pendingScreenshots.length}) - Will be saved on Done
                </p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {pendingScreenshots.map((img) => (
                    <div key={img} className="relative group">
                      <img
                        src={img}
                        className="w-full h-24 object-cover rounded-lg shadow-md border-2 border-yellow-200 group-hover:border-yellow-400 transition-all duration-300"
                        alt="Pending Screenshot"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg"></div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeletePendingScreenshot(img)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        <span className="text-xs font-bold">✕</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Done Button */}
          <button
            onClick={handleDone}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-2xl text-lg font-bold shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            ✓ Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default Order;