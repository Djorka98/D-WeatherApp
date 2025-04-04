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
      return sunAnimation;
  }
};

const groupForecastByDay = (forecastList) => {
  const dailyForecasts = [];
  const usedDates = new Set();

  forecastList.forEach((forecast) => {
    const forecastDate = new Date(forecast.dt * 1000).toLocaleDateString();
    if (!usedDates.has(forecastDate)) {
      dailyForecasts.push(forecast);
      usedDates.add(forecastDate);
    }
  });

  return dailyForecasts.slice(0, 5);
};

export const ForecastDisplay = ({ forecastData, unit, theme }) => {
  const { t } = useTranslation();
  const temperatureUnit = unit === 'metric' ? '°C' : '°F';

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
            const forecastTime = forecast.dt * 1000;
            const weatherCondition = forecast.weather[0].main;
            const animationData = getWeatherAnimation(weatherCondition);

            const darkenStyle = animationData === fogAnimation
              ? { filter: 'brightness(0.8)' }
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