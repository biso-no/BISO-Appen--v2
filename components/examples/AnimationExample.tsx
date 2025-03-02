import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, H3, H4, Paragraph, XStack, YStack, Switch, Slider, Text } from 'tamagui';
import { useAnimationStore } from '@/lib/stores/animationStore';
import { useAnimatedPresence, useAnimatedValue, animationPresets, easingPresets } from '@/lib/hooks/useAnimatedValue';
import Animated, { Easing } from 'react-native-reanimated';
import { Settings, Play, RotateCcw, Zap, ZapOff, Clock, FastForward, Watch } from '@tamagui/lucide-icons';

export function AnimationExample() {
  // Animation store values and actions
  const {
    preferences,
    setReduceMotion,
    setDisableAnimations,
    setAnimationSpeed,
    animationCount
  } = useAnimationStore();

  // Local state for demo
  const [isVisible, setIsVisible] = useState(true);
  const [selectedPresets, setSelectedPresets] = useState<(keyof typeof animationPresets)[]>(['fade', 'scale']);
  
  // Use our custom hooks
  const { animatedStyles } = useAnimatedPresence(isVisible, selectedPresets, {
    duration: 500,
    easing: Easing.bounce
  });
  
  // Simple animated value example
  const [rotateValue, animateRotate, resetRotate] = useAnimatedValue(0);
  const rotateStyle = {
    transform: [{ rotate: `${rotateValue.value}deg` }]
  };
  
  // Toggle animation visibility
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  // Start rotation animation
  const startRotation = () => {
    animateRotate(360, { duration: 1000 });
  };
  
  // Reset rotation
  const resetRotation = () => {
    resetRotate();
  };
  
  // Toggle a preset
  const togglePreset = (preset: keyof typeof animationPresets) => {
    if (selectedPresets.includes(preset)) {
      setSelectedPresets(selectedPresets.filter(p => p !== preset));
    } else {
      setSelectedPresets([...selectedPresets, preset]);
    }
  };
  
  // Set animation speed
  const handleSpeedChange = (speed: 'slow' | 'normal' | 'fast') => {
    setAnimationSpeed(speed);
  };

  return (
    <YStack space="$4" padding="$4">
      <H3>Animation Store Example</H3>
      <Paragraph>
        This demonstrates using the animation store with hooks for optimized animations.
        All animations respect user preferences for reduced motion.
      </Paragraph>
      
      {/* Animation preferences */}
      <Card elevate bordered padding="$4">
        <H4 marginBottom="$2">Animation Preferences</H4>
        
        <XStack marginBottom="$3" alignItems="center" justifyContent="space-between">
          <XStack space="$2" alignItems="center">
            <ZapOff size={18} />
            <Text>Reduce Motion</Text>
          </XStack>
          <Switch 
            checked={preferences.reduceMotion} 
            onCheckedChange={setReduceMotion}
          />
        </XStack>
        
        <XStack marginBottom="$3" alignItems="center" justifyContent="space-between">
          <XStack space="$2" alignItems="center">
            <Zap size={18} />
            <Text>Disable Animations</Text>
          </XStack>
          <Switch 
            checked={preferences.disableAnimations} 
            onCheckedChange={setDisableAnimations}
          />
        </XStack>
        
        <YStack space="$2">
          <Text>Animation Speed</Text>
          <XStack space="$2" justifyContent="space-between">
            <Button 
              size="$2" 
              theme={preferences.animationSpeed === 'slow' ? 'active' : undefined}
              onPress={() => handleSpeedChange('slow')}
              icon={<Clock size={16} />}
            >
              Slow
            </Button>
            <Button 
              size="$2" 
              theme={preferences.animationSpeed === 'normal' ? 'active' : undefined}
              onPress={() => handleSpeedChange('normal')}
              icon={<Watch size={16} />}
            >
              Normal
            </Button>
            <Button 
              size="$2" 
              theme={preferences.animationSpeed === 'fast' ? 'active' : undefined}
              onPress={() => handleSpeedChange('fast')}
              icon={<FastForward size={16} />}
            >
              Fast
            </Button>
          </XStack>
        </YStack>
      </Card>
      
      {/* Animation presets */}
      <Card elevate bordered padding="$4">
        <H4 marginBottom="$2">Animation Presets</H4>
        <Text marginBottom="$2">Select combinations:</Text>
        
        <XStack flexWrap="wrap" gap="$2" marginBottom="$4">
          {(Object.keys(animationPresets) as Array<keyof typeof animationPresets>).map(preset => (
            <Button
              key={preset}
              size="$2"
              theme={selectedPresets.includes(preset) ? 'active' : undefined}
              onPress={() => togglePreset(preset)}
            >
              {preset}
            </Button>
          ))}
        </XStack>
        
        <Button 
          marginTop="$2" 
          onPress={toggleVisibility}
          icon={<Play size={16} />}
        >
          Toggle Animation
        </Button>
      </Card>
      
      {/* Animation display */}
      <Card elevate bordered padding="$4" alignItems="center">
        <H4 marginBottom="$4">Animation Preview</H4>
        
        <Animated.View style={[styles.animatedBox, animatedStyles]}>
          <Text color="white">Hello</Text>
        </Animated.View>
        
        <XStack space="$4" marginTop="$6">
          <Button 
            onPress={startRotation} 
            icon={<Settings size={16} />}
          >
            Rotate
          </Button>
          <Button 
            onPress={resetRotation} 
            icon={<RotateCcw size={16} />}
          >
            Reset
          </Button>
        </XStack>
        
        <Animated.View style={[styles.rotatingElement, rotateStyle]} />
      </Card>
      
      {/* Status */}
      <Card elevate bordered padding="$4">
        <XStack justifyContent="space-between">
          <Text>Active Animations:</Text>
          <Text fontWeight="bold">{animationCount}</Text>
        </XStack>
      </Card>
    </YStack>
  );
}

const styles = StyleSheet.create({
  animatedBox: {
    width: 100,
    height: 100,
    backgroundColor: '#6d28d9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotatingElement: {
    width: 40,
    height: 40,
    backgroundColor: '#e11d48',
    borderRadius: 20,
    margin: 20,
  },
}); 