import { StyleSheet, TouchableOpacity } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { MyStack } from '@/components/ui/MyStack';
import { H3, Text, View, YStack, Input } from 'tamagui';
import { Featured } from '@/components/home/featured';
import { Discover } from '@/components/home/discover';
import { ScrollView } from 'tamagui';
import { useState } from 'react';
import { Search } from '@/components/home/search';
import { Search as SearchIcon } from '@tamagui/lucide-icons';

export default function HomeScreen() {

  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <ScrollView>
    <YStack ai={"center"}>
      <TouchableOpacity onPress={() => setSearchModalOpen(true)} style={{width: "90%"}}>
      <Input disabled onFocus={() => setSearchModalOpen(true)} width={"90%"} placeholder="Find something new" mt="$4" borderColor="$accentColor"/>
      </TouchableOpacity>
      <H3>Discover the latest updates and events</H3>
      <Featured />
      <Discover />
      <Search modalOpen={searchModalOpen} setModalOpen={setSearchModalOpen} leftIcon={<SearchIcon />} />
    </YStack>
    </ScrollView>
  );
}