import { useState, useEffect } from 'react';
import { useWindowDimensions, useColorScheme, ScrollView, Pressable, Linking } from 'react-native';
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
import { Users, Mail, Phone, ChevronRight, MapPin } from '@tamagui/lucide-icons';
import { functions } from '@/lib/appwrite';
import { useCampus } from '@/lib/hooks/useCampus';

// Types for department members from M365
interface DepartmentMember {
  name: string;
  email: string;
  phone: string;
  role: string;
  officeLocation: string;
  profilePhotoUrl?: string;
}

interface DepartmentMembersResponse {
  success: boolean;
  members: DepartmentMember[];
  count: number;
  departmentName: string;
  campus: string;
  message?: string;
  error?: string;
}

interface DepartmentMembersShowcaseProps {
  campusId: string;
  departmentId?: string;
  title?: string;
}

function MemberCard({ member, index }: { member: DepartmentMember; index: number }) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 32, 300);

  const handleEmailPress = () => {
    if (member.email) {
      Linking.openURL(`mailto:${member.email}`);
    }
  };

  const handlePhonePress = () => {
    if (member.phone) {
      Linking.openURL(`tel:${member.phone}`);
    }
  };

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

          <YStack padding="$4" gap="$3">
            <XStack alignItems="center" gap="$3">
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
                      {member.name.charAt(0)}
                    </Text>
                  </Avatar.Fallback>
                )}
              </Avatar>

              <YStack flex={1} gap="$1">
                <Text 
                  fontSize="$5" 
                  fontWeight="600" 
                  color="$color"
                  numberOfLines={1}
                >
                  {member.name}
                </Text>
                {member.role && (
                  <Text 
                    fontSize="$3" 
                    color={colorScheme === 'dark' ? '$blue11' : '$blue9'}
                    fontWeight="500"
                    numberOfLines={1}
                    opacity={0.9}
                  >
                    {member.role}
                  </Text>
                )}
              </YStack>
            </XStack>

            <YStack 
              backgroundColor={colorScheme === 'dark' ? '$blue4' : '$blue2'} 
              padding="$3"
              borderRadius="$3"
              gap="$2"
            >
              {member.officeLocation && (
                <XStack gap="$2" alignItems="center">
                  <MapPin 
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
                    {member.officeLocation}
                  </Text>
                </XStack>
              )}

              {member.email && (
                <Pressable onPress={handleEmailPress}>
                  <XStack gap="$2" alignItems="center">
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
                      {member.email}
                    </Text>
                  </XStack>
                </Pressable>
              )}

              {member.phone && (
                <Pressable onPress={handlePhonePress}>
                  <XStack gap="$2" alignItems="center">
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
                      {member.phone}
                    </Text>
                  </XStack>
                </Pressable>
              )}
            </YStack>
          </YStack>
        </YStack>
      </Pressable>
    </MotiView>
  );
}

export function DepartmentMembersShowcase({ departmentId, title }: DepartmentMembersShowcaseProps) {
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [departmentName, setDepartmentName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const { campus } = useCampus();

  const fetchDepartmentMembers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: { campus: string; departmentId?: string } = {
        campus: campus?.$id ?? ''
      };
      
      // Only add departmentId if it's provided
      if (departmentId) {
        params.departmentId = departmentId;
      }
      
      const execution = await functions.createExecution(
        'get_board_members',  // Your function ID
        JSON.stringify(params),
        false
      );
      console.log(execution.responseBody);
      
      const result: DepartmentMembersResponse = JSON.parse(execution.responseBody);
      
      if (result.success && Array.isArray(result.members)) {
        setMembers(result.members);
        setDepartmentName(result.departmentName);
      } else {
        setError(result.message || 'Failed to load department members');
      }
    } catch (err) {
      console.error('Error fetching department members:', err);
      setError('An error occurred while fetching members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentMembers();
  }, [campus, departmentId]);

  if (isLoading) {
    return (
      <YStack padding="$4" alignItems="center" gap="$4">
        <Text>Loading department members...</Text>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack padding="$4" alignItems="center" gap="$4">
        <Text color="$red10">{error}</Text>
        <Button
          themeInverse
          onPress={fetchDepartmentMembers}
        >
          Retry
        </Button>
      </YStack>
    );
  }

  if (members.length === 0) {
    return (
      <YStack padding="$4" alignItems="center">
        <Text>No department members found</Text>
      </YStack>
    );
  }

  return (
    <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
      <YStack gap="$2">
        <XStack 
          gap="$3" 
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
            {title || departmentName}
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
          {members.map((member, index) => (
            <MemberCard 
              key={`${member.name}-${index}`}
              member={member} 
              index={index} 
            />
          ))}
        </ScrollView>
      </YStack>
    </Theme>
  );
}