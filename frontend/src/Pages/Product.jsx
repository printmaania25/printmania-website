import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import useUser from "../hooks/useUser";
import Allapi from "../common";
import Navbar from "../Components/Navbar";


function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useUser();

  const [product, setProduct] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [uploadImage, setUploadImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      setLoading(true);

      const prodRes = await fetch(Allapi.products.getAll.url);
      const prodData = await prodRes.json();
      if (prodData.success) {
        const found = prodData.products.find((p) => p._id === id);
        setProduct(found);
      }

      const addrRes = await fetch(Allapi.address.myaddresses.url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const addrData = await addrRes.json();
      if (addrData.success) setAddresses(addrData.addresses);

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function uploadToCloudinary(file) {
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

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await uploadToCloudinary(file);
      setUploadImage(url);
    } catch (error) {
      alert("Failed to upload image. Please try again.");
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const nextImage = () => {
    if (isTransitioning || !product?.pictures) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => (prev + 1) % product.pictures.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevImage = () => {
    if (isTransitioning || !product?.pictures) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => (prev - 1 + product.pictures.length) % product.pictures.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToImage = (index) => {
    if (isTransitioning || index === currentImageIndex) return;
    setIsTransitioning(true);
    setCurrentImageIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const placeOrder = async () => {
    if (placingOrder) return;

    if (!addresses.length) {
      alert("Please add an address before ordering");
      return navigate("/addresses");
    }

    if (product.sizes.length > 0 && !selectedSize) {
      return alert("Please select a size");
    }

    const payload = {
      productId: product._id,
      size: selectedSize,
      price: product.price,
      quantity,
      address: addresses[selectedAddressIndex],
    };
  
    if (product.uploadrequired) {
      if (!uploadImage) return alert("Please upload required image");
      payload.uploaded = uploadImage;
    }

    console.log("payload: ", payload);

    try {
      setPlacingOrder(true);
      const res = await fetch(Allapi.orders.create.url, {
        method: Allapi.orders.create.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        return;
      }

      navigate(`/order/${data.order._id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex flex-col items-center justify-center">
        <p className="text-xl text-gray-600 mb-4">Product not found</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  console.log("product:",product)

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-blue-50 pt-16">
      {/* Header with Back Button */}
         <Navbar />

      <div className="pb-24">
        <div className="w-full h-16 bg-white  flex items-center px-4 md:px-8">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors duration-300"
          >
            <span className="text-blue-600 text-xl font-bold">←</span>
          </button>
          <h1 className="ml-4 text-lg font-bold text-gray-800">Product Details</h1>
        </div>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Images Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-fit">
              {product.pictures && product.pictures.length > 0 && (
                <div className="relative">
                  <div className="relative h-96 md:h-[500px] overflow-hidden bg-gray-50">
                    {product.pictures.map((pic, idx) => (
                      <img
                        key={idx}
                        src={pic}
                        alt={`${product.name} ${idx + 1}`}
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

                  {product.pictures.length > 1 && (
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
                        {product.pictures.map((_, idx) => (
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
            </div>

            {/* Product Details Section */}
            <div className="space-y-6">
              {/* Product Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
                <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-4">
                  {product.category}
                </p>
                <div className="flex items-baseline gap-2">
                  <div className="flex items-end gap-3">
                      {/* Discounted price */}
                      <span className="text-4xl font-bold text-gray-900">
                        ₹{product.price}
                      </span>

                      {/* MRP Striked */}
                      <span className="text-2xl font-semibold text-gray-500 line-through">
                        ₹{product.mrp}
                      </span>
                    </div>
                </div>
              </div>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">Select Size</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-300 ${
                          selectedSize === s
                            ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105"
                            : "border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-800 mb-3 text-lg">Quantity</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold text-xl transition-colors duration-300"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="w-20 text-center text-2xl font-bold text-gray-800 border-2 border-gray-300 rounded-xl py-2 focus:outline-none focus:border-blue-400"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold text-xl transition-colors duration-300"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Upload Required */}
              {product.uploadrequired && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">Upload Required Image</h3>
                  
                  {uploadingImage ? (
                    <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-3"></div>
                      <p className="text-blue-600 font-semibold">Uploading...</p>
                    </div>
                  ) : uploadImage ? (
                    <div className="flex items-center justify-center py-4 min-h-[200px]">
                      <div className="relative inline-block">
                        <img
                          src={uploadImage}
                          className="w-48 h-48 rounded-xl border-2 border-blue-200 object-contain bg-gray-50"
                          alt="Uploaded"
                        />
                        <button
                          onClick={() => setUploadImage("")}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors duration-300">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-12 h-12 mb-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-blue-600 font-semibold">Click to upload image</p>
                        <p className="text-xs text-gray-500">PNG, JPG (MAX. 10MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleUpload}
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Address Selection */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 text-lg">Delivery Address</h3>
                  <button
                    onClick={() => navigate("/addresses")}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors"
                  >
                    + Add New
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No addresses found</p>
                    <button
                      onClick={() => navigate("/addresses")}
                      className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Add Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto" style={{scrollbarWidth:'none'}}>
                    {addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedAddressIndex(idx)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                          selectedAddressIndex === idx
                            ? "border-blue-600 bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 mr-3 flex items-center justify-center transition-colors ${
                            selectedAddressIndex === idx
                              ? "border-blue-600 bg-blue-600"
                              : "border-gray-300"
                          }`}>
                            {selectedAddressIndex === idx && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{addr.name}</p>
                            <p className="text-sm text-gray-600 mt-1">{addr.mobile}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {addr.doorNo}, {addr.street}, {addr.city} - {addr.pincode}
                            </p>
                            <p className="text-sm text-gray-600">{addr.state}</p>
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
      </div>

      {/* Fixed Bottom Bar with Place Order Button */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-2xl border-t border-gray-200 p-4 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900">₹{product.price * quantity}</span>
          </div>
          <button
            onClick={placeOrder}
            disabled={placingOrder}
            className="flex-1 max-w-md py-4 bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white rounded-full text-lg font-bold shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          >
            {placingOrder ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                <span>Placing Order...</span>
              </>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </div>

      <style>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}

export default Product;