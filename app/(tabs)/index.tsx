import { ScrollView } from 'tamagui';
import { useEffect, useState } from 'react';
import { Discover } from '@/components/home/discover';
import { Search } from '@/components/home/search';
import { MyStack } from '@/components/ui/MyStack';
import { useAuth } from '@/components/context/auth-provider';
import { FeaturedPostsCarousel } from '@/components/explore/featured';
import { PromptOnboarding } from '@/components/prompt-onboarding';


export default function HomeScreen() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    console.log('Profile:', profile);
  }, [profile]);

  return (
      <ScrollView>
        <MyStack alignItems="center">
          <FeaturedPostsCarousel />
          <Discover />
          <Search modalOpen={searchModalOpen} setModalOpen={setSearchModalOpen} />
          <PromptOnboarding />
        </MyStack>
      </ScrollView>
  );
}