import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XStack, Text, Button } from 'tamagui';
import { ChevronLeft } from '@tamagui/lucide-icons';
import Colors from '@/constants/Colors';
import CampusPopover from '@/components/CampusPopover';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import { EventIcon } from './Icons';
import { router } from 'expo-router';

export const HeaderComponent = ({ route, routesWithCampusPopover, isEventRoute, colorScheme, data }) => {
  if (routesWithCampusPopover.includes(route.name)) {
    return (
      <SafeAreaView style={{ flex: 1, borderRadius: 10, backgroundColor: 'black' }}>
        <View>
          <CampusPopover />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <XStack justifyContent="space-between" alignItems="center" width="100%" paddingTop="$8">
      <XStack flex={1} alignItems="center">
        <Button
          chromeless
          onPress={() => {
            router.back();
          }}
        >
          <ChevronLeft size={25} color={Colors[colorScheme ?? 'light'].text} />
        </Button>
      </XStack>
    
      <XStack flex={2} justifyContent="center" alignItems="center">
        <Text key={route.key} fontSize={18} fontWeight="bold">
          {capitalizeFirstLetter(route.name.split('/')[0])}
        </Text>
      </XStack>
    
      <XStack flex={1} justifyContent="flex-end" alignItems="center">
        {isEventRoute && <EventIcon colorScheme={colorScheme} />}
      </XStack>
    </XStack>
  );
};