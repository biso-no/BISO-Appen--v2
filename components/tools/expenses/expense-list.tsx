import { Card, Paragraph, Text, View, XStack, YStack, Button, Separator, useTheme } from "tamagui";
import { getFormattedDateFromString } from "@/lib/format-time";
import { ExpenseFilter } from "./filter";
import { CustomSelect } from "@/components/ui/select";
import { useEffect, useState, useMemo, useCallback, memo, useRef } from "react";
import { getDocuments, getExpensesDepartments } from "@/lib/appwrite";
import { Models } from "react-native-appwrite";
import { ArrowUpDown, Clock, Filter, Plus, RefreshCw, Wallet } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Animated, FlatList, RefreshControl, useColorScheme } from "react-native";
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { BlurView } from 'expo-blur';
import { useWindowDimensions } from 'react-native';
import { create } from 'zustand';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Define expense status colors and icons
interface StatusStyle {
  color: string;
  background: string;
  borderColor: string;
  icon: React.ComponentType<any> | null;
}

interface StatusStyles {
  pending: StatusStyle;
  success: StatusStyle;
  submitted: StatusStyle;
  [key: string]: StatusStyle | undefined;
}

const STATUS_STYLES: StatusStyles = {
  pending: {
    color: '#f59e0b', // Amber
    background: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    icon: Clock
  },
  success: {
    color: '#10b981', // Emerald
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    icon: null
  },
  submitted: {
    color: '#3b82f6', // Blue
    background: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    icon: null
  }
};

// Create a zustand store for the expense list state
interface ExpenseListStore {
  isFilterVisible: boolean;
  toggleFilter: () => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  sortingOption: string;
  setSortingOption: (option: string) => void;
}

const useExpenseListStore = create<ExpenseListStore>((set) => ({
  isFilterVisible: false,
  toggleFilter: () => set((state: ExpenseListStore) => ({ isFilterVisible: !state.isFilterVisible })),
  selectedStatus: "all",
  setSelectedStatus: (status: string) => set({ selectedStatus: status }),
  selectedDepartment: "all",
  setSelectedDepartment: (department: string) => set({ selectedDepartment: department }),
  sortingOption: "Date Descending",
  setSortingOption: (option: string) => set({ sortingOption: option }),
}));

// Enhanced StatusBadge with icon and animation
const StatusBadge = memo(({ status }: { status: string }) => {
  const lowerStatus = status.toLowerCase();
  const style = STATUS_STYLES[lowerStatus] || {
    color: '#6b7280',
    background: 'rgba(107, 114, 128, 0.15)',
    borderColor: 'rgba(107, 114, 128, 0.3)',
    icon: null
  };
  
  const StatusIcon = style.icon;
  
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <XStack
        backgroundColor={style.background}
        borderColor={style.borderColor}
        borderWidth={1}
        paddingVertical={6}
        paddingHorizontal={12}
        borderRadius={20}
        alignItems="center"
        gap="$1"
      >
        {StatusIcon && <StatusIcon size={14} color={style.color} />}
        <Text color={style.color} fontWeight="600" fontSize={14}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </XStack>
    </MotiView>
  );
});
StatusBadge.displayName = 'StatusBadge';

// Enhanced skeleton loader for expense cards
const ExpenseCardSkeleton = memo(({ delay = 0 }: { delay?: number }) => {
  const colorScheme = useColorScheme();
  const baseColor = colorScheme === 'dark' ? '#333' : '#f0f0f0';
  const theme = useTheme();
  
  return (
    <MotiView
      from={{ opacity: 0.6, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: 300,
        delay,
      }}
    >
      <Card width="100%" padding="$4" marginBottom="$3">
        <YStack gap="$3">
          <MotiView
            from={{ opacity: 0.5 }}
            animate={{ opacity: 0.8 }}
            transition={{
              type: 'timing',
              duration: 1000,
              loop: true,
              repeatReverse: true,
              delay,
            }}
          >
            <YStack gap="$3">
              <View height={30} width="70%" backgroundColor={baseColor} borderRadius="$2" />
              <View height={25} width="40%" backgroundColor={baseColor} borderRadius="$2" />
              <XStack justifyContent="space-between" marginTop="$2">
                <View height={16} width="30%" backgroundColor={baseColor} borderRadius="$2" />
                <View height={24} width="25%" backgroundColor={baseColor} borderRadius="$pill" />
              </XStack>
            </YStack>
          </MotiView>
        </YStack>
      </Card>
    </MotiView>
  );
});
ExpenseCardSkeleton.displayName = 'ExpenseCardSkeleton';

// Enhanced expense card with animations
const ExpenseCard = memo(({ expense, onPress, index = 0 }: { expense: Models.Document, onPress: () => void, index?: number }) => {
  const { description, total, $createdAt: created_at, status, department } = expense;
  const formattedDate = useMemo(() => 
    created_at ? getFormattedDateFromString(created_at) : 'Invalid date',
    [created_at]
  );
  
  // For debugging
  console.log('Expense data:', { description, total, created_at, status, department });
  
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const cardBgColor = colorScheme === 'dark' ? theme.background?.val || '#1A1A1A' : 'white';
  
  return (
    <MotiView
      from={{ 
        opacity: 0,
        scale: 0.95,
        translateY: 20
      }}
      animate={{ 
        opacity: 1,
        scale: 1,
        translateY: 0
      }}
      transition={{
        type: 'spring',
        damping: 18,
        stiffness: 120,
        delay: index * 100,
      }}
    >
      <Card 
        width="100%"
        elevate
        size="$5"
        scale={0.98}
        hoverStyle={{ scale: 1 }}
        pressStyle={{ scale: 0.96 }}
        animation="quick"
        backgroundColor={cardBgColor}
        borderRadius="$6"
        onPress={onPress}
        marginBottom="$3"
      >
        <Card.Header padding="$4" paddingBottom="$2">
          <YStack width="100%">
            <XStack justifyContent="space-between" alignItems="center" width="100%">
              <Text
                fontSize={20}
                fontWeight="700"
                flex={1}
                numberOfLines={1}
              >
                {description || "Unnamed expense"}
              </Text>
              <Text
                fontSize={22}
                fontWeight="600"
                marginLeft="$2"
              >
                {total || 0} kr
              </Text>
            </XStack>
            
            {department && (
              <Text
                fontSize={14}
                opacity={0.7}
                marginTop="$1"
              >
                {department}
              </Text>
            )}
          </YStack>
        </Card.Header>
        
        <Card.Footer padding="$4" paddingTop="$2">
          <XStack justifyContent="space-between" alignItems="center" width="100%">
            <Text
              fontSize={14}
              opacity={0.7}
            >
              {formattedDate}
            </Text>
            <StatusBadge status={status || "Unknown"} />
          </XStack>
        </Card.Footer>
      </Card>
    </MotiView>
  );
});
ExpenseCard.displayName = 'ExpenseCard';

// Enhanced placeholder for empty expenses
const NoExpensesPlaceholder = memo(() => {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const router = useRouter();
  
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 100,
      }}
    >
      <YStack alignItems="center" justifyContent="center" marginTop={50} padding="$6">
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'timing', duration: 500 }}
        >
          <YStack
            backgroundColor="rgba(59, 130, 246, 0.1)"
            padding="$5"
            borderRadius="$circle"
            alignItems="center"
            justifyContent="center"
          >
            <Wallet size={54} color="#3b82f6" />
          </YStack>
        </MotiView>
        
        <MotiText
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 150, duration: 500 }}
          style={{ 
            fontSize: 26, 
            fontWeight: "700", 
            marginTop: 20,
            textAlign: "center"
          }}
        >
          No Expenses Found
        </MotiText>
        
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 300 }}
        >
          <Paragraph fontSize={16} color="$color11" textAlign="center" marginTop="$3" maxWidth={300}>
            You haven't submitted any expenses yet. Start by adding your first expense.
          </Paragraph>
        </MotiView>
        
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400 }}
        >
          <Button
            marginTop="$6"
            size="$5"
            theme="blue"
            iconAfter={Plus}
            fontSize={16}
            fontWeight="600"
            borderRadius="$4"
            paddingHorizontal="$6"
            onPress={() =>router.push("/explore/expenses/create")}
          >
            Create New Expense
          </Button>
        </MotiView>
      </YStack>
    </MotiView>
  );
});
NoExpensesPlaceholder.displayName = 'NoExpensesPlaceholder';

// Header component with animations
const ExpenseListHeader = memo(({ 
  onCreatePress, 
  onFilterToggle, 
  isFilterVisible,
  expensesCount
}: { 
  onCreatePress: () => void, 
  onFilterToggle: () => void,
  isFilterVisible: boolean,
  expensesCount: number
}) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  
  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400 }}
    >
      <XStack 
        justifyContent="space-between" 
        alignItems="center" 
        padding="$4"
        paddingBottom="$3"
      >
        <YStack>
          <MotiText
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 100 }}
            style={{ 
              fontSize: 28, 
              fontWeight: "700"
            }}
          >
            Expenses
          </MotiText>
          
          {expensesCount > 0 && (
            <MotiText
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 200 }}
              style={{ 
                fontSize: 15, 
                opacity: 0.6,
                marginTop: 4
              }}
            >
              {expensesCount} {expensesCount === 1 ? 'expense' : 'expenses'} found
            </MotiText>
          )}
        </YStack>
        
        <XStack gap="$2">
          <Button
            size="$3.5"
            circular
            icon={Filter}
            onPress={onFilterToggle}
            backgroundColor={isFilterVisible ? '$blue8' : '$backgroundStrong'}
            opacity={isFilterVisible ? 1 : 0.8}
          />
          
          <Button
            size="$3.5"
            icon={Plus}
            theme="blue"
            circular
            onPress={onCreatePress}
          />
        </XStack>
      </XStack>
    </MotiView>
  );
});
ExpenseListHeader.displayName = 'ExpenseListHeader';

// Define the filter config type
interface FilterOption {
  name: string;
  value: string;
}

interface FilterConfig {
  filterType: string;
  options: FilterOption[];
  label: string;
  initialSelected: string;
}

// Enhanced filter panel with animations
const FilterPanel = memo(({ 
  filtersConfig, 
  onFilterChange, 
  sortingOption,
  onSortChange,
  isVisible
}: { 
  filtersConfig: FilterConfig[], 
  onFilterChange: (filterType: string, value: string) => void,
  sortingOption: string,
  onSortChange: (option: string) => void,
  isVisible: boolean
}) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  
  return (
    <AnimatePresence>
      {isVisible && (
        <MotiView
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={{ overflow: 'hidden' }}
        >
          <Card
            margin="$2"
            marginTop={0}
            padding="$4"
            backgroundColor={colorScheme === 'dark' ? '$gray2' : '$gray1'}
            bordered
            borderColor="$borderColor"
            borderRadius="$4"
          >
            <YStack gap="$4">
              <XStack alignItems="center" gap="$2">
                <Filter size={18} />
                <Text fontSize={18} fontWeight="600">Filters & Sorting</Text>
              </XStack>
              
              <YStack gap="$4">
                {filtersConfig.map((filter) => (
                  <YStack key={filter.filterType} gap="$2">
                    <Text fontSize={14} fontWeight="500">{filter.label}</Text>
                    <XStack flexWrap="wrap" gap="$2">
                      {filter.options.map((option) => {
                        const isSelected = filter.initialSelected === option.value;
                        const isStatusFilter = filter.filterType === 'status';
                        const isNotAll = option.value !== 'all';
                        
                        let backgroundColor = 'transparent';
                        let textColor = '$color';
                        
                        if (isSelected) {
                          backgroundColor = (isStatusFilter && isNotAll && STATUS_STYLES[option.value])
                            ? STATUS_STYLES[option.value]?.background || '$blue5'
                            : '$blue5';
                            
                          textColor = (isStatusFilter && isNotAll && STATUS_STYLES[option.value])
                            ? STATUS_STYLES[option.value]?.color || '$blue11'
                            : '$blue11';
                        }
                        
                        return (
                          <Button
                            key={option.value}
                            size="$3"
                            borderRadius="$pill"
                            fontSize={13}
                            paddingHorizontal="$3"
                            backgroundColor={backgroundColor}
                            color={textColor}
                            borderColor="$borderColor"
                            borderWidth={1}
                            onPress={() => onFilterChange(filter.filterType, option.value)}
                          >
                            {option.name}
                          </Button>
                        );
                      })}
                    </XStack>
                  </YStack>
                ))}
                
                <YStack gap="$2">
                  <Text fontSize={14} fontWeight="500">Sort by</Text>
                  <XStack flexWrap="wrap" gap="$2">
                    {[
                      "Date Descending",
                      "Date Ascending",
                      "Amount Descending",
                      "Amount Ascending",
                    ].map((option: string) => (
                      <Button
                        key={option}
                        size="$3"
                        borderRadius="$pill"
                        fontSize={13}
                        paddingHorizontal="$3"
                        backgroundColor={sortingOption === option ? '$blue5' : 'transparent'}
                        color={sortingOption === option ? '$blue11' : '$color'}
                        borderColor="$borderColor"
                        borderWidth={1}
                        onPress={() => onSortChange(option)}
                        iconAfter={option.includes('Descending') ? ArrowUpDown : undefined}
                      >
                        {option}
                      </Button>
                    ))}
                  </XStack>
                </YStack>
              </YStack>
            </YStack>
          </Card>
        </MotiView>
      )}
    </AnimatePresence>
  );
});
FilterPanel.displayName = 'FilterPanel';

// Main component refactored to use React Query and Zustand
export function ExpenseList({withFilters = true, profileScreen = false}: {withFilters?: boolean, profileScreen?: boolean}) {
  // Get state from Zustand store
  const { 
    isFilterVisible, 
    toggleFilter,
    selectedStatus, 
    setSelectedStatus,
    selectedDepartment, 
    setSelectedDepartment,
    sortingOption, 
    setSortingOption 
  } = useExpenseListStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [departmentFilters, setDepartmentFilters] = useState<string[]>([]);
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Create filters object for query
  const filters = useMemo(() => {
    const filtersObj: Record<string, string> = {};
    
    if (selectedDepartment !== 'all') {
      filtersObj.department = selectedDepartment;
    }
    
    if (selectedStatus !== 'all') {
      filtersObj.status = selectedStatus;
    }
    
    return filtersObj;
  }, [selectedDepartment, selectedStatus]);
  
  // Use React Query for fetching expenses
  const { 
    data: expenses,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['expenses', filters],
    queryFn: async () => {
      try {
        return await getDocuments('expense', filters);
      } catch (error) {
        console.error("Error fetching expenses:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch department filters
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await getExpensesDepartments();
        const departments = data.documents.map(doc => doc.department);
        setDepartmentFilters(departments);
      } catch (error) {
        console.error("Error loading departments:", error);
      }
    };
    loadDepartments();
  }, []);
  
  // Handle onRefresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);
  
  // Handle filter change
  const handleFilterChange = useCallback((filterType: string, value: string) => {
    if (filterType === 'status') {
      setSelectedStatus(value);
    } else if (filterType === 'department') {
      setSelectedDepartment(value);
    }
  }, [setSelectedStatus, setSelectedDepartment]);
  
  // Handle navigation to create expense page
  const handleCreateExpense = useCallback(() => {
    router.push("/explore/expenses/create");
  }, [router]);
  
  // Create filter configs
  const filterConfigs = useMemo(() => [
    {
      filterType: 'status',
      options: [
        { name: "All", value: "all" },
        { name: "Pending", value: "pending" },
        { name: "Success", value: "success" },
        { name: "Submitted", value: "submitted" },
      ],
      label: 'Status',
      initialSelected: selectedStatus,
    },
    {
      filterType: 'department',
      options: [
        { name: "All", value: "all" },
        ...departmentFilters.map(department => ({
          name: department,
          value: department
        }))
      ],
      label: 'Department',
      initialSelected: selectedDepartment,
    },
  ], [departmentFilters, selectedStatus, selectedDepartment]);
  
  // Sort expenses
  const sortedExpenses = useMemo(() => {
    if (!expenses?.documents) return [];
    
    const docs = [...expenses.documents];
    switch (sortingOption) {
      case "Date Ascending":
        return docs.sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());
      case "Date Descending":
        return docs.sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime());
      case "Amount Ascending":
        return docs.sort((a, b) => a.total - b.total);
      case "Amount Descending":
        return docs.sort((a, b) => b.total - a.total);
      default:
        return docs;
    }
  }, [expenses?.documents, sortingOption]);
  
  // Render item function for FlatList
  const renderItem = useCallback(({ item: expense, index }: { item: Models.Document, index: number }) => {
    // Add additional logging and validation
    console.log(`Rendering expense at index ${index}:`, expense);
    
    // Make sure we have a valid expense object
    if (!expense || typeof expense !== 'object') {
      console.error('Invalid expense object:', expense);
      return null;
    }
    
    // Check if expense has required properties
    const hasRequiredProps = expense.$id && 
      (expense.description || expense.total || expense.status);
    
    if (!hasRequiredProps) {
      console.warn('Expense missing required properties:', expense);
    }
    
    return (
      <ExpenseCard
        key={expense.$id}
        expense={expense}
        index={index}
        onPress={() => router.push(`/explore/expenses/${expense.$id}`)}
      />
    );
  }, [router]);
  
  return (
    <YStack flex={1} backgroundColor="$background" paddingBottom={20}>
      {!profileScreen && (
        <ExpenseListHeader 
          onCreatePress={handleCreateExpense}
          onFilterToggle={toggleFilter}
          isFilterVisible={isFilterVisible}
          expensesCount={expenses?.documents?.length || 0}
        />
      )}
      
      {withFilters && (
        <FilterPanel
          filtersConfig={filterConfigs}
          onFilterChange={handleFilterChange}
          sortingOption={sortingOption}
          onSortChange={setSortingOption}
          isVisible={isFilterVisible}
        />
      )}
      
      {isLoading ? (
        <YStack padding="$2" gap="$3">
          {Array.from({ length: 5 }).map((_, index) => (
            <ExpenseCardSkeleton key={index} delay={index * 100} />
          ))}
        </YStack>
      ) : sortedExpenses.length === 0 ? (
        <NoExpensesPlaceholder />
      ) : (
        <FlatList
          data={sortedExpenses}
          renderItem={renderItem}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.color?.val || '#007AFF'}
            />
          }
        />
      )}
    </YStack>
  );
}
