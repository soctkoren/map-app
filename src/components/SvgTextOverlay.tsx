import { useState, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import './SvgTextOverlay.css';

interface TextOverlay {
  id: string;
  text: string;
  position: L.LatLng;
  style: {
    fontSize: number;
    fontFamily: string;
    color: string;
    rotation: number;
  };
}

const SvgTextOverlay = () => {
  const map = useMap();
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const svgLayerRef = useRef<L.SVGOverlay | null>(null);

  const createSvgOverlay = () => {
    // Remove existing SVG overlay
    if (svgLayerRef.current) {
      svgLayerRef.current.remove();
    }

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    
    // Add text elements
    textOverlays.forEach(overlay => {
      const point = map.latLngToLayerPoint(overlay.position);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', point.x.toString());
      text.setAttribute('y', point.y.toString());
      text.setAttribute('font-size', `${overlay.style.fontSize}px`);
      text.setAttribute('font-family', overlay.style.fontFamily);
      text.setAttribute('fill', overlay.style.color);
      text.setAttribute('transform', `rotate(${overlay.style.rotation}, ${point.x}, ${point.y})`);
      text.setAttribute('class', 'svg-text-overlay');
      text.setAttribute('data-id', overlay.id);
      text.textContent = overlay.text;
      
      // Make text draggable
      text.style.cursor = 'move';
      text.addEventListener('mousedown', (e) => handleDragStart(e, overlay.id));
      
      svg.appendChild(text);
    });

    // Create and add the SVG overlay
    const bounds = map.getBounds();
    svgLayerRef.current = L.svgOverlay(svg, bounds, {
      interactive: true,
      className: 'svg-overlay-container'
    }).addTo(map);
  };

  const handleDragStart = (e: MouseEvent, id: string) => {
    const text = e.target as SVGTextElement;
    let isDragging = false;
    let startX = e.clientX;
    let startY = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      isDragging = true;
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      startX = moveEvent.clientX;
      startY = moveEvent.clientY;

      const point = map.mouseEventToLatLng(moveEvent);
      setTextOverlays(prev => prev.map(overlay => 
        overlay.id === id ? { ...overlay, position: point } : overlay
      ));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (!isDragging) {
        setSelectedOverlay(id);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const addNewText = (e: L.LeafletMouseEvent) => {
    if (!isAdding) return;

    const newOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: 'Double click to edit',
      position: e.latlng,
      style: {
        fontSize: 48,
        fontFamily: 'Arial',
        color: '#000000',
        rotation: 0
      }
    };

    setTextOverlays(prev => [...prev, newOverlay]);
    setIsAdding(false);
  };

  useEffect(() => {
    createSvgOverlay();
    map.on('moveend', createSvgOverlay);
    map.on('click', addNewText);

    return () => {
      map.off('moveend', createSvgOverlay);
      map.off('click', addNewText);
      if (svgLayerRef.current) {
        svgLayerRef.current.remove();
      }
    };
  }, [map, textOverlays, isAdding]);

  return (
    <div className="svg-text-controls">
      <div className="text-toolbar">
        <button
          className={`text-tool-button ${isAdding ? 'active' : ''}`}
          onClick={() => setIsAdding(!isAdding)}
          title="Add Text"
        >
          <span role="img" aria-label="Add Text">🔤</span>
        </button>
      </div>
      
      {selectedOverlay && (
        <div className="text-properties">
          {textOverlays.map(overlay => {
            if (overlay.id === selectedOverlay) {
              return (
                <div key={overlay.id} className="text-editor">
                  <input
                    type="text"
                    value={overlay.text}
                    onChange={(e) => {
                      setTextOverlays(prev => prev.map(t => 
                        t.id === selectedOverlay ? { ...t, text: e.target.value } : t
                      ));
                    }}
                  />
                  <input
                    type="number"
                    value={overlay.style.fontSize}
                    onChange={(e) => {
                      setTextOverlays(prev => prev.map(t => 
                        t.id === selectedOverlay ? { 
                          ...t, 
                          style: { ...t.style, fontSize: parseInt(e.target.value) || 48 }
                        } : t
                      ));
                    }}
                  />
                  <input
                    type="color"
                    value={overlay.style.color}
                    onChange={(e) => {
                      setTextOverlays(prev => prev.map(t => 
                        t.id === selectedOverlay ? { 
                          ...t, 
                          style: { ...t.style, color: e.target.value }
                        } : t
                      ));
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={overlay.style.rotation}
                    onChange={(e) => {
                      setTextOverlays(prev => prev.map(t => 
                        t.id === selectedOverlay ? { 
                          ...t, 
                          style: { ...t.style, rotation: parseInt(e.target.value) }
                        } : t
                      ));
                    }}
                  />
                  <button
                    onClick={() => {
                      setTextOverlays(prev => prev.filter(t => t.id !== selectedOverlay));
                      setSelectedOverlay(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

export default SvgTextOverlay; 