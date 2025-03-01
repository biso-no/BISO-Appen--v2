import React, { useState, useEffect, useCallback } from 'react';
import { RefreshControl, useColorScheme, useWindowDimensions, Platform, StatusBar } from 'react-native';
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
} from 'tamagui';
import { 
  Calendar,
  MapPin,
  ShoppingBag,
  Users,
  Sparkles,
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
  height: 500,
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



const categories = [
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
  const [refreshing, setRefreshing] = useState(false);
  const { campus } = useCampus();
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [scrollY, setScrollY] = useState(0);

  const { width } = useWindowDimensions();
  
  // Monitor performance of this screen
  useScreenPerformance('HomeScreen');

  useEffect(() => {
    loadAllData();
  }, [campus?.$id]);

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchProducts(),
      fetchJobs(),
      fetchEvents(),
    ]);
    setIsLoading(false);
  };

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
  
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
  
      setEvents(filteredEvents);
      
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  

  const fetchProducts = async () => {
    try {
      const body = { campus: campus?.$id };
      const response = await functions.createExecution(
        'sync_webshop_products',
        JSON.stringify(body),
        false
      );
      const productBody = JSON.parse(response.responseBody);
      setProducts(productBody?.products?.slice(0, 3) || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get(
        `https://biso.no/wp-json/custom/v1/jobs/?includeExpired=true&per_page=3&campus=${campus?.name}`
      );
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, []);

  const getFeaturedEvent = useCallback(() => {
    if (!events.length) return null;
    // Find an event within the next 7 days
    return events.find(event => {
      const eventDate = parseISO(event.date);
      return isAfter(eventDate, new Date()) && isBefore(eventDate, addDays(new Date(), 7));
    });
  }, [events]);

  const getRegularEvents = useCallback(() => {
    const featuredEvent = getFeaturedEvent();
    if (!featuredEvent) return events.slice(0, 3);
    
    // Return up to 3 non-featured events
    return events
      .filter(event => event.id !== featuredEvent.id)
      .slice(0, 3);
  }, [events, getFeaturedEvent]);

  // Memoize the hero section to prevent unnecessary re-renders
  const HeroSection = React.memo(() => {
    const featuredEvent = getFeaturedEvent();
    if (!featuredEvent) return null;

    return (
      <HeroCard>
        <MotiView
          from={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 1500 }}
        >
          <Image
            source={{ uri: featuredEvent.featured_image }}
            alt={featuredEvent.title}
            height={500}
            width={width}
            style={{ transform: [{ scale: 1.1 }] }}
          />
          <LinearGradient
            start={[0, 0]}
            end={[0, 1]}
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 300,
              padding: 24,
              justifyContent: 'flex-end',
            }}
          >
            <YStack gap="$3">
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 300 }}
              >
                <XStack gap="$2" alignItems="center">
                  <Stack
                    backgroundColor="rgba(255,255,255,0.2)"
                    padding="$2"
                    borderRadius="$4"
                  >
                    <Calendar size={16} color="white" />
                  </Stack>
                  <Text color="white" fontSize={16}>
                    {formatDate(parseISO(featuredEvent.date), 'dd MMM yyyy')}
                  </Text>
                </XStack>
              </MotiView>
              
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 400 }}
              >
                <H2 color="white" fontSize={32} lineHeight={40}>
                  {featuredEvent.title}
                </H2>
              </MotiView>

              {featuredEvent.venue && (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 500 }}
                >
                  <XStack gap="$2" alignItems="center">
                    <Stack
                      backgroundColor="rgba(255,255,255,0.2)"
                      padding="$2"
                      borderRadius="$4"
                    >
                      <MapPin size={16} color="white" />
                    </Stack>
                    <Text color="white" fontSize={16}>
                      {featuredEvent.venue}
                    </Text>
                  </XStack>
                </MotiView>
              )}

              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 600 }}
              >
                <Button
                  backgroundColor="$blue9"
                  borderRadius="$10"
                  paddingHorizontal="$6"
                  paddingVertical="$3"
                  marginTop="$2"
                  pressStyle={{ scale: 0.95 }}
                  onPress={() => router.push(`/explore/events/${featuredEvent.id}`)}
                >
                  <Text color="white" fontWeight="600" fontSize={16}>
                    Learn More
                  </Text>
                </Button>
              </MotiView>
            </YStack>
          </LinearGradient>
        </MotiView>
      </HeroCard>
    );
  });

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    setScrollY(scrollPosition);
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScrollView
        flex={1}
        backgroundColor="$background"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        removeClippedSubviews={Platform.OS === 'android'}
        keyboardShouldPersistTaps="handled"
      >
        <HeroSection />

        <YStack padding="$4" gap="$6">
          <CampusHero />
          <HomeCategories
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            categories={categories}
          />

          <AnimatePresence>
            {(activeCategory === 'all' || activeCategory === 'events') && getRegularEvents().length > 0 && (
              <HomeEvents
                activeCategory={activeCategory}
                events={getRegularEvents()}
              />
            )}

            {(activeCategory === 'all' || activeCategory === 'products') && products.length > 0 && (
              <HomeProducts
                activeCategory={activeCategory}
                products={products}
              />
            )}

            {(activeCategory === 'all' || activeCategory === 'jobs') && jobs.length > 0 && (
              <HomeJobs
                activeCategory={activeCategory}
                jobs={jobs}
              />
            )}
          </AnimatePresence>
        </YStack>
      </ScrollView>
    </>
  );
}
