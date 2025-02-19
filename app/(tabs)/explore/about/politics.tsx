import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, ScrollView, XStack, H2, H3, H4, Text, Separator } from "tamagui";
import { Scale, BookOpen, Building2, Heart, GraduationCap, Globe } from '@tamagui/lucide-icons';

interface Policy {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

export default function PoliticsScreen() {
    const policies: Policy[] = [
        {
            id: 'education',
            title: 'Educational Quality',
            description: 'We advocate for high academic standards, modern teaching methods, and continuous improvement in educational delivery.',
            icon: <BookOpen size="$1" />
        },
        {
            id: 'welfare',
            title: 'Student Welfare',
            description: 'We work to ensure all students have access to necessary support services, mental health resources, and a safe learning environment.',
            icon: <Heart size="$1" />
        },
        {
            id: 'facilities',
            title: 'Campus Development',
            description: 'We push for improved study spaces, modern facilities, and sustainable campus solutions.',
            icon: <Building2 size="$1" />
        },
        {
            id: 'equality',
            title: 'Equality & Inclusion',
            description: 'We promote equal opportunities and inclusive practices for all students regardless of background.',
            icon: <Scale size="$1" />
        },
        {
            id: 'international',
            title: 'International Focus',
            description: 'We support internationalization and cross-cultural exchange in education.',
            icon: <Globe size="$1" />
        },
        {
            id: 'career',
            title: 'Career Preparation',
            description: 'We advocate for strong industry connections and practical career development opportunities.',
            icon: <GraduationCap size="$1" />
        }
    ];

    return (
        <ScrollView>
            <MyStack>
                <YStack gap="$4" padding="$4">
                    <H2>Our Politics</H2>
                    
                    <Card bordered padding="$4" animation="bouncy">
                        <YStack gap="$3">
                            <Paragraph>
                                BISO's political platform focuses on improving student life, educational quality, 
                                and student welfare at BI. We work actively with the school administration, 
                                faculty, and external stakeholders to advocate for student interests.
                            </Paragraph>
                        </YStack>
                    </Card>

                    <H3>Our Focus Areas</H3>
                    <YStack gap="$4">
                        {policies.map((policy) => (
                            <Card key={policy.id} bordered animation="bouncy">
                                <XStack padding="$4" gap="$4" alignItems="center">
                                    <YStack backgroundColor="$color5" padding="$3" borderRadius="$4">
                                        {policy.icon}
                                    </YStack>
                                    <YStack flex={1}>
                                        <H4>{policy.title}</H4>
                                        <Paragraph theme="alt2">{policy.description}</Paragraph>
                                    </YStack>
                                </XStack>
                            </Card>
                        ))}
                    </YStack>

                    <Separator marginVertical="$4" />

                    <H3>How We Work</H3>
                    <YStack gap="$4">
                        <Card bordered animation="bouncy">
                            <YStack padding="$4" gap="$2">
                                <H4>Student Parliament</H4>
                                <Paragraph>
                                    Our student parliament is the highest decision-making body where student 
                                    representatives discuss and vote on important matters affecting student life.
                                </Paragraph>
                            </YStack>
                        </Card>

                        <Card bordered animation="bouncy">
                            <YStack padding="$4" gap="$2">
                                <H4>School Cooperation</H4>
                                <Paragraph>
                                    We maintain regular dialogue with BI's administration and participate in 
                                    various committees to ensure student perspectives are considered in 
                                    decision-making processes.
                                </Paragraph>
                            </YStack>
                        </Card>

                        <Card bordered animation="bouncy">
                            <YStack padding="$4" gap="$2">
                                <H4>External Relations</H4>
                                <Paragraph>
                                    We collaborate with other student organizations, professional bodies, and 
                                    relevant stakeholders to strengthen our influence and create opportunities 
                                    for students.
                                </Paragraph>
                            </YStack>
                        </Card>

                        <Card bordered animation="bouncy">
                            <YStack padding="$4" gap="$2">
                                <H4>Student Engagement</H4>
                                <Paragraph>
                                    We actively seek student input through surveys, town halls, and open forums 
                                    to ensure our political platform reflects the needs and wishes of the 
                                    student body.
                                </Paragraph>
                            </YStack>
                        </Card>
                    </YStack>
                </YStack>
            </MyStack>
        </ScrollView>
    );
} 