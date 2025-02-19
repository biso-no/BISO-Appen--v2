import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, Image, ScrollView, XStack, H2, H3, H4, Text, Button, Separator } from "tamagui";
import { Calendar, Users, MapPin, Clock, Star, ChevronRight } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';

interface Activity {
    id: string;
    title: string;
    description: string;
    time: string;
    location?: string;
}

interface BuddyGroup {
    id: string;
    name: string;
    description: string;
}

export default function BuddyWeekScreen() {
    const router = useRouter();

    const activities: Activity[] = [
        {
            id: 'welcome-ceremony',
            title: 'Welcome Ceremony',
            description: 'Kick off your student journey with our grand opening ceremony. Meet your buddy group and student leaders.',
            time: 'Day 1 - 10:00',
            location: 'BI Auditorium'
        },
        {
            id: 'campus-tour',
            title: 'Campus Tour',
            description: 'Get to know your new home! Explore BI campus with your buddy group.',
            time: 'Day 1 - 13:00',
            location: 'BI Campus'
        },
        {
            id: 'social-games',
            title: 'Social Games & Activities',
            description: 'Fun team-building activities and games to break the ice with your new classmates.',
            time: 'Day 2 - 12:00',
            location: 'BI Campus'
        },
        {
            id: 'city-rally',
            title: 'City Rally',
            description: 'Explore the city with your buddy group through an exciting treasure hunt!',
            time: 'Day 3 - 14:00',
            location: 'City Center'
        },
        {
            id: 'closing-party',
            title: 'Closing Party',
            description: 'Celebrate your first week at BI with the legendary Buddy Week party!',
            time: 'Day 5 - 20:00',
            location: 'TBA'
        }
    ];

    const buddyGroups: BuddyGroup[] = [
        {
            id: 'norwegian',
            name: 'Norwegian Programs',
            description: 'For students in Norwegian bachelor programs'
        },
        {
            id: 'international',
            name: 'International Programs',
            description: 'For students in English bachelor programs'
        },
        {
            id: 'masters',
            name: 'Master Students',
            description: 'For all master program students'
        }
    ];

    return (
        <ScrollView>
            <MyStack>
                <Image
                    source={{ uri: 'https://placeholder.com/buddy-week-hero.jpg' }}
                    width="100%"
                    height={250}
                    resizeMode="cover"
                />
                
                <YStack gap="$4" padding="$4">
                    <H2>Buddy Week (Fadderullan)</H2>
                    <Card bordered padding="$4" animation="bouncy">
                        <YStack gap="$3">
                            <XStack gap="$2" alignItems="center">
                                <Calendar size="$1" />
                                <Text>Fall Semester Start</Text>
                            </XStack>
                            <Paragraph>
                                Welcome to BISO's biggest event of the year! Buddy Week is your perfect start to student life at BI. 
                                Make new friends, explore campus and the city, and create unforgettable memories with your fellow students.
                            </Paragraph>
                        </YStack>
                    </Card>

                    <H3>Program Highlights</H3>
                    <YStack gap="$4">
                        {activities.map((activity) => (
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

                    <Separator marginVertical="$4" />

                    <H3>Buddy Groups</H3>
                    <Paragraph theme="alt2">
                        You'll be assigned to a buddy group based on your study program. Your buddy leaders will guide you through the week and help you get settled at BI.
                    </Paragraph>
                    <YStack gap="$4" marginTop="$2">
                        {buddyGroups.map((group) => (
                            <Card key={group.id} bordered animation="bouncy">
                                <XStack padding="$4" gap="$4" alignItems="center">
                                    <YStack backgroundColor="$color5" padding="$3" borderRadius="$4">
                                        <Users size="$1" />
                                    </YStack>
                                    <YStack flex={1}>
                                        <H4>{group.name}</H4>
                                        <Paragraph theme="alt2">{group.description}</Paragraph>
                                    </YStack>
                                </XStack>
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
                                <H4>Ready to Join?</H4>
                                <Paragraph theme="alt2">Check out our upcoming Buddy Week events and register!</Paragraph>
                            </YStack>
                            <ChevronRight size="$1" />
                        </XStack>
                    </Card>
                </YStack>
            </MyStack>
        </ScrollView>
    );
} 