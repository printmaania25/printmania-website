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

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#363636", color: "#fff" },
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
            {/* LOGIN */}
            <Route path="/login" element={<LoginPage />} />

            {/* GOOGLE CALLBACK */}
            <Route path="/google/callback" element={<GoogleCallback />} />
          </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
