import { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import './MapAnnotations.css';

interface Annotation {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'arrow';
  position: L.LatLng;
  properties: {
    text?: string;
    fontSize?: number;
    color?: string;
    width?: number;
    height?: number;
    radius?: number;
  };
}

const MapAnnotations = () => {
  const map = useMap();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<'text' | 'rectangle' | 'circle' | 'arrow' | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);

  // Layer group to hold all annotations
  const [annotationLayer] = useState(() => L.layerGroup().addTo(map));

  const tools = [
    { id: 'text', icon: '🔤', label: 'Add Text' },
    { id: 'rectangle', icon: '⬜', label: 'Draw Rectangle' },
    { id: 'circle', icon: '⭕', label: 'Draw Circle' },
    { id: 'arrow', icon: '➡️', label: 'Draw Arrow' }
  ] as const;

  const addTextAnnotation = (latlng: L.LatLng) => {
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: 'text',
      position: latlng,
      properties: {
        text: 'Double click to edit',
        fontSize: 16,
        color: '#000000'
      }
    };

    const textElement = L.divIcon({
      className: 'map-annotation-text',
      html: `<div style="font-size: ${newAnnotation.properties.fontSize}px; color: ${newAnnotation.properties.color}">
              ${newAnnotation.properties.text}
            </div>`
    });

    const marker = L.marker(latlng, {
      icon: textElement,
      draggable: true
    }).addTo(annotationLayer);

    marker.on('dblclick', () => {
      const newText = prompt('Enter text:', newAnnotation.properties.text);
      if (newText !== null) {
        newAnnotation.properties.text = newText;
        updateAnnotation(newAnnotation);
      }
    });

    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const updateAnnotation = (annotation: Annotation) => {
    setAnnotations(prev => 
      prev.map(a => a.id === annotation.id ? annotation : a)
    );
    
    // Refresh the layer
    annotationLayer.clearLayers();
    annotations.forEach(renderAnnotation);
  };

  const renderAnnotation = (annotation: Annotation) => {
    switch (annotation.type) {
      case 'text':
        const textElement = L.divIcon({
          className: 'map-annotation-text',
          html: `<div style="font-size: ${annotation.properties.fontSize}px; color: ${annotation.properties.color}">
                  ${annotation.properties.text}
                </div>`
        });
        L.marker(annotation.position, {
          icon: textElement,
          draggable: true
        }).addTo(annotationLayer);
        break;
      // Add other shape rendering cases here
    }
  };

  useEffect(() => {
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!selectedTool) return;

      switch (selectedTool) {
        case 'text':
          addTextAnnotation(e.latlng);
          break;
        // Add other tool handlers
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, selectedTool]);

  return (
    <>
      <div className="annotation-toolbar left">
        <div className="tool-group">
          {tools.map(tool => (
            <button
              key={tool.id}
              className={`tool-button ${selectedTool === tool.id ? 'active' : ''}`}
              onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>
      </div>
      
      <div className="annotation-toolbar right">
        <div className="properties-panel">
          {selectedAnnotation && (
            <div className="annotation-properties">
              <h3>Properties</h3>
              {/* Add property controls based on selected annotation type */}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MapAnnotations; 