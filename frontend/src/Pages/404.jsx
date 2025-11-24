import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Allapi from "../common";
import { Home, Search, Sparkles, Frown, ArrowLeft } from "lucide-react";

function FeaturedProductCard({ product, onQuickBuy, onClick }) {
  return (
    <div
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col group border border-purple-100"
      onClick={onClick}
      style={{ height: '420px' }}
    >
      <div className="relative w-full h-72 overflow-hidden bg-white flex-shrink-0">
        {product.pictures && product.pictures.length > 0 ? (
          <img
            src={product.pictures[0]}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
          <Sparkles className="w-4 h-4 text-purple-500 inline-block" />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-5 text-center bg-purple-50">
        <h3 className="font-bold text-gray-800 mb-2 text-lg line-clamp-2">{product.name}</h3>
        <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">₹{product.price}</p>
      </div>
    </div>
  );
}

function NotFoundPage() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  async function fetchFeaturedProducts() {
    try {
      setLoading(true);
      const res = await fetch(Allapi.products.getAll.url, {
        method: Allapi.products.getAll.method,
      });
      const data = await res.json();
      if (data.success) {
        const products = data.products || [];
        const featured = products.filter(p => p.phrases && p.phrases.includes("Featured products")).slice(0, 4);
        setFeaturedProducts(featured);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleQuickBuy = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 pt-16">
      {/* 404 Hero Section */}
      <div className="relative px-4 md:px-8 max-w-7xl mx-auto py-20 text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 text-6xl">✨</div>
          <div className="absolute top-20 right-20 text-5xl">🎉</div>
          <div className="absolute bottom-20 left-1/4 text-4xl">🎁</div>
          <div className="absolute bottom-10 right-1/3 text-6xl">💫</div>
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full mb-6 shadow-2xl">
            <Frown className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-4 tracking-tight">
            404
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-gray-700 mb-2">
            Oops! Page Not Found
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
            The page you're looking for seems to have taken a detour. Let's get you back on track!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-2xl shadow-xl font-semibold text-base transition-all duration-300 transform hover:scale-105"
            >
              <Home className="w-5 h-5" />
              Go Home
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-purple-300 rounded-2xl shadow-lg font-semibold text-base transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for something else..."
                className="pl-12 pr-4 py-3 w-80 rounded-2xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none shadow-lg transition-all duration-300"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Teaser */}
      {featuredProducts.length > 0 && (
        <div className="px-4 md:px-8 max-w-7xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-3 mx-auto">
              <Sparkles className="w-8 h-8 text-purple-500" />
              While You're Here
            </h2>
            <p className="text-xl text-gray-600 font-medium">Check out these featured gems!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <FeaturedProductCard
                key={product._id}
                product={product}
                onClick={() => navigate(`/product/${product._id}`)}
                onQuickBuy={handleQuickBuy}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      <footer className="w-full bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About Section */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-purple-700">About PrintMaania</h3>
              <p className="text-sm leading-relaxed text-purple-600">
                Committed to bringing you the finest Printing Service, sourced responsibly and crafted with care.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-purple-700">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-purple-600 transition-colors text-purple-600">About Us</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors text-purple-600">Products</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors text-purple-600">Common Queries</a></li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-purple-700">Contact Us</h3>
              <div className="space-y-2 text-sm">
                <p className="text-purple-600"><span className="font-medium">Name:</span> Dr Owner</p>
                <p className="text-purple-600"><span className="font-medium">Email:</span> printmaania@gmail.com</p>
                <p className="text-purple-600"><span className="font-medium">Phone:</span> +91 98491 1105</p>
                <p className="text-purple-600"><span className="font-medium">Address:</span> Vijayawada, Andhra Pradesh</p>
              </div>
            </div>
          </div>
          <div className="border-t border-purple-200 pt-6 text-center text-sm text-purple-600">
            &copy; 2025 PrintMaania. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default NotFoundPage;