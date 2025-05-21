import { useRouter } from 'expo-router';
import { Button, Card, Paragraph, Text, XStack, YStack, useTheme, Separator } from 'tamagui';
import { Notice } from '../../types/Notice';
import { memo, useMemo } from 'react';
import { Platform, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { X, ArrowUpRight, Clock } from '@tamagui/lucide-icons';
import { format, differenceInDays, isAfter } from 'date-fns';

interface NoticeCardProps {
  notice: Notice;
  isCompact?: boolean;
  onDismiss?: () => void;
}

function NoticeCard({ notice, isCompact = false, onDismiss }: NoticeCardProps) {
  const router = useRouter();
  const theme = useTheme();
  
  // Default color if none specified
  const cardColor = notice.color || 'blue7';
  
  // Format date for display
  const formattedDate = useMemo(() => {
    try {
      const date = new Date(notice.createdAt);
      const today = new Date();
      const dayDiff = differenceInDays(today, date);
      
      if (dayDiff === 0) {
        return 'Today';
      } else if (dayDiff === 1) {
        return 'Yesterday';
      } else if (dayDiff < 7) {
        return `${dayDiff} days ago`;
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch {
      return '';
    }
  }, [notice.createdAt]);
  
  // Check if notice has expiration
  const hasExpiration = notice.expiresAt && isAfter(new Date(notice.expiresAt), new Date());
  
  const handleAction = () => {
    if (notice.actionUrl) {
      // Handle different action URL formats
      if (notice.actionUrl.startsWith('/')) {
        router.push(notice.actionUrl as any);
      } else if (notice.actionUrl.startsWith('http')) {
        // Open external URL
        router.push(notice.actionUrl as any);
      } else {
        // Try to navigate with the route name
        router.navigate(notice.actionUrl as any);
      }
    }
  };
  
  const cardStyles = {
    ...styles.card,
    backgroundColor: theme.color?.get(cardColor as any) || '#4b7bff',
  };
  
  // Use a simpler card layout for compact mode
  if (isCompact) {
    return (
      <YStack 
        paddingHorizontal="$4" 
        paddingVertical="$3"
        width="100%"
      >
        <Text color="white" fontWeight="bold" fontSize="$5" marginBottom="$2">
          {notice.title}
        </Text>
        
        <Paragraph size="$2" color="white" opacity={0.9} marginBottom="$3">
          {notice.description}
        </Paragraph>
        
        {notice.actionLabel && notice.actionUrl && (
          <Button
            alignSelf="flex-end"
            backgroundColor="white"
            color={theme.color?.get(cardColor as any) || '#4b7bff'}
            fontWeight="bold"
            size="$3"
            onPress={handleAction}
            icon={ArrowUpRight}
            borderRadius="$6"
          >
            {notice.actionLabel}
          </Button>
        )}
      </YStack>
    );
  }
  
  // Full card mode for the sheet
  return (
    <Card
      bordered
      size="$4"
      animation="bouncy"
      scale={0.98}
      hoverStyle={{ scale: 1 }}
      pressStyle={{ scale: 0.96 }}
      width="100%"
      style={cardStyles}
    >
      <Card.Header padded>
        <XStack justifyContent="space-between" alignItems="center" width="100%">
          <YStack>
            <Text color="white" fontWeight="bold" fontSize="$5">
              {notice.title}
            </Text>
            
            {/* Time indicator */}
            {formattedDate && (
              <XStack alignItems="center" space="$1" marginTop="$1" opacity={0.7}>
                <Clock size={12} color="white" />
                <Text color="white" fontSize="$1">
                  {formattedDate}
                </Text>
                
                {hasExpiration && (
                  <Text color="white" fontSize="$1">
                    • Expires {format(new Date(notice.expiresAt!), 'MMM d')}
                  </Text>
                )}
              </XStack>
            )}
          </YStack>
          
          {onDismiss && (
            <TouchableOpacity 
              onPress={onDismiss}
              style={styles.dismissButton}
            >
              <X size={16} color="white" />
            </TouchableOpacity>
          )}
        </XStack>
      </Card.Header>
      
      <Card.Footer padded>
        <YStack space="$3" width="100%">
          <Paragraph size="$2" color="white" opacity={0.9}>
            {notice.description}
          </Paragraph>
          
          {notice.actionLabel && notice.actionUrl && (
            <Button
              alignSelf="flex-end"
              backgroundColor="white"
              color={theme.color?.get(cardColor as any) || '#4b7bff'}
              fontWeight="bold"
              size="$3"
              onPress={handleAction}
              icon={ArrowUpRight}
              borderRadius="$6"
            >
              {notice.actionLabel}
            </Button>
          )}
        </YStack>
      </Card.Footer>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
    borderRadius: 16,
    marginVertical: 8,
  },
  dismissButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default memo(NoticeCard); 