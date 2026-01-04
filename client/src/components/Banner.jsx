import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import API_URL from '../apiConfig';

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // ១. បន្ថែមមុខងារត្រួតពិនិត្យ URL រូបភាព
  const getBannerUrl = (img) => {
    if (!img) return 'https://placehold.co/1200x600?text=No+Banner+Image';
    
    // បើជាប់ localhost ដូរទៅ API_URL (Render)
    if (typeof img === 'string' && img.includes('localhost:5000')) {
      return img.replace('http://localhost:5000', API_URL);
    }
    
    // បើជា path ខ្លី (ឧទាហរណ៍: uploads/banner1.jpg)
    if (typeof img === 'string' && !img.startsWith('http')) {
      return `${API_URL}/${img}`;
    }
    
    return img;
  };

  // ២. ទាញទិន្នន័យ Banner ពី Server
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_URL}/api/data`); 
        const data = await response.json();
        setBanners(data.banners || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching banners:", err);
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // ៣. មុខងារ Auto Slide
  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, banners]);

  const prevSlide = () => {
    setCurrentIndex(currentIndex === 0 ? banners.length - 1 : currentIndex - 1);
  };

  const nextSlide = () => {
    setCurrentIndex(currentIndex === banners.length - 1 ? 0 : currentIndex + 1);
  };

  if (loading) return <div className="w-full h-[300px] md:h-[450px] bg-slate-200 animate-pulse rounded-3xl"></div>;
  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden group">
      <div 
        className="flex w-full h-full transition-transform duration-700 ease-out" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={index} className="w-full h-full shrink-0 relative">
            {/* ៤. ប្រើ getBannerUrl នៅត្រង់ src */}
            <img 
              src={getBannerUrl(banner.image)} 
              alt={banner.title} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://placehold.co/1200x600?text=Image+Load+Failed'; }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center px-10 md:px-24">
              <div className="max-w-xl animate-in fade-in slide-in-from-left-10 duration-1000">
                <h2 className="text-white text-3xl md:text-6xl font-black drop-shadow-2xl leading-tight">
                  {banner.title}
                </h2>
                <button className="mt-6 bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-8 py-3 rounded-2xl font-black transition-all shadow-xl active:scale-95">
                  ទិញឥឡូវនេះ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Buttons & Indicators (ទុកនៅដដែល) */}
      <button onClick={prevSlide} className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white backdrop-blur-md p-3 rounded-full text-white hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:block">
        <ChevronLeft size={30} />
      </button>
      <button onClick={nextSlide} className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white backdrop-blur-md p-3 rounded-full text-white hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:block">
        <ChevronRight size={30} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {banners.map((_, index) => (
          <div 
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all cursor-pointer ${currentIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;