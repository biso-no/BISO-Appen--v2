import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, TouchableOpacity, Platform, View } from 'react-native';
import { YStack, XStack, Text, Sheet, Button, useTheme, ScrollView, Stack } from 'tamagui';
import { Bell, X, XCircle, Check, Clock } from '@tamagui/lucide-icons';
import NoticeCard from './notice-card';
import { useNoticeStore } from '../../lib/stores/noticeStore';
import { Notice } from '../../types/Notice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MotiView } from 'moti';

const { width, height } = Dimensions.get('window');

const NOTICE_DISPLAY_DURATION = 7000; // 7 seconds initial display (extended from 5s)
const FADE_DURATION = 400; // 400ms fade animation (slightly slower for smoother effect)

/**
 * Enhanced Notice Container component that displays notices with modern design and animations
 */
export default function NoticeContainer() {
  const { notices, dismissedNotices, fetchNotices, dismissNotice, resetDismissedNotices, isLoading } = useNoticeStore();
  const [showInitialNotice, setShowInitialNotice] = useState(false);
  const [initialDisplayComplete, setInitialDisplayComplete] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [position, setPosition] = useState(0);
  const [timeLeft, setTimeLeft] = useState(NOTICE_DISPLAY_DURATION);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { i18n } = useTranslation();
  
  // Get current locale
  const currentLocale = i18n.language === 'no' ? 'norwegian' : 'english';
  
  // Filtered notices that haven't been dismissed
  const activeNotices = notices.filter(
    (notice) => !dismissedNotices.includes(notice.$id)
  );
  
  // Sort notices by priority (highest first)
  const sortedNotices = [...activeNotices].sort((a, b) => b.priority - a.priority);
  
  // Group notices by color for categorization
  const groupedNotices = sortedNotices.reduce((acc, notice) => {
    const color = notice.color || 'blue7';
    const category = color.replace(/[0-9]+$/, '');
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(notice);
    return acc;
  }, {} as Record<string, Notice[]>);
  
  // Get notices filtered by selected category
  const filteredNotices = selectedCategory === 'all' 
    ? sortedNotices 
    : groupedNotices[selectedCategory] || [];
  
  // Get highest priority notice to show initially
  const topNotice = sortedNotices.length > 0 ? sortedNotices[0] : null;
  
  // Fetch notices when component mounts or locale changes
  useEffect(() => {
    fetchNotices(currentLocale);
  }, [fetchNotices, currentLocale]);
  
  // Handle initial display and auto-hiding of the top priority notice
  useEffect(() => {
    if (topNotice && !initialDisplayComplete && !isLoading) {
      setShowInitialNotice(true);
      
      // Combined fade in and scale animation for a more polished appearance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: true,
        })
      ]).start();
      
      // Progress animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: NOTICE_DISPLAY_DURATION,
        useNativeDriver: false,
      }).start();
      
      // Timer for countdown display
      const countdownInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 100;
        });
      }, 100);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: FADE_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: FADE_DURATION,
            useNativeDriver: true,
          })
        ]).start(() => {
          setShowInitialNotice(false);
          setInitialDisplayComplete(true);
          
          // Show notification button after notice disappears
          setTimeout(() => {
            setShowButton(true);
            Animated.timing(buttonFadeAnim, {
              toValue: 1,
              duration: FADE_DURATION,
              useNativeDriver: true,
            }).start();
          }, 500);
        });
      }, NOTICE_DISPLAY_DURATION);
      
      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    } else if (!topNotice && !initialDisplayComplete && !isLoading) {
      // If there are no notices, skip to the button
      setInitialDisplayComplete(true);
      setShowButton(activeNotices.length > 0);
      if (activeNotices.length > 0) {
        Animated.timing(buttonFadeAnim, {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [topNotice, initialDisplayComplete, isLoading, fadeAnim, activeNotices, scaleAnim]);
  
  // Handle notice dismissal
  const handleDismiss = (noticeId: string) => {
    dismissNotice(noticeId);
    
    // Close the initial notice if it's being dismissed
    if (showInitialNotice && topNotice && topNotice.$id === noticeId) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: FADE_DURATION,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowInitialNotice(false);
        setInitialDisplayComplete(true);
        
        // Show notification button after notice disappears
        setTimeout(() => {
          setShowButton(true);
          Animated.timing(buttonFadeAnim, {
            toValue: 1,
            duration: FADE_DURATION,
            useNativeDriver: true,
          }).start();
        }, 500);
      });
    }
  };
  
  // Handle dismissing all notices
  const handleDismissAll = () => {
    // Dismiss all active notices
    activeNotices.forEach(notice => {
      dismissNotice(notice.$id);
    });
    
    // Close the sheet and hide the button
    setSheetOpen(false);
    Animated.timing(buttonFadeAnim, {
      toValue: 0,
      duration: FADE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setShowButton(false);
    });
  };
  
  // Handle dismissing filtered notices only
  const handleDismissFiltered = () => {
    // Dismiss notices in the current filter
    filteredNotices.forEach(notice => {
      dismissNotice(notice.$id);
    });
    
    // If we've dismissed all notices, close the sheet
    if (filteredNotices.length === activeNotices.length) {
      setSheetOpen(false);
      Animated.timing(buttonFadeAnim, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start(() => {
        setShowButton(false);
      });
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = (timeLeft / NOTICE_DISPLAY_DURATION) * 100;
  
  // Get a nice color for the floating button (use the top notice color if available)
  const buttonColor = topNotice?.color 
    ? theme.color?.get(topNotice.color as any) || '#4b7bff'
    : '#4b7bff';
  
  // Don't render anything if there are no active notices or loading
  if (activeNotices.length === 0 || isLoading) {
    return null;
  }
  
  // Get all available categories
  const categories = Object.keys(groupedNotices);
  
  return (
    <>
      {/* Initial Notice at bottom */}
      {showInitialNotice && topNotice && (
        <Animated.View
          style={[
            styles.noticeContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              bottom: insets.bottom + 80, // Position above bottom tabs
              backgroundColor: theme.background?.get() || '#fff',
            },
          ]}
        >
          <XStack width="100%" justifyContent="flex-end" paddingRight="$2" paddingTop="$2">
            <TouchableOpacity 
              style={styles.dismissButton}
              onPress={() => handleDismiss(topNotice.$id)}
            >
              <X size={18} color={theme.color?.get() || "black"} />
            </TouchableOpacity>
          </XStack>
          
          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: topNotice.color 
                    ? theme.color?.get(topNotice.color as any) || '#4b7bff'
                    : '#4b7bff',
                }
              ]} 
            />
          </View>
          
          {/* Notice content */}
          <NoticeCard notice={topNotice} isCompact={true} />
        </Animated.View>
      )}
      
      {/* Floating notification button */}
      {showButton && activeNotices.length > 0 && (
        <Animated.View 
          style={{ 
            opacity: buttonFadeAnim,
            transform: [{ scale: buttonFadeAnim }] // Add scale animation to button
          }}
        >
          <TouchableOpacity
            style={[
              styles.floatingButton,
              { 
                bottom: insets.bottom + 80, // Position above bottom tabs
                backgroundColor: buttonColor
              }
            ]}
            onPress={() => setSheetOpen(true)}
            activeOpacity={0.8}
          >
            <Bell size={24} color="white" />
            {activeNotices.length > 1 && (
              <XStack
                position="absolute"
                top={-5}
                right={-5}
                backgroundColor="$red9"
                borderRadius={10}
                paddingHorizontal={6}
                paddingVertical={2}
              >
                <Text color="white" fontSize={10} fontWeight="bold">
                  {activeNotices.length}
                </Text>
              </XStack>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {/* Notice Sheet */}
      <Sheet
        modal
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        snapPoints={[60, 90]}
        position={position}
        onPositionChange={setPosition}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay 
          animation="lazy" 
          enterStyle={{ opacity: 0 }} 
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Frame padding="$4" justifyContent="flex-start">
          <Sheet.Handle />
          
          <YStack space="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Stack>
                <Text fontSize="$6" fontWeight="bold">Notifications</Text>
                <Text fontSize="$2" opacity={0.6}>
                  {filteredNotices.length} {filteredNotices.length === 1 ? 'notification' : 'notifications'}
                </Text>
              </Stack>
              <Button
                size="$3"
                theme="red"
                icon={XCircle}
                onPress={selectedCategory === 'all' ? handleDismissAll : handleDismissFiltered}
              >
                {selectedCategory === 'all' ? 'Dismiss All' : 'Dismiss These'}
              </Button>
            </XStack>
            
            {/* Category filter */}
            {categories.length > 1 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
              >
                <XStack space="$2" paddingVertical="$2">
                  <Button
                    size="$2"
                    theme={selectedCategory === 'all' ? 'active' : 'gray'}
                    onPress={() => setSelectedCategory('all')}
                    borderRadius="$10"
                  >
                    All
                  </Button>
                  
                  {categories.map(category => (
                    <Button
                      key={category}
                      size="$2"
                      theme={category}
                      onPress={() => setSelectedCategory(category)}
                      borderRadius="$10"
                      opacity={selectedCategory === category ? 1 : 0.7}
                      hoverStyle={{ opacity: 1 }}
                      pressStyle={{ opacity: 1 }}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </XStack>
              </ScrollView>
            )}
            
            <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
              <YStack space="$3" paddingBottom="$8">
                {filteredNotices.map((notice, index) => (
                  <MotiView 
                    key={notice.$id}
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 250, delay: index * 80 }}
                    exit={{
                      opacity: 0,
                      translateY: -20
                    }}
                    exitTransition={{ type: 'timing', duration: 200 }}
                  >
                    <NoticeCard 
                      notice={notice} 
                      onDismiss={() => handleDismiss(notice.$id)} 
                    />
                  </MotiView>
                ))}
                
                {filteredNotices.length === 0 && selectedCategory !== 'all' && (
                  <YStack 
                    alignItems="center" 
                    justifyContent="center" 
                    padding="$8"
                    opacity={0.5}
                  >
                    <Text>No notifications in this category</Text>
                  </YStack>
                )}
              </YStack>
            </ScrollView>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  noticeContainer: {
    position: 'absolute',
    zIndex: 1000,
    width: width * 0.9,
    alignSelf: 'center',
    borderRadius: 16, // Slightly bigger radius for more modern look
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
    }),
  },
  progressBarContainer: {
    width: '100%',
    height: 3,
    backgroundColor: '#E0E0E0',
  },
  progressBar: {
    height: '100%',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    width: 54, // Slightly larger
    height: 54, // Slightly larger
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
    }),
    zIndex: 1000,
  },
  dismissButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
}); 