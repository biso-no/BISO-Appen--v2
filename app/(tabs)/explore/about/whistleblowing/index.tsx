import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, ArrowLeft, AlertTriangle, Mail, Info } from '@tamagui/lucide-icons';
import {
  YStack,
  XStack,
  Text,
  Card,
  Button,
  AnimatePresence,
  Separator,
  Input,
  Select,
  TextArea,
  Form,
  ScrollView
} from 'tamagui';

interface InfoSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const InfoSection: React.FC<InfoSectionProps> = ({ title, description, icon }) => {
  return (
    <AnimatePresence>
      <Card
        elevate
        size="$4"
        bordered
        animation="lazy"
        scale={1}
        hoverStyle={{ scale: 1.02 }}
        pressStyle={{ scale: 0.98 }}
        marginVertical="$2"
      >
        <Card.Header padded>
          <XStack space="$4" alignItems="center">
            {icon}
            <YStack flex={1}>
              <Text
                color="$color"
                fontSize={18}
                fontWeight="600"
              >
                {title}
              </Text>
              <Text
                color="$color"
                fontSize={14}
                opacity={0.7}
              >
                {description}
              </Text>
            </YStack>
          </XStack>
        </Card.Header>
      </Card>
    </AnimatePresence>
  );
};

export default function WhistleblowingScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [campus, setCampus] = useState('');
  const [description, setDescription] = useState('');

  const infoSections: InfoSectionProps[] = [
    {
      title: "What is whistleblowing?",
      description: "Whistleblowing is the action of reporting wrongdoing or misconduct in an organization. It is often done by employees, members, or others who have knowledge of the action.",
      icon: <Info size={24} color="$red10" />,
    },
    {
      title: "Anonymous Report",
      description: "You can choose to submit an anonymous report. However, this means we won't be able to contact you for follow-up information.",
      icon: <AlertTriangle size={24} color="$red10" />,
    },
  ];

  const handleSubmit = () => {
    // Handle form submission
    console.log({ email, campus, description });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <YStack space="$4" padding="$4">
          <Button
            icon={ArrowLeft}
            onPress={() => router.back()}
            backgroundColor="transparent"
            paddingHorizontal={0}
          >
            Back
          </Button>

          <AnimatePresence>
            <YStack
              enterStyle={{ y: 20, opacity: 0 }}
              exitStyle={{ y: 20, opacity: 0 }}
              animation="bouncy"
            >
              <XStack space="$2" alignItems="center" marginBottom="$2">
                <Shield size={32} color="$red10" />
                <Text
                  fontSize={32}
                  fontWeight="700"
                  color="$color"
                >
                  Whistleblowing
                </Text>
              </XStack>

              <Text
                fontSize={16}
                color="$color"
                opacity={0.7}
                marginBottom="$4"
              >
                Do you have a case that might be uncomfortable, or something you have experienced that requires follow-up?
              </Text>

              {infoSections.map((section, index) => (
                <InfoSection key={index} {...section} />
              ))}

              <Separator marginVertical="$4" />

              <Text
                fontSize={24}
                fontWeight="600"
                color="$color"
                marginBottom="$2"
              >
                Submit a Report
              </Text>

              <Form onSubmit={handleSubmit}>
                <YStack space="$4">
                  <YStack space="$2">
                    <Text
                      color="$color"
                      fontSize={16}
                      opacity={0.7}
                    >
                      Email (Optional)
                    </Text>
                    <Input
                      size="$4"
                      placeholder="your.email@example.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </YStack>

                  <YStack space="$2">
                    <Text
                      color="$color"
                      fontSize={16}
                      opacity={0.7}
                    >
                      Campus
                    </Text>
                    <Select
                      size="$4"
                      value={campus}
                      onValueChange={setCampus}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Select campus" />
                      </Select.Trigger>

                      <Select.Content>
                        <Select.Item index={0} value="bergen">
                          <Select.ItemText>Bergen</Select.ItemText>
                        </Select.Item>
                        <Select.Item index={1} value="oslo">
                          <Select.ItemText>Oslo</Select.ItemText>
                        </Select.Item>
                        <Select.Item index={2} value="stavanger">
                          <Select.ItemText>Stavanger</Select.ItemText>
                        </Select.Item>
                        <Select.Item index={3} value="trondheim">
                          <Select.ItemText>Trondheim</Select.ItemText>
                        </Select.Item>
                        <Select.Item index={4} value="national">
                          <Select.ItemText>National</Select.ItemText>
                        </Select.Item>
                      </Select.Content>
                    </Select>
                  </YStack>

                  <YStack space="$2">
                    <Text
                      color="$color"
                      fontSize={16}
                      opacity={0.7}
                    >
                      Case Description
                    </Text>
                    <TextArea
                      size="$4"
                      placeholder="Describe your case in detail..."
                      value={description}
                      onChangeText={setDescription}
                      numberOfLines={6}
                    />
                  </YStack>

                  <Button
                    size="$4"
                    theme="red"
                    icon={Mail}
                  >
                    Submit Report
                  </Button>
                </YStack>
              </Form>

              <Separator marginVertical="$4" />

              <Text
                fontSize={24}
                fontWeight="600"
                color="$color"
                marginBottom="$2"
              >
                Contact Information
              </Text>
              <Text
                fontSize={16}
                color="$color"
                opacity={0.7}
                marginBottom="$4"
              >
                Contact one of the people below if you have general questions about whistleblowing in BISO:
              </Text>

              <YStack space="$2">
                <Text color="$color">
                  • Pernille Wold Kaspersen, Board Chair – board@biso.no
                </Text>
                <Text color="$color">
                  • Tanweer Akram, HR-Manager – tanweer@biso.no
                </Text>
                <Text color="$color">
                  • Vetle Oppedal, General Manager – manager@biso.no
                </Text>
              </YStack>
            </YStack>
          </AnimatePresence>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
} 