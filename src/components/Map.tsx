import { useEffect, useState, useRef } from 'react';
import SearchBar from './SearchBar';
import ScreenshotControl from './ScreenshotControl';

interface Route {
  start: [number, number];
  end: [number, number];
  coordinates: [number, number][];
}

const Map = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [MapComponent, setMapComponent] = useState<any>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const loadMap = async () => {
      const L = await import('leaflet');
      const { MapContainer, TileLayer, ZoomControl } = await import('react-leaflet');
      await import('leaflet/dist/leaflet.css');
      
      // Fix Leaflet default icon issue
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      
      setMapComponent({ MapContainer, TileLayer, ZoomControl });
      setIsMounted(true);
    };

    loadMap();
  }, []);

  const handleSearch = (location: { lat: number; lng: number; display_name: string }) => {
    if (mapRef.current) {
      mapRef.current.setView([location.lat, location.lng], 13);
    }
  };

  if (!isMounted || !MapComponent) {
    return <div>Loading map...</div>;
  }

  const { MapContainer, TileLayer, ZoomControl } = MapComponent;

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <SearchBar onSearch={handleSearch} />
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <ScreenshotControl />
      </MapContainer>
    </div>
  );
};

export default Map; 