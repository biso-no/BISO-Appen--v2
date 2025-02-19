import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, ScrollView, XStack, H3, H4, Text } from "tamagui";
import { Info, FileText, Scale, Users, GraduationCap, AlertTriangle, Building2 } from '@tamagui/lucide-icons';
import { Link, useRouter } from 'expo-router';

interface AboutSection {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    link: string;
}

export default function AboutScreen() {
    const router = useRouter();
    const sections: AboutSection[] = [
        {
            id: 'what-is-biso',
            title: 'What is BISO?',
            description: 'Learn about our organization, mission, and vision for student life at BI.',
            icon: <Info size="$1" />,
            link: '/explore/about/what-is-biso'
        },
        {
            id: 'politics',
            title: 'Our Politics',
            description: 'Discover our stance on student welfare and educational policies.',
            icon: <Scale size="$1" />,
            link: '/explore/about/politics'
        },
        {
            id: 'bylaws',
            title: 'Bylaws and Statutes',
            description: 'Access our governing documents and organizational structure.',
            icon: <FileText size="$1" />,
            link: '/explore/about/bylaws'
        },
        {
            id: 'student-quality',
            title: 'Student Quality',
            description: 'Learn about our work to ensure high-quality education and student life.',
            icon: <GraduationCap size="$1" />,
            link: '/explore/about/student-quality'
        },
        {
            id: 'operations',
            title: 'Operations Unit',
            description: 'Meet our national management team and their responsibilities.',
            icon: <Building2 size="$1" />,
            link: '/explore/about/operations'
        },
        {
            id: 'alumni',
            title: 'Alumni Network',
            description: 'Connect with former BISO members and expand your network.',
            icon: <Users size="$1" />,
            link: '/explore/about/alumni'
        },
        {
            id: 'report-concern',
            title: 'Report a Concern',
            description: 'Confidentially report issues regarding volunteer positions or organizational matters.',
            icon: <AlertTriangle size="$1" />,
            link: '/explore/about/report-concern'
        }
    ];

    return (
        <ScrollView>
            <MyStack>
                <YStack gap="$4" padding="$4">
                    <H3>About BISO</H3>
                    <Paragraph theme="alt2">Your student union at BI Business School</Paragraph>
                    
                    <YStack gap="$4">
                        {sections.map((section) => (
                            <Card 
                                key={section.id}
                                bordered 
                                animation="bouncy"
                                pressStyle={{ scale: 0.98 }}
                                onPress={() => router.push(section.link as any)}
                            >
                                <XStack padding="$4" gap="$4" alignItems="center">
                                    <YStack 
                                        backgroundColor="$color5" 
                                        padding="$3" 
                                        borderRadius="$4"
                                    >
                                        {section.icon}
                                    </YStack>
                                    <YStack flex={1} gap="$2">
                                        <H4>{section.title}</H4>
                                        <Paragraph theme="alt2">{section.description}</Paragraph>
                                    </YStack>
                                </XStack>
                            </Card>
                        ))}
                    </YStack>
                </YStack>
            </MyStack>
        </ScrollView>
    );
} 