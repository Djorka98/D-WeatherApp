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

export const WeatherDisplay = ({ weatherData, unit, theme }) => {
  const { t } = useTranslation();

  if (!weatherData) {
    return null;
  }

  const weatherCondition = weatherData.weather[0].main;
  const temperatureUnit = unit === 'metric' ? '°C' : '°F';

  const currentTime = new Date().getTime() / 1000;
  const isDayTime = currentTime > weatherData.sys.sunrise && currentTime < weatherData.sys.sunset;

  const darkenStyle = { filter: 'brightness(0.8)' };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        exit={{ opacity: 0 }}
      >
        <div className={`p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-center md:justify-start transition-all duration-300 space-y-6 md:space-y-0 md:space-x-8 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
          <div className="flex flex-col items-center md:items-start w-full md:w-1/2 lg:w-1/3 xl:w-1/3 2xl:w-1/4 space-y-4">
            <h2 className="text-3xl font-bold">
              {weatherData.name}, {weatherData.sys.country}
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
              <strong>{t('temperature')}:</strong> {weatherData.main.temp} {temperatureUnit}
            </p>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
              <strong>{t('humidity')}:</strong> {weatherData.main.humidity}%
            </p>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
              <strong>{t('windSpeed')}:</strong> {weatherData.wind.speed} m/s
            </p>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('sunrise')}:</strong> {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}
            </p>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('sunset')}:</strong> {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}
            </p>
          </div> 

          <div className="mt-4 md:mt-0 flex justify-center md:justify-start w-full md:w-1/2">
            {weatherCondition === 'Rain' && (
              <Lottie animationData={rainAnimation} loop={true} style={{ width: 150, height: 150 }} />
            )}
            {weatherCondition === 'Snow' && (
              <Lottie animationData={snowAnimation} loop={true} style={{ width: 150, height: 150 }} />
            )}
            {weatherCondition === 'Clear' && isDayTime && (
              <Lottie animationData={sunAnimation} loop={true} style={{ width: 150, height: 150 }} />
            )}
            {weatherCondition === 'Clear' && !isDayTime && (
              <Lottie animationData={nightClearAnimation} loop={true} style={{ width: 150, height: 150 }} />
            )}
            {weatherCondition === 'Clouds' && isDayTime && (
              <Lottie animationData={cloudyAnimation} loop={true} style={{ width: 150, height: 150 }} />
            )}
            {weatherCondition === 'Clouds' && !isDayTime && (
              <Lottie animationData={nightCloudyAnimation} loop={true} style={{ width: 150, height: 150, ...darkenStyle }} />
            )}
            {weatherCondition === 'Thunderstorm' && (
              <Lottie animationData={thunderstormAnimation} loop={true} style={{ width: 150, height: 150 }} />
            )}
            {weatherCondition === 'Fog' && (
              <Lottie animationData={fogAnimation} loop={true} style={{ width: 150, height: 150, ...darkenStyle }} />
            )}
            {weatherCondition === 'Mist' && (
              <Lottie animationData={fogAnimation} loop={true} style={{ width: 150, height: 150, ...darkenStyle }} />
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};