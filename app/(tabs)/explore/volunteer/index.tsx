import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  H3,
  Paragraph,
  Input,
  Sheet,
  Theme,
  SizableText,
  Separator,
  Stack,
  styled,
  RadioGroup,
  Label,
  Switch,
} from "tamagui";
import { 
  Search, 
  Briefcase, 
  MapPin,
  Calendar,
  Filter,
  Star,
  ChevronRight,
  BookmarkPlus,
  BookmarkCheck,
} from "@tamagui/lucide-icons";
import { useCampus } from "@/lib/hooks/useCampus";
import { useSavedJobs } from "@/lib/hooks/useSavedJobs";
import { JobPosition, JOB_CATEGORIES, JobCategory } from "@/types/job";

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
  job: JobPosition;
  onPress: () => void;
  index: number;
}

function JobCard({ job, onPress, index }: JobCardProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { saveJob, unsaveJob, isJobSaved } = useSavedJobs();
  const [isSaving, setIsSaving] = useState(false);
  const saved = isJobSaved(job.id);

  const handleSaveToggle = async () => {
    try {
      setIsSaving(true);
      if (saved) {
        await unsaveJob(job.id);
      } else {
        await saveJob(job);
      }
    } catch (error) {
      console.error('Failed to toggle save status:', error);
    } finally {
      setIsSaving(false);
    }
  };

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
            <Theme name={saved ? "blue" : "gray"}>
              <Button 
                size="$3" 
                icon={saved ? BookmarkCheck : BookmarkPlus}
                chromeless
                backgroundColor={saved ? "$blue2" : "$gray2"}
                hoverStyle={{ backgroundColor: saved ? '$blue3' : '$gray3' }}
                onPress={handleSaveToggle}
                disabled={isSaving}
              >
                {saved ? "Saved" : "Save for Later"}
              </Button>
            </Theme>
          </XStack>
        </YStack>
      </Card>
    </MotiView>
  );
}

export default function VolunteerScreen() {
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  
  const theme = useTheme();
  const { campus } = useCampus();
  const router = useRouter();
  const { savedJobs, isLoading: isSavedJobsLoading } = useSavedJobs();

  // Extract unique categories from jobs
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    categories.add("All"); // Always include "All" option

    jobs.forEach(job => {
      // Extract categories from job content or title
      // This regex looks for common category indicators
      const categoryMatches = job.content.match(/Category:|Position:|Role:|Type:/gi);
      if (categoryMatches) {
        const contentAfterCategory = job.content.split(categoryMatches[0])[1];
        if (contentAfterCategory) {
          const category = contentAfterCategory.split(/[.,\n]/)[0].trim();
          if (category) {
            categories.add(category);
          }
        }
      }

      // Also check the title for common category words
      const titleWords = job.title.split(/[-–—]/);
      if (titleWords.length > 1) {
        categories.add(titleWords[0].trim());
      }
    });

    return Array.from(categories);
  }, [jobs]);

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
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || 
      job.content.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      job.title.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSaved = showSavedOnly ? savedJobs.some(saved => saved.jobId === job.id) : true;
    return matchesSearch && matchesCategory && matchesSaved;
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

        {/* Saved Jobs Section */}
        {savedJobs.length > 0 && !showSavedOnly && (
          <YStack gap="$4">
            <XStack justifyContent="space-between" alignItems="center">
              <H3 size="$6" fontWeight="600">Saved Positions</H3>
              <Button
                size="$3"
                theme="blue"
                chromeless
                onPress={() => setShowSavedOnly(true)}
              >
                View All Saved
              </Button>
            </XStack>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="$3" paddingRight="$4">
                {savedJobs.map((saved, index) => (
                  <Card
                    key={saved.jobId}
                    bordered
                    elevate
                    size="$4"
                    width={300}
                    backgroundColor="$background"
                    animation="bouncy"
                    scale={0.98}
                    hoverStyle={{ scale: 0.99 }}
                    pressStyle={{ scale: 0.96 }}
                    onPress={() => router.push(`/explore/volunteer/${saved.jobId}`)}
                  >
                    <YStack padding="$4" gap="$2">
                      <XStack gap="$2" alignItems="center">
                        <Theme name="blue">
                          <Card 
                            bordered 
                            size="$2" 
                            padding="$2"
                            backgroundColor="$blue2"
                          >
                            <BookmarkCheck size={16} color={theme.blue10?.val} />
                          </Card>
                        </Theme>
                        <SizableText size="$4" fontWeight="600" numberOfLines={2} flex={1}>
                          {saved.title}
                        </SizableText>
                      </XStack>
                      <XStack flexWrap="wrap" gap="$1">
                        {saved.campus?.map((campus: string) => (
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
                      <SizableText size="$2" color="$gray11">
                        Saved {new Date(saved.savedAt).toLocaleDateString()}
                      </SizableText>
                    </YStack>
                  </Card>
                ))}
              </XStack>
            </ScrollView>
          </YStack>
        )}

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
          {showSavedOnly && (
            <XStack justifyContent="space-between" alignItems="center">
              <H3 size="$6" fontWeight="600">Saved Positions</H3>
              <Button
                size="$3"
                theme="gray"
                chromeless
                onPress={() => setShowSavedOnly(false)}
              >
                Show All Positions
              </Button>
            </XStack>
          )}
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
              <Button theme="blue" onPress={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}>
                Clear Filters
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
        snapPoints={[85]}
        dismissOnSnapToBottom
        zIndex={100_000}
        animation="medium"
      >
        <Sheet.Overlay 
          animation="lazy" 
          enterStyle={{ opacity: 0 }} 
          exitStyle={{ opacity: 0 }} 
        />
        <Sheet.Handle />
        <Sheet.Frame padding="$4" justifyContent="center" gap="$5">
          <H2>Filters</H2>
          
          {/* Saved Jobs Filter */}
          <YStack gap="$2">
            <Label>Saved Positions</Label>
            <XStack alignItems="center" gap="$2">
              <Switch
                checked={showSavedOnly}
                onCheckedChange={setShowSavedOnly}
                size="$3"
              >
                <Switch.Thumb animation="bouncy" />
              </Switch>
              <SizableText>Show saved positions only</SizableText>
            </XStack>
          </YStack>

          <Separator />

          {/* Category Filter */}
          {availableCategories.length > 1 && (
            <YStack gap="$2">
              <Label>Category</Label>
              <RadioGroup
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <YStack width={300} gap="$2">
                  {availableCategories.map((category) => (
                    <XStack key={category} alignItems="center" gap="$2">
                      <RadioGroup.Item value={category} id={category} size="$4">
                        <RadioGroup.Indicator />
                      </RadioGroup.Item>
                      <Label htmlFor={category}>{category}</Label>
                    </XStack>
                  ))}
                </YStack>
              </RadioGroup>
            </YStack>
          )}
        </Sheet.Frame>
      </Sheet>
    </ScrollView>
  );
}