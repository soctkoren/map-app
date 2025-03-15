import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import html2canvas from 'html2canvas';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import MapControls from './MapControls';
import type { PosterSize, TextOverlay, TextStyle } from './types';

const DEFAULT_CENTER: LatLngTuple = [51.505, -0.09];
const DEFAULT_ZOOM = 13;

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

  const handleAddText = (text: string, style: TextStyle) => {
    const container = document.querySelector('.leaflet-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newText: TextOverlay = {
      id: Date.now().toString(),
      text,
      x: rect.width / 2,
      y: rect.height / 2,
      fontSize: style.fontSize,
      color: style.color,
      rotation: style.rotation
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
              rotation: style.rotation
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
    if (!dragStateRef.current.isDragging) return;

    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;

    setTextOverlays(overlays =>
      overlays.map(overlay =>
        overlay.id === dragStateRef.current.textId
          ? {
              ...overlay,
              x: dragStateRef.current.textX + dx,
              y: dragStateRef.current.textY + dy
            }
          : overlay
      )
    );
  };

  const handleMouseUp = () => {
    dragStateRef.current.isDragging = false;
    setDraggingId(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleCapture = async () => {
    if (!printViewportRef.current || !mapInstanceRef.current) return;
    setIsCapturing(true);

    try {
      // Wait for capturing class transition
      await new Promise(resolve => setTimeout(resolve, 300));

      const viewport = printViewportRef.current;
      const map = mapInstanceRef.current;
      const { pixelWidth, pixelHeight } = selectedPosterSize;

      // Get the current map state
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bounds = map.getBounds();

      // Calculate the scale factor
      const viewportRect = viewport.getBoundingClientRect();
      const scale = pixelWidth / viewportRect.width;

      // Configure html2canvas options for high DPI
      const canvas = await html2canvas(viewport, {
        scale,
        width: viewportRect.width,
        height: viewportRect.height,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Hide UI elements in the cloned document
          const clonedViewport = clonedDoc.querySelector('.print-viewport') as HTMLElement;
          if (clonedViewport) {
            const controls = clonedViewport.querySelectorAll('.leaflet-control, .print-size-indicator');
            controls.forEach((control) => {
              (control as HTMLElement).style.display = 'none';
            });

            // Scale text overlays
            const texts = clonedViewport.querySelectorAll('text');
            texts.forEach((text) => {
              const fontSize = parseFloat(text.getAttribute('font-size') || '24');
              text.setAttribute('font-size', `${fontSize * scale}px`);
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
      setIsCapturing(false);
    }
  };

  return (
    <div className="map-page">
      <div className="map-container">
        <div
          className={`print-viewport ${isCapturing ? 'capturing' : ''}`}
          ref={printViewportRef}
          style={viewportStyle}
        >
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ width: '100%', height: '100%' }}
          >
            <MapOperations onMapReady={handleMapReady} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <svg className="text-overlay-container">
              {textOverlays.map((overlay) => (
                <text
                  key={overlay.id}
                  x={overlay.x}
                  y={overlay.y}
                  fontSize={overlay.fontSize}
                  fill={overlay.color}
                  className={draggingId === overlay.id ? 'dragging' : ''}
                  style={{
                    transform: `rotate(${overlay.rotation}deg)`,
                    cursor: 'move',
                    userSelect: 'none'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, overlay)}
                  onContextMenu={handleContextMenu}
                >
                  {overlay.text}
                </text>
              ))}
            </svg>
          </MapContainer>
          <div className="print-size-indicator">
            {selectedPosterSize.name} ({selectedPosterSize.width}" × {selectedPosterSize.height}")
          </div>
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
      />
    </div>
  );
};

export default Map; 