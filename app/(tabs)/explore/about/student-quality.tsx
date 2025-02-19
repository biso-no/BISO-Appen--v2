import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, ScrollView, XStack, H2, H3, H4, Text, Separator } from "tamagui";
import { GraduationCap, BookOpen, MessageSquare, Users, Star, Target } from '@tamagui/lucide-icons';

interface Area {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

export default function StudentQualityScreen() {
    const areas: Area[] = [
        {
            id: 'academic-quality',
            title: 'Academic Quality',
            description: 'We work to ensure high standards in teaching, course content, and examination methods.',
            icon: <GraduationCap size="$1" />
        },
        {
            id: 'student-feedback',
            title: 'Student Feedback',
            description: 'We facilitate and process student feedback on courses, teaching methods, and academic resources.',
            icon: <MessageSquare size="$1" />
        },
        {
            id: 'resources',
            title: 'Learning Resources',
            description: 'We advocate for better study materials, digital tools, and library resources.',
            icon: <BookOpen size="$1" />
        },
        {
            id: 'representation',
            title: 'Academic Representation',
            description: 'We represent students in academic committees and decision-making bodies.',
            icon: <Users size="$1" />
        },
        {
            id: 'innovation',
            title: 'Educational Innovation',
            description: 'We promote innovative teaching methods and digital learning solutions.',
            icon: <Star size="$1" />
        },
        {
            id: 'development',
            title: 'Continuous Improvement',
            description: 'We work on long-term strategies to enhance the quality of education at BI.',
            icon: <Target size="$1" />
        }
    ];

    return (
        <ScrollView>
            <MyStack>
                <YStack gap="$4" padding="$4">
                    <H2>Student Quality</H2>
                    
                    <Card bordered padding="$4" animation="bouncy">
                        <YStack gap="$3">
                            <Paragraph>
                                BISO is committed to ensuring and improving the quality of education at BI. 
                                We work closely with faculty and administration to maintain high academic 
                                standards and enhance the learning experience for all students.
                            </Paragraph>
                        </YStack>
                    </Card>

                    <H3>Our Focus Areas</H3>
                    <YStack gap="$4">
                        {areas.map((area) => (
                            <Card key={area.id} bordered animation="bouncy">
                                <XStack padding="$4" gap="$4" alignItems="center">
                                    <YStack backgroundColor="$color5" padding="$3" borderRadius="$4">
                                        {area.icon}
                                    </YStack>
                                    <YStack flex={1}>
                                        <H4>{area.title}</H4>
                                        <Paragraph theme="alt2">{area.description}</Paragraph>
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
                                <H4>Course Evaluations</H4>
                                <Paragraph>
                                    We coordinate with BI to ensure effective course evaluation systems and 
                                    follow up on student feedback to improve course quality.
                                </Paragraph>
                            </YStack>
                        </Card>

                        <Card bordered animation="bouncy">
                            <YStack padding="$4" gap="$2">
                                <H4>Quality Committees</H4>
                                <Paragraph>
                                    Our representatives participate in various quality assurance committees, 
                                    bringing student perspectives to academic discussions.
                                </Paragraph>
                            </YStack>
                        </Card>

                        <Card bordered animation="bouncy">
                            <YStack padding="$4" gap="$2">
                                <H4>Student Surveys</H4>
                                <Paragraph>
                                    We conduct regular surveys to gather student feedback on academic quality, 
                                    learning environment, and educational resources.
                                </Paragraph>
                            </YStack>
                        </Card>

                        <Card bordered animation="bouncy">
                            <YStack padding="$4" gap="$2">
                                <H4>Academic Support</H4>
                                <Paragraph>
                                    We organize academic support initiatives like study groups, workshops, 
                                    and peer mentoring programs to enhance learning outcomes.
                                </Paragraph>
                            </YStack>
                        </Card>
                    </YStack>

                    <Card bordered padding="$4" backgroundColor="$blue2" marginTop="$4">
                        <YStack gap="$2">
                            <H4>Get Involved</H4>
                            <Paragraph>
                                We welcome student input on academic quality matters. If you have suggestions 
                                or concerns about your educational experience at BI, please reach out to our 
                                Academic Affairs team.
                            </Paragraph>
                        </YStack>
                    </Card>
                </YStack>
            </MyStack>
        </ScrollView>
    );
} 