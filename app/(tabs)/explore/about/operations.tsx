import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, ScrollView, XStack, H2, H3, H4, Text, Separator } from "tamagui";
import { Building2, Users, Settings, Globe, ChartBar, Shield } from '@tamagui/lucide-icons';

interface Role {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

interface Responsibility {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

export default function OperationsScreen() {
    const roles: Role[] = [
        {
            id: 'president',
            title: 'President',
            description: 'Leads the Operations Unit and oversees national coordination of BISO activities.',
            icon: <Building2 size="$1" />
        },
        {
            id: 'coordination',
            title: 'Coordination Manager',
            description: 'Manages communication and collaboration between different BISO campuses.',
            icon: <Users size="$1" />
        },
        {
            id: 'operations',
            title: 'Operations Manager',
            description: 'Handles day-to-day operations and administrative tasks at the national level.',
            icon: <Settings size="$1" />
        }
    ];

    const responsibilities: Responsibility[] = [
        {
            id: 'national-strategy',
            title: 'National Strategy',
            description: 'Developing and implementing strategic initiatives across all BISO campuses.',
            icon: <Globe size="$1" />
        },
        {
            id: 'performance',
            title: 'Performance Monitoring',
            description: 'Tracking and evaluating the effectiveness of BISO programs and initiatives.',
            icon: <ChartBar size="$1" />
        },
        {
            id: 'compliance',
            title: 'Compliance & Standards',
            description: 'Ensuring consistent quality and compliance across all BISO operations.',
            icon: <Shield size="$1" />
        }
    ];

    return (
        <ScrollView>
            <MyStack>
                <YStack gap="$4" padding="$4">
                    <H2>Operations Unit</H2>
                    
                    <Card bordered padding="$4" animation="bouncy">
                        <YStack gap="$3">
                            <Paragraph>
                                The Operations Unit is responsible for the national management of BISO, 
                                ensuring coordination between campuses and maintaining high standards 
                                across all our activities.
                            </Paragraph>
                        </YStack>
                    </Card>

                    <H3>Key Roles</H3>
                    <YStack gap="$4">
                        {roles.map((role) => (
                            <Card key={role.id} bordered animation="bouncy">
                                <XStack padding="$4" gap="$4" alignItems="center">
                                    <YStack backgroundColor="$color5" padding="$3" borderRadius="$4">
                                        {role.icon}
                                    </YStack>
                                    <YStack flex={1}>
                                        <H4>{role.title}</H4>
                                        <Paragraph theme="alt2">{role.description}</Paragraph>
                                    </YStack>
                                </XStack>
                            </Card>
                        ))}
                    </YStack>

                    <Separator marginVertical="$4" />

                    <H3>Core Responsibilities</H3>
                    <YStack gap="$4">
                        {responsibilities.map((resp) => (
                            <Card key={resp.id} bordered animation="bouncy">
                                <XStack padding="$4" gap="$4" alignItems="center">
                                    <YStack backgroundColor="$color5" padding="$3" borderRadius="$4">
                                        {resp.icon}
                                    </YStack>
                                    <YStack flex={1}>
                                        <H4>{resp.title}</H4>
                                        <Paragraph theme="alt2">{resp.description}</Paragraph>
                                    </YStack>
                                </XStack>
                            </Card>
                        ))}
                    </YStack>

                    <H3>Our Work</H3>
                    <YStack gap="$4">
                        <Card bordered animation="bouncy">
                            <YStack padding="$4" gap="$2">
                                <H4>Campus Coordination</H4>
                                <Paragraph>
                                    We facilitate collaboration between BISO campuses, sharing best practices 
                                    and ensuring consistent quality of student services across locations.
                                </Paragraph>
                            </YStack>
                        </Card>

                        <Card bordered animation="bouncy">
                            <YStack padding="$4" gap="$2">
                                <H4>Resource Management</H4>
                                <Paragraph>
                                    We manage shared resources, coordinate national events, and provide 
                                    support to local BISO organizations when needed.
                                </Paragraph>
                            </YStack>
                        </Card>

                        <Card bordered animation="bouncy">
                            <YStack padding="$4" gap="$2">
                                <H4>Quality Assurance</H4>
                                <Paragraph>
                                    We develop and maintain quality standards for BISO operations, ensuring 
                                    high-quality service delivery across all campuses.
                                </Paragraph>
                            </YStack>
                        </Card>
                    </YStack>

                    <Card bordered padding="$4" backgroundColor="$blue2" marginTop="$4">
                        <YStack gap="$2">
                            <H4>Contact Us</H4>
                            <Paragraph>
                                For questions about national BISO operations or inter-campus coordination, 
                                please reach out to the Operations Unit. We're here to support all BISO 
                                activities across Norway.
                            </Paragraph>
                        </YStack>
                    </Card>
                </YStack>
            </MyStack>
        </ScrollView>
    );
} 