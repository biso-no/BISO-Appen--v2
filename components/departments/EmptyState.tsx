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
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';

interface EmptyStateProps {
  message?: string;
  onRetry?: () => void;
  isFiltering?: boolean;
  onClearFilters?: () => void;
}

export function EmptyState({ 
  message = i18next.t('no-departments-found'), 
  onRetry,
  isFiltering,
  onClearFilters
}: EmptyStateProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
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
              ? t('try-adjusting-your-search-or-filters-to-find-more-departments') 
              : t('there-are-no-departments-available-at-this-time')
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
            {t('clear-filters')}
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
            {t('refresh')}
          </Button>
        )}
      </Card>
    </MotiView>
  );
} 