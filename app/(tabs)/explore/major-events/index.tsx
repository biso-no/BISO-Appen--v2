import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, Image, ScrollView, XStack, H3, H4, Text, Button } from "tamagui";
import { Calendar, Mountain, Briefcase } from '@tamagui/lucide-icons';
import { Link, useRouter } from 'expo-router';

interface MajorEvent {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    image: string;
    period: string;
    link: string;
}

export default function MajorEventsScreen() {
    const router = useRouter();
    const majorEvents: MajorEvent[] = [
        {
            id: 'buddy-week',
            title: 'Buddy Week (Fadderullan)',
            description: 'The ultimate introduction week for new students. Join us for unforgettable experiences, make new friends, and become part of the BISO family.',
            icon: <Calendar size="$1" />,
            image: 'https://placeholder.com/buddy-week.jpg',
            period: 'Fall Semester Start',
            link: '/explore/major-events/buddy-week'
        },
        {
            id: 'winter-games',
            title: 'Winter Games',
            description: 'Experience the thrill of our biggest winter event! A weekend filled with snow activities, parties, and unforgettable moments.',
            icon: <Mountain size="$1" />,
            image: 'https://placeholder.com/winter-games.jpg',
            period: 'January/February',
            link: '/explore/major-events/winter-games'
        },
        {
            id: 'career-days',
            title: 'Career Days',
            description: 'Connect with leading companies, attend presentations, and kickstart your career at our premier networking event.',
            icon: <Briefcase size="$1" />,
            image: 'https://placeholder.com/career-days.jpg',
            period: 'Spring Semester',
            link: '/explore/major-events/career-days'
        }
    ];

    return (
        <ScrollView>
            <MyStack>
                <YStack gap="$4" padding="$4">
                    <H3>Major Events</H3>
                    <Paragraph theme="alt2">Discover BISO's signature events that shape student life at BI</Paragraph>
                    
                    <YStack gap="$4">
                        {majorEvents.map((event) => (
                            <Card 
                                key={event.id}
                                bordered 
                                animation="bouncy" 
                                scale={0.98} 
                                pressStyle={{ scale: 0.96 }}
                                onPress={() => router.push(event.link as any)}
                            >
                                <YStack>
                                    <Image
                                        source={{ uri: event.image }}
                                        width="100%"
                                        height={150}
                                        borderTopLeftRadius="$4"
                                        borderTopRightRadius="$4"
                                    />
                                    <YStack padding="$4" gap="$2">
                                        <XStack gap="$2" alignItems="center">
                                            <YStack backgroundColor="$color5" padding="$2" borderRadius="$3">
                                                {event.icon}
                                            </YStack>
                                            <Text theme="alt2">{event.period}</Text>
                                        </XStack>
                                        <H4>{event.title}</H4>
                                        <Paragraph>{event.description}</Paragraph>
                                        <Button themeInverse marginTop="$2">Learn More</Button>
                                    </YStack>
                                </YStack>
                            </Card>
                        ))}
                    </YStack>
                </YStack>
            </MyStack>
        </ScrollView>
    );
} 