import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { MyStack } from '@/components/ui/MyStack';
import { H3, Text, View, YStack } from 'tamagui';
import { Featured } from '@/components/home/featured';
import { Discover } from '@/components/home/discover';
import { ScrollView } from 'tamagui';

export default function TabOneScreen() {
  return (
    <ScrollView>
    <YStack ai={"center"}>
      <H3>Discover the latest updates and events</H3>
      <Featured />
      <Discover />
    </YStack>
    </ScrollView>
  );
}