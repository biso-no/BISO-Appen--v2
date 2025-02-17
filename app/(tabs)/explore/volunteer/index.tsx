import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { MotiView } from 'moti';
import RenderHTML from "react-native-render-html";
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, useWindowDimensions } from 'react-native';
import { 
  Text, 
  YStack, 
  XStack,
  useTheme, 
  Card, 
  ScrollView, 
  Button,
  H2,
  Paragraph,
  Input,
  Sheet,
  Theme,
  SizableText,
  Separator,
  Stack,
  styled,
} from "tamagui";
import { 
  Search, 
  Briefcase, 
  MapPin,
  Calendar,
  Filter,
  Star,
  ChevronRight
} from "@tamagui/lucide-icons";
import { useCampus } from "@/lib/hooks/useCampus";
import { Models } from "react-native-appwrite";

const ITEMS_PER_PAGE = 15;

const StyledStack = styled(Stack, {
  variants: {
    padded: {
      true: {
        padding: '$4',
      },
    },
  },
});

interface JobCardProps {
  job: Models.Document;
  onPress: () => void;
  index: number;
}

function JobCard({ job, onPress, index }: JobCardProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.98, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{
        type: 'spring',
        delay: index * 50,
        damping: 20,
        mass: 0.8,
      }}
    >
      <Card
        bordered
        animation="bouncy"
        scale={0.98}
        hoverStyle={{ scale: 0.99 }}
        pressStyle={{ scale: 0.96 }}
        onPress={onPress}
        elevate
        size="$4"
        backgroundColor="$background"
      >
        <YStack padding="$4" gap="$3">
          <XStack gap="$3" alignItems="center">
            <Theme name="blue">
              <Card 
                bordered 
                size="$3" 
                padding="$2" 
                animation="bouncy"
                backgroundColor="$blue2"
              >
                <Briefcase size={18} color={theme.blue10?.val || '#007AFF'} />
              </Card>
            </Theme>
            <YStack flex={1} gap="$1">
              <SizableText size="$5" fontWeight="700" numberOfLines={2}>
                {job.title}
              </SizableText>
              {job.expiry_date && (
                <XStack gap="$2" alignItems="center" opacity={0.7}>
                  <Calendar size={14} />
                  <SizableText size="$3" color="$gray11">
                    Deadline: {new Date(job.expiry_date).toLocaleDateString()}
                  </SizableText>
                </XStack>
              )}
            </YStack>
            <Theme name="gray">
              <Button
                icon={ChevronRight}
                size="$3"
                circular
                backgroundColor="$gray3"
                hoverStyle={{ scale: 1.1, backgroundColor: '$gray4' }}
                pressStyle={{ scale: 0.9 }}
              />
            </Theme>
          </XStack>

          <XStack flexWrap="wrap" gap="$2">
            {job.campus?.map((campus: string) => (
              <Button
                key={campus}
                size="$2"
                theme="gray"
                bordered
                icon={MapPin}
                chromeless
              >
                {campus}
              </Button>
            ))}
          </XStack>
          
          {job.content && (
            <RenderHTML
              source={{ html: job.content.split('</p>')[0].replace(/<\/?[^>]+(>|$)/g, '') }}
              contentWidth={width - 48}
              baseStyle={{
                color: theme.color?.val || '#000',
                fontSize: 14,
                lineHeight: 20,
              }}
            />
          )}

          <XStack gap="$2" marginTop="$2">
            <Theme name="blue">
              <Button 
                size="$3" 
                icon={Star}
                chromeless
                backgroundColor="$blue2"
                hoverStyle={{ backgroundColor: '$blue3' }}
              >
                Save for Later
              </Button>
            </Theme>
          </XStack>
        </YStack>
      </Card>
    </MotiView>
  );
}

export default function VolunteerScreen() {
  const [jobs, setJobs] = useState<Models.Document[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const theme = useTheme();
  const { campus } = useCampus();
  const router = useRouter();

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

    if (scrollPosition > 0.8) {
      setPage(prevPage => prevPage + 1);
      fetchJobs(page + 1);
    }
  }, [isLoadingMore, hasMore, page, fetchJobs]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ScrollView 
      onScroll={handleScroll} 
      scrollEventThrottle={16}
      style={{ flex: 1, backgroundColor: theme.background?.val }}
    >
      <StyledStack padded gap="$4">
        <YStack gap="$2">
          <H2 size="$8" fontWeight="700" color="$blue10">
            Make an Impact
          </H2>
          <Paragraph size="$4" color="$gray11">
            Become a volunteer at campus BISO and create positive change
          </Paragraph>
        </YStack>

        {/* Search Bar */}
        <Card bordered elevate size="$2">
          <XStack 
            padding="$3"
            alignItems="center"
            gap="$2"
          >
            <Search size={20} color={theme.gray11?.val} />
            <Input
              flex={1}
              placeholder="Search positions..."
              borderWidth={0}
              backgroundColor="transparent"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Button
              icon={Filter}
              circular
              chromeless
              backgroundColor="$gray3"
              onPress={() => setIsFilterOpen(true)}
            />
          </XStack>
        </Card>

        {/* Job List */}
        <YStack gap="$4">
          {initialLoading ? (
            <YStack justifyContent="center" alignItems="center" minHeight={200}>
              <ActivityIndicator size="large" color={theme.blue10?.val || '#007AFF'} />
            </YStack>
          ) : error ? (
            <Card bordered size="$4" padding="$4" alignItems="center" gap="$4">
              <Text color="$red10" fontSize={16} textAlign="center">
                {error}
              </Text>
              <Button onPress={() => fetchJobs(1, true)} theme="blue">
                Retry
              </Button>
            </Card>
          ) : filteredJobs.length > 0 ? (
            <YStack gap="$4">
              {filteredJobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                  onPress={() => router.push(`/explore/volunteer/${job.id}`)}
                />
              ))}
              {isLoadingMore && (
                <YStack alignItems="center" padding="$4">
                  <ActivityIndicator color={theme.blue10?.val || '#007AFF'} />
                </YStack>
              )}
            </YStack>
          ) : (
            <Card bordered size="$4" padding="$4" alignItems="center" gap="$4">
              <Theme name="gray">
                <Card circular size="$8" padding="$4" backgroundColor="$gray3">
                  <Briefcase size={32} color={theme.gray11?.val} />
                </Card>
              </Theme>
              <YStack alignItems="center" gap="$2">
                <Text fontSize={18} fontWeight="600" textAlign="center">
                  No positions found
                </Text>
                <Paragraph textAlign="center" color="$gray11">
                  Try adjusting your search or filters to find more opportunities
                </Paragraph>
              </YStack>
              <Button theme="blue" onPress={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </Card>
          )}
        </YStack>
      </StyledStack>

      {/* Filter Sheet */}
      <Sheet
        modal
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        snapPoints={[40]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4">
          <Sheet.Handle />
          <YStack gap="$4">
            <H2>Filters</H2>
            {/* Add your filter options here */}
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </ScrollView>
  );
}