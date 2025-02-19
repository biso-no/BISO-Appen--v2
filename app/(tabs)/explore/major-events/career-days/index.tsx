import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, Image, ScrollView, XStack, H3, H4, Button, Text, Separator } from "tamagui";
import { Briefcase, Calendar, Clock, MapPin, Presentation, Users2, BookOpen } from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { Badge } from "@tamagui/lucide-icons";

const kdLogo = require('@/assets/images/kd.png');
const kdHorizontalLogo = require('@/assets/images/kd-horizontal.png');

interface Company {
  id: string;
  name: string;
  industry: string;
  description: string;
  logo: string;
}

interface Session {
  id: string;
  title: string;
  company: string;
  time: string;
  location: string;
  type: 'presentation' | 'workshop';
  description: string;
}

const companies: Company[] = [
  {
    id: '1',
    name: 'Deloitte',
    industry: 'Consulting',
    description: 'Global professional services network and one of the "Big Four" accounting organizations.',
    logo: 'https://example.com/deloitte-logo.png' // Replace with actual logo
  },
  {
    id: '2',
    name: 'DNB',
    industry: 'Banking',
    description: "Norway's largest financial services group and one of the largest in the Nordic region.",
    logo: 'https://example.com/dnb-logo.png' // Replace with actual logo
  },
  {
    id: '3',
    name: 'Equinor',
    industry: 'Energy',
    description: 'Norwegian multinational energy company developing oil, gas, wind and solar energy.',
    logo: 'https://example.com/equinor-logo.png' // Replace with actual logo
  }
];

const sessions: Session[] = [
  {
    id: '1',
    title: 'Future of Consulting',
    company: 'Deloitte',
    time: '10:00 - 11:00',
    location: 'Auditorium A',
    type: 'presentation',
    description: 'Learn about the evolving landscape of consulting and future career opportunities.'
  },
  {
    id: '2',
    title: 'Digital Banking Workshop',
    company: 'DNB',
    time: '11:30 - 13:00',
    location: 'Workshop Room 1',
    type: 'workshop',
    description: 'Hands-on session on digital transformation in banking and fintech innovations.'
  },
  {
    id: '3',
    title: 'Sustainable Energy Future',
    company: 'Equinor',
    time: '14:00 - 15:00',
    location: 'Auditorium B',
    type: 'presentation',
    description: 'Discover career opportunities in renewable energy and sustainability.'
  }
];

const CompanyCard = ({ company }: { company: Company }) => (
  <MotiView
    from={{ 
      opacity: 0,
      scale: 0.9,
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
      mass: 0.8
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
      backgroundColor="$careerBgLight"
    >
      <Card.Header padded>
        <XStack gap="$4" alignItems="center">
          <Image
            source={{ uri: company.logo }}
            style={{ width: 60, height: 60 }}
            objectFit="contain"
          />
          <YStack flex={1}>
            <XStack gap="$2" alignItems="center">
              <H4 color="$careerPrimary">{company.name}</H4>
              <Badge size="$2" backgroundColor="$careerPrimary">
                <Text color="$careerBgDark">{company.industry}</Text>
              </Badge>
            </XStack>
            <Paragraph color="white">{company.description}</Paragraph>
          </YStack>
        </XStack>
      </Card.Header>
    </Card>
  </MotiView>
);

const SessionCard = ({ session }: { session: Session }) => (
  <MotiView
    from={{ 
      opacity: 0,
      scale: 0.9,
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
      mass: 0.8
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
      backgroundColor="$careerBgLight"
    >
      <Card.Header padded>
        <YStack gap="$2">
          <XStack gap="$2" alignItems="center">
            <H4 color="$careerPrimary">{session.title}</H4>
            <Badge 
              size="$2" 
              backgroundColor={session.type === 'presentation' ? '$careerPrimary' : '$careerSecondary'}
            >
              <Text color="$careerBgDark">
                {session.type === 'presentation' ? 'Presentation' : 'Workshop'}
              </Text>
            </Badge>
          </XStack>
          
          <Text color="$careerSecondary">{session.company}</Text>
          
          <XStack gap="$3" alignItems="center">
            <Clock size={16} color="$careerPrimary" />
            <Text color="white">{session.time}</Text>
          </XStack>
          
          <XStack gap="$3" alignItems="center">
            <MapPin size={16} color="$careerPrimary" />
            <Text color="white">{session.location}</Text>
          </XStack>
          
          <Separator />
          <Paragraph color="white" opacity={0.9}>{session.description}</Paragraph>
        </YStack>
      </Card.Header>
    </Card>
  </MotiView>
);

export default function CareerDaysScreen() {
  return (
    <ScrollView>
      <MyStack>
        <YStack>
          <YStack
            backgroundImage="linear-gradient(135deg, $careerBgDark, $careerBgLight)"
            height={250}
            justifyContent="center"
            alignItems="center"
            padding="$4"
          >
            <Image
              source={kdHorizontalLogo}
              style={{ 
                width: '90%',
                height: 100
              }}
              objectFit="contain"
            />
          </YStack>
          
          <YStack padding="$4" gap="$4">
            <YStack gap="$2">
              <H3 color="$careerPrimary" fontWeight="bold">KARRIEREDAGENE 2024</H3>
              <Paragraph theme="alt2">
                Connect with leading companies, explore career opportunities, and get insights from industry professionals.
              </Paragraph>
            </YStack>

            <YStack gap="$4">
              <XStack gap="$2" alignItems="center">
                <Calendar size={20} color="$careerPrimary" />
                <Text>March 15-16, 2024</Text>
              </XStack>
              <XStack gap="$2" alignItems="center">
                <MapPin size={20} color="$careerPrimary" />
                <Text>BI Norwegian Business School</Text>
              </XStack>
            </YStack>

            <YStack gap="$4">
              <H4 color="$careerPrimary">Participating Companies</H4>
              <YStack gap="$3">
                {companies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </YStack>
            </YStack>

            <YStack gap="$4">
              <H4 color="$careerPrimary">Schedule</H4>
              <YStack gap="$3">
                {sessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </YStack>
            </YStack>

            <Button
              size="$5"
              backgroundColor="$careerPrimary"
              color="$careerBgDark"
              icon={BookOpen}
              onPress={() => {/* Add registration logic */}}
              hoverStyle={{ backgroundColor: '$careerSecondary' }}
              pressStyle={{ scale: 0.97 }}
            >
              Register for Workshops
            </Button>
          </YStack>
        </YStack>
      </MyStack>
    </ScrollView>
  );
} 