import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { RefreshControl, useColorScheme, useWindowDimensions, Platform, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  YStack, 
  XStack,
  Text,
  ScrollView,
  Button,
  Image,
  Card,
  H3,
  H2,
  styled,
  useTheme,
  Stack,
  Spinner,
} from 'tamagui';
import { 
  Calendar,
  MapPin,
  ShoppingBag,
  Users,
  Sparkles,
  ChevronRight,
  Tag,
} from '@tamagui/lucide-icons';
import { MotiView, AnimatePresence } from 'moti';
import { router } from 'expo-router';
import axios from 'axios';
import { Models } from 'react-native-appwrite';
import { useCampus } from '@/lib/hooks/useCampus';
import { functions } from '@/lib/appwrite';
import { LinearGradient } from '@tamagui/linear-gradient';
import { formatDate, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { useHeaderHeight } from '@react-navigation/elements';
import { CampusHero } from '@/components/home/campus-hero';
import { HomeCategories } from '@/components/home/home-tabs';
import { Event } from '@/types/event';
import { HomeEvents } from '@/components/home/home-events';
import { HomeProducts } from '@/components/home/home-products';
import { HomeJobs } from '@/components/home/home-jobs';
import type { Job } from '@/types/jobs';
import CampusWeather from '@/components/CampusWeather';
import { useScreenPerformance } from '@/lib/performance';
import { BISCOLogo } from '@/components/BISCOLogo';
import { Campus } from '@/lib/get-weather';

// Types remain the same as before
interface Product {
  id: number;
  name: string;
  campus: { value: string; label: string };
  images: string[];
  price: string;
  sale_price: string;
}

// Enhanced styled components with new visual treatments
const HeroCard = styled(Card, {
  overflow: "hidden",
  marginHorizontal: -16,
  marginTop: -16,
  borderRadius: 0,
})

const SearchBar = styled(XStack, {
  backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.8)' : '$background',
  borderRadius: 24,
  paddingHorizontal: "$4",
  paddingVertical: "$3",
  marginHorizontal: "$4",
  marginTop: 10,
  shadowColor: "$shadowColor",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.2,
  shadowRadius: 24,
  elevation: 10,
  zIndex: 1,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
})

// Replace CategorySelector component with a new implementation
const CategorySelector = memo(
  ({ categories, activeCategory, onSelectCategory }: {
    categories: Array<{
      id: string;
      label: string;
      icon: React.ComponentType<any>;
      description: string;
    }>;
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

// Define categories outside component to avoid recreation
const categoriesData = [
  { 
    id: 'all', 
    label: 'All',
    icon: Sparkles,
    description: 'Everything at a glance'
  },
  { 
    id: 'events', 
    label: 'Events',
    icon: Calendar,
    description: 'Upcoming happenings'
  },
  { 
    id: 'products', 
    label: 'Shop',
    icon: ShoppingBag,
    description: 'Campus merchandise'
  },
  { 
    id: 'jobs', 
    label: 'Volunteer',
    icon: Users,
    description: 'Join our team'
  },
];

export default function HomeScreen() {
  // Track initial load to prevent duplicate fetches
  const initialLoadCompleted = useRef(false);

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
  const { width } = useWindowDimensions();
  const headerHeight = useHeaderHeight();

  // Track performance 
  useScreenPerformance('HomeScreen');

  // Memoize categories to prevent recreating on each render
  const categories = useMemo(() => [
    {
      id: 'all',
      label: 'All',
      icon: Sparkles,
      description: 'Browse everything happening at your campus',
    },
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      description: 'Find events happening at your campus',
    },
    {
      id: 'marketplace',
      label: 'Shop',
      icon: ShoppingBag,
      description: 'Buy and sell items within your campus community',
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: Users,
      description: 'Find job opportunities with campus partners',
    },
  ], []);

  // Handle category selection
  const handleCategorySelect = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  // Original fetch functions
  const fetchProducts = useCallback(async () => {
    try {
      const body = { campus: campus?.$id };
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
      const response = await axios.get(
        `https://biso.no/wp-json/custom/v1/jobs/?includeExpired=true&per_page=3&campus=${campus?.name}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
  }, [campus?.name]);

  const fetchEvents = useCallback(async () => {
    try {
      let url = 'https://biso.no/wp-json/biso/v1/events';
      
      const params: Record<string, string | number> = {
        per_page: 25
      };
  
      if (campus?.name) {
        params.organizer = 'biso-' + campus.name.toLowerCase();
      }
  
      const response = await axios.get(url, { params });
      
      // Transform the events to match the Event interface
      const transformedEvents = response.data.map((event: any) => ({
        id: event.id,
        title: event.title,
        content: event.content,
        excerpt: event.excerpt,
        date: event.date,
        end_date: event.end_date,
        venue: event.venue,
        url: event.url,
        featured_image: event.featured_image
      }));
  
      //remove events that have date and time in the past
      const today = new Date();
      const filteredEvents = transformedEvents.filter((event: any) => {
        const eventDate = parseISO(event.date);
        return eventDate > today;
      });
  
      return filteredEvents;
      
    } catch (err) {
      console.error('Error loading events:', err);
      return [];
    }
  }, [campus?.name]);

  // Get featured event helper function
  const getFeaturedEvent = useCallback(() => {
    if (!events.length) return null;
    // Find an event within the next 7 days
    return events.find(event => {
      const eventDate = parseISO(event.date);
      return isAfter(eventDate, new Date()) && isBefore(eventDate, addDays(new Date(), 7));
    });
  }, [events]);

  // Get regular events helper function
  const getRegularEvents = useCallback(() => {
    const featuredEvent = getFeaturedEvent();
    if (!featuredEvent) return events.slice(0, 3);
    
    // Return up to 3 non-featured events
    return events
      .filter(event => event.id !== featuredEvent.id)
      .slice(0, 3);
  }, [events, getFeaturedEvent]);

  // Optimized data loading with parallel requests
  const loadAllData = useCallback(async () => {
    if (!campus) return;
    
    setIsLoading(true);
    try {
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
  
  // Initialize data on mount or campus change
  useEffect(() => {
    if (campus && !initialLoadCompleted.current) {
      loadAllData();
      initialLoadCompleted.current = true;
    }
  }, [campus, loadAllData]);
  
  // Filtered events based on active category
  const filteredEvents = useMemo(() => {
    return activeCategory === 'all' || activeCategory === 'events' 
      ? getRegularEvents() 
      : [];
  }, [activeCategory, getRegularEvents]);
  
  const featuredEvent = useMemo(() => {
    return activeCategory === 'all' || activeCategory === 'events'
      ? getFeaturedEvent()
      : null;
  }, [activeCategory, getFeaturedEvent]);
  
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
      <Text color="$blue10" marginTop={20}>Loading content...</Text>
    </YStack>
  ), []);

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: theme?.background?.val || '#ffffff' }}>
      <Stack
        paddingBottom={100} 
        backgroundColor="$background"
        flex={1}
      >
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        
        {/* Hero and Header */}



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

            {/* Events Section */}
            {(activeCategory === 'all' || activeCategory === 'events') && (
              <HomeEvents events={filteredEvents} featuredEvent={featuredEvent} />
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
