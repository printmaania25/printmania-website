import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Allapi from "../common";

function ProductCard({ product, onQuickBuy, onClick }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);

  const goToImage = (index) => {
    if (isTransitioning || index === currentImageIndex) return;
    setIsTransitioning(true);
    setCurrentImageIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  useEffect(() => {
    if (product.pictures.length <= 1) return;

    if (isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.pictures.length);
      }, 2500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, product.pictures.length]);

  return (
    <div
      className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ height: '400px' }}
    >
      <div className="relative w-full h-64 overflow-hidden bg-gray-50 flex-shrink-0">
        {product.pictures && product.pictures.length > 0 ? (
          <>
            <div className="relative w-full h-full">
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

            {isHovered && (
              <div className="absolute inset-0 flex flex-col justify-end items-center pb-3 bg-black/10 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickBuy(product._id);
                  }}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-1 rounded-full shadow-xl font-semibold text-base transition-all duration-300 transform hover:scale-105"
                >
                  Quick Buy
                </button>

                {product.pictures.length > 1 && (
                  <div className="flex space-x-2 mt-4">
                    {product.pictures.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          goToImage(idx);
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          idx === currentImageIndex ? 'bg-white w-7' : 'bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <h3 className="font-semibold text-gray-800 mb-2 text-base line-clamp-2">{product.name}</h3>
        <p className="text-2xl font-bold text-gray-900">₹{product.price}</p>
      </div>
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedPhrase, setSelectedPhrase] = useState("What's trending");
  const tabsRef = useRef(null);

  const ALLOWED_PHRASES = [
    "What's trending",
    "Best Seller",
    "Popular gifts",
    "New arrival"
  ];
  const CATEGORIES = ["T-shirts", "KeyChains", "Dairys", "Books", "IdCards", "Others"];

  useEffect(() => {
    fetchBanners();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  async function fetchBanners() {
    try {
      const res = await fetch(Allapi.banners.getAll.url, {
        method: Allapi.banners.getAll.method,
      });
      const data = await res.json();
      if (data.success) setBanners(data.banners || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch(Allapi.products.getAll.url, {
        method: Allapi.products.getAll.method,
      });
      const data = await res.json();
      if (data.success) setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleQuickBuy = (productId) => {
    navigate(`/product/${productId}`);
  };

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

  const handleTabClick = (phrase, index) => {
    setSelectedPhrase(phrase);
    if (tabsRef.current) {
      const button = tabsRef.current.children[index];
      if (button) {
        const scrollLeft = button.offsetLeft - (tabsRef.current.offsetWidth / 2) + (button.offsetWidth / 2);
        tabsRef.current.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: 'smooth'
        });
      }
    }
  };

  const groupedByPhrases = ALLOWED_PHRASES.reduce((acc, phrase) => {
    acc[phrase] = products.filter((p) => p.phrases && p.phrases.includes(phrase));
    return acc;
  }, {});

  const featuredProducts = products.filter((p) => !p.phrases || p.phrases.length === 0).slice(0, 8);

  const groupedByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-purple-50 pt-16">
      {/* Banners Slider - Desktop */}
      <div className="hidden md:block">
        {banners.length > 0 && (
          <div className="relative w-full overflow-hidden">
            <div className={`relative transition-opacity duration-700 ease-in-out ${banners[currentBanner] ? 'opacity-100' : 'opacity-0'}`}>
              <img
                src={banners[currentBanner]?.desktopBanner}
                alt={banners[currentBanner]?.title}
                className="w-full"
                style={{ height: 'auto', maxHeight: '500px' }}
              />
            </div>
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevBanner}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-xl text-2xl font-bold"
                >
                  ‹
                </button>
                <button
                  onClick={nextBanner}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-xl text-2xl font-bold"
                >
                  ›
                </button>
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBanner(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentBanner ? 'bg-white w-8' : 'bg-white/50 w-2'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Banners Slider - Mobile */}
      <div className="md:hidden">
        {banners.length > 0 && (
          <div className="relative w-full overflow-hidden">
            <div className={`relative transition-opacity duration-700 ease-in-out ${banners[currentBanner] ? 'opacity-100' : 'opacity-0'}`}>
              <img
                src={banners[currentBanner]?.mobileBanner}
                alt={banners[currentBanner]?.title}
                className="w-full"
                style={{ height: 'auto', maxHeight: '300px' }}
              />
            </div>
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevBanner}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-lg text-xl font-bold"
                >
                  ‹
                </button>
                <button
                  onClick={nextBanner}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-lg text-xl font-bold"
                >
                  ›
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-10">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBanner(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentBanner ? 'bg-white w-6' : 'bg-white/50 w-1.5'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Phrased Products Sections - Tabbed */}
      <div className="pt-10 px-4 md:px-8 max-w-7xl mx-auto mb-16">
        <div
          ref={tabsRef}
          className="flex space-x-3 mb-8 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {ALLOWED_PHRASES.map((phrase, index) => (
            <button
              key={phrase}
              onClick={() => handleTabClick(phrase, index)}
              className={`px-6 py-3 rounded-full text-base font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                selectedPhrase === phrase
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg scale-105'
                  : 'text-gray-700 hover:text-purple-600 bg-white border-2 border-gray-200 hover:border-purple-300'
              }`}
            >
              {phrase}
            </button>
          ))}
        </div>

        {groupedByPhrases[selectedPhrase].length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {groupedByPhrases[selectedPhrase].map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onClick={() => navigate(`/product/${product._id}`)}
                onQuickBuy={handleQuickBuy}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No products found in this category</p>
          </div>
        )}
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div className="pt-8 px-4 md:px-8 max-w-7xl mx-auto mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">Featured Products</h2>
            <button className="text-purple-600 hover:text-purple-800 text-sm font-semibold transition-colors duration-300 bg-purple-50 px-4 py-2 rounded-full">View All →</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onClick={() => navigate(`/product/${product._id}`)}
                onQuickBuy={handleQuickBuy}
              />
            ))}
          </div>
        </div>
      )}

      {/* Category Sections */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto space-y-16 pb-16">
        {CATEGORIES.map((category) => (
          groupedByCategory[category].length > 0 && (
            <div key={category}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent capitalize">{category}</h2>
                <button className="text-purple-600 hover:text-purple-800 text-sm font-semibold transition-colors duration-300 bg-purple-50 px-4 py-2 rounded-full">View All →</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {groupedByCategory[category].slice(0, 8).map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={() => navigate(`/product/${product._id}`)}
                    onQuickBuy={handleQuickBuy}
                  />
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default HomePage;
