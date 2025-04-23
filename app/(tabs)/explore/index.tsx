import { useEffect, useState, useCallback } from 'react'
import { RefreshControl } from 'react-native'
import { 
  YStack, 
  XStack, 
  Stack, 
  Text, 
  ScrollView, 
  Button, 
  Image,
  useTheme,
  View
} from 'tamagui'
import { 
  Calendar, 
  ShoppingBag,
  Receipt, 
  Briefcase,
  Lock,
  ChevronRight, 
  Users
} from '@tamagui/lucide-icons'
import { MotiView } from 'moti'
import { Link, useRouter } from 'expo-router'
import { useCampus } from '@/lib/hooks/useCampus'
import axios from 'axios'
import { useAuth } from '@/components/context/core/auth-provider'
import { useColorScheme } from 'react-native'
import { useTranslation } from 'react-i18next'
import i18next from '@/i18n'
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

type ExploreCategory = {
  id: string
  title: string
  description: string
  icon: any
  color: string
  link: string
  requiresAuth?: boolean
}



export default function ExploreScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const { user } = useAuth()
  const { campus } = useCampus()
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const { t, i18n } = useTranslation()

  const colorScheme = useColorScheme();

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

  const loadEvents = useCallback(async () => {
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
        date: event.start_date,
        end_date: event.end_date,
        venue: event.venue?.name,
        url: event.website,
        featured_image: event.thumbnail?.url
      }));
      setEvents(transformedEvents);
      setHasLoaded(true);
    } catch (err) {
      setError(t('explore.errors.failedToLoadEvents'));
      console.error('Error loading events:', err);
    } finally {
      setIsLoading(false);
    }
  }, [campus, t]);

  useEffect(() => {
    if (!hasLoaded) {
      loadEvents()
    }
  }, [hasLoaded, loadEvents])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setHasLoaded(false)
    await loadEvents()
    setRefreshing(false)
  }, [loadEvents])

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

  const EventCard = ({ event, index }: { event: Event, index: number }) => {
    const router = useRouter()
    
    const formatEventDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString(i18n.language, {
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
              mass: 0.8,
              delay: index * 100,
              stiffness: 100
            }}
            key={`event-${event.id}`}
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
                    onPress={() => router.push(`/(main)/explore/events/${event.id}`)}
                  >
                    <Text color="white">{t('explore.viewDetails')}</Text>
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
const CategoryCard = ({ category, index }: { category: ExploreCategory, index: number }) => {
  const theme = useTheme()
  const router = useRouter()
  
  const handlePress = () => {
    // Simply navigate to the link path directly
    router.push(category.link as any);
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
          delay: index * 100,
          stiffness: 100
        }}
        key={`category-${category.id}`}
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
                {t(`explore.categories.${category.id}.title`)}
              </Text>
              <Text 
                fontSize={14} 
                color="$color"
                opacity={0.8}
                numberOfLines={2}
                flexWrap="wrap"
              >
                {category.requiresAuth && !user ? 
                  t('explore.signInRequired') : 
                  t(`explore.categories.${category.id}.description`)}
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
            <View>
              <Text fontSize={18} fontWeight="bold" color="$color">{t('explore.featuredEvents')}</Text>
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
                    <Text color="white">{t('common.retry')}</Text>
                  </Button>
                </Stack>
              ) : isLoading ? (
                <View>
                  <LoadingEventCard />
                  <LoadingEventCard />
                </View>
              ) : (
                events.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))
              )}
            </View>
          )}
        </YStack>

        <YStack gap="$4" marginTop="$6" marginBottom="$8">
          <Text fontSize={18} fontWeight="bold" color="$color">{t('explore.services')}</Text>
          <YStack gap="$3">
            {categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}