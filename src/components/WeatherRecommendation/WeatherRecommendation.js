import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const WeatherRecommendation = ({ weatherData, theme }) => {
  const { t } = useTranslation();

  if (!weatherData || !weatherData.main || !weatherData.weather) return null;

  let recommendation = '';

  if (weatherData.main.temp < 10) {
    recommendation = t("recommendation1");
  } else if (weatherData.main.temp < 20) {
    recommendation = t("recommendation2");
  } else if (weatherData.main.temp > 30) {
    recommendation = t("recommendation3");
  } else {
    recommendation = t("recommendation4");
  }

  if (weatherData.weather.some((condition) => condition.main === 'Rain')) {
    recommendation += t("recommendation5");
  }

  if (weatherData.wind && weatherData.wind.speed > 10) {
    recommendation += t("recommendation6");
  }

  if (weatherData.main.humidity > 70) {
    recommendation += t("recommendation7");
  }

  if (weatherData.main.temp < 0) {
    recommendation += t("recommendation8");
  }

  if (weatherData.visibility < 1000) {
    recommendation += t("recommendation9");
  }

  if (weatherData.weather.some((condition) => condition.main === 'Snow')) {
    recommendation += t("recommendation10");
  }

  if (weatherData.weather.some((condition) => condition.main === 'Thunderstorm')) {
    recommendation += t("recommendation11");
  }

  return (
    <>
      <motion.div className={`mt-4 p-6 rounded-lg shadow-md transition-all duration-300 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-blue-50 text-gray-900'}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        exit={{ opacity: 0 }}
      >
        <h2 className="text-lg font-bold mb-2">
          {t('recommendation')}:
        </h2>
        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
          {recommendation}
        </p>
      </motion.div>
    </>
  );
};