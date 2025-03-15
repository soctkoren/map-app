import { useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import MapControls from './MapControls';
import RoutePlanner from './RoutePlanner';

interface Route {
  start: [number, number];
  end: [number, number];
  coordinates: [number, number][];
}

const Map = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [MapComponent, setMapComponent] = useState<any>(null);

  useEffect(() => {
    const loadMap = async () => {
      const L = await import('leaflet');
      const { MapContainer, TileLayer, ZoomControl, Polyline } = await import('react-leaflet');
      await import('leaflet/dist/leaflet.css');
      
      setMapComponent({ MapContainer, TileLayer, ZoomControl, Polyline });
      setIsMounted(true);
    };

    loadMap();
  }, []);

  const handleSearch = (query: string) => {
    // TODO: Implement geocoding
    console.log('Searching for:', query);
  };

  const handleRouteCreate = async (start: [number, number], end: [number, number]) => {
    try {
      // Using OSRM for routing (OpenStreetMap Routing Machine)
      const response = await fetch(
        `http://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.code === 'Ok') {
        const coordinates = data.routes[0].geometry.coordinates.map((coord: number[]) => [
          coord[1],
          coord[0]
        ]);
        
        setCurrentRoute({
          start,
          end,
          coordinates
        });
      } else {
        alert('Could not find a route between these points');
      }
    } catch (error) {
      console.error('Error creating route:', error);
      alert('Error creating route');
    }
  };

  if (!isMounted || !MapComponent) {
    return <div>Loading map...</div>;
  }

  const { MapContainer, TileLayer, ZoomControl, Polyline } = MapComponent;

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <SearchBar onSearch={handleSearch} />
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <MapControls />
        <RoutePlanner onRouteCreate={handleRouteCreate} />
        {currentRoute && (
          <Polyline
            positions={currentRoute.coordinates}
            color="#007bff"
            weight={3}
            opacity={0.8}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map; 