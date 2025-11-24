// ProductManagement.jsx
import { useEffect, useState, useRef } from "react";
import { useToast } from "../Providers/ToastProvider";
import Allapi from "../common";

function ProductManagement() {
  const token = localStorage.getItem("token");
  const toastMsg = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8; // 4x2 grid

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  // Updated Allowed Phrases (must match backend exactly)
  const ALLOWED_PHRASES = [
    "Best selling",
    "Popular Gifts",
    "Below 500 Rs",
    "New Arrival",
    "Signature Day Special",
    "Event Special",
    "What's Trending",
    "Corporate Gifting"
  ];

  // Updated Categories (must match backend enum exactly)
  const CATEGORIES = [
    "Mugs",
    "Photo frames",
    "Polaroid Photos",
    "Key chains",
    "Banners",
    "T shirts",
    "Hoodies",
    "Sweat shirts",
    "Full hand t shirts",
    "Posters",
    "ID cards",
    "Signature Day t shirts",
    "Puzzles Boards",
    "Stickkers",
    "Dairies",
    "Bags",
    "Pens",
    "Ceritificates",
    "Other Gift articles"
  ];

  // form state
  const initialForm = {
    name: "",
    sizes: [],
    category: "Mugs", // valid default
    mrp: "",
    price: "",
    uploadrequired: false,
    pictures: [],
    phrases: [],
  };
  const [form, setForm] = useState(initialForm);
  const [newSize, setNewSize] = useState("");
  const fileInputRef = useRef(null);
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch(Allapi.products.getAll.url, {
        method: Allapi.products.getAll.method,
      });
      const data = await res.json();
      if (data.success) setProducts(data.products || []);
      else {
        toastMsg("error", data.message || "Failed to load products");
      }
    } catch (err) {
      console.error(err);
      toastMsg("error", "Error fetching products");
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setViewingProduct(null);
    setIsEditing(true);
    setForm(initialForm);
    setShowModal(true);
  }

  function openViewModal(prod) {
    setViewingProduct(prod);
    setIsEditing(false);
    setForm({
      name: prod.name || "",
      sizes: prod.sizes || [],
      category: prod.category || "T shirts",
      mrp: prod.mrp || "",
      price: prod.price || "",
      uploadrequired: prod.uploadrequired || false,
      pictures: prod.pictures ? [...prod.pictures] : [],
      phrases: prod.phrases || [],
    });
    setShowModal(true);
  }

  function enableEdit() {
    setIsEditing(true);
  }

  async function handleUploadFiles(files) {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toastMsg("error", "Cloudinary config missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET");
      return;
    }

    setUploadLoading(true);
    const uploadedUrls = [];

    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", UPLOAD_PRESET);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        } else {
          console.error("Cloudinary upload failed", data);
          toastMsg("error", "One of the uploads failed. Check console.");
        }
      } catch (err) {
        console.error("Upload error", err);
        toastMsg("error", "Upload error. See console.");
      }
    }

    if (uploadedUrls.length > 0) {
      setForm((prev) => ({ ...prev, pictures: [...prev.pictures, ...uploadedUrls] }));
      toastMsg("success", `${uploadedUrls.length} image(s) uploaded`);
    }

    setUploadLoading(false);
  }

  const onFilesSelected = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    handleUploadFiles(files);
    e.target.value = "";
  };

  const addSize = () => {
    if (newSize.trim()) {
      setForm((prev) => ({ ...prev, sizes: [...prev.sizes, newSize.trim().toUpperCase()] }));
      setNewSize("");
    }
  };

  const removeSize = (index) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const togglePhrase = (phrase) => {
    setForm((prev) => {
      const phrases = prev.phrases.includes(phrase)
        ? prev.phrases.filter((p) => p !== phrase)
        : [...prev.phrases, phrase];
      return { ...prev, phrases };
    });
  };

  async function handleSave() {
    if (!form.name || !form.mrp || !form.price || !form.pictures.length || !form.category) {
      toastMsg("error", "Please fill name, mrp, price, pictures and category.");
      return;
    }

    const payload = {
      name: form.name,
      sizes: form.sizes,
      mrp: Number(form.mrp),
      price: Number(form.price),
      pictures: form.pictures,
      uploadrequired: !!form.uploadrequired,
      category: form.category,
      phrases: form.phrases,
    };

    setSaveLoading(true);
    try {
      if (!token) {
        toastMsg("error", "Not authorized");
        return;
      }

      if (!viewingProduct) {
        // create
        const res = await fetch(Allapi.products.create.url, {
          method: Allapi.products.create.method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          toastMsg("success", "Product created");
          setShowModal(false);
          fetchProducts();
        } else {
          toastMsg("error", data.message || "Create failed");
        }
      } else {
        // update
        const res = await fetch(Allapi.products.update.url(viewingProduct._id), {
          method: Allapi.products.update.method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          toastMsg("success", "Product updated");
          setIsEditing(false);
          setForm({ ...form, ...payload });
          fetchProducts();
        } else {
          toastMsg("error", data.message || "Update failed");
        }
      }
    } catch (err) {
      console.error(err);
      toastMsg("error", "Server error");
    } finally {
      setSaveLoading(false);
    }
  }

  async function confirmDeleteProduct(id) {
    setConfirmDelete({ show: true, id });
  }

  async function doDelete() {
    const id = confirmDelete.id;
    setConfirmDelete({ show: false, id: null });
    setDeleteLoading(true);

    try {
      if (!token) {
        toastMsg("error", "Not authorized");
        return;
      }

      const res = await fetch(Allapi.products.delete.url(id), {
        method: Allapi.products.delete.method,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toastMsg("success", "Product deleted");
        fetchProducts();
      } else {
        toastMsg("error", data.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toastMsg("error", "Error deleting product");
    } finally {
      setDeleteLoading(false);
    }
  }

  function removePictureAt(index) {
    setForm(prev => ({
      ...prev,
      pictures: prev.pictures.filter((_, i) => i !== index),
    }));
  }

  function closeModal() {
    setShowModal(false);
    setViewingProduct(null);
    setIsEditing(false);
    setForm(initialForm);
    setNewSize("");
  }

  const paginatedProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const totalPages = Math.ceil(products.length / productsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-900">Products</h2>
        <button
          onClick={openAddModal}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all self-start sm:self-auto"
        >
          Add New Product
        </button>
      </div>

      <div className="relative">
        {/* Grid Container */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {paginatedProducts.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-200 border border-gray-100"
              onClick={() => openViewModal(p)}
            >
              <div className="relative h-48 overflow-hidden">
                <div
                  className={`flex h-full transition-transform duration-300 ${
                    p.pictures && p.pictures.length > 1
                      ? "overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                      : ""
                  }`}
                >
                  {p.pictures && p.pictures.length > 0 ? (
                    p.pictures.map((img, idx) => (
                      <div
                        key={idx}
                        className={`flex-shrink-0 w-full h-full snap-center ${
                          p.pictures.length > 1 ? "px-1" : ""
                        }`}
                      >
                        <img
                          src={img}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                      <span className="text-blue-400">No Image</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">
                  {p.name}
                </h3>
                <p className="text-gray-600 text-xs mb-2 capitalize">{p.category}</p>
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <div className="text-xs text-gray-400">MRP</div>
                    <div className="font-semibold text-gray-700">₹{p.mrp}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Price</div>
                    <div className="font-semibold text-blue-600">₹{p.price}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteProduct(p._id);
                    }}
                    disabled={deleteLoading}
                    className="px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {deleteLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 bg-white rounded-full shadow-md hover:shadow-lg disabled:opacity-50 transition-shadow border border-gray-200"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 bg-white rounded-full shadow-md hover:shadow-lg disabled:opacity-50 transition-shadow border border-gray-200"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto z-10 relative border border-gray-100" style={{ scrollbarWidth: 'none' }}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  {viewingProduct ? (isEditing ? "Edit Product" : "View Product") : "Add Product"}
                </h3>
                <div className="flex items-center gap-2">
                  {viewingProduct && !isEditing && (
                    <button onClick={enableEdit} className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                  <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Product Name {isEditing || !viewingProduct ? "*" : ""}
                  </label>
                  <input
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    disabled={!isEditing && viewingProduct}
                  />
                </div>

                {/* Category - Updated */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Category {isEditing || !viewingProduct ? "*" : ""}
                  </label>
                  <select
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    disabled={!isEditing && viewingProduct}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* MRP */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    MRP {isEditing || !viewingProduct ? "*" : ""}
                  </label>
                  <input
                    type="number"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                    value={form.mrp}
                    onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                    disabled={!isEditing && viewingProduct}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Price {isEditing || !viewingProduct ? "*" : ""}
                  </label>
                  <input
                    type="number"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    disabled={!isEditing && viewingProduct}
                  />
                </div>

                {/* Phrases - Updated */}
                <div className="md:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-700">Phrases</label>
                  <div className="space-y-3">
                    {ALLOWED_PHRASES.map((phrase) => (
                      <label key={phrase} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.phrases.includes(phrase)}
                          onChange={() => togglePhrase(phrase)}
                          disabled={!isEditing && viewingProduct}
                          className="rounded border-blue-300"
                        />
                        <span className="text-sm text-gray-700">{phrase}</span>
                      </label>
                    ))}
                  </div>
                  {form.phrases.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.phrases.map((phrase, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                        >
                          {phrase}
                          {(!isEditing) ? null : (
                            <button
                              onClick={() =>
                                setForm(prev => ({
                                  ...prev,
                                  phrases: prev.phrases.filter((_, i) => i !== idx),
                                }))
                              }
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* Sizes */}
                <div className="md:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-700">Sizes</label>
                  <div className="flex gap-2 mb-3 flex-col sm:flex-row">
                    <input
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      placeholder="Enter size (e.g., S, M, L)"
                      disabled={!isEditing && viewingProduct}
                    />
                    <button
                      onClick={addSize}
                      disabled={!newSize.trim() || (!isEditing && viewingProduct)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.sizes.map((size, idx) => (
                      <div key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                        {size}
                        {(!isEditing ) ? null : (
                          <button onClick={() => removeSize(idx)} className="ml-1 text-red-500 hover:text-red-700">
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload Required */}
                <div className="md:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-700">Upload Required</label>
                  <div
                    className={`relative inline-block w-12 h-6 rounded-full transition-colors ${
                      form.uploadrequired ? "bg-blue-600" : "bg-gray-300"
                    } ${(!isEditing && viewingProduct) ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    onClick={() => {
                      if (isEditing || !viewingProduct) {
                        setForm({ ...form, uploadrequired: !form.uploadrequired });
                      }
                    }}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        form.uploadrequired ? "translate-x-6" : ""
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Pictures */}
                <div className="md:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-700">
                    Pictures {isEditing || !viewingProduct ? "*" : ""}
                  </label>
                  <div className="flex gap-2 items-center mb-3 flex-col sm:flex-row">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={onFilesSelected}
                      disabled={!isEditing && viewingProduct}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!isEditing && viewingProduct}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-200"
                    >
                      Choose Images
                    </button>
                  </div>
                  {uploadLoading && (
                    <div className="flex items-center gap-2 text-blue-600 mb-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Uploading...</span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {form.pictures.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={url}
                          alt={`img-${idx}`}
                          className="w-full h-24 object-cover rounded-xl border border-gray-100"
                        />
                        {!isEditing ? null : (
                          <button
                            onClick={() => removePictureAt(idx)}
                            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 rounded-b-3xl flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors border border-gray-200"
              >
                {isEditing ? "Cancel" : "Close"}
              </button>
              {isEditing && (
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all disabled:cursor-not-allowed"
                >
                  {saveLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Saving...
                    </>
                  ) : viewingProduct ? (
                    "Update Product"
                  ) : (
                    "Create Product"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" />
          <div className="bg-white rounded-2xl shadow-xl p-6 z-10 w-full max-w-md border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Delete Product?</h3>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors border border-gray-200"
                onClick={() => setConfirmDelete({ show: false, id: null })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors disabled:cursor-not-allowed"
                onClick={doDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  "Delete"
                )}
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

export default ProductManagement;