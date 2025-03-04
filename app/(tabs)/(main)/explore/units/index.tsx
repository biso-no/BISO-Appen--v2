import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from "expo-router";
import { Models, Query } from "react-native-appwrite";
import { 
  YStack, 
  XStack,
  H1,
  Text,
  useTheme,
  Input,
  Button,
  Stack,
  Card,
  Paragraph,
  Circle
} from "tamagui";
import { LinearGradient } from 'tamagui/linear-gradient';
import { Search, Building, School, BookOpen, GraduationCap } from "@tamagui/lucide-icons";
import { MyStack } from "@/components/ui/MyStack";
import { databases, getDepartments } from "@/lib/appwrite";
import { useCampus } from "@/lib/hooks/useCampus";
import { MotiView } from 'moti';
import { useWindowDimensions, ActivityIndicator, useColorScheme } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { debounce } from 'tamagui';

// Import our new components
import { DepartmentCard } from "@/components/departments/DepartmentCard";
import { FacultyFilter } from "@/components/departments/FacultyFilter";
import { EmptyState } from "@/components/departments/EmptyState";

export default function DepartmentsScreen() {
  const initialLoadCompleted = useRef(false);
  const [departments, setDepartments] = useState<Models.Document[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Models.Document[]>([]);
  const [faculties, setFaculties] = useState<Array<{id: string, name: string, count: number}>>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { campus } = useCampus();
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();

  // Extract faculties from departments data
  const extractFaculties = useCallback((depts: Models.Document[]) => {
    if (!depts.length) return [];
    
    const facultyCounts: Record<string, number> = { 'all': depts.length };
    
    depts.forEach(dept => {
      if (dept.faculty) {
        facultyCounts[dept.faculty] = (facultyCounts[dept.faculty] || 0) + 1;
      }
    });
    
    const result = Object.entries(facultyCounts).map(([name, count]) => ({
      id: name.toLowerCase(),
      name: name === 'all' ? 'All' : name,
      count
    }));
    
    // Ensure 'All' is first
    return result.sort((a, b) => 
      a.id === 'all' ? -1 : b.id === 'all' ? 1 : b.count - a.count
    );
  }, []);

  // Filter departments based on search and selected faculty
  const filterDepartments = useCallback(() => {
    if (!departments.length) return [];
    
    return departments.filter(dept => {
      // Filter by search
      const matchesSearch = search === '' || 
        dept.Name.toLowerCase().includes(search.toLowerCase()) ||
        (dept.description && dept.description.toLowerCase().includes(search.toLowerCase()));
      
      // Filter by faculty
      const matchesFaculty = selectedFaculty === 'all' || 
        (dept.faculty && dept.faculty.toLowerCase() === selectedFaculty);
      
      return matchesSearch && matchesFaculty;
    });
  }, [departments, search, selectedFaculty]);

  const fetchDepartments = useCallback(async (reset = false) => {
    if ((loading && !reset) || !campus?.$id) {
      console.log("Skipping fetch: loading =", loading, "reset =", reset, "campus =", campus?.$id);
      return;
    }
    
    const currentPage = reset ? 1 : page;
    
    console.log("Fetching departments for campus:", campus?.$id, "page:", currentPage);
    setLoading(true);
    try {
      const deps = await getDepartments(campus.$id, currentPage);
      console.log(`Fetched ${deps.documents.length} departments`);
      
      if (deps.documents.length === 0) {
        setHasMore(false);
      } else {
        if (reset) {
          setDepartments(deps.documents);
          setPage(2); // Next page will be 2
        } else {
          setDepartments(prevDeps => [...prevDeps, ...deps.documents]);
          setPage(currentPage + 1);
        }
        
        // Extract faculties on initial load or reset
        if (reset || currentPage === 1) {
          const extractedFaculties = extractFaculties(deps.documents);
          console.log("Extracted faculties:", extractedFaculties);
          setFaculties(extractedFaculties);
        }
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      // Make sure we have departments to display even after an error
      if (reset && departments.length === 0) {
        setDepartments([]);
        setFaculties([{id: 'all', name: 'All', count: 0}]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [campus?.$id, page, loading, extractFaculties]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setHasMore(true);
    fetchDepartments(true);
  }, [fetchDepartments]);

  // Handle faculty selection
  const handleFacultySelect = useCallback((facultyId: string) => {
    setSelectedFaculty(facultyId);
  }, []);

  // Handle search change
  const handleSearchChange = useCallback((text: string) => {
    setSearch(text);
  }, []);

  // Handle search submit - search in Appwrite
  const handleSearchSubmit = useCallback(async () => {
    if (!search || !campus?.$id) return;
    
    setLoading(true);
    try {
      const deps = await databases.listDocuments('app', 'departments', [
        Query.search('Name', search),
        Query.limit(20),
      ]);
      
      setDepartments(deps.documents);
      setHasMore(false);
    } catch (error) {
      console.error("Error searching departments:", error);
    } finally {
      setLoading(false);
    }
  }, [search, campus?.$id]);
  
  // Handle clearing filters
  const handleClearFilters = useCallback(() => {
    setSearch('');
    setSelectedFaculty('all');
    handleRefresh();
  }, [handleRefresh]);

  // Handle end reached
  const handleEndReached = useCallback(
    debounce(() => {
      if (!loading && hasMore) {
        fetchDepartments();
      }
    }, 300),
    [loading, hasMore, fetchDepartments]
  );
  
  // Update filtered departments when dependencies change
  React.useEffect(() => {
    setFilteredDepartments(filterDepartments());
  }, [departments, search, selectedFaculty, filterDepartments]);

  // Fix initial load
  useEffect(() => {
    // Only fetch if we have a campus ID and haven't already loaded
    if (campus?.$id && !initialLoadCompleted.current) {
      console.log("Initial departments fetch for campus:", campus?.$id);
      setPage(1);
      setDepartments([]);
      setHasMore(true);
      fetchDepartments(true);
      initialLoadCompleted.current = true;
    }
  }, [campus?.$id]); // Remove fetchDepartments from dependencies

  // Render item function for FlashList
  const renderItem = useCallback(({ item, index }: { item: Models.Document, index: number }) => (
    <DepartmentCard
      department={item}
      index={index}
      onPress={() => router.push(`/explore/units/${item.$id}`)}
    />
  ), [router]);

  // Loading indicator for footer
  const ListFooterComponent = useCallback(() => (
    loading && !refreshing ? (
      <YStack alignItems="center" padding="$4">
        <ActivityIndicator color={theme.blue10?.val || '#007AFF'} />
      </YStack>
    ) : null
  ), [loading, refreshing, theme.blue10?.val]);

  // Empty state component
  const ListEmptyComponent = useCallback(() => (
    !loading ? (
      <EmptyState 
        isFiltering={search !== '' || selectedFaculty !== 'all'}
        onClearFilters={handleClearFilters}
        onRetry={handleRefresh}
      />
    ) : null
  ), [loading, search, selectedFaculty, handleClearFilters, handleRefresh]);

  // List header component with hero section and filters
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
          paddingBottom="$8"
          paddingHorizontal="$5"
          overflow="hidden"
          position="relative"
        >
          {/* Gradient background */}
          <Stack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor={colorScheme === 'dark' ? '$blue9' : '$blue8'}
          >
            <LinearGradient
              colors={colorScheme === 'dark' ? 
                ['$blue9', '$purple8', '$blue7'] : 
                ['$blue8', '$purple8', '$blue8']}
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
              <School size={20} color="white" />
            </Circle>
          </MotiView>
          
          <MotiView
            from={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ type: 'spring', delay: 150, damping: 15 }}
            style={{ position: 'absolute', left: 30, bottom: 30 }}
          >
            <Circle size="$5" backgroundColor="rgba(255,255,255,0.1)">
              <BookOpen size={16} color="white" />
            </Circle>
          </MotiView>
          
          <MotiView
            from={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ type: 'spring', delay: 200, damping: 15 }}
            style={{ position: 'absolute', right: 80, bottom: 40 }}
          >
            <Circle size="$4" backgroundColor="rgba(255,255,255,0.12)">
              <GraduationCap size={14} color="white" />
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
                <H1 
                  color="white" 
                  size="$10" 
                  fontWeight="900"
                  letterSpacing={-1}
                  lineHeight="$10"
                >
                  Explore Units
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
                Discover the various academic departments at {campus?.name || 'BISO'} 
              </Paragraph>
            </MotiView>
          </YStack>
        </Stack>
      </MotiView>
      
      {/* Faculties Filter */}
      {faculties.length > 0 && (
        <FacultyFilter
          allFaculties={faculties}
          selectedFaculty={selectedFaculty}
          onSelectFaculty={handleFacultySelect}
        />
      )}
      
      {/* Search Bar */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', delay: 400 }}
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
                placeholder="Search departments..."
                borderWidth={0}
                backgroundColor="transparent"
                value={search}
                onChangeText={handleSearchChange}
                fontSize="$4"
                onSubmitEditing={handleSearchSubmit}
              />
              {search && (
                <Button
                  size="$3"
                  circular
                  backgroundColor="$backgroundHover"
                  onPress={() => setSearch('')}
                >
                  ✕
                </Button>
              )}
            </XStack>
          </Card>
        </Stack>
      </MotiView>
      
      {/* List Title */}
      {!loading && filteredDepartments.length > 0 && (
        <YStack padding="$4" paddingTop="$2" paddingBottom="$1">
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 500 }}
          >
            <Text fontSize="$5" fontWeight="700" color="$color">
              {selectedFaculty === 'all' 
                ? 'All Departments' 
                : `${faculties.find(f => f.id === selectedFaculty)?.name || ''} Departments`}
            </Text>
          </MotiView>
        </YStack>
      )}
    </YStack>
  ), [
    colorScheme, 
    width, 
    campus?.name, 
    faculties, 
    selectedFaculty, 
    handleFacultySelect, 
    theme.color?.val, 
    search, 
    handleSearchChange, 
    handleSearchSubmit, 
    loading, 
    filteredDepartments.length
  ]);

  return (
    <MyStack flex={1} backgroundColor={theme.background?.val}>
      {loading && departments.length === 0 ? (
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <MotiView
            from={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 1000,
              loop: true,
            }}
          >
            <Circle size="$10" backgroundColor="$blue4">
              <Building size={32} color={theme.blue10?.val} />
            </Circle>
          </MotiView>
          <Text color="$blue10" fontWeight="600">Loading departments...</Text>
          
          {/* Add reset button for stuck states */}
          <Button 
            theme="blue"
            variant="outlined"
            marginTop="$4"
            onPress={() => {
              // Reset state and force reload
              setLoading(false);
              initialLoadCompleted.current = false;
              setDepartments([]);
              if (campus?.$id) {
                // Reset and reload
                fetchDepartments(true);
                initialLoadCompleted.current = true;
              }
            }}
          >
            Reset
          </Button>
        </YStack>
      ) : (
        <FlashList
          data={filteredDepartments}
          renderItem={renderItem}
          keyExtractor={item => item.$id}
          estimatedItemSize={180}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={ListEmptyComponent}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 100 // Add padding at the bottom for the tab bar
          }}
        />
      )}
    </MyStack>
  );
}
