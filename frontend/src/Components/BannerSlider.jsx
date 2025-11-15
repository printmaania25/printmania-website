// src/components/BannerSlider.jsx
function BannerSlider() {
  // One default banner for now, static
  const defaultBanner = {
    desktop: "/default-banner-desktop.jpg", // Replace with actual image
    mobile: "/default-banner-mobile.jpg",
    title: "Make this Festive Season Truly Yours! Celebrate Christmas & New Year 2026 with Personalized Products.",
  };

  return (
    <div className="relative w-full h-96 bg-cover bg-center" style={{ backgroundImage: `url(${defaultBanner.desktop})` }}>
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">{defaultBanner.title}</h1>
          {/* Add CTA button if needed */}
        </div>
      </div>
    </div>
  );
}

export default BannerSlider;