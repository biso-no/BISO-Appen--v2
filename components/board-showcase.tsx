import {  memo, useCallback, useMemo } from 'react';
import { useWindowDimensions, useColorScheme, ScrollView, Pressable, Linking } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Avatar,
  Theme,
  Button,
} from 'tamagui';
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';
import { Users, Mail, Phone, ChevronRight, MapPin } from '@tamagui/lucide-icons';
import { functions } from '@/lib/appwrite';
import { useCampus } from '@/lib/hooks/useCampus';
import { useQuery } from '@tanstack/react-query';
import { Image as ExpoImage } from 'expo-image';

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

// Define query keys
const QUERY_KEYS = {
  departmentMembers: 'departmentMembers',
};

// Move the fetch function outside component for React Query
const fetchDepartmentMembers = async ({ 
  campus, 
  departmentId 
}: { 
  campus: string; 
  departmentId?: string 
}): Promise<DepartmentMembersResponse> => {
  
  const params: { campus: string; departmentId?: string } = {
    campus: campus
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
  
  const result: DepartmentMembersResponse = JSON.parse(execution.responseBody);
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to load department members');
  }
  
  return result;
};

// Optimize MemberCard with memo for preventing unnecessary re-renders
const MemberCard = memo(({ member, index }: { member: DepartmentMember; index: number }) => {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 32, 300);

  // Memoize handlers
  const handleEmailPress = useCallback(() => {
    if (member.email) {
      Linking.openURL(`mailto:${member.email}`);
    }
  }, [member.email]);

  const handlePhonePress = useCallback(() => {
    if (member.phone) {
      Linking.openURL(`tel:${member.phone}`);
    }
  }, [member.phone]);

  // Memoize styles and colors
  const cardBackground = useMemo(() => 
    colorScheme === 'dark' ? '$blue3' : '$blue1', 
  [colorScheme]);
  
  const cardBorder = useMemo(() => 
    colorScheme === 'dark' ? '$blue4' : '$blue2', 
  [colorScheme]);
  
  const avatarBackground = useMemo(() => 
    colorScheme === 'dark' ? '$blue5' : '$blue2', 
  [colorScheme]);
  
  const textColor = useMemo(() => 
    colorScheme === 'dark' ? '$blue11' : '$blue9', 
  [colorScheme]);

  const detailsBackground = useMemo(() => 
    colorScheme === 'dark' ? '$blue4' : '$blue2', 
  [colorScheme]);

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
      <YStack
        backgroundColor={cardBackground}
        borderRadius="$4"
        overflow="hidden"
        borderColor={cardBorder}
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
                <ExpoImage
                  source={member.profilePhotoUrl}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={300}
                  placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
                />
              ) : (
                <Avatar.Fallback 
                  backgroundColor={avatarBackground}
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

            <YStack flex={1}>
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
                  color={textColor}
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
            backgroundColor={detailsBackground} 
            padding="$3"
            borderRadius="$3"
            gap="$2"
          >
            {member.officeLocation && (
              <XStack gap="$2" alignItems="center">
                <MapPin 
                  size={14} 
                  color={textColor} 
                />
                <Text 
                  flex={1}
                  fontSize="$2" 
                  color={textColor}
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
                    color={textColor} 
                  />
                  <Text 
                    flex={1}
                    fontSize="$2" 
                    color={textColor}
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
                    color={textColor} 
                  />
                  <Text 
                    flex={1}
                    fontSize="$2" 
                    color={textColor}
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
    </MotiView>
  );
});
MemberCard.displayName = 'MemberCard';
// Memoized SkeletonCard component
const SkeletonCard = memo(() => {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 32, 300);
  
  return (
    <MotiView
      from={{ opacity: 0.4 }}
      animate={{ opacity: 0.8 }}
      transition={{
        type: 'timing',
        duration: 1000,
        loop: true,
        repeatReverse: true
      }}
      style={{ width: cardWidth }}
    >
      <YStack
        backgroundColor={colorScheme === 'dark' ? '$blue3' : '$blue1'}
        borderRadius="$4"
        padding="$4"
        gap="$3"
        borderWidth={1}
        borderColor={colorScheme === 'dark' ? '$blue4' : '$blue2'}
      >
        <XStack alignItems="center" gap="$3">
          <YStack
            width={48}
            height={48}
            borderRadius="$circle"
            backgroundColor={colorScheme === 'dark' ? '$blue5' : '$blue2'}
          />
          <YStack gap="$2">
            <YStack
              width={120}
              height={20}
              borderRadius="$2"
              backgroundColor={colorScheme === 'dark' ? '$blue5' : '$blue2'}
            />
            <YStack
              width={80}
              height={16}
              borderRadius="$2"
              backgroundColor={colorScheme === 'dark' ? '$blue4' : '$blue1'}
            />
          </YStack>
        </XStack>
        <YStack
          backgroundColor={colorScheme === 'dark' ? '$blue4' : '$blue2'}
          padding="$3"
          borderRadius="$3"
          gap="$2"
        >
          {[1, 2, 3].map((_, i) => (
            <XStack key={i} gap="$2" alignItems="center">
              <YStack
                width={14}
                height={14}
                borderRadius="$circle"
                backgroundColor={colorScheme === 'dark' ? '$blue6' : '$blue3'}
              />
              <YStack
                flex={1}
                height={14}
                borderRadius="$2"
                backgroundColor={colorScheme === 'dark' ? '$blue6' : '$blue3'}
              />
            </XStack>
          ))}
        </YStack>
      </YStack>
    </MotiView>
  );
});
SkeletonCard.displayName = 'SkeletonCard';
export const DepartmentMembersShowcase = memo(({ 
  campusId,
  departmentId, 
  title 
}: DepartmentMembersShowcaseProps) => {
  const colorScheme = useColorScheme();
  const { campus } = useCampus();
  
  // Use React Query for data fetching with automatic caching
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: [QUERY_KEYS.departmentMembers, campusId, departmentId],
    queryFn: () => fetchDepartmentMembers({ 
      campus: campusId || campus?.$id || '', 
      departmentId 
    }),
    staleTime: 1000 * 60 * 5, // Keep data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Cache for 30 minutes
    enabled: !!(campusId || campus?.$id),
    retry: 2
  });
  
  // Handle optimistic UI updates
  const members = useMemo(() => data?.members || [], [data]);
  const departmentName = useMemo(() => data?.departmentName || '', [data]);
  
  const headerIconColor = useMemo(() => 
    colorScheme === 'dark' ? '$blue11' : '$blue9', 
  [colorScheme]);
  
  // Render skeleton while loading
  if (isLoading) {
    return (
      <YStack gap="$2">
        <XStack 
          gap="$3" 
          alignItems="center" 
          paddingHorizontal="$4"
          paddingVertical="$2"
        >
          <Users size={20} color={headerIconColor} />
          <Text fontSize="$6" fontWeight="600" color="$color">
            {title || 'Department Members'}
          </Text>
          <ChevronRight size={16} color="$gray9" />
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
          {[1, 2, 3].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </ScrollView>
      </YStack>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <YStack padding="$4" alignItems="center" gap="$4">
        <Text color="$red10">{error?.toString() || 'Error loading members'}</Text>
        <Button themeInverse onPress={() => refetch()}>
          Retry
        </Button>
      </YStack>
    );
  }

  // Handle empty state
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
          <Users size={20} color={headerIconColor} />
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
});

DepartmentMembersShowcase.displayName = 'DepartmentMembersShowcase';