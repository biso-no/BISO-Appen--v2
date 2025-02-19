import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, Image, ScrollView, XStack, H2, H3, H4, Text, Separator } from "tamagui";
import { Heart, Target, Users, Sparkles } from '@tamagui/lucide-icons';

interface Value {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

export default function WhatIsBisoScreen() {
    const values: Value[] = [
        {
            id: 'community',
            title: 'Student Community',
            description: 'We create a vibrant and inclusive community where every student can thrive and belong.',
            icon: <Users size="$1" />
        },
        {
            id: 'advocacy',
            title: 'Student Advocacy',
            description: 'We represent student interests and work to enhance the quality of education and student life.',
            icon: <Heart size="$1" />
        },
        {
            id: 'opportunities',
            title: 'Growth Opportunities',
            description: 'We provide platforms for personal development, leadership, and professional growth.',
            icon: <Target size="$1" />
        },
        {
            id: 'experiences',
            title: 'Memorable Experiences',
            description: 'We create unforgettable moments through events, activities, and social gatherings.',
            icon: <Sparkles size="$1" />
        }
    ];

    return (
        <ScrollView>
            <MyStack>
                <Image
                    source={{ uri: 'https://placeholder.com/biso-hero.jpg' }}
                    width="100%"
                    height={200}
                    resizeMode="cover"
                />
                
                <YStack gap="$4" padding="$4">
                    <H2>What is BISO?</H2>
                    
                    <Card bordered padding="$4" animation="bouncy">
                        <YStack gap="$3">
                            <Paragraph>
                                BISO (Business School Student Union) is the official student organization at BI Norwegian Business School. 
                                We are run by students, for students, working to enhance your academic journey and student life experience.
                            </Paragraph>
                        </YStack>
                    </Card>

                    <H3>Our Mission</H3>
                    <Card bordered padding="$4" animation="bouncy">
                        <Paragraph>
                            To create the best possible student life by representing student interests, 
                            fostering a strong community, and providing opportunities for personal and 
                            professional growth.
                        </Paragraph>
                    </Card>

                    <H3>Our Values</H3>
                    <YStack gap="$4">
                        {values.map((value) => (
                            <Card key={value.id} bordered animation="bouncy">
                                <XStack padding="$4" gap="$4" alignItems="center">
                                    <YStack backgroundColor="$color5" padding="$3" borderRadius="$4">
                                        {value.icon}
                                    </YStack>
                                    <YStack flex={1}>
                                        <H4>{value.title}</H4>
                                        <Paragraph theme="alt2">{value.description}</Paragraph>
                                    </YStack>
                                </XStack>
                            </Card>
                        ))}
                    </YStack>

                    <Separator marginVertical="$4" />

                    <H3>What We Do</H3>
                    <YStack gap="$4">
                        <Card bordered animation="bouncy">
                            <YStack padding="$4" gap="$2">
                                <H4>Student Representation</H4>
                                <Paragraph>
                                    We represent student interests in various committees and decision-making bodies at BI, 
                                    ensuring the student voice is heard in matters affecting education and student life.
                                </Paragraph>
                            </YStack>
                        </Card>

                        <Card bordered animation="bouncy">
                            <YStack padding="$4" gap="$2">
                                <H4>Events & Activities</H4>
                                <Paragraph>
                                    From orientation weeks to career fairs, social gatherings to academic seminars, 
                                    we organize a wide range of events that enrich your student experience.
                                </Paragraph>
                            </YStack>
                        </Card>

                        <Card bordered animation="bouncy">
                            <YStack padding="$4" gap="$2">
                                <H4>Student Services</H4>
                                <Paragraph>
                                    We provide various services including academic support, social welfare initiatives, 
                                    and membership benefits to enhance your time at BI.
                                </Paragraph>
                            </YStack>
                        </Card>

                        <Card bordered animation="bouncy">
                            <YStack padding="$4" gap="$2">
                                <H4>Student Organizations</H4>
                                <Paragraph>
                                    We support and coordinate with numerous student clubs and organizations, 
                                    creating opportunities for engagement in various interests and activities.
                                </Paragraph>
                            </YStack>
                        </Card>
                    </YStack>
                </YStack>
            </MyStack>
        </ScrollView>
    );
} 