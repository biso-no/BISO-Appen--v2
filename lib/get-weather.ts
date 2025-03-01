import axios from 'axios';

/**
 * Interface for weather data returned from the Yr API
 */
interface WeatherData {
  location: {
    latitude: number;
    longitude: number;
    altitude: number;
    name: string;
  };
  current: {
    temperature: number;
    symbolCode: string;
    precipitation: number | null;
    windSpeed: number | null;
    windDirection: number | null;
    humidity: number | null;
    pressure: number | null;
    cloudCover: number | null;
  };
  updated: Date;
  expires: Date;
}

/**
 * Configuration options for the weather API
 */
interface WeatherOptions {
  latitude: number;
  longitude: number;
  altitude?: number;
  userAgent: string;
  locationName?: string;
}

/**
 * Campus locations in Norway
 */
export enum Campus {
  OSLO = 'Oslo',
  BERGEN = 'Bergen',
  STAVANGER = 'Stavanger',
  TRONDHEIM = 'Trondheim',
}

/**
 * Coordinates for each campus
 */
export const CAMPUS_COORDINATES: Record<Campus, { latitude: number; longitude: number; altitude: number }> = {
  [Campus.OSLO]: { latitude: 59.9139, longitude: 10.7522, altitude: 23 },
  [Campus.BERGEN]: { latitude: 60.3913, longitude: 5.3221, altitude: 12 },
  [Campus.STAVANGER]: { latitude: 58.9700, longitude: 5.7331, altitude: 9 },
  [Campus.TRONDHEIM]: { latitude: 63.4305, longitude: 10.3951, altitude: 56 },
};

/**
 * Fetches current weather data from the MET Norway Locationforecast API
 * 
 * @param options Configuration options including coordinates and user agent
 * @returns Promise with weather data
 */
export async function getCurrentWeather(options: WeatherOptions): Promise<WeatherData> {
  const { latitude, longitude, altitude = 0, userAgent, locationName } = options;
  
  // Ensure coordinates are properly formatted (max 4 decimals as per API requirements)
  const lat = parseFloat(latitude.toFixed(4));
  const lon = parseFloat(longitude.toFixed(4));
  const alt = Math.round(altitude);
  
  // Construct the API URL
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}&altitude=${alt}`;
  
  try {
    // Make the API request with proper headers
    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent,
      },
    });
    
    // Parse the response headers for caching information
    const lastModified = response.headers['last-modified'] 
      ? new Date(response.headers['last-modified']) 
      : new Date();
    
    const expires = response.headers['expires'] 
      ? new Date(response.headers['expires']) 
      : new Date(Date.now() + 3600000); // Default to 1 hour if not provided
    
    // Extract the current weather data from the response
    const data = response.data;
    
    // The first timeseries entry contains the current weather
    const currentTimeseries = data.properties.timeseries[0];
    const instant = currentTimeseries.data.instant.details;
    
    // Get the weather symbol from the next_1_hours summary if available
    // Otherwise fall back to next_6_hours or next_12_hours
    let symbolCode = 'unknown';
    if (currentTimeseries.data.next_1_hours?.summary?.symbol_code) {
      symbolCode = currentTimeseries.data.next_1_hours.summary.symbol_code;
    } else if (currentTimeseries.data.next_6_hours?.summary?.symbol_code) {
      symbolCode = currentTimeseries.data.next_6_hours.summary.symbol_code;
    } else if (currentTimeseries.data.next_12_hours?.summary?.symbol_code) {
      symbolCode = currentTimeseries.data.next_12_hours.summary.symbol_code;
    }
    
    // Get precipitation amount from next_1_hours if available
    const precipitation = currentTimeseries.data.next_1_hours?.details?.precipitation_amount ?? null;
    
    // Construct and return the weather data
    return {
      location: {
        latitude: lat,
        longitude: lon,
        altitude: alt,
        name: locationName || 'Unknown',
      },
      current: {
        temperature: instant.air_temperature,
        symbolCode,
        precipitation,
        windSpeed: instant.wind_speed ?? null,
        windDirection: instant.wind_from_direction ?? null,
        humidity: instant.relative_humidity ?? null,
        pressure: instant.air_pressure_at_sea_level ?? null,
        cloudCover: instant.cloud_area_fraction ?? null,
      },
      updated: lastModified,
      expires,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle specific API errors
      if (error.response?.status === 403) {
        throw new Error('Access forbidden. Check your User-Agent header.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please reduce your request frequency.');
      } else if (error.response) {
        throw new Error(`API error: ${error.response.status} ${error.response.statusText}`);
      }
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Fetches weather data for a specific campus
 * 
 * @param campus The campus to fetch weather for
 * @param userAgent User agent string for the API request
 * @returns Promise with weather data
 */
export async function getCampusWeather(campus: Campus, userAgent: string): Promise<WeatherData> {
  const coordinates = CAMPUS_COORDINATES[campus];
  
  if (!coordinates) {
    throw new Error(`Unknown campus: ${campus}`);
  }
  
  return getCurrentWeather({
    ...coordinates,
    userAgent,
    locationName: campus,
  });
}

/**
 * Helper function to get a description of the weather based on the symbol code
 * 
 * @param symbolCode The weather symbol code from the API
 * @returns A human-readable description of the weather
 */
export function getWeatherDescription(symbolCode: string): string {
  // Map of symbol codes to descriptions
  const descriptions: Record<string, string> = {
    'clearsky_day': 'Clear sky',
    'clearsky_night': 'Clear sky',
    'clearsky_polartwilight': 'Clear sky',
    'fair_day': 'Fair',
    'fair_night': 'Fair',
    'fair_polartwilight': 'Fair',
    'partlycloudy_day': 'Partly cloudy',
    'partlycloudy_night': 'Partly cloudy',
    'partlycloudy_polartwilight': 'Partly cloudy',
    'cloudy': 'Cloudy',
    'rainshowers_day': 'Rain showers',
    'rainshowers_night': 'Rain showers',
    'rainshowers_polartwilight': 'Rain showers',
    'rainshowersandthunder_day': 'Rain showers and thunder',
    'rainshowersandthunder_night': 'Rain showers and thunder',
    'rainshowersandthunder_polartwilight': 'Rain showers and thunder',
    'sleetshowers_day': 'Sleet showers',
    'sleetshowers_night': 'Sleet showers',
    'sleetshowers_polartwilight': 'Sleet showers',
    'snowshowers_day': 'Snow showers',
    'snowshowers_night': 'Snow showers',
    'snowshowers_polartwilight': 'Snow showers',
    'rain': 'Rain',
    'heavyrain': 'Heavy rain',
    'heavyrainandthunder': 'Heavy rain and thunder',
    'sleet': 'Sleet',
    'snow': 'Snow',
    'snowandthunder': 'Snow and thunder',
    'fog': 'Fog',
    'sleetshowersandthunder_day': 'Sleet showers and thunder',
    'sleetshowersandthunder_night': 'Sleet showers and thunder',
    'sleetshowersandthunder_polartwilight': 'Sleet showers and thunder',
    'snowshowersandthunder_day': 'Snow showers and thunder',
    'snowshowersandthunder_night': 'Snow showers and thunder',
    'snowshowersandthunder_polartwilight': 'Snow showers and thunder',
    'rainandthunder': 'Rain and thunder',
    'sleetandthunder': 'Sleet and thunder',
    'lightrainshowersandthunder_day': 'Light rain showers and thunder',
    'lightrainshowersandthunder_night': 'Light rain showers and thunder',
    'lightrainshowersandthunder_polartwilight': 'Light rain showers and thunder',
    'heavyrainshowersandthunder_day': 'Heavy rain showers and thunder',
    'heavyrainshowersandthunder_night': 'Heavy rain showers and thunder',
    'heavyrainshowersandthunder_polartwilight': 'Heavy rain showers and thunder',
    'lightssleetshowersandthunder_day': 'Light sleet showers and thunder',
    'lightssleetshowersandthunder_night': 'Light sleet showers and thunder',
    'lightssleetshowersandthunder_polartwilight': 'Light sleet showers and thunder',
    'heavysleetshowersandthunder_day': 'Heavy sleet showers and thunder',
    'heavysleetshowersandthunder_night': 'Heavy sleet showers and thunder',
    'heavysleetshowersandthunder_polartwilight': 'Heavy sleet showers and thunder',
    'lightssnowshowersandthunder_day': 'Light snow showers and thunder',
    'lightssnowshowersandthunder_night': 'Light snow showers and thunder',
    'lightssnowshowersandthunder_polartwilight': 'Light snow showers and thunder',
    'heavysnowshowersandthunder_day': 'Heavy snow showers and thunder',
    'heavysnowshowersandthunder_night': 'Heavy snow showers and thunder',
    'heavysnowshowersandthunder_polartwilight': 'Heavy snow showers and thunder',
    'lightrainandthunder': 'Light rain and thunder',
    'lightsleetandthunder': 'Light sleet and thunder',
    'heavysleetandthunder': 'Heavy sleet and thunder',
    'lightsnowandthunder': 'Light snow and thunder',
    'heavysnowandthunder': 'Heavy snow and thunder',
    'lightrainshowers_day': 'Light rain showers',
    'lightrainshowers_night': 'Light rain showers',
    'lightrainshowers_polartwilight': 'Light rain showers',
    'heavyrainshowers_day': 'Heavy rain showers',
    'heavyrainshowers_night': 'Heavy rain showers',
    'heavyrainshowers_polartwilight': 'Heavy rain showers',
    'lightsleetshowers_day': 'Light sleet showers',
    'lightsleetshowers_night': 'Light sleet showers',
    'lightsleetshowers_polartwilight': 'Light sleet showers',
    'heavysleetshowers_day': 'Heavy sleet showers',
    'heavysleetshowers_night': 'Heavy sleet showers',
    'heavysleetshowers_polartwilight': 'Heavy sleet showers',
    'lightsnowshowers_day': 'Light snow showers',
    'lightsnowshowers_night': 'Light snow showers',
    'lightsnowshowers_polartwilight': 'Light snow showers',
    'heavysnowshowers_day': 'Heavy snow showers',
    'heavysnowshowers_night': 'Heavy snow showers',
    'heavysnowshowers_polartwilight': 'Heavy snow showers',
    'lightrain': 'Light rain',
    'lightsleet': 'Light sleet',
    'heavysleet': 'Heavy sleet',
    'lightsnow': 'Light snow',
    'heavysnow': 'Heavy snow',
  };

  return descriptions[symbolCode] || 'Unknown weather condition';
}

/**
 * Get the URL for a weather icon based on the symbol code
 * 
 * @param symbolCode The weather symbol code from the API
 * @param size The size of the icon (default: 'svg')
 * @returns URL to the weather icon
 */
export function getWeatherIconUrl(symbolCode: string, size: 'svg' | 'png' = 'svg'): string {
  return `https://api.met.no/images/weathericons/${symbolCode}.${size}`;
}

/**
 * Example usage:
 * 
 * ```typescript
 * import { getCampusWeather, Campus, getWeatherDescription } from './lib/get-weather';
 * 
 * async function fetchCampusWeather() {
 *   try {
 *     const weather = await getCampusWeather(
 *       Campus.OSLO,
 *       'MyApp/1.0 (https://example.com/)'
 *     );
 *     
 *     console.log(`Weather in ${weather.location.name}:`);
 *     console.log(`Temperature: ${weather.current.temperature}°C`);
 *     console.log(`Condition: ${getWeatherDescription(weather.current.symbolCode)}`);
 *   } catch (error) {
 *     console.error('Failed to fetch weather:', error);
 *   }
 * }
 * ```
 */
