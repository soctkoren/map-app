import { useState } from 'react';
import { useMap } from 'react-leaflet';
import './RoutePlanner.css';

interface RoutePlannerProps {
  onRouteCreate: (start: [number, number], end: [number, number]) => void;
}

const RoutePlanner = ({ onRouteCreate }: RoutePlannerProps) => {
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const map = useMap();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Geocode start point
      const startResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startPoint)}`
      );
      const startData = await startResponse.json();
      
      // Geocode end point
      const endResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endPoint)}`
      );
      const endData = await endResponse.json();

      if (startData.length > 0 && endData.length > 0) {
        const start: [number, number] = [parseFloat(startData[0].lat), parseFloat(startData[0].lon)];
        const end: [number, number] = [parseFloat(endData[0].lat), parseFloat(endData[0].lon)];
        onRouteCreate(start, end);
      } else {
        alert('Could not find one or both locations');
      }
    } catch (error) {
      console.error('Error geocoding locations:', error);
      alert('Error finding locations');
    }
  };

  return (
    <div className={`route-planner ${isExpanded ? 'expanded' : ''}`}>
      <button 
        className="route-planner-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Hide Route Planner' : 'Show Route Planner'}
      </button>
      
      {isExpanded && (
        <form onSubmit={handleSubmit} className="route-form">
          <div className="route-input-group">
            <label htmlFor="start">Start Point</label>
            <input
              id="start"
              type="text"
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
              placeholder="Enter start location"
              className="route-input"
            />
          </div>
          
          <div className="route-input-group">
            <label htmlFor="end">End Point</label>
            <input
              id="end"
              type="text"
              value={endPoint}
              onChange={(e) => setEndPoint(e.target.value)}
              placeholder="Enter end location"
              className="route-input"
            />
          </div>
          
          <button type="submit" className="route-submit">
            Plan Route
          </button>
        </form>
      )}
    </div>
  );
};

export default RoutePlanner; 