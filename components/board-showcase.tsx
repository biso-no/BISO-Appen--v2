import { useState, useEffect } from 'react';
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
import { databases } from '@/lib/appwrite';
import { Models, Query } from 'react-native-appwrite';

// Types for team members
interface TeamMember {
  name: string;
  role: string;
  imageUrl: string;
  email?: string;
  phone?: string;
}

interface BoardShowcaseProps {
  boardMembers: TeamMember[];
  title?: string;
  isLoading?: boolean;
  error?: string;
}

function BoardMemberCard({ member, index }: { member: TeamMember; index: number }) {
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

          <YStack padding="$4" gap="$3">
            <XStack alignItems="center" gap="$3">
              <Avatar circular size="$6" elevate>
                {member.imageUrl ? (
                  <Avatar.Image src={member.imageUrl} />
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

            {(member.email || member.phone) && (
              <YStack 
                backgroundColor={colorScheme === 'dark' ? '$blue4' : '$blue2'} 
                padding="$3"
                borderRadius="$3"
                gap="$2"
              >
                {member.email && (
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
                )}

                {member.phone && (
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
                )}
              </YStack>
            )}
          </YStack>
        </YStack>
      </Pressable>
    </MotiView>
  );
}

export function BoardShowcase({ boardMembers, title, isLoading, error }: BoardShowcaseProps) {

  const colorScheme = useColorScheme();


  if (isLoading) {
    return (
      <YStack padding="$4" alignItems="center" gap="$4">
        <Text>Loading board members...</Text>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack padding="$4" alignItems="center" gap="$4">
        <Text color="$red10">{error}</Text>
        <Button
          themeInverse
          onPress={() => {
            // This will trigger the useEffect to run again
          }}
        >
          Retry
        </Button>
      </YStack>
    );
  }

  if (boardMembers.length === 0) {
    return (
      <YStack padding="$4" alignItems="center">
        <Text>No board members found</Text>
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
          {boardMembers.map((member, index) => (
            <BoardMemberCard 
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