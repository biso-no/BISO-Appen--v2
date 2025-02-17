import React, { useState, useRef } from 'react';
import { StyleSheet, Animated, PanResponder, Easing } from 'react-native';
import { YStack, Button, Text, View } from 'tamagui';
import { MyStack } from './MyStack';

export interface Step {
  label: string;
  content: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function MultiStepForm({ steps, onSubmit }: { steps: Step[]; onSubmit: () => void; }) {
  const [currentStep, setCurrentStep] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;

  const moveToNextStep = () => {
    if (currentStep < steps.length - 1) {
      steps[currentStep]?.onNext?.();
      Animated.timing(translateY, {
        toValue: -500,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep((prev) => prev + 1);
        translateY.setValue(500); // Reset for the next animation
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const moveToPreviousStep = () => {
    if (currentStep > 0) {
      steps[currentStep]?.onPrevious?.();
      Animated.timing(translateY, {
        toValue: 500,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep((prev) => prev - 1);
        translateY.setValue(-500); // Reset for the next animation
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
      onPanResponderMove: Animated.event([null, { dy: translateY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        const threshold = 50;
        if (gestureState.dy < -threshold) {
          moveToNextStep();
        } else if (gestureState.dy > threshold) {
          moveToPreviousStep();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View>
      <Animated.View
        style={[
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <MyStack justifyContent='center' alignItems='center' gap='$4' padding='$4' width='100%'>
          <Step step={steps[currentStep]} />
        </MyStack>
        <YStack gap="$4" alignItems="center">
          {currentStep > 0 && (
            <Button onPress={moveToPreviousStep}>
              Back
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button onPress={moveToNextStep}>
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button onPress={onSubmit}>
              Submit
            </Button>
          )}
        </YStack>
      </Animated.View>
    </View>
  );
}

const Step = ({ step }: { step: Step }) => (
  <YStack justifyContent='center' alignItems='center' gap='$4'>
    <Text style={styles.stepLabel}>{step.label}</Text>
    {step.content}
  </YStack>
);

const styles = StyleSheet.create({
  stepLabel: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  stepContent: {
    fontSize: 18,
  },
});
