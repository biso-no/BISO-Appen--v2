import { useEffect, useState } from 'react'
import { RefreshControl } from 'react-native'
import { 
  YStack, 
  XStack, 
  Stack, 
  Text, 
  Input, 
  ScrollView, 
  Button, 
  Image,
  useTheme
} from 'tamagui'
import { 
  Search, 
  MapPin, 
  Calendar, 
  Ticket, 
  ShoppingBag,
  Receipt, 
  Briefcase,
  Bell,
  Lock,
  ChevronRight, 
  Users
} from '@tamagui/lucide-icons'
import { MotiView } from 'moti'
import { Link, useRouter } from 'expo-router'
import { Models, Query } from 'react-native-appwrite'
import { useCampus } from '@/lib/hooks/useCampus'
import { databases } from '@/lib/appwrite'
import axios from 'axios'
import { useAuth } from '@/components/context/core/auth-provider'
import { useColorScheme } from 'react-native'
import { format, parseISO } from 'date-fns'

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

interface WordPressEvent {
  id: number;
  date: string;
  slug: string;
  status: string;
  description: string;
  link: string;
  image: {
    url: string;
  }
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
  };
  organizer_name: string;
}

type ExploreCategory = {
  id: string
  title: string
  description: string
  icon: any
  color: string
  link: string
  requiresAuth?: boolean
}

const categories: ExploreCategory[] = [
  {
    id: 'events',
    title: 'Events',
    description: 'Discover upcoming events and activities',
    icon: Calendar,
    color: 'purple',
    link: '/explore/events'
  },
  {
    id: 'shop',
    title: 'BISO Shop',
    description: 'Official merchandise and more',
    icon: ShoppingBag,
    color: 'pink',
    link: '/explore/products'
  },
  {
    id: 'units',
    title: 'All clubs & units',
    description: 'Discover student clubs and organizations',
    icon: Users,
    color: 'blue',
    link: '/explore/units'
  },
  {
    id: 'reimbursements',
    title: 'Reimbursements',
    description: 'Submit and track expenses',
    icon: Receipt,
    color: 'green',
    link: '/explore/expenses',
    requiresAuth: true
  },
  {
    id: 'jobs',
    title: 'Job Board',
    description: 'Volunteer positions and board positions',
    icon: Briefcase,
    color: 'orange',
    link: '/explore/volunteer'
  }
]

export default function ExploreScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const { user } = useAuth()
  const { campus } = useCampus()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const colorScheme = useColorScheme();

  useEffect(() => {
    loadEvents()
  }, [campus])

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
  
      let url = 'https://biso.no/wp-json/biso/v1/events?featured=true';
      
      const params: Record<string, string | number> = {
        per_page: 25
      };
  
      if (campus?.name) {
        params.organizer = 'biso-' + campus.name.toLowerCase();
      }
  
      const response = await axios.get(url, { params });
      
      const transformedEvents = response.data.map((event: any) => ({
        id: event.id,
        title: event.title,
        content: event.description,
        excerpt: event.excerpt,
        date: event.start_date,         // Changed from date to start_date
        end_date: event.end_date,
        venue: event.venue?.name,
        url: event.website,
        featured_image: event.thumbnail?.url  // Changed to use thumbnail.url
      }));
      console.log("Event date:", transformedEvents)
      setEvents(transformedEvents);
    } catch (err) {
      setError('Failed to load events');
      console.error('Error loading events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true)
    await loadEvents()
    setRefreshing(false)
  }

  const LoadingEventCard = () => (
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
        backgroundColor="$backgroundHover"
        borderRadius="$4"
        height={250}
        marginVertical="$2"
      />
    </MotiView>
  )

  const EventCard = ({ event }: { event: Event }) => {
    const router = useRouter()
    
    const formatEventDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-NO', {
        day: 'numeric',
        month: 'short'
      });
    };
  
    return (
      <Link href={`/event/${event.id}` as any} asChild>
        <Button
          unstyled
          pressStyle={{ scale: 0.98 }}
        >
          <MotiView
            from={{ 
              opacity: 0,
              scale: 0.9,
              translateY: 20
            }}
            animate={{ 
              opacity: 1,
              scale: 1,
              translateY: 0
            }}
            transition={{
              type: 'spring',
              damping: 18,
              mass: 0.8
            }}
          >
            <Stack
              backgroundColor="$background"
              borderRadius="$4"
              borderColor="$borderColor"
              borderWidth={1}
              overflow="hidden"
              marginVertical="$2"
            >
              <Image
                source={{ uri: event.featured_image }}
                style={{ width: '100%', height: 200 }}
                borderRadius={16}
                resizeMode="cover"
              />
              <YStack padding="$4" gap="$2">
                <Text 
                  fontSize={18} 
                  fontWeight="bold" 
                  numberOfLines={1}
                  color="$color"
                >
                  {event.title}
                </Text>
                <Text 
                  fontSize={14} 
                  color="$color"
                  opacity={0.7}
                  numberOfLines={2}
                >
                  {event.excerpt}
                </Text>
                <XStack justifyContent="space-between" alignItems="center">
                  <Text 
                    fontSize={14} 
                    color="$color" 
                    opacity={0.7}
                  >
                    {formatEventDate(event.date)}
                  </Text>
                  <Button
                    backgroundColor="$blue8"
                    color="white"
                    borderRadius="$10"
                    paddingHorizontal="$4"
                    pressStyle={{ scale: 0.97 }}
                    onPress={() => router.push(`/explore/events/${event.id}`)}
                  >
                    <Text color="white">View Details</Text>
                  </Button>
                </XStack>
              </YStack>
            </Stack>
          </MotiView>
        </Button>
      </Link>
    );
  };

// CategoryCard component with improved contrast
const CategoryCard = ({ category }: { category: ExploreCategory }) => {
  const theme = useTheme()
  const handlePress = () => {
    if (category.requiresAuth && !user) {
      setShowAuthDialog(true)
      return
    }
    router.push(category.link as any)
  }

  // Get correct background and border colors based on theme
  const getBackgroundColor = () => {
    return colorScheme === 'dark' 
      ? `$${category.color}7` // Slightly lighter background in dark mode
      : `$${category.color}1` // Lighter background in light mode
  }

  const getBorderColor = () => {
    return colorScheme === 'dark'
      ? `$${category.color}5` // More visible border in dark mode
      : `$${category.color}3` // Subtle border in light mode
  }

  const getIconBackground = () => {
    return colorScheme === 'dark'
      ? `$${category.color}5` // More visible icon background in dark mode
      : `$${category.color}2` // Subtle icon background in light mode
  }

  const getIconColor = () => {
    return colorScheme === 'dark'
      ? `$${category.color}11` // Brighter icon in dark mode
      : `$${category.color}9`  // Standard icon color in light mode
  }

  return (
    <Button
      unstyled
      disabled={category.requiresAuth && !user}
      pressStyle={{ scale: 0.98 }}
      onPress={handlePress}
    >
      <MotiView
        from={{ opacity: 0, translateX: -20 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{
          type: 'spring',
          damping: 18,
          mass: 0.8,
          delay: categories.findIndex(c => c.id === category.id) * 100
        }}
      >
        <XStack
          backgroundColor={getBackgroundColor()}
          borderColor={getBorderColor()}
          borderWidth={1}
          padding="$4"
          borderRadius="$4"
          alignItems="flex-start"
          justifyContent="space-between"
          width="100%"
        >
          <XStack 
            gap="$4" 
            alignItems="flex-start"
            flex={1}
            flexWrap="nowrap"
          >
            <Stack
              backgroundColor={getIconBackground()}
              padding="$3"
              borderRadius="$3"
              flexShrink={0}
            >
              {category.requiresAuth && !user ? (
                <Lock size={24} color={getIconColor()} />
              ) : (
                <category.icon size={24} color={getIconColor()} />
              )}
            </Stack>
            <YStack flex={1} minWidth={0}>
              <Text 
                fontWeight="bold"
                numberOfLines={1}
                color="$color"
              >
                {category.title}
              </Text>
              <Text 
                fontSize={14} 
                color="$color"
                opacity={0.8} // Increased opacity for better readability
                numberOfLines={2}
                flexWrap="wrap"
              >
                {category.requiresAuth && !user ? 
                  'Please sign in to access this feature' : 
                  category.description}
              </Text>
            </YStack>
          </XStack>
          <Stack flexShrink={0} marginLeft="$2">
            <ChevronRight size={20} color={getIconColor()} />
          </Stack>
        </XStack>
      </MotiView>
    </Button>
  )
}

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView
        padding="$4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingBottom: 100 // Add padding at the bottom for the tab bar
        }}
      >
        <YStack gap="$4">
          {events.length > 0 && (
            <>
              <Text fontSize={18} fontWeight="bold" color="$color">Featured Events</Text>
              {error ? (
                <Stack
                  backgroundColor="$red2"
                  padding="$4"
                  borderRadius="$4"
                  borderWidth={1}
                  borderColor="$red4"
                >
                  <Text color="$red9">{error}</Text>
                  <Button
                    marginTop="$2"
                    onPress={loadEvents}
                    backgroundColor="$red8"
                  >
                    <Text color="white">Retry</Text>
                  </Button>
                </Stack>
              ) : isLoading ? (
                <>
                  <LoadingEventCard />
                  <LoadingEventCard />
                </>
              ) : (
                events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))
              )}
            </>
          )}
        </YStack>

        <YStack gap="$4" marginTop="$6" marginBottom="$8">
          <Text fontSize={18} fontWeight="bold" color="$color">Services</Text>
          <YStack gap="$3">
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}