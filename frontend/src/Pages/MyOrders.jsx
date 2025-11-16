import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../hooks/useUser";
import Allapi from "../common";
import toast from "react-hot-toast";


function MyOrders() {
  const { token } = useUser();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch(Allapi.orders.getMyOrders.url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  const askCancel = (id) => {
    setCancelOrderId(id);
    setShowCancelPopup(true);
  };

  const confirmCancel = async () => {
    try {
      const res = await fetch(Allapi.orders.cancel.url(cancelOrderId), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Order cancelled");
        fetchOrders();
        setSelectedOrder(null);
      } else {
        toast.error("Failed to cancel order");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel order");
    }

    setShowCancelPopup(false);
    setCancelOrderId(null);
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

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  // Order Detail View
  if (selectedOrder) {
    const hasTransactionScreenshots = selectedOrder.transactionscreenshot && selectedOrder.transactionscreenshot.length > 0;
    const canCancel = !selectedOrder.delivered && !selectedOrder.cancelled;

    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-white to-purple-50 pt-16">
        {/* Header with Back Button */}
        <div className="w-full h-16 bg-white flex items-center px-4 md:px-8">
          <button
            onClick={() => setSelectedOrder(null)}
            className="w-10 h-10 rounded-full bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-colors duration-300"
          >
            <span className="text-purple-600 text-xl font-bold">←</span>
          </button>
          <h1 className="ml-4 text-lg font-bold text-gray-800">Order Details</h1>
        </div>

        <div className="pb-8">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
            
            {/* Order Status Badge */}
            <div className="mb-6">
              {selectedOrder.delivered ? (
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Delivered
                </div>
              ) : selectedOrder.cancelled ? (
                <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-full font-semibold">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Cancelled
                </div>
              ) : (
                <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-semibold">
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Yet to be Delivered
                </div>
              )}
            </div>

            {/* Product Details Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              {/* Product Images */}
              {selectedOrder.product.pictures && selectedOrder.product.pictures.length > 0 && (
                <div className="relative">
                  <div className="relative h-80 md:h-96 overflow-hidden bg-gray-50">
                    {selectedOrder.product.pictures.map((pic, idx) => (
                      <img
                        key={idx}
                        src={pic}
                        alt={`${selectedOrder.product.name} ${idx + 1}`}
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

                  {selectedOrder.product.pictures.length > 1 && (
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
                        {selectedOrder.product.pictures.map((_, idx) => (
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedOrder.product.name}</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Price per item</p>
                    <p className="text-2xl font-bold text-purple-600">₹{selectedOrder.product.price}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Quantity</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedOrder.product.quantity}</p>
                  </div>
                </div>

                {selectedOrder.product.size && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Selected Size</p>
                    <div className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold">
                      {selectedOrder.product.size}
                    </div>
                  </div>
                )}

                {selectedOrder.product.uploadrequired && selectedOrder.product.uploaded && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2 font-semibold">Your Uploaded Image:</p>
                    <img
                      src={selectedOrder.product.uploaded}
                      className="w-full h-auto max-h-64 object-contain rounded-xl border-2 border-purple-200"
                      alt="Uploaded"
                    />
                  </div>
                )}

                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">Total Amount</span>
                    <span className="text-3xl font-bold text-purple-600">₹{selectedOrder.product.total_price}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Delivery Address</h3>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="font-semibold text-gray-800">{selectedOrder.address.name}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedOrder.address.mobile}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedOrder.address.doorNo}, {selectedOrder.address.street}, {selectedOrder.address.city} - {selectedOrder.address.pincode}
                </p>
                <p className="text-sm text-gray-600">{selectedOrder.address.state}</p>
              </div>
            </div>

            {/* Transaction Screenshots */}
            {hasTransactionScreenshots && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Transaction Screenshots</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {selectedOrder.transactionscreenshot.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      className="w-full h-24 object-cover rounded-lg shadow-md border-2 border-purple-200"
                      alt={`Transaction Screenshot ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {canCancel && (
              <div className="flex gap-4">
                {!hasTransactionScreenshots && (
                  <button
                    onClick={() => navigate(`/order/${selectedOrder._id}`)}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-2xl text-lg font-bold shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Upload Transaction
                  </button>
                )}
                <button
                  onClick={() => askCancel(selectedOrder._id)}
                  className="flex-1 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-2xl text-lg font-bold shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Orders List View
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-purple-50 pt-16">
      {/* Header with Back Button */}
      <div className="w-full h-16 bg-white flex items-center px-4 md:px-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-colors duration-300"
        >
          <span className="text-purple-600 text-xl font-bold">←</span>
        </button>
        <h1 className="ml-4 text-lg font-bold text-gray-800">My Orders</h1>
      </div>

      <div className="pb-8">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-xl text-gray-600 mb-4">No orders found</p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const hasTransactionScreenshots = order.transactionscreenshot && order.transactionscreenshot.length > 0;
                const canUpload = !hasTransactionScreenshots && !order.delivered && !order.cancelled;
                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                  >
                    <div 
                      onClick={() => {
                        if (!canUpload) {
                          setSelectedOrder(order);
                          setCurrentImageIndex(0);
                        }
                      }}
                      className={`flex items-center gap-4 p-4 cursor-pointer ${canUpload ? 'pr-0' : ''}`}
                    >
                      <img
                        src={order.product.pictures[0]}
                        className="w-24 h-24 object-contain border-2 border-gray-200 rounded-xl flex-shrink-0"
                        alt={order.product.name}
                      />
                      <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-lg text-gray-900 truncate">{order.product.name}</h2>
                        <p className="text-purple-600 font-semibold text-xl mt-1">₹{order.product.total_price}</p>
                        <p className="text-gray-500 text-sm">Quantity: {order.product.quantity}</p>
                        {order.product.size && (
                          <p className="text-gray-500 text-sm">Size: {order.product.size}</p>
                        )}
                        
                        {/* Status Badge */}
                        <div className="mt-2">
                          {order.delivered ? (
                            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              ✓ Delivered
                            </span>
                          ) : order.cancelled ? (
                            <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                              ✕ Cancelled
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                              ⟳ Yet to be Delivered
                            </span>
                          )}
                        </div>
                      </div>
                      {!canUpload && (
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {canUpload && (
                      <div className="px-4 pb-4">
                        <button
                          onClick={() => navigate(`/order/${order._id}`)}
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg transition-all duration-300"
                        >
                          Upload Transaction
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

      {/* Cancel Confirmation Popup */}
      {showCancelPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Cancel Order?</h2>

            <div className="bg-purple-50 rounded-xl p-4 mb-6">
              <p className="text-gray-700 mb-2">
                For refund or queries, contact:
              </p>
              <a href="tel:+918008791893" className="text-xl font-bold text-purple-600 hover:text-purple-800 transition-colors">
                +91 8008791893
              </a>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelPopup(false)}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-colors"
              >
                No, Keep Order
              </button>

              <button
                onClick={confirmCancel}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrders;