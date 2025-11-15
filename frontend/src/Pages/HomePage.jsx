// src/pages/HomePage.jsx
import Navbar from "../Components/Navbar";
import BannerSlider from "../Components/BannerSlider";
import ProductSection from "../Components/ProductSection";

function HomePage({ onLogin, onLogout, isLoggedIn, role }) {
  return (
    <div className="pt-16"> {/* Offset for fixed navbar */}
      <Navbar onLogin={onLogin} onLogout={onLogout} isLoggedIn={isLoggedIn} role={role} />
      
      {/* Main Banner */}
      <BannerSlider />

      {/* Categories - Already in Navbar, but if needed, repeat here */}

      {/* Product Sections */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProductSection title="What's trending" products={trendingProducts} />
        <ProductSection title="Best Seller" products={bestSellerProducts} />
        <ProductSection title="Popular gifts" products={popularGifts} />
        <ProductSection title="New arrival" products={newArrivalProducts} />
      </div>
    </div>
  );
}

// Hardcoded static products
const trendingProducts = [
  { id: 1, name: "Wall Calendar", price: 24, image: "/calendar.jpg", quickBuy: true },
  { id: 2, name: "Acrylic Clocks", price: 179, image: "/clock.jpg" },
  // Add more...
];

const bestSellerProducts = [
  { id: 3, name: "Pen with golden touch", price: 68, image: "/pen.jpg" },
  { id: 4, name: "Round Neck T-Shirts", price: 419, image: "/tshirt.jpg" },
  // Add more...
];

const popularGifts = [
  // Similar structure
  { id: 5, name: "Gift 1", price: 100, image: "/gift1.jpg" },
  // ...
];

const newArrivalProducts = [
  // Similar
  { id: 6, name: "New 1", price: 200, image: "/new1.jpg" },
  // ...
];

export default HomePage;