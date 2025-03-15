import React, { useState } from 'react';
import type { PosterSize, TextOverlay, TextStyle, MapStyle } from '../types';
import './MapControls.css';

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

const DEFAULT_TEXT: TextOverlay = {
  id: '',
  text: 'New Text',
  x: 0,
  y: 0,
  fontSize: 100,
  color: '#000000',
  rotation: 0
};

const LayerEditor: React.FC<LayerEditorProps> = ({ overlay, onUpdate, onClose, isNew = false }) => {
  const [fontSize, setFontSize] = useState(overlay.fontSize);
  const [textColor, setTextColor] = useState(overlay.color);
  const [rotation, setRotation] = useState(overlay.rotation);
  const [text, setText] = useState(overlay.text);

  const handleUpdate = () => {
    onUpdate(overlay.id, text, {
      fontSize,
      color: textColor,
      rotation
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
              rotation
            });
          }}
          placeholder="Enter text..."
          autoFocus
        />
        <div className="style-controls">
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
                  rotation
                });
              }
            }}
            onBlur={(e) => {
              const newSize = e.target.value === '' ? 0 : parseInt(e.target.value);
              if (!isNaN(newSize)) {
                setFontSize(newSize);
                onUpdate(overlay.id, text, {
                  fontSize: newSize,
                  color: textColor,
                  rotation
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
              setRotation(Number(e.target.value));
              handleUpdate();
            }}
            min="-180"
            max="180"
            title="Rotation"
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
      rotation: newText.rotation
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