
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Hide Mapbox attribution for cleaner UI in small containers
const customMapStyle = {
  '.mapboxgl-ctrl-bottom-right': {
    display: 'none',
  },
  '.mapboxgl-ctrl-bottom-left': {
    display: 'none',
  },
};

interface FarmerLocationMapProps {
  location: {
    latitude: number;
    longitude: number;
  };
  farmerName: string;
  className?: string;
  interactiveMap?: boolean;
  zoom?: number;
  height?: string;
}

const FarmerLocationMap: React.FC<FarmerLocationMapProps> = ({
  location,
  farmerName,
  className = '',
  interactiveMap = true,
  zoom = 12,
  height = 'h-64',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    // Initialize Mapbox with public token
    mapboxgl.accessToken = 'pk.eyJ1IjoiZmFybWNvbm5lY3QiLCJhIjoiY2x1aXIxMjk0MDRtYzJpcGZyZ3J0cXUwaCJ9.lZJybel9zTQNSCK4wBD-QQ';

    if (!mapContainer.current) return;

    // Create map instance
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [location.longitude, location.latitude],
      zoom: zoom,
      interactive: interactiveMap,
    });

    // Add marker for farmer location
    const marker = new mapboxgl.Marker({ color: '#10b981' })
      .setLngLat([location.longitude, location.latitude])
      .setPopup(new mapboxgl.Popup().setHTML(`<p>${farmerName}</p>`))
      .addTo(map.current);

    // Add navigation controls if map is interactive
    if (interactiveMap) {
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }

    // Apply custom style to hide attribution
    Object.entries(customMapStyle).forEach(([selector, style]) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        Object.assign((el as HTMLElement).style, style);
      });
    });

    // Create a simulated route to the point (for visual interest)
    if (interactiveMap) {
      map.current.on('load', () => {
        if (!map.current) return;
        
        // Add a circle showing approximate area
        map.current.addSource('area-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            }
          }
        });
        
        map.current.addLayer({
          id: 'area-layer',
          type: 'circle',
          source: 'area-source',
          paint: {
            'circle-radius': 100,
            'circle-color': '#10b981',
            'circle-opacity': 0.15,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#10b981'
          }
        });
      });
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [location, farmerName, interactiveMap, zoom]);

  return (
    <div ref={mapContainer} className={`${height} rounded-lg overflow-hidden ${className}`} />
  );
};

export default FarmerLocationMap;
