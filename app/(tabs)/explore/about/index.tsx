import { View, Image, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Users, BookOpen, History, Shield, UserPlus } from '@tamagui/lucide-icons';
import { Card, XStack, YStack, Text, Button, AnimatePresence, ScrollView } from 'tamagui';

interface AboutSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  imageUrl?: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({
  title,
  description,
  icon,
  route,
  imageUrl,
}) => {
  const router = useRouter();
  const { width } = useWindowDimensions();

  return (
    <Card
      elevate
      size="$4"
      bordered
      animation="bouncy"
      scale={1}
      hoverStyle={{ scale: 1.02 }}
      pressStyle={{ scale: 0.98 }}
      onPress={() => router.push(route as any)}
      marginBottom="$4"
    >
      <Card.Header padded>
        <XStack space="$4" alignItems="center">
          {icon}
          <YStack flex={1}>
            <Text
              color="$color"
              fontSize={20}
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
          <ChevronRight size={20} color="$color" opacity={0.5} />
        </XStack>
      </Card.Header>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: '100%',
            height: 120,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
          resizeMode="cover"
        />
      )}
    </Card>
  );
};

export default function AboutScreen() {
  const sections: AboutSectionProps[] = [
    {
      title: "Our Politics",
      description: "Learn about BISO's political stance and initiatives",
      icon: <Shield size={24} color="$blue10" />,
      route: "/explore/about/politics",
      imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80",
    },
    {
      title: "Our History",
      description: "Discover BISO's journey and milestones",
      icon: <History size={24} color="$yellow10" />,
      route: "/explore/about/history",
      imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80",
    },
    {
      title: "Academics",
      description: "Explore our academic achievements and initiatives",
      icon: <BookOpen size={24} color="$green10" />,
      route: "/explore/about/academics",
      imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80",
    },
    {
      title: "Alumni",
      description: "Connect with our growing alumni network",
      icon: <UserPlus size={24} color="$purple10" />,
      route: "/explore/about/alumni",
      imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80",
    },
    {
      title: "Whistleblowing",
      description: "Report concerns and help maintain integrity",
      icon: <Shield size={24} color="$red10" />,
      route: "/explore/about/whistleblowing",
      imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <YStack padding="$4" space="$4">
          <YStack>
            <Text
              fontSize={32}
              fontWeight="700"
              color="$color"
              marginBottom="$2"
            >
              About BISO
            </Text>
            <Text
              fontSize={16}
              color="$color"
              opacity={0.7}
            >
              Discover our organization's mission, history, and impact on student life
            </Text>
          </YStack>

          {sections.map((section, index) => (
            <AboutSection key={index} {...section} />
          ))}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
} 