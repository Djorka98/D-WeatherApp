import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WeatherDisplay } from './WeatherDisplay/WeatherDisplay';
import { ForecastDisplay } from './ForecastDisplay/ForecastDisplay';
import { HourlyForecastDisplay } from './HourlyForecastDisplay/HourlyForecastDisplay';
import { fetchWeatherData, fetchForecastData } from '../services/weatherService';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-shadow.png';
import { WeatherRecommendation } from './WeatherRecommendation/WeatherRecommendation';
import TemperatureChart from './weatherGraphic/TemperatureChart';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MoonIcon } from '@heroicons/react/24/solid';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading.json';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export const Weather = () => {
  const { t, i18n } = useTranslation();
  const [city, setCity] = useState(localStorage.getItem('city') || '');
  const [debouncedCity, setDebouncedCity] = useState(city);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [hourlyForecastData, setHourlyForecastData] = useState(null);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState(localStorage.getItem('unit') || 'metric');
  const [locationCoords, setLocationCoords] = useState(
    JSON.parse(localStorage.getItem('locationCoords')) || { lat: 51.505, lon: -0.09 }
  );
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem('favorites')) || []
  );
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${process.env.REACT_APP_WEATHER_API_KEY}`
      );
      if (response.data.length > 0) {
        return response.data[0].country;
      }
      return null;
    } catch (error) {
      console.error('Failed to reverse geocode', error);
      return null;
    }
  };

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('Notification permission status:', permission);
      });
    }
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationCoords({ lat: latitude, lon: longitude });
        localStorage.setItem('locationCoords', JSON.stringify({ lat: latitude, lon: longitude }));

        const countryFromCoords = await reverseGeocode(latitude, longitude);
        if (countryFromCoords) {
          setCity(countryFromCoords);
          setDebouncedCity(countryFromCoords);
          localStorage.setItem('city', countryFromCoords);
        }

        setLoading(false);
      },
      (error) => {
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCity(city);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [city]);

  const fetchWeatherAndForecast = useCallback(async () => {
    try {
      const weather = locationCoords
        ? await fetchWeatherData('', locationCoords.lat, locationCoords.lon, unit)
        : await fetchWeatherData(debouncedCity, null, null, unit);

      const forecast = locationCoords
        ? await fetchForecastData('', locationCoords.lat, locationCoords.lon, unit)
        : await fetchForecastData(debouncedCity, null, null, unit);

      setWeatherData(weather);
      setForecastData(forecast);
      setHourlyForecastData(forecast?.list?.slice(0, 12));
      setError(null);

      if (weather?.alerts?.length > 0) {
        weather.alerts.forEach((alert) => {
          new Notification(alert.event, {
            body: alert.description,
          });
        });
      }
    } catch (error) {
      setError(error.message);
      setWeatherData(null);
      setForecastData(null);
      setHourlyForecastData(null);
    }
  }, [debouncedCity, unit, locationCoords]);

  useEffect(() => {
    if (debouncedCity || locationCoords) {
      fetchWeatherAndForecast();
    }
  }, [debouncedCity, unit, locationCoords, fetchWeatherAndForecast]);

  const handleMapClick = async (lat, lon) => {
    setLocationCoords({ lat, lon });
    localStorage.setItem("locationCoords", JSON.stringify({ lat, lon }));
  
    const countryName = await reverseGeocode(lat, lon);
    if (countryName) {
      setCity(countryName);
      setDebouncedCity(countryName);
      localStorage.setItem("city", countryName);
    }
  }; 

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    localStorage.setItem('unit', newUnit);
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleAddToFavorites = () => {
    if (city && !favorites.some(fav => fav.city === city)) {
      const newFavorite = { city, coords: locationCoords, weatherData };
      const updatedFavorites = [...favorites, newFavorite];
      setFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    }
  };

  const handleRemoveFromFavorites = (cityName) => {
    const updatedFavorites = favorites.filter(fav => fav.city !== cityName);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const handleFavoriteClick = async (favorite) => {
    setLocationCoords(favorite.coords);
    setCity(favorite.city);
    setDebouncedCity(favorite.city);
    setSelectedFavorite(favorite.city);

    try {
      const weather = await fetchWeatherData('', favorite.coords.lat, favorite.coords.lon, unit);
      const forecast = await fetchForecastData('', favorite.coords.lat, favorite.coords.lon, unit);
      setWeatherData(weather);
      setForecastData(forecast);
      setHourlyForecastData(forecast?.list?.slice(0, 12));
    } catch (error) {
      console.error('Failed to fetch weather data for favorite location', error);
    }
  };

  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 100);
    }
  }, [locationCoords]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
   

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      exit={{ opacity: 0 }}
      className={`p-4 mx-auto duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-blue-100 text-gray-800'}`} 
    >
      <motion.h1 className="text-[30px] font-bold mt-3 mb-10 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        exit={{ opacity: 0 }}
      >{t('weatherApp')}</motion.h1>

      <div className="fixed bottom-4 right-4 flex flex-col justify-between items-center space-y-2 z-50">
        <motion.button
          onClick={handleThemeToggle}
          className={`p-3 rounded-full shadow-lg transition-colors duration-300 hover:scale-105
            ${theme === 'dark' ? 'bg-blue-800 text-white hover:bg-blue-600' : 'bg-gray-800 text-gray-800 hover:bg-gray-600'}
          `}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          exit={{ opacity: 0 }}
        >
          <MoonIcon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
        </motion.button>

        <motion.button
          onClick={() => changeLanguage('en')}
          className="p-2 font-semibold text-white rounded-full shadow-lg transition-transform transform hover:scale-105 duration-300 bg-blue-500 hover:bg-blue-600"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          exit={{ opacity: 0 }}
        >
          EN
        </motion.button>

        <motion.button
          onClick={() => changeLanguage('es')}
          className="p-2 font-semibold text-white rounded-full shadow-lg transition-transform transform hover:scale-105 duration-300 bg-blue-500 hover:bg-blue-600"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          exit={{ opacity: 0 }}
        >
          ES
        </motion.button>
      </div>

      {loading && (
        <motion.div className="flex justify-center items-center h-screen"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          exit={{ opacity: 0 }}
        >
          <Lottie animationData={loadingAnimation} loop={true} style={{ width: 150, height: 150 }} />
          <p className="ml-4">{t('fetchingYourLocation')}</p>
        </motion.div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                exit={{ opacity: 0 }}
              >
                <button
                  onClick={handleAddToFavorites}
                  className="p-2 bg-green-500 text-white rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:bg-green-600 duration-300"
                >
                  {t('saveFavorites')}
                </button>
              </motion.div>

              <div className={`mb-4 overflow-y-auto h-auto max-h-[825px] scrollbar-thin ${theme === 'dark' ? 'scrollbar-thumb-gray-600 scrollbar-track-gray-800' : 'scrollbar-thumb-gray-400 scrollbar-track-gray-200'}`}>
                <motion.h2 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  exit={{ opacity: 0 }}
                  className={`text-lg font-bold p-3 sticky top-0 shadow-md z-10 ${theme === 'dark' ? 'bg-blue-800 text-white' : 'bg-blue-200 text-blue-800'}`}
                >
                  {t('favoriteLocations')}
                </motion.h2>

                {favorites.length > 0 ? (
                 <motion.ul 
                  className="mt-2 space-y-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  exit={{ opacity: 0 }}
                 >
                   {favorites.map((fav, index) => (
                     <motion.li
                       key={index}
                       className={`flex justify-between items-center p-2 rounded-lg shadow-sm cursor-pointer transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                       onClick={() => handleFavoriteClick(fav)}
                       initial={{ opacity: 0 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       transition={{ duration: 0.5 }}
                       viewport={{ once: true }}
                       exit={{ opacity: 0 }}
                     >
                       <span className="font-medium">{fav.city}</span>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           handleRemoveFromFavorites(fav.city);
                         }}
                         className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-md transition-transform transform hover:scale-105"
                       >
                         {t('remove')}
                       </button>
                     </motion.li>
                   ))}
                 </motion.ul>
                ) : (
                  <div className="p-4 text-gray-700 dark:text-gray-500 text-center italic">
                    {t('noFavoriteLocations')}
                  </div>
                )}
              </div>
            </motion.div>

            <div className="lg:col-span-4">
              <motion.div 
                className="flex items-center mb-4 justify-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                exit={{ opacity: 0 }}
              >
                <label className="font-bold mr-2">{t('unit')}:</label>
                <button
                  onClick={() => handleUnitChange('metric')}
                  className={`p-2 mr-2 rounded-lg shadow-lg transition-colors duration-300 ${
                    unit === 'metric' ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  {t('celsius')}
                </button>
                <button
                  onClick={() => handleUnitChange('imperial')}
                  className={`p-2 rounded-lg shadow-lg transition-colors duration-300 ${
                    unit === 'imperial' ? 'bg-blue-500 text-white' : theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  {t('fahrenheit')}
                </button>
              </motion.div>

              <MapContainer
                center={[locationCoords.lat, locationCoords.lon]}
                zoom={10}
                minZoom={3}
                maxBounds={[[-85, -180], [85, 180]]}
                maxBoundsViscosity={1.0}
                whenCreated={(mapInstance) => {
                  mapRef.current = mapInstance;
                  mapInstance.invalidateSize();
                }}
                style={{ height: '400px', width: '100%', zIndex: 1 }}
                className="my-4"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {selectedFavorite ? (
                  <Marker position={[locationCoords.lat, locationCoords.lon]}>
                    <Popup>{t('weatherLocation')}</Popup>
                  </Marker>
                ) : (
                  <Marker position={[locationCoords.lat, locationCoords.lon]}>
                    <Popup>{t('weatherLocation')}</Popup>
                  </Marker>
                )}
                <MapClickHandler onMapClick={handleMapClick} />
              </MapContainer>
              <WeatherDisplay weatherData={weatherData} unit={unit} theme={theme} />

              <WeatherRecommendation weatherData={weatherData} theme={theme} />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            <div className="xl:col-span-2">
              {forecastData && <ForecastDisplay forecastData={forecastData} unit={unit} theme={theme} />}
            </div>

            <div className="xl:col-span-3">
              {hourlyForecastData && <HourlyForecastDisplay forecastData={forecastData} unit={unit} theme={theme} />}
            </div>
          </div>

          <div className='mt-8'>
            <TemperatureChart unit={unit} theme={theme} />
          </div>
        </>
      )}
      {error && <motion.p className="text-red-500 text-center font-semibold"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        exit={{ opacity: 0 }}
      >{t('failedFetch')}</motion.p>}

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        exit={{ opacity: 0 }}
        className={`w-full py-4 my-6 rounded-lg shadow-lg text-center ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}
      >
        <p className="text-sm font-semibold">
          © {new Date().getFullYear()} D-Weather app. {t('copyrightFooter')}
        </p>
      </motion.footer>

    </motion.div>
  );
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      if (onMapClick) {
        onMapClick(lat, lng);
      }
    },
  });
  return null;
};