import React, { useState } from 'react';
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
          <input
            type="range"
            value={rotation}
            onChange={(e) => {
              const newRotation = Number(e.target.value);
              setRotation(newRotation);
              onUpdate(overlay.id, text, {
                fontSize,
                color: textColor,
                rotation: newRotation,
                fontFamily
              });
            }}
            min="-180"
            max="180"
            step="1"
            title={`Rotation: ${rotation}°`}
            className="rotation-slider"
          />
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
  onMapStyleChange
}) => {
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isAddingNewText, setIsAddingNewText] = useState(false);

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