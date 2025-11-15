// src/pages/AdminPanel.jsx
import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";

function AdminPanel({ onLogout }) {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("products");

  const navItems = [
    { name: "Products", path: "products" },
    { name: "Banners", path: "banners" },
    { name: "Orders", path: "orders" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="mt-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setActiveNav(item.path)}
              className={`block px-6 py-3 text-gray-700 hover:bg-gray-100 ${activeNav === item.path ? "bg-blue-50 border-r-2 border-blue-500" : ""}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <button
          onClick={onLogout}
          className="absolute bottom-4 left-4 w-56 px-6 py-3 text-red-600 hover:bg-gray-100 rounded"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <Outlet /> {/* Sub-routes will render here */}
      </div>
    </div>
  );
}

export default AdminPanel;