import { useState, useCallback } from 'react';
import { WeatherData } from '../types/weather';
import { AQIData } from '../types/aqi';
import { SevenDayTrendsData } from '../types/trends';
import { MOCK_CITIES, CityData } from '../data/mockCities';
import { DEFAULT_WEATHER, DEFAULT_AQI, DEFAULT_SEVEN_DAY_TRENDS, DEFAULT_LOCATION } from '../data/sampleData';
import { fetchWeatherData } from '../services/weatherService';
import { fetchAQIData } from '../services/aqiService';

export function useEnvironment() {
  const [currentCity, setCurrentCity] = useState<string>(DEFAULT_LOCATION.city);
  const [currentState, setCurrentState] = useState<string>(DEFAULT_LOCATION.state);
  const [currentCountry, setCurrentCountry] = useState<string>(DEFAULT_LOCATION.country);
  
  const [weather, setWeather] = useState<WeatherData>(DEFAULT_WEATHER);
  const [aqi, setAqi] = useState<AQIData>(DEFAULT_AQI);
  const [trends, setTrends] = useState<SevenDayTrendsData>(DEFAULT_SEVEN_DAY_TRENDS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectCity = useCallback(async (city: CityData) => {
    setIsLoading(true);
    setCurrentCity(city.name);
    setCurrentState(city.state);
    setCurrentCountry(city.country);

    const [newWeather, newAqi] = await Promise.all([
      fetchWeatherData(city.lat, city.lon, city.weather),
      fetchAQIData(city.lat, city.lon, city.aqi),
    ]);

    setWeather(newWeather);
    setAqi(newAqi);
    setTrends(city.trends);
    setIsLoading(false);
  }, []);

  const searchAndSelectCity = useCallback((searchQuery: string) => {
    const query = searchQuery.toLowerCase().trim();
    const matchedCity = MOCK_CITIES.find(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.state.toLowerCase().includes(query) ||
        c.country.toLowerCase().includes(query)
    );

    if (matchedCity) {
      selectCity(matchedCity);
      return true;
    }
    return false;
  }, [selectCity]);

  const refreshEnvironment = useCallback(async () => {
    setIsLoading(true);
    const [newWeather, newAqi] = await Promise.all([
      fetchWeatherData(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, weather),
      fetchAQIData(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, aqi),
    ]);
    setWeather(newWeather);
    setAqi(newAqi);
    setIsLoading(false);
  }, [weather, aqi]);

  return {
    locationName: `${currentCity}, ${currentState}`,
    cityName: currentCity,
    stateName: currentState,
    countryName: currentCountry,
    weather,
    aqi,
    trends,
    isLoading,
    availableCities: MOCK_CITIES,
    selectCity,
    searchAndSelectCity,
    refreshEnvironment,
  };
}
