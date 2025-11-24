import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Allapi from "../common";
import { Gift, Sparkles, TrendingUp, Award, Heart, Star, Tag, Package, Calendar, Briefcase } from "lucide-react";
import InfiniteScrollOffers from "../Components/InfiniteScrollOffers";

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
      }, 1400);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, product.pictures.length]);

  return (
    <div
      className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 flex flex-col border border-blue-200/50 h-full"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
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
              <div className="absolute inset-0 flex flex-col justify-end items-center pb-2 sm:pb-3 bg-black/20 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickBuy(product._id);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-orange-600 hover:from-blue-600 hover:to-orange-700 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-xl shadow-blue-500/20 font-semibold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105"
                >
                  Quick Buy
                </button>

                {product.pictures.length > 1 && (
                  <div className="flex space-x-1.5 sm:space-x-2 mt-2 sm:mt-3">
                    {product.pictures.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          goToImage(idx);
                        }}
                        className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                          idx === currentImageIndex ? 'bg-blue-400 w-4 sm:w-5' : 'bg-gray-300 w-1.5 sm:w-2'
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
            <span className="text-gray-500 text-xs sm:text-sm">No Image</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-3 py-2 sm:py-4 text-center bg-white min-h-[80px] sm:min-h-[100px]">
        <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-xs sm:text-sm line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent">
            ₹{product.price}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 line-through decoration-2">
            ₹{product.mrp}
          </p>
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedPhrase, setSelectedPhrase] = useState("Best selling");
  const tabsRef = useRef(null);

  const ALLOWED_PHRASES = [
    "Best selling",
    "Popular Gifts",
    "Below 500 Rs",
    "New Arrival",
    "Signature Day Special",
    "Event Special",
    "What's Trending",
    "Corporate Gifting"
  ];

  const CATEGORIES = [
    "Mugs",
    "Photo frames",
    "Polaroid Photos",
    "Key chains",
    "Banners",
    "T shirts",
    "Hoodies",
    "Sweat shirts",
    "Full hand t shirts",
    "Posters",
    "ID cards",
    "Signature Day t shirts",
    "Puzzles Boards",
    "Stickkers",
    "Dairies",
    "Bags",
    "Pens",
    "Ceritificates",
    "Other Gift articles"
  ];

  const phraseConfig = {
    "Best selling": { icon: Award, gradient: "from-yellow-500 to-orange-600" },
    "Popular Gifts": { icon: Heart, gradient: "from-pink-500 to-red-600" },
    "Below 500 Rs": { icon: Tag, gradient: "from-green-500 to-emerald-600" },
    "New Arrival": { icon: Sparkles, gradient: "from-purple-500 to-indigo-600" },
    "Signature Day Special": { icon: Calendar, gradient: "from-blue-500 to-cyan-600" },
    "Event Special": { icon: Gift, gradient: "from-orange-500 to-red-600" },
    "What's Trending": { icon: TrendingUp, gradient: "from-blue-500 to-orange-600" },
    "Corporate Gifting": { icon: Briefcase, gradient: "from-gray-600 to-blue-700" }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [offersRes, bannersRes, productsRes] = await Promise.all([
          fetch(Allapi.offers.getAll.url, { method: Allapi.offers.getAll.method }),
          fetch(Allapi.banners.getAll.url, { method: Allapi.banners.getAll.method }),
          fetch(Allapi.products.getAll.url, { method: Allapi.products.getAll.method })
        ]);

        const offersData = await offersRes.json();
        const bannersData = await bannersRes.json();
        const productsData = await productsRes.json();

        if (offersData.success) setOffers(offersData.offers || []);
        if (bannersData.success) setBanners(bannersData.banners || []);
        if (productsData.success) setProducts(productsData.products || []);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const isUserAuthenticated = () => {
    const userDetails = localStorage.getItem("userdetails");
    return userDetails && userDetails.trim() !== "";
  };

  const handleQuickBuy = (productId) => {
    if (!isUserAuthenticated()) {
      navigate("/login", { state: { redirectTo: `/product/${productId}` } });
      return;
    }
    navigate(`/product/${productId}`);
  };

  const handleProductClick = (productId) => {
    if (!isUserAuthenticated()) {
      navigate("/login", { state: { redirectTo: `/product/${productId}` } });
      return;
    }
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

  const groupedByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  const currentPhraseConfig = phraseConfig[selectedPhrase];
  const IconComponent = currentPhraseConfig?.icon || TrendingUp;

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 via-orange-50 to-blue-50 pt-16">
      <InfiniteScrollOffers offers={offers} />

      {/* Desktop Banners */}
      <div className="hidden md:block">
        {banners.length > 0 && (
          <div className="relative w-full overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentBanner * 100}%)` }}
            >
              {banners.map((banner) => (
                <div key={banner._id} className="w-full flex-shrink-0">
                  <img
                    src={banner.desktopBanner}
                    alt={banner.title}
                    className="w-full block"
                    style={{ height: 'auto', maxHeight: '500px' }}
                  />
                </div>
              ))}
            </div>
            {banners.length > 1 && (
              <>
                <button onClick={prevBanner} className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-blue-500 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-xl text-2xl font-bold border border-blue-200/50">‹</button>
                <button onClick={nextBanner} className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-blue-500 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-xl text-2xl font-bold border border-blue-200/50">›</button>
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                  {banners.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentBanner(idx)} className={`h-2 rounded-full transition-all duration-300 ${idx === currentBanner ? 'bg-blue-500 w-8' : 'bg-gray-300 w-2'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile Banners */}
      <div className="md:hidden">
        {banners.length > 0 && (
          <div className="relative w-full overflow-hidden">
            <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
              {banners.map((banner) => (
                <div key={banner._id} className="w-full flex-shrink-0">
                  <img src={banner.mobileBanner} alt={banner.title} className="w-full block" style={{ height: 'auto', maxHeight: '300px' }} />
                </div>
              ))}
            </div>
            {banners.length > 1 && (
              <>
                <button onClick={prevBanner} className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-blue-500 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10 shadow-lg text-xl font-bold border border-blue-200/50">‹</button>
                <button onClick={nextBanner} className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-blue-500 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10 shadow-lg text-xl font-bold border border-blue-200/50">›</button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-10">
                  {banners.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentBanner(idx)} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentBanner ? 'bg-blue-500 w-6' : 'bg-gray-300 w-1.5'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Phrase Tabs - Split into 2 Rows */}
      <div className="pt-6 sm:pt-8 md:pt-12 px-3 sm:px-4 md:px-8 max-w-7xl mx-auto mb-8">
        <div ref={tabsRef} className="overflow-x-auto scrollbar-hide pb-4">
          {/* First Row */}
          <div className="flex flex-wrap gap-3 mb-4 justify-center md:justify-start">
            {ALLOWED_PHRASES.slice(0, 4).map((phrase, index) => {
              const config = phraseConfig[phrase];
              const Icon = config.icon;
              return (
                <button
                  key={phrase}
                  onClick={() => handleTabClick(phrase, index)}
                  className={`px-4 ml-2 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2 shadow-md ${
                    selectedPhrase === phrase
                      ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg scale-105`
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="block">{phrase}</span>
                </button>
              );
            })}
          </div>

          {/* Second Row */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {ALLOWED_PHRASES.slice(4).map((phrase, index) => {
              const realIndex = index + 4;
              const config = phraseConfig[phrase];
              const Icon = config.icon;
              return (
                <button
                  key={phrase}
                  onClick={() => handleTabClick(phrase, realIndex)}
                  className={`px-4 py-3 ml-4 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2 shadow-md ${
                    selectedPhrase === phrase
                      ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg scale-105`
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="block">{phrase}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Phrase Products */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl p-6 shadow-xl border border-blue-200/30">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${currentPhraseConfig.gradient}`}>
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
              {selectedPhrase}
            </h2>
          </div>

          {groupedByPhrases[selectedPhrase]?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {groupedByPhrases[selectedPhrase].map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onClick={() => handleProductClick(product._id)}
                  onQuickBuy={handleQuickBuy}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12 text-lg">No products in this collection yet.</p>
          )}
        </div>
      </div>

      {/* Categories Section */}
      <div className="px-3 sm:px-4 md:px-8 max-w-7xl mx-auto py-10">
        <h2 className="text-3xl md:text-5xl font-bold text-center bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent mb-10">
          Explore Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CATEGORIES.map((category) => {
            const sample = groupedByCategory[category][0];
            if (!sample) return null;
            return (
<div
  key={category}
  onClick={() => handleProductClick(sample._id)}
  className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 group"
>
  <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
    {sample.pictures && sample.pictures.length > 0 ? (
      <img
        src={sample.pictures[0]}
        alt={category}
        className="absolute top-0 left-0 w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-gray-500 text-xs sm:text-sm">No Image</span>
      </div>
    )}
  </div>

  <div className="p-4 text-center">
    <h3 className="font-bold text-lg text-gray-800">{category}</h3>
  </div>
</div>

            );
          })}
        </div>
      </div>

      {/* All Categories with Products */}
      <div className="px-3 sm:px-4 md:px-8 max-w-7xl mx-auto space-y-12 pb-16">
        {CATEGORIES.map((category) => {
          const items = groupedByCategory[category];
          if (items.length === 0) return null;

          return (
            <div key={category} className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-3xl p-6 md:p-10 shadow-xl border border-blue-200/30">
              <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                {category}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {items.slice(0, 8).map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={() => handleProductClick(product._id)}
                    onQuickBuy={handleQuickBuy}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-r from-blue-500 via-orange-500 to-blue-500 text-white border-t border-blue-300/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-3">About PrintMaania</h3>
              <p className="text-blue-100 text-sm">Your one-stop shop for personalized gifts & premium printing.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-blue-100">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">All Products</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Contact Us</h3>
              <p className="text-sm text-blue-100">Email: printmaania92@gmail.com</p>
              <p className="text-sm text-blue-100">Phone: +91 9063347447</p>
              <p className="text-sm text-blue-100">Vijayawada, Andhra Pradesh</p>
            </div>
          </div>
          <div className="text-center text-blue-200 text-sm pt-6 border-t border-blue-400/50">
            © 2025 PrintMaania. All rights reserved.
          </div>
        </div>
      </footer>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
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