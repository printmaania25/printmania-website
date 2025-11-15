// src/components/Navbar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import { useToast } from "../Providers/ToastProvider"; // Assuming this exists as in provided code

const categories = [
  { name: "All custom Products", link: "#" },
  { name: "Office Stationeries & Notebooks", link: "#" },
  { name: "Drinkware", link: "#" },
  { name: "T-Shirts, Caps & Bags", link: "#" },
  { name: "Customised Gifts", link: "#" },
  { name: "Visiting Cards", link: "#" },
  { name: "Stickers, Packaging & Labels", link: "#" },
  { name: "Wall Graphics & Large Format Printing", link: "#" },
  { name: "ID Card Holders & Accessories", link: "#" },
];

function Navbar({ onLogin, onLogout, isLoggedIn, role }) {
  const navigate = useNavigate();
  const toastMsg = useToast();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleProfileClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      if (role === "admin") {
        navigate("/admin");
      } else {
        // Stay in user panel (home)
        navigate("/");
      }
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    setProfileOpen(false);
    toastMsg("success", "Logged out successfully");
    navigate("/");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-2">
                <img src="/logo.png" alt="ARC Print" className="h-8 w-auto" /> {/* Replace with actual logo */}
                <span className="text-xl font-bold text-red-600">ARC</span>
                <span className="text-xl font-bold">Print</span>
                <span className="ml-1">🇮🇳</span>
              </a>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Categories - Simplified as buttons */}
            <div className="hidden md:flex space-x-1">
              {categories.map((cat) => (
                <a key={cat.name} href={cat.link} className="px-3 py-2 text-sm text-gray-700 hover:text-red-600">
                  {cat.name}
                </a>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              <a href="#" className="text-sm text-gray-700 hover:text-red-600">Order in Bulk</a>
              <a href="#" className="text-sm text-gray-700 hover:text-red-600">Happy to help</a>
              <a href="#" className="text-sm text-gray-700 hover:text-red-600">📞 6292 233 232</a>
              <button
                onClick={handleProfileClick}
                className="relative p-2 text-gray-700 hover:text-red-600 rounded-full focus:outline-none"
              >
                👤 {/* Profile icon */}
                {isLoggedIn && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {role === "admin" ? "A" : "U"}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Dropdown - Simple for now */}
        {isLoggedIn && profileOpen && (
          <div className="absolute top-16 right-4 bg-white border rounded-lg shadow-lg py-2">
            <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
            <button onClick={handleLogoutClick} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
              Logout
            </button>
          </div>
        )}
      </nav>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={onLogin}
        />
      )}
    </>
  );
}

export default Navbar;