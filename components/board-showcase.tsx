import { useState } from 'react';
import { useWindowDimensions, useColorScheme, ScrollView, Pressable } from 'react-native';
import {
  YStack,
  XStack,
  H2,
  Text,
  Avatar,
  Theme,
  useTheme,
  Button,
  Separator,
} from 'tamagui';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Users, Mail, Phone, ChevronRight } from '@tamagui/lucide-icons';

// Types matching Microsoft Graph API user properties we'll need
interface BoardMember {
  id: string;
  displayName: string;
  jobTitle?: string;
  mail: string;
  mobilePhone?: string;
  department?: string;
  profilePhotoUrl?: string;
}

interface BoardShowcaseProps {
  campus: string;
  departmentId: string;
  title?: string;
}

// Placeholder data - will be replaced with actual Graph API data
const PLACEHOLDER_DATA: BoardMember[] = [
  {
    id: '1',
    displayName: 'Marie Haga Eriksen',
    jobTitle: 'President',
    mail: 'president.oslo@biso.no',
    mobilePhone: '+47 123 45 678',
    department: 'Management',
    profilePhotoUrl: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    displayName: 'John Smith',
    jobTitle: 'Vice President',
    mail: 'vp.oslo@biso.no',
    department: 'Management',
    profilePhotoUrl: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    displayName: 'Anna Johnson',
    jobTitle: 'Secretary',
    mail: 'secretary.oslo@biso.no',
    department: 'Management',
    profilePhotoUrl: 'https://i.pravatar.cc/150?img=3',
  },
];

function BoardMemberCard({ member, index }: { member: BoardMember; index: number }) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 32, 300);

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{
        type: 'spring',
        delay: index * 100,
        damping: 15,
      }}
      style={{ width: cardWidth }}
    >
      <Pressable>
        <YStack
          backgroundColor={colorScheme === 'dark' ? '$blue3' : '$blue1'}
          borderRadius="$4"
          overflow="hidden"
          borderColor={colorScheme === 'dark' ? '$blue4' : '$blue2'}
          borderWidth={1}
          opacity={0.98}
        >
          <BlurView
            intensity={colorScheme === 'dark' ? 20 : 40}
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
            }}
          />

          <YStack padding="$4" space="$3">
            <XStack alignItems="center" space="$3">
              <Avatar circular size="$6" elevate>
                {member.profilePhotoUrl ? (
                  <Avatar.Image src={member.profilePhotoUrl} />
                ) : (
                  <Avatar.Fallback 
                    backgroundColor={colorScheme === 'dark' ? '$blue5' : '$blue2'}
                  >
                    <Text 
                      color="$blue9"
                      fontSize="$6"
                      fontWeight="600"
                    >
                      {member.displayName.charAt(0)}
                    </Text>
                  </Avatar.Fallback>
                )}
              </Avatar>

              <YStack flex={1} space="$1">
                <Text 
                  fontSize="$5" 
                  fontWeight="600" 
                  color="$color"
                  numberOfLines={1}
                >
                  {member.displayName}
                </Text>
                {member.jobTitle && (
                  <Text 
                    fontSize="$3" 
                    color={colorScheme === 'dark' ? '$blue11' : '$blue9'}
                    fontWeight="500"
                    numberOfLines={1}
                    opacity={0.9}
                  >
                    {member.jobTitle}
                  </Text>
                )}
              </YStack>
            </XStack>

            <YStack 
              backgroundColor={colorScheme === 'dark' ? '$blue4' : '$blue2'} 
              padding="$3"
              borderRadius="$3"
              space="$2"
            >
              <XStack space="$2" alignItems="center">
                <Mail 
                  size={14} 
                  color={colorScheme === 'dark' ? '$blue11' : '$blue9'} 
                />
                <Text 
                  flex={1}
                  fontSize="$2" 
                  color={colorScheme === 'dark' ? '$blue11' : '$blue9'}
                  fontWeight="500"
                  numberOfLines={1}
                  opacity={0.9}
                >
                  {member.mail}
                </Text>
              </XStack>

              {member.mobilePhone && (
                <XStack space="$2" alignItems="center">
                  <Phone 
                    size={14} 
                    color={colorScheme === 'dark' ? '$blue11' : '$blue9'} 
                  />
                  <Text 
                    flex={1}
                    fontSize="$2" 
                    color={colorScheme === 'dark' ? '$blue11' : '$blue9'}
                    fontWeight="500"
                    numberOfLines={1}
                    opacity={0.9}
                  >
                    {member.mobilePhone}
                  </Text>
                </XStack>
              )}
            </YStack>
          </YStack>
        </YStack>
      </Pressable>
    </MotiView>
  );
}

export function BoardShowcase({ campus, departmentId, title = 'Board Members' }: BoardShowcaseProps) {
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  if (isLoading) {
    return (
      <YStack padding="$4" alignItems="center" space="$4">
        <Text>Loading board members...</Text>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack padding="$4" alignItems="center" space="$4">
        <Text color="$red10">{error}</Text>
        <Button
          themeInverse
          onPress={() => {
            // Add retry logic here when implementing actual data fetching
          }}
        >
          Retry
        </Button>
      </YStack>
    );
  }

  return (
    <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
      <YStack space="$2">
        <XStack 
          space="$3" 
          alignItems="center" 
          paddingHorizontal="$4"
          paddingVertical="$2"
        >
          <Users 
            size={20} 
            color={colorScheme === 'dark' ? '$blue11' : '$blue9'} 
          />
          <Text 
            fontSize="$6"
            fontWeight="600"
            color="$color"
          >
            {title}
          </Text>
          <ChevronRight 
            size={16} 
            color={colorScheme === 'dark' ? '$gray11' : '$gray9'} 
          />
        </XStack>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            gap: 12
          }}
        >
          {PLACEHOLDER_DATA.map((member, index) => (
            <BoardMemberCard 
              key={member.id} 
              member={member} 
              index={index} 
            />
          ))}
        </ScrollView>
      </YStack>
    </Theme>
  );
}
