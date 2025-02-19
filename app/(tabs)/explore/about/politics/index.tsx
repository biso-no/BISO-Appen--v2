import React from 'react';
import { Image, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, ChevronRight, ArrowLeft } from '@tamagui/lucide-icons';
import {
  YStack,
  XStack,
  Text,
  Card,
  Button,
  AnimatePresence,
  Separator,
  ScrollView
} from 'tamagui';

interface CauseProps {
  title: string;
  description: string;
}

const Cause: React.FC<CauseProps> = ({ title, description }) => {
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
          <YStack space="$2">
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
        </Card.Header>
      </Card>
    </AnimatePresence>
  );
};

export default function PoliticsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const causes: CauseProps[] = [
    {
      title: "Student financial support must be increased",
      description: "We believe that current student financial support is too low for students to manage without a part-time job.",
    },
    {
      title: "Disbursement of student financial support",
      description: "BISO believes that student financial support should be disbursed over 12 months and regularly adjusted for inflation, so that students can keep up with market growth and maintain their purchasing power.",
    },
    {
      title: "Building student housing",
      description: "BISO believes that conditions should be facilitated for building student housing to reach a sufficient coverage rate at the national level. Therefore, around 2,500 student housing units should be built annually until a coverage rate of at least 25% is achieved.",
    },
    {
      title: "Professional education programs",
      description: "BISO believes that private educational institutions should have the right to offer professional education programs on equal terms as public educational institutions.",
    },
  ];

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
                <Shield size={32} color="$blue10" />
                <Text
                  fontSize={32}
                  fontWeight="700"
                  color="$color"
                >
                  Our Politics
                </Text>
              </XStack>

              <Text
                fontSize={16}
                color="$color"
                opacity={0.7}
                marginBottom="$4"
              >
                BISO is a politically independent organization whose main task is to work to preserve the academic, economic, social, psychosocial, and health interests of the organization's members.
              </Text>

              <Card
                elevate
                bordered
                size="$4"
                marginBottom="$4"
              >
                <Image
                  source={{ uri: "https://images.unsplash.com/photo-1577495508048-b635879837f1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80" }}
                  style={{
                    width: '100%',
                    height: 200,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                  }}
                  resizeMode="cover"
                />
                <Card.Header padded>
                  <Text
                    fontSize={24}
                    fontWeight="600"
                    color="$color"
                    marginBottom="$2"
                  >
                    Our Causes
                  </Text>
                  <Text
                    fontSize={16}
                    color="$color"
                    opacity={0.7}
                  >
                    Our most important issues that we are passionate about
                  </Text>
                </Card.Header>
              </Card>

              <YStack space="$2">
                {causes.map((cause, index) => (
                  <Cause key={index} {...cause} />
                ))}
              </YStack>

              <Separator marginVertical="$4" />

              <Text
                fontSize={24}
                fontWeight="600"
                color="$color"
                marginBottom="$2"
              >
                Political Target Document
              </Text>
              <Text
                fontSize={16}
                color="$color"
                opacity={0.7}
                marginBottom="$4"
              >
                Interested in geeking out about politics with us? Check out what BISO stands for and works towards.
              </Text>

              <Button
                icon={ChevronRight}
                iconAfter={ChevronRight}
                size="$4"
                theme="blue"
              >
                Download PDF
              </Button>
            </YStack>
          </AnimatePresence>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
} 