import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import API_URL from '../apiConfig';

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // ១. កែសម្រួលការទាញរូបភាពឱ្យត្រូវជាមួយ Server ថ្មី
  const getBannerUrl = (img) => {
    if (!img) return 'https://placehold.co/1200x600?text=No+Banner+Image';
    
    // បើជា Base64
    if (typeof img === 'string' && img.startsWith('data:')) return img;

    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

    // បើ URL មាន localhost:5000 រួចហើយ ត្រូវប្តូរទៅជា API_URL ពិត
    if (typeof img === 'string' && img.includes('localhost:5000')) {
      return img.replace('http://localhost:5000', baseUrl);
    }

    // បើជា Path ធម្មតា (ឧទាហរណ៍: banners/image.jpg)
    if (typeof img === 'string' && !img.startsWith('http')) {
      const cleanPath = img.startsWith('/') ? img.slice(1) : img;
      
      // ប្រាកដថាវាចង្អុលទៅ Folder ត្រឹមត្រូវ (uploads/banners/...)
      // ប្រសិនបើ Server រក្សាទុកក្នុង uploads/banners រួចហើយ វានឹងមិនថែមដដែលៗទេ
      const finalPath = cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;
      return `${baseUrl}/${finalPath}`;
    }
    
    return img;
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  }, [banners.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_URL}/api/data`); 
        const data = await response.json();
        // ទាញយកតែបដា (Banners) ពី JSON
        setBanners(data.banners || []);
      } catch (err) {
        console.error("Error fetching banners:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [nextSlide, banners.length]);

  if (loading) return <div className="w-full h-[250px] md:h-[450px] bg-slate-200 animate-pulse rounded-[2rem] mb-8 container mx-auto px-4"></div>;
  if (banners.length === 0) return null;

  return (
    <div className="container mx-auto px-4 mb-8">
      <div className="relative w-full h-[200px] md:h-[450px] overflow-hidden group rounded-[2rem] shadow-lg">
        <div 
          className="flex w-full h-full transition-transform duration-700 ease-out" 
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div key={index} className="w-full h-full shrink-0 relative">
              <img 
                src={getBannerUrl(banner.image)} 
                alt={banner.title} 
                className="w-full h-full object-cover"
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = 'https://placehold.co/1200x600?text=Banner+Not+Found';
                }}
              />
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        {banners.length > 1 && (
          <>
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white backdrop-blur-md p-2 rounded-full text-white hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:block z-10">
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white backdrop-blur-md p-2 rounded-full text-white hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:block z-10">
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button 
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all ${currentIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;