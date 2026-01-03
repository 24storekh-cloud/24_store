import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // ១. ទាញទិន្នន័យពី Server
  useEffect(() => {
    fetch('http://localhost:5000/api/data')
      .then(res => res.json())
      .then(data => {
        setBanners(data.banners || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ២. មុខងារ Auto-slide (ប្តូររូបរាល់ ៥ វិនាទី)
  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, banners]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  if (loading || banners.length === 0) return null;

  return (
    <div className="relative w-full h-[300px] md:h-[600px] overflow-hidden group">
      {/* Container សម្រាប់រូបភាព */}
      <div 
        className="flex w-full h-full transition-transform duration-1000 ease-in-out" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((item, index) => (
          <div key={index} className="w-full h-full shrink-0 relative">
            <img 
              src={item.image} 
              className="w-full h-full object-cover object-center" 
              alt={item.title} 
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 flex items-center px-10 md:px-32">
              <div className="max-w-3xl">
                <h2 className="text-white text-3xl md:text-7xl font-black drop-shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
                  {item.title}
                </h2>
                <button className="mt-8 bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-2xl active:scale-95">
                  ទិញឥឡូវនេះ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ប៊ូតុង Next/Prev (បង្ហាញតែលើ PC) */}
      <button onClick={prevSlide} className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white backdrop-blur-md p-4 rounded-full text-white hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:block z-10">
        <ChevronLeft size={32} />
      </button>
      <button onClick={nextSlide} className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white backdrop-blur-md p-4 rounded-full text-white hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:block z-10">
        <ChevronRight size={32} />
      </button>

      {/* ចំណុច Indicators ខាងក្រោម */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {banners.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentIndex(i)}
            className={`transition-all duration-500 rounded-full ${currentIndex === i ? 'w-10 h-3 bg-blue-500' : 'w-3 h-3 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;