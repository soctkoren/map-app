import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import MapControls from './MapControls';
import type { PosterSize, TextOverlay, TextStyle } from './types';

const DEFAULT_CENTER: LatLngTuple = [51.505, -0.09];
const DEFAULT_ZOOM = 13;

interface MapControlsProps {
  onAddText: (text: string, style: TextStyle) => void;
  onUpdateText: (id: string, text: string, style: TextStyle) => void;
  onDeleteText: (id: string) => void;
  textOverlays: TextOverlay[];
  selectedPosterSize: PosterSize;
  onPosterSizeChange: (size: PosterSize) => void;
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

  useEffect(() => {
    const updateViewportSize = () => {
      const container = document.querySelector('.map-container');
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const aspectRatio = selectedPosterSize.width / selectedPosterSize.height;

      let width, height;
      if (containerWidth / containerHeight > aspectRatio) {
        // Container is wider than needed
        height = containerHeight * 0.9; // 90% of container height
        width = height * aspectRatio;
      } else {
        // Container is taller than needed
        width = containerWidth * 0.9; // 90% of container width
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

  const handleAddText = (text: string, style: TextStyle) => {
    const map = document.querySelector('.leaflet-container');
    if (!map) return;

    const rect = map.getBoundingClientRect();
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

  return (
    <div className="map-page">
      <div className="map-container">
        <div className="print-viewport" style={viewportStyle}>
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ width: '100%', height: '100%' }}
          >
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
                  style={{
                    transform: `rotate(${overlay.rotation}deg)`,
                    cursor: 'move',
                    userSelect: 'none'
                  }}
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
      />
    </div>
  );
};

export default Map; 