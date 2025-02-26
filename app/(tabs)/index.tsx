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
  Paragraph,
  Separator,
  styled,
  Theme,
  useTheme,
  Stack,
  Sheet,
} from 'tamagui';
import { 
  ChevronRight,
  Briefcase,
  Tag,
  Calendar,
  MapPin,
  Search,
  ShoppingBag,
  Users,
  Sparkles,
  Bell
} from '@tamagui/lucide-icons';
import { MotiView, MotiScrollView, AnimatePresence, motify } from 'moti';
import { router } from 'expo-router';
import axios from 'axios';
import { Models } from 'react-native-appwrite';
import { useCampus } from '@/lib/hooks/useCampus';
import { functions, getNews } from '@/lib/appwrite';
import { LinearGradient } from '@tamagui/linear-gradient';
import RenderHTML from 'react-native-render-html';
import { formatDate, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { BlurView } from 'expo-blur';
import { useHeaderHeight } from '@react-navigation/elements';
import { CampusHero } from '@/components/home/campus-hero';

// Types remain the same as before
interface Product {
  id: number;
  name: string;
  campus: { value: string; label: string };
  images: string[];
  price: string;
  sale_price: string;
}

interface Event {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  end_date: string;
  venue: string | null;
  url: string;
  featured_image: string;
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

const ProductCard = styled(Card, {
  borderRadius: 24,
  shadowColor: "$shadowColor",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.15,
  shadowRadius: 24,
  overflow: "hidden",
  width: 300,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
})

const EventCard = styled(Card, {
  borderRadius: 24,
  marginBottom: "$4",
  overflow: "hidden",
  variants: {
    featured: {
      true: {
        height: 400,
      },
      false: {
        height: 250,
      },
    },
  },
})

const PriceTag = styled(XStack, {
  backgroundColor: "$blue4",
  borderRadius: "$10",
  paddingHorizontal: "$3",
  paddingVertical: "$1",
  alignItems: "center",
  gap: "$1",
  alignSelf: "flex-start", // This ensures the tag only takes up needed width
})

const CategoryPill = styled(Button, {
  borderRadius: 20,
  paddingHorizontal: "$4",
  paddingVertical: "$3",
  backgroundColor: "transparent",
  variants: {
    active: {
      true: {
        backgroundColor: "$blue6",
      },
      false: {
        backgroundColor: "transparent",
        borderColor: '$borderColor',
        borderWidth: 1,
      },
    },
  },
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
  const [jobs, setJobs] = useState<Models.Document[]>([]);
  const [news, setNews] = useState<Models.DocumentList<Models.Document>>();
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [scrollY, setScrollY] = useState(0);
  const headerHeight = useHeaderHeight();

  const colorScheme = useColorScheme();
  const theme = useTheme();
  const { width } = useWindowDimensions();


  useEffect(() => {
    loadAllData();
  }, [campus]);

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
        '66a3d188000dd012e6de',
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

  const fetchNews = async () => {
    try {
      const newsData = await getNews(campus?.$id);
      setNews(newsData);
    } catch (error) {
      console.error("Error fetching news:", error);
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

  const renderHeroSection = () => {
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
  };

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
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        {renderHeroSection()}


        <YStack padding="$4" gap="$6">
          <CampusHero />
          
          <MotiScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <XStack gap="$3" paddingVertical="$2" paddingRight="$4">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <MotiView
                    key={category.id}
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 100 }}
                  >
                    <CategoryPill
                      pressStyle={{ scale: 0.95 }}
                      onPress={() => setActiveCategory(category.id)}
                      active={activeCategory === category.id}
                    >
                      <XStack gap="$2" alignItems="center">
                        <Stack
                          backgroundColor={
                            activeCategory === category.id
                              ? 'rgba(255,255,255,0.2)'
                              : '$blue4'
                          }
                          padding="$2"
                          borderRadius="$4"
                        >
                          <Icon
                            size={16}
                            color={
                              activeCategory === category.id
                                ? 'white'
                                : theme?.color?.get()
                            }
                          />
                        </Stack>
                        <Text
                          color={
                            activeCategory === category.id
                              ? 'white'
                              : theme?.color?.get()
                          }
                          fontSize={14}
                          fontWeight="500"
                        >
                          {category.label}
                        </Text>
                      </XStack>
                    </CategoryPill>
                  </MotiView>
                );
              })}
            </XStack>
          </MotiScrollView>

          <AnimatePresence>
            {(activeCategory === 'all' || activeCategory === 'events') && getRegularEvents().length > 0 && (
              <MotiView
                key="events-section"
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <YStack gap="$4">
                  <XStack justifyContent="space-between" alignItems="center">
                    <H3>Upcoming Events</H3>
                    <Button
                      chromeless
                      onPress={() => router.push('/explore/events')}
                    >
                      <Text fontSize={14} color="$blue9">See all</Text>
                    </Button>
                  </XStack>

                  {getRegularEvents().map((event, index) => (
                    <EventCard
                      key={`regular-event-${event.id}`}
                      pressStyle={{ scale: 0.98 }}
                      animation="lazy"
                      onPress={() => router.push(`/explore/events/${event.id}`)}
                      featured={index === 0}
                    >
                      <Image
                        source={{ uri: event.featured_image }}
                        alt={event.title}
                        height={index === 0 ? 300 : 200}
                        width={width - 32}
                      />
                      <LinearGradient
                        start={[0, 0]}
                        end={[0, 1]}
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: 16,
                        }}
                      >
                        <YStack gap="$2">
                          <XStack gap="$2" alignItems="center">
                            <Calendar size={16} color="white" />
                            <Text color="white">
                              {formatDate(parseISO(event.date), 'dd MMM yyyy')}
                            </Text>
                          </XStack>
                          <H3 color="white">{event.title}</H3>
                          {event.venue && (
                            <XStack gap="$2" alignItems="center">
                              <MapPin size={16} color="white" />
                              <Text color="white">{event.venue}</Text>
                            </XStack>
                          )}
                        </YStack>
                      </LinearGradient>
                    </EventCard>
                  ))}
                </YStack>
              </MotiView>
            )}

            {(activeCategory === 'all' || activeCategory === 'products') && products.length > 0 && (
              <MotiView
                key="products-section"
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <YStack gap="$4">
                  <XStack justifyContent="space-between" alignItems="center">
                    <H3>Featured Products</H3>
                    <Button
                      chromeless
                      onPress={() => router.push('/explore/products')}
                    >
                      <Text fontSize={14} color="$blue9">See all</Text>
                    </Button>
                  </XStack>

                  {activeCategory === 'all' ? (
                    <MotiScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      from={{ opacity: 0, translateX: 20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ type: 'timing', duration: 1000 }}
                    >
                      <XStack gap="$4" paddingRight="$4">
                      {products.map((product) => (
                        <ProductCard
                          key={`horizontal-product-${product.id}`}
                          pressStyle={{ scale: 0.95 }}
                          onPress={() => router.push(`/explore/products/${product.id}`)}
                        >
                          <Image
                            source={{ uri: product.images[0] }}
                            alt={product.name}
                            height={200}
                            width={300}
                          />
                          <LinearGradient
                            start={[0, 0]}
                            end={[0, 1]}
                            colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']} // Enhanced gradient
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              padding: 16,
                              paddingTop: 32, // Increased padding for better gradient fade
                            }}
                          >
                            <YStack gap="$2">
                              <Text 
                                color="white" 
                                fontWeight="bold"
                                fontSize={18}
                                style={{ 
                                  textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                  textShadowOffset: { width: 0, height: 1 },
                                  textShadowRadius: 3
                                }}
                              >
                                {product.name}
                              </Text>
                              <PriceTag>
                                <Tag size={14} color="$blue11" />
                                <Text color="$blue11" fontWeight="600">
                                  {product.price} kr
                                </Text>
                              </PriceTag>
                            </YStack>
                          </LinearGradient>
                        </ProductCard>
                      ))}
                      </XStack>
                    </MotiScrollView>
                  ) : (
                    <YStack gap="$4">
                      {products.map((product) => (
                        <MotiView
                          key={`vertical-product-${product.id}`}
                          from={{ opacity: 0, translateY: 20 }}
                          animate={{ opacity: 1, translateY: 0 }}
                          transition={{ type: 'spring', damping: 15 }}
                        >
                          <Card
                            pressStyle={{ scale: 0.98 }}
                            onPress={() => router.push(`/explore/products/${product.id}`)}
                            borderRadius={24}
                            overflow="hidden"
                          >
                            <XStack>
                              <Image
                                source={{ uri: product.images[0] }}
                                alt={product.name}
                                width={120}
                                height={120}
                                borderRadius={16}
                              />
                              <YStack flex={1} padding="$4" justifyContent="space-between">
                                <YStack gap="$2">
                                  <Text fontSize={18} fontWeight="600">
                                    {product.name}
                                  </Text>
                                  <Text fontSize={14} color="$gray11">
                                    {product.campus.label}
                                  </Text>
                                </YStack>
                                <XStack justifyContent="space-between" alignItems="center">
                                  <PriceTag>
                                    <Tag size={14} color="$blue11" />
                                    <Text color="$blue11" fontWeight="600">
                                      {product.price} kr
                                    </Text>
                                  </PriceTag>
                                  <ChevronRight size={20} color="$gray11" />
                                </XStack>
                              </YStack>
                            </XStack>
                          </Card>
                        </MotiView>
                      ))}
                    </YStack>
                  )}
                </YStack>
              </MotiView>
            )}

            {(activeCategory === 'all' || activeCategory === 'jobs') && jobs.length > 0 && (
              <MotiView
                key="jobs-section"
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <YStack gap="$4">
                  <XStack justifyContent="space-between" alignItems="center">
                    <H3>Volunteer Positions</H3>
                    <Button
                      chromeless
                      onPress={() => router.push('/explore/volunteer')}
                    >
                      <Text fontSize={14} color="$blue9">See all</Text>
                    </Button>
                  </XStack>

                  {jobs.map((job) => (
                    <MotiView
                      key={`job-${job.id}`}
                      from={{ opacity: 0, translateY: 20 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      <Card
                        pressStyle={{ scale: 0.98 }}
                        onPress={() => router.push(`/explore/volunteer/${job.id}`)}
                      >
                        <BlurView
                          intensity={80}
                          tint={colorScheme === 'dark' ? 'dark' : 'light'}
                          style={{
                            padding: 16,
                            borderRadius: 16,
                          }}
                        >
                          <YStack gap="$3">
                            <XStack gap="$3" alignItems="center">
                              <Stack
                                backgroundColor="$blue4"
                                padding="$2"
                                borderRadius="$4"
                              >
                                <Briefcase size={24} color="$blue11" />
                              </Stack>
                              <YStack flex={1}>
                                <Text
                                  fontSize={16}
                                  fontWeight="bold"
                                  numberOfLines={2}
                                >
                                  <RenderHTML
                                    source={{ html: job.title }}
                                    contentWidth={width - 120}
                                    tagsStyles={{
                                      body: {
                                        color: theme?.color?.get(),
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                      },
                                    }}
                                  />
                                </Text>
                                <Text fontSize={14} color="$gray11">
                                  {campus?.name || 'All Campuses'}
                                </Text>
                              </YStack>
                            </XStack>
                            
                            <XStack justifyContent="flex-end" alignItems="center">
                              <ChevronRight size={20} color="$gray11" />
                            </XStack>
                          </YStack>
                        </BlurView>
                      </Card>
                    </MotiView>
                  ))}
                </YStack>
              </MotiView>
            )}
          </AnimatePresence>
        </YStack>
      </ScrollView>

      <AnimatePresence>
        {scrollY > 200 && (
          <MotiView
            key="floating-header"
            from={{
              opacity: 0,
              translateY: -50,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
            }}
            exit={{
              opacity: 0,
              translateY: -50,
            }}
            transition={{
              type: 'spring',
              damping: 20,
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 100,
            }}
          >
            <BlurView
              intensity={80}
              tint={colorScheme === 'dark' ? 'dark' : 'light'}
              style={{
                paddingTop: headerHeight,
                paddingHorizontal: 16,
                paddingBottom: 16,
              }}
            >
              <XStack justifyContent="space-between" alignItems="center">
                <XStack gap="$3" alignItems="center">
                  <Image
                    source={require('@/assets/logo-light.png')}
                    width={32}
                    height={32}
                    borderRadius={8}
                  />
                  <Text fontWeight="600" fontSize={18}>
                    {campus?.name || 'BISO'}
                  </Text>
                </XStack>
                <XStack gap="$3">
                  <Button
                    circular
                    size="$3"
                    backgroundColor="$backgroundTransparent"
                    borderWidth={1}
                    borderColor="$borderColor"
                    onPress={() => {/* Handle notifications */}}
                  >
                    <Bell size={20} color={theme?.color?.get()} />
                  </Button>
                  <Button
                    backgroundColor="$blue9"
                    paddingHorizontal="$4"
                    paddingVertical="$2"
                    borderRadius="$6"
                    onPress={() => router.push('/explore/events')}
                  >
                    <Text color="white" fontWeight="500">
                      Explore
                    </Text>
                  </Button>
                </XStack>
              </XStack>
            </BlurView>
          </MotiView>
        )}
      </AnimatePresence>
    </>
  );
}
