// BannerManagement.jsx
import { useEffect, useState, useRef } from "react";
import { useToast } from "../Providers/ToastProvider";
import Allapi from "../common";

function BannerManagement() {
  const token = localStorage.getItem("token");
  const toastMsg = useToast();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [desktopUploadLoading, setDesktopUploadLoading] = useState(false);
  const [mobileUploadLoading, setMobileUploadLoading] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const [editingLoadingId, setEditingLoadingId] = useState(null);
  const [deletingLoadingId, setDeletingLoadingId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const fileDesktopRef = useRef(null);
  const fileMobileRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    desktopBanner: "",
    mobileBanner: "",
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    setLoading(true);
    try {
      const res = await fetch(Allapi.banners.getAll.url);
      const data = await res.json();
      if (data.success) setBanners(data.banners);
    } catch (err) {
      console.log(err);
      toastMsg("error", "Error fetching banners");
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingBanner(null);
    setForm({
      title: "",
      desktopBanner: "",
      mobileBanner: "",
    });
    setShowModal(true);
  }

  function openEditModal(banner) {
    setEditingLoadingId(banner._id);
    setEditingBanner(banner);
    setForm({
      title: banner.title,
      desktopBanner: banner.desktopBanner,
      mobileBanner: banner.mobileBanner,
    });
    setShowModal(true);
    setEditingLoadingId(null);
  }

  const uploadToCloudinary = async (file) => {
    if (!file) return null;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: fd }
      );
      const data = await res.json();
      return data.secure_url || null;
    } catch (err) {
      console.log(err);
      toastMsg("error", "Image upload failed");
      return null;
    }
  };

  const handleFileSelect = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'desktopBanner') {
      setDesktopUploadLoading(true);
    } else {
      setMobileUploadLoading(true);
    }

    const link = await uploadToCloudinary(file);
    if (link) setForm((prev) => ({ ...prev, [type]: link }));

    if (type === 'desktopBanner') {
      setDesktopUploadLoading(false);
    } else {
      setMobileUploadLoading(false);
    }
  };

  async function handleSave() {
    if (!form.title || !form.desktopBanner || !form.mobileBanner) {
      toastMsg("error", "Please fill all fields");
      return;
    }

    setSavingBanner(true);

    const payload = {
      title: form.title,
      desktopBanner: form.desktopBanner,
      mobileBanner: form.mobileBanner,
    };

    const url = editingBanner
      ? Allapi.banners.update.url(editingBanner._id)
      : Allapi.banners.create.url;

    const method = editingBanner
      ? Allapi.banners.update.method
      : Allapi.banners.create.method;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        toastMsg("error", data.message);
        return;
      }

      toastMsg("success", editingBanner ? "Banner updated" : "Banner created");
      setShowModal(false);
      fetchBanners();
    } catch (err) {
      console.log(err);
      toastMsg("error", "Server error");
    } finally {
      setSavingBanner(false);
    }
  }

  function confirmDeleteBanner(id) {
    setConfirmDelete({ show: true, id });
  }

  async function doDelete() {
    const id = confirmDelete.id;
    setDeletingLoadingId(id);
    setConfirmDelete({ show: false, id: null });

    try {
      const res = await fetch(Allapi.banners.delete.url(id), {
        method: Allapi.banners.delete.method,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) {
        toastMsg("error", data.message);
        return;
      }

      toastMsg("success", "Banner deleted");
      fetchBanners();
    } catch (err) {
      console.log(err);
      toastMsg("error", "Error deleting banner");
    } finally {
      setDeletingLoadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-900">Banners</h2>
        <button
          onClick={openAddModal}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 self-start sm:self-auto"
        >
          Add New Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((b) => (
          <div
            key={b._id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200 group border border-gray-100"
          >
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-orange-50">
              <img
                src={b.desktopBanner}
                alt={b.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">View Banner</span>
              </div>
            </div>

            <div className="p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-lg truncate">{b.title}</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => openEditModal(b)}
                  disabled={editingLoadingId === b._id || deletingLoadingId === b._id}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-orange-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {editingLoadingId === b._id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    "Edit"
                  )}
                </button>
                <button
                  onClick={() => confirmDeleteBanner(b._id)}
                  disabled={editingLoadingId === b._id || deletingLoadingId === b._id}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deletingLoadingId === b._id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 relative border border-gray-100" style={{scrollbarWidth:'none'}}>
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingBanner ? "Edit Banner" : "Add Banner"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Title *</label>
                <input
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter banner title"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">Desktop Banner *</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileDesktopRef}
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, "desktopBanner")}
                />
                <button
                  onClick={() => fileDesktopRef.current.click()}
                  disabled={desktopUploadLoading}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-3 border border-gray-200 flex items-center justify-center gap-2"
                >
                  {desktopUploadLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    "Choose Desktop Image"
                  )}
                </button>
                {form.desktopBanner && (
                  <div className="w-full aspect-[21/7] bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                    <img
                      src={form.desktopBanner}
                      alt="Desktop preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">Mobile Banner *</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileMobileRef}
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, "mobileBanner")}
                />
                <button
                  onClick={() => fileMobileRef.current.click()}
                  disabled={mobileUploadLoading}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-3 border border-gray-200 flex items-center justify-center gap-2"
                >
                  {mobileUploadLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    "Choose Mobile Image"
                  )}
                </button>
                {form.mobileBanner && (
                  <div className="w-48 aspect-[5/4] mx-auto bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                    <img
                      src={form.mobileBanner}
                      alt="Mobile preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 rounded-b-3xl flex justify-end gap-3">
              <button
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors border border-gray-200"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={handleSave}
                disabled={savingBanner}
              >
                {savingBanner ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Banner"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" />
          <div className="bg-white rounded-2xl shadow-xl p-6 z-10 w-full max-w-md border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Delete Banner?</h3>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors border border-gray-200"
                onClick={() => setConfirmDelete({ show: false, id: null })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                onClick={doDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BannerManagement;