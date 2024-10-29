import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-shadow.png';

// Corrección para el ícono predeterminado del marcador en Leaflet
// Se ajusta para que funcione correctamente con React importando el ícono y la sombra
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Componente WeatherMap - Renderiza un mapa con capacidad para seleccionar ubicaciones
// Recibe la función onMapClick como prop para manejar clics en el mapa
export const WeatherMap = ({ onMapClick }) => {
  const [markerPosition, setMarkerPosition] = useState(null); // Estado para la posición del marcador en el mapa

  // Componente para manejar eventos de clic en el mapa
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng; // Obtiene latitud y longitud del clic
        setMarkerPosition([lat, lng]); // Actualiza la posición del marcador
        if (onMapClick) {
          onMapClick(lat, lng); // Llama a la función onMapClick con latitud y longitud
        }
      },
    });
    return null; // No renderiza ningún elemento visual, solo controla los eventos
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
          center={[51.505, -0.09]} // Coordenadas iniciales para centrar el mapa (Londres)
          zoom={3} // Nivel de zoom inicial
          style={{ height: '400px', width: '100%', zIndex: 1 }} // Estilos de tamaño del mapa
          className="my-4" // Clase CSS para espaciado superior e inferior
        >
          {/* Capa de mosaico del mapa proporcionada por OpenStreetMap */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {/* Si hay una posición de marcador, se renderiza en el mapa */}
          {markerPosition && (
            <Marker position={markerPosition}>
              <Popup>
                Selected Location: <br /> Latitude: {markerPosition[0]} <br /> Longitude: {markerPosition[1]}
              </Popup>
            </Marker>
          )}
          <MapClickHandler /> {/* Agrega la funcionalidad de clic al mapa */}
        </MapContainer>
      </motion.div>
    </>
  );
};