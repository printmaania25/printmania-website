// src/components/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../hooks/useUser";
import Allapi from "../common";

function Navbar() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const timeoutRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    // Close suggestions when clicking outside
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5); // Show max 5 suggestions
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, allProducts]);

  async function fetchProducts() {
    try {
      const res = await fetch(Allapi.products.getAll.url);
      const data = await res.json();
      if (data.success) setAllProducts(data.products || []);
    } catch (err) {
      console.error(err);
    }
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowMenu(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowMenu(false), 200);
  };

  const handleMenuMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowMenu(true);
  };

  const handleMenuMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowMenu(false), 200);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  const handleSuggestionClick = (productId) => {
    setSearchQuery("");
    setShowSuggestions(false);
    navigate(`/product/${productId}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && searchSuggestions.length > 0) {
      handleSuggestionClick(searchSuggestions[0]._id);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-16 bg-white shadow-md flex items-center justify-between px-4 md:px-8 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-400 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent hidden sm:block">
          Paintmaania
        </h1>
      </div>
      
      {/* Search Bar with Suggestions */}
      <div className="flex-1 max-w-md mx-6" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowSuggestions(true)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300 text-sm"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          
          {/* Search Suggestions Dropdown */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden z-50">
              {searchSuggestions.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleSuggestionClick(product._id)}
                  className="flex items-center gap-3 p-3 hover:bg-purple-50 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                >
                  <img
                    src={product.pictures[0]}
                    alt={product.name}
                    className="w-12 h-12 object-contain rounded-lg border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate text-sm">{product.name}</p>
                    <p className="text-xs text-purple-600 font-medium">₹{product.price}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Order in Bulk Button */}
      <button
        onClick={() => {/* Add bulk order functionality later */}}
        className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full font-semibold text-sm shadow-lg transition-all duration-300 transform hover:scale-105 mr-4"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Order in Bulk
      </button>
      
      {/* User Profile Menu */}
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow duration-300">
          <span className="text-white font-bold text-base">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
        {showMenu && (
          <div
            className="absolute right-0 mt-3 w-72 bg-white shadow-2xl rounded-2xl p-5 border border-purple-100 z-50"
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
          >
            {user && (
              <div className="flex flex-col items-center mb-6 pb-5 border-b border-purple-100">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center mb-3 shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h2 className="font-bold text-gray-800 text-lg">Hi, {user.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              </div>
            )}
            <div className="space-y-2">
              <div
                className="flex items-center gap-3 py-3 px-4 cursor-pointer hover:bg-purple-50 rounded-xl transition-all duration-300"
                onClick={() => navigate("/profile")}
              >
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
                <span className="text-gray-700 font-medium">Profile</span>
              </div>
              <div
                className="flex items-center gap-3 py-3 px-4 cursor-pointer hover:bg-purple-50 rounded-xl transition-all duration-300"
                onClick={() => navigate("/addresses")}
              >
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <span className="text-gray-700 font-medium">Addresses</span>
              </div>
              <div
                className="flex items-center gap-3 py-3 px-4 cursor-pointer hover:bg-purple-50 rounded-xl transition-all duration-300"
                onClick={() => navigate("/myorders")}
              >
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">O</span>
                </div>
                <span className="text-gray-700 font-medium">My Orders</span>
              </div>
              <div
                className="flex items-center gap-3 py-3 px-4 cursor-pointer hover:bg-red-50 rounded-xl transition-all duration-300 text-red-600"
                onClick={handleSignOut}
              >
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <span className="font-medium">Sign Out</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;