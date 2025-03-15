import { useEffect, useState } from 'react';
import './MapControls.css';

interface MapControlsProps {
  map?: any;
}

const MapControls = ({ map }: MapControlsProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map?.setView(
            [position.coords.latitude, position.coords.longitude],
            13
          );
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const handleResetView = () => {
    map?.setView([51.505, -0.09], 13);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="map-controls">
      <button onClick={handleLocateMe} className="control-button">
        Locate Me
      </button>
      <button onClick={handleResetView} className="control-button">
        Reset View
      </button>
    </div>
  );
};

export default MapControls; 