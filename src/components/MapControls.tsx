import React, { useState, useRef } from 'react';
import type { PosterSize, TextOverlay, TextStyle, MapStyle } from '../types';
import './MapControls.css';
import { backgrounds } from './BackgroundGallery';

interface MapControlsProps {
  onAddText: (text: string, style: TextStyle) => void;
  onUpdateText: (id: string, text: string, style: TextStyle) => void;
  onDeleteText: (id: string) => void;
  textOverlays: TextOverlay[];
  selectedPosterSize: PosterSize;
  onPosterSizeChange: (size: PosterSize) => void;
  onCapture: () => void;
  mapStyles: MapStyle[];
  selectedMapStyle: MapStyle;
  onMapStyleChange: (style: MapStyle) => void;
  onLocationChange: (lat: number, lng: number) => void;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

const POSTER_SIZES: PosterSize[] = [
  { name: '8x10"', width: 8, height: 10, pixelWidth: 2400, pixelHeight: 3000 },
  { name: '11x14"', width: 11, height: 14, pixelWidth: 3300, pixelHeight: 4200 },
  { name: '16x20"', width: 16, height: 20, pixelWidth: 4800, pixelHeight: 6000 },
  { name: '18x24"', width: 18, height: 24, pixelWidth: 5400, pixelHeight: 7200 },
  { name: '24x36"', width: 24, height: 36, pixelWidth: 7200, pixelHeight: 10800 }
];

interface LayerEditorProps {
  overlay: TextOverlay;
  onUpdate: (id: string, text: string, style: TextStyle) => void;
  onClose: () => void;
  isNew?: boolean;
}

const AVAILABLE_FONTS = [
  { name: 'ABeeZee', value: 'ABeeZee' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Arial', value: 'Arial' },
  { name: 'Times New Roman', value: 'Times New Roman' },
  { name: 'Helvetica', value: 'Helvetica' }
];

const DEFAULT_TEXT: TextOverlay = {
  id: '',
  text: '',
  x: 0,
  y: 0,
  fontSize: 100,
  color: '#000000',
  rotation: 0,
  fontFamily: 'Roboto'
};

const LayerEditor: React.FC<LayerEditorProps> = ({ overlay, onUpdate, onClose, isNew = false }) => {
  const [fontSize, setFontSize] = useState(overlay.fontSize);
  const [textColor, setTextColor] = useState(overlay.color);
  const [rotation, setRotation] = useState(overlay.rotation);
  const [text, setText] = useState(overlay.text);
  const [fontFamily, setFontFamily] = useState(overlay.fontFamily || 'Roboto');

  // Function to snap rotation to common angles
  const snapRotation = (value: number): number => {
    const snapPoints = [0, 45, 90, 135, 180, -180, -135, -90, -45];
    const snapThreshold = 5; // Degrees within which to snap

    for (const point of snapPoints) {
      if (Math.abs(value - point) <= snapThreshold) {
        return point;
      }
    }
    return value;
  };

  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRotation = Number(e.target.value);
    const snappedRotation = snapRotation(newRotation);
    setRotation(snappedRotation);
    onUpdate(overlay.id, text, {
      fontSize,
      color: textColor,
      rotation: snappedRotation,
      fontFamily
    });
  };

  const handleUpdate = () => {
    onUpdate(overlay.id, text, {
      fontSize,
      color: textColor,
      rotation,
      fontFamily
    });
  };

  return (
    <div className="layer-editor-popup">
      <div className="layer-editor-content">
        <h4>{isNew ? 'Add New Text' : 'Edit Layer'}</h4>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onUpdate(overlay.id, e.target.value, {
              fontSize,
              color: textColor,
              rotation,
              fontFamily
            });
          }}
          placeholder="Enter text..."
          autoFocus
        />
        <div className="style-controls">
          <select
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value);
              onUpdate(overlay.id, text, {
                fontSize,
                color: textColor,
                rotation,
                fontFamily: e.target.value
              });
            }}
            className="font-select"
          >
            {AVAILABLE_FONTS.map(font => (
              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => {
              const newSize = e.target.value === '' ? 0 : parseInt(e.target.value);
              if (!isNaN(newSize)) {
                setFontSize(newSize);
                onUpdate(overlay.id, text, {
                  fontSize: newSize,
                  color: textColor,
                  rotation,
                  fontFamily
                });
              }
            }}
            min="0"
            max="200"
            step="1"
            placeholder="Font size"
          />
          <input
            type="color"
            value={textColor}
            onChange={(e) => {
              setTextColor(e.target.value);
              handleUpdate();
            }}
            title="Text color"
          />
          <div className="rotation-control">
            <div className="rotation-label">
              <span>Rotation: {rotation}°</span>
              <button 
                className="reset-rotation"
                onClick={() => {
                  setRotation(0);
                  onUpdate(overlay.id, text, {
                    fontSize,
                    color: textColor,
                    rotation: 0,
                    fontFamily
                  });
                }}
              >
                Reset
              </button>
            </div>
            <div className="rotation-slider-container">
              <div className="angle-markers">
                <span>-180°</span>
                <span>-90°</span>
                <span>0°</span>
                <span>90°</span>
                <span>180°</span>
              </div>
              <input
                type="range"
                value={rotation}
                onChange={handleRotationChange}
                min="-180"
                max="180"
                step="1"
                className="rotation-slider"
              />
              <div className="angle-ticks">
                <div className="tick" style={{ left: '0%' }}></div>
                <div className="tick" style={{ left: '25%' }}></div>
                <div className="tick" style={{ left: '50%' }}></div>
                <div className="tick" style={{ left: '75%' }}></div>
                <div className="tick" style={{ left: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
        <button className="close-editor-btn" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
};

const MapControls: React.FC<MapControlsProps> = ({
  onAddText,
  onUpdateText,
  onDeleteText,
  textOverlays,
  selectedPosterSize,
  onPosterSizeChange,
  onCapture,
  mapStyles,
  selectedMapStyle,
  onMapStyleChange,
  onLocationChange
}) => {
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isAddingNewText, setIsAddingNewText] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search if query is too short
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    // Add debounce to prevent too many requests
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching for location:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleLocationSelect = (result: SearchResult) => {
    setSearchQuery(result.display_name);
    setSearchResults([]);
    onLocationChange(parseFloat(result.lat), parseFloat(result.lon));
  };

  const handleStartAddText = () => {
    const id = Date.now().toString();
    const newText = { ...DEFAULT_TEXT, id };
    onAddText(newText.text, {
      fontSize: newText.fontSize,
      color: newText.color,
      rotation: newText.rotation,
      fontFamily: newText.fontFamily
    });
    setSelectedLayerId(id);
    setIsAddingNewText(true);
  };

  const handleCloseEditor = () => {
    setSelectedLayerId(null);
    setIsAddingNewText(false);
  };

  return (
    <div className="map-controls">
      <div className="site-title">
        <svg className="logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            fill="currentColor"
          />
        </svg>
        <div className="title-text">
          <h1>Momenti Maps</h1>
          <p>Create beautiful map prints</p>
        </div>
      </div>

      <div className="control-section">
        <h3>Search Location</h3>
        <div className="search-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for a location..."
            className="search-input"
          />
          {isSearching && (
            <div className="search-loading">
              <span>Searching...</span>
            </div>
          )}
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  className="search-result-item"
                  onClick={() => handleLocationSelect(result)}
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="control-section">
        <h3>Map Style</h3>
        <div className="style-selector">
          <select
            value={selectedMapStyle.name}
            onChange={(e) => {
              const style = mapStyles.find(s => s.name === e.target.value);
              if (style) onMapStyleChange(style);
            }}
          >
            {mapStyles.map(style => (
              <option key={style.name} value={style.name}>
                {style.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="control-section">
        <div className="text-controls-header">
          <h3>Text Layers</h3>
          <button className="add-text-btn" onClick={handleStartAddText}>
            Add Text
          </button>
        </div>
        <div className="text-layers">
          {textOverlays.map((overlay) => (
            <div
              key={overlay.id}
              className={`text-layer ${selectedLayerId === overlay.id ? 'selected' : ''}`}
              onClick={() => setSelectedLayerId(overlay.id)}
            >
              <span className="layer-text">{overlay.text}</span>
              <button
                className="delete-layer-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteText(overlay.id);
                  if (selectedLayerId === overlay.id) {
                    setSelectedLayerId(null);
                  }
                }}
              >
                ×
              </button>
            </div>
          ))}
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
        <div className="current-size-info">
          <span className="size-name">{selectedPosterSize.name}</span>
          <span className="size-pixels">{selectedPosterSize.pixelWidth} × {selectedPosterSize.pixelHeight}px</span>
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

      <a
        href="https://www.paypal.com/donate/?business=W7PELRRREYBSU&no_recurring=0&item_name=Takes+for+supporting+my+channel+via+this+donation%21&currency_code=USD"
        target="_blank"
        rel="noopener noreferrer"
        className="donate-button"
      >
        <svg viewBox="0 0 24 24">
          <path d="M20.067 8.478c.492.315.844.825.983 1.39.185.716.173 1.485-.043 2.197-.404 1.35-1.168 2.517-2.285 3.523-1.922 1.746-4.193 2.467-6.92 2.467h-2.726l-.8 5.09H5.266l.07-.43.627-4.01.13-.75.15-.95h2.495c1.285 0 2.487-.196 3.59-.594 2.156-.774 3.72-2.19 4.723-4.238.448-.917.743-1.904.856-2.89.067-.47.043-.93-.064-1.366-.102-.354-.27-.668-.576-.956z M18.956 6.172c.282.65.392 1.365.328 2.09-.095 1.09-.456 2.152-1.07 3.19-1.082 1.82-2.594 3.076-4.523 3.77-1.04.376-2.142.57-3.34.57h-3.23l-.8 5.09H3.31l.07-.43 1.06-6.76.13-.75.147-.95h2.995c1.285 0 2.487-.196 3.59-.594 2.156-.774 3.72-2.19 4.723-4.238.448-.917.743-1.904.856-2.89.067-.47.043-.93-.064-1.366-.102-.354-.27-.668-.576-.956.492.315.844.825.983 1.39.185.716.173 1.485-.043 2.197-.404 1.35-1.168 2.517-2.285 3.523.173-.033.348-.073.52-.118z"/>
        </svg>
        <span>Buy me a coffee</span>
      </a>

      {selectedLayerId && (
        <LayerEditor
          overlay={textOverlays.find(o => o.id === selectedLayerId)!}
          onUpdate={onUpdateText}
          onClose={handleCloseEditor}
          isNew={isAddingNewText}
        />
      )}
    </div>
  );
};

export default MapControls; 