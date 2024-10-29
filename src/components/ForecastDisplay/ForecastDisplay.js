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

/**
 * Función que devuelve la animación correspondiente según el tipo de clima.
 * @param {string} condition - El tipo de clima (Rain, Snow, Clear, Clouds, Thunderstorm, Fog).
 * @returns {Object} - La animación de Lottie correspondiente al tipo de clima.
 */
const getWeatherAnimation = (condition) => {
  switch (condition) {
    case 'Rain':
      return rainAnimation;
    case 'Snow':
      return snowAnimation;
    case 'Clear':
      return sunAnimation;
    case 'Clouds':
      return cloudyAnimation;
    case 'Thunderstorm':
      return thunderstormAnimation;
    case 'Fog':
      return fogAnimation;
    case 'Mist':
      return fogAnimation;
    default:
      return sunAnimation; // Por defecto, se muestra el sol.
  }
};

/**
 * Función para agrupar pronósticos por día.
 * Se asegura de que solo haya un pronóstico por día en el arreglo resultante.
 * @param {Array} forecastList - Lista completa de pronósticos.
 * @returns {Array} - Arreglo de pronósticos agrupados por día, máximo 5 días.
 */
const groupForecastByDay = (forecastList) => {
  const dailyForecasts = [];
  const usedDates = new Set(); // Set para asegurarse de no duplicar días

  forecastList.forEach((forecast) => {
    const forecastDate = new Date(forecast.dt * 1000).toLocaleDateString(); // Extrae solo la fecha del pronóstico
    if (!usedDates.has(forecastDate)) { // Si la fecha no ha sido usada
      dailyForecasts.push(forecast); // Agrega el pronóstico a dailyForecasts
      usedDates.add(forecastDate); // Marca la fecha como usada
    }
  });

  return dailyForecasts.slice(0, 5); // Limita el resultado a los primeros 5 días
};

/**
 * Componente principal para mostrar el pronóstico de 5 días.
 * Muestra cada día con una animación, la fecha y la temperatura.
 * @param {Object} props - Propiedades del componente.
 * @param {Object} props.forecastData - Datos del pronóstico, incluyendo lista de días.
 * @param {string} props.unit - Unidad de temperatura ('metric' o 'imperial').
 * @param {string} props.theme - Tema actual ('dark' o 'light').
 */
export const ForecastDisplay = ({ forecastData, unit, theme }) => {
  const { t } = useTranslation(); // Hook para la traducción
  const temperatureUnit = unit === 'metric' ? '°C' : '°F'; // Define la unidad de temperatura

  // Agrupa los pronósticos por día
  const dailyForecasts = forecastData && forecastData.list ? groupForecastByDay(forecastData.list) : [];

  return (
    <>
      <motion.div className="mt-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        exit={{ opacity: 0 }}
      >
        <h2 className="text-lg font-bold mb-4">{t('5Forecast')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {dailyForecasts.map((forecast, index) => {
            const forecastTime = forecast.dt * 1000; // Convierte el tiempo de UNIX a milisegundos
            const weatherCondition = forecast.weather[0].main; // Obtiene el tipo de clima del pronóstico
            const animationData = getWeatherAnimation(weatherCondition); // Obtiene la animación correspondiente

            // Aplica un filtro de oscuridad si la animación es de niebla
            const darkenStyle = animationData === fogAnimation
              ? { filter: 'brightness(0.8)' } // Hace que la animación sea un poco más oscura
              : {};

            return (
              <div key={index} className={`p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <p className="text-sm mb-2">{new Date(forecastTime).toLocaleDateString()}</p>
                <Lottie animationData={animationData} loop={true} style={{ width: 80, height: 80, ...darkenStyle }} />
                <p className="text-lg font-semibold mt-2">{forecast.main.temp} {temperatureUnit}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};