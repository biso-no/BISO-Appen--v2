import { MyStack } from "@/components/ui/MyStack";
import { 
  YStack, 
  Card, 
  Paragraph, 
  Image, 
  ScrollView, 
  XStack, 
  H2, 
  H3, 
  H4, 
  Button, 
  Text, 
  Separator,
  useTheme
} from "tamagui";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  Info,
  PartyPopper,
  GraduationCap,
  Building
} from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { Link } from 'expo-router';

const fadderullanLogo = require('@/assets/images/fadderullan-white.png');

interface Activity {
  id: string;
  title: string;
  time: string;
  location: string;
  description: string;
  icon: any;
}

const activities: Activity[] = [
  {
    id: '1',
    title: 'Welcome Ceremony',
    time: '10:00 - 12:00',
    location: 'BI Auditorium',
    description: 'Official welcome ceremony with speeches, entertainment, and introduction to BISO.',
    icon: PartyPopper
  },
  {
    id: '2',
    title: 'Campus Tour',
    time: '13:00 - 14:30',
    location: 'BI Campus',
    description: 'Guided tour of the campus facilities, libraries, study areas, and social spaces.',
    icon: Building
  },
  {
    id: '3',
    title: 'Team Building Games',
    time: '15:00 - 17:00',
    location: 'Student Square',
    description: 'Fun team activities to help you get to know your fellow students and buddy group.',
    icon: Users
  },
  {
    id: '4',
    title: 'Evening Social',
    time: '19:00 - 23:00',
    location: 'Student Bar',
    description: 'Social gathering with music, games, and opportunities to make new friends.',
    icon: Star
  }
];

const ActivityCard = ({ activity }: { activity: Activity }) => {
  return (
    <MotiView
      from={{ 
        opacity: 0,
        scale: 0.95,
        translateY: 20
      }}
      animate={{ 
        opacity: 1,
        scale: 1,
        translateY: 0
      }}
      transition={{
        type: 'spring',
        damping: 18,
        mass: 0.8,
        delay: activities.findIndex(a => a.id === activity.id) * 100
      }}
    >
      <Card
        elevate
        size="$4"
        bordered
        animation="quick"
        scale={0.9}
        hoverStyle={{ scale: 0.925 }}
        pressStyle={{ scale: 0.875 }}
        borderColor="$buddyAccent"
        backgroundColor="$buddyLight"
      >
        <Card.Header padded>
          <YStack gap="$4">
            <XStack gap="$3" alignItems="center">
              <YStack
                backgroundColor="$buddyPrimary"
                padding="$3"
                borderRadius="$4"
              >
                <activity.icon size={24} color="white" />
              </YStack>
              <YStack flex={1}>
                <H4 color="$buddyPrimary">{activity.title}</H4>
                <XStack gap="$4">
                  <XStack gap="$2" alignItems="center">
                    <Clock size={14} color="$buddyAccent" />
                    <Text color="$buddyAccent" fontSize="$3">{activity.time}</Text>
                  </XStack>
                  <XStack gap="$2" alignItems="center">
                    <MapPin size={14} color="$buddyAccent" />
                    <Text color="$buddyAccent" fontSize="$3">{activity.location}</Text>
                  </XStack>
                </XStack>
              </YStack>
            </XStack>
            <Paragraph 
              color="$buddyDark"
              opacity={0.9}
              size="$4"
            >
              {activity.description}
            </Paragraph>
          </YStack>
        </Card.Header>
      </Card>
    </MotiView>
  );
};

const HighlightCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <MotiView
    from={{ 
      opacity: 0,
      scale: 0.95,
      translateX: -20
    }}
    animate={{ 
      opacity: 1,
      scale: 1,
      translateX: 0
    }}
    transition={{
      type: 'spring',
      damping: 18,
      mass: 0.8
    }}
  >
    <Card 
      bordered 
      elevate 
      size="$4"
      borderColor="$buddyAccent"
      backgroundColor="$buddyLight"
      scale={0.9}
      hoverStyle={{ scale: 0.925 }}
      pressStyle={{ scale: 0.875 }}
    >
      <Card.Header padded>
        <XStack gap="$3" alignItems="center">
          <YStack
            backgroundColor="$buddyPrimary"
            padding="$3"
            borderRadius="$4"
          >
            <Icon size={24} color="white" />
          </YStack>
          <YStack flex={1} gap="$1">
            <H4 color="$buddyPrimary">{title}</H4>
            <Paragraph 
              color="$buddyDark"
              opacity={0.9}
              size="$4"
            >
              {description}
            </Paragraph>
          </YStack>
        </XStack>
      </Card.Header>
    </Card>
  </MotiView>
);

const Stats = () => (
  <XStack gap="$4" flexWrap="wrap">
    {[
      { icon: Users, label: '1000+ Students' },
      { icon: Calendar, label: '7 Days' },
      { icon: MapPin, label: 'All Campuses' },
      { icon: Star, label: '20+ Activities' }
    ].map((stat, index) => (
      <MotiView
        key={index}
        from={{ 
          opacity: 0,
          scale: 0.9,
          translateY: 10
        }}
        animate={{ 
          opacity: 1,
          scale: 1,
          translateY: 0
        }}
        transition={{
          type: 'spring',
          damping: 18,
          mass: 0.8,
          delay: index * 100
        }}
      >
        <XStack 
          backgroundColor="$buddyLight"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$4"
          gap="$2"
          alignItems="center"
          borderColor="$buddyAccent"
          borderWidth={1}
        >
          <stat.icon size={16} color="$buddyPrimary" />
          <Text 
            color="$buddyPrimary"
            fontWeight="500"
            fontSize="$3"
          >
            {stat.label}
          </Text>
        </XStack>
      </MotiView>
    ))}
  </XStack>
);

export default function BuddyWeekScreen() {
  return (
    <ScrollView>
      <MyStack>
        <YStack>
          {/* Hero Section */}
          <YStack
            backgroundColor="$buddyPrimary"
            height={300}
            justifyContent="center"
            alignItems="center"
            padding="$4"
            gap="$4"
          >
            <MotiView
              from={{ 
                opacity: 0,
                scale: 0.9
              }}
              animate={{ 
                opacity: 1,
                scale: 1
              }}
              transition={{
                type: 'spring',
                damping: 18,
                mass: 0.8
              }}
            >
              <Image
                source={fadderullanLogo}
                style={{ 
                  width: 280,
                  height: 120
                }}
                objectFit="contain"
              />
            </MotiView>
            
            <XStack
              backgroundColor="white"
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius="$4"
              justifyContent="center"
              alignItems="center"
            >
              <Text 
                color="$buddyPrimary" 
                fontWeight="bold"
                fontSize="$4"
              >
                Registration Open
              </Text>
            </XStack>
          </YStack>
          
          {/* Content Section */}
          <YStack padding="$4" gap="$6">
            {/* Introduction */}
            <YStack gap="$2">
              <H2 color="$buddyPrimary" fontWeight="bold">FADDERULLAN 2024</H2>
              <Paragraph 
                theme="alt2" 
                size="$5"
                color="$buddyDark"
              >
                Your ultimate introduction to student life at BI. Join us for an unforgettable week of activities, friendships, and memories that will last throughout your student journey.
              </Paragraph>
            </YStack>

            {/* Stats */}
            <Stats />

            {/* Highlights */}
            <YStack gap="$4">
              <H3 color="$buddyPrimary">Program Highlights</H3>
              <YStack gap="$3">
                <HighlightCard
                  icon={Users}
                  title="Meet Your Buddy Group"
                  description="Get paired with fellow students and an experienced buddy leader who will guide you through your first week at BI."
                />
                <HighlightCard
                  icon={Star}
                  title="Social Events"
                  description="Enjoy daily activities, themed parties, and social gatherings designed to help you make new friends and connections."
                />
                <HighlightCard
                  icon={Info}
                  title="Student Life Info"
                  description="Learn about student organizations, clubs, and the many opportunities available to enhance your student experience."
                />
              </YStack>
            </YStack>

            {/* Schedule */}
            <YStack gap="$4">
              <H3 color="$buddyPrimary">Day 1 Schedule</H3>
              <YStack gap="$3">
                {activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </YStack>
            </YStack>

            {/* Registration Button */}
            <Button
              size="$6"
              backgroundColor="$buddyPrimary"
              color="white"
              icon={Calendar}
              onPress={() => {/* Add registration logic */}}
              hoverStyle={{ backgroundColor: '$buddyAccent' }}
              pressStyle={{ scale: 0.97 }}
              borderRadius="$4"
              fontWeight="bold"
            >
              Register for FADDERULLAN
            </Button>
          </YStack>
        </YStack>
      </MyStack>
    </ScrollView>
  );
} 