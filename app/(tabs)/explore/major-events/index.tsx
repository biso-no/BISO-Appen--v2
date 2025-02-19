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
  Text, 
  Button,
  useTheme
} from "tamagui";
import { 
  Calendar, 
  Snowflake, 
  Briefcase, 
  Users, 
  GraduationCap,
  MapPin,
  Presentation,
  ChevronRight
} from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { Link } from 'expo-router';
import { ImageSourcePropType } from 'react-native';

// Import the logo images
const fadderullanLogo = require('@/assets/images/fadderullan-white.png');
const kdLogo = require('@/assets/images/kd.png');
const kdHorizontalLogo = require('@/assets/images/kd-horizontal.png');

interface MajorEvent {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  date: string;
  image: ImageSourcePropType;
  icon: any;
  color: string;
  link: string;
  status: string;
  stats: Array<{ icon: any; label: string }>;
  features: Array<{ icon: any; title: string; description: string }>;
}

const majorEvents: MajorEvent[] = [
  {
    id: 'buddy-week',
    title: 'FADDERULLAN',
    description: 'Your ultimate introduction to student life at BI.',
    longDescription: 'Join us for an unforgettable week filled with activities, new friendships, and amazing memories. FADDERULLAN is your gateway to student life at BI Norwegian Business School.',
    date: 'August 2024',
    image: fadderullanLogo,
    icon: Users,
    color: 'orange',
    link: '/explore/major-events/buddy-week',
    status: 'Registration Open',
    stats: [
      { icon: Users, label: '1000+ Students' },
      { icon: Calendar, label: '7 Days' },
      { icon: MapPin, label: 'All Campuses' }
    ],
    features: [
      { 
        icon: Users, 
        title: 'Meet Your Buddy Group',
        description: 'Get paired with fellow students and an experienced buddy leader'
      },
      { 
        icon: Calendar, 
        title: 'Daily Activities',
        description: 'Engaging events, social gatherings, and team building activities'
      },
      { 
        icon: MapPin, 
        title: 'Campus Tour',
        description: 'Get to know your campus and all its facilities'
      }
    ]
  },
  {
    id: 'career-days',
    title: 'KARRIEREDAGENE',
    description: 'Norway\'s largest student-driven career fair.',
    longDescription: 'Connect with leading companies, explore opportunities, and kickstart your career journey. KARRIEREDAGENE brings together students and top employers for two days of networking, learning, and career development.',
    date: 'March 15-16, 2024',
    image: kdHorizontalLogo,
    icon: GraduationCap,
    color: 'career',
    link: '/explore/major-events/career-days',
    status: 'Coming Soon',
    stats: [
      { icon: Briefcase, label: '80+ Companies' },
      { icon: Presentation, label: '40+ Talks' },
      { icon: Users, label: '5000+ Students' }
    ],
    features: [
      { 
        icon: Briefcase, 
        title: 'Company Fair',
        description: 'Meet representatives from leading companies across industries'
      },
      { 
        icon: Presentation, 
        title: 'Workshops & Talks',
        description: 'Learn from industry experts and gain valuable insights'
      },
      { 
        icon: Users, 
        title: 'Networking',
        description: 'Build connections with potential employers and fellow students'
      }
    ]
  }
];

const EventCard = ({ event }: { event: MajorEvent }) => {
  const theme = useTheme();
  const isBuddyWeek = event.id === 'buddy-week';
  const isCareerDays = event.id === 'career-days';

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
        delay: majorEvents.findIndex(e => e.id === event.id) * 100
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
        overflow="hidden"
        borderColor={
          isBuddyWeek ? '$buddyAccent' : 
          isCareerDays ? '$careerSecondary' : 
          `$${event.color}4`
        }
        backgroundColor={
          isBuddyWeek ? '$buddyLight' : 
          isCareerDays ? '$careerBgDark' : 
          undefined
        }
      >
        {/* Status Badge */}
        {event.status && (
          <XStack
            backgroundColor={
              isBuddyWeek ? '$buddyPrimary' : 
              isCareerDays ? '$careerPrimary' : 
              `$${event.color}9`
            }
            paddingHorizontal="$3"
            paddingVertical="$2"
            justifyContent="center"
            alignItems="center"
            position="absolute"
            top="$4"
            right="$4"
            borderRadius="$4"
            zIndex={1}
          >
            <Text 
              color={isCareerDays ? '$careerBgDark' : 'white'} 
              fontWeight="bold"
              fontSize="$3"
            >
              {event.status}
            </Text>
          </XStack>
        )}

        {/* Hero Section */}
        <YStack
          backgroundColor={
            isBuddyWeek ? '$buddyPrimary' : 
            isCareerDays ? '$careerBgDark' : 
            undefined
          }
          padding="$6"
          alignItems="center"
          justifyContent="center"
          height={200}
          {...(isCareerDays && {
            backgroundImage: 'linear-gradient(135deg, $careerBgDark, $careerBgLight)'
          })}
        >
          <Image
            source={event.image}
            style={{ 
              width: '100%',
              height: 120,
              transform: [{ scale: isBuddyWeek ? 1.1 : 1 }]
            }}
            objectFit="contain"
          />
        </YStack>

        {/* Content Section */}
        <YStack padding="$4" gap="$4">
          <YStack gap="$2">
            <H4 
              color={
                isBuddyWeek ? '$buddyPrimary' : 
                isCareerDays ? '$careerPrimary' : 
                `$${event.color}11`
              }
              fontWeight="bold"
            >
              {event.title}
            </H4>
            <Text 
              color={
                isBuddyWeek ? '$buddyAccent' : 
                isCareerDays ? '$careerSecondary' : 
                `$${event.color}10`
              }
              fontWeight="500"
              fontSize="$4"
            >
              {event.date}
            </Text>
          </YStack>

          <Paragraph 
            color={
              isBuddyWeek ? '$buddyDark' : 
              isCareerDays ? 'white' : 
              `$${event.color}11`
            }
            opacity={isBuddyWeek || isCareerDays ? 1 : 0.8} 
            size="$4"
          >
            {event.longDescription}
          </Paragraph>

          {/* Stats Section */}
          <YStack gap="$3">
            {event.stats.map((stat, index) => (
              <XStack 
                key={index} 
                gap="$2" 
                alignItems="center"
                backgroundColor={
                  isBuddyWeek ? '$buddyLight' :
                  isCareerDays ? '$careerBgLight' :
                  `$${event.color}2`
                }
                padding="$2"
                borderRadius="$4"
              >
                <stat.icon 
                  size={16} 
                  color={
                    isBuddyWeek ? '$buddyPrimary' :
                    isCareerDays ? '$careerPrimary' :
                    `$${event.color}11`
                  }
                />
                <Text
                  color={
                    isBuddyWeek ? '$buddyPrimary' :
                    isCareerDays ? '$careerPrimary' :
                    `$${event.color}11`
                  }
                  fontSize="$3"
                >
                  {stat.label}
                </Text>
              </XStack>
            ))}
          </YStack>

          {/* Features Section */}
          <YStack gap="$4">
            <H4 
              color={
                isBuddyWeek ? '$buddyPrimary' : 
                isCareerDays ? '$careerPrimary' : 
                `$${event.color}11`
              }
            >
              Key Features
            </H4>
            <YStack gap="$3">
              {event.features.map((feature, index) => (
                <XStack 
                  key={index} 
                  gap="$3" 
                  alignItems="flex-start"
                  backgroundColor={
                    isBuddyWeek ? '$buddyLight' :
                    isCareerDays ? '$careerBgLight' :
                    `$${event.color}2`
                  }
                  padding="$3"
                  borderRadius="$4"
                >
                  <YStack
                    backgroundColor={
                      isBuddyWeek ? '$buddyPrimary' :
                      isCareerDays ? '$careerPrimary' :
                      `$${event.color}4`
                    }
                    padding="$2"
                    borderRadius="$3"
                  >
                    <feature.icon 
                      size={20} 
                      color={
                        isBuddyWeek ? 'white' :
                        isCareerDays ? '$careerBgDark' :
                        `$${event.color}11`
                      }
                    />
                  </YStack>
                  <YStack flex={1} gap="$1">
                    <Text
                      color={
                        isBuddyWeek ? '$buddyPrimary' :
                        isCareerDays ? '$careerPrimary' :
                        `$${event.color}11`
                      }
                      fontWeight="bold"
                      fontSize="$4"
                    >
                      {feature.title}
                    </Text>
                    <Text
                      color={
                        isBuddyWeek ? '$buddyDark' :
                        isCareerDays ? 'white' :
                        `$${event.color}11`
                      }
                      opacity={0.8}
                      fontSize="$3"
                    >
                      {feature.description}
                    </Text>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          </YStack>

          {/* Action Button */}
          <Link href={event.link as any} asChild>
            <Button
              backgroundColor={
                isBuddyWeek ? '$buddyPrimary' :
                isCareerDays ? '$careerPrimary' :
                `$${event.color}9`
              }
              color={isCareerDays ? '$careerBgDark' : 'white'}
              size="$4"
              fontWeight="bold"
              borderRadius="$4"
              hoverStyle={{ 
                backgroundColor: isBuddyWeek ? '$buddyAccent' :
                isCareerDays ? '$careerSecondary' :
                `$${event.color}10`
              }}
              pressStyle={{ scale: 0.97 }}
              icon={event.icon}
            >
              {isBuddyWeek ? 'Join FADDERULLAN' : 'Learn More'}
            </Button>
          </Link>
        </YStack>
      </Card>
    </MotiView>
  );
};

export default function MajorEventsScreen() {
  return (
    <ScrollView>
      <MyStack>
        <YStack padding="$4" gap="$6">
          <YStack gap="$2">
            <H2>Major Events</H2>
            <Paragraph theme="alt2" size="$5">
              Discover BISO's signature events that shape student life at BI. These events are carefully crafted to enhance your student experience and create lasting memories.
            </Paragraph>
          </YStack>
          
          <YStack gap="$6">
            {majorEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </YStack>
        </YStack>
      </MyStack>
    </ScrollView>
  );
} 