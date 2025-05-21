import React, { useState, useEffect } from 'react';
import { XStack, Text, Spinner, Image } from 'tamagui';
import { getCampusWeather, Campus } from '../lib/get-weather';
import { storage } from '../lib/appwrite';
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';

// The user agent string for API requests
const USER_AGENT = 'CampusWeatherApp/1.0 (https://example.com)';

// Cache duration in milliseconds (15 minutes)
const CACHE_DURATION = 15 * 60 * 1000;

// Appwrite bucket ID for weather icons
const WEATHER_ICONS_BUCKET_ID = 'weather_icons';

// Extended campus type to include 'National'
type ExtendedCampus = Campus | 'National';

// Type guard to check if a campus is National
const isNationalCampus = (campus: ExtendedCampus): campus is 'National' => {
  return campus === 'National';
};

interface CompactWeatherProps {
  campus: ExtendedCampus;
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

// Cache for icon URLs to avoid redundant Appwrite calls
interface IconUrlCache {
  url: string;
  timestamp: number;
}
const iconUrlCache: Record<string, IconUrlCache> = {};

// Function to shorten icon names to match those in Appwrite bucket
function getShortenedIconName(iconName: string): string {
  // Replace common phrases with abbreviations, matching the upload script logic
  let shortened = iconName
    .replace('showers', 'shwr')
    .replace('andthunder', '_t')
    .replace('polartwilight', 'pt')
    .replace('clearsky', 'clear')
    .replace('partly', 'p')
    .replace('heavy', 'h')
    .replace('light', 'l')
    .replace('_day', '_d')
    .replace('_night', '_n');
  
  // Ensure it's max 36 chars (accounting for .png extension)
  if (shortened.length > 32) {
    shortened = shortened.substring(0, 32);
  }
  
  return shortened;
}

// Fallback icon URL for cases where the symbol code doesn't match or can't be fetched
const FALLBACK_ICON_NAME = 'cloudy';

const CompactWeather: React.FC<CompactWeatherProps> = ({ 
  campus,
  iconSize = 36,
  color = 'white'
}) => {
  const [weatherData, setWeatherData] = useState<Awaited<ReturnType<typeof getCampusWeather>> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const { t } = useTranslation();
  
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
      setError(err instanceof Error ? err.message : t('failed-to-fetch-weather-data'));
      console.error('Error fetching weather:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get the weather icon URL from Appwrite
  const getIconUrl = async (symbolCode: string) => {
    try {
      // Check if we have the URL cached and it's still valid
      const now = Date.now();
      if (iconUrlCache[symbolCode] && (now - iconUrlCache[symbolCode].timestamp < CACHE_DURATION)) {
        return iconUrlCache[symbolCode].url;
      }

      // Get the shortened icon name to match what's in Appwrite
      const shortenedName = getShortenedIconName(symbolCode);
      const fileName = `${shortenedName}.png`;

      // Create a preview URL for the icon
      const previewUrl = storage.getFilePreview(WEATHER_ICONS_BUCKET_ID, fileName);
      // Convert URL object to string if needed
      const url = previewUrl.toString();
      
      // Cache the URL
      iconUrlCache[symbolCode] = {
        url,
        timestamp: now
      };
      
      return url;
    } catch (err) {
      console.error(`Failed to get icon URL for ${symbolCode}:`, err);
      
      // Try to use the fallback icon
      try {
        const fallbackFileName = `${getShortenedIconName(FALLBACK_ICON_NAME)}.png`;
        const fallbackUrl = storage.getFilePreview(WEATHER_ICONS_BUCKET_ID, fallbackFileName);
        return fallbackUrl.toString();
      } catch (fallbackErr) {
        console.error('Failed to get fallback icon URL:', fallbackErr);
        return null;
      }
    }
  };

  // Fetch weather when the component mounts or campus changes
  useEffect(() => {
    // Skip fetching for National campus
    if (!isNationalCampus(campus)) {
      fetchWeather(campus as Campus);
    } else {
      setLoading(false);
    }
  }, [campus]);

  // Get the icon URL when weather data changes
  useEffect(() => {
    if (weatherData?.current?.symbolCode) {
      getIconUrl(weatherData.current.symbolCode)
        .then(url => {
          if (url) setIconUrl(url);
        })
        .catch(err => {
          console.error('Failed to set icon URL:', err);
          setIconUrl(null);
        });
    }
  }, [weatherData]);

  // Format temperature with no decimal places
  const formatTemperature = (temp: number) => {
    return `${Math.round(temp)}°`;
  };

  // Early return if campus is 'National'
  if (isNationalCampus(campus)) {
    return null;
  }

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

  return (
    <XStack alignItems="center" gap="$3">
      {iconUrl ? (
        <Image 
          source={{ uri: iconUrl }}
          width={iconSize}
          height={iconSize}
          objectFit="contain"
        />
      ) : (
        <XStack width={iconSize} height={iconSize} />
      )}
      <Text color={color} fontSize={24} fontWeight="600">
        {formatTemperature(weatherData.current.temperature)}
      </Text>
    </XStack>
  );
};

export default CompactWeather;