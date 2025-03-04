import React from 'react';
import { Pressable } from 'react-native';
import { Avatar } from 'tamagui';
import { UserRound, LogIn, Globe } from '@tamagui/lucide-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'tamagui/linear-gradient';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { Models } from 'react-native-appwrite';

export const ProfileIcon = ({ data, avatarId, image, color }: { data: Models.User<Models.Preferences>, avatarId: string, image: string, color: string }) => {
  if (!data?.$id) {
    return <LogIn size={25} color={color} marginTop="$2" />;
  } else if (!avatarId) {
    return <UserRound size={25} color={color} marginTop="$2" />;
  } else {
    return (
      <Avatar circular size={30} bordered marginTop="$2">
        <Avatar.Image src={image || require('@/assets/images/placeholder.png')} />
      </Avatar>
    );
  }
};

export const EventIcon = ({ colorScheme }: { colorScheme?: 'light' | 'dark' }) => {
  return (
    <Pressable onPress={() => router.push("https://biso.no/events/")}>
      {({ pressed }) => (
        <MaskedView maskElement={<Globe size={25} color={Colors[colorScheme ?? 'light'].text} />} style={{ width: 25, height: 25 }}>
          <LinearGradient
            start={[0, 0]}
            end={[0, 1]}
            themeInverse
            theme="accent"
            colors={['$color', '$color2']}
            style={{ width: 25, height: 25 }}
          />
        </MaskedView>
      )}
    </Pressable>
  );
};