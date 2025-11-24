import { useRef, useEffect } from "react";
import { Tag, Star } from "lucide-react";

function InfiniteScrollOffers({ offers }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (offers.length === 0) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // Adjust speed (lower = slower, higher = faster)

    const animate = () => {
      if (scrollContainer) {
        scrollPosition += scrollSpeed;
        
        // Get the width of one set of offers
        const contentWidth = scrollContainer.scrollWidth / 2;
        
        // Reset position when we've scrolled past one complete set
        if (scrollPosition >= contentWidth) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      
      animationId = requestAnimationFrame(animate);
    };

    // Start animation
    animationId = requestAnimationFrame(animate);

    // Pause on hover
    const handleMouseEnter = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };

    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate);
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [offers.length]);

  if (offers.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-r from-blue-600 via-orange-600 to-blue-600 py-2 sm:py-3 shadow-lg shadow-blue-500/20 overflow-hidden">
      <div className="flex items-center max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center mr-2 sm:mr-4 flex-shrink-0">
          <Tag className="w-3 h-3 sm:w-5 sm:h-5 text-white mr-1 sm:mr-2" />
          <span className="text-white font-bold text-xs sm:text-sm whitespace-nowrap">OFFERS</span>
        </div>
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex space-x-4 sm:space-x-8">
            {/* Triple the offers for seamless infinite scroll */}
            {[...offers, ...offers, ...offers].map((offer, idx) => (
              <div key={idx} className="flex items-center space-x-2 flex-shrink-0">
                <Star className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-white fill-white" />
                <span className="text-white font-medium text-xs sm:text-sm whitespace-nowrap">
                  {offer.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfiniteScrollOffers;