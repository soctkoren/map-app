import { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import './ScreenshotControl.css';

interface PosterSize {
  name: string;
  width: number;  // inches
  height: number; // inches
}

const POSTER_SIZES: PosterSize[] = [
  { name: '8x10"', width: 8, height: 10 },
  { name: '11x14"', width: 11, height: 14 },
  { name: '16x20"', width: 16, height: 20 },
  { name: '18x24"', width: 18, height: 24 },
  { name: '24x36"', width: 24, height: 36 }
];

const DPI = 300;

const ScreenshotControl = () => {
  const [selectedSize, setSelectedSize] = useState<PosterSize>(POSTER_SIZES[0]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const map = useMap();

  // Update map container size based on selected print size
  useEffect(() => {
    const aspectRatio = selectedSize.width / selectedSize.height;
    const container = map.getContainer();
    const parentHeight = container.parentElement?.clientHeight || window.innerHeight;
    
    // Calculate the maximum size that fits in the viewport while maintaining aspect ratio
    let width, height;
    const maxWidth = window.innerWidth * 0.8;  // 80% of viewport width
    const maxHeight = parentHeight * 0.8;      // 80% of viewport height
    
    if (maxWidth / maxHeight > aspectRatio) {
      // Height limited
      height = maxHeight;
      width = height * aspectRatio;
    } else {
      // Width limited
      width = maxWidth;
      height = width / aspectRatio;
    }

    // Update container size
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.margin = 'auto';
    container.style.position = 'absolute';
    container.style.left = '50%';
    container.style.top = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.border = '1px solid #ccc';

    // Force map to update its size
    map.invalidateSize();
  }, [map, selectedSize]);

  const takeScreenshot = async () => {
    try {
      setIsCapturing(true);
      
      // Calculate pixel dimensions
      const pixelWidth = selectedSize.width * DPI;
      const pixelHeight = selectedSize.height * DPI;

      // Get the current map state
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bounds = map.getBounds();

      // Create a temporary map container
      const container = document.createElement('div');
      container.style.width = `${pixelWidth}px`;
      container.style.height = `${pixelHeight}px`;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      document.body.appendChild(container);

      // Create a clean map instance
      const tempMap = L.map(container, {
        center: center,
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
      });

      // Add a clean tile layer
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: ''
      }).addTo(tempMap);

      // Wait for all tiles to load
      await new Promise<void>((resolve) => {
        let tilesLoading = 0;
        let tilesLoaded = 0;

        const checkAllLoaded = () => {
          if (tilesLoaded === tilesLoading && tilesLoading > 0) {
            resolve();
          }
        };

        tileLayer.on('loading', () => {
          tilesLoading++;
        });

        tileLayer.on('load', () => {
          tilesLoaded++;
          checkAllLoaded();
        });

        tempMap.fitBounds(bounds);
        
        // Fallback resolution in case no tiles need loading
        setTimeout(() => {
          if (tilesLoading === 0) {
            resolve();
          }
        }, 1000);
      });

      // Additional wait to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use html2canvas to capture the map
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(container, {
        useCORS: true,
        allowTaint: true,
        width: pixelWidth,
        height: pixelHeight,
        scale: 1,
        backgroundColor: null,
        logging: false
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `map_${selectedSize.width}x${selectedSize.height}_${DPI}dpi.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      // Cleanup
      tempMap.remove();
      document.body.removeChild(container);
    } catch (error) {
      console.error('Error taking screenshot:', error);
      alert('Error taking screenshot. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="screenshot-controls">
      <button 
        className="screenshot-button"
        onClick={() => setShowSizeSelector(!showSizeSelector)}
      >
        Print Size
      </button>
      
      {showSizeSelector && (
        <div className="size-selector">
          <div className="size-options">
            {POSTER_SIZES.map((size) => (
              <button
                key={size.name}
                className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <button 
        className="screenshot-button capture"
        onClick={() => takeScreenshot()}
        disabled={isCapturing}
      >
        {isCapturing ? 'Capturing...' : 'Capture'}
      </button>
    </div>
  );
};

export default ScreenshotControl; 