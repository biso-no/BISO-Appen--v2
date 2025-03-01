import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { MotiView } from 'moti';
import RenderHTML from "react-native-render-html";
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, useWindowDimensions, RefreshControl } from 'react-native';
import { 
  Text, 
  YStack, 
  XStack,
  useTheme, 
  Card, 
  ScrollView, 
  Button,
  H1,
  H2,
  Paragraph,
  Input,
  Sheet,
  Theme,
  SizableText,
  Separator,
  Stack,
  styled,
  Image,
  Circle,
} from "tamagui";
import { LinearGradient } from 'tamagui/linear-gradient';
import { 
  Search, 
  Briefcase, 
  MapPin,
  Calendar,
  Filter,
  Star,
  ChevronRight,
  Heart,
  Clock,
  Users,
  Sparkles,
  Rocket,
  Zap,
  ChevronDown,
  ChevronUp
} from "@tamagui/lucide-icons";
import { useCampus } from "@/lib/hooks/useCampus";
import { Models } from "react-native-appwrite";
import { useColorScheme } from "react-native";

const ITEMS_PER_PAGE = 15;

// Categories for volunteer positions
const defaultCategories = [
  { id: 'all', name: 'All', icon: Users, color: 'blue' },
  { id: 'leadership', name: 'Leadership', icon: Rocket, color: 'purple' },
  { id: 'events', name: 'Events', icon: Calendar, color: 'orange' },
  { id: 'marketing', name: 'Marketing', icon: Sparkles, color: 'pink' },
  { id: 'tech', name: 'Tech', icon: Zap, color: 'green' },
];

interface JobCardProps {
  job: Models.Document;
  onPress: () => void;
  index: number;
}

function JobCard({ job, onPress, index }: JobCardProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  
  // Generate a random color from a predefined set for each job
  const colors = ['blue', 'purple', 'orange', 'pink', 'green', 'yellow'];
  
  // Fix for job.id.charCodeAt - ensure we have a string and use a fallback if needed
  const getColorIndex = () => {
    // If job.id exists and is a string, use it
    if (typeof job.id === 'string' && job.id.length > 0) {
      return job.id.charCodeAt(0) % colors.length;
    }
    // If job.id is a number, use it directly
    else if (typeof job.id === 'number') {
      return job.id % colors.length;
    }
    // Otherwise use the index or a fallback
    return (index || 0) % colors.length;
  };
  
  const jobColor = colors[getColorIndex()];
  
  const getCardBorderColor = () => {
    return colorScheme === 'dark' 
      ? `$${jobColor}6` 
      : `$${jobColor}4`;
  };
  
  const getCardBackgroundColor = () => {
    return colorScheme === 'dark' 
      ? `$${jobColor}1` 
      : `$${jobColor}1`;
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95, translateY: 15 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{
        type: 'spring',
        delay: index * 80,
        damping: 15,
        mass: 0.8,
      }}
    >
      <Button
        unstyled
        onPress={onPress}
        pressStyle={{ scale: 0.98 }}
      >
        <Card
          bordered
          animation="bouncy"
          borderColor={getCardBorderColor()}
          backgroundColor={getCardBackgroundColor()}
          borderRadius="$6"
          overflow="hidden"
        >
          <YStack padding="$4" gap="$3">
            {/* Top section with title and icon */}
            <XStack gap="$3" alignItems="center" justifyContent="space-between">
              <YStack flex={1} gap="$1">
                <SizableText 
                  size="$5" 
                  fontWeight="800" 
                  numberOfLines={2} 
                  color={colorScheme === 'dark' ? `$${jobColor}11` : '$color'}
                >
                  {job.title}
                </SizableText>
                
                {/* Campus tags */}
                <XStack flexWrap="wrap" gap="$2" marginTop="$1">
                  {job.campus?.map((campus: string) => (
                    <Theme name={jobColor} key={campus}>
                      <Button
                        size="$2"
                        borderRadius="$10"
                        backgroundColor={colorScheme === 'dark' ? `$${jobColor}2` : `$${jobColor}3`}
                        borderColor={colorScheme === 'dark' ? `$${jobColor}4` : `$${jobColor}5`}
                        borderWidth={1}
                        paddingHorizontal="$2"
                        icon={MapPin}
                        iconAfter={null}
                      >
                        <Text 
                          fontSize="$2" 
                          color={colorScheme === 'dark' ? `$${jobColor}11` : `$${jobColor}11`} 
                          fontWeight="500"
                        >
                          {campus}
                        </Text>
                      </Button>
                    </Theme>
                  ))}
                </XStack>
              </YStack>
              
              <Theme name={jobColor}>
                <Circle 
                  size="$4" 
                  backgroundColor={colorScheme === 'dark' ? `$${jobColor}3` : `$${jobColor}4`}
                >
                  <Briefcase 
                    size={20} 
                    color={colorScheme === 'dark' ? theme[`${jobColor}11`]?.val : theme[`${jobColor}10`]?.val} 
                  />
                </Circle>
              </Theme>
            </XStack>
            
            {/* Job description preview */}
            {job.content && (
              <YStack 
                backgroundColor={colorScheme === 'dark' ? `$${jobColor}2` : `$${jobColor}1`}
                padding="$3" 
                borderRadius="$4"
                borderColor={colorScheme === 'dark' ? `$${jobColor}4` : `$${jobColor}3`}
                borderWidth={1}
              >
                <RenderHTML
                  source={{ html: job.content.split('</p>')[0].replace(/<\/?[^>]+(>|$)/g, '') }}
                  contentWidth={width - 64}
                  baseStyle={{
                    color: colorScheme === 'dark' ? theme[`${jobColor}11`]?.val : theme.color?.val,
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                />
              </YStack>
            )}
            
            {/* Bottom section with deadline and actions */}
            <XStack justifyContent="space-between" alignItems="center" marginTop="$1">
              {job.expiry_date ? (
                <XStack gap="$2" alignItems="center">
                  <Clock 
                    size={14} 
                    color={colorScheme === 'dark' ? theme[`${jobColor}10`]?.val : theme[`${jobColor}9`]?.val} 
                  />
                  <SizableText 
                    size="$3" 
                    color={colorScheme === 'dark' ? `$${jobColor}11` : `$${jobColor}11`} 
                    fontWeight="500"
                  >
                    Deadline: {new Date(job.expiry_date).toLocaleDateString()}
                  </SizableText>
                </XStack>
              ) : (
                <XStack gap="$2" alignItems="center">
                  <Zap 
                    size={14} 
                    color={colorScheme === 'dark' ? theme[`${jobColor}10`]?.val : theme[`${jobColor}9`]?.val} 
                  />
                  <SizableText 
                    size="$3" 
                    color={colorScheme === 'dark' ? `$${jobColor}11` : `$${jobColor}11`} 
                    fontWeight="500"
                  >
                    Open position
                  </SizableText>
                </XStack>
              )}
              
              <Theme name={jobColor}>
                <Button
                  size="$3"
                  borderRadius="$10"
                  backgroundColor={colorScheme === 'dark' ? `$${jobColor}4` : `$${jobColor}5`}
                  pressStyle={{ 
                    scale: 0.95, 
                    backgroundColor: colorScheme === 'dark' ? `$${jobColor}5` : `$${jobColor}6` 
                  }}
                  icon={ChevronRight}
                >
                  <Text 
                    color={colorScheme === 'dark' ? `$${jobColor}11` : `$${jobColor}12`} 
                    fontWeight="600"
                  >
                    View
                  </Text>
                </Button>
              </Theme>
            </XStack>
          </YStack>
        </Card>
      </Button>
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllInterests, setShowAllInterests] = useState(false);
  const [showAllCategoriesInSheet, setShowAllCategoriesInSheet] = useState(false);

  const MAX_VISIBLE_CATEGORIES = 5;
  const MAX_VISIBLE_INTERESTS = 5;

  const [categories, setCategories] = useState<Array<{id: string, name: string, icon: any, color: string}>>(defaultCategories);
  const [interests, setInterests] = useState<Array<string>>([]);
  const [selectedInterests, setSelectedInterests] = useState<Array<string>>([]);
  
  const theme = useTheme();
  const { campus } = useCampus();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();

  const fetchJobs = useCallback(async (pageNumber: number, isInitial: boolean = false) => {
    try {
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const apiUrl = `https://biso.no/wp-json/custom/v1/jobs/?includeExpired=true&per_page=${ITEMS_PER_PAGE}&page=${pageNumber}&campus=${campus?.name}`;
      console.log("Fetching jobs from:", apiUrl);
      
      const response = await axios.get(apiUrl);
      console.log("Jobs API response:", response.status, response.statusText);
      console.log("Jobs data count:", response.data?.length || 0);
      
      // Check if response.data is an array
      if (!Array.isArray(response.data)) {
        console.error("API response is not an array:", response.data);
        setError("Invalid API response format");
        return;
      }
      
      const newJobs = response.data;
      
      // Log some sample job data to help debug
      if (newJobs.length > 0) {
        console.log("Sample job data:", {
          id: newJobs[0].id,
          title: newJobs[0].title,
          type: newJobs[0].type,
          interests: newJobs[0].interests,
          campus: newJobs[0].campus
        });
      }
      
      if (isInitial) {
        setJobs(newJobs);
        // Extract categories and interests from the new jobs data
        extractCategoriesAndInterests(newJobs);
      } else {
        setJobs(prevJobs => {
          const combinedJobs = [...prevJobs, ...newJobs];
          // Extract categories and interests from the combined jobs data
          extractCategoriesAndInterests(combinedJobs);
          return combinedJobs;
        });
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
      setRefreshing(false);
    }
  }, [campus]);

  useEffect(() => {
    setPage(1);
    setJobs([]);
    setHasMore(true);
    fetchJobs(1, true);
  }, [campus, fetchJobs]);

  // Add this right after the fetchJobs implementation to extract unique types and interests
  const extractCategoriesAndInterests = useCallback((jobData: Models.Document[]) => {
    if (!jobData || jobData.length === 0) return;
    
    console.log("Extracting categories and interests from", jobData.length, "jobs");
    
    // Extract types (categories) with frequency count
    const typesCount: Record<string, number> = {};
    jobData.forEach(job => {
      if (job.type && Array.isArray(job.type)) {
        job.type.forEach(type => {
          typesCount[type] = (typesCount[type] || 0) + 1;
        });
      }
    });
  
    // Extract unique interests
    const uniqueInterests = new Set<string>();
    jobData.forEach(job => {
      if (job.interests && Array.isArray(job.interests)) {
        job.interests.forEach(interest => uniqueInterests.add(interest));
      }
    });

    const interestsCount: Record<string, number> = {};
    jobData.forEach(job => {
      if (job.interests && Array.isArray(job.interests)) {
        job.interests.forEach(interest => {
          interestsCount[interest] = (interestsCount[interest] || 0) + 1;
        });
      }
    });

    const sortedTypes = Object.keys(typesCount).sort((a, b) => typesCount[b] - typesCount[a]);
    const sortedInterests = Object.keys(interestsCount).sort((a, b) => interestsCount[b] - interestsCount[a]);
    
    // Map types to category objects with icons
    const icons = [Users, Rocket, Calendar, Sparkles, Zap, Briefcase, Heart, Star];
    const colors = ['blue', 'purple', 'orange', 'pink', 'green', 'yellow', 'red', 'cyan'];
    
    const typeCategories = sortedTypes.map((type, index) => ({
      id: type.toLowerCase(),
      name: type,
      icon: icons[index % icons.length],
      color: colors[index % colors.length],
      frequency: typesCount[type]
    }));
    
    // Add "All" category at the beginning
    typeCategories.unshift({
      id: 'all',
      name: 'All',
      icon: Users,
      color: 'blue',
      frequency: jobData.length
    });
    
    console.log("Setting categories:", typeCategories.length, "categories");
    console.log("Setting interests:", uniqueInterests.size, "interests");
    
    setCategories(typeCategories.length > 1 ? typeCategories : defaultCategories);
    setInterests(Array.from(uniqueInterests));
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isLoadingMore || !hasMore) return;

    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const scrollPosition = (contentOffset.y + layoutMeasurement.height) / contentSize.height;

    if (scrollPosition > 0.8) {
      setPage(prevPage => prevPage + 1);
      fetchJobs(page + 1);
    }
  }, [isLoadingMore, hasMore, page, fetchJobs]);

  // Define colors array for use in the component
  const colors = ['blue', 'purple', 'orange', 'pink', 'green', 'yellow', 'red', 'cyan'];
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchJobs(1, true);
  }, [fetchJobs]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check if job matches selected category (type)
    const matchesCategory = selectedCategory === "all" || 
      (job.type && Array.isArray(job.type) && 
        job.type.some(type => type.toLowerCase() === selectedCategory.toLowerCase()));
    
    // Check if job matches selected interests (if any are selected)
    const matchesInterests = selectedInterests.length === 0 ||
      (job.interests && Array.isArray(job.interests) &&
        selectedInterests.some(interest => 
          job.interests.some((jobInterest: string) => 
            jobInterest.toLowerCase() === interest.toLowerCase()
          )
        ));
    
    return matchesSearch && matchesCategory && matchesInterests;
  });

  // Loading animation component
  const LoadingAnimation = () => (
    <YStack alignItems="center" justifyContent="center" padding="$8" gap="$4">
      <MotiView
        from={{ scale: 0.8, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'timing',
          duration: 1000,
          loop: true,
        }}
      >
        <Theme name="blue">
          <Circle size="$10" backgroundColor="$blue4">
            <Briefcase size={32} color={theme.blue10?.val} />
          </Circle>
        </Theme>
      </MotiView>
      <Text color="$blue10" fontWeight="600">Loading opportunities...</Text>
    </YStack>
  );

  return (
    <ScrollView 
      onScroll={handleScroll} 
      scrollEventThrottle={16}
      style={{ flex: 1, backgroundColor: theme.background?.val }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{
        paddingBottom: 100 // Add padding at the bottom for the tab bar
      }}
    >
      {/* Hero Section */}
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600 }}
      >
        <Stack
          paddingTop="$6"
          paddingBottom="$10"
          paddingHorizontal="$5"
          borderBottomLeftRadius="$10"
          borderBottomRightRadius="$10"
          overflow="hidden"
          position="relative"
        >
          {/* Full-size gradient background */}
          <Stack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor={colorScheme === 'dark' ? '$purple9' : '$blue8'}
          >
            <LinearGradient
              colors={colorScheme === 'dark' ? 
                ['$purple9', '$blue8', '$purple7'] : 
                ['$blue8', '$purple8', '$pink8']}
              start={[0, 0]}
              end={[1, 1]}
              width="100%"
              height="100%"
            />
          </Stack>
          
          {/* Decorative elements */}
          <MotiView
            from={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.8, scale: 1 }}
            transition={{ type: 'spring', delay: 100, damping: 15 }}
            style={{ position: 'absolute', right: 20, top: 20 }}
          >
            <Circle size="$6" backgroundColor="rgba(255,255,255,0.15)">
              <Rocket size={20} color="white" />
            </Circle>
          </MotiView>
          
          <MotiView
            from={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ type: 'spring', delay: 150, damping: 15 }}
            style={{ position: 'absolute', left: 30, bottom: 30 }}
          >
            <Circle size="$5" backgroundColor="rgba(255,255,255,0.1)">
              <Sparkles size={16} color="white" />
            </Circle>
          </MotiView>
          
          <MotiView
            from={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ type: 'spring', delay: 200, damping: 15 }}
            style={{ position: 'absolute', right: 80, bottom: 50 }}
          >
            <Circle size="$4" backgroundColor="rgba(255,255,255,0.12)">
              <Zap size={14} color="white" />
            </Circle>
          </MotiView>
          
          {/* Content */}
          <YStack gap="$4" paddingTop="$2" zIndex={1}>
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', delay: 200 }}
            >
              <YStack>
                <Text 
                  color="rgba(255,255,255,0.9)" 
                  fontSize="$5" 
                  fontWeight="600"
                  letterSpacing={1}
                >
                  VOLUNTEER OPPORTUNITIES
                </Text>
                <H1 
                  color="white" 
                  size="$10" 
                  fontWeight="900"
                  letterSpacing={-1}
                  lineHeight="$10"
                >
                  Make an Impact
                </H1>
              </YStack>
            </MotiView>
            
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', delay: 300 }}
            >
              <Paragraph 
                color="rgba(255,255,255,0.9)" 
                size="$5" 
                maxWidth={width * 0.85}
                lineHeight="$6"
              >
                Join BISO and create positive change on campus through meaningful opportunities
              </Paragraph>
            </MotiView>
            
          </YStack>
        </Stack>
      </MotiView>
      
      {/* Category Pills */}
      {categories.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 400 }}
        >
          <YStack padding="$4" paddingTop="$5" gap="$3">
            <XStack flexWrap="wrap" gap="$2" justifyContent="center">
              {categories
                .slice(0, showAllCategories ? categories.length : MAX_VISIBLE_CATEGORIES)
                .map((category, index) => (
                  <Button
                    key={category.id}
                    size="$3"
                    theme={category.color}
                    borderRadius="$10"
                    backgroundColor={selectedCategory === category.id ? 
                      `$${category.color}5` : 
                      `$${category.color}2`
                    }
                    borderColor={selectedCategory === category.id ? 
                      `$${category.color}8` : 
                      `$${category.color}4`
                    }
                    borderWidth={1}
                    paddingHorizontal="$3"
                    icon={<category.icon size={16} />}
                    pressStyle={{ scale: 0.96 }}
                    onPress={() => setSelectedCategory(category.id)}
                    marginBottom="$2"
                  >
                    <Text 
                      color={selectedCategory === category.id ? 
                        `$${category.color}12` : 
                        `$${category.color}11`
                      }
                      fontWeight={selectedCategory === category.id ? "700" : "500"}
                    >
                      {category.name}
                    </Text>
                  </Button>
                ))}
              
              {categories.length > MAX_VISIBLE_CATEGORIES && (
                <Button
                  size="$3"
                  theme="gray"
                  borderRadius="$10"
                  backgroundColor="$gray2"
                  borderColor="$gray4"
                  borderWidth={1}
                  paddingHorizontal="$3"
                  icon={showAllCategories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  pressStyle={{ scale: 0.96 }}
                  onPress={() => setShowAllCategories(!showAllCategories)}
                  marginBottom="$2"
                >
                  <Text color="$gray11" fontWeight="500">
                    {showAllCategories ? "Show Less" : `${categories.length - MAX_VISIBLE_CATEGORIES} More`}
                  </Text>
                </Button>
              )}
            </XStack>
          </YStack>
        </MotiView>
      )}
      
      {/* Search Bar */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', delay: 500 }}
      >
        <Stack padding="$4" paddingTop="$2">
          <Card
            bordered
            borderRadius="$8"
            borderColor="$borderColor"
            backgroundColor="$background"
          >
            <XStack 
              padding="$3"
              alignItems="center"
              gap="$2"
            >
              <Search size={20} color={theme.color?.val} opacity={0.7} />
              <Input
                flex={1}
                placeholder="Search positions..."
                borderWidth={0}
                backgroundColor="transparent"
                value={searchQuery}
                onChangeText={setSearchQuery}
                fontSize="$4"
              />
              <Button
                icon={Filter}
                circular
                backgroundColor="$backgroundHover"
                onPress={() => setIsFilterOpen(true)}
              />
            </XStack>
          </Card>
        </Stack>
      </MotiView>
      
      {/* Job List */}
      <Stack padding="$4" paddingTop="$2">
        {initialLoading ? (
          <LoadingAnimation />
        ) : error ? (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <Card 
              bordered 
              borderRadius="$6" 
              padding="$5" 
              alignItems="center" 
              gap="$4"
              backgroundColor="$red2"
              borderColor="$red5"
            >
              <Text color="$red10" fontSize={16} textAlign="center" fontWeight="600">
                {error}
              </Text>
              <Button 
                onPress={() => fetchJobs(1, true)} 
                theme="red"
                size="$4"
                borderRadius="$6"
              >
                Retry
              </Button>
            </Card>
          </MotiView>
        ) : filteredJobs.length > 0 ? (
          <YStack gap="$4">
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 500 }}
            >
              <Text fontSize="$5" fontWeight="700" color="$color" marginBottom="$2">
                {selectedCategory === 'all' ? 'All Opportunities' : `${categories.find(c => c.id === selectedCategory)?.name} Positions`}
              </Text>
            </MotiView>
            
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
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <Card 
              bordered 
              borderRadius="$6" 
              padding="$6" 
              alignItems="center" 
              gap="$4"
              backgroundColor={colorScheme === 'dark' ? '$blue2' : '$blue1'}
              borderColor="$blue4"
            >
              <Theme name="blue">
                <Circle size="$8" backgroundColor="$blue3">
                  <Briefcase size={32} color={theme.blue9?.val} />
                </Circle>
              </Theme>
              
              <YStack alignItems="center" gap="$2">
                <Text fontSize="$5" fontWeight="700" textAlign="center">
                  No positions found
                </Text>
                <Paragraph textAlign="center" color="$gray11" maxWidth={width * 0.7}>
                  Try adjusting your search or filters to find more opportunities
                </Paragraph>
              </YStack>
              
              <Button 
                theme="blue" 
                onPress={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                size="$4"
                borderRadius="$6"
              >
                Clear Filters
              </Button>
            </Card>
          </MotiView>
        )}
      </Stack>

      {/* Filter Sheet */}
      <Sheet
        modal
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        snapPoints={[50]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4">
  <Sheet.Handle />
  <Sheet.ScrollView>
  <YStack gap="$4">
    <H2 size="$6" fontWeight="700">Filters</H2>
    <Separator />
    
    <YStack gap="$4">
      <Text fontWeight="600">Position Type</Text>
      <XStack flexWrap="wrap" gap="$2">
        {categories
          .slice(0, showAllCategoriesInSheet ? categories.length : MAX_VISIBLE_CATEGORIES)
          .map(category => (
          <Button
            key={category.id}
            size="$3"
            theme={category.color}
            borderRadius="$6"
            backgroundColor={selectedCategory === category.id ? 
              `$${category.color}5` : 
              `$${category.color}2`
            }
            borderColor={selectedCategory === category.id ? 
              `$${category.color}8` : 
              `$${category.color}4`
            }
            borderWidth={1}
            icon={<category.icon size={16} />}
            pressStyle={{ scale: 0.96 }}
            onPress={() => {
              setSelectedCategory(category.id);
            }}
            marginBottom="$2"
          >
            {category.name}
          </Button>
        ))}
        
        {categories.length > MAX_VISIBLE_CATEGORIES && (
          <Button
            size="$3"
            theme="gray"
            borderRadius="$6"
            backgroundColor="$gray2"
            borderColor="$gray4"
            borderWidth={1}
            pressStyle={{ scale: 0.96 }}
            onPress={() => setShowAllCategoriesInSheet(!showAllCategoriesInSheet)}
            marginBottom="$2"
            icon={showAllCategoriesInSheet ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          >
            {showAllCategoriesInSheet ? "Show Less" : `${categories.length - MAX_VISIBLE_CATEGORIES} More`}
          </Button>
        )}
      </XStack>
    </YStack>
    
    {/* Add the interests filter section */}
    {interests.length > 0 && (
      <YStack gap="$4">
        <Text fontWeight="600">Interests</Text>
        <XStack flexWrap="wrap" gap="$2">
          {interests
            .slice(0, showAllInterests ? interests.length : MAX_VISIBLE_INTERESTS)
            .map((interest, index) => {
              const isSelected = selectedInterests.includes(interest);
              const color = colors[index % colors.length];
              
              return (
                <Button
                  key={interest}
                  size="$3"
                  theme={color}
                  borderRadius="$6"
                  backgroundColor={isSelected ? 
                    `$${color}5` : 
                    `$${color}2`
                  }
                  borderColor={isSelected ? 
                    `$${color}8` : 
                    `$${color}4`
                  }
                  borderWidth={1}
                  pressStyle={{ scale: 0.96 }}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedInterests(prev => prev.filter(i => i !== interest));
                    } else {
                      setSelectedInterests(prev => [...prev, interest]);
                    }
                  }}
                  marginBottom="$2"
                >
                  {interest}
                </Button>
              );
            })}
            
          {interests.length > MAX_VISIBLE_INTERESTS && (
            <Button
              size="$3"
              theme="gray"
              borderRadius="$6"
              backgroundColor="$gray2"
              borderColor="$gray4"
              borderWidth={1}
              pressStyle={{ scale: 0.96 }}
              onPress={() => setShowAllInterests(!showAllInterests)}
              marginBottom="$2"
              icon={showAllInterests ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            >
              {showAllInterests ? "Show Less" : `${interests.length - MAX_VISIBLE_INTERESTS} More`}
            </Button>
          )}
        </XStack>
      </YStack>
    )}
    
    <XStack gap="$4" marginTop="$4">
      <Button 
        theme="gray" 
        size="$4"
        flex={1}
        onPress={() => {
          setSelectedCategory("all");
          setSelectedInterests([]);
        }}
      >
        Clear Filters
      </Button>
      
      <Button 
        theme="blue" 
        size="$4"
        flex={1}
        onPress={() => setIsFilterOpen(false)}
      >
        Apply Filters
      </Button>
    </XStack>
  </YStack>
</Sheet.ScrollView>
</Sheet.Frame>
      </Sheet>
    </ScrollView>
  );
}