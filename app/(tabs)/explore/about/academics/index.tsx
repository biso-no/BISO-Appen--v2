import React from 'react';
import { Image, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, ArrowLeft, CheckCircle, Users, School, Star } from '@tamagui/lucide-icons';
import {
  YStack,
  XStack,
  Text,
  Card,
  Button,
  AnimatePresence,
  Separator,
  ScrollView,
} from 'tamagui';

interface AchievementProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ForumProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Achievement: React.FC<AchievementProps> = ({ title, description, icon }) => {
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
        flex={1}
      >
        <Card.Header padded>
          <YStack space="$2" alignItems="center">
            {icon}
            <Text
              color="$color"
              fontSize={18}
              fontWeight="600"
              textAlign="center"
              marginTop="$2"
            >
              {title}
            </Text>
            <Text
              color="$color"
              fontSize={14}
              opacity={0.7}
              textAlign="center"
            >
              {description}
            </Text>
          </YStack>
        </Card.Header>
      </Card>
    </AnimatePresence>
  );
};

const Forum: React.FC<ForumProps> = ({ title, description, icon }) => {
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

export default function AcademicsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const achievements: AchievementProps[] = [
    {
      title: "Digital Teaching",
      description: "Extended digital teaching and streaming for the entire school year 21/22",
      icon: <School size={32} color="$green10" />,
    },
    {
      title: "Exam Format",
      description: "Early announcement of exam formats for better student preparation",
      icon: <BookOpen size={32} color="$green10" />,
    },
    {
      title: "Extended Deadlines",
      description: "Extra time for scanning and converting files in home exams",
      icon: <CheckCircle size={32} color="$green10" />,
    },
    {
      title: "Women in Finance",
      description: "Increased focus on equal opportunities in finance",
      icon: <Star size={32} color="$green10" />,
    },
  ];

  const forums: ForumProps[] = [
    {
      title: "Education Committee",
      description: "Student representatives have significant influence in study plans, course descriptions, and exam formats.",
      icon: <Users size={24} color="$green10" />,
    },
    {
      title: "Learning Environment Committee",
      description: "Ensures students' influence in creating a good academic, physical, and psychological learning environment.",
      icon: <School size={24} color="$green10" />,
    },
    {
      title: "Student Quality System",
      description: "Ensures BI develops high-quality programs aligned with strategic ambitions.",
      icon: <Star size={24} color="$green10" />,
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
                <BookOpen size={32} color="$green10" />
                <Text
                  fontSize={32}
                  fontWeight="700"
                  color="$color"
                >
                  Academics
                </Text>
              </XStack>

              <Text
                fontSize={16}
                color="$color"
                opacity={0.7}
                marginBottom="$4"
              >
                BISO represents students' academic interests and works for increased focus on sustainability.
              </Text>

              <Text
                fontSize={24}
                fontWeight="600"
                color="$color"
                marginBottom="$2"
              >
                Recent Achievements
              </Text>

              <XStack flexWrap="wrap" gap="$4">
                {achievements.map((achievement, index) => (
                  <YStack key={index} width="$15" marginBottom="$4">
                    <Achievement {...achievement} />
                  </YStack>
                ))}
              </XStack>

              <Separator marginVertical="$4" />

              <Text
                fontSize={24}
                fontWeight="600"
                color="$color"
                marginBottom="$2"
              >
                Academic Forums
              </Text>
              <Text
                fontSize={16}
                color="$color"
                opacity={0.7}
                marginBottom="$4"
              >
                Overview of forums where BISO represents student interests
              </Text>

              <YStack space="$2">
                {forums.map((forum, index) => (
                  <Forum key={index} {...forum} />
                ))}
              </YStack>
            </YStack>
          </AnimatePresence>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
} 