import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import API_URL from '../apiConfig';

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // ១. ទាញទិន្នន័យ Banner ពី Server
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

  // ២. មុខងារ Auto Slide (ប្តូររូបរាល់ ៥ វិនាទី)
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
      {/* បញ្ជីរូបភាព Banner */}
      <div 
        className="flex w-full h-full transition-transform duration-700 ease-out" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={index} className="w-full h-full shrink-0 relative">
            <img 
              src={banner.image} 
              alt={banner.title} 
              className="w-full h-full object-cover"
            />
            {/* ផ្ទៃងងឹតបន្តិចពីលើរូបភាព ដើម្បីឱ្យអក្សរងាយអាន */}
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

      {/* ប៊ូតុងបញ្ជាឆ្វេង-ស្តាំ (បង្ហាញតែពេលដាក់ Mouse ពីលើ) */}
      <button 
        onClick={prevSlide}
        className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white backdrop-blur-md p-3 rounded-full text-white hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:block"
      >
        <ChevronLeft size={30} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white backdrop-blur-md p-3 rounded-full text-white hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:block"
      >
        <ChevronRight size={30} />
      </button>

      {/* ចំណុចតូចៗខាងក្រោម (Indicators) */}
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