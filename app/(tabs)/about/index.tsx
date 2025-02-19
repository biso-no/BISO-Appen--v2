import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, ScrollView, XStack, H3, Button } from "tamagui";
import { Info, FileText, Scale, Building2, Users, AlertTriangle } from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { Link } from 'expo-router';

interface AboutSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  link: string;
}

const aboutSections: AboutSection[] = [
  {
    id: 'what-is-biso',
    title: 'What is BISO?',
    description: 'Learn about our organization, mission, and vision for student life at BI.',
    icon: Info,
    color: 'blue',
    link: '/about/what-is-biso'
  },
  {
    id: 'politics',
    title: 'Our Politics',
    description: 'Discover our political platform and how we work to improve student welfare.',
    icon: Scale,
    color: 'purple',
    link: '/about/politics'
  },
  {
    id: 'bylaws',
    title: 'Bylaws and Statutes',
    description: 'Read our governing documents and organizational structure.',
    icon: FileText,
    color: 'orange',
    link: '/about/bylaws'
  },
  {
    id: 'student-quality',
    title: 'Student Quality',
    description: 'Learn about our work to ensure and improve educational quality.',
    icon: Building2,
    color: 'green',
    link: '/about/student-quality'
  },
  {
    id: 'operations',
    title: 'Operations Unit',
    description: 'Meet our national management team and their responsibilities.',
    icon: Users,
    color: 'yellow',
    link: '/about/operations'
  },
  {
    id: 'report-concern',
    title: 'Report a Concern',
    description: 'Submit concerns about volunteer conduct or other serious issues.',
    icon: AlertTriangle,
    color: 'red',
    link: '/about/report-concern'
  }
];

const SectionCard = ({ section }: { section: AboutSection }) => {
  return (
    <Link href={section.link as any} asChild>
      <Button unstyled pressStyle={{ scale: 0.98 }}>
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
          >
            <Card.Header padded>
              <XStack gap="$3" alignItems="center">
                <YStack
                  backgroundColor={`$${section.color}3`}
                  padding="$3"
                  borderRadius="$4"
                >
                  <section.icon
                    size={24}
                    color={`var(--${section.color}11)`}
                  />
                </YStack>
                <YStack flex={1}>
                  <H3>{section.title}</H3>
                  <Paragraph theme="alt2" numberOfLines={2}>
                    {section.description}
                  </Paragraph>
                </YStack>
              </XStack>
            </Card.Header>
          </Card>
        </MotiView>
      </Button>
    </Link>
  );
};

export default function AboutScreen() {
  return (
    <ScrollView>
      <MyStack>
        <YStack padding="$4" gap="$4">
          <YStack gap="$2">
            <H3>About BISO</H3>
            <Paragraph theme="alt2">
              Learn more about our organization and how we serve BI students
            </Paragraph>
          </YStack>
          
          <YStack gap="$4">
            {aboutSections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </YStack>
        </YStack>
      </MyStack>
    </ScrollView>
  );
} 