import React, { useState, useEffect } from 'react';
import { XStack, Text, Spinner, Image } from 'tamagui';
import { getCampusWeather, Campus } from '../lib/get-weather';

// The user agent string for API requests
const USER_AGENT = 'CampusWeatherApp/1.0 (https://example.com)';

// Cache duration in milliseconds (15 minutes)
const CACHE_DURATION = 15 * 60 * 1000;

interface CompactWeatherProps {
  campus: Campus;
  iconSize?: number;
  color?: string;
}

interface CachedWeatherData {
  data: Awaited<ReturnType<typeof getCampusWeather>>;
  timestamp: number;
}

// Global cache to share between component instances
const weatherCache: Record<Campus, CachedWeatherData | null> = {
  [Campus.OSLO]: null,
  [Campus.BERGEN]: null,
  [Campus.STAVANGER]: null,
  [Campus.TRONDHEIM]: null,
};

// Import all weather icons as PNGs instead of SVGs
const weatherIcons: Record<string, any> = {
  'clearsky_day': require('../assets/weather/clearsky_day.png'),
  'clearsky_night': require('../assets/weather/clearsky_night.png'),
  'clearsky_polartwilight': require('../assets/weather/clearsky_polartwilight.png'),
  'cloudy': require('../assets/weather/cloudy.png'),
  'fair_day': require('../assets/weather/fair_day.png'),
  'fair_night': require('../assets/weather/fair_night.png'),
  'fair_polartwilight': require('../assets/weather/fair_polartwilight.png'),
  'fog': require('../assets/weather/fog.png'),
  'heavyrain': require('../assets/weather/heavyrain.png'),
  'heavyrainandthunder': require('../assets/weather/heavyrainandthunder.png'),
  'heavyrainshowers_day': require('../assets/weather/heavyrainshowers_day.png'),
  'heavyrainshowers_night': require('../assets/weather/heavyrainshowers_night.png'),
  'heavyrainshowers_polartwilight': require('../assets/weather/heavyrainshowers_polartwilight.png'),
  'heavyrainshowersandthunder_day': require('../assets/weather/heavyrainshowersandthunder_day.png'),
  'heavyrainshowersandthunder_night': require('../assets/weather/heavyrainshowersandthunder_night.png'),
  'heavyrainshowersandthunder_polartwilight': require('../assets/weather/heavyrainshowersandthunder_polartwilight.png'),
  'heavysleet': require('../assets/weather/heavysleet.png'),
  'heavysleetandthunder': require('../assets/weather/heavysleetandthunder.png'),
  'heavysleetshowers_day': require('../assets/weather/heavysleetshowers_day.png'),
  'heavysleetshowers_night': require('../assets/weather/heavysleetshowers_night.png'),
  'heavysleetshowers_polartwilight': require('../assets/weather/heavysleetshowers_polartwilight.png'),
  'heavysleetshowersandthunder_day': require('../assets/weather/heavysleetshowersandthunder_day.png'),
  'heavysleetshowersandthunder_night': require('../assets/weather/heavysleetshowersandthunder_night.png'),
  'heavysleetshowersandthunder_polartwilight': require('../assets/weather/heavysleetshowersandthunder_polartwilight.png'),
  'heavysnow': require('../assets/weather/heavysnow.png'),
  'heavysnowandthunder': require('../assets/weather/heavysnowandthunder.png'),
  'heavysnowshowers_day': require('../assets/weather/heavysnowshowers_day.png'),
  'heavysnowshowers_night': require('../assets/weather/heavysnowshowers_night.png'),
  'heavysnowshowers_polartwilight': require('../assets/weather/heavysnowshowers_polartwilight.png'),
  'heavysnowshowersandthunder_day': require('../assets/weather/heavysnowshowersandthunder_day.png'),
  'heavysnowshowersandthunder_night': require('../assets/weather/heavysnowshowersandthunder_night.png'),
  'heavysnowshowersandthunder_polartwilight': require('../assets/weather/heavysnowshowersandthunder_polartwilight.png'),
  'lightrain': require('../assets/weather/lightrain.png'),
  'lightrainandthunder': require('../assets/weather/lightrainandthunder.png'),
  'lightrainshowers_day': require('../assets/weather/lightrainshowers_day.png'),
  'lightrainshowers_night': require('../assets/weather/lightrainshowers_night.png'),
  'lightrainshowers_polartwilight': require('../assets/weather/lightrainshowers_polartwilight.png'),
  'lightrainshowersandthunder_day': require('../assets/weather/lightrainshowersandthunder_day.png'),
  'lightrainshowersandthunder_night': require('../assets/weather/lightrainshowersandthunder_night.png'),
  'lightrainshowersandthunder_polartwilight': require('../assets/weather/lightrainshowersandthunder_polartwilight.png'),
  'lightsleet': require('../assets/weather/lightsleet.png'),
  'lightsleetandthunder': require('../assets/weather/lightsleetandthunder.png'),
  'lightsleetshowers_day': require('../assets/weather/lightsleetshowers_day.png'),
  'lightsleetshowers_night': require('../assets/weather/lightsleetshowers_night.png'),
  'lightsleetshowers_polartwilight': require('../assets/weather/lightsleetshowers_polartwilight.png'),
  'lightsnow': require('../assets/weather/lightsnow.png'),
  'lightsnowandthunder': require('../assets/weather/lightsnowandthunder.png'),
  'lightsnowshowers_day': require('../assets/weather/lightsnowshowers_day.png'),
  'lightsnowshowers_night': require('../assets/weather/lightsnowshowers_night.png'),
  'lightsnowshowers_polartwilight': require('../assets/weather/lightsnowshowers_polartwilight.png'),
  'lightssleetshowersandthunder_day': require('../assets/weather/lightssleetshowersandthunder_day.png'),
  'lightssleetshowersandthunder_night': require('../assets/weather/lightssleetshowersandthunder_night.png'),
  'lightssleetshowersandthunder_polartwilight': require('../assets/weather/lightssleetshowersandthunder_polartwilight.png'),
  'lightssnowshowersandthunder_day': require('../assets/weather/lightssnowshowersandthunder_day.png'),
  'lightssnowshowersandthunder_night': require('../assets/weather/lightssnowshowersandthunder_night.png'),
  'lightssnowshowersandthunder_polartwilight': require('../assets/weather/lightssnowshowersandthunder_polartwilight.png'),
  'partlycloudy_day': require('../assets/weather/partlycloudy_day.png'),
  'partlycloudy_night': require('../assets/weather/partlycloudy_night.png'),
  'partlycloudy_polartwilight': require('../assets/weather/partlycloudy_polartwilight.png'),
  'rain': require('../assets/weather/rain.png'),
  'rainandthunder': require('../assets/weather/rainandthunder.png'),
  'rainshowers_day': require('../assets/weather/rainshowers_day.png'),
  'rainshowers_night': require('../assets/weather/rainshowers_night.png'),
  'rainshowers_polartwilight': require('../assets/weather/rainshowers_polartwilight.png'),
  'rainshowersandthunder_day': require('../assets/weather/rainshowersandthunder_day.png'),
  'rainshowersandthunder_night': require('../assets/weather/rainshowersandthunder_night.png'),
  'rainshowersandthunder_polartwilight': require('../assets/weather/rainshowersandthunder_polartwilight.png'),
  'sleet': require('../assets/weather/sleet.png'),
  'sleetandthunder': require('../assets/weather/sleetandthunder.png'),
  'sleetshowers_day': require('../assets/weather/sleetshowers_day.png'),
  'sleetshowers_night': require('../assets/weather/sleetshowers_night.png'),
  'sleetshowers_polartwilight': require('../assets/weather/sleetshowers_polartwilight.png'),
  'sleetshowersandthunder_day': require('../assets/weather/sleetshowersandthunder_day.png'),
  'sleetshowersandthunder_night': require('../assets/weather/sleetshowersandthunder_night.png'),
  'sleetshowersandthunder_polartwilight': require('../assets/weather/sleetshowersandthunder_polartwilight.png'),
  'snow': require('../assets/weather/snow.png'),
  'snowandthunder': require('../assets/weather/snowandthunder.png'),
  'snowshowers_day': require('../assets/weather/snowshowers_day.png'),
  'snowshowers_night': require('../assets/weather/snowshowers_night.png'),
  'snowshowers_polartwilight': require('../assets/weather/snowshowers_polartwilight.png'),
  'snowshowersandthunder_day': require('../assets/weather/snowshowersandthunder_day.png'),
  'snowshowersandthunder_night': require('../assets/weather/snowshowersandthunder_night.png'),
  'snowshowersandthunder_polartwilight': require('../assets/weather/snowshowersandthunder_polartwilight.png'),
};

// Fallback icon in case the symbol code doesn't match any of our assets
const fallbackIcon = require('../assets/weather/cloudy.png');

const CompactWeather: React.FC<CompactWeatherProps> = ({ 
  campus,
  iconSize = 36,
  color = 'white'
}) => {
  const [weatherData, setWeatherData] = useState<Awaited<ReturnType<typeof getCampusWeather>> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather data for the specified campus
  const fetchWeather = async (campusName: Campus) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if we have cached data that's still valid
      const cachedData = weatherCache[campusName];
      const now = Date.now();
      
      if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
        // Use cached data if it's still valid
        setWeatherData(cachedData.data);
      } else {
        // Fetch fresh data
        const data = await getCampusWeather(campusName, USER_AGENT);
        
        // Update cache
        weatherCache[campusName] = {
          data,
          timestamp: now
        };
        
        setWeatherData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      console.error('Error fetching weather:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather when the component mounts or campus changes
  useEffect(() => {
    fetchWeather(campus);
  }, [campus]);

  // Format temperature with no decimal places
  const formatTemperature = (temp: number) => {
    return `${Math.round(temp)}°`;
  };

  if (loading) {
    return (
      <XStack alignItems="center" justifyContent="center" width={iconSize * 3}>
        <Spinner size="small" color={color} />
      </XStack>
    );
  }

  if (error || !weatherData) {
    return null; // Don't show anything if there's an error
  }

  // Get the appropriate weather icon resource ID
  const iconSource = weatherData.current.symbolCode in weatherIcons 
    ? weatherIcons[weatherData.current.symbolCode] 
    : fallbackIcon;

  return (
    <XStack alignItems="center" gap="$3">
      <Image 
        source={iconSource}
        width={iconSize}
        height={iconSize}
        objectFit="contain"
      />
      <Text color={color} fontSize={24} fontWeight="600">
        {formatTemperature(weatherData.current.temperature)}
      </Text>
    </XStack>
  );
};

export default CompactWeather;