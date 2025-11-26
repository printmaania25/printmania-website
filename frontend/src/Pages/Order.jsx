import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useUser from "../hooks/useUser";
import Allapi from "../common";
import toast from "react-hot-toast";
import Navbar from "../Components/Navbar";
import scanner from "../assets/scanner.jpg";
import { ArrowLeft } from "lucide-react";

function Order() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useUser();

  const [order, setOrder] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDoneLoading, setIsDoneLoading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [pendingScreenshots, setPendingScreenshots] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [codEnabled, setCodEnabled] = useState(false);
  const [description , setDescription] = useState("");

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    fetchOrder();
  }, []);

  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);


  async function fetchOrder() {
    const res = await fetch(Allapi.orders.getMyOrders.url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!data.success) return;

    const found = data.orders.find((o) => o._id === id);
    setOrder(found);
    setCodEnabled(found.cod || false); // Load existing COD status
    setDescription(found.description);
  }

  const handleCodToggle = (enabled) => {
    setCodEnabled(enabled);
  };

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
      toast.success("Screenshot uploaded , click Done.");

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

      const updatedScreenshots = order.transactionscreenshot.filter(u => u !== imgUrl);
      setOrder(prev => ({ ...prev, transactionscreenshot: updatedScreenshots }));
 
      const res = await fetch(Allapi.orders.uploadScreenshots.url(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ screenshots: updatedScreenshots, cod: codEnabled }),
      });

      const data = await res.json();

      if (!data.success) {
        fetchOrder();
        toast.error("Delete failed. Please try again.");
      } else {
        toast.success("Screenshot deleted!");
      }

      setDeletingIndex(null);

    } catch (err) {
      console.log(err);
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
      setIsDoneLoading(true);
      setIsPlacingOrder(true);
      let success = true;
      console.log("cod enabled:",codEnabled);
      if (pendingScreenshots.length > 0) {
        const allScreenshots = [...(order.transactionscreenshot || []), ...pendingScreenshots];
        const res = await fetch(Allapi.orders.uploadScreenshots.url(id), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ screenshots: allScreenshots, cod: codEnabled , description:description }),
        });

        const data = await res.json();
        if (!data.success) {
          toast.error("Failed to save pending screenshots.");
          success = false;
        } else {
          setPendingScreenshots([]);
        }
      } else if (codEnabled) {
        // If no screenshots but COD enabled, still update COD
        const res = await fetch(Allapi.orders.uploadScreenshots.url(id), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ screenshots: order.transactionscreenshot || [], cod: codEnabled , description:description }),
        });

        const data = await res.json();
        if (!data.success) {
          toast.error("Failed to update COD status.");
          success = false;
        }
      }

      if (success) {
        toast.success("Order placed successfully!");
        navigate("/myorders");
      }
    } catch (err) {
      console.log(err);
      toast.error("Error completing order. Please try again.");
    } finally {
      setIsDoneLoading(false);
      setIsPlacingOrder(false);
    }
  };

  if (!order) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  const totalAmount = order.product.total_price;
  const prepaidAmount = codEnabled ? totalAmount * 0.6 : totalAmount;
  const remainingAmount = codEnabled ? totalAmount * 0.4 : 0;

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-blue-50 pt-16">
      <Navbar />

      <div className="pb-8">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          <div className="w-full h-16 bg-white  flex items-center px-4 md:px-8">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors duration-300"
            >
             < ArrowLeft className="w-5 h-5 text-blue-700" />
            </button>
            <h1 className="ml-4 text-lg font-bold text-gray-800">Order Details</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
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
                            idx === currentImageIndex ? 'bg-blue-500 w-8' : 'bg-gray-400 w-2'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{order.product.name}</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Price per item</p>
                  <p className="text-2xl font-bold text-blue-600">₹{order.product.price}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Quantity</p>
                  <p className="text-2xl font-bold text-blue-600">{order.product.quantity}</p>
                </div>
              </div>

              {order.product.size && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Selected Size</p>
                  <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold">
                    {order.product.size}
                  </div>
                </div>
              )}


              <div className="">
                  <label className="block text-xs md:text-sm font-bold text-blue-900 mb-2">Description</label>
                  <textarea 
                    value={description} 
                    rows="3" 
                    onChange={(e)=> setDescription(e.target.value)}
                    placeholder="Add any specific details about this product..."
                    className="w-full px-4 md:px-5 py-3 md:py-3.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-600 bg-blue-50 font-medium transition-all placeholder-gray-500 resize-none text-sm md:text-base" 
                  />
              </div>


              {order.product.uploadrequired && order.product.uploaded && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Your Uploaded Image:</p>
                  <img
                    src={order.product.uploaded}
                    className="w-full h-auto max-h-64 object-contain rounded-xl border-2 border-blue-200"
                    alt="Uploaded"
                  />
                </div>
              )}

              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-700">Total Amount</span>
                  <span className="text-3xl font-bold text-blue-600">₹{totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COD Toggle Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Cash On Delivery</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={(e) => handleCodToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {codEnabled && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>Cash on Delivery Enabled:</strong> 60% of the payment (₹{prepaidAmount.toFixed(0)}) is required upfront via QR.
                </p>
                <p className="text-sm text-yellow-800">
                  Remaining amount to be paid to delivery boy: ₹{remainingAmount.toFixed(0)}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Details</h3>

            <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-xl p-4 mb-4">
              <p className="text-gray-700 mb-2 text-center">
                For queries, contact:
              </p>
              <p className="text-center">
                <a href="tel:+919063347447" className="text-lg font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  +91 9063347447
                </a>
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <img src={scanner} className="w-64 h-64" alt="Payment Scanner" />
              </div>
              <p className="text-gray-600 mt-4 font-semibold">
                Scan & Pay {codEnabled ? '₹' + prepaidAmount.toFixed(0) + ' (60% Prepaid)' : '₹' + totalAmount + ' (Full Amount)'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Upload Payment Screenshots</h3>

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors duration-300 mb-4">
              <div className="flex flex-col items-center justify-center">
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500 mb-2"></div>
                    <p className="text-blue-600 font-semibold">Uploading...</p>
                  </>
                ) : (
                  <>
                    <svg className="w-10 h-10 mb-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-blue-600 font-semibold">Click to upload screenshots</p>
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
                        className="w-full h-24 object-cover rounded-lg shadow-md border-2 border-blue-200 group-hover:border-blue-400 transition-all duration-300"
                        alt="Uploaded Screenshot"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg"></div>

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

          <button
            onClick={handleDone}
            disabled={isPlacingOrder}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 disabled:from-blue-400 disabled:to-orange-400 text-white rounded-2xl text-lg font-bold shadow-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPlacingOrder ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Placing Order...
              </>
            ) : (
              <>
                ✓ Done
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Order;