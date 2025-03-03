import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Select, XStack, YStack, Spinner, H4, Paragraph, Avatar } from 'tamagui';
import { ChevronDown, RefreshCw } from '@tamagui/lucide-icons';
import { getCampusWeather, Campus, getWeatherDescription, getWeatherIconUrl } from '../lib/get-weather';

// The user agent string for API requests
const USER_AGENT = 'CampusWeatherApp/1.0 (https://example.com)';

// Cache duration in milliseconds (15 minutes)
const CACHE_DURATION = 15 * 60 * 1000;

interface CampusWeatherProps {
  defaultCampus?: Campus;
  showSelector?: boolean;
}

interface CachedWeatherData {
  data: Awaited<ReturnType<typeof getCampusWeather>>;
  timestamp: number;
}

const CampusWeather: React.FC<CampusWeatherProps> = ({ 
  defaultCampus = Campus.OSLO,
  showSelector = true 
}) => {
  const [selectedCampus, setSelectedCampus] = useState<Campus>(defaultCampus);
  const [weatherData, setWeatherData] = useState<Awaited<ReturnType<typeof getCampusWeather>> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cache for weather data to avoid unnecessary API calls
  const [weatherCache, setWeatherCache] = useState<Record<Campus, CachedWeatherData | null>>({
    [Campus.OSLO]: null,
    [Campus.BERGEN]: null,
    [Campus.STAVANGER]: null,
    [Campus.TRONDHEIM]: null,
  });

  // Fetch weather data for the selected campus
  const fetchWeather = useCallback(async (campus: Campus) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if we have cached data that's still valid
      const cachedData = weatherCache[campus];
      const now = Date.now();
      
      if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
        // Use cached data if it's still valid
        setWeatherData(cachedData.data);
      } else {
        // Fetch fresh data
        const data = await getCampusWeather(campus, USER_AGENT);
        
        // Update cache
        setWeatherCache(prev => ({
          ...prev,
          [campus]: {
            data,
            timestamp: now
          }
        }));
        
        setWeatherData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      console.error('Error fetching weather:', err);
    } finally {
      setLoading(false);
    }
  }, [weatherCache]);

  // Fetch weather when the selected campus changes
  useEffect(() => {
    fetchWeather(selectedCampus);
  }, [selectedCampus, fetchWeather]);

  // Handle campus selection change
  const handleCampusChange = (value: string) => {
    setSelectedCampus(value as Campus);
  };

  // Format temperature with one decimal place
  const formatTemperature = (temp: number) => {
    return `${temp.toFixed(1)}°C`;
  };

  // Create campus options for the select dropdown
  const campusOptions = Object.values(Campus).map((campus, index) => (
    <Select.Item key={campus} index={index} value={campus}>
      <Select.ItemText>{campus}</Select.ItemText>
    </Select.Item>
  ));

  return (
    <Card elevate size="$4" bordered padding="$4">
      <YStack space="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <H4>Weather</H4>
          
          {showSelector && (
            <Select value={selectedCampus} onValueChange={handleCampusChange}>
              <Select.Trigger width={150} iconAfter={ChevronDown}>
                <Select.Value placeholder="Select campus" />
              </Select.Trigger>
              
              <Select.Content>
                <Select.ScrollUpButton />
                <Select.Viewport>
                  <Select.Group>
                    <Select.Label>Campuses</Select.Label>
                    {campusOptions}
                  </Select.Group>
                </Select.Viewport>
                <Select.ScrollDownButton />
              </Select.Content>
            </Select>
          )}
        </XStack>
        
        {loading ? (
          <XStack justifyContent="center" padding="$4">
            <Spinner size="large" color="$blue10" />
          </XStack>
        ) : error ? (
          <Paragraph color="$red10">{error}</Paragraph>
        ) : weatherData ? (
          <YStack space="$2">
            <XStack space="$4" alignItems="center">
              <Avatar circular size="$6">
                <Avatar.Image 
                  src={getWeatherIconUrl(weatherData.current.symbolCode)} 
                  alt={getWeatherDescription(weatherData.current.symbolCode)}
                />
                <Avatar.Fallback backgroundColor="$gray5" />
              </Avatar>
              
              <YStack>
                <H4>{weatherData.location.name}</H4>
                <Paragraph size="$5" fontWeight="bold">
                  {formatTemperature(weatherData.current.temperature)}
                </Paragraph>
                <Paragraph size="$3">
                  {getWeatherDescription(weatherData.current.symbolCode)}
                </Paragraph>
              </YStack>
            </XStack>
            
            <XStack flexWrap="wrap" gap="$2" marginTop="$2">
              {weatherData.current.windSpeed !== null && (
                <Card bordered size="$2" padding="$2">
                  <Paragraph size="$2">Wind: {weatherData.current.windSpeed} m/s</Paragraph>
                </Card>
              )}
              
              {weatherData.current.humidity !== null && (
                <Card bordered size="$2" padding="$2">
                  <Paragraph size="$2">Humidity: {Math.round(weatherData.current.humidity)}%</Paragraph>
                </Card>
              )}
              
              {weatherData.current.precipitation !== null && (
                <Card bordered size="$2" padding="$2">
                  <Paragraph size="$2">Precipitation: {weatherData.current.precipitation} mm</Paragraph>
                </Card>
              )}
            </XStack>
            
            <Paragraph size="$1" color="$gray10" marginTop="$2">
              Updated: {new Date(weatherData.updated).toLocaleTimeString()}
            </Paragraph>
          </YStack>
        ) : null}
        
        {!loading && (
          <Button 
            size="$3" 
            theme="blue" 
            onPress={() => fetchWeather(selectedCampus)}
            marginTop="$2"
            icon={RefreshCw}
          >
            Refresh
          </Button>
        )}
      </YStack>
    </Card>
  );
};

export default CampusWeather; 