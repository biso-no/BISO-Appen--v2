import React, { useEffect, useState } from 'react';
import { AnimatePresence } from '@tamagui/animate-presence';
import { ArrowLeft, ArrowRight } from '@tamagui/lucide-icons';
import { Button, Image, Text, XStack, YStack, styled } from 'tamagui';
import { Models, Query } from 'react-native-appwrite';
import { databases } from '@/lib/appwrite';
import { useCampus } from '@/lib/hooks/useCampus';

const GalleryItem = styled(YStack, {
  zIndex: 1,
  x: 0,
  opacity: 1,
  fullscreen: true,
  alignItems: 'center',
  justifyContent: 'center',
  variants: {
    // 1 = right, 0 = nowhere, -1 = left
    going: {
      ':number': (going) => ({
        enterStyle: {
          x: going > 0 ? 1000 : -1000,
          opacity: 0,
        },
        exitStyle: {
          zIndex: 0,
          x: going < 0 ? 1000 : -1000,
          opacity: 0,
        },
      }),
    },
  } as const,
});

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export function FeaturedPostsCarousel() {
  const [[page, going], setPage] = React.useState([0, 0]);
  const { campus } = useCampus();
  const [featuredPosts, setFeaturedPosts] = useState<Models.DocumentList<Models.Document>>();

  useEffect(() => {
    async function fetchFeatured() {
      const filters = campus?.$id
        ? Query.or([Query.equal('campus_id', campus.$id), Query.equal('campus_id', '5')])
        : Query.equal('campus_id', '5');
      try {
        const featured = await databases.listDocuments('app', 'news', [
          Query.select(['title', 'content', 'url', 'department_id', 'image', 'campus_id', '$createdAt', '$id']),
          Query.limit(5),
          filters,
        ]);
        setFeaturedPosts(featured);
        console.log('Featured Posts: ', featured);
      } catch (error) {
        console.error('Error fetching featured posts: ', error);
      }
    }
    fetchFeatured();
  }, [campus]);

  if (!featuredPosts) {
    console.log('No featured posts available');
    return <Text>Loading...</Text>; // Show a loading message while fetching
  }

  if (featuredPosts.total === 0) {
    console.log('No posts found');
    return <Text>No posts found</Text>;
  }

  const postIndex = wrap(0, featuredPosts.total, page);
  const currentPost = featuredPosts.documents[postIndex];

  if (!currentPost) {
    console.log('Current post is undefined');
    return null;
  }

  const paginate = (going: number) => {
    setPage([page + going, going]);
  };

  return (
    <XStack
      overflow="hidden"
      backgroundColor="#000"
      position="relative"
      height={200}
      width="100%"
      borderRadius={"$4"}
      alignItems="center"
    >
      <AnimatePresence initial={false} custom={{ going }}>
        <GalleryItem key={page} animation="slow" going={going}>
          <Image source={{ uri: currentPost.image, width: 820, height: 200 }} />
          <Text color="#fff" fontSize={18} fontWeight="bold">
            {currentPost.title}
          </Text>
          <Text color="#fff" fontSize={16}>
            {currentPost.campus}
          </Text>
          <Text color="#fff" fontSize={14}>
            {currentPost.department}
          </Text>
        </GalleryItem>
      </AnimatePresence>
      <Button
        accessibilityLabel="Carousel left"
        icon={ArrowLeft}
        size="$5"
        position="absolute"
        left="$4"
        circular
        elevate
        onPress={() => paginate(-1)}
        zi={100}
      />
      <Button
        accessibilityLabel="Carousel right"
        icon={ArrowRight}
        size="$5"
        position="absolute"
        right="$4"
        circular
        elevate
        onPress={() => paginate(1)}
        zi={100}
      />
    </XStack>
  );
}
