import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import '../styles/custom-scrollbar.css';

const ImageGallery = ({ images = [], title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  const openLightbox = (index) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Main Gallery Layout */}
      <div className="flex gap-4 h-[400px] md:h-[550px]">
        {/* Main Large Image - moved to the right */}
        <div className="flex-1 relative order-2 md:order-1">
          <motion.div 
            className="w-full h-full relative group cursor-pointer overflow-hidden rounded-2xl"
            whileHover={{ scale: 1.01 }}
            onClick={() => openLightbox(0)}
          >
            <img 
              src={images[0]} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <Maximize2 size={20} className="text-gray-800" />
            </button>
          </motion.div>
        </div>

        {/* Thumbnail Strip - horizontal scrolling */}
        <div className="w-24 md:w-32 order-1 md:order-2">
          <div className="h-full overflow-y-auto overflow-x-hidden space-y-2 custom-scrollbar">
            {images.map((img, idx) => (
              <motion.div 
                key={idx}
                className={`relative group cursor-pointer overflow-hidden rounded-xl flex-shrink-0 ${
                  idx === 0 ? 'ring-2 ring-primary' : ''
                }`}
                whileHover={{ scale: 1.02 }}
                onClick={() => openLightbox(idx)}
              >
                <img 
                  src={img} 
                  alt={`${title} - ${idx + 1}`} 
                  className="w-full h-20 md:h-24 object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                {idx === 0 && (
                  <div className="absolute top-1 left-1 bg-primary text-white text-xs px-1 py-0.5 rounded">
                    Main
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4 md:p-8"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-white hover:bg-white/10 p-2 rounded-full transition-colors z-[210]"
            >
              <X size={32} />
            </button>

            <div className="relative w-full max-w-6xl aspect-[16/9] flex items-center justify-center bg-black/40 rounded-3xl overflow-hidden shadow-2xl">
              <button 
                onClick={prevSlide}
                className="absolute left-6 text-white bg-black/20 hover:bg-black/40 p-3 rounded-full transition-all z-[220] backdrop-blur-md border border-white/10 hidden md:block"
              >
                <ChevronLeft size={48} />
              </button>

              <div className="w-full h-full flex items-center justify-center">
                <motion.img 
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  src={images[activeIndex]}
                  className="w-full h-full object-contain"
                />
              </div>

              <button 
                onClick={nextSlide}
                className="absolute right-6 text-white bg-black/20 hover:bg-black/40 p-3 rounded-full transition-all z-[220] backdrop-blur-md border border-white/10 hidden md:block"
              >
                <ChevronRight size={48} />
              </button>
            </div>

            {/* Lightbox Thumbnails */}
            <div className="absolute bottom-8 flex gap-3 overflow-x-auto p-4 max-w-[90%] no-scrollbar">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveIndex(i)}
                  className={`relative w-20 h-14 md:w-28 md:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${
                    activeIndex === i ? 'border-primary scale-110 shadow-2xl shadow-primary/20' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  <img 
                    src={img} 
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>

            <div className="absolute top-8 left-8 text-white/70 text-sm font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              {activeIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ImageGallery;
