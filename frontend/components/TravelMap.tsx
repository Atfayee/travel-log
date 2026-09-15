"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type {
  Place
} from "../types/travel";


type TravelMapProps = {
  places: Place[];
  onPlaceClick?: (place: Place) => void;
};

const markerIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitBounds({ places }: { places: Place[] }) {
  const map = useMap();

  useEffect(() => {
    if (places.length === 0) {
      return;
    }

    if (places.length === 1) {
      map.setView(
        [places[0].latitude, places[0].longitude],
        14
      );

      return;
    }

    const bounds = L.latLngBounds(
      places.map((place) => [
        place.latitude,
        place.longitude,
      ])
    );

    map.fitBounds(bounds, {
      padding: [40, 40],
    });
  }, [places, map]);

  return null;
}

export default function TravelMap({
  places,
  onPlaceClick,
}: TravelMapProps) {
  if (places.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border bg-white">
        <p className="text-gray-500">
          这个城市暂时还没有旅行记录
        </p>
      </div>
    );
  }

  const firstPlace = places[0];

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <MapContainer
        center={[
          firstPlace.latitude,
          firstPlace.longitude,
        ]}
        zoom={13}
        style={{
          height: "500px",
          width: "100%",
        }}
      >
        <FitBounds places={places} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {places.map((place) => (
          <Marker
            key={place.id}
            position={[
              place.latitude,
              place.longitude,
            ]}
            icon={markerIcon}
          >
            <Popup>
              <div
                style={{
                  minWidth: "140px",
                }}
              >
                <strong
                  style={{
                    fontSize: "16px",
                  }}
                >
                  {place.name}
                </strong>

                <p
                  style={{
                    marginTop: "6px",
                    marginBottom: "10px",
                  }}
                >
                  {place.category ?? "未分类"}
                </p>

                <button
                  onClick={() =>
                    onPlaceClick?.(place)
                  }
                  style={{
                    cursor: "pointer",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    background: "#111827",
                    color: "white",
                  }}
                >
                  查看详情
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
