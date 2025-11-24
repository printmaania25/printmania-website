// src/admin/OfferManagement.jsx
import { useState, useEffect } from "react";
import Allapi from "../common";
import useUser from "../hooks/useUser";
import { useToast } from "../Providers/ToastProvider";

function OfferManagement() {
  const { token } = useUser();
  const toastMsg = useToast();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  
  // Loading states for buttons
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all offers
  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await fetch(Allapi.offers.getAll.url);
      const data = await res.json();
      if (data.success) {
      setOffers(data.offers);
      } else {
        toastMsg("error", data.message || "Failed to load offers");
      }
    } catch (err) {
      toastMsg("error", "Failed to load offers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Create new offer
  const handleCreate = async () => {
    if (!newText.trim()) {
      toastMsg("error", "Offer text is required");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(Allapi.offers.create.url, {
        method: Allapi.offers.create.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newText }),
      });

      const data = await res.json();
      if (data.success) {
        setOffers([data.offer, ...offers]);
        setNewText("");
        toastMsg("success", "Offer created successfully!");
      } else {
        toastMsg("error", data.message || "Failed to create offer");
      }
    } catch (err) {
      toastMsg("error", "Server error");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  // Update offer
  const handleUpdate = async (id) => {
    if (!editText.trim()) {
      toastMsg("error", "Offer text cannot be empty");
      return;
    }

    setSavingId(id);
    try {
      const res = await fetch(Allapi.offers.update.url(id), {
        method: Allapi.offers.update.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: editText }),
      });

      const data = await res.json();
      if (data.success) {
        setOffers(offers.map((o) => (o._id === id ? data.offer : o)));
        setEditingId(null);
        setEditText("");
        toastMsg("success", "Offer updated successfully!");
      } else {
        toastMsg("error", data.message || "Failed to update offer");
      }
    } catch (err) {
      toastMsg("error", "Server error");
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  // Delete offer
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(Allapi.offers.delete.url(id), {
        method: Allapi.offers.delete.method,
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setOffers(offers.filter((o) => o._id !== id));
        toastMsg("success", "Offer deleted successfully");
      } else {
        toastMsg("error", data.message || "Failed to delete offer");
      }
    } catch (err) {
      toastMsg("error", "Server error");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 via-orange-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent mb-2">
            Offer Management
          </h1>
          <p className="text-gray-600">Create and manage promotional offers</p>
        </div>

        {/* Create New Offer */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-blue-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Offer</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !creating && handleCreate()}
              placeholder="e.g. Flat 20% off on all orders above ₹999!"
              disabled={creating}
              className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-800 disabled:bg-gray-50"
            />
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                "Create Offer"
              )}
            </button>
          </div>
        </div>

        {/* Offers List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Current Offers</h2>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-blue-100">
              <p className="text-xl text-gray-500">No offers yet. Create your first one!</p>
            </div>
          ) : (
            offers.map((offer) => (
              <div
                key={offer._id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-blue-100"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    {editingId === offer._id ? (
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && savingId !== offer._id && handleUpdate(offer._id)}
                        className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:outline-none text-gray-800 font-medium"
                        autoFocus
                      />
                    ) : (
                      <p className="text-lg md:text-xl font-medium text-gray-800 break-words">
                        {offer.text}
                      </p>
                    )}

                    <p className="text-sm text-gray-500 mt-2">
                      Created on: {new Date(offer.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    {editingId === offer._id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(offer._id)}
                          disabled={savingId === offer._id}
                          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {savingId === offer._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Saving...
                            </>
                          ) : (
                            "Save"
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditText("");
                          }}
                          className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(offer._id);
                            setEditText(offer.text);
                          }}
                          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white rounded-lg font-semibold transition-colors shadow-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(offer._id)}
                          disabled={deletingId === offer._id}
                          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {deletingId === offer._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Deleting...
                            </>
                          ) : (
                            "Delete"
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default OfferManagement;