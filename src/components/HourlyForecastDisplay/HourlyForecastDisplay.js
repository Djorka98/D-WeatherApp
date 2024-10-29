import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import rainAnimation from '../../animations/rain.json';
import snowAnimation from '../../animations/snow.json';
import sunAnimation from '../../animations/sun.json';
import cloudyAnimation from '../../animations/cloudy.json';
import thunderstormAnimation from '../../animations/thunderstorm.json';
import fogAnimation from '../../animations/fog.json';
import nightClearAnimation from '../../animations/nightClear.json';
import nightCloudyAnimation from '../../animations/nightCloudy.json';

// Función para determinar si es de día o de noche
// Recibe la hora en formato de 24 horas y devuelve true si está entre 6 AM y 6 PM (día)
const isDayTime = (hora) => {
  return hora >= 6 && hora < 18; // Día entre 6 AM y 6 PM
};

// Función para obtener la animación basada en la condición climática y la hora del día
// Recibe la condición climática y un booleano que indica si es de día
// Retorna la animación correspondiente
const getWeatherAnimation = (weatherCondition, dayTime) => {
  if (dayTime) {
    // Animaciones de día
    switch (weatherCondition) {
      case 'Clear':
        return sunAnimation; // Sol durante el día
      case 'Clouds':
        return cloudyAnimation; // Nubes durante el día
      case 'Rain':
        return rainAnimation; // Lluvia
      case 'Snow':
        return snowAnimation; // Nieve
      case 'Thunderstorm':
        return thunderstormAnimation; // Tormenta eléctrica
      case 'Fog':
        return fogAnimation; // Niebla
      case 'Mist':
        return fogAnimation; // Niebla
      default:
        return cloudyAnimation; // Animación por defecto para climas no especificados (nubes)
    }
  } else {
    // Animaciones de noche
    switch (weatherCondition) {
      case 'Clear':
        return nightClearAnimation; // Noche despejada (luna)
      case 'Clouds':
        return nightCloudyAnimation; // Noche nublada
      case 'Rain':
        return rainAnimation; // Lluvia (igual de día o de noche)
      case 'Snow':
        return snowAnimation; // Nieve (igual de día o de noche)
      case 'Thunderstorm':
        return thunderstormAnimation; // Tormenta eléctrica (igual de día o de noche)
      case 'Fog':
        return fogAnimation; // Niebla (igual de día o de noche)
      case 'Mist':
        return fogAnimation; // Niebla (igual de día o de noche)
      default:
        return nightCloudyAnimation; // Animación por defecto para climas no especificados (nubes nocturnas)
    }
  }
};

// Componente para mostrar el pronóstico por hora
// Recibe forecastData (datos del pronóstico), unit (unidad de temperatura) y theme (tema oscuro o claro)
export const HourlyForecastDisplay = ({ forecastData, unit, theme }) => {
  const { t } = useTranslation(); // Hook para manejar traducciones
  const temperatureUnit = unit === 'metric' ? '°C' : '°F'; // Define la unidad de temperatura

  return (
    <>
      <motion.div className="mt-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        exit={{ opacity: 0 }}
      >
        <h2 className="text-lg font-bold mb-4">{t('hourlyForecast')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {forecastData?.list?.slice(0, 12).map((forecast, index) => {
            const forecastTime = forecast.dt * 1000; // Convierte el tiempo del pronóstico a milisegundos
            const hora = new Date(forecastTime).getHours(); // Obtiene la hora en formato de 24 horas
            const dayTime = isDayTime(hora); // Determina si es de día o noche
            const weatherCondition = forecast.weather[0].main; // Obtiene la condición climática
            const animationData = getWeatherAnimation(weatherCondition, dayTime); // Obtiene la animación correspondiente

            // Verifica si la animación es de tipo "nightCloudyAnimation" o "fogAnimation"
            // Si es así, aplica un filtro de oscuridad para mejorar el contraste
            const darkenStyle = animationData === nightCloudyAnimation || animationData === fogAnimation
              ? { filter: 'brightness(0.8)' } // Aplica filtro de oscuridad
              : {};

            return (
              <div key={index} className={`p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
                {/* Hora del pronóstico */}
                <p className="text-sm mb-2">{new Date(forecastTime).toLocaleTimeString()}</p>
                
                {/* Animación Lottie con la condición y el filtro opcional */}
                <Lottie animationData={animationData} loop={true} style={{ width: 80, height: 80, ...darkenStyle }} />
                
                {/* Temperatura del pronóstico */}
                <p className="text-lg font-semibold mt-2">{forecast.main.temp} {temperatureUnit}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};