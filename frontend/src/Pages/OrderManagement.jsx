// OrderManagement.jsx
import { useState, useEffect, useRef } from "react";
import useUser from "../hooks/useUser";
import Allapi from "../common";
import { Package, Truck, X, Download } from "lucide-react";

function OrderManagement() {
  const { token } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [markingDelivered, setMarkingDelivered] = useState(false);

  // Tracking ID Modal State
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [assigningTracking, setAssigningTracking] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  const detailsRef = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder && detailsRef.current) {
      setTimeout(() => {
        detailsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [selectedOrder]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch(Allapi.orders.getAll.url, {
        method: Allapi.orders.getAll.method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkDelivered(orderId) {
    try {
      setMarkingDelivered(true);
      const res = await fetch(
        `${Allapi.orders.create.url}/${orderId}/delivered`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, delivered: true } : order
          )
        );
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, delivered: true });
        }
      }
    } catch (err) {
      console.error(err);
      console.log("err.msg", err.message);
    } finally {
      setMarkingDelivered(false);
    }
  }

  const downloadImage = (url, filename) => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllImages = (images) => {
    if (!images || images.length === 0) return;
    images.forEach((url, index) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = url;
        a.download = `product-image-${index + 1}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 500);
    });
  };

  async function handleAssignTracking() {
    if (!trackingId.trim()) {
      setTrackingError("Please enter a tracking ID");
      return;
    }

    try {
      setAssigningTracking(true);
      setTrackingError("");

      const res = await fetch(
        Allapi.orders.assignTracking.url(selectedOrder._id),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ trackingId: trackingId.trim() }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === selectedOrder._id
              ? { ...order, trackingId: trackingId.trim() }
              : order
          )
        );
        setSelectedOrder({ ...selectedOrder, trackingId: trackingId.trim() });
        setShowTrackingModal(false);
        setTrackingId("");
      } else {
        setTrackingError(data.message || "Failed to assign tracking ID");
      }
    } catch (err) {
      setTrackingError("Network error. Try again.");
      console.error(err);
    } finally {
      setAssigningTracking(false);
    }
  }

  console.log("selected order: ", selectedOrder);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Order Management</h1>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-50 to-orange-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Tracking
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr
                key={order._id}
                className={`cursor-pointer transition-colors ${
                  order.cancelled
                    ? "bg-red-50 hover:bg-red-100"
                    : "hover:bg-blue-50"
                }`}
                onClick={() =>
                  setSelectedOrder(
                    selectedOrder?._id === order._id ? null : order
                  )
                }
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order._id.slice(-8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                  ₹{order.product.total_price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.delivered
                        ? "bg-green-100 text-green-800"
                        : order.cancelled
                        ? "bg-red-100 text-red-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {order.delivered
                      ? "Delivered"
                      : order.cancelled
                      ? "Cancelled"
                      : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">
                  {order.trackingId ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-mono">
                      <Truck className="w-3 h-3" />
                      {order.trackingId}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Order Details */}
      {selectedOrder && (
        <div
          ref={detailsRef}
          className="mt-8 bg-white rounded-xl shadow-md p-6 border border-blue-200"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent">
              Order Details - {selectedOrder._id.slice(-8)}
            </h2>
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Product Info + Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Product
              </h3>
              <p className="text-gray-600 mb-2">{selectedOrder.product.name}</p>
              {selectedOrder.product.size && (
                <p className="text-gray-600 mb-2">
                  Size: {selectedOrder.product.size}
                </p>
              )}
              <p className="text-gray-600 mb-2">
                Quantity: {selectedOrder.product.quantity}
              </p>
              <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                Total: ₹{selectedOrder.product.total_price}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Product Images
              </h3>
              <div className="relative h-64 overflow-hidden bg-gray-100 rounded-lg border border-gray-200">
                <div
                  className={`flex h-full ${
                    selectedOrder.product.pictures?.length > 1
                      ? "overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                      : ""
                  }`}
                >
                  {selectedOrder.product.pictures?.length > 0 ? (
                    selectedOrder.product.pictures.map((img, idx) => (
                      <div
                        key={idx}
                        className={`flex-shrink-0 w-full h-full snap-center ${
                          selectedOrder.product.pictures.length > 1
                            ? "px-2"
                            : ""
                        }`}
                      >
                        <img
                          src={img}
                          alt="Product"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {selectedOrder.product.uploaded && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Uploaded Image
                </h3>
                <button
                  onClick={() =>
                    downloadImage(
                      selectedOrder.product.uploaded,
                      `order-${selectedOrder._id}-uploaded.jpg`
                    )
                  }
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-orange-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
              <div className="relative h-64 overflow-hidden bg-gray-100 rounded-lg border border-gray-200">
                <img
                  src={selectedOrder.product.uploaded}
                  alt="Uploaded"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Address */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Shipping Address
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-orange-50 p-4 rounded-lg border border-blue-200">
              <p className="text-gray-600">
                <strong>{selectedOrder.address.name}</strong>
              </p>
              <p className="text-gray-600">
                {selectedOrder.address.doorNo}, {selectedOrder.address.street}
              </p>
              <p className="text-gray-600">
                {selectedOrder.address.city}, {selectedOrder.address.state} -{" "}
                {selectedOrder.address.pincode}
              </p>
              <p className="text-gray-600">
                Mobile: {selectedOrder.address.mobile}
              </p>
            </div>
          </div>

          {/* Transaction Screenshots */}
          <div className="mb-6">
            {/* COD Notice */}
            {selectedOrder.cod === true && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-semibold text-sm">
                  Cash On Delivery
                </p>

                <div className="mt-2">
                  <p className="text-sm text-blue-700 font-medium">
                    60% Transaction Proof
                  </p>

                  {/* Progress Bar Look */}
                  <div className="w-full bg-blue-200 h-2 rounded-full mt-1">
                    <div
                      className="h-2 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Proof Section */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Transaction Proof
            </h3>

            {selectedOrder.transactionscreenshot?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedOrder.transactionscreenshot.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="Proof"
                    className="rounded-lg border border-gray-200 shadow-sm object-cover h-48 w-full"
                  />
                ))}
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-600 font-medium">
                  No Transaction Proof
                </p>
              </div>
            )}
          </div>

          {/* Tracking ID Display */}
          {selectedOrder.trackingId && (
            <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-orange-50 border border-blue-200 rounded-lg flex items-center gap-3">
              <Package className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-900">Tracking ID</p>
                <p className="font-mono text-lg text-blue-800">
                  {selectedOrder.trackingId}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!selectedOrder.delivered && !selectedOrder.cancelled && (
              <>
                <button
                  onClick={() => handleMarkDelivered(selectedOrder._id)}
                  disabled={markingDelivered}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  {markingDelivered ? "Marking..." : "Mark as Delivered"}
                </button>

                <button
                  onClick={() => {
                    setTrackingId(selectedOrder.trackingId || "");
                    setShowTrackingModal(true);
                    setTrackingError("");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Truck className="w-5 h-5" />
                  {selectedOrder.trackingId
                    ? "Update Tracking ID"
                    : "Assign Tracking ID"}
                </button>
              </>
            )}

            {selectedOrder.delivered && (
              <div className="flex items-center gap-2 text-green-600 font-bold">
                <Package className="w-6 h-6" />
                <span>Delivered</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tracking ID Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent">
                Assign Tracking ID
              </h3>
              <button
                onClick={() => {
                  setShowTrackingModal(false);
                  setTrackingId("");
                  setTrackingError("");
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking ID
              </label>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="e.g. 1234567890"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                autoFocus
              />
              {trackingError && (
                <p className="text-red-500 text-sm mt-2">{trackingError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAssignTracking}
                disabled={assigningTracking}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {assigningTracking ? "Assigning..." : "Assign Tracking ID"}
              </button>
              <button
                onClick={() => setShowTrackingModal(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default OrderManagement;