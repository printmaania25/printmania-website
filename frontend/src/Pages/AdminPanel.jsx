import { Routes, Route, useNavigate } from "react-router-dom";
import ProductManagement from "./ProductManagement";
import { useState } from "react";
import BannerManagement from "./BannerManagement";
import OrderManagement from "./OrderManagement";

function AdminPanel() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("userdetails"));
  const role = user?.role;
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // If not admin, push to user panel
  if (!token || role !== "admin") {
    navigate("/user");
    return null;
  }

  const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu);

  const closeMobileMenu = () => setShowMobileMenu(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
    closeMobileMenu();
     window.location.reload(); 
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Hamburger */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white rounded-lg shadow-lg"
        onClick={toggleMobileMenu}
      >
        <div className="w-6 h-6 flex flex-col justify-center space-y-1">
          <span className="block w-6 h-0.5 bg-gray-800 rounded"></span>
          <span className="block w-6 h-0.5 bg-gray-800 rounded"></span>
          <span className="block w-6 h-0.5 bg-gray-800 rounded"></span>
        </div>
      </button>

      {/* SIDEBAR */}
      <div
        className={`${
          showMobileMenu ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-0 w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col gap-4 p-6 z-40 transition-transform duration-300 ease-in-out md:w-64`}
      >
        <button
          className="md:hidden absolute top-4 right-4 p-2 text-white"
          onClick={closeMobileMenu}
        >
          <span className="text-2xl">&times;</span>
        </button>
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-gray-900 font-bold">A</span>
          </div>
          Admin
        </h1>

        <nav className="flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <button
              onClick={() => {
                navigate("/admin/products");
                closeMobileMenu();
              }}
              className="flex items-center gap-3 py-3 px-4 bg-gray-700/50 rounded-xl hover:bg-gray-600 transition-colors"
            >
              <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              Products
            </button>

            <button
              onClick={() => {
                navigate("/admin/banners");
                closeMobileMenu();
              }}
              className="flex items-center gap-3 py-3 px-4 bg-gray-700/50 rounded-xl hover:bg-gray-600 transition-colors"
            >
              <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">B</span>
              </div>
              Banners
            </button>

            <button
              onClick={() => {
                navigate("/admin/orders");
                closeMobileMenu();
              }}
              className="flex items-center gap-3 py-3 px-4 bg-gray-700/50 rounded-xl hover:bg-gray-600 transition-colors"
            >
              <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">O</span>
              </div>
              Orders
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 py-3 px-4 bg-red-700/50 rounded-xl hover:bg-red-600 transition-colors text-red-200"
          >
            <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">L</span>
            </div>
            Logout
          </button>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* MAIN PAGE CONTENT */}
      <div className="flex-1  p-6 overflow-auto">
        <Routes>
          <Route path="products" element={<ProductManagement />} />
          <Route path="banners" element={<BannerManagement/>} />
          <Route path="orders" element={<OrderManagement/>} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminPanel;