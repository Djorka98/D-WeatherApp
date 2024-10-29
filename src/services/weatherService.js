import axios from 'axios';

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

// Función para obtener datos de clima actual
export const fetchWeatherData = async (city = null, lat = null, lon = null, unit = 'metric') => {
  try {
    const params = {
      appid: API_KEY,
      units: unit,
    };

    if (lat && lon) {
      params.lat = lat;
      params.lon = lon;
    } else if (city) {
      params.q = city;
    } else {
      throw new Error("City or coordinates are required to fetch weather data");
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', { params });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('City not found. Please check your input.');
      } else if (error.response.status === 429) {
        throw new Error('API request limit exceeded. Please try again later.');
      } else {
        throw new Error('Failed to fetch weather data. Please try again later.');
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unknown error occurred.');
    }
  }
};

// Función para obtener pronóstico extendido
export const fetchForecastData = async (city, lat = null, lon = null, unit = 'metric') => {
  try {
    const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
    const response = await axios.get(FORECAST_URL, {
      params: {
        q: city || undefined,
        lat: lat || undefined,
        lon: lon || undefined,
        appid: API_KEY,
        units: unit,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('City not found. Please check your input.');
      } else if (error.response.status === 429) {
        throw new Error('API request limit exceeded. Please try again later.');
      } else {
        throw new Error('Failed to fetch forecast data. Please try again later.');
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unknown error occurred.');
    }
  }
};

export const getMonthlyTemperatureData = () => {
  // Simulación de temperaturas para el mes actual (ej. 30 días)
  const temperatures = Array.from({ length: 30 }, () => Math.random() * 10 + 15);
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth(), i + 1);
    return date.toISOString().split("T")[0];
  });

  return days.map((day, index) => ({
    date: day,
    temperature: temperatures[index],
  }));
};