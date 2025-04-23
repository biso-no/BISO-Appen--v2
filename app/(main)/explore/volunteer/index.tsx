import React, { useCallback } from "react";
import { useRouter } from "expo-router";
import { MotiView } from 'moti';
import { ActivityIndicator, useColorScheme, useWindowDimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { 
  Text, 
  YStack, 
  XStack,
  useTheme, 
  Card, 
  Stack, 
  Button,
  H1,
  Paragraph,
  Input,
  Circle,
  Theme,
} from "tamagui";
import { LinearGradient } from 'tamagui/linear-gradient';
import { 
  Search, 
  Briefcase, 
  Filter,
  Rocket,
  Sparkles,
  Zap,
} from "@tamagui/lucide-icons";

import { useCampus } from "@/lib/hooks/useCampus";
import { useVolunteerJobs } from "@/lib/hooks/useVolunteerJobs";
import { useVolunteerStore } from "@/lib/stores/volunteerStore";
import { JobCard } from "@/components/volunteer/JobCard";
import { CategoryFilter } from "@/components/volunteer/CategoryFilter";
import { FilterSheet } from "@/components/volunteer/FilterSheet";
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';

// Maximum visible items for categories and interests
const MAX_VISIBLE_CATEGORIES = 5;
const MAX_VISIBLE_INTERESTS = 5;

export default function VolunteerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { campus } = useCampus();
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();

  // Get state and actions from Zustand store
  const {
    filters,
    categories,
    interests,
    showAllCategories,
    showAllInterests,
    showAllCategoriesInSheet,
    isFilterOpen,
    isLoading,
    error,
    setFilters,
    resetFilters,
    toggleShowAllCategories,
    toggleShowAllInterests,
    toggleShowAllCategoriesInSheet,
    toggleFilterSheet,
    getFilteredJobs
  } = useVolunteerStore();
  const { t } = useTranslation();
  // Destructure filters
  const { searchQuery, selectedCategory, selectedInterests } = filters;
  
  // Use our custom hook for fetching jobs with React Query
  const { 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    refetch 
  } = useVolunteerJobs(campus?.name);
  
  // Get filtered jobs from the store
  const filteredJobs = getFilteredJobs();
  
  // Handle job card press
  const handleJobPress = useCallback((jobId: string) => {
    router.push(`/explore/volunteer/${jobId}`);
  }, [router]);
  
  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: string) => {
    setFilters({ selectedCategory: categoryId });
  }, [setFilters]);
  
  // Handle interest toggle
  const handleInterestToggle = useCallback((interest: string) => {
    setFilters({
      selectedInterests: selectedInterests.includes(interest)
        ? selectedInterests.filter(i => i !== interest)
        : [...selectedInterests, interest]
    });
  }, [selectedInterests, setFilters]);
  
  // Handle search input change
  const handleSearchChange = useCallback((text: string) => {
    setFilters({ searchQuery: text });
  }, [setFilters]);
  
  // Handle reaching end of list
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
      <Text color="$blue10" fontWeight="600">{t('loading-opportunities')}</Text>
    </YStack>
  );

  // Empty list component
  const EmptyListComponent = () => (
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
        marginTop="$6"
      >
        <Theme name="blue">
          <Circle size="$8" backgroundColor="$blue3">
            <Briefcase size={32} color={theme.blue9?.val} />
          </Circle>
        </Theme>
        
        <YStack alignItems="center" gap="$2">
          <Text fontSize="$5" fontWeight="700" textAlign="center">
            {t('no-positions-found')}
          </Text>
          <Paragraph textAlign="center" color="$gray11" maxWidth={width * 0.7}>
            {t('try-adjusting-your-search-or-filters-to-find-more-opportunities')}
          </Paragraph>
        </YStack>
        
        <Button 
          theme="blue" 
          onPress={resetFilters}
          size="$4"
          borderRadius="$6"
        >
          {t('clear-filters')}
        </Button>
      </Card>
    </MotiView>
  );
  
  // Error component
  const ErrorComponent = () => (
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
          {error || t('an-error-occurred-while-loading-opportunities')}
        </Text>
        <Button 
          onPress={() => refetch()} 
          theme="red"
          size="$4"
          borderRadius="$6"
        >
          {t('common.retry')}
        </Button>
      </Card>
    </MotiView>
  );
  
  // List header component
  const ListHeaderComponent = useCallback(() => (
    <YStack>
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
                  {t('volunteer-opportunities-0')}
                </Text>
                <H1 
                  color="white" 
                  size="$10" 
                  fontWeight="900"
                  letterSpacing={-1}
                  lineHeight="$10"
                >
                  {t('make-an-impact')}
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
                {t('join-biso-and-create-positive-change-on-campus-through-meaningful-opportunities')}
              </Paragraph>
            </MotiView>
          </YStack>
        </Stack>
      </MotiView>
      
      {/* Category Filter */}
      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          showAllCategories={showAllCategories}
          onToggleShowAll={() => toggleShowAllCategories()}
          maxVisible={MAX_VISIBLE_CATEGORIES}
        />
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
                placeholder={t('search-positions')}
                borderWidth={0}
                backgroundColor="transparent"
                value={searchQuery}
                onChangeText={handleSearchChange}
                fontSize="$4"
              />
              <Button
                icon={Filter}
                circular
                backgroundColor="$backgroundHover"
                onPress={() => toggleFilterSheet(true)}
              />
            </XStack>
          </Card>
        </Stack>
      </MotiView>
      
      {/* List Title */}
      {!isLoading && !error && filteredJobs.length > 0 && (
        <YStack padding="$4" paddingTop="$2" paddingBottom="$1">
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 500 }}
            >
            <Text fontSize="$5" fontWeight="700" color="$color">
                {selectedCategory === 'all' ? t('all-opportunities') : t('categories-find-c-greater-than-c-id-selectedcategory-name-positions')}
              </Text>
            </MotiView>
              </YStack>
            )}
          </YStack>
  ), [
    colorScheme, 
    width, 
    categories, 
    selectedCategory, 
    handleCategorySelect, 
    showAllCategories, 
    toggleShowAllCategories,
    searchQuery,
    handleSearchChange,
    toggleFilterSheet,
    isLoading,
    error,
    filteredJobs.length,
    theme
  ]);
  
  // List footer component with loading indicator
  const ListFooterComponent = useCallback(() => (
    isFetchingNextPage ? (
      <YStack alignItems="center" padding="$4">
        <ActivityIndicator color={theme.blue10?.val || '#007AFF'} />
              </YStack>
    ) : null
  ), [isFetchingNextPage, theme]);
  
  // Render item function for FlashList
  const renderItem = useCallback(({ item, index }: { item: any, index: number }) => (
    <YStack key={item.id} paddingHorizontal="$4">
      <JobCard
        job={item}
        index={index}
        onPress={() => handleJobPress(item.id)}
      />
    </YStack>
  ), [handleJobPress]);
              
              return (
    <Stack 
      flex={1} 
      backgroundColor={theme.background?.val}
    >
      {isLoading ? (
        <LoadingAnimation />
      ) : (
        <FlashList
          data={filteredJobs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          estimatedItemSize={350}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={error ? ErrorComponent : EmptyListComponent}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{
            paddingBottom: 100 // Add padding at the bottom for the tab bar
          }}
          refreshing={false}
          onRefresh={refetch}
        />
      )}
      
      {/* Filter Sheet */}
      <FilterSheet
        isOpen={isFilterOpen}
        onOpenChange={toggleFilterSheet}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        interests={interests}
        selectedInterests={selectedInterests}
        onToggleInterest={handleInterestToggle}
        showAllCategories={showAllCategoriesInSheet}
        onToggleShowAllCategories={() => toggleShowAllCategoriesInSheet()}
        showAllInterests={showAllInterests}
        onToggleShowAllInterests={() => toggleShowAllInterests()}
        onClearFilters={resetFilters}
        maxVisibleCategories={MAX_VISIBLE_CATEGORIES}
        maxVisibleInterests={MAX_VISIBLE_INTERESTS}
      />
    </Stack>
  );
}