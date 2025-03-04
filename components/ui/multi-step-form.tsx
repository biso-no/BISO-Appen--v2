import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Animated, Easing, Dimensions, useColorScheme } from 'react-native';
import { YStack, Button, View, H2, XStack, Circle, Theme, useTheme, ScrollView } from 'tamagui';
import { MotiView } from 'moti';
import { ChevronRight, ChevronLeft, Check } from '@tamagui/lucide-icons';

export interface Step {
  label: string;
  content: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  icon?: React.ReactNode;
}

export function MultiStepForm({ steps, onSubmit }: { steps: Step[]; onSubmit: () => void; }) {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width, height } = Dimensions.get('window');
  const isSmallDevice = width < 380 || height < 700;
  
  // Update progress animation when step changes
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep / (steps.length - 1)),
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [currentStep, steps.length, progressAnim]);

  const moveToNextStep = () => {
    if (currentStep < steps.length - 1) {
      steps[currentStep]?.onNext?.();
      
      // Sequence of animations for a more dynamic transition
      Animated.sequence([
        // Fade and scale out current step
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          })
        ]),
      ]).start(() => {
        setCurrentStep((prev) => prev + 1);
        
        // Animate in the new step
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          })
        ]).start();
      });
    } else {
      // Final submit animation
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(onSubmit);
    }
  };

  const moveToPreviousStep = () => {
    if (currentStep > 0) {
      steps[currentStep]?.onPrevious?.();
      
      // Sequence of animations for a more dynamic transition
      Animated.sequence([
        // Fade and scale out current step
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          })
        ]),
      ]).start(() => {
        setCurrentStep((prev) => prev - 1);
        
        // Animate in the new step
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          })
        ]).start();
      });
    }
  };

  // Progress bar width calculation
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <YStack flex={1}>
      {/* Progress indicator */}
      <XStack position="relative" justifyContent="space-between" alignItems="center" paddingHorizontal="$4" marginBottom="$3">
        {steps.map((_, index) => (
          <MotiView
            key={index}
            style={styles.stepIndicatorContainer}
            animate={{
              scale: currentStep >= index ? 1 : 0.8,
              opacity: currentStep >= index ? 1 : 0.6,
            }}
            transition={{
              type: 'timing',
              duration: 300,
            }}
          >
            <Circle
              size={isSmallDevice ? "$3" : "$3.5"}
              backgroundColor={currentStep >= index ? '$primary' : '$backgroundHover'}
              pressStyle={{ scale: 0.9 }}
              onPress={() => {
                if (index < currentStep) {
                  setCurrentStep(index);
                }
              }}
            >
              {currentStep > index && <Check size={isSmallDevice ? "$0.5" : "$1"} color="white" />}
            </Circle>
          </MotiView>
        ))}
        
        {/* Progress line */}
        <View style={[styles.progressLineContainer, { zIndex: -1 }]}>
          <View style={[styles.progressLineBg, { backgroundColor: isDark ? '#333' : '#E0E0E0' }]} />
          <Animated.View
            style={[
              styles.progressLine,
              {
                width: progressWidth,
                backgroundColor: theme.primary?.val || '#3b82f6',
              },
            ]}
          />
        </View>
      </XStack>

      {/* Scrollable content area */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            {
              transform: [
                { scale: scaleAnim }
              ],
              opacity: fadeAnim,
            },
          ]}
        >
          <Theme name={isDark ? 'dark' : 'light'}>
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 400 }}
              style={styles.stepContainer}
            >
              <H2 
                textAlign="center" 
                marginBottom="$2" 
                fontWeight="bold"
                fontSize={isSmallDevice ? "$8" : "$8"}
              >
                {steps[currentStep].label}
              </H2>
              <View style={styles.contentWrapper}>
                {steps[currentStep].content}
              </View>
            </MotiView>
          </Theme>
        </Animated.View>
      </ScrollView>

      {/* Navigation buttons - Fixed at bottom */}
      <XStack 
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        justifyContent="space-between" 
        paddingHorizontal="$4"
        paddingVertical="$4"
        borderTopWidth={1}
        borderTopColor="$borderColor"
        backgroundColor="$background"
        zIndex={1000}
      >
        <Button
          size={isSmallDevice ? "$3" : "$4"}
          circular
          icon={<ChevronLeft size={isSmallDevice ? "$1" : "$1.5"} />}
          opacity={currentStep > 0 ? 1 : 0}
          disabled={currentStep === 0}
          onPress={moveToPreviousStep}
          pressStyle={{ scale: 0.9 }}
          animation="quick"
        />
        
        <Button
          size={isSmallDevice ? "$4" : "$5"}
          theme="active"
          borderRadius="$10"
          paddingHorizontal="$6"
          pressStyle={{ scale: 0.95 }}
          animation="quick"
          onPress={moveToNextStep}
          iconAfter={currentStep < steps.length - 1 ? <ChevronRight size={isSmallDevice ? "$1" : "$1.5"} /> : undefined}
        >
          {currentStep < steps.length - 1 ? 'Next' : 'Complete'}
        </Button>
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingVertical: 8,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
  },
  stepContainer: {
    width: '100%',
    padding: 8,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  progressLineContainer: {
    position: 'absolute',
    top: '50%',
    left: 24,
    right: 24,
    height: 3,
  },
  progressLineBg: {
    position: 'absolute',
    width: '100%',
    height: 3,
  },
  progressLine: {
    position: 'absolute',
    height: 3,
    left: 0,
  },
  stepIndicatorContainer: {
    zIndex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
  },
  motiContainer: {
    flex: 1,
    width: '100%',
  }
});
