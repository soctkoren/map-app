import React from 'react';

// Collection of beautiful outdoor/landscape images from Unsplash
export const backgrounds = [
  {
    url: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7',
    credit: 'Nathan Anderson',
    description: 'Mountain camping at night'
  },
  {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
    credit: 'Kalen Emsley',
    description: 'Mountain peaks and clouds'
  },
  {
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    credit: 'Benjamin Voros',
    description: 'Starry night over mountains'
  },
  {
    url: 'https://images.unsplash.com/photo-1511497584788-876760111969',
    credit: 'Fabian Quintero',
    description: 'Northern lights over mountains'
  }
];

interface BackgroundGalleryProps {
  onSelect: (background: typeof backgrounds[0]) => void;
  currentUrl?: string;
}

const BackgroundGallery: React.FC<BackgroundGalleryProps> = ({ onSelect, currentUrl }) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-xl p-2 flex gap-2 z-50">
      {backgrounds.map((bg) => (
        <button
          key={bg.url}
          onClick={() => onSelect(bg)}
          className={`w-12 h-12 rounded-lg overflow-hidden transition-all ${
            currentUrl === bg.url ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'
          }`}
          title={`${bg.description} by ${bg.credit}`}
        >
          <img
            src={`${bg.url}?auto=format&fit=crop&w=100&q=60`}
            alt={bg.description}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
};

export default BackgroundGallery; 