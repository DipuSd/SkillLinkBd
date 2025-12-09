import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Default center for Bangladesh (Dhaka)
const DEFAULT_CENTER = { lat: 23.8103, lng: 90.4125 };

/**
 * LocationMarker Component
 * 
 * Helper component to handle map clicks and marker placement.
 * 
 * @param {Object} position - Current marker position {lat, lng}
 * @param {Function} onLocationSelect - Callback when location is selected
 */
function LocationMarker({ position, onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

/**
 * LocationPicker Component
 * 
 * Map interface for selecting a location.
 * Uses OpenStreetMap and Leaflet.
 * Supports reverse geocoding to get address from coordinates.
 * 
 * @param {Object} value - Initial location value {latitude, longitude, locationName}
 * @param {Function} onChange - Callback with new location data
 * @param {boolean} [required=false] - Show required asterisk
 */
export default function LocationPicker({ value, onChange, required = false }) {
  const [position, setPosition] = useState(value || null);
  const [address, setAddress] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Reverse geocoding to get address from coordinates
  const getAddressFromCoordinates = async (lat, lng) => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setAddress(data.display_name);
        // Call onChange with both coordinates and address
        onChange({
          latitude: lat,
          longitude: lng,
          locationName: data.display_name,
        });
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      onChange({
        latitude: lat,
        longitude: lng,
        locationName: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      });
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleLocationSelect = (newPosition) => {
    setPosition(newPosition);
    getAddressFromCoordinates(newPosition.lat, newPosition.lng);
  };

  // Get user's current location
  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setPosition(newPos);
          getAddressFromCoordinates(newPos.lat, newPos.lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please click on the map to select your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser. Please click on the map to select your location.");
    }
  };

  useEffect(() => {
    if (value && value.latitude && value.longitude) {
      setPosition({ lat: value.latitude, lng: value.longitude });
      if (value.locationName) {
        setAddress(value.locationName);
      }
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-lg font-bold text-gray-700">
          Location {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="text-sm text-blue-500 hover:text-blue-700 font-semibold"
        >
          📍 Use Current Location
        </button>
      </div>
      
      <div className="rounded-lg overflow-hidden border-2 border-gray-200" style={{ height: "300px" }}>
        <MapContainer
          center={position ? [position.lat, position.lng] : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
          zoom={position ? 13 : 12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onLocationSelect={handleLocationSelect} />
        </MapContainer>
      </div>

      {position && (
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
          <p className="text-gray-600 font-semibold">Selected Location:</p>
          {isLoadingAddress ? (
            <p className="text-gray-500 italic">Loading address...</p>
          ) : (
            <p className="text-gray-800">{address || `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            Coordinates: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </p>
        </div>
      )}

      {!position && (
        <p className="text-sm text-gray-500 italic">
          Click on the map to select your location or use current location button
        </p>
      )}
    </div>
  );
}
