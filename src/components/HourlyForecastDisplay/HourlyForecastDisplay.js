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

const isDayTime = (hora) => {
  return hora >= 6 && hora < 18;
};

const getWeatherAnimation = (weatherCondition, dayTime) => {
  if (dayTime) {

    switch (weatherCondition) {
      case 'Clear':
        return sunAnimation;
      case 'Clouds':
        return cloudyAnimation;
      case 'Rain':
        return rainAnimation;
      case 'Snow':
        return snowAnimation;
      case 'Thunderstorm':
        return thunderstormAnimation;
      case 'Fog':
        return fogAnimation;
      case 'Mist':
        return fogAnimation;
      default:
        return cloudyAnimation;
    }
  } else {

    switch (weatherCondition) {
      case 'Clear':
        return nightClearAnimation;
      case 'Clouds':
        return nightCloudyAnimation;
      case 'Rain':
        return rainAnimation;
      case 'Snow':
        return snowAnimation;
      case 'Thunderstorm':
        return thunderstormAnimation;
      case 'Fog':
        return fogAnimation;
      case 'Mist':
        return fogAnimation;
      default:
        return nightCloudyAnimation;
    }
  }
};

export const HourlyForecastDisplay = ({ forecastData, unit, theme }) => {
  const { t } = useTranslation();
  const temperatureUnit = unit === 'metric' ? '°C' : '°F';

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
            const forecastTime = forecast.dt * 1000;
            const hora = new Date(forecastTime).getHours();
            const dayTime = isDayTime(hora);
            const weatherCondition = forecast.weather[0].main;
            const animationData = getWeatherAnimation(weatherCondition, dayTime);

            const darkenStyle = animationData === nightCloudyAnimation || animationData === fogAnimation
              ? { filter: 'brightness(0.8)' }
              : {};

            return (
              <div key={index} className={`p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <p className="text-sm mb-2">{new Date(forecastTime).toLocaleTimeString()}</p>
                
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