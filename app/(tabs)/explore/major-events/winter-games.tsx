import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, Image, ScrollView, XStack, H2, H3, H4, Text, Button, Separator } from "tamagui";
import { Calendar, Mountain, MapPin, Clock, Star, ChevronRight, Snowflake, Trophy } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';

interface Activity {
    id: string;
    title: string;
    description: string;
    time: string;
    location?: string;
}

interface Highlight {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

export default function WinterGamesScreen() {
    const router = useRouter();

    const highlights: Highlight[] = [
        {
            id: 'snow-activities',
            title: 'Snow Activities',
            description: 'From skiing to snowboarding, enjoy a variety of winter sports suitable for all skill levels.',
            icon: <Mountain size="$1" />
        },
        {
            id: 'competitions',
            title: 'Fun Competitions',
            description: 'Participate in friendly competitions and win amazing prizes!',
            icon: <Trophy size="$1" />
        },
        {
            id: 'after-ski',
            title: 'Legendary After-Ski',
            description: 'Experience the famous Norwegian after-ski tradition with your fellow students.',
            icon: <Snowflake size="$1" />
        }
    ];

    const schedule: Activity[] = [
        {
            id: 'day1-morning',
            title: 'Arrival & Check-in',
            description: 'Arrive at the resort, get your equipment, and settle in.',
            time: 'Day 1 - 10:00',
            location: 'Resort Reception'
        },
        {
            id: 'day1-afternoon',
            title: 'Beginner Lessons',
            description: 'Optional ski/snowboard lessons for beginners.',
            time: 'Day 1 - 13:00',
            location: 'Training Slopes'
        },
        {
            id: 'day1-evening',
            title: 'Welcome Party',
            description: 'Kick off the weekend with our welcome party!',
            time: 'Day 1 - 20:00',
            location: 'Main Lodge'
        },
        {
            id: 'day2-morning',
            title: 'Group Activities',
            description: 'Fun group activities and competitions on the slopes.',
            time: 'Day 2 - 10:00',
            location: 'Main Slopes'
        },
        {
            id: 'day2-evening',
            title: 'Gala Dinner & Party',
            description: 'Dress up for our grand dinner and after-party!',
            time: 'Day 2 - 19:00',
            location: 'Resort Restaurant'
        }
    ];

    return (
        <ScrollView>
            <MyStack>
                <Image
                    source={{ uri: 'https://placeholder.com/winter-games-hero.jpg' }}
                    width="100%"
                    height={250}
                    resizeMode="cover"
                />
                
                <YStack gap="$4" padding="$4">
                    <H2>Winter Games</H2>
                    <Card bordered padding="$4" animation="bouncy">
                        <YStack gap="$3">
                            <XStack gap="$2" alignItems="center">
                                <Calendar size="$1" />
                                <Text>January/February</Text>
                            </XStack>
                            <Paragraph>
                                Join us for an unforgettable weekend of winter sports, parties, and fun! 
                                The BISO Winter Games is our signature winter event where students come together 
                                to enjoy the best of Norwegian winter.
                            </Paragraph>
                        </YStack>
                    </Card>

                    <H3>Event Highlights</H3>
                    <YStack gap="$4">
                        {highlights.map((highlight) => (
                            <Card key={highlight.id} bordered animation="bouncy">
                                <XStack padding="$4" gap="$4" alignItems="center">
                                    <YStack backgroundColor="$color5" padding="$3" borderRadius="$4">
                                        {highlight.icon}
                                    </YStack>
                                    <YStack flex={1}>
                                        <H4>{highlight.title}</H4>
                                        <Paragraph theme="alt2">{highlight.description}</Paragraph>
                                    </YStack>
                                </XStack>
                            </Card>
                        ))}
                    </YStack>

                    <Separator marginVertical="$4" />

                    <H3>Event Schedule</H3>
                    <YStack gap="$4">
                        {schedule.map((activity) => (
                            <Card key={activity.id} bordered animation="bouncy">
                                <YStack padding="$4" gap="$2">
                                    <H4>{activity.title}</H4>
                                    <Paragraph>{activity.description}</Paragraph>
                                    <XStack gap="$4" marginTop="$2">
                                        <XStack gap="$2" alignItems="center">
                                            <Clock size="$1" />
                                            <Text theme="alt2">{activity.time}</Text>
                                        </XStack>
                                        {activity.location && (
                                            <XStack gap="$2" alignItems="center">
                                                <MapPin size="$1" />
                                                <Text theme="alt2">{activity.location}</Text>
                                            </XStack>
                                        )}
                                    </XStack>
                                </YStack>
                            </Card>
                        ))}
                    </YStack>

                    <Card 
                        bordered 
                        marginTop="$4" 
                        backgroundColor="$blue2"
                        pressStyle={{ scale: 0.98 }}
                        onPress={() => router.push('/explore/events' as any)}
                    >
                        <XStack padding="$4" gap="$4" alignItems="center">
                            <YStack backgroundColor="$blue4" padding="$3" borderRadius="$4">
                                <Star size="$1" />
                            </YStack>
                            <YStack flex={1}>
                                <H4>Ready for Adventure?</H4>
                                <Paragraph theme="alt2">Check upcoming Winter Games dates and secure your spot!</Paragraph>
                            </YStack>
                            <ChevronRight size="$1" />
                        </XStack>
                    </Card>
                </YStack>
            </MyStack>
        </ScrollView>
    );
} 