import React, { useState, useRef } from 'react';
import type { PosterSize, TextOverlay, TextStyle, MapStyle } from '../types';
import './MapControls.css';
import { backgrounds } from './BackgroundGallery';
import SvgIconSelector from './SvgIconSelector';

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
    onUpdate(overlay.id, overlay.isSvg ? overlay.svgPath! : text, {
      fontSize,
      color: textColor,
      rotation: snappedRotation,
      fontFamily
    });
  };

  const handleUpdate = () => {
    onUpdate(overlay.id, overlay.isSvg ? overlay.svgPath! : text, {
      fontSize,
      color: textColor,
      rotation,
      fontFamily
    });
  };

  return (
    <div className="layer-editor-popup">
      <div className="layer-editor-content">
        <h4>{isNew ? (overlay.isSvg ? 'Add New Icon' : 'Add New Text') : 'Edit Layer'}</h4>
        
        {!overlay.isSvg && (
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
        )}

        <div className="style-controls">
          {!overlay.isSvg && (
            <div className="style-control">
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
            </div>
          )}
          
          <div className="style-control">
            <label>
              <span>{overlay.isSvg ? 'Icon Size' : 'Font Size'}</span>
              <span className="value-display">{fontSize}px</span>
            </label>
            <input
              type="range"
              value={fontSize}
              onChange={(e) => {
                const newSize = parseInt(e.target.value);
                setFontSize(newSize);
                onUpdate(overlay.id, overlay.isSvg ? overlay.svgPath! : text, {
                  fontSize: newSize,
                  color: textColor,
                  rotation,
                  fontFamily
                });
              }}
              min={overlay.isSvg ? "24" : "12"}
              max={overlay.isSvg ? "96" : "200"}
              step="1"
            />
          </div>
          
          <div className="style-control">
            <label>
              <span>Color</span>
              <span className="value-display">{textColor}</span>
            </label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value);
                handleUpdate();
              }}
              title={overlay.isSvg ? "Icon color" : "Text color"}
            />
          </div>

          <div className="style-control">
            <label>
              <span>Rotation</span>
              <span className="value-display">{rotation}°</span>
            </label>
            <input
              type="range"
              value={rotation}
              onChange={handleRotationChange}
              min="-180"
              max="180"
              step="1"
            />
            <div className="angle-markers">
              <span>-180°</span>
              <span>0°</span>
              <span>180°</span>
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
  const [showSizes, setShowSizes] = useState(false);

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

      <div className="search-section">
        <h3>Search Location</h3>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search Location"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {isSearching && <div className="search-loading">Searching...</div>}
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
          <h3>Add Content</h3>
          <button className="add-text-btn" onClick={handleStartAddText}>
            Add Text
          </button>
          <SvgIconSelector 
            selectedIcon=""
            onSelectIcon={(iconPath) => onAddText(iconPath, {
              fontSize: 48,
              color: '#0066FF',
              rotation: 0,
              fontFamily: 'sans-serif',
              isSvg: true
            })}
          />
        </div>
        <div className="text-layers">
          {textOverlays.map((overlay) => (
            <div key={overlay.id} className="text-layer">
              <div className="layer-preview">
                {overlay.isSvg ? (
                  <>
                    <svg viewBox="0 0 24 24" className="layer-icon" fill={overlay.color || 'currentColor'}>
                      <path d={overlay.svgPath} />
                    </svg>
                    <span>Map Icon</span>
                  </>
                ) : (
                  <span>{overlay.text}</span>
                )}
              </div>
              <div className="layer-actions">
                <button
                  className="edit-layer-btn"
                  onClick={() => {
                    setSelectedLayerId(overlay.id);
                    setIsAddingNewText(false);
                  }}
                  aria-label="Edit layer"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                  </svg>
                </button>
                <button
                  className="delete-text-btn"
                  onClick={() => onDeleteText(overlay.id)}
                  aria-label="Delete layer"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
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

      <div className={`social-buttons ${showSizeSelector ? 'hidden' : ''}`}>
        <a 
          href="https://www.linkedin.com/in/jonnykvids/" 
          target="_blank" 
          rel="noopener noreferrer"
          title="Visit my LinkedIn"
          className="profile-link"
        >
          <img 
            src="/me.jpeg" 
            alt="Jonny K" 
            className="profile-image"
          />
        </a>
        <a 
          href="https://www.paypal.com/donate/?business=W7PELRRREYBSU&no_recurring=0&item_name=Thanks+for+supporting+my+work+%3A%29&currency_code=USD" 
          className="donate-button" 
          target="_blank" 
          rel="noopener noreferrer"
          title="Buy me a coffee"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19H20L19.5 21H4.5L4 19Z" fill="currentColor" />
            <path d="M18 4H6V13C6 15.7614 8.23858 18 11 18H13C15.7614 18 18 15.7614 18 13V4Z" fill="currentColor" />
            <path d="M18 4H20V9C20 10.1046 19.1046 11 18 11V4Z" fill="currentColor" />
          </svg>
          <span className="sr-only">Buy me a coffee</span>
        </a>
        <a 
          href="https://www.youtube.com/@jonnykvids" 
          className="youtube-button" 
          target="_blank" 
          rel="noopener noreferrer"
          title="Visit my YouTube channel"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.5 6.2C23.3 5.4 22.7 4.8 22 4.6C20.1 4 12 4 12 4C12 4 3.9 4 2 4.6C1.3 4.8 0.7 5.4 0.5 6.2C0 8.1 0 12 0 12C0 12 0 15.9 0.5 17.8C0.7 18.6 1.3 19.2 2 19.4C3.9 20 12 20 12 20C12 20 20.1 20 22 19.4C22.7 19.2 23.3 18.6 23.5 17.8C24 15.9 24 12 24 12C24 12 24 8.1 23.5 6.2ZM9.5 15.5V8.5L16 12L9.5 15.5Z" fill="currentColor"/>
          </svg>
          <span className="sr-only">Visit my YouTube channel</span>
        </a>
      </div>

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