import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import API_URL from '../apiConfig';

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // ១. កែសម្រួល Function លាង URL ឱ្យកាន់តែសុវត្ថិភាព (Handle Slash /)
  const getBannerUrl = (img) => {
    if (!img) return 'https://placehold.co/1200x600?text=No+Banner+Image';
    
    // បើជា Base64 ឱ្យបង្ហាញផ្ទាល់
    if (typeof img === 'string' && img.startsWith('data:')) return img;

    if (typeof img === 'string' && img.includes('localhost:5000')) {
      return img.replace('http://localhost:5000', API_URL);
    }
    
    if (typeof img === 'string' && !img.startsWith('http')) {
      const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
      const cleanPath = img.startsWith('/') ? img.slice(1) : img;
      return `${baseUrl}/${cleanPath}`;
    }
    
    return img;
  };

  // ២. ប្រើ useCallback សម្រាប់ nextSlide ដើម្បីកុំឱ្យជាន់គ្នាជាមួយ useEffect
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  }, [banners.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  // ៣. Fetch Data
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_URL}/api/data`); 
        const data = await response.json();
        // ប្រាកដថាទិន្នន័យជា Array
        setBanners(data.banners || []);
      } catch (err) {
        console.error("Error fetching banners:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // ៤. Auto Slide (កែសម្រួល Logic កុំឱ្យ Reset ខុសពេល)
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [nextSlide, banners.length]);

  if (loading) return <div className="w-full h-[300px] md:h-[500px] bg-slate-200 animate-pulse rounded-3xl mb-8"></div>;
  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden group rounded-[2.5rem] mb-8">
      <div 
        className="flex w-full h-full transition-transform duration-1000 ease-in-out" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={index} className="w-full h-full shrink-0 relative">
            <img 
              src={getBannerUrl(banner.image)} 
              alt={banner.title || "Banner"} 
              className="w-full h-full object-cover"
              onError={(e) => { 
                if (e.target.src !== 'https://placehold.co/1200x600?text=Image+Load+Failed') {
                  e.target.src = 'https://placehold.co/1200x600?text=Image+Load+Failed'; 
                }
              }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex items-center px-10 md:px-24">
              <div className={`max-w-xl transition-all duration-1000 ${currentIndex === index ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                <h2 className="text-white text-3xl md:text-6xl font-black drop-shadow-2xl leading-tight mb-6">
                  {banner.title}
                </h2>
                <button className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-8 py-3 rounded-2xl font-black transition-all shadow-xl active:scale-95">
                  ទិញឥឡូវនេះ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button onClick={prevSlide} className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white backdrop-blur-md p-3 rounded-full text-white hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:block z-10">
        <ChevronLeft size={30} />
      </button>
      <button onClick={nextSlide} className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white backdrop-blur-md p-3 rounded-full text-white hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:block z-10">
        <ChevronRight size={30} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {banners.map((_, index) => (
          <div 
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full transition-all cursor-pointer ${currentIndex === index ? 'w-10 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;