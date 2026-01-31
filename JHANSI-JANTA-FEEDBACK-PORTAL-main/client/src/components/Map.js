import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { useEffect, useRef, useState } from "react";

const render = (status) => {
  switch (status) {
    case Status.LOADING:
      return <div className="map-loading">Loading map...</div>;
    case Status.FAILURE:
      return <div className="map-error">Failed to load map. Please check your API key.</div>;
    case Status.SUCCESS:
      return <MapComponent />;
  }
};

function MapComponent({ center = { lat: 25.4358, lng: 78.5679 }, zoom = 12, onLocationSelect }) {
  const ref = useRef();
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [tracking, setTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });
      setMap(newMap);
    }
  }, [ref, map, center, zoom]);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(pos);
          if (map) {
            map.setCenter(pos);
            map.setZoom(15);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Start real-time tracking
  const startTracking = () => {
    setTracking(true);
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString()
        };
        setUserLocation(newPos);

        // Add marker for current position
        if (map) {
          // Clear previous user markers
          markers.forEach(marker => marker.setMap(null));

          const marker = new window.google.maps.Marker({
            position: newPos,
            map: map,
            title: "Your Location",
            icon: {
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#4285f4" stroke="white" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24)
            }
          });

          setMarkers([marker]);
        }
      },
      (error) => {
        console.error("Tracking error:", error);
        setTracking(false);
        setWatchId(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    setWatchId(id);
  };

  // Stop tracking
  const stopTracking = () => {
    setTracking(false);
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  };

  // Add marker on map click
  useEffect(() => {
    if (map) {
      const clickListener = map.addListener("click", (event) => {
        const clickedPos = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };

        const marker = new window.google.maps.Marker({
          position: clickedPos,
          map: map,
          title: "Grievance Location",
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#ea4335"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24)
          }
        });

        setMarkers(prev => [...prev, marker]);

        // Call the callback if provided
        if (onLocationSelect) {
          onLocationSelect(clickedPos);
        }
      });

      return () => window.google.maps.event.removeListener(clickListener);
    }
  }, [map, onLocationSelect]);

  return (
    <div className="map-container">
      <div className="map-controls">
        <button onClick={getCurrentLocation} className="btn-secondary">
          📍 My Location
        </button>
        {!tracking ? (
          <button onClick={startTracking} className="btn-primary">
            🚀 Start Tracking
          </button>
        ) : (
          <button onClick={stopTracking} className="btn-danger">
            ⏹️ Stop Tracking
          </button>
        )}
        <div className="tracking-status">
          {tracking && <span className="tracking-indicator">● Tracking Active</span>}
        </div>
      </div>
      <div ref={ref} className="map-element" />
      {userLocation && (
        <div className="location-info">
          <small>
            Current: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
            {userLocation.timestamp && ` • ${new Date(userLocation.timestamp).toLocaleTimeString()}`}
          </small>
        </div>
      )}
    </div>
  );
}

export default function Map({ apiKey }) {
  return (
    <Wrapper apiKey={apiKey} render={render} />
  );
}
