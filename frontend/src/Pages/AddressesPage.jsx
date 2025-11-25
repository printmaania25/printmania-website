import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../hooks/useUser";
import { useToast } from "../Providers/ToastProvider";
import Allapi from "../common";
import { ArrowLeft } from "lucide-react";

function AddressesPage() {
  const { token } = useUser();
  const toastMsg = useToast();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const initialForm = {
    name: "",
    mobile: "",
    doorNo: "",
    street: "",
    city: "",
    pincode: "",
    state: ""
  };
  const [form, setForm] = useState(initialForm);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await fetch(Allapi.address.myaddresses.url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAddresses(data.addresses);
    } catch (err) {
      console.error(err);
      toastMsg("error", "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSubmit = async () => {
    if (saving) return;
    // Validation
    if (!form.name || !form.mobile || !form.doorNo || !form.street || !form.city || !form.pincode || !form.state) {
      toastMsg("error", "Please fill all fields");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Update address
        const res = await fetch(Allapi.address.update.url(editingId), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(form)
        });

        const data = await res.json();

        if (data.success) {
          toastMsg("success", "Address updated");
          setEditingId(null);
          setForm(initialForm);
          setShowForm(false);
          fetchAddresses();
        } else {
          toastMsg("error", data.message);
        }
      } else {
        // Create address
        const res = await fetch(Allapi.address.create.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(form)
        });

        const data = await res.json();

        if (data.success) {
          toastMsg("success", "Address added");
          setForm(initialForm);
          setShowForm(false);
          fetchAddresses();
        } else {
          toastMsg("error", data.message);
        }
      }
    } catch (err) {
      toastMsg("error", "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const editAddress = (addr) => {
    setForm({
      name: addr.name,
      mobile: addr.mobile,
      doorNo: addr.doorNo,
      street: addr.street,
      city: addr.city,
      pincode: addr.pincode,
      state: addr.state
    });
    setEditingId(addr._id);
    setShowForm(true);
    // Scroll to top when edit is clicked
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowForm(false);
  };

  const deleteAddress = async (id) => {
    const res = await fetch(Allapi.address.delete.url(id), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (data.success) {
      toastMsg("success", "Address deleted");
      fetchAddresses();
    } else {
      toastMsg("error", data.message);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-blue-50 pt-16">
              <div className="w-full h-16 bg-white flex items-center px-4 md:px-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors duration-300"
        >
          
                         < ArrowLeft className="w-5 h-5 text-blue-700" />
        </button>
        <h1 className="ml-4 text-lg font-bold text-gray-800">Addresses</h1>
      </div>
      <div className="pb-8">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          
          {/* Add New Address Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full mb-6 py-4 bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white rounded-2xl text-lg font-bold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Address
            </button>
          )}

          {/* Add/Edit Address Form */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingId ? "Edit Address" : "Add New Address"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Door/Flat No.</label>
                    <input
                      type="text"
                      placeholder="House/Flat/Building No."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                      value={form.doorNo}
                      onChange={(e) => setForm({ ...form, doorNo: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Street/Area</label>
                    <input
                      type="text"
                      placeholder="Street/Road/Area"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                      value={form.street}
                      onChange={(e) => setForm({ ...form, street: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      placeholder="City"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
                    <input
                      type="text"
                      placeholder="6-digit Pincode"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    placeholder="State"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2 inline-block"></div>
                      Saving...
                    </>
                  ) : (
                    editingId ? "Update Address" : "Save Address"
                  )}
                </button>
                <button
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-colors"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Existing Addresses */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Saved Addresses ({addresses.length})</h2>
            
            {addresses.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-xl text-gray-600 mb-4">No addresses saved yet</p>
                <p className="text-gray-500 mb-6">Add an address to start shopping</p>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Add Address
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div key={addr._id} className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-lg text-gray-900">{addr.name}</p>
                            <p className="text-blue-600 font-semibold">{addr.mobile}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-4 mb-4">
                        <p className="text-gray-700 leading-relaxed">
                          {addr.doorNo}, {addr.street},<br />
                          {addr.city}, {addr.state}<br />
                          Pincode: <span className="font-semibold">{addr.pincode}</span>
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          className="flex-1 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                          onClick={() => editAddress(addr)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          className="flex-1 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                          onClick={() => deleteAddress(addr._id)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddressesPage;