import React, { memo, useMemo } from "react";
import { useWindowDimensions, Animated } from "react-native";
import { router } from "expo-router";
import { 
  YStack, 
  XStack, 
  H3, 
  H4,
  Image, 
  Text, 
  Button, 
  Card, 
  styled,
  View,
  ScrollView,
  Theme,
  Paragraph,
  Stack
} from "tamagui";
import { Calendar, Clock, MapPin, Star, ArrowRight, Heart } from "@tamagui/lucide-icons";
import { format, parseISO } from "date-fns";
import { LinearGradient } from "tamagui/linear-gradient";
import { MotiView, AnimatePresence } from "moti";
import { useTranslation } from "react-i18next";

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

interface HomeEventsProps {
  events: Event[];
  isFullView?: boolean;
}

// Create beautiful, modern styling
const EventCard = styled(Card, {
  borderRadius: "$6", 
  overflow: "hidden",
  elevation: 0,
  backgroundColor: "transparent",
  marginBottom: "$5",
  animation: "bouncy",
  borderWidth: 0,
})

const CardOverlay = styled(View, {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  padding: "$4",
  zIndex: 2,
})

const PriceTag = styled(Stack, {
  backgroundColor: "white",
  borderRadius: "$4",
  paddingHorizontal: "$2",
  paddingVertical: "$1",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  top: "$3",
  right: "$3",
  zIndex: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
})

const HeartButton = styled(Button, {
  position: "absolute",
  top: "$3",
  right: "$3",
  zIndex: 10,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  borderRadius: "$10",
  width: 40,
  height: 40,
  padding: 0,
  alignItems: "center",
  justifyContent: "center",
})

const SectionHeader = styled(XStack, {
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "$4",
  paddingHorizontal: "$2",
})

const CategoryBadge = styled(Text, {
  fontSize: "$1",
  fontWeight: "500",
  paddingHorizontal: "$2",
  paddingVertical: "$1",
  borderRadius: "$2",
  marginRight: "$2",
  backgroundColor: "$blue4",
  color: "$blue10",
  overflow: "hidden",
})

// Create a memoized component to prevent unnecessary re-renders
export const HomeEvents = memo(({ events, isFullView = false }: HomeEventsProps) => {
  const { width } = useWindowDimensions();
  const cardWidth = width - 32;
  const { t } = useTranslation();
  
  // Extract dates and group by month for better visualization
  const eventsByDate = useMemo(() => {
    const today = new Date();
    const thisWeek = events.filter(event => {
      const eventDate = parseISO(event.start_date);
      const diffTime = Math.abs(eventDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });
    
    const upcoming = events.filter(event => {
      const eventDate = parseISO(event.start_date);
      const diffTime = Math.abs(eventDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 7;
    });
    
    return { thisWeek, upcoming };
  }, [events]);
  
  // Format the event time in a more readable way
  const formatEventTime = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'h:mm a');
  };
  
  if (events.length === 0) {
    return (
      <YStack
        alignItems="center"
        justifyContent="center"
        height={200}
        width="100%"
        backgroundColor="$gray100"
        borderRadius="$4"
      >
        <Text color="$gray700">{t('no-upcoming-events')}</Text>
      </YStack>
    );
  }
  
  // Render a different UI based on whether we're in full view (Events tab) or compact view (All tab)
  if (isFullView) {
    // Full view with rich UI for the Events tab
    return (
      <YStack gap="$4" paddingHorizontal="$4">
        <SectionHeader>
          <Theme name="heading">
            <H3 letterSpacing={-0.5} fontWeight="700">Events</H3>
          </Theme>
          <Button
            chromeless
            size="$2"
            borderRadius="$6"
            backgroundColor="$gray100"
            pressStyle={{ scale: 0.97, backgroundColor: "$gray200" }}
            onPress={() => router.push('/explore/events')}
          >
            <XStack alignItems="center" gap="$1.5">
              <Text fontSize="$2" fontWeight="500" color="$gray900">Explore all</Text>
              <ArrowRight size={14} color="$gray900" />
            </XStack>
          </Button>
        </SectionHeader>

        {/* This week's events with horizontal scroll */}
        {eventsByDate.thisWeek.length > 0 && (
          <YStack gap="$3" marginBottom="$5">
            <H4 paddingLeft="$2" color="$gray700" fontWeight="600" letterSpacing={-0.5}>This week</H4>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, gap: 12 }}
            >
              <AnimatePresence>
                {eventsByDate.thisWeek.map((event) => (
                  <MotiView
                    key={`this-week-${event.id}`}
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -20 }}
                    transition={{ type: 'timing', duration: 500, delay: 100 }}
                  >
                    <Card
                      width={280}
                      height={370}
                      scale={1}
                      borderRadius="$6"
                      overflow="hidden"
                      bordered={false}
                      elevate
                      animation="bouncy"
                      pressStyle={{ scale: 0.96 }}
                      onPress={() => router.push(`/explore/events/${event.id}`)}
                      backgroundColor="$background"
                    >
                      <Card.Background>
                        <Image
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          resizeMode="cover"
                          source={{ 
                            uri: event.thumbnail?.url || 'https://placehold.co/600x400/png' 
                          }}
                          alt={event.title}
                        />
                        
                        {/* Gradient overlay for better text readability */}
                        <LinearGradient
                          start={[0, 0.7]}
                          end={[0, 1]}
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={{
                            position: 'absolute',
                            height: '50%',
                            bottom: 0,
                            left: 0,
                            right: 0,
                          }}
                        />
                      </Card.Background>

                      {/* Event cost badge */}
                      {event.cost && event.cost !== 'Free' && (
                        <PriceTag>
                          <Text fontSize="$1" fontWeight="600" color="$blue9">{event.cost}</Text>
                        </PriceTag>
                      )}
                      
                      {event.cost === 'Free' && (
                        <PriceTag>
                          <Text fontSize="$1" fontWeight="600" color="$green9">Free</Text>
                        </PriceTag>
                      )}

                      {/* Event info overlay */}
                      <Card.Footer padded>
                        <YStack gap="$1">
                          {event.categories && event.categories.length > 0 && (
                            <XStack flexWrap="wrap" marginBottom="$1">
                              {event.categories.slice(0, 1).map((category) => (
                                <CategoryBadge key={category}>
                                  {category}
                                </CategoryBadge>
                              ))}
                            </XStack>
                          )}
                          
                          <H4 
                            color="white" 
                            fontSize="$5" 
                            lineHeight="$5"
                            numberOfLines={2}
                            letterSpacing={-0.5}
                          >
                            {event.title}
                          </H4>
                          
                          <YStack gap="$2" marginTop="$2">
                            <XStack gap="$2" alignItems="center">
                              <Calendar size={14} color="white" />
                              <Text color="white" fontWeight="500" fontSize="$2">
                                {format(parseISO(event.start_date), 'E, MMM d')}
                              </Text>
                            </XStack>
                            
                            <XStack gap="$2" alignItems="center">
                              <Clock size={14} color="white" />
                              <Text color="white" fontSize="$2">
                                {formatEventTime(event.start_date)}
                                {!event.all_day && event.end_date && 
                                  ` - ${formatEventTime(event.end_date)}`}
                                {event.all_day && ' (All day)'}
                              </Text>
                            </XStack>
                            
                            {event.venue && (
                              <XStack gap="$2" alignItems="center">
                                <MapPin size={14} color="white" />
                                <Text color="white" fontSize="$2" numberOfLines={1}>
                                  {event.venue.name}
                                </Text>
                              </XStack>
                            )}
                          </YStack>
                        </YStack>
                      </Card.Footer>
                    </Card>
                  </MotiView>
                ))}
              </AnimatePresence>
            </ScrollView>
          </YStack>
        )}

        {/* Upcoming events */}
        {eventsByDate.upcoming.length > 0 && (
          <YStack>
            <H4 paddingLeft="$2" color="$gray700" fontWeight="600" letterSpacing={-0.5} marginBottom="$3">
              Upcoming
            </H4>
            
            <AnimatePresence>
              {eventsByDate.upcoming.map((event, index) => (
                <MotiView
                  key={`upcoming-${event.id}`}
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ 
                    type: 'timing', 
                    duration: 400, 
                    delay: index * 100 
                  }}
                >
                  <Card
                    marginHorizontal="$2"
                    marginBottom="$3"
                    borderRadius="$6"
                    overflow="hidden"
                    bordered={false}
                    backgroundColor="$background"
                    animation="bouncy"
                    pressStyle={{ scale: 0.98 }}
                    onPress={() => router.push(`/explore/events/${event.id}`)}
                    elevate
                  >
                    <Card.Header padded={false} bordered={false}>
                      <XStack width="100%">
                        <View width={100} height={100} borderRadius="$2" overflow="hidden">
                          <Image
                            source={{ 
                              uri: event.thumbnail?.url || 'https://placehold.co/600x400/png' 
                            }}
                            alt={event.title}
                            width={100}
                            height={100}
                            resizeMode="cover"
                          />
                        </View>
                        
                        <YStack flex={1} paddingHorizontal="$3" paddingVertical="$2" justifyContent="space-between">
                          {event.categories && event.categories.length > 0 && (
                            <CategoryBadge width="fit-content">
                              {event.categories[0]}
                            </CategoryBadge>
                          )}
                          
                          <Text fontWeight="600" fontSize="$4" numberOfLines={2} marginTop="$1">
                            {event.title}
                          </Text>
                          
                          <XStack alignItems="center" marginTop="$1">
                            <Calendar size={14} color="$gray600" />
                            <Text fontSize="$2" color="$gray700" marginLeft="$1">
                              {format(parseISO(event.start_date), 'E, MMM d')}
                            </Text>
                          </XStack>
                        </YStack>
                      </XStack>
                    </Card.Header>
                  </Card>
                </MotiView>
              ))}
            </AnimatePresence>
          </YStack>
        )}
      </YStack>
    );
  } else {
    // Compact view for the All tab - simple list of events
    return (
      <YStack gap="$2" marginBottom="$6" paddingHorizontal="$4">
        <XStack justifyContent="space-between" alignItems="center" paddingHorizontal="$2">
          <H4 fontWeight="700" color="$gray900">Events</H4>
          <Button
            chromeless
            size="$2"
            onPress={() => router.push('/explore/events')}
          >
            <XStack alignItems="center" gap="$1">
              <Text fontSize="$2" fontWeight="500" color="$blue9">See all</Text>
              <ArrowRight size={14} color="$blue9" />
            </XStack>
          </Button>
        </XStack>

        {/* Compact event list - max 3 events */}
        {events.slice(0, 3).map((event, index) => (
          <MotiView
            key={`compact-${event.id}`}
            from={{ opacity: 0, translateX: 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ 
              type: 'timing', 
              duration: 300, 
              delay: index * 70 
            }}
          >
            <Card
              marginHorizontal="$2"
              marginBottom="$2"
              borderRadius="$4"
              overflow="hidden"
              bordered={false}
              animation="quick"
              pressStyle={{ scale: 0.99 }}
              onPress={() => router.push(`/explore/events/${event.id}`)}
              backgroundColor="$background"
            >
              <XStack alignItems="center" paddingVertical="$2" paddingHorizontal="$3">
                {/* Calendar date chip */}
                <Stack
                  width={45}
                  height={45}
                  borderRadius="$3"
                  backgroundColor="$blue2"
                  borderWidth={1}
                  borderColor="$blue3"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="$3"
                >
                  <Text fontSize={10} color="$blue9" fontWeight="500">
                    {format(parseISO(event.start_date), 'MMM')}
                  </Text>
                  <Text fontSize={18} color="$blue9" fontWeight="700">
                    {format(parseISO(event.start_date), 'd')}
                  </Text>
                </Stack>
                
                <YStack flex={1}>
                  <Text fontWeight="600" fontSize="$3" numberOfLines={1} color="$gray900">
                    {event.title}
                  </Text>
                  
                  <XStack alignItems="center" marginTop="$1" gap="$2" flexWrap="wrap">
                    {event.venue && (
                      <XStack alignItems="center" gap="$1">
                        <MapPin size={12} color="$gray600" />
                        <Text fontSize={12} color="$gray600" numberOfLines={1}>
                          {event.venue.name}
                        </Text>
                      </XStack>
                    )}
                    
                    <XStack alignItems="center" gap="$1">
                      <Clock size={12} color="$gray600" />
                      <Text fontSize={12} color="$gray600">
                        {formatEventTime(event.start_date)}
                      </Text>
                    </XStack>
                  </XStack>
                </YStack>
              </XStack>
            </Card>
          </MotiView>
        ))}
      </YStack>
    );
  }
});

HomeEvents.displayName = "HomeEvents";