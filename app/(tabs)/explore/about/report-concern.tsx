import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, ScrollView, XStack, H2, H3, H4, Text, Button, Input, TextArea, Select, Separator } from "tamagui";
import { AlertTriangle, Shield, Lock, MessageSquare } from '@tamagui/lucide-icons';
import { useState } from 'react';

interface Category {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

export default function ReportConcernScreen() {
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [evidence, setEvidence] = useState('');
    const [contact, setContact] = useState('');

    const categories: Category[] = [
        {
            id: 'misconduct',
            title: 'Misconduct',
            description: 'Report serious misconduct by volunteers or representatives.',
            icon: <AlertTriangle size="$1" />
        },
        {
            id: 'ethics',
            title: 'Ethical Concerns',
            description: 'Report violations of our ethical guidelines or values.',
            icon: <Shield size="$1" />
        },
        {
            id: 'harassment',
            title: 'Harassment',
            description: 'Report harassment, discrimination, or bullying.',
            icon: <MessageSquare size="$1" />
        }
    ];

    const handleSubmit = () => {
        // TODO: Implement form submission
        console.log({ category, description, evidence, contact });
    };

    return (
        <ScrollView>
            <MyStack>
                <YStack gap="$4" padding="$4">
                    <H2>Report a Concern</H2>
                    
                    <Card bordered padding="$4" animation="bouncy">
                        <YStack gap="$3">
                            <XStack gap="$2" alignItems="center">
                                <Lock size="$1" />
                                <Text>Confidential Reporting System</Text>
                            </XStack>
                            <Paragraph>
                                This reporting system is designed for serious concerns about misconduct, 
                                ethical violations, or inappropriate behavior within BISO. All reports are 
                                treated confidentially and investigated thoroughly.
                            </Paragraph>
                        </YStack>
                    </Card>

                    <H3>Types of Concerns</H3>
                    <YStack gap="$4">
                        {categories.map((cat) => (
                            <Card key={cat.id} bordered animation="bouncy">
                                <XStack padding="$4" gap="$4" alignItems="center">
                                    <YStack backgroundColor="$color5" padding="$3" borderRadius="$4">
                                        {cat.icon}
                                    </YStack>
                                    <YStack flex={1}>
                                        <H4>{cat.title}</H4>
                                        <Paragraph theme="alt2">{cat.description}</Paragraph>
                                    </YStack>
                                </XStack>
                            </Card>
                        ))}
                    </YStack>

                    <Separator marginVertical="$4" />

                    <H3>Submit a Report</H3>
                    <Card bordered padding="$4" animation="bouncy">
                        <YStack gap="$4">
                            <YStack gap="$2">
                                <Text>Category</Text>
                                <Select 
                                    value={category}
                                    onValueChange={setCategory}
                                    items={categories.map(cat => ({
                                        name: cat.title,
                                        value: cat.id
                                    }))}
                                >
                                    <Select.Trigger>
                                        <Select.Value placeholder="Select category" />
                                    </Select.Trigger>
                                </Select>
                            </YStack>

                            <YStack gap="$2">
                                <Text>Description of Concern</Text>
                                <TextArea
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Please provide detailed information about your concern..."
                                    minHeight={120}
                                />
                            </YStack>

                            <YStack gap="$2">
                                <Text>Supporting Evidence (Optional)</Text>
                                <TextArea
                                    value={evidence}
                                    onChangeText={setEvidence}
                                    placeholder="Provide any relevant details, dates, or evidence..."
                                    minHeight={80}
                                />
                            </YStack>

                            <YStack gap="$2">
                                <Text>Contact Information (Optional)</Text>
                                <Input
                                    value={contact}
                                    onChangeText={setContact}
                                    placeholder="Email or phone number for follow-up..."
                                />
                                <Text theme="alt2" fontSize="$2">
                                    You can choose to remain anonymous. However, providing contact information 
                                    may help us investigate the matter more effectively.
                                </Text>
                            </YStack>

                            <Button 
                                themeInverse 
                                onPress={handleSubmit}
                                icon={<Lock size="$1" />}
                            >
                                Submit Report Confidentially
                            </Button>
                        </YStack>
                    </Card>

                    <Card bordered padding="$4" backgroundColor="$blue2">
                        <YStack gap="$2">
                            <H4>Important Note</H4>
                            <Paragraph>
                                For immediate safety concerns or emergencies, please contact campus security 
                                or relevant emergency services directly. This reporting system is not monitored 
                                24/7 and is intended for non-emergency situations.
                            </Paragraph>
                        </YStack>
                    </Card>
                </YStack>
            </MyStack>
        </ScrollView>
    );
} 