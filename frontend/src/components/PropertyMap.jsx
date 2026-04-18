import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";

function PropertyMap({ address }) {

  const [coords, setCoords] = useState(null);

  useEffect(() => {

    const fetchCoordinates = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
        );

        const data = await res.json();

        if (data.length > 0) {
          setCoords([
            parseFloat(data[0].lat),
            parseFloat(data[0].lon)
          ]);
        }

      } catch (error) {
        console.error("Geocoding error:", error);
      }
    };

    if (address) {
      fetchCoordinates();
    }

  }, [address]);

  if (!coords) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        Loading Map...
      </div>
    );
  }

  return (
    <MapContainer
      center={coords}
      zoom={15}
      className="h-[300px] w-full rounded-2xl"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={coords}>
        <Popup>{address}</Popup>
      </Marker>
    </MapContainer>
  );
}

export default PropertyMap;