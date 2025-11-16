import { useState, useEffect } from "react";
import useUser from "../hooks/useUser";
import Allapi from "../common";

function OrderManagement() {
  const { token } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [markingDelivered, setMarkingDelivered] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

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
      const res = await fetch(`${Allapi.orders.create.url.replace('/orders', '/orders/')}${orderId}/delivered`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, delivered: true } : order
          )
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, delivered: true });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingDelivered(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Order Management</h1>
      
      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr
                key={order._id}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{order.product.total_price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.delivered
                        ? "bg-green-100 text-green-800"
                        : order.cancelled
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.delivered ? "Delivered" : order.cancelled ? "Cancelled" : "Pending"}
                  </span>
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
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Order Details - {selectedOrder._id.slice(-8)}</h2>
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Product</h3>
              <p className="text-gray-600 mb-2">{selectedOrder.product.name}</p>
              <p className="text-gray-600 mb-2">Category: {selectedOrder.product.category || 'N/A'}</p>
              {selectedOrder.product.size && <p className="text-gray-600 mb-2">Size: {selectedOrder.product.size}</p>}
              <p className="text-gray-600 mb-2">Quantity: {selectedOrder.product.quantity}</p>
              <p className="text-lg font-bold text-green-600">Total: ₹{selectedOrder.product.total_price}</p>
            </div>

            {/* Product Images */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Product Images</h3>
              <div className="grid grid-cols-2 gap-2">
                {selectedOrder.product.pictures.slice(0, 4).map((img, idx) => (
                  <img key={idx} src={img} alt="Product" className="w-full h-32 object-cover rounded-lg" />
                ))}
                {selectedOrder.product.pictures.length > 4 && (
                  <p className="text-sm text-gray-500 col-span-2">+{selectedOrder.product.pictures.length - 4} more</p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Shipping Address</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600"><strong>{selectedOrder.address.name}</strong></p>
              <p className="text-gray-600">{selectedOrder.address.doorNo}, {selectedOrder.address.street}</p>
              <p className="text-gray-600">{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}</p>
              <p className="text-gray-600">Mobile: {selectedOrder.address.mobile}</p>
            </div>
          </div>

          {/* Transaction Screenshots */}
          {selectedOrder.transactionscreenshot && selectedOrder.transactionscreenshot.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Transaction Proof</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedOrder.transactionscreenshot.map((img, idx) => (
                  <img key={idx} src={img} alt="Transaction" className="w-full h-32 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          )}

          {/* User Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">User Info</h3>
            <p className="text-gray-600 mb-1"><strong>Name:</strong> {selectedOrder.username}</p>
            <p className="text-gray-600 mb-1"><strong>Email:</strong> {selectedOrder.useremail}</p>
            <p className="text-gray-600"><strong>User ID:</strong> {selectedOrder.userId}</p>
          </div>

          {/* Action Button */}
          {!selectedOrder.delivered && !selectedOrder.cancelled && (
            <button
              onClick={() => handleMarkDelivered(selectedOrder._id)}
              disabled={markingDelivered}
              className="w-full md:w-auto px-6 py-3 bg-green-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {markingDelivered ? "Marking..." : "Mark as Delivered"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderManagement;