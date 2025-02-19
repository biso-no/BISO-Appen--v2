import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, ScrollView, XStack, H2, H3, H4, Text, Button, Separator } from "tamagui";
import { FileText, Download, BookOpen, Users, Scale, Building2 } from '@tamagui/lucide-icons';

interface Document {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    fileUrl: string;
}

interface Section {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

export default function BylawsScreen() {
    const documents: Document[] = [
        {
            id: 'bylaws',
            title: 'BISO Bylaws',
            description: "The complete bylaws governing BISO's operations and structure.",
            icon: <FileText size="$1" />,
            fileUrl: '/documents/bylaws.pdf'
        },
        {
            id: 'statutes',
            title: 'Organizational Statutes',
            description: 'Detailed statutes defining our organizational framework.',
            icon: <BookOpen size="$1" />,
            fileUrl: '/documents/statutes.pdf'
        },
        {
            id: 'guidelines',
            title: 'Operational Guidelines',
            description: 'Guidelines for day-to-day operations and decision-making.',
            icon: <Scale size="$1" />,
            fileUrl: '/documents/guidelines.pdf'
        }
    ];

    const sections: Section[] = [
        {
            id: 'structure',
            title: 'Organizational Structure',
            description: 'Our organization is structured with a Student Parliament as the highest decision-making body, followed by the Executive Board and various committees.',
            icon: <Building2 size="$1" />
        },
        {
            id: 'governance',
            title: 'Democratic Governance',
            description: 'We operate on democratic principles with regular elections, transparent decision-making, and active student participation.',
            icon: <Users size="$1" />
        },
        {
            id: 'rules',
            title: 'Rules & Regulations',
            description: 'Clear rules govern our operations, ensuring accountability, fairness, and effective representation of student interests.',
            icon: <Scale size="$1" />
        }
    ];

    const handleDownload = (fileUrl: string) => {
        // TODO: Implement document download
        console.log('Downloading:', fileUrl);
    };

    return (
        <ScrollView>
            <MyStack>
                <YStack gap="$4" padding="$4">
                    <H2>Bylaws and Statutes</H2>
                    
                    <Card bordered padding="$4" animation="bouncy">
                        <YStack gap="$3">
                            <Paragraph>
                                BISO operates under a comprehensive set of bylaws and statutes that ensure 
                                transparent, democratic, and effective representation of student interests. 
                                These documents form the foundation of our organization.
                            </Paragraph>
                        </YStack>
                    </Card>

                    <H3>Key Documents</H3>
                    <YStack gap="$4">
                        {documents.map((doc) => (
                            <Card key={doc.id} bordered animation="bouncy">
                                <XStack padding="$4" gap="$4" alignItems="center">
                                    <YStack backgroundColor="$color5" padding="$3" borderRadius="$4">
                                        {doc.icon}
                                    </YStack>
                                    <YStack flex={1} gap="$2">
                                        <H4>{doc.title}</H4>
                                        <Paragraph theme="alt2">{doc.description}</Paragraph>
                                        <Button 
                                            marginTop="$2"
                                            icon={<Download size="$1" />}
                                            onPress={() => handleDownload(doc.fileUrl)}
                                        >
                                            Download PDF
                                        </Button>
                                    </YStack>
                                </XStack>
                            </Card>
                        ))}
                    </YStack>

                    <Separator marginVertical="$4" />

                    <H3>Key Principles</H3>
                    <YStack gap="$4">
                        {sections.map((section) => (
                            <Card key={section.id} bordered animation="bouncy">
                                <XStack padding="$4" gap="$4" alignItems="center">
                                    <YStack backgroundColor="$color5" padding="$3" borderRadius="$4">
                                        {section.icon}
                                    </YStack>
                                    <YStack flex={1}>
                                        <H4>{section.title}</H4>
                                        <Paragraph theme="alt2">{section.description}</Paragraph>
                                    </YStack>
                                </XStack>
                            </Card>
                        ))}
                    </YStack>

                    <Card bordered padding="$4" backgroundColor="$blue2" marginTop="$4">
                        <YStack gap="$2">
                            <H4>Document Updates</H4>
                            <Paragraph>
                                Our bylaws and statutes are regularly reviewed and updated through democratic 
                                processes in the Student Parliament. Any changes require a majority vote and 
                                are announced to all students.
                            </Paragraph>
                        </YStack>
                    </Card>
                </YStack>
            </MyStack>
        </ScrollView>
    );
} 