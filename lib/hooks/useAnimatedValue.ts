import { useEffect, useRef } from 'react';
import { useAnimationStore } from '@/lib/stores/animationStore';
import Animated, { 
  useSharedValue, 
  withTiming, 
  WithTimingConfig,
  Easing,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  EasingFunction
} from 'react-native-reanimated';
import { nanoid } from 'nanoid/non-secure';

// Common animation presets
export const animationPresets = {
  fade: {
    in: { opacity: [0, 1] },
    out: { opacity: [1, 0] }
  },
  scale: {
    in: { scale: [0.9, 1] },
    out: { scale: [1, 0.9] }
  },
  slideUp: {
    in: { translateY: [50, 0] },
    out: { translateY: [0, 50] }
  },
  slideDown: {
    in: { translateY: [-50, 0] },
    out: { translateY: [0, -50] }
  },
  slideLeft: {
    in: { translateX: [50, 0] },
    out: { translateX: [0, 50] }
  },
  slideRight: {
    in: { translateX: [-50, 0] },
    out: { translateX: [0, -50] }
  }
};

// Easing presets
export const easingPresets = {
  default: Easing.bezier(0.25, 0.1, 0.25, 1),
  in: Easing.bezier(0.42, 0, 1, 1),
  out: Easing.bezier(0, 0, 0.58, 1),
  inOut: Easing.bezier(0.42, 0, 0.58, 1),
  bounce: Easing.bezier(0.175, 0.885, 0.32, 1.275)
};

// Type for animation options
export interface AnimationOptions {
  duration?: number;
  easing?: EasingFunction;
  delay?: number;
  useNativeDriver?: boolean;
}



// Type for animation values
interface AnimationValues {
  [key: string]: [number, number]; // [from, to]
}

/**
 * Hook to create and manage an animated value with Zustand's animation store
 * Provides optimized animations that respect user preferences
 */
export function useAnimatedValue(
  initialValue: number,
  animationId?: string
): [
  Animated.SharedValue<number>,
  (toValue: number, options?: AnimationOptions) => void,
  () => void
] {
  // Create a unique ID for this animation if not provided
  const id = useRef(animationId || `animation-${nanoid()}`);
  
  // Create shared value for animation
  const animatedValue = useSharedValue(initialValue);
  
  // Access animation store for preferences
  const getAnimationDuration = useAnimationStore(state => state.getAnimationDuration);
  const registerAnimation = useAnimationStore(state => state.registerAnimation);
  const unregisterAnimation = useAnimationStore(state => state.unregisterAnimation);
  const preferences = useAnimationStore(state => state.preferences);
  
  // Clean up on unmount
  useEffect(() => {
    const currentId = id.current; // Capture the current value
    return () => {
      unregisterAnimation(currentId);
    };
  }, [unregisterAnimation]);
  
  // Function to animate the value
  const animate = (toValue: number, options: AnimationOptions = {}) => {
    // Apply user preferences to duration
    const duration = getAnimationDuration(options.duration || 300);
    
    // If animations are disabled, set value immediately
    if (preferences.disableAnimations) {
      animatedValue.value = toValue;
      return;
    }
    
    // Create animation config
    const config: WithTimingConfig = {
      duration,
      easing: options.easing || easingPresets.default,
    };
    
    if (options.delay) {
      setTimeout(() => {
        // Register this animation in the store
        registerAnimation(id.current, 'fadeIn'); // Using generic type
        
        // Start the animation
        animatedValue.value = withTiming(toValue, config, (finished) => {
          if (finished) {
            unregisterAnimation(id.current);
          }
        });
      }, options.delay);
    } else {
      // Register this animation in the store
      registerAnimation(id.current, 'fadeIn'); // Using generic type
      
      // Start the animation
      animatedValue.value = withTiming(toValue, config, (finished) => {
        if (finished) {
          unregisterAnimation(id.current);
        }
      });
    }
  };
  
  // Function to reset value without animation
  const reset = () => {
    animatedValue.value = initialValue;
  };
  
  return [animatedValue, animate, reset];
}

/**
 * Hook to create animated styles with multiple properties
 * that respect user animation preferences
 */
export function useAnimatedTransition(
  visible: boolean,
  animations: AnimationValues,
  options: AnimationOptions = {}
): {
  animatedStyles: Animated.AnimateStyle<any>;
  isAnimating: boolean;
} {
  // Create ID for this animation set
  const id = useRef(`transition-${nanoid()}`);
  const isFirstRun = useRef(true);
  
  // Animation progress value
  const progress = useSharedValue(visible ? 1 : 0);
  const isAnimating = useRef(false);
  
  // Access animation store
  const getAnimationDuration = useAnimationStore(state => state.getAnimationDuration);
  const registerAnimation = useAnimationStore(state => state.registerAnimation);
  const unregisterAnimation = useAnimationStore(state => state.unregisterAnimation);
  const preferences = useAnimationStore(state => state.preferences);
  
  // Clean up on unmount
  useEffect(() => {
    const currentId = id.current; // Capture the current value
    return () => {
      unregisterAnimation(currentId);
    };
  }, [unregisterAnimation]);
  
  // Update progress when visibility changes
  useEffect(() => {
    // Skip animation on first render unless specified
    if (isFirstRun.current) {
      progress.value = visible ? 1 : 0;
      isFirstRun.current = false;
      return;
    }
    
    const duration = getAnimationDuration(options.duration || 300);
    
    // If animations are disabled, set immediately
    if (preferences.disableAnimations) {
      progress.value = visible ? 1 : 0;
      return;
    }
    
    // Create animation config
    const config: WithTimingConfig = {
      duration,
      easing: options.easing || easingPresets.default,
    };
    
    // Register animation
    isAnimating.current = true;
    registerAnimation(id.current, visible ? 'fadeIn' : 'fadeOut');
    
    // Run the animation
    progress.value = withTiming(
      visible ? 1 : 0, 
      config, 
      (finished) => {
        if (finished) {
          unregisterAnimation(id.current);
          isAnimating.current = false;
        }
      }
    );
  }, [visible, getAnimationDuration, preferences.disableAnimations, options.duration, options.easing, progress, registerAnimation, unregisterAnimation]);
  
  // Create animated styles based on animation values
  const animatedStyles = useAnimatedStyle(() => {
    const styles: any = {};
    
    // Apply each animation property
    Object.entries(animations).forEach(([property, [fromValue, toValue]]) => {
      if (property === 'rotate') {
        // Handle rotation specifically
        styles.transform = styles.transform || [];
        styles.transform.push({
          rotate: `${interpolate(
            progress.value,
            [0, 1],
            [fromValue, toValue],
            Extrapolate.CLAMP
          )}deg`
        });
      } else if (property === 'scale') {
        // Handle scale specifically
        styles.transform = styles.transform || [];
        styles.transform.push({
          scale: interpolate(
            progress.value,
            [0, 1],
            [fromValue, toValue],
            Extrapolate.CLAMP
          )
        });
      } else if (property === 'translateX' || property === 'translateY') {
        // Handle translations
        styles.transform = styles.transform || [];
        styles.transform.push({
          [property]: interpolate(
            progress.value,
            [0, 1],
            [fromValue, toValue],
            Extrapolate.CLAMP
          )
        });
      } else {
        // Handle other properties (like opacity)
        styles[property] = interpolate(
          progress.value,
          [0, 1],
          [fromValue, toValue],
          Extrapolate.CLAMP
        );
      }
    });
    
    return styles;
  });
  
  return { 
    animatedStyles, 
    isAnimating: isAnimating.current 
  };
}

/**
 * Combines multiple animation presets for complex animations
 * with optimized performance
 */
export function useAnimatedPresence(
  visible: boolean,
  presets: (keyof typeof animationPresets)[],
  options: AnimationOptions = {}
) {
  // Combine all the animation values from the presets
  const animations: AnimationValues = {};
  
  presets.forEach(presetName => {
    const preset = animationPresets[presetName];
    const values = visible ? preset.in : preset.out;
    
    Object.entries(values).forEach(([property, value]) => {
      animations[property] = value as [number, number];
    });
  });
  
  return useAnimatedTransition(visible, animations, options);
} 