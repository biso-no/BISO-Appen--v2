import { View, YStack, Text, H3, Paragraph, XStack } from 'tamagui';
import React, { useState } from 'react';
import { Input } from 'tamagui';
import { MotiView } from 'moti';
import { StyleSheet, Dimensions } from 'react-native';
import { User, Sparkles } from '@tamagui/lucide-icons';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';

interface Step1Props {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  onNext?: () => void;
}

export function Step1({ name, setName, onNext }: Step1Props) {
  const [isFocused, setIsFocused] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const { width } = Dimensions.get('window');
  
  // Start animation when component mounts
  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1, // Infinite repetitions
      false // Don't reverse
    );
    
    // Subtle pulsing effect
    const pulseAnimation = () => {
      scale.value = withTiming(1.05, { duration: 1500 });
      setTimeout(() => {
        scale.value = withTiming(1, { duration: 1500 }, () => {
          setTimeout(pulseAnimation, 1000);
        });
      }, 1500);
    };
    
    pulseAnimation();
    
    return () => {
      // Cleanup
      rotation.value = 0;
      scale.value = 1;
    };
  }, [rotation, scale]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });
  
  const scaleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleNameChange = (text: string) => {
    setName(text);
    if (onNext) {
      onNext();
    }
  };

  return (
    <YStack width="100%" alignItems="center" space="$4">
      <MotiView 
        from={{ opacity: 0, translateY: 20 }} 
        animate={{ opacity: 1, translateY: 0 }} 
        transition={{ type: 'timing', duration: 600 }}
        style={styles.container}
      >
        {/* Background decoration */}
        <Animated.View style={[styles.backgroundDecoration, animatedStyle]}>
          <View style={styles.decorationInner} />
        </Animated.View>
        
        {/* Avatar placeholder with animation */}
        <Animated.View style={[styles.avatarContainer, scaleStyle]}>
          <XStack
            backgroundColor="$primary"
            width={width < 380 ? 90 : 110}
            height={width < 380 ? 90 : 110}
            borderRadius={width < 380 ? 45 : 55}
            alignItems="center"
            justifyContent="center"
          >
            <User size={width < 380 ? 45 : 55} color="white" />
          </XStack>
          
          {/* Sparkle icon with animation */}
          <MotiView
            style={styles.sparkleIcon}
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'timing',
              duration: 500,
              delay: 800,
            }}
          >
            <Sparkles size={20} color="$primary" />
          </MotiView>
        </Animated.View>
        
        <YStack space="$1" marginTop="$3" width="100%" alignItems="center">
          <H3 textAlign="center" fontWeight="bold">Welcome!</H3>
          <Paragraph textAlign="center" opacity={0.8} paddingHorizontal="$4">
            Let's get to know you better. What should we call you?
          </Paragraph>
        </YStack>
        
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 300 }}
          style={styles.inputContainer}
        >
          <Input
            id="name"
            placeholder="Enter your name"
            value={name}
            onChangeText={handleNameChange}
            size="$4"
            width="100%"
            borderWidth={2}
            borderColor={isFocused ? '$primary' : '$borderColor'}
            backgroundColor="$background"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            textAlign="center"
            fontSize="$8"
            paddingVertical="$3"
            autoFocus
            animation="quick"
          />
        </MotiView>
        
        {name.length > 0 && (
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 150 }}
            style={styles.greetingContainer}
          >
            <Text color="$primary" fontWeight="bold" fontSize="$4">
              Nice to meet you, {name}!
            </Text>
          </MotiView>
        )}
      </MotiView>
    </YStack>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backgroundDecoration: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    top: -width * 0.6,
    zIndex: -1,
  },
  decorationInner: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: 'rgba(130, 130, 255, 0.1)',
    borderRadius: width * 0.75,
  },
  avatarContainer: {
    marginTop: 10,
    position: 'relative',
  },
  sparkleIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  inputContainer: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  greetingContainer: {
    marginTop: 16,
    paddingVertical: 4,
  },
});
