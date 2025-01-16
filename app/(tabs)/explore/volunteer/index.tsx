import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { MotiView } from 'moti';
import RenderHTML from "react-native-render-html";
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { 
  Text, 
  YStack, 
  XStack,
  useTheme, 
  Card, 
  ScrollView, 
  Button, 
  Spinner,
  H2,
  Paragraph
} from "tamagui";
import { ChevronRight, Briefcase } from "@tamagui/lucide-icons";
import { useCampus } from "@/lib/hooks/useCampus";
import { Models } from "react-native-appwrite";

const ITEMS_PER_PAGE = 15;
const SCROLL_THRESHOLD = 0.8;

export default function VolunteerScreen() {
  const [jobs, setJobs] = useState<Models.Document[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const theme = useTheme();
  const { campus } = useCampus();
  const textColor = theme?.color?.val;
  const router = useRouter();

  const htmlStyles = {
    body: { 
      fontSize: 16, 
      lineHeight: 24, 
      color: textColor,
    },
  };

  const fetchJobs = useCallback(async (pageNumber: number, isInitial: boolean = false) => {
    try {
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const response = await axios.get(
        `https://biso.no/wp-json/custom/v1/jobs/?includeExpired=true&per_page=${ITEMS_PER_PAGE}&page=${pageNumber}&campus=${campus?.name}`
      );

      if (isInitial) {
        setJobs(response.data);
      } else {
        setJobs(prevJobs => [...prevJobs, ...response.data]);
      }

      // Check if we've received fewer items than requested, indicating no more data
      setHasMore(response.data.length === ITEMS_PER_PAGE);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching jobs');
    } finally {
      if (isInitial) {
        setInitialLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [campus]);

  useEffect(() => {
    setPage(1);
    setJobs([]);
    setHasMore(true);
    fetchJobs(1, true);
  }, [campus, fetchJobs]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isLoadingMore || !hasMore) return;

    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const scrollPosition = (contentOffset.y + layoutMeasurement.height) / contentSize.height;

    if (scrollPosition > SCROLL_THRESHOLD) {
      setPage(prevPage => prevPage + 1);
      fetchJobs(page + 1);
    }
  }, [isLoadingMore, hasMore, page, fetchJobs]);

  if (initialLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" />
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Text color="$red10" fontSize={16} textAlign="center" marginBottom="$4">
          {error}
        </Text>
        <Button
          onPress={() => fetchJobs(1, true)}
          theme="red"
        >
          Retry
        </Button>
      </YStack>
    );
  }

  return (
    <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
      >
        <YStack gap="$4" padding="$4">
          <H2>Available Positions</H2>
          <Paragraph>Explore volunteer opportunities at {campus?.name}</Paragraph>
          
          {jobs.length > 0 ? (
            <YStack gap="$4">
              {jobs.map((job, index) => (
                <MotiView
                  key={`${job.id}-${index}`}
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    type: 'timing',
                    duration: 500,
                    delay: index % ITEMS_PER_PAGE * 100,
                  }}
                >
                  <Card 
                    bordered
                    animation="bouncy"
                    scale={0.9}
                    hoverStyle={{ scale: 0.95 }}
                    pressStyle={{ scale: 0.9 }}
                    onPress={() => router.push(`/explore/volunteer/${job.id}`)}
                  >
                    <Card.Header padded>
                      <XStack gap="$2" alignItems="center">
                        <Briefcase size={20} color={theme?.color?.val} />
                        <RenderHTML
                          source={{ html: job.title }}
                          contentWidth={300}
                          tagsStyles={htmlStyles}
                        />
                      </XStack>
                    </Card.Header>
                    <Card.Footer padded>
                      <XStack justifyContent="space-between" alignItems="center">
                        <Text fontSize={14} color={theme?.color?.val} opacity={0.8}>
                          Click to view details
                        </Text>
                        <ChevronRight size={20} color={theme?.color?.val} />
                      </XStack>
                    </Card.Footer>
                  </Card>
                </MotiView>
              ))}
              
              {isLoadingMore && (
                <YStack padding="$4" alignItems="center">
                  <ActivityIndicator color={theme?.color?.val} />
                </YStack>
              )}
              
              {!hasMore && jobs.length > 0 && (
                <Text 
                  textAlign="center" 
                  color={theme?.color?.val} 
                  opacity={0.6}
                  padding="$4"
                >
                  No more positions available
                </Text>
              )}
            </YStack>
          ) : (
            <Card padding="$4" alignItems="center" gap="$4">
              <Text fontSize={24} color={textColor} textAlign="center">
                No jobs available at the moment
              </Text>
              <Text fontSize={16} color={textColor} textAlign="center">
                Please check back later for new opportunities.
              </Text>
              <Button
                themeInverse
                onPress={() => router.push('/explore')}
              >
                Explore Other Options
              </Button>
            </Card>
          )}
        </YStack>
      </MotiView>
    </ScrollView>
  );
}