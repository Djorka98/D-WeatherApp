import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export const WeatherMap = ({ onMapClick }) => {
  const [markerPosition, setMarkerPosition] = useState(null);

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        if (onMapClick) {
          onMapClick(lat, lng);
        }
      },
    });
    return null;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        exit={{ opacity: 0 }}
      >
        <MapContainer
          center={[51.505, -0.09]}
          zoom={3}
          style={{ height: '400px', width: '100%', zIndex: 1 }}
          className="my-4"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {markerPosition && (
            <Marker position={markerPosition}>
              <Popup>
                Selected Location: <br /> Latitude: {markerPosition[0]} <br /> Longitude: {markerPosition[1]}
              </Popup>
            </Marker>
          )}
          <MapClickHandler />
        </MapContainer>
      </motion.div>
    </>
  );
};