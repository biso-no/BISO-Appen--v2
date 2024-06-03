import { MotiView, useAnimationState } from 'moti';
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { useState } from 'react';
import { YStack } from 'tamagui';
import { View, StyleSheet } from 'react-native';

interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
}

export function FlipCard({ frontContent, backContent }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  const animationState = useAnimationState({
    from: {
      rotateY: '0deg',
    },
    flipped: {
      rotateY: '180deg',
    },
  });

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { translationX } = event.nativeEvent;
    if (translationX > 50 || translationX < -50) {
      setFlipped(!flipped);
      animationState.transitionTo(flipped ? 'from' : 'flipped');
    }
  };

  return (
    <GestureHandlerRootView>
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <MotiView
          state={animationState}
          style={styles.card}
          transition={{
            rotateY: {
              type: 'timing',
              duration: 500,
            },
          }}
        >
          {flipped ? backContent : frontContent}
        </MotiView>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  card: {
    backfaceVisibility: 'hidden',
    width: '100%',
    height: '100%',
  },
});
