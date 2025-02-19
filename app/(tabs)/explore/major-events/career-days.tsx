import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, Image, ScrollView, XStack, H2, H3, H4, Text, Button, Separator } from "tamagui";
import { Calendar, Briefcase, MapPin, Clock, Star, ChevronRight, Building2, Presentation, MessageSquare } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';

interface Activity {
    id: string;
    title: string;
    description: string;
    time: string;
    location?: string;
}

interface Feature {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

export default function CareerDaysScreen() {
    const router = useRouter();

    const features: Feature[] = [
        {
            id: 'company-stands',
            title: 'Company Stands',
            description: 'Meet representatives from leading companies and learn about job opportunities.',
            icon: <Building2 size="$1" />
        },
        {
            id: 'presentations',
            title: 'Company Presentations',
            description: 'Attend insightful presentations about different industries and career paths.',
            icon: <Presentation size="$1" />
        },
        {
            id: 'networking',
            title: 'Networking Sessions',
            description: 'Connect with industry professionals and build your professional network.',
            icon: <MessageSquare size="$1" />
        }
    ];

    const schedule: Activity[] = [
        {
            id: 'opening',
            title: 'Opening Ceremony',
            description: 'Welcome speech and introduction to participating companies.',
            time: 'Day 1 - 09:00',
            location: 'BI Auditorium'
        },
        {
            id: 'morning-presentations',
            title: 'Morning Presentations',
            description: 'Company presentations from our gold partners.',
            time: 'Day 1 - 10:00',
            location: 'Various Rooms'
        },
        {
            id: 'company-fair',
            title: 'Company Fair',
            description: 'Visit company stands and engage with representatives.',
            time: 'Day 1 - 12:00',
            location: 'Main Hall'
        },
        {
            id: 'workshops',
            title: 'Career Workshops',
            description: 'Practical workshops on CV writing, interview skills, and more.',
            time: 'Day 2 - 10:00',
            location: 'Workshop Rooms'
        },
        {
            id: 'networking-event',
            title: 'Networking Event',
            description: 'Casual networking session with company representatives.',
            time: 'Day 2 - 15:00',
            location: 'Student Lounge'
        }
    ];

    return (
        <ScrollView>
            <MyStack>
                <Image
                    source={{ uri: 'https://placeholder.com/career-days-hero.jpg' }}
                    width="100%"
                    height={250}
                    resizeMode="cover"
                />
                
                <YStack gap="$4" padding="$4">
                    <H2>Career Days</H2>
                    <Card bordered padding="$4" animation="bouncy">
                        <YStack gap="$3">
                            <XStack gap="$2" alignItems="center">
                                <Calendar size="$1" />
                                <Text>Spring Semester</Text>
                            </XStack>
                            <Paragraph>
                                BISO Career Days is your gateway to the professional world. Connect with leading 
                                companies, attend inspiring presentations, and take the first step towards your 
                                dream career.
                            </Paragraph>
                        </YStack>
                    </Card>

                    <H3>Event Features</H3>
                    <YStack gap="$4">
                        {features.map((feature) => (
                            <Card key={feature.id} bordered animation="bouncy">
                                <XStack padding="$4" gap="$4" alignItems="center">
                                    <YStack backgroundColor="$color5" padding="$3" borderRadius="$4">
                                        {feature.icon}
                                    </YStack>
                                    <YStack flex={1}>
                                        <H4>{feature.title}</H4>
                                        <Paragraph theme="alt2">{feature.description}</Paragraph>
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
                                <Briefcase size="$1" />
                            </YStack>
                            <YStack flex={1}>
                                <H4>Start Your Career Journey</H4>
                                <Paragraph theme="alt2">Register for the next Career Days event!</Paragraph>
                            </YStack>
                            <ChevronRight size="$1" />
                        </XStack>
                    </Card>
                </YStack>
            </MyStack>
        </ScrollView>
    );
} 