import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import UserPanel from "./Pages/UserPanel";
import AdminPanel from "./Pages/AdminPanel";
import LoginPage from "./Pages/LoginPage";
import ProfilePage from "./Pages/ProfilePage";
import AddressesPage from "./Pages/AddressesPage";
import GoogleCallback from "./Components/GoogleCallback";
import HomePage from "./Pages/HomePage";

import Product from "./Pages/Product";
import MyOrders from "./Pages/MyOrders";
import Order from "./Pages/Order";
import BulkOrder from "./Pages/BultOrder";
import NotFoundPage from "./Pages/404";

import AdminRoute from "./Components/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
            gutter={8}
            toastOptions={{
              duration: 2000,  // Auto-dismiss after 5s
              style: {
                background: 'white',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: 'white' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: 'white' },
              },
              closeButton: true,  // Adds X button to every toast
              closeOnClick: true,  // Dismiss on body click
            }}
        />

      <Routes>
        <Route path="/" element={<UserPanel />}>
          <Route index element={<HomePage />} />
          <Route path="user" element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="myorders" element={<MyOrders />} />
          <Route path="product/:id" element={<Product />} />
          <Route path="order/:id" element={<Order />} />
        </Route>

        {/* LOGIN */}
        <Route path="/login" element={<LoginPage />} />

        {/* GOOGLE CALLBACK */}
        <Route path="/google/callback" element={<GoogleCallback />} />

        {/* 🔥 PROTECTED ADMIN ROUTE */}
        <Route
          path="admin/*"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

        <Route path="/bulkorders" element={<BulkOrder />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
