import React from "react";
import { useWindowDimensions, useColorScheme } from 'react-native';
import { MotiView } from 'moti';
import RenderHTML from "react-native-render-html";
import { Models } from "react-native-appwrite";
import { 
  Text, 
  YStack, 
  XStack,
  useTheme, 
  Card, 
  Button,
  SizableText,
  Circle,
  Theme
} from "tamagui";
import { 
  Briefcase, 
  MapPin,
  ChevronRight,
  Clock,
  Zap,
} from "@tamagui/lucide-icons";
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';

interface JobCardProps {
  job: Models.Document;
  onPress: () => void;
  index: number;
}

export function JobCard({ job, onPress, index }: JobCardProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  
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
  
  // Get consistent text color for titles and tags
  const titleTextColor = colorScheme === 'dark' ? `$${jobColor}11` : `$${jobColor}11`;
  const contentTextColor = colorScheme === 'dark' ? theme[`${jobColor}11`]?.val : theme[`${jobColor}11`]?.val;
  
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

  const titleStyles = { 
    body: { 
      fontSize: 26, 
      lineHeight: 34,  // Increased line height
      color: theme[titleTextColor]?.val,
      paddingTop: 4,
      paddingBottom: 4
    },
    h1: {
      marginBottom: 8,
      marginTop: 8,
      color: theme[titleTextColor]?.val
    },
    h2: {
      marginBottom: 8,
      marginTop: 8,
      color: theme[titleTextColor]?.val
    },
    p: {
      marginBottom: 0,
      marginTop: 0,
      color: theme[titleTextColor]?.val
    }
};

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95, translateY: 15 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{
        type: 'spring',
        delay: Math.min(index * 50, 300), // Cap the delay at 300ms for better performance
        damping: 15,
        mass: 0.8,
      }}
      style={{ marginBottom: 16 }}
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
              <RenderHTML 
                        source={{ html: job.title }} 
                        contentWidth={width - 40}
                        tagsStyles={titleStyles}
                        baseStyle={{ margin: 0, padding: 0, color: theme[titleTextColor]?.val }}
                    />
                
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
                    color: contentTextColor,
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
                    {t('open-position')}
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
                    {t('view')}
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