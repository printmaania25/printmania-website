import { useNavigate , useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Allapi from "../common";
import { Gift, Sparkles, TrendingUp, Award, Heart, Star, Tag } from "lucide-react";
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
  {/* Product name */}
  <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-xs sm:text-sm line-clamp-2">
    {product.name}
  </h3>

  {/* Price + MRP */}
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

function FeaturedProductCard({ product, onQuickBuy, onClick }) {
  return (
    <div
      className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 flex flex-col group border border-orange-200/50 h-full"
      onClick={onClick}
    >
      <div className="relative w-full aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
        {product.pictures && product.pictures.length > 0 ? (
          <img
            src={product.pictures[0]}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-500 text-xs sm:text-sm">No Image</span>
          </div>
        )}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg border border-orange-200/50">
          <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 inline-block" />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-3 py-2 sm:py-4 text-center bg-white min-h-[80px] sm:min-h-[100px]">
        <h3 className="font-bold text-gray-800 mb-1 sm:mb-2 text-xs sm:text-sm line-clamp-2">{product.name}</h3>
        <p className="text-base sm:text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">₹{product.price}</p>
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
  const [selectedPhrase, setSelectedPhrase] = useState("What's trending");
  const tabsRef = useRef(null);
  const offersScrollRef = useRef(null);
  const location = useLocation();


  const ALLOWED_PHRASES = [
    "What's trending",
    "best seller",
    "Popular gifts",
    "new arraivals"
  ];
  const CATEGORIES = ["T-shirts", "KeyChains", "Dairys", "Books", "IdCards", "Others"];

  const phraseConfig = {
    "What's trending": {
      icon: TrendingUp,
      gradient: "from-blue-500 via-orange-500 to-blue-600",
      bgPattern: "bg-gradient-to-br from-blue-50 to-orange-50"
    },
    "best seller": {
      icon: Award,
      gradient: "from-orange-400 via-blue-400 to-orange-500",
      bgPattern: "bg-gradient-to-br from-orange-50 to-blue-50"
    },
    "Popular gifts": {
      icon: Heart,
      gradient: "from-orange-500 via-orange-600 to-orange-500",
      bgPattern: "bg-gradient-to-br from-orange-50 to-orange-100"
    },
    "new arraivals": {
      icon: Sparkles,
      gradient: "from-blue-400 via-orange-400 to-blue-500",
      bgPattern: "bg-gradient-to-br from-blue-50 to-orange-50"
    }
  };

  const categoryConfigs = {
    "T-shirts": {
      gradient: "from-blue-50 to-orange-50",
      decorations: [
        { pos: "top-10 left-10", emoji: "👕" },
        { pos: "top-20 right-20", emoji: "✂️" },
        { pos: "bottom-20 left-1/4", emoji: "🎨" },
        { pos: "bottom-10 right-1/3", emoji: "👚" }
      ]
    },
    "KeyChains": {
      gradient: "from-orange-50 to-blue-50",
      decorations: [
        { pos: "top-10 left-10", emoji: "🔑" },
        { pos: "top-20 right-20", emoji: "🧷" },
        { pos: "bottom-20 left-1/4", emoji: "🎁" },
        { pos: "bottom-10 right-1/3", emoji: "🏷️" }
      ]
    },
    "Dairys": {
      gradient: "from-blue-50 to-orange-50",
      decorations: [
        { pos: "top-10 left-10", emoji: "📓" },
        { pos: "top-20 right-20", emoji: "✏️" },
        { pos: "bottom-20 left-1/4", emoji: "📝" },
        { pos: "bottom-10 right-1/3", emoji: "🖊️" }
      ]
    },
    "Books": {
      gradient: "from-orange-50 to-blue-50",
      decorations: [
        { pos: "top-10 left-10", emoji: "📚" },
        { pos: "top-20 right-20", emoji: "📖" },
        { pos: "bottom-20 left-1/4", emoji: "🔖" },
        { pos: "bottom-10 right-1/3", emoji: "📘" }
      ]
    },
    "IdCards": {
      gradient: "from-blue-50 to-orange-50",
      decorations: [
        { pos: "top-10 left-10", emoji: "🆔" },
        { pos: "top-20 right-20", emoji: "📇" },
        { pos: "bottom-20 left-1/4", emoji: "🔐" },
        { pos: "bottom-10 right-1/3", emoji: "💳" }
      ]
    },
    "Others": {
      gradient: "from-orange-50 to-blue-50",
      decorations: [
        { pos: "top-10 left-10", emoji: "🎉" },
        { pos: "top-20 right-20", emoji: "✨" },
        { pos: "bottom-20 left-1/4", emoji: "🎈" },
        { pos: "bottom-10 right-1/3", emoji: "🎊" }
      ]
    }
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

  useEffect(() => {
    if (offers.length <= 1) return;

    const scrollContainer = offersScrollRef.current;
    if (!scrollContainer) return;

    let scrollInterval;
    let isPaused = false;

    const startScrolling = () => {
      scrollInterval = setInterval(() => {
        if (!isPaused && scrollContainer) {
          scrollContainer.scrollLeft += 1;

          if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
            scrollContainer.scrollLeft = 0;
          }
        }
      }, 30);
    };

    startScrolling();

    const handleMouseEnter = () => { isPaused = true; };
    const handleMouseLeave = () => { isPaused = false; };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearInterval(scrollInterval);
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [offers.length]);

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

  const featuredProducts = products
    .filter(p => p.phrases && p.phrases.includes("Featured products"))
    .slice(0, 4);

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
  const IconComponent = currentPhraseConfig.icon;

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 via-orange-50 to-blue-50 pt-16">
<InfiniteScrollOffers offers={offers} />

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
                <button
                  onClick={prevBanner}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-blue-500 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-xl shadow-blue-500/10 text-2xl font-bold border border-blue-200/50"
                >
                  ‹
                </button>
                <button
                  onClick={nextBanner}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-blue-500 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-xl shadow-blue-500/10 text-2xl font-bold border border-blue-200/50"
                >
                  ›
                </button>
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBanner(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentBanner ? 'bg-blue-500 w-8' : 'bg-gray-300 w-2'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="md:hidden">
        {banners.length > 0 && (
          <div className="relative w-full overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentBanner * 100}%)` }}
            >
              {banners.map((banner) => (
                <div key={banner._id} className="w-full flex-shrink-0">
                  <img
                    src={banner.mobileBanner}
                    alt={banner.title}
                    className="w-full block"
                    style={{ height: 'auto', maxHeight: '300px' }}
                  />
                </div>
              ))}
            </div>
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevBanner}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-blue-500 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-lg shadow-blue-500/10 text-xl font-bold border border-blue-200/50"
                >
                  ‹
                </button>
                <button
                  onClick={nextBanner}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-blue-500 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-lg shadow-blue-500/10 text-xl font-bold border border-blue-200/50"
                >
                  ›
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-10">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBanner(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentBanner ? 'bg-blue-500 w-6' : 'bg-gray-300 w-1.5'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="pt-6 sm:pt-8 md:pt-12 px-3 sm:px-4 md:px-8 max-w-7xl mx-auto mb-8 md:mb-20">
        <div
          ref={tabsRef}
          className="flex space-x-2 sm:space-x-3 md:space-x-4 mb-4 sm:mb-6 md:mb-10 overflow-x-auto pb-2 sm:pb-3 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {ALLOWED_PHRASES.map((phrase, index) => {
            const config = phraseConfig[phrase];
            const Icon = config.icon;
            return (
              <button
                key={phrase}
                onClick={() => handleTabClick(phrase, index)}
                className={`px-3 ml-6 sm:px-6 md:px-8 py-2 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl text-xs sm:text-sm md:text-base font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-1 md:gap-2 flex-shrink-0 ${
                  selectedPhrase === phrase
                    ? `bg-gradient-to-r ${config.gradient} text-white shadow-2xl shadow-blue-500/20 scale-105 transform`
                    : 'text-gray-600 hover:text-gray-800 bg-gray-100 border-2 border-gray-200 hover:border-blue-300/50 hover:shadow-lg'
                }`}
              >
                <Icon className="w-3 h-3 md:w-5 md:h-5" />
                <span className="hidden sm:inline">{phrase.charAt(0).toUpperCase() + phrase.slice(1)}</span>
                <span className="sm:hidden">{phrase.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        <div className={`${currentPhraseConfig.bgPattern} rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-blue-500/5 relative overflow-hidden border border-blue-200/50`}>
          <div className="absolute top-0 right-0 w-20 sm:w-32 md:w-64 h-20 sm:h-32 md:h-64 bg-blue-500/5 rounded-full blur-3xl -mr-8 sm:-mr-16 md:-mr-32 -mt-8 sm:-mt-16 md:-mt-32"></div>
          <div className="absolute bottom-0 left-0 w-16 sm:w-24 md:w-48 h-16 sm:h-24 md:h-48 bg-orange-500/5 rounded-full blur-3xl -ml-6 sm:-ml-12 md:-ml-24 -mb-6 sm:-mb-12 md:-mb-24"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 md:gap-3 mb-4 sm:mb-5 md:mb-8">
              <div className={`bg-gradient-to-r ${currentPhraseConfig.gradient} p-2 md:p-3 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg shadow-blue-500/20`}>
                <IconComponent className="w-4 h-4 md:w-8 md:h-8 text-white" />
              </div>
              <h2 className={`text-lg sm:text-2xl md:text-4xl font-bold bg-gradient-to-r ${currentPhraseConfig.gradient} bg-clip-text text-transparent`}>
                {selectedPhrase.charAt(0).toUpperCase() + selectedPhrase.slice(1)}
              </h2>
            </div>

            {groupedByPhrases[selectedPhrase].length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-6">
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
              <div className="text-center py-8 md:py-16 text-gray-500">
                <p className="text-xs sm:text-base md:text-lg font-medium">No products found in this category</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 sm:pt-6 md:pt-8 px-3 sm:px-4 md:px-8 max-w-7xl mx-auto mb-8 md:mb-20">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent mb-1 sm:mb-2 md:mb-3">Explore</h2>
          <p className="text-xs sm:text-base md:text-xl text-gray-600 font-medium">Discover our categories</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-6">
          {CATEGORIES.map((category) => {
            const representativeProduct = groupedByCategory[category][0];
            if (representativeProduct) {
              return (
                <ProductCard
                  key={representativeProduct._id}
                  product={representativeProduct}
                  onClick={() => handleProductClick(representativeProduct._id)}
                  onQuickBuy={handleQuickBuy}
                />
              );
            }
            return null;
          })}
        </div>
      </div>

      {featuredProducts.length > 0 && (
        <div className="pt-4 sm:pt-6 md:pt-8 px-3 sm:px-4 md:px-8 max-w-7xl mx-auto mb-8 md:mb-20">
          <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-10 shadow-2xl shadow-orange-500/5 overflow-hidden border border-orange-200/50">
            <div className="absolute top-0 left-0 w-full h-full opacity-5">
              <div className="absolute top-2 sm:top-5 md:top-10 left-2 sm:left-5 md:left-10 text-xl sm:text-3xl md:text-6xl">🎁</div>
              <div className="absolute top-5 sm:top-10 md:top-20 right-5 sm:right-10 md:right-20 text-lg sm:text-2xl md:text-5xl">🎀</div>
              <div className="absolute bottom-5 sm:bottom-10 md:bottom-20 left-1/4 text-base sm:text-2xl md:text-4xl">✨</div>
              <div className="absolute bottom-2 sm:bottom-5 md:bottom-10 right-1/3 text-xl sm:text-3xl md:text-6xl">🎁</div>
              <div className="absolute top-1/3 right-2 sm:right-5 md:right-10 text-lg sm:text-2xl md:text-5xl">🎉</div>
              <div className="absolute top-1/2 left-5 sm:left-10 md:left-20 text-base sm:text-xl md:text-4xl">🎊</div>
            </div>

            <div className="relative z-10">
              <div className="text-left mb-6 sm:mb-8 md:mb-12">
                <div className="inline-block">
                  <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-1 sm:mb-2 md:mb-3">
                    Find Featured Products
                  </h2>
                  <p className="text-xs sm:text-base md:text-xl text-gray-600 font-medium">For Every Occasion</p>
                  <div className="h-0.5 sm:h-1 md:h-1.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mt-2 sm:mt-3 md:mt-4 w-3/4"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-8">
                {featuredProducts.slice().map((product) => (
                  <FeaturedProductCard
                    key={product._id}
                    product={product}
                    onClick={() => handleProductClick(product._id)}
                    onQuickBuy={handleQuickBuy}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-3 sm:px-4 md:px-8 max-w-7xl mx-auto space-y-8 md:space-y-16 pb-10 md:pb-16">
        {CATEGORIES.map((category) => (
          groupedByCategory[category].length > 0 && (
            <div key={category} className={`relative ${categoryConfigs[category].gradient} rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-10 shadow-2xl shadow-blue-500/5 overflow-hidden border border-blue-200/50`}>
              <div className="absolute top-0 left-0 w-full h-full opacity-5">
                {categoryConfigs[category].decorations.map((dec, idx) => (
                  <div key={idx} className={`absolute ${dec.pos} text-lg sm:text-3xl md:text-5xl lg:text-6xl`}>{dec.emoji}</div>
                ))}
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4 sm:mb-5 md:mb-8">
                  <h2 className="text-xl sm:text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent capitalize">{category}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-5">
                  {groupedByCategory[category].slice(0, 8).map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onClick={() => handleProductClick(product._id)}
                      onQuickBuy={handleQuickBuy}
                    />
                  ))}
                </div>
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

      <footer className="w-full bg-gradient-to-r from-blue-500 via-orange-500 to-blue-500 text-white mt-10 md:mt-16 border-t border-blue-300/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-6 sm:py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6 md:mb-8">
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">About PrintMaania</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-blue-100">
                Committed to bringing you the finest Printing Service, sourced responsibly and crafted with care.
              </p>
            </div>

            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Quick Links</h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-white transition-colors text-blue-100">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-blue-100">Products</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-blue-100">Common Queries</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Contact Us</h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <p className="text-blue-100"><span className="font-medium text-white">Name:</span> Dr Owner</p>
                <p className="text-blue-100"><span className="font-medium text-white">Email:</span> printmaania92@gmail.com</p>
                <p className="text-blue-100"><span className="font-medium text-white">Phone:</span> +91 9063347447</p>
                <p className="text-blue-100"><span className="font-medium text-white">Address:</span> Vijayawada, Andhra Pradesh</p>
              </div>
            </div>
          </div>
          <div className="border-t border-blue-400/50 pt-3 sm:pt-4 md:pt-6 text-center text-xs sm:text-sm text-blue-200">
            &copy; 2025 PrintMaania. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;