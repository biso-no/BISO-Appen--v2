import React from 'react';
import { Image, useWindowDimensions, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus, ArrowLeft, Calendar, Link, Users, Briefcase } from '@tamagui/lucide-icons';
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

interface AlumniProfileProps {
  name: string;
  role: string;
  previousRole: string;
  year: string;
  linkedIn: string;
  imageUrl: string;
}

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const AlumniProfile: React.FC<AlumniProfileProps> = ({
  name,
  role,
  previousRole,
  year,
  linkedIn,
  imageUrl,
}) => {
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
        <XStack space="$4" padding="$4">
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
            }}
            resizeMode="cover"
          />
          <YStack flex={1} space="$2">
            <Text
              color="$color"
              fontSize={18}
              fontWeight="600"
            >
              {name}
            </Text>
            <Text
              color="$color"
              fontSize={14}
              opacity={0.7}
            >
              {role}
            </Text>
            <Text
              color="$color"
              fontSize={14}
              opacity={0.7}
            >
              {previousRole}, {year}
            </Text>
            <Button
              icon={Link}
              onPress={() => Linking.openURL(linkedIn)}
              theme="purple"
              size="$3"
            >
              LinkedIn Profile
            </Button>
          </YStack>
        </XStack>
      </Card>
    </AnimatePresence>
  );
};

const Feature: React.FC<FeatureProps> = ({ title, description, icon }) => {
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

export default function AlumniScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const alumniProfiles: AlumniProfileProps[] = [
    {
      name: "Andreas Kustås",
      role: "Executive producer, Oslo Business Forum and Nordic Business Forum",
      previousRole: "President SBIO",
      year: "2017",
      linkedIn: "https://linkedin.com",
      imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80",
    },
    {
      name: "Karen Marie Gunnerud",
      role: "IT Project Manager, Oslo Municipality Development and Competence Agency",
      previousRole: "Board Member BIS",
      year: "2011",
      linkedIn: "https://linkedin.com",
      imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80",
    },
  ];

  const features: FeatureProps[] = [
    {
      title: "Events",
      description: "Register as an Alumni and receive automatic invitations to alumni events and classic BISO events.",
      icon: <Calendar size={24} color="$purple10" />,
    },
    {
      title: "Connect",
      description: "Get in touch with other alumni through the network and meet current members.",
      icon: <Users size={24} color="$purple10" />,
    },
    {
      title: "Engage",
      description: "Join the Advisory board and become an advisor for the organization.",
      icon: <Briefcase size={24} color="$purple10" />,
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
                <UserPlus size={32} color="$purple10" />
                <Text
                  fontSize={32}
                  fontWeight="700"
                  color="$color"
                >
                  Alumni Network
                </Text>
              </XStack>

              <Text
                fontSize={16}
                color="$color"
                opacity={0.7}
                marginBottom="$4"
              >
                Connect with former BISO members and stay updated on what's happening.
              </Text>

              <Button
                size="$4"
                theme="purple"
                marginBottom="$4"
              >
                Register as Alumni
              </Button>

              <Text
                fontSize={24}
                fontWeight="600"
                color="$color"
                marginBottom="$2"
              >
                Alumni Benefits
              </Text>

              <YStack space="$2">
                {features.map((feature, index) => (
                  <Feature key={index} {...feature} />
                ))}
              </YStack>

              <Separator marginVertical="$4" />

              <Text
                fontSize={24}
                fontWeight="600"
                color="$color"
                marginBottom="$2"
              >
                Active Alumni
              </Text>
              <Text
                fontSize={16}
                color="$color"
                opacity={0.7}
                marginBottom="$4"
              >
                Meet our alumni who are active in the organization
              </Text>

              <YStack space="$2">
                {alumniProfiles.map((profile, index) => (
                  <AlumniProfile key={index} {...profile} />
                ))}
              </YStack>
            </YStack>
          </AnimatePresence>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
} 