import React, { useState, useEffect } from 'react';
import { RefreshControl } from 'react-native';
import { 
  YStack, 
  XStack, 
  Stack, 
  Text, 
  ScrollView, 
  Button,
  Image,
  Card,
  H3,
  Paragraph,
  Separator,
  styled
} from 'tamagui';
import { 
  Calendar,
  MapPin,
  ChevronRight,
  Award,
  Briefcase,
  ShoppingBag,
  Tag
} from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { Link, router } from 'expo-router';
import axios from 'axios';
import { Models } from 'react-native-appwrite';
import { useCampus } from '@/lib/hooks/useCampus';
import { functions, getNews } from '@/lib/appwrite';
import { capitalizeFirstLetter, getFormattedDateFromString } from '@/lib/utils/helpers';
import { LinearGradient } from '@tamagui/linear-gradient';
import RenderHTML from 'react-native-render-html';
import { formatDate, parse, parseISO } from 'date-fns';

// Types from your existing components
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
  date: string;          // Changed from start_date to date
  end_date: string;
  venue: string | null;
  url: string;
  featured_image: string;
}


const ProductCard = styled(Card, {
  borderRadius: "$4",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  overflow: "hidden",
  width: 300,
})

const PriceTag = styled(XStack, {
  backgroundColor: "$blue4",
  borderRadius: "$10",
  paddingHorizontal: "$3",
  paddingVertical: "$1",
  alignItems: "center",
  gap: "$1",
})

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { campus } = useCampus();
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [jobs, setJobs] = useState<Models.Document[]>([]);
  const [news, setNews] = useState<Models.DocumentList<Models.Document>>();
  const [isLoading, setIsLoading] = useState(true);

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
  
      setEvents(transformedEvents);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const LoadingCard = () => (
    <MotiView
      from={{ opacity: 0.4 }}
      animate={{ opacity: 0.8 }}
      transition={{
        type: 'timing',
        duration: 1000,
        loop: true
      }}
    >
      <Stack
        backgroundColor="$gray2"
        borderRadius="$4"
        height={200}
        marginVertical="$2"
      />
    </MotiView>
  );

  return (
    <ScrollView
      flex={1}
      backgroundColor="$background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <YStack padding="$4" gap="$6">
        {/* Welcome Section */}
        <YStack gap="$2">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 18 }}
          >
            <Text fontSize={24} fontWeight="bold">
              Welcome to {campus?.name || 'BISO'}
            </Text>
          </MotiView>
        </YStack>

        {/* Latest Events */}
        <YStack gap="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={18} fontWeight="bold">Latest Events</Text>
            <Button
              chromeless
              onPress={() => router.push('/explore/events')}
            >
              <Text fontSize={14} color="$blue9">See all</Text>
            </Button>
          </XStack>

          {isLoading ? (
            <LoadingCard />
          ) : events.length === 0 ? (
            <Card padding="$4" alignItems="center">
              <Text color="$gray11">No upcoming events</Text>
            </Card>
          ) : events.map((event, index) => (
            <Card
              key={event.id}
              chromeless
              onPress={() => router.push(`/explore/events/${event.id}`)}
            >
              <Card.Header>
                <Image
                  source={{ 
                    uri: event.featured_image || './images/placeholder.png'
                  }}
                  alt={event.title}
                  height={140}
                  borderRadius="$2"
                />
              </Card.Header>
              <Card.Footer width="100%"> {/* Added width="100%" */}
                <YStack width="100%"> {/* Added width="100%" to YStack as well */}
                  <XStack justifyContent="space-between" alignItems="center" width="100%"> {/* Added width="100%" */}
                    <Paragraph>{campus?.name || 'National'}</Paragraph>
                    <Paragraph>
                      {formatDate(new Date(event.date), 'dd MMM')}
                    </Paragraph>
                  </XStack>
                  <H3>{event.title}</H3>
                </YStack>
              </Card.Footer>
              {index < events.length - 1 && <Separator marginTop="$4" />}
            </Card>
          ))}
        </YStack>

        {/* Featured Products */}
        <YStack gap="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={18} fontWeight="bold">Shop</Text>
            <Button
              chromeless
              onPress={() => router.push('/explore/products')}
            >
              <Text fontSize={14} color="$blue9">See all</Text>
            </Button>
          </XStack>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$4" paddingRight="$4">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <LoadingCard key={i} />
                ))
              ) : products.map((product) => (
                <ProductCard
                  key={product.id}
                  animation="lazy"
                  pressStyle={{ scale: 0.98 }}
                  onPress={() => router.push(`/explore/products/${product.id}`)}
                >
                  <Card.Header>
                    <Image
                      source={{ uri: product.images[0] }}
                      alt={product.name}
                      height={200}
                      width={300}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      start={[0, 0]}
                      end={[0, 1]}
                      colors={['transparent', 'rgba(0,0,0,0.3)']}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 100,
                      }}
                    />
                  </Card.Header>

                  <Card.Footer padding="$3" gap="$2">
                    <YStack gap="$1">
                      <Text 
                        fontSize={16} 
                        fontWeight="bold"
                        numberOfLines={1}
                      >
                        {product.name}
                      </Text>
                      <PriceTag alignSelf="flex-start">
                        <Tag size={14} color="$blue11" />
                        <Text color="$blue11" fontWeight="600">
                          {product.price} kr
                        </Text>
                      </PriceTag>
                    </YStack>
                  </Card.Footer>
                </ProductCard>
              ))}
            </XStack>
          </ScrollView>
        </YStack>

        {/* Job Positions */}
        <YStack gap="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={18} fontWeight="bold">Volunteer Positions</Text>
            <Button
              chromeless
              onPress={() => router.push('/explore/volunteer')}
            >
              <Text fontSize={14} color="$blue9">See all</Text>
            </Button>
          </XStack>

          {isLoading ? (
            <LoadingCard />
          ) : jobs.map((job) => (
            <Card
              key={job.id}
              animation="bouncy"
              scale={0.9}
              hoverStyle={{ scale: 0.95 }}
              pressStyle={{ scale: 0.9 }}
              onPress={() => router.push(`/explore/volunteer/${job.id}`)}
            >
              <Card.Header padded>
              <XStack gap="$2" alignItems="center">
                  <Briefcase size={20} color="$color" />
                  <Text>
                    <RenderHTML
                      source={{ html: job.title }}
                      contentWidth={300}
                    />
                  </Text>
                </XStack>
              </Card.Header>
              <Card.Footer padded>
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={14} color="$color" opacity={0.8}>
                    Click to view details
                  </Text>
                  <ChevronRight size={20} color="$color" />
                </XStack>
              </Card.Footer>
            </Card>
          ))}
        </YStack>
      </YStack>
    </ScrollView>
  );
}