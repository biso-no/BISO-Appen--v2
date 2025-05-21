import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { MotiScrollView, MotiView } from 'moti';
import { YStack, XStack, H3, H5, Button, Text, View, Image, ScrollView, useTheme, Spinner, Stack, useWindowDimensions } from "tamagui";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, MapPin, Globe, User } from "@tamagui/lucide-icons";
import RenderHTML from "react-native-render-html";
import { useTranslation } from "react-i18next";
import i18next from "@/i18n";

// Event interfaces matching our new structure
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

export default function EventDetailsScreen() {
    const params = useLocalSearchParams();
    const { id } = params;
    const router = useRouter();
    const theme = useTheme();
    const textColor = theme?.color?.val;
    // Use safe color values with fallbacks
    const blueColor = theme?.blue10?.val || '#0077CC';
    const { t } = useTranslation();
    const { height: windowHeight, width } = useWindowDimensions();

    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Format date and time in a readable way
    const formatEventTime = (dateString: string) => {
        if (!dateString) return "";
        const date = parseISO(dateString);
        return format(date, t('h-mm-a'));
    };

    useEffect(() => {
        const fetchEventDetails = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                // Fetch the event from the API using the ID
                const response = await axios.get(`https://biso.no/wp-json/biso/v1/events/${id}`);
                console.log("Fetched event details:", response.data);
                setEvent(response.data);
            } catch (err) {
                console.error("Failed to fetch event details:", err);
                setError(t('could-not-load-event-details-please-try-again-later'));
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchEventDetails();
        } else {
            setError(t('no-event-id-provided'));
            setIsLoading(false);
        }
    }, [id]);

    const htmlStyles = {
        body: { 
            fontSize: 16, 
            lineHeight: 24, 
            color: textColor,
        },
        p: { 
            marginVertical: 10, 
        },
        a: { 
            color: blueColor,
            textDecorationLine: 'underline' as const,
        },
        li: { 
            marginBottom: 8, 
        },
    };
    
    // Title specific styles with improved line height and padding
    const titleStyles = { 
        body: { 
          fontSize: 26, 
          lineHeight: 34,  // Increased line height
          color: textColor,
          paddingTop: 4,
          paddingBottom: 4
        },
        h1: {
          marginBottom: 8,
          marginTop: 8
        },
        h2: {
          marginBottom: 8,
          marginTop: 8
        },
        p: {
          marginBottom: 0,
          marginTop: 0
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <View flex={1} justifyContent="center" alignItems="center">
                <Spinner size="large" color="$blue10" />
                <Text marginTop="$4" color="$gray700">{t('loading-event-details')}</Text>
            </View>
        );
    }

    // Error state
    if (error || !event) {
        return (
            <View flex={1} justifyContent="center" alignItems="center" padding="$4">
                <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'timing', duration: 300 }}
                >
                    <YStack alignItems="center" gap="$4">
                        <Text fontSize="$6" fontWeight="bold" color="$gray700">{t('event-not-found')}</Text>
                        <Text textAlign="center" color="$gray600">
                            {error || t('we-couldnt-find-the-event-youre-looking-for')}
                        </Text>
                        <Button
                            backgroundColor="$blue9"
                            color="white"
                            onPress={() => router.back()}
                        >
                            {t('go-back')}
                        </Button>
                    </YStack>
                </MotiView> 
            </View>
        );
    }
    
    // Handle external URL opening
    const handleOpenUrl = (url: string) => {
        if (typeof url === 'string') {
            // You might want to use Linking from react-native here
            // or a more sophisticated approach for handling external URLs
            console.log('Opening URL:', url);
            // Using type assertion to satisfy TypeScript
            router.push(url as any);
        }
    };
    
    return (
        <MotiScrollView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            contentContainerStyle={{
                minHeight: windowHeight,
                paddingBottom: 100
            }}
            // Add some top padding to prevent content from being under status bar
            contentInsetAdjustmentBehavior="automatic"
        >
            {/* Hero Image */}
            {event.thumbnail?.url && (
                <Image
                    source={{ uri: event.thumbnail.url }}
                    alt={event.title}
                    height={250}
                    width="100%"
                    objectFit="cover"
                />
            )}

            {/* Event Header with improved padding */}
            <YStack padding="$4" gap="$3" paddingTop="$5">
                {/* Title with improved rendering */}
                <View marginBottom="$2">
                    <RenderHTML 
                        source={{ html: event.title }} 
                        contentWidth={width - 40}
                        tagsStyles={titleStyles}
                        baseStyle={{ margin: 0, padding: 0 }}
                    />
                </View>
                
                {/* Event Time and Location Details */}
                <YStack gap="$3" marginVertical="$2">
                    <XStack alignItems="center" gap="$2">
                        <Calendar size={18} color={blueColor} />
                        <Text fontSize="$4" color="$gray900">
                            {format(parseISO(event.start_date), t('eeee-mmmm-d-yyyy'))}
                        </Text>
                    </XStack>
                    
                    <XStack alignItems="center" gap="$2">
                        <Clock size={18} color={blueColor} />
                        <Text fontSize="$4" color="$gray900">
                            {event.all_day 
                                ? t('all-day') 
                                : `${formatEventTime(event.start_date)} - ${formatEventTime(event.end_date)}`
                            }
                        </Text>
                    </XStack>
                    
                    {event.venue && (event.venue.name || event.venue.address) && (
                        <XStack alignItems="center" gap="$2">
                            <MapPin size={18} color={blueColor} />
                            <Text fontSize="$4" color="$gray900">
                                {event.venue.name}
                                {event.venue.address && `, ${event.venue.address}`}
                            </Text>
                        </XStack>
                    )}
                    
                    {event.organizer && event.organizer.name && (
                        <XStack alignItems="center" gap="$2">
                            <User size={18} color={blueColor} />
                            <Text fontSize="$4" color="$gray900">
                                {event.organizer.name}
                            </Text>
                        </XStack>
                    )}
                </YStack>

                {/* Cost badge if applicable */}
                {event.cost && (
                    <View>
                        <Stack
                            backgroundColor={event.cost === t('free') ? "$green2" : "$blue2"}
                            paddingHorizontal="$3"
                            paddingVertical="$1"
                            borderRadius="$4"
                            alignSelf="flex-start"
                        >
                            <Text
                                color={event.cost === t('free-0') ? "$green9" : "$blue9"}
                                fontWeight="600"
                            >
                                {event.cost === t('free-1') ? t('free-2') : event.cost}
                            </Text>
                        </Stack>
                    </View>
                )}

                {/* Category tags */}
                {event.categories && event.categories.length > 0 && (
                    <XStack flexWrap="wrap" gap="$2" marginVertical="$2">
                        {event.categories.map((category) => (
                            <Stack
                                key={category}
                                backgroundColor="$gray100"
                                paddingHorizontal="$2"
                                paddingVertical="$1"
                                borderRadius="$2"
                            >
                                <Text fontSize="$2" color="$gray700">
                                    {category}
                                </Text>
                            </Stack>
                        ))}
                    </XStack>
                )}
            </YStack>
            
            {/* Description Section */}
            <YStack padding="$4" paddingTop={0} gap="$3">
                <H5>{t('about-this-event')}</H5>
                
                {event.description ? (
                    <RenderHTML
                        source={{ html: event.description }}
                        contentWidth={width - 40}
                        tagsStyles={htmlStyles}
                    />
                ) : (
                    <Text color="$gray700">{t('no-description-available')}</Text>
                )}
                
                {/* Website link if available */}
                {event.website && (
                    <Button
                        marginTop="$4"
                        backgroundColor="$blue9"
                        color="white"
                        icon={<Globe size={16} color="white" />}
                        onPress={() => handleOpenUrl(event.website)}
                    >
                        {t('view-event-website')}
                    </Button>
                )}
            </YStack>
        </MotiScrollView>
    );
}