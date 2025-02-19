import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, Image, ScrollView, XStack, H3, H4, Button, Text, Separator } from "tamagui";
import { Snowflake, Trophy, Music, Ticket, MapPin, Calendar, Info } from '@tamagui/lucide-icons';
import { MotiView } from 'moti';

interface Event {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
}

const events: Event[] = [
  {
    id: 'skiing',
    title: 'Ski Competition',
    description: 'Show off your skiing skills in our friendly competition with prizes for different categories.',
    icon: Trophy,
    color: 'blue'
  },
  {
    id: 'party',
    title: 'Evening Entertainment',
    description: 'Live music, DJs, and entertainment throughout the night at our dedicated venue.',
    icon: Music,
    color: 'purple'
  },
  {
    id: 'activities',
    title: 'Snow Activities',
    description: 'Various snow activities including sledding, snowball fights, and snow sculpture competition.',
    icon: Snowflake,
    color: 'cyan'
  }
];

const InfoCard = ({ icon: Icon, title, description, color }: { icon: any, title: string, description: string, color: string }) => (
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
            backgroundColor={`$${color}3`}
            padding="$3"
            borderRadius="$4"
          >
            <Icon size={24} color={`var(--${color}11)`} />
          </YStack>
          <YStack flex={1}>
            <H4>{title}</H4>
            <Paragraph theme="alt2">{description}</Paragraph>
          </YStack>
        </XStack>
      </Card.Header>
    </Card>
  </MotiView>
);

const PracticalInfo = () => (
  <Card bordered elevate size="$4">
    <Card.Header padded>
      <YStack gap="$4">
        <XStack gap="$3" alignItems="center">
          <Calendar size={20} color="var(--blue11)" />
          <YStack>
            <Text fontWeight="bold">Date</Text>
            <Text>February 15-17, 2024</Text>
          </YStack>
        </XStack>
        
        <XStack gap="$3" alignItems="center">
          <MapPin size={20} color="var(--blue11)" />
          <YStack>
            <Text fontWeight="bold">Location</Text>
            <Text>Trysil Mountain Resort</Text>
            <Text theme="alt2">2.5 hours from Oslo</Text>
          </YStack>
        </XStack>
        
        <XStack gap="$3" alignItems="center">
          <Ticket size={20} color="var(--blue11)" />
          <YStack>
            <Text fontWeight="bold">Ticket Includes</Text>
            <Text>• Transportation from BI</Text>
            <Text>• 2 nights accommodation</Text>
            <Text>• Ski pass for 2 days</Text>
            <Text>• All evening events</Text>
          </YStack>
        </XStack>
      </YStack>
    </Card.Header>
  </Card>
);

export default function WinterGamesScreen() {
  return (
    <ScrollView>
      <MyStack>
        <YStack>
          <Image
            source={{ uri: 'https://example.com/winter-games-hero.jpg' }} // Replace with actual image
            style={{ width: '100%', height: 250 }}
            objectFit="cover"
          />
          
          <YStack padding="$4" gap="$4">
            <YStack gap="$2">
              <H3>Winter Games 2024</H3>
              <Paragraph theme="alt2">
                Experience the ultimate winter weekend with skiing, parties, and unforgettable moments with fellow students.
              </Paragraph>
            </YStack>

            <YStack gap="$4">
              <H4>Events & Activities</H4>
              <YStack gap="$3">
                {events.map((event) => (
                  <InfoCard
                    key={event.id}
                    icon={event.icon}
                    title={event.title}
                    description={event.description}
                    color={event.color}
                  />
                ))}
              </YStack>
            </YStack>

            <YStack gap="$4">
              <H4>Practical Information</H4>
              <PracticalInfo />
            </YStack>

            <YStack gap="$3">
              <Button
                size="$5"
                theme="active"
                icon={Ticket}
                onPress={() => {/* Add ticket purchase logic */}}
              >
                Buy Tickets
              </Button>
              <Paragraph theme="alt2" textAlign="center">
                BISO members get 20% discount
              </Paragraph>
            </YStack>
          </YStack>
        </YStack>
      </MyStack>
    </ScrollView>
  );
} 