import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, ScrollView, XStack, H2, H3, H4, Text, Button, Separator } from "tamagui";
import { Users, Network, Briefcase, Calendar, Star, MessageSquare } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';

interface Benefit {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

interface Opportunity {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

export default function AlumniScreen() {
    const router = useRouter();

    const benefits: Benefit[] = [
        {
            id: 'networking',
            title: 'Professional Network',
            description: 'Connect with fellow BISO alumni working across various industries.',
            icon: <Network size="$1" />
        },
        {
            id: 'events',
            title: 'Exclusive Events',
            description: 'Access to alumni-only events, reunions, and professional gatherings.',
            icon: <Calendar size="$1" />
        },
        {
            id: 'mentoring',
            title: 'Mentoring Opportunities',
            description: 'Share your experience by mentoring current BISO students.',
            icon: <Users size="$1" />
        },
        {
            id: 'career',
            title: 'Career Resources',
            description: 'Access to job postings and career development resources.',
            icon: <Briefcase size="$1" />
        }
    ];

    const opportunities: Opportunity[] = [
        {
            id: 'speaking',
            title: 'Guest Speaking',
            description: 'Share your professional journey and insights with current students.',
            icon: <MessageSquare size="$1" />
        },
        {
            id: 'involvement',
            title: 'Alumni Engagement',
            description: 'Participate in BISO events and initiatives as an alumni representative.',
            icon: <Star size="$1" />
        }
    ];

    return (
        <ScrollView>
            <MyStack>
                <YStack gap="$4" padding="$4">
                    <H2>Alumni Network</H2>
                    
                    <Card bordered padding="$4" animation="bouncy">
                        <YStack gap="$3">
                            <Paragraph>
                                Stay connected with BISO after graduation! Our alumni network helps you maintain 
                                connections, access valuable resources, and give back to the BISO community.
                            </Paragraph>
                        </YStack>
                    </Card>

                    <H3>Alumni Benefits</H3>
                    <YStack gap="$4">
                        {benefits.map((benefit) => (
                            <Card key={benefit.id} bordered animation="bouncy">
                                <XStack padding="$4" gap="$4" alignItems="center">
                                    <YStack backgroundColor="$color5" padding="$3" borderRadius="$4">
                                        {benefit.icon}
                                    </YStack>
                                    <YStack flex={1}>
                                        <H4>{benefit.title}</H4>
                                        <Paragraph theme="alt2">{benefit.description}</Paragraph>
                                    </YStack>
                                </XStack>
                            </Card>
                        ))}
                    </YStack>

                    <Separator marginVertical="$4" />

                    <H3>Get Involved</H3>
                    <YStack gap="$4">
                        {opportunities.map((opp) => (
                            <Card key={opp.id} bordered animation="bouncy">
                                <XStack padding="$4" gap="$4" alignItems="center">
                                    <YStack backgroundColor="$color5" padding="$3" borderRadius="$4">
                                        {opp.icon}
                                    </YStack>
                                    <YStack flex={1}>
                                        <H4>{opp.title}</H4>
                                        <Paragraph theme="alt2">{opp.description}</Paragraph>
                                    </YStack>
                                </XStack>
                            </Card>
                        ))}
                    </YStack>

                    <H3>Alumni Stories</H3>
                    <YStack gap="$4">
                        <Card bordered animation="bouncy">
                            <YStack padding="$4" gap="$2">
                                <H4>Success Stories</H4>
                                <Paragraph>
                                    Read inspiring stories from BISO alumni who have gone on to achieve great 
                                    things in their careers and continue to support the student community.
                                </Paragraph>
                            </YStack>
                        </Card>

                        <Card bordered animation="bouncy">
                            <YStack padding="$4" gap="$2">
                                <H4>Alumni Impact</H4>
                                <Paragraph>
                                    Discover how our alumni network contributes to BISO's growth and helps 
                                    create opportunities for current students.
                                </Paragraph>
                            </YStack>
                        </Card>
                    </YStack>

                    <Card 
                        bordered 
                        padding="$4" 
                        backgroundColor="$blue2" 
                        marginTop="$4"
                        pressStyle={{ scale: 0.98 }}
                        onPress={() => router.push('/explore/events' as any)}
                    >
                        <YStack gap="$2">
                            <H4>Join the Network</H4>
                            <Paragraph>
                                Are you a BISO alumnus? Join our network to stay connected, access exclusive 
                                benefits, and contribute to the BISO community.
                            </Paragraph>
                            <Button 
                                themeInverse 
                                marginTop="$2"
                                icon={<Users size="$1" />}
                            >
                                Register as Alumni
                            </Button>
                        </YStack>
                    </Card>
                </YStack>
            </MyStack>
        </ScrollView>
    );
} 