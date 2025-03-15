import React, { useState } from 'react';
import type { PosterSize, TextOverlay, TextStyle } from './types';
import './MapControls.css';

interface MapControlsProps {
  onAddText: (text: string, style: TextStyle) => void;
  onUpdateText: (id: string, text: string, style: TextStyle) => void;
  onDeleteText: (id: string) => void;
  textOverlays: TextOverlay[];
  selectedPosterSize: PosterSize;
  onPosterSizeChange: (size: PosterSize) => void;
  onCapture: () => void;
}

const POSTER_SIZES: PosterSize[] = [
  { name: '8x10"', width: 8, height: 10, pixelWidth: 2400, pixelHeight: 3000 },
  { name: '11x14"', width: 11, height: 14, pixelWidth: 3300, pixelHeight: 4200 },
  { name: '16x20"', width: 16, height: 20, pixelWidth: 4800, pixelHeight: 6000 },
  { name: '18x24"', width: 18, height: 24, pixelWidth: 5400, pixelHeight: 7200 },
  { name: '24x36"', width: 24, height: 36, pixelWidth: 7200, pixelHeight: 10800 }
];

const MapControls: React.FC<MapControlsProps> = ({
  onAddText,
  onUpdateText,
  onDeleteText,
  textOverlays,
  selectedPosterSize,
  onPosterSizeChange,
  onCapture
}) => {
  const [newText, setNewText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#000000');
  const [rotation, setRotation] = useState(0);
  const [showSizeSelector, setShowSizeSelector] = useState(false);

  const handleAddText = () => {
    if (newText.trim()) {
      onAddText(newText, {
        fontSize,
        color: textColor,
        rotation
      });
      setNewText('');
    }
  };

  return (
    <div className="map-controls">
      <div className="control-section">
        <h3>Text Controls</h3>
        <div className="text-input-group">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter text..."
          />
          <div className="style-controls">
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              min="8"
              max="72"
              placeholder="Font size"
            />
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              title="Text color"
            />
            <input
              type="range"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              min="-180"
              max="180"
              title="Rotation"
            />
          </div>
          <div className="text-actions">
            <button className="add-text-btn" onClick={handleAddText}>
              Add Text
            </button>
            {textOverlays.length > 0 && (
              <button
                className="delete-text-btn"
                onClick={() => onDeleteText(textOverlays[textOverlays.length - 1].id)}
              >
                Delete Last
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="control-section">
        <div className="print-header">
          <h3>Print Settings</h3>
          <button
            className="settings-toggle"
            onClick={() => setShowSizeSelector(!showSizeSelector)}
          >
            {showSizeSelector ? 'Hide Sizes' : 'Show Sizes'}
          </button>
        </div>
        {showSizeSelector && (
          <div className="print-settings">
            <div className="size-info">
              <p>Select a poster size:</p>
              <p className="dpi-note">All sizes will be exported at 300 DPI</p>
            </div>
            <div className="size-selector">
              {POSTER_SIZES.map((size) => (
                <button
                  key={size.name}
                  className={`size-option ${
                    selectedPosterSize.name === size.name ? 'selected' : ''
                  }`}
                  onClick={() => onPosterSizeChange(size)}
                >
                  <span className="size-name">{size.name}</span>
                  <span className="size-pixels">
                    {size.pixelWidth}×{size.pixelHeight}px
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        <button className="capture-btn" onClick={onCapture}>
          Capture Map
        </button>
      </div>
    </div>
  );
};

export default MapControls; 