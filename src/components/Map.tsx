import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import type { PosterSize, TextOverlay, TextStyle, MapStyle } from '../types';
import html2canvas from 'html2canvas';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import MapControls from './MapControls';

const DEFAULT_CENTER: L.LatLngTuple = [51.505, -0.09];
const DEFAULT_ZOOM = 13;

// Add constants for center snapping
const SNAP_THRESHOLD = 20; // Pixels from center to trigger snapping
const CENTER_GUIDE_COLOR = 'rgba(0, 120, 255, 0.6)'; // Semi-transparent blue

// Collection of beautiful nature backgrounds from Unsplash
const NATURE_BACKGROUNDS = [
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
  },
  {
    url: 'https://images.unsplash.com/photo-1682686580391-615b1f28e5ee',
    credit: 'Marek Piwnicki',
    description: 'Misty mountain valley'
  },
  {
    url: 'https://images.unsplash.com/photo-1682686580186-b55d0f3d8e6d',
    credit: 'Jonatan Pie',
    description: 'Aurora over mountains'
  }
];

// Function to get a random background
const getRandomBackground = () => {
  const randomIndex = Math.floor(Math.random() * NATURE_BACKGROUNDS.length);
  return NATURE_BACKGROUNDS[randomIndex];
};

// Function to load Google Font
const loadGoogleFont = async (fontFamily: string) => {
  try {
    // Create a new link element for the font
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Create a span to test font loading
    const testSpan = document.createElement('span');
    testSpan.style.fontFamily = fontFamily;
    testSpan.style.position = 'absolute';
    testSpan.style.visibility = 'hidden';
    testSpan.textContent = 'Test Font Loading';
    document.body.appendChild(testSpan);

    // Wait for font to load with timeout
    await Promise.race([
      document.fonts.load(`700 16px "${fontFamily}"`),
      document.fonts.load(`400 16px "${fontFamily}"`),
      new Promise(resolve => setTimeout(resolve, 3000)) // 3s timeout
    ]);

    // Cleanup test span
    document.body.removeChild(testSpan);
  } catch (error) {
    console.error(`Error loading font ${fontFamily}:`, error);
  }
};

// Available Google Fonts
export const AVAILABLE_FONTS = [
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Raleway',
  'Poppins',
  'Playfair Display',
  'Source Sans Pro',
  'ABeeZee'
];

// Available map styles from OpenMapTiles
export const MAP_STYLES: MapStyle[] = [
  {
    name: 'OSM Default',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  {
    name: 'OSM Bright',
    url: 'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  },
  {
    name: 'Dark Matter',
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  },
  {
    name: 'Positron',
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  }
];

// Component to handle map instance operations
const MapOperations: React.FC<{ onMapReady: (map: L.Map) => void }> = ({ onMapReady }) => {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  return null;
};

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  textId: string;
  textX: number;
  textY: number;
  offsetX: number;
  offsetY: number;
}

interface MapControlsProps {
  onAddText: (text: string, style: TextStyle) => void;
  onUpdateText: (id: string, text: string, style: TextStyle) => void;
  onDeleteText: (id: string) => void;
  textOverlays: TextOverlay[];
  selectedPosterSize: PosterSize;
  onPosterSizeChange: (size: PosterSize) => void;
  onCapture: () => Promise<void>;
  mapStyles: MapStyle[];
  selectedMapStyle: MapStyle;
  onMapStyleChange: (style: MapStyle) => void;
  currentBackground: { url: string; credit: string; description: string };
  onBackgroundChange: (background: { url: string; credit: string; description: string }) => void;
  onLocationChange: (lat: number, lng: number) => void;
}

const Map: React.FC = () => {
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedPosterSize, setSelectedPosterSize] = useState<PosterSize>({
    name: '18x24"',
    width: 18,
    height: 24,
    pixelWidth: 5400,
    pixelHeight: 7200
  });
  const [selectedMapStyle, setSelectedMapStyle] = useState<MapStyle>(
    MAP_STYLES.find(style => style.name === 'Positron') || MAP_STYLES[0]
  );
  const [currentBackground] = useState(getRandomBackground());
  const [viewportStyle, setViewportStyle] = useState({
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%'
  });
  const [isCapturing, setIsCapturing] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const printViewportRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const dragStateRef = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    textId: '',
    textX: 0,
    textY: 0,
    offsetX: 0,
    offsetY: 0
  });
  const [showCenterGuides, setShowCenterGuides] = useState<{x: boolean, y: boolean}>({ x: false, y: false });

  useEffect(() => {
    const updateViewportSize = () => {
      const container = document.querySelector('.map-container');
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const aspectRatio = selectedPosterSize.width / selectedPosterSize.height;

      let width, height;
      if (containerWidth / containerHeight > aspectRatio) {
        height = containerHeight * 0.9;
        width = height * aspectRatio;
      } else {
        width = containerWidth * 0.9;
        height = width / aspectRatio;
      }

      setViewportStyle({
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: '100%',
        maxHeight: '100%'
      });
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, [selectedPosterSize]);

  const handleMapReady = (map: L.Map) => {
    mapInstanceRef.current = map;
  };

  const calculateScaledFontSize = (fontSize: number): number => {
    if (!printViewportRef.current) return fontSize;
    
    const viewportWidth = printViewportRef.current.clientWidth;
    // Base the scaling on a reference width of 1000px
    const scaleFactor = viewportWidth / 1000;
    return fontSize * scaleFactor;
  };

  const handleAddText = (text: string, style: TextStyle) => {
    const viewport = printViewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const newText: TextOverlay = {
      id: Date.now().toString(),
      text: style.isSvg ? '' : (text || ''),
      x: rect.width / 2,  // Center horizontally
      y: style.isSvg ? rect.height / 2 : rect.height * 0.8,  // Place icons in center, text near bottom
      fontSize: style.fontSize || (style.isEmoji ? 48 : 100),
      color: style.color || '#0066FF',  // Default to blue for icons
      rotation: style.rotation || 0,
      fontFamily: style.fontFamily || 'Roboto',
      isEmoji: style.isEmoji || false,
      isSvg: style.isSvg || false,
      svgPath: style.isSvg ? text : undefined
    };

    setTextOverlays(prevOverlays => [...prevOverlays, newText]);

    // Select the newly added overlay for editing
    if (style.isSvg) {
      setDraggingId(newText.id);
    }
  };

  const handleUpdateText = (id: string, text: string, style: TextStyle) => {
    setTextOverlays(overlays =>
      overlays.map(overlay =>
        overlay.id === id
          ? {
              ...overlay,
              text: style.isSvg ? overlay.text : text,
              svgPath: style.isSvg ? text : overlay.svgPath,
              fontSize: style.fontSize,
              color: style.color,
              rotation: style.rotation,
              fontFamily: style.fontFamily
            }
          : overlay
      )
    );
  };

  const handleDeleteText = (id: string) => {
    setTextOverlays(overlays => overlays.filter(overlay => overlay.id !== id));
  };

  const handlePosterSizeChange = (size: PosterSize) => {
    setSelectedPosterSize(size);
  };

  const handleMapStyleChange = (style: MapStyle) => {
    setSelectedMapStyle(style);
  };

  // Function to check if a position is near the center
  const isNearCenter = (pos: number, center: number): boolean => {
    return Math.abs(pos - center) < SNAP_THRESHOLD;
  };

  // Function to get snapped position
  const getSnappedPosition = (pos: number, center: number): number => {
    return isNearCenter(pos, center) ? center : pos;
  };

  const handleMouseDown = (e: React.MouseEvent, overlay: TextOverlay) => {
    e.preventDefault();
    const rect = printViewportRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate the initial offset between mouse and element center
    const offsetX = e.clientX - rect.left - overlay.x;
    const offsetY = e.clientY - rect.top - overlay.y;
    
    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      textId: overlay.id,
      textX: overlay.x,
      textY: overlay.y,
      offsetX,
      offsetY
    };

    setDraggingId(overlay.id);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragStateRef.current.isDragging || !printViewportRef.current) return;

    const rect = printViewportRef.current.getBoundingClientRect();
    
    // Calculate new position accounting for the initial offset
    let newX = e.clientX - rect.left - dragStateRef.current.offsetX;
    let newY = e.clientY - rect.top - dragStateRef.current.offsetY;

    // Find the overlay being dragged
    const overlay = textOverlays.find(o => o.id === dragStateRef.current.textId);
    if (!overlay) return;

    // Only apply snapping to text layers (not SVG icons)
    if (!overlay.isSvg) {
      // Center snapping
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (Math.abs(newX - centerX) < SNAP_THRESHOLD) {
        newX = centerX;
        setShowCenterGuides(prev => ({ ...prev, x: true }));
      } else {
        setShowCenterGuides(prev => ({ ...prev, x: false }));
      }

      if (Math.abs(newY - centerY) < SNAP_THRESHOLD) {
        newY = centerY;
        setShowCenterGuides(prev => ({ ...prev, y: true }));
      } else {
        setShowCenterGuides(prev => ({ ...prev, y: false }));
      }
    }

    // Update the overlay position
    setTextOverlays(overlays =>
      overlays.map(o =>
        o.id === dragStateRef.current.textId
          ? { ...o, x: newX, y: newY }
          : o
      )
    );
  };

  const handleMouseUp = () => {
    dragStateRef.current.isDragging = false;
    setDraggingId(null);
    setShowCenterGuides({ x: false, y: false });
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Load fonts when component mounts
  useEffect(() => {
    AVAILABLE_FONTS.forEach(loadGoogleFont);
  }, []);

  const handleCapture = async () => {
    if (!printViewportRef.current || !mapInstanceRef.current) return;
    setIsCapturing(true);

    try {
      // Wait for capturing class transition (which removes rounded corners)
      await new Promise(resolve => setTimeout(resolve, 300));

      // Pre-load all fonts before capture
      const uniqueFonts = [...new Set(textOverlays.map(overlay => overlay.fontFamily))];
      await Promise.all(uniqueFonts.map(loadGoogleFont));

      // Additional wait to ensure fonts are applied
      await new Promise(resolve => setTimeout(resolve, 100));

      const viewport = printViewportRef.current;
      const map = mapInstanceRef.current;
      const { pixelWidth, pixelHeight } = selectedPosterSize;

      // Calculate the scale factor
      const viewportRect = viewport.getBoundingClientRect();
      const scale = pixelWidth / viewportRect.width;

      // Configure html2canvas options for high DPI
      const canvas = await html2canvas(viewport, {
        scale,
        width: viewportRect.width,
        height: viewportRect.height,
        backgroundColor: null,
        logging: true,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Hide UI elements and remove rounded corners in the cloned document
          const clonedViewport = clonedDoc.querySelector('.print-viewport') as HTMLElement;
          if (clonedViewport) {
            // Remove rounded corners from cloned viewport
            clonedViewport.style.borderRadius = '0';
            clonedViewport.style.overflow = 'hidden';

            // Also remove rounded corners from the map container
            const mapContainer = clonedViewport.querySelector('.leaflet-container') as HTMLElement;
            if (mapContainer) {
              mapContainer.style.borderRadius = '0';
            }

            // Hide controls
            const controls = clonedViewport.querySelectorAll('.leaflet-control, .print-size-indicator');
            controls.forEach((control) => {
              (control as HTMLElement).style.display = 'none';
            });

            // Scale text overlays and preserve font properties
            const texts = clonedViewport.querySelectorAll('text');
            texts.forEach((text) => {
              const textElement = text as SVGTextElement;
              const x = parseFloat(textElement.getAttribute('x') || '0');
              const y = parseFloat(textElement.getAttribute('y') || '0');
              
              const overlay = textOverlays.find(o => 
                o.text === textElement.textContent &&
                Math.abs(o.x - x) < 1 &&
                Math.abs(o.y - y) < 1
              );
              
              if (overlay) {
                const fontSize = parseFloat(textElement.getAttribute('font-size') || '24');
                
                // Apply font properties more aggressively
                const fontFamily = `"${overlay.fontFamily}", ${overlay.fontFamily}, sans-serif`;
                textElement.setAttribute('font-size', `${fontSize * scale}px`);
                textElement.setAttribute('font-family', fontFamily);
                textElement.style.setProperty('font-family', fontFamily, 'important');
                
                // Force font rendering
                textElement.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
                textElement.style.setProperty('text-rendering', 'optimizeLegibility', 'important');
                
                // Ensure other properties are preserved
                textElement.setAttribute('fill', overlay.color);
                textElement.style.setProperty('transform', `rotate(${overlay.rotation}deg)`, 'important');
                textElement.style.setProperty('text-anchor', 'middle', 'important');
                textElement.style.setProperty('dominant-baseline', 'middle', 'important');
                
                console.log('Applying font:', fontFamily, 'to text:', overlay.text);
              } else {
                console.warn('No matching overlay found for text:', textElement.textContent);
              }
            });
          }
        }
      });

      // Create a download link
      const link = document.createElement('a');
      link.download = `map_${selectedPosterSize.name.replace(/['"]/g, '')}_${pixelWidth}x${pixelHeight}_300dpi.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error capturing map:', error);
    } finally {
      // Restore rounded corners by removing capturing class
      setIsCapturing(false);
    }
  };

  // Function to render center guides
  const renderCenterGuides = () => {
    if (!printViewportRef.current) return null;
    const viewport = printViewportRef.current;
    const width = viewport.clientWidth;
    const height = viewport.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    return (
      <>
        {/* Vertical center guide */}
        {showCenterGuides.x && (
          <line
            x1={centerX}
            y1={0}
            x2={centerX}
            y2={height}
            stroke={CENTER_GUIDE_COLOR}
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        )}
        {/* Horizontal center guide */}
        {showCenterGuides.y && (
          <line
            x1={0}
            y1={centerY}
            x2={width}
            y2={centerY}
            stroke={CENTER_GUIDE_COLOR}
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        )}
      </>
    );
  };

  // Update the background image with proper query parameters
  const backgroundUrl = `${currentBackground.url}?auto=format&fit=crop&w=2000&q=80`;

  const handleLocationChange = (lat: number, lng: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 13);
    }
  };

  return (
    <div className="map-page">
      <div className="social-buttons">
        <a href="https://www.linkedin.com/in/jonnykvids/" target="_blank" rel="noopener noreferrer" className="profile-link">
          <img src="/me.jpeg" alt="Profile" className="profile-image" />
        </a>
        <a href="https://www.paypal.com/donate/?business=W7PELRRREYBSU&no_recurring=0&item_name=That%27s+for+supporting+my+Youtube+Channel&currency_code=USD" target="_blank" rel="noopener noreferrer" className="donate-button">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 01.39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 01-.169.364zm-6.159 3.9c-.862.37-1.84.788-3.109.788a5.884 5.884 0 01-1.569-.217l.877 9.004c.065.78.717 1.38 1.5 1.38 0 0 1.243.065 1.658.065.447 0 1.786-.065 1.786-.065.783 0 1.434-.6 1.499-1.38l.94-9.95a3.996 3.996 0 00-1.322-.238c-.826 0-1.491.284-2.26.613z" fill="currentColor"/>
          </svg>
        </a>
        <a href="https://www.youtube.com/@jonnykvids" target="_blank" rel="noopener noreferrer" className="youtube-button">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/>
          </svg>
        </a>
      </div>
      <div 
        className="map-container"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)),
            url('${backgroundUrl}')`
        }}
      >
        <div
          className={`print-viewport ${isCapturing ? 'capturing' : ''}`}
          ref={printViewportRef}
          style={viewportStyle}
        >
          <div 
            className={`help-tooltip ${isCapturing ? 'capturing' : ''}`}
            data-tooltip="Welcome to Momenti Maps! 👋

🗺️ Getting Started:
1. Search for your location in the search bar
2. Choose your preferred map style
3. Add text or icons to your map
4. Customize size, color, and rotation
5. Drag elements to position them

💡 Pro Tips:
• Text will snap to center when dragged near
• Use the size slider to adjust text/icon scale
• Try different map styles for unique looks
• Choose from various poster sizes

📸 When you're done:
Click 'Capture Map' to download your creation!"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" fill="currentColor"/>
            </svg>
          </div>

          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ width: '100%', height: '100%' }}
          >
            <MapOperations onMapReady={handleMapReady} />
            <TileLayer
              attribution={selectedMapStyle.attribution}
              url={selectedMapStyle.url}
            />
            <svg 
              className="text-overlay-container" 
              style={{ 
                width: '100%', 
                height: '100%', 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                pointerEvents: 'none',
                overflow: 'visible',
                zIndex: 1000
              }}
              viewBox={`0 0 ${printViewportRef.current?.clientWidth || 100} ${printViewportRef.current?.clientHeight || 100}`}
            >
              {renderCenterGuides()}
              
              {textOverlays.map((overlay) => (
                overlay.isSvg ? (
                  <g
                    key={overlay.id}
                    transform={`translate(${overlay.x}, ${overlay.y})`}
                    style={{
                      cursor: 'move',
                      pointerEvents: 'auto'
                    }}
                    onMouseDown={(e) => handleMouseDown(e, overlay)}
                    onContextMenu={handleContextMenu}
                  >
                    <path
                      d={overlay.svgPath}
                      fill={overlay.color}
                      className={draggingId === overlay.id ? 'dragging' : ''}
                      style={{
                        transformOrigin: 'center bottom',
                        transform: `rotate(${overlay.rotation}deg) scale(${overlay.fontSize / 24})`,
                        transformBox: 'fill-box'
                      }}
                    />
                  </g>
                ) : (
                  <text
                    key={overlay.id}
                    x={overlay.x}
                    y={overlay.y}
                    fontSize={calculateScaledFontSize(overlay.fontSize)}
                    fill={overlay.color}
                    className={`${draggingId === overlay.id ? 'dragging' : ''} ${overlay.isEmoji ? 'emoji-layer' : ''}`}
                    style={{
                      transform: `rotate(${overlay.rotation}deg)`,
                      transformBox: 'fill-box',
                      transformOrigin: '50% 50%',
                      cursor: 'move',
                      userSelect: 'none',
                      fontFamily: overlay.isEmoji ? 'sans-serif' : overlay.fontFamily,
                      dominantBaseline: 'middle',
                      textAnchor: 'middle',
                      pointerEvents: 'auto'
                    }}
                    onMouseDown={(e) => handleMouseDown(e, overlay)}
                    onContextMenu={handleContextMenu}
                  >
                    {overlay.text}
                  </text>
                )
              ))}
            </svg>
          </MapContainer>
        </div>
      </div>
      <MapControls
        onAddText={handleAddText}
        onUpdateText={handleUpdateText}
        onDeleteText={handleDeleteText}
        textOverlays={textOverlays}
        selectedPosterSize={selectedPosterSize}
        onPosterSizeChange={handlePosterSizeChange}
        onCapture={handleCapture}
        mapStyles={MAP_STYLES}
        selectedMapStyle={selectedMapStyle}
        onMapStyleChange={handleMapStyleChange}
        onLocationChange={handleLocationChange}
      />
    </div>
  );
};

export default Map; 