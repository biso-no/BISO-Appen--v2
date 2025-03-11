import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { 
  YStack, 
  XStack, 
  ScrollView, 
  Text,
  Card,
  H3,
  H4,
  Image,
  Paragraph,
  Separator,
  Stack,
  useTheme,
  useWindowDimensions
} from 'tamagui';
import { MotiView } from 'moti';
import { Calendar, MapPin, Clock } from '@tamagui/lucide-icons';
import { parseISO, isThisWeek, format, addMonths } from 'date-fns';
import axios from 'axios';
import { useCampus } from '@/lib/hooks/useCampus';
import RenderHTML from 'react-native-render-html';
import { LinearGradient } from '@tamagui/linear-gradient';

interface Event {
  id: number;
  title: string;
  description: string;
  excerpt: string;
  start_date: string;
  end_date: string;
  venue: {
    name: string;
    city: string;
  };
  cost: string;
  all_day: boolean;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
}

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



const AnimatedCard = ({ event, index }: { event: Event; index: number }) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const date = parseISO(event.start_date);

  const { height: windowHeight, width } = useWindowDimensions();

  const textColor = theme?.color?.val;
    const style = { 
      body: { 
        fontSize: 28, 
        lineHeight: 30, 
        color: textColor, 
      }, 
    };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 100, type: 'timing', duration: 500 }}
    >
      <Card
        elevation={2}
        marginVertical="$2"
        marginHorizontal="$3"
        overflow="hidden"
        onPress={() => router.push(`/explore/events/${event.id}`)}
      >
        <Card.Header>
          <Image
            source={{ uri: event.thumbnail?.url }}
            alt={event.title}
            height={180}
            width="100%"
            borderRadius="$2"
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
        
        <Card.Footer padding="$4">
          <YStack gap="$2">
          <RenderHTML 
              source={{ html: event.title }} 
              contentWidth={width - 40} 
              tagsStyles={style}
              />
            
            <XStack gap="$4" alignItems="center" flexWrap="wrap">
              <XStack gap="$2" alignItems="center">
                <Clock size={14} color={theme.color?.val} />
                <Text fontSize={12} opacity={0.7}>
                  {format(date, 'EEE, MMM d • HH:mm')}
                </Text>
              </XStack>
              
              {event.venue?.name && (
                <XStack gap="$2" alignItems="center">
                  <MapPin size={14} color={theme.color?.val} />
                  <Text fontSize={12} opacity={0.7}>
                    {event.venue.name}
                  </Text>
                </XStack>
              )}
              
              {event.cost && (
                <Text fontSize={12} opacity={0.7}>
                  {event.cost}
                </Text>
              )}
            </XStack>
            
            <RenderHTML
              source={{ html: event.excerpt }}
              contentWidth={300}
              tagsStyles={{
                body: { 
                  fontSize: 14, 
                  lineHeight: 20, 
                  color: textColor,
                },
              }}
            />
          </YStack>
        </Card.Footer>
      </Card>
    </MotiView>
  );
};

const EventsSection = ({ title, events }: { title: string; events: Event[] }) => {
  if (events.length === 0) return null;

  return (
    <YStack gap="$2" marginTop="$4">
      <H4 paddingHorizontal="$3">{title}</H4>
      {events.map((event, index) => (
        <AnimatedCard key={event.id} event={event} index={index} />
      ))}
      <Separator marginTop="$2" />
    </YStack>
  );
};

export function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { campus } = useCampus();
  const theme = useTheme();

  const fetchEvents = useCallback(async () => {
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
      
      // Transform and filter the events
      const today = new Date();
      const threeMonthsFromNow = addMonths(today, 3);
      
      const filteredEvents = response.data
        .filter((event: Event) => {
          const eventDate = parseISO(event.start_date);
          return eventDate >= today && eventDate <= threeMonthsFromNow;
        });

      setEvents(filteredEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [campus]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [campus, fetchEvents]);

  // Helper function to categorize events
  const categorizeEvents = () => {
    const today = new Date();
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);
    
    return {
      today: events.filter(event => {
        const eventDate = parseISO(event.start_date);
        return eventDate >= today && eventDate <= endOfToday;
      }),
      tomorrow: events.filter(event => {
        const eventDate = parseISO(event.start_date);
        return eventDate > endOfToday && eventDate <= endOfTomorrow;
      }),
      thisWeek: events.filter(event => {
        const eventDate = parseISO(event.start_date);
        return isThisWeek(eventDate) && eventDate > endOfTomorrow;
      }),
      upcoming: events.filter(event => {
        const eventDate = parseISO(event.start_date);
        return !isThisWeek(eventDate) && eventDate > today;
      })
    };
  };

  if (isLoading) {
    return (
      <YStack padding="$4" gap="$4">
        {[1, 2, 3].map((_, index) => (
          <LoadingCard key={index} />
        ))}
      </YStack>
    );
  }

  const { today, tomorrow, thisWeek, upcoming } = categorizeEvents();

  return (
    <ScrollView
    contentContainerStyle={{
      paddingBottom: 100
    }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <YStack paddingVertical="$4">
        {events.length === 0 ? (
          <YStack 
            gap="$4" 
            alignItems="center" 
            justifyContent="center" 
            paddingTop="$8"
          >
            <Calendar size={48} color={theme.color?.val} />
            <H4>No upcoming events</H4>
            <Paragraph color="$gray11" textAlign="center">
              Check back later for new events
            </Paragraph>
          </YStack>
        ) : (
          <>
            {today.length > 0 && (
              <EventsSection title="Today" events={today} />
            )}
            {tomorrow.length > 0 && (
              <EventsSection title="Tomorrow" events={tomorrow} />
            )}
            {thisWeek.length > 0 && (
              <EventsSection title="This Week" events={thisWeek} />
            )}
            {upcoming.length > 0 && (
              <EventsSection title="Upcoming" events={upcoming} />
            )}
          </>
        )}
      </YStack>
    </ScrollView>
  );
}