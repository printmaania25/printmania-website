import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../hooks/useUser";
import Allapi from "../common";
import toast from "react-hot-toast";
import {
  X, Mail, User, Phone, Calendar, Package, CheckCircle, AlertCircle, Truck,
  Shirt, Flag, IdCard, Award, Sticker, Frame, Coffee, Ban ,FileText
} from "lucide-react";
import { ArrowLeft } from "lucide-react";

function MyOrders() {
  const { token } = useUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [bulkQuotes, setBulkQuotes] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchBulkQuotes();
  }, [activeTab]);

  useEffect(() => {
    if (selectedOrder) {
      setCurrentImageIndex(0);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 0);
    }
  }, [selectedOrder]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch(Allapi.orders.getMyOrders.url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders || []);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function fetchBulkQuotes() {
    try {
      setLoading(true);
      const res = await fetch(Allapi.quotes.getBulkByUser.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) setBulkQuotes(data.quotes || []);
    } catch (err) {
      toast.error("Failed to load bulk quotes");
    } finally {
      setLoading(false);
    }
  }

  const askCancel = (id) => {
    setCancelOrderId(id);
    setShowCancelPopup(true);
  };

  const confirmCancel = async () => {
    setIsCanceling(true);
    try {
      const endpoint = activeTab === "orders"
        ? Allapi.orders.cancel.url(cancelOrderId)
        : Allapi.quotes.cancelBulk.url(cancelOrderId);

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Cancelled successfully");
        if (activeTab === "orders") {
          fetchOrders();
        } else {
          fetchBulkQuotes();
          // Update selectedOrder immediately so Cancel button disappears
          if (selectedOrder && selectedOrder._id === cancelOrderId) {
            setSelectedOrder(prev => ({ ...prev, cancelled: true }));
          }
        }
        setSelectedOrder(null);
      } else {
        toast.error(data.message || "Failed to cancel");
      }
    } catch (err) {
      toast.error("Failed to cancel");
    } finally {
      setIsCanceling(false);
      setShowCancelPopup(false);
      setCancelOrderId(null);
    }
  };

  const nextImage = () => {
    if (isTransitioning || !selectedOrder?.product?.pictures) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => (prev + 1) % selectedOrder.product.pictures.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevImage = () => {
    if (isTransitioning || !selectedOrder?.product?.pictures) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => (prev - 1 + selectedOrder.product.pictures.length) % selectedOrder.product.pictures.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToImage = (index) => {
    if (isTransitioning || index === currentImageIndex) return;
    setIsTransitioning(true);
    setCurrentImageIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Product Icons (same as admin)
  const productConfig = {
    Tshirts: { icon: Shirt, label: "T-Shirts" },
    Banners: { icon: Flag, label: "Banners" },
    IdCards: { icon: IdCard, label: "ID Cards" },
    Certificates: { icon: Award, label: "Certificates" },
    Stickers: { icon: Sticker, label: "Posters" },
    Photoframes: { icon: Frame, label: "Photo Frames" },
    Mugs: { icon: Coffee, label: "Mugs" },
    Others: { icon: FileText, label: "Others" },
  };

  const getActiveRequirements = (requirements) => {
    if (!requirements) return [];
    return Object.entries(requirements)
      .filter(([_, data]) => data && (
        data.quantity > 0 || data.description || data.image // allow Others
      ))
      .map(([key, data]) => ({
        name: key,
        ...data,
        config: productConfig[key] || { icon: Package, label: key }
      }));

  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  // DETAIL VIEW
  if (selectedOrder) {
    const isBulk = !!selectedOrder.requirements;
    const hasTransactionScreenshots = selectedOrder.transactionscreenshot && selectedOrder.transactionscreenshot.length > 0;
    const isPending = !selectedOrder.delivered && !selectedOrder.cancelled && (!isBulk || !selectedOrder.confirm);

    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-white to-blue-50 pt-16">
        <div className="w-full h-16 bg-white flex items-center px-4 md:px-8 shadow-sm">
          <button
            onClick={() => setSelectedOrder(null)}
            className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors duration-300"
          >
          < ArrowLeft className="w-5 h-5 text-blue-700" />

          </button>
          <h1 className="ml-4 text-lg font-bold text-gray-800">
            {isBulk ? "Bulk Quote Details" : "Order Details"}
          </h1>
        </div>

        <div className="pb-8">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">

            {/* Status Badge */}
            <div className="mb-6">
              {selectedOrder.delivered ? (
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">Delivered</div>
              ) : selectedOrder.cancelled ? (
                <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-full font-semibold">Cancelled</div>
              ) : selectedOrder.confirm ? (
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold">Confirmed</div>
              ) : (
                <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-semibold">Pending Confirmation</div>
              )}
            </div>

          {selectedOrder.cancelled && (
            <div className="mt-4 mb-4  bg-red-100 border-l-4 border-red-500 rounded-xl p-4">
                      <p className="text-red-700 font-semibold text-sm">
                        ❌ Order Cancelled — For refund assistance contact: <span className="font-bold">+91 90633 47447</span>
                      </p>
              </div>
            )}

            {selectedOrder.trackingId && (
              <div className="mb-6 bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-sm font-medium text-blue-600">Tracking ID</p>
                <p className="text-xl font-bold text-blue-800">{selectedOrder.trackingId}</p>

                {/* Added message here */}
                <p className="text-sm mt-2 text-gray-600 font-medium">
                  Go to delivery.com website and search for this tracking ID
                </p>
              </div>
            )}


            {/* BULK QUOTE - NEW BEAUTIFUL DESIGN */}
            {isBulk && (
              <div className="space-y-8">
                {/* Customer Info */}
                <div className="flex items-center gap-4 bg-white rounded-2xl p-6 shadow-md">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedOrder.name}</h3>
                    <p className="text-blue-600 font-medium">{selectedOrder.company || 'Individual'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="font-semibold">{selectedOrder.email}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Mobile</p>
                      <p className="font-semibold">{selectedOrder.mobile}</p>
                    </div>
                  </div>
                </div>

                {/* Requested Items - Grid with Icons */}
                <div className="bg-gradient-to-br from-blue-50 to-orange-50 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-6 h-6 text-blue-600" /> Requested Items
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getActiveRequirements(selectedOrder.requirements).map((item) => {
                      const Icon = item.config.icon;
                      return (
                        <div key={item.name} className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                          <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{item.config.label}</h4>
                            {item.quantity ? (
                                <p className="text-sm text-blue-700">Quantity: {item.quantity}</p>
                              ) : (
                                <p className="text-sm text-blue-700 italic">Custom requirement</p>
                              )}

                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            {(item.type || item.size) && (
                              <p className="text-sm text-gray-900">
                                <span className="font-bold">Size/Type:</span> {item.type || item.size}
                              </p>
                            )}

                              {item.description && item.description.length > 0 && (
                                <p className="text-sm text-gray-900">
                                  <span className="font-bold">Description:</span> {item.description}
                                </p>
                              )}


                            {item.image ? (
                              <div>
                                <p className="text-xs font-bold text-gray-900 mb-2">Uploaded Design:</p>
                                <img src={item.image} alt="design" className="w-full h-48 object-contain rounded-lg border border-blue-200 bg-gray-50" />
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 italic">No design uploaded</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedOrder.description && (
                  <div className="bg-blue-50 p-5 rounded-xl">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Additional Notes</p>
                        <p className="text-gray-800 whitespace-pre-wrap">{selectedOrder.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Submitted: {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>

                {/* Cancel Button - Only if not cancelled or delivered */}
                {isPending && !selectedOrder.cancelled && !selectedOrder.delivered && (
                  <button
                    onClick={() => askCancel(selectedOrder._id)}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-orange-600 hover:from-blue-600 hover:to-orange-700 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Ban className="w-6 h-6" /> Cancel Quote
                  </button>
                )}
              </div>
            )}

            {/* Regular Order - Your Old Code (Unchanged) */}
            {!isBulk && (
              <>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                  {selectedOrder.product.pictures && selectedOrder.product.pictures.length > 0 && (
                    <div className="relative">
                      <div className="relative h-80 md:h-96 overflow-hidden bg-gray-50">
                        {selectedOrder.product.pictures.map((pic, idx) => (
                          <img
                            key={idx}
                            src={pic}
                         
                            alt={`${selectedOrder.product.name} ${idx + 1}`}
                            className={`absolute top-0 left-0 w-full h-full object-contain transition-all duration-500 ${
                              idx === currentImageIndex ? 'opacity-100 translate-x-0' : idx < currentImageIndex ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'
                            }`}
                          />
                        ))}
                      </div>

                      {selectedOrder.product.pictures.length > 1 && (
                        <>
                          <button onClick={prevImage} className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 text-2xl font-bold">‹</button>
                          <button onClick={nextImage} className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 text-2xl font-bold">›</button>
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {selectedOrder.product.pictures.map((_, idx) => (
                              <button key={idx} onClick={() => goToImage(idx)} className={`h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-blue-500 w-8' : 'bg-gray-400 w-2'}`} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedOrder.product.name}</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Price per item</p>
                        <p className="text-2xl font-bold text-blue-600">₹{selectedOrder.product.price}</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Quantity</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedOrder.product.quantity}</p>
                      </div>
                    </div>

                    {selectedOrder.product.size && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Selected Size</p>
                        <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold">
                          {selectedOrder.product.size}
                        </div>
                      </div>
                    )}

                    {selectedOrder.product.uploadrequired && selectedOrder.product.uploaded && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2 font-semibold">Your Uploaded Image:</p>
                        <img src={selectedOrder.product.uploaded} className="w-full h-auto max-h-64 object-contain rounded-xl border-2 border-blue-200" alt="Uploaded" />
                      </div>
                    )}
                    { selectedOrder.description && selectedOrder.description.length > 0 && (
                      <div className="">
                      <label className="block text-xs md:text-sm font-bold text-blue-900 mb-2">Description</label>
                      <textarea 
                        value={selectedOrder.description} 
                        rows="4" 
                        disabled
                        placeholder="Add any specific details about this product..."
                        className="w-full px-4 md:px-5 py-3 md:py-3.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-600 bg-blue-50 font-medium transition-all placeholder-gray-500 resize-none text-sm md:text-base" 
                      />
                     </div>
                    )}


                    <div className="mt-6 pt-6 border-t-2 border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-700">Total Amount</span>
                        <span className="text-3xl font-bold text-blue-600">₹{selectedOrder.product.total_price}</span>
                      </div>
                    </div>

                        <button
                          onClick={(e) => {navigate(`/product/${selectedOrder.productRef}`)}}
                          className="w-full mt-2  py-3 bg-gradient-to-r from-blue-500 to-orange-600 hover:from-blue-600 hover:to-orange-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all duration-300"
                        >
                          Click to see the Product
                        </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Delivery Address</h3>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="font-semibold text-gray-800">{selectedOrder.address.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.address.mobile}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedOrder.address.doorNo}, {selectedOrder.address.street}, {selectedOrder.address.city} - {selectedOrder.address.pincode}
                    </p>
                    <p className="text-sm text-gray-600">{selectedOrder.address.state}</p>
                  </div>
                </div>

                {hasTransactionScreenshots && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Transaction Screenshots</h3>
                    {/* COD section */}
                    {selectedOrder.cod && !selectedOrder.delivered && (
                      <div className="mt-4 mb-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-xl p-4">
                        <p className="text-yellow-800 font-semibold text-sm">
                          💵 Cash on Delivery — 60% Paid Online, Remaining 40% will be collected at delivery.
                        </p>
                      </div>
                    )}
                    {selectedOrder.cod && selectedOrder.delivered && (
                      <div className="mt-4 mb-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-xl p-4">
                        <p className="text-yellow-800 font-semibold text-sm">
                          💵 Cash on Delivery 
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedOrder.transactionscreenshot.map((img, idx) => (
                        <img key={idx} src={img} className="w-full h-24 object-cover rounded-lg shadow-md border-2 border-blue-200" alt={`Screenshot ${idx + 1}`} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // MAIN LIST VIEW
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-blue-50 pt-16">
      <div className="w-full h-16 bg-white flex items-center px-4 md:px-8 shadow-sm">
        <button onClick={() => navigate("/")} className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors duration-300">
         
                         < ArrowLeft className="w-5 h-5 text-blue-700" />
        </button>
        <h1 className="ml-4 text-lg font-bold text-gray-800">My Requests</h1>
      </div>

      <div className="bg-white border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-3 text-center font-semibold transition-colors ${activeTab === "orders" ? "text-blue-600 border-b-4 border-blue-600" : "text-gray-500"}`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`flex-1 py-3 text-center font-semibold transition-colors ${activeTab === "bulk" ? "text-blue-600 border-b-4 border-blue-600" : "text-gray-500"}`}
          >
            Bulk Quotes ({bulkQuotes.length})
          </button>
        </div>
      </div>

      <div className="pb-8">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          {(activeTab === "orders" ? orders : bulkQuotes).length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-xl text-gray-600 mb-4">No {activeTab === "orders" ? "orders" : "bulk quotes"} found</p>
              <button onClick={() => navigate("/bulkorders")} className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors">
                Place Bulk Order
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {(activeTab === "orders" ? orders : bulkQuotes).map((item) => {
                const isBulk = !!item.requirements;
                const isPending = !item.delivered && !item.cancelled && (!isBulk || !item.confirm);

                return (
                  <div key={item._id} className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                    <div
                      onClick={() => {
                        setSelectedOrder(item);
                        setCurrentImageIndex(0);
                      }}
                      className="flex items-center gap-4 p-4 cursor-pointer"
                    >
                      {isBulk ? (
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center text-white">
                          <Package className="w-12 h-12" />
                        </div>
                      ) : (
                        <img src={item.product.pictures[0]} className="w-24 h-24 object-contain border-2 border-gray-200 rounded-xl flex-shrink-0" alt={item.product.name} />
                      )}
                      <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-lg text-gray-900 truncate">
                          {isBulk ? `${item.name} (${item.company || 'Individual'})` : item.product.name}
                        </h2>
                        <p className="text-gray-500 text-sm">
                          {isBulk
                            ? `${getActiveRequirements(item.requirements).length} item(s) requested`
                            : `Quantity: ${item.product.quantity} • ₹${item.product.total_price}`}
                        </p>
                        {item.trackingId && <p className="text-sm text-blue-600 font-medium mt-1">Track: {item.trackingId}</p>}
                        <div className="mt-2">
                          {item.delivered ? (
                            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Delivered</span>
                          ) : item.cancelled ? (
                            <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Cancelled</span>
                          ) : item.confirm ? (
                            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Confirmed</span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Pending</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Cancel Button - Only for pending items */}
                    {isPending && (
                      <div className="px-4 pb-4">
                        {item.transactionscreenshot.length == 0 && (
                          <button
                          onClick={(e) => { navigate(`/order/${item._id}`)
                          }}
                          className="w-full py-3 mb-2 bg-gradient-to-r from-blue-500 to-orange-600 hover:from-blue-600 hover:to-orange-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all duration-300"
                        >
                          Upload Transaction Details
                        </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            askCancel(item._id);
                          }}
                          className="w-full py-3 bg-gradient-to-r from-blue-500 to-orange-600 hover:from-blue-600 hover:to-orange-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all duration-300"
                        >
                          Cancel Request
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Popup */}
      {showCancelPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Cancel Request?</h2>
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-gray-700 mb-2">For refund or queries, contact:</p>
              <a href="tel:+918008791893" className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors">
                +91 9063347447
              </a>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowCancelPopup(false)} className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-colors">
                No, Keep
              </button>
              <button onClick={confirmCancel} disabled={isCanceling} className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center">
                {isCanceling ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Canceling...
                  </>
                ) : (
                  "Yes, Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrders;