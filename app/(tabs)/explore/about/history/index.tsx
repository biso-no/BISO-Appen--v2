import React from 'react';
import { Image, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History, ArrowLeft, Circle } from '@tamagui/lucide-icons';
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

interface TimelineEventProps {
  year: string;
  title: string;
  description: string;
  isFirst?: boolean;
  isLast?: boolean;
}

const TimelineEvent: React.FC<TimelineEventProps> = ({
  year,
  title,
  description,
  isFirst,
  isLast,
}) => {
  return (
    <XStack>
      <YStack
        width={2}
        backgroundColor="$blue10"
        alignSelf="stretch"
        marginLeft={30}
        marginVertical="$2"
        opacity={0.3}
        display={isLast ? 'none' : 'flex'}
      />
      <XStack space="$4" flex={1}>
        <YStack alignItems="center" position="relative" top={-4}>
          <Circle size={16} color="$blue10" fill="$blue10" />
          <Text
            color="$color"
            fontSize={14}
            fontWeight="600"
            marginTop="$2"
          >
            {year}
          </Text>
        </YStack>
        <Card
          elevate
          size="$4"
          bordered
          animation="lazy"
          scale={1}
          hoverStyle={{ scale: 1.02 }}
          pressStyle={{ scale: 0.98 }}
          marginBottom="$4"
          flex={1}
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
      </XStack>
    </XStack>
  );
};

export default function HistoryScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const timelineEvents: TimelineEventProps[] = [
    {
      year: "2019",
      title: "SBIO and BIS become BISO",
      description: "The general assemblies of BIS – BI Student Society (Trondheim, Bergen, and Stavanger) and SBIO (Oslo) voted for a merger of the student associations.",
    },
    {
      year: "2008",
      title: "KPMG & SBIO Sail Challenge",
      description: "In collaboration with KPMG, a sailing regatta is arranged on the Oslo Fjord during Orientation Week 2008. The event was a great success and received significant attention in the media.",
    },
    {
      year: "2006",
      title: "Student newspaper INSIDE becomes independent",
      description: "After a desire for more independence as a student media and to fulfill the media policy allocation criteria at the Student Welfare Council in Oslo, the Student newspaper INSIDE is separated as its own limited company.",
    },
    {
      year: "2005",
      title: "SBIO is established",
      description: "Based on BI Norwegian Business School's decision to relocate all operations to Nydalen, the student associations MØSS, VASS, BS, and BISON merge into one student association - SBIO.",
    },
    {
      year: "1964",
      title: "Business Economics Student Society is established",
      description: "The Norwegian Business School BI's first student association is established, with its own basement premises in Haakon den Godes vei as a permanent meeting place.",
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
                <History size={32} color="$yellow10" />
                <Text
                  fontSize={32}
                  fontWeight="700"
                  color="$color"
                >
                  Our History
                </Text>
              </XStack>

              <Text
                fontSize={16}
                color="$color"
                opacity={0.7}
                marginBottom="$4"
              >
                Discover the journey of BISO through the years, from its founding to present day.
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
                    Key Milestones
                  </Text>
                  <Text
                    fontSize={16}
                    color="$color"
                    opacity={0.7}
                  >
                    Explore the significant events that shaped BISO
                  </Text>
                </Card.Header>
              </Card>

              <YStack space="$2" marginTop="$4">
                {timelineEvents.map((event, index) => (
                  <TimelineEvent
                    key={index}
                    {...event}
                    isFirst={index === 0}
                    isLast={index === timelineEvents.length - 1}
                  />
                ))}
              </YStack>
            </YStack>
          </AnimatePresence>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
} 