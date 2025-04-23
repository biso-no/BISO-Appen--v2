import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { RefreshControl, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  YStack, 
  XStack,
  Text,
  ScrollView,
  Button,
  useTheme,
  Stack,
} from 'tamagui';
import { 
  Calendar,
  ShoppingBag,
  Users,
  Sparkles,
} from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import axios from 'axios';
import { useCampus } from '@/lib/hooks/useCampus';
import { functions } from '@/lib/appwrite';
import { parseISO, isAfter } from 'date-fns';
import { CampusHero } from '@/components/home/campus-hero';
import { HomeEvents } from '@/components/home/home-events';
import { HomeProducts } from '@/components/home/home-products';
import { HomeJobs } from '@/components/home/home-jobs';
import type { Job } from '@/types/jobs';
import { useScreenPerformance } from '@/lib/performance';
import { BISCOLogo } from '@/components/BISCOLogo';
import { useTranslation } from 'react-i18next';

// Updated Event interface based on the provided JSON structure
interface Thumbnail {
  id: number;
  url: string;
  width: number;
  height: number;
}

interface Organizer {
  id: string;
  name: string;
  phone: string;
  email: string;
  website: string;
  slug: string;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  zip: string;
  phone: string;
  website: string;
  slug: string;
}

interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  cost: string;
  website: string;
  thumbnail: Thumbnail;
  organizer: Organizer;
  venue: Venue;
  categories: string[];
  tags: string[];
}

interface Product {
  id: number;
  name: string;
  campus: { value: string; label: string };
  images: string[];
  price: string;
  sale_price: string;
}

// Replace CategorySelector component with a new implementation
const CategorySelector = memo(
  ({ categories, activeCategory, onSelectCategory }: {
    categories: {
      id: string;
      label: string;
      icon: React.ComponentType<any>;
      description: string;
    }[];
    activeCategory: string;
    onSelectCategory: (category: string) => void;
  }) => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          const Icon = category.icon;
          
          return (
            <Button
              key={category.id}
              chromeless
              paddingVertical="$2"
              paddingHorizontal="$3"
              backgroundColor={isActive ? '$blue9' : '$gray100'}
              pressStyle={{ scale: 0.97, opacity: 0.9 }}
              borderRadius="$10"
              onPress={() => onSelectCategory(category.id)}
            >
              <XStack gap="$2" alignItems="center">
                <Stack
                  backgroundColor={isActive ? "rgba(255,255,255,0.3)" : "$blue4"}
                  padding="$2"
                  borderRadius="$4"
                >
                  <Icon size={16} color={isActive ? "white" : "$color"} />
                </Stack>
                <Text
                  fontWeight={isActive ? '600' : '500'}
                  color={isActive ? 'white' : '$gray700'}
                >
                  {category.label}
                </Text>
              </XStack>
            </Button>
          );
        })}
      </ScrollView>
    );
  }
);
CategorySelector.displayName = 'CategorySelector';

export default function HomeScreen() {
  // State management
  const [events, setEvents] = useState<Event[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { campus } = useCampus();
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const { t } = useTranslation();
  // Track performance 
  useScreenPerformance('HomeScreen');

  // Memoize categories to prevent recreating on each render
  const categories = useMemo(() => [
    {
      id: 'all',
      label: t('all-0'),
      icon: Sparkles,
      description: t('browse-everything-happening-at-your-campus'),
    },
    {
      id: 'events',
      label: t('explore.categories.events.title'),
      icon: Calendar,
      description: t('find-events-happening-at-your-campus'),
    },
    {
      id: 'marketplace',
      label: t('shop'),
      icon: ShoppingBag,
      description: t('buy-and-sell-items-within-your-campus-community'),
    },
    {
      id: 'jobs',
      label: t('jobs'),
      icon: Users,
      description: t('find-job-opportunities-with-campus-partners'),
    },
  ], [t]);

  // Handle category selection
  const handleCategorySelect = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  // Original fetch functions
  const fetchProducts = useCallback(async () => {
    try {
      if (!campus?.$id) return [];
      
      const body = { campus: campus.$id };
      const response = await functions.createExecution(
        'sync_webshop_products',
        JSON.stringify(body),
        false
      );
      const productBody = JSON.parse(response.responseBody);
      return productBody?.products?.slice(0, 3) || [];
    } catch (error) {
      console.error("Failed to fetch products:", error);
      return [];
    }
  }, [campus?.$id]);

  const fetchJobs = useCallback(async () => {
    try {
      if (!campus?.name) return [];
      
      const response = await axios.get(
        `https://biso.no/wp-json/custom/v1/jobs/?includeExpired=false&per_page=5&campus=${campus.name}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
  }, [campus?.name]);

  // Updated fetchEvents function to use the new Event interface
  const fetchEvents = useCallback(async () => {
    try {
      if (!campus?.name) return [];
      
      let url = 'https://biso.no/wp-json/biso/v1/events';
      
      const params: Record<string, string | number> = {
        per_page: 25
      };
  
      // Append the organizer parameter with campus name
      params.organizer = "biso-" + campus.name.toLowerCase();
      
      console.log("Fetching events with params:", params);
      const response = await axios.get(url, { params });
      console.log(`Fetched ${response.data.length} events for campus ${campus.name}`);
      
      // Filter out past events
      const today = new Date();
      const filteredEvents = response.data.filter((event: Event) => {
        const eventDate = parseISO(event.start_date);
        return isAfter(eventDate, today);
      });
      
      console.log(`${filteredEvents.length} upcoming events after filtering`);
      return filteredEvents;
      
    } catch (err) {
      console.error('Error loading events:', err);
      return [];
    }
  }, [campus?.name]);

  // Optimized data loading with parallel requests
  const loadAllData = useCallback(async () => {
    if (!campus) return;
    
    setIsLoading(true);
    try {
      console.log(`Loading data for campus: ${campus.name}`);
      // Use Promise.all to load data in parallel
      const [eventsData, productsData, jobsData] = await Promise.all([
        fetchEvents(),
        fetchProducts(),
        fetchJobs()
      ]);
      
      // Update state with fetched data
      setEvents(eventsData);
      setProducts(productsData);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [campus, fetchEvents, fetchProducts, fetchJobs]);
  
  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadAllData();
  }, [loadAllData]);
  
  // Initialize data on mount and reload when campus changes
  useEffect(() => {
    if (campus) {
      console.log(`Campus changed to: ${campus.name}, reloading data...`);
      setIsLoading(true);
      loadAllData();
    }
  }, [campus, loadAllData]);
  
  // Filtered products based on active category
  const filteredProducts = useMemo(() => {
    return activeCategory === 'all' || activeCategory === 'marketplace' 
      ? products 
      : [];
  }, [products, activeCategory]);
  
  // Filtered jobs based on active category
  const filteredJobs = useMemo(() => {
    return activeCategory === 'all' || activeCategory === 'jobs' 
      ? jobs 
      : [];
  }, [jobs, activeCategory]);

  // Memoized loading component
  const LoadingComponent = useMemo(() => (
    <YStack flex={1} justifyContent="center" alignItems="center" marginTop={80}>
      <MotiView
        from={{ opacity: 0.5, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 1000, loop: true }}
      >
        <BISCOLogo />
      </MotiView>
      <Text color="$blue10" marginTop={20}>{t('loading-content')}</Text>
    </YStack>
  ), [t]);

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: theme?.background?.val || '#ffffff' }}>
      <Stack
        paddingBottom={100} 
        backgroundColor="$background"
        flex={1}
      >
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        
        {isLoading ? (
          LoadingComponent
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={theme?.color?.val || '#000000'}
              />
            }
          >
            {/* Categories Selector */}
            <YStack padding="$3" marginTop="$1" marginBottom="$4" gap="$4">
              <CampusHero />
              <CategorySelector
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={handleCategorySelect}
              />
            </YStack>

            {/* Events Section - Pass isFullView to control the display mode */}
            {(activeCategory === 'all' || activeCategory === 'events') && (
              <HomeEvents 
                events={events}
                isFullView={activeCategory === 'events'} 
              />
            )}
            
            {/* Marketplace Section */}
            {(activeCategory === 'all' || activeCategory === 'marketplace') && (
              <HomeProducts products={filteredProducts} />
            )}
            
            {/* Jobs Section */}
            {(activeCategory === 'all' || activeCategory === 'jobs') && (
              <HomeJobs jobs={filteredJobs} />
            )}
          </ScrollView>
        )}
      </Stack>
    </SafeAreaView>
  );
}