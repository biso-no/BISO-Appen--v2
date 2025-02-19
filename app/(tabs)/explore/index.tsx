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
  useTheme,
  H3,
  H4,
  Card,
  Paragraph
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
  Users,
  Snowflake,
  GraduationCap,
  Presentation,
  Info
} from '@tamagui/lucide-icons'
import { MotiView } from 'moti'
import { Link, RelativePathString, useRouter } from 'expo-router'
import { Models, Query } from 'react-native-appwrite'
import { useCampus } from '@/lib/hooks/useCampus'
import { databases } from '@/lib/appwrite'
import axios from 'axios'
import { useAuth } from '@/components/context/auth-provider'
import { useColorScheme } from 'react-native'
import { format, parseISO } from 'date-fns'
import { ImageSourcePropType } from 'react-native'

// Import the logo images
const fadderullanLogo = require('@/assets/images/fadderullan-white.png');
const kdLogo = require('@/assets/images/kd.png');
const kdHorizontalLogo = require('@/assets/images/kd-horizontal.png');
const bisoLogo = require('@/assets/logo-light.png');

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

interface MajorEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  image: ImageSourcePropType;
  icon: any;
  color: string;
  link: string;
  status: string;
  stats: Array<{ icon: any; label: string }>;
}

const majorEvents: MajorEvent[] = [
  {
    id: 'buddy-week',
    title: 'FADDERULLAN',
    description: 'Your ultimate introduction to student life at BI. Join us for an unforgettable week filled with activities, new friendships, and amazing memories.',
    date: 'August 2024',
    image: fadderullanLogo,
    icon: Users,
    color: 'orange',
    link: '/explore/major-events/buddy-week',
    status: 'Registration Open',
    stats: [
      { icon: Users, label: '1000+ Students' },
      { icon: Calendar, label: '7 Days' },
      { icon: MapPin, label: 'All Campuses' }
    ]
  },
  {
    id: 'career-days',
    title: 'KARRIEREDAGENE',
    description: 'Norway\'s largest student-driven career fair. Connect with leading companies, explore opportunities, and kickstart your career journey.',
    date: 'March 15-16, 2024',
    image: kdHorizontalLogo,
    icon: GraduationCap,
    color: 'career',
    link: '/explore/major-events/career-days',
    status: 'Coming Soon',
    stats: [
      { icon: Briefcase, label: '80+ Companies' },
      { icon: Presentation, label: '40+ Talks' },
      { icon: Users, label: '5000+ Students' }
    ]
  }
];

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
  },
  {
    id: 'about',
    title: 'About BISO',
    description: 'Learn more about BISO',
    icon: Info,
    color: 'purple',
    link: '/explore/about'
  }
]

const MajorEventCard = ({ event }: { event: MajorEvent }) => {
  const theme = useTheme();
  const isBuddyWeek = event.id === 'buddy-week';
  const isCareerDays = event.id === 'career-days';

  const router = useRouter();
  
  return (
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
          <Card
            elevate
            size="$4"
            bordered
            animation="quick"
            scale={0.9}
            hoverStyle={{ scale: 0.925 }}
            pressStyle={{ scale: 0.875 }}
            overflow="hidden"
            width={340}
            height={480}
            onPress={() => router.push(event.link as RelativePathString)}
            borderColor={
              isBuddyWeek ? '$buddyAccent' : 
              isCareerDays ? '$careerSecondary' : 
              `$${event.color}4`
            }
            backgroundColor={
              isBuddyWeek ? '$buddyLight' : 
              isCareerDays ? '$careerBgDark' : 
              undefined
            }
          >
            <YStack flex={1}>
              {/* Status Badge */}
              {event.status && (
                <XStack
                  backgroundColor={
                    isBuddyWeek ? '$buddyPrimary' : 
                    isCareerDays ? '$careerPrimary' : 
                    `$${event.color}9`
                  }
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  justifyContent="center"
                  alignItems="center"
                  position="absolute"
                  top="$4"
                  right="$4"
                  borderRadius="$4"
                  zIndex={1}
                >
                  <Text 
                    color={isCareerDays ? '$careerBgDark' : 'white'} 
                    fontWeight="bold"
                    fontSize="$3"
                  >
                    {event.status}
                  </Text>
                </XStack>
              )}

              {/* Hero Section */}
              <YStack
                backgroundColor={
                  isBuddyWeek ? '$buddyPrimary' : 
                  isCareerDays ? '$careerBgDark' : 
                  undefined
                }
                padding="$6"
                alignItems="center"
                justifyContent="center"
                height={200}
                {...(isCareerDays && {
                  backgroundImage: 'linear-gradient(135deg, $careerBgDark, $careerBgLight)'
                })}
              >
                <Image
                  source={event.image}
                  style={{ 
                    width: '100%',
                    height: 120,
                    transform: [{ scale: isBuddyWeek ? 1.1 : 1 }]
                  }}
                  objectFit="contain"
                />
              </YStack>

              {/* Content Section */}
              <YStack flex={1} padding="$4" gap="$4">
                <YStack gap="$2">
                  <H4 
                    color={
                      isBuddyWeek ? '$buddyPrimary' : 
                      isCareerDays ? '$careerPrimary' : 
                      `$${event.color}11`
                    }
                    fontWeight="bold"
                    size="$7"
                  >
                    {event.title}
                  </H4>
                  <Text 
                    color={
                      isBuddyWeek ? '$buddyAccent' : 
                      isCareerDays ? '$careerSecondary' : 
                      `$${event.color}10`
                    }
                    fontWeight="500"
                    fontSize="$4"
                  >
                    {event.date}
                  </Text>
                </YStack>

                <Paragraph 
                  color={
                    isBuddyWeek ? '$buddyDark' : 
                    isCareerDays ? 'white' : 
                    `$${event.color}11`
                  }
                  opacity={isBuddyWeek || isCareerDays ? 1 : 0.8} 
                  numberOfLines={3}
                  size="$4"
                >
                  {event.description}
                </Paragraph>

                {/* Stats Section */}
                <YStack gap="$3">
                  {event.stats.map((stat, index) => (
                    <XStack 
                      key={index} 
                      gap="$2" 
                      alignItems="center"
                      backgroundColor={
                        isBuddyWeek ? '$buddyLight' :
                        isCareerDays ? '$careerBgLight' :
                        `$${event.color}2`
                      }
                      padding="$2"
                      borderRadius="$4"
                    >
                      <stat.icon 
                        size={16} 
                        color={
                          isBuddyWeek ? '$buddyPrimary' :
                          isCareerDays ? '$careerPrimary' :
                          `$${event.color}11`
                        }
                      />
                      <Text
                        color={
                          isBuddyWeek ? '$buddyPrimary' :
                          isCareerDays ? '$careerPrimary' :
                          `$${event.color}11`
                        }
                        fontSize="$3"
                      >
                        {stat.label}
                      </Text>
                    </XStack>
                  ))}
                </YStack>

                {/* Action Button */}
                <Button
                  backgroundColor={
                    isBuddyWeek ? '$buddyPrimary' :
                    isCareerDays ? '$careerPrimary' :
                    `$${event.color}9`
                  }
                  color={isCareerDays ? '$careerBgDark' : 'white'}
                  size="$4"
                  fontWeight="bold"
                  borderRadius="$4"
                  hoverStyle={{ 
                    backgroundColor: isBuddyWeek ? '$buddyAccent' :
                    isCareerDays ? '$careerSecondary' :
                    `$${event.color}10`
                  }}
                  pressStyle={{ scale: 0.97 }}
                  icon={event.icon}
                >
                  {isBuddyWeek ? 'Join FADDERULLAN' : 'Learn More'}
                </Button>
              </YStack>
            </YStack>
          </Card>
        </MotiView>
  );
};

export default function ExploreScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const { data: user } = useAuth()
  const { campus } = useCampus()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const theme = useTheme()
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
                objectFit="cover"
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

const CategoryCard = ({ category }: { category: ExploreCategory }) => {
  const theme = useTheme();
  const handlePress = () => {
    if (category.requiresAuth && !user) {
      setShowAuthDialog(true);
      return;
    }
    router.push(category.link as any);
  };

  return (
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
        <Card
          elevate
          size="$4"
          bordered
          disabled={category.requiresAuth && !user}
          onPress={handlePress}
          animation="quick"
          scale={0.9}
          hoverStyle={{ scale: 0.925 }}
          pressStyle={{ scale: 0.875 }}
          opacity={category.requiresAuth && !user ? 0.5 : 1}
          borderColor={`$${category.color}4`}
        >
          <Card.Header 
            padded
            backgroundColor={`$${category.color}2`}
          >
            <XStack gap="$3" alignItems="center">
              <YStack
                backgroundColor={`$${category.color}4`}
                padding="$3"
                borderRadius="$4"
              >
                {category.requiresAuth && !user ? (
                  <Lock 
                    size={24} 
                    color={`$${category.color}11`}
                  />
                ) : (
                  <category.icon 
                    size={24} 
                    color={`$${category.color}11`}
                  />
                )}
              </YStack>
              <YStack flex={1}>
                <XStack gap="$2" alignItems="center">
                  <H4 color={`$${category.color}11`}>{category.title}</H4>
                  {category.requiresAuth && !user && (
                    <Lock size={16} color={`$${category.color}9`} />
                  )}
                </XStack>
                <Paragraph color={`$${category.color}11`} opacity={0.8}>
                  {category.description}
                </Paragraph>
              </YStack>
              <ChevronRight 
                size={20} 
                color={`$${category.color}11`}
              />
            </XStack>
          </Card.Header>
        </Card>
      </MotiView>
  );
};

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <YStack padding="$4" gap="$6">
        {/* Search Bar */}
        <XStack 
          backgroundColor="$backgroundHover"
          borderRadius="$4"
          paddingHorizontal="$3"
          paddingVertical="$2"
          alignItems="center"
          gap="$3"
        >
          <Search 
            size={20} 
            color={theme.gray11?.val} 
          />
          <Input
            flex={1}
            borderWidth={0}
            backgroundColor="transparent"
            placeholder="Search events, clubs, and more..."
          />
        </XStack>

        {/* Major Events Section */}
        <YStack gap="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <H3>Projects</H3>
            <Link href="/explore/major-events" asChild>
              <Button chromeless size="$3">
                <XStack gap="$2" alignItems="center">
                  <Text color={theme.blue10?.val}>View all</Text>
                  <ChevronRight size={16} color={theme.blue10?.val} />
                </XStack>
              </Button>
            </Link>
          </XStack>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ 
              gap: 24,
              paddingHorizontal: 16,
              paddingVertical: 8
            }}
          >
            {majorEvents.map((event) => (
              <MotiView
                key={event.id}
                from={{ 
                  opacity: 0,
                  scale: 0.95,
                  translateX: 50
                }}
                animate={{ 
                  opacity: 1,
                  scale: 1,
                  translateX: 0
                }}
                transition={{
                  type: 'spring',
                  damping: 20,
                  mass: 0.8,
                  delay: majorEvents.findIndex(e => e.id === event.id) * 100
                }}
              >
                <MajorEventCard event={event} />
              </MotiView>
            ))}
          </ScrollView>
        </YStack>

        {/* Quick Actions */}
        <YStack gap="$4">
          <H3>Quick Actions</H3>
          <YStack gap="$3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </YStack>
        </YStack>

        {/* Upcoming Events */}
        <YStack gap="$4">
          <H3>Upcoming Events</H3>
          <YStack gap="$3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <LoadingEventCard key={i} />
              ))
            ) : error ? (
              <Text color="$red10">{error}</Text>
            ) : (
              events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            )}
          </YStack>
        </YStack>
      </YStack>
    </ScrollView>
  )
}