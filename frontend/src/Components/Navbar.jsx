import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, X } from 'lucide-react';
import useUser from "../hooks/useUser";
import Allapi from "../common";
import logo from "../assets/logo.png";

function Navbar() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setSearchExpanded(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
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
      ).slice(0, 5);
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

const handleBulkOrderClick = () => {
  if (!user) {
    navigate("/login", {
      state: { redirectTo: "/bulkorders" }
    });
    return;
  }
  window.open("/bulkorders", "_blank");
};


  const handleProfileClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowMenu(!showMenu);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userdetails");
    navigate("/login");
    window.location.reload();
  };

  const handleSuggestionClick = (productId) => {
    setSearchQuery("");
    setShowSuggestions(false);
    setSearchExpanded(false);

    if (!user) {
      navigate("/login");
      return;
    }

    navigate(`/product/${productId}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && searchSuggestions.length > 0) {
      handleSuggestionClick(searchSuggestions[0]._id);
    }
  };

  const handleSearchFocus = () => {
    setSearchExpanded(true);
    if (searchQuery) setShowSuggestions(true);
  };

  const handleCloseSearch = () => {
    setSearchExpanded(false);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-16 bg-white shadow-lg shadow-blue-500/10 flex items-center justify-between px-4 md:px-8 z-50 border-b border-blue-200/50">
      <div
        className={`flex items-center gap-3 cursor-pointer transition-all duration-300 ${searchExpanded ? 'hidden md:flex' : 'flex'}`}
        onClick={() => navigate("/")}
      >
        <div className="w-10 h-10 flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent hidden sm:block">
          PrintMaania
        </h1>
      </div>

      <div
        className={`transition-all duration-300 ${
          searchExpanded
            ? 'fixed left-0 top-0 w-full h-16 px-4 flex items-center bg-white z-50 md:relative md:flex-1 md:max-w-md md:mx-6 md:h-auto md:px-0'
            : 'flex-1 max-w-md mx-2 md:mx-6'
        }`}
        ref={searchRef}
      >
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border-2 border-blue-200/50 rounded-full focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 text-sm text-gray-800 placeholder-gray-500"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 text-lg">🔍</span>

          {searchExpanded && (
            <button
              type="button"
              onClick={handleCloseSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {showSuggestions && searchSuggestions.length > 0 && (
            <div className={`absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-blue-200/50 overflow-hidden z-50 ${searchExpanded ? 'max-h-[calc(100vh-80px)] overflow-y-auto' : ''}`}>
              {searchSuggestions.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleSuggestionClick(product._id)}
                  className="flex items-center gap-2 md:gap-3 p-2 md:p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 border-b border-gray-200 last:border-b-0"
                >
                  <img
                    src={product.pictures[0]}
                    alt={product.name}
                    className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-lg border border-gray-300 flex-shrink-0 bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate text-xs md:text-sm">{product.name}</p>
                    <p className="text-xs text-blue-500 font-medium">₹{product.price}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      <button
        onClick={handleBulkOrderClick}
        className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full font-semibold text-xs md:text-sm shadow-lg shadow-orange-500/20 transition-all duration-300 transform hover:scale-105 mr-2 md:mr-4 ${searchExpanded ? 'hidden md:flex' : 'flex'}`}
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span className="hidden sm:inline">Bulk Order</span>
        <span className="sm:hidden">Bulk</span>
      </button>

      <div className={`relative ${searchExpanded ? 'hidden md:block' : 'block'}`} ref={menuRef}>
        <div
          className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-orange-600 flex items-center justify-center cursor-pointer hover:shadow-[0_4px_20px_rgba(59,130,246,0.3)] transition-all duration-300 border border-blue-300/50"
          onClick={handleProfileClick}
        >
          <User className="w-6 h-6 text-white" />
        </div>

          {user && showMenu && (
          <div className="absolute right-0 mt-3 w-72 bg-white shadow-2xl rounded-2xl p-5 border border-blue-200/50 z-50">
            <div className="flex flex-col items-center mb-6 pb-5 border-b border-gray-200">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-orange-600 flex items-center justify-center mb-3 shadow-lg border border-blue-300/50">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-bold text-gray-800 text-lg">Hi, {user.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{user.email}</p>
            </div>
            <div className="space-y-2">
              <div
                className="flex items-center gap-3 py-3 px-4 cursor-pointer hover:bg-gray-50 rounded-xl transition-all duration-300"
                onClick={() => {
                  setShowMenu(false);
                  navigate("/profile");
                }}
              >
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
                <span className="text-gray-700 font-medium">Profile</span>
              </div>
              <div
                className="flex items-center gap-3 py-3 px-4 cursor-pointer hover:bg-gray-50 rounded-xl transition-all duration-300"
                onClick={() => {
                  setShowMenu(false);
                  navigate("/addresses");
                }}
              >
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <span className="text-gray-700 font-medium">Addresses</span>
              </div>
              <div
                className="flex items-center gap-3 py-3 px-4 cursor-pointer hover:bg-gray-50 rounded-xl transition-all duration-300"
                onClick={() => {
                  setShowMenu(false);
                  navigate("/myorders");
                }}
              >
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
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