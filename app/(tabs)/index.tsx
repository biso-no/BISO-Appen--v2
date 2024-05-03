import { Pressable } from 'react-native';

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
    <Pressable onPress={() => setSearchModalOpen(true)} style={{width: "90%", marginTop: 10}}>
          <View style={{
            borderWidth: 1,
            borderColor: "$accentColor",
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderRadius: 6,
            backgroundColor: "$background",
            flexDirection: "row",
            alignItems: "center",
          }}>
            <SearchIcon />
            <Text style={{ marginLeft: 10 }}> {/* Adjust marginLeft as needed */}
              Find something new
            </Text>
          </View>
        </Pressable>
      <H3>Discover the latest updates and events</H3>
      <Featured />
      <Discover />
      <Search modalOpen={searchModalOpen} setModalOpen={setSearchModalOpen} />
    </YStack>
    </ScrollView>
  );
}