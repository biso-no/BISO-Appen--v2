import { Pressable } from 'react-native';

import { H3, Text, View, YStack, Input } from 'tamagui';
import { Discover } from '@/components/home/discover';
import { ScrollView } from 'tamagui';
import { useEffect, useState } from 'react';
import { Search } from '@/components/home/search';
import { Search as SearchIcon } from '@tamagui/lucide-icons';
import { MyStack } from '@/components/ui/MyStack';
import { useAuth } from '@/components/context/auth-provider';
import { FeaturedPostsCarousel } from '@/components/explore/featured';

export default function HomeScreen() {

  const [searchModalOpen, setSearchModalOpen] = useState(false);
const { profile } = useAuth();
  useEffect(() => {
    console.log('Profile:', profile);
  }, [profile]);

  return (
    <ScrollView>
    <MyStack alignItems={"center"}>
            {/* 
    <Pressable onPress={() => setSearchModalOpen(true)} style={{width: "90%", marginTop: 10}}>
          <View style={{
            borderWidth: 1,
            borderColor: "$accentColor",
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderRadius: 10,
            backgroundColor: "$background",
            flexDirection: "row",
            alignItems: "center",
          }}>
            <SearchIcon />
            <Text style={{ marginLeft: 10 }}>
              Find something new
            </Text>
          </View>
        </Pressable>
<Featured /> */}
      <FeaturedPostsCarousel />
      <Discover />
      <Search modalOpen={searchModalOpen} setModalOpen={setSearchModalOpen} />
    </MyStack>
    </ScrollView>
  );
}