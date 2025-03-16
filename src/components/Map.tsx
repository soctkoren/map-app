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
    textY: 0
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
      text: text || '',
      x: rect.width / 2,
      y: rect.height * 0.8, // Position at 80% of height (20% from bottom)
      fontSize: style?.fontSize || 100,
      color: style?.color || '#000000',
      rotation: style?.rotation || 0,
      fontFamily: style?.fontFamily || 'Roboto'
    };

    setTextOverlays([...textOverlays, newText]);
  };

  const handleUpdateText = (id: string, text: string, style: TextStyle) => {
    setTextOverlays(overlays =>
      overlays.map(overlay =>
        overlay.id === id
          ? {
              ...overlay,
              text,
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
    const target = e.currentTarget as SVGTextElement;
    
    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      textId: overlay.id,
      textX: overlay.x,
      textY: overlay.y
    };

    setDraggingId(overlay.id);

    // Add event listeners for drag and drop
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragStateRef.current.isDragging || !printViewportRef.current) return;

    const viewport = printViewportRef.current;
    const rect = viewport.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;

    // Calculate new positions
    let newX = dragStateRef.current.textX + dx;
    let newY = dragStateRef.current.textY + dy;

    // Check if near center lines and snap if needed
    const nearCenterX = isNearCenter(newX, centerX);
    const nearCenterY = isNearCenter(newY, centerY);

    // Update guide visibility
    setShowCenterGuides({
      x: nearCenterX,
      y: nearCenterY
    });

    // Snap to center if near
    if (nearCenterX) newX = centerX;
    if (nearCenterY) newY = centerY;

    setTextOverlays(overlays =>
      overlays.map(overlay =>
        overlay.id === dragStateRef.current.textId
          ? {
              ...overlay,
              x: newX,
              y: newY
            }
          : overlay
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
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url={selectedMapStyle.url}
              attribution={selectedMapStyle.attribution}
            />
            <MapOperations onMapReady={handleMapReady} />
          </MapContainer>

          <div className="map-info-tooltip" role="tooltip" aria-label="How to use">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm2-1.645A3.502 3.502 0 0012 6.5a3.501 3.501 0 00-3.433 2.813l1.962.393A1.5 1.5 0 1112 11.5a1 1 0 00-1 1V14h2v-.645z" fill="currentColor"/>
            </svg>
          </div>

          <svg 
            className="text-overlay-container" 
            style={{ 
              width: '100%', 
              height: '100%', 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              pointerEvents: 'none',
              overflow: 'visible'
            }}
          >
            {/* Render center guides */}
            {renderCenterGuides()}
            
            {textOverlays.map((overlay) => (
              <text
                key={overlay.id}
                x={overlay.x}
                y={overlay.y}
                fontSize={calculateScaledFontSize(overlay.fontSize)}
                fill={overlay.color}
                className={draggingId === overlay.id ? 'dragging' : ''}
                style={{
                  transform: `rotate(${overlay.rotation}deg)`,
                  transformBox: 'fill-box',
                  transformOrigin: '50% 50%',
                  cursor: 'move',
                  userSelect: 'none',
                  fontFamily: overlay.fontFamily,
                  dominantBaseline: 'middle',
                  textAnchor: 'middle',
                  pointerEvents: 'auto'
                }}
                onMouseDown={(e) => handleMouseDown(e, overlay)}
                onContextMenu={handleContextMenu}
              >
                {overlay.text}
              </text>
            ))}
          </svg>
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