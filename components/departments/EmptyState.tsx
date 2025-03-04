import React from "react";
import { useColorScheme } from 'react-native';
import { MotiView } from 'moti';
import { 
  Text, 
  YStack, 
  useTheme, 
  Card, 
  Button,
  Paragraph,
  Circle
} from "tamagui";
import { 
  Building, 
  Search,
  RefreshCw
} from "@tamagui/lucide-icons";

interface EmptyStateProps {
  message?: string;
  onRetry?: () => void;
  isFiltering?: boolean;
  onClearFilters?: () => void;
}

export function EmptyState({ 
  message = "No departments found", 
  onRetry,
  isFiltering,
  onClearFilters
}: EmptyStateProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' }}
      style={{ padding: 16 }}
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
        <Circle size="$8" backgroundColor="$blue3">
          {isFiltering ? (
            <Search size={32} color={theme.blue9?.val || '#0077CC'} />
          ) : (
            <Building size={32} color={theme.blue9?.val || '#0077CC'} />
          )}
        </Circle>
        
        <YStack alignItems="center" gap="$2">
          <Text fontSize="$5" fontWeight="700" textAlign="center">
            {message}
          </Text>
          <Paragraph textAlign="center" color="$gray11">
            {isFiltering 
              ? "Try adjusting your search or filters to find more departments" 
              : "There are no departments available at this time"
            }
          </Paragraph>
        </YStack>
        
        {isFiltering && onClearFilters && (
          <Button 
            theme="blue" 
            onPress={onClearFilters}
            size="$4"
            borderRadius="$6"
          >
            Clear Filters
          </Button>
        )}
        
        {onRetry && (
          <Button
            icon={RefreshCw}
            theme={isFiltering ? "gray" : "blue"}
            variant="outlined"
            onPress={onRetry}
            size="$3"
            borderRadius="$6"
          >
            Refresh
          </Button>
        )}
      </Card>
    </MotiView>
  );
} 