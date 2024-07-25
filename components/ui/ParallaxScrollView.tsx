import React, { PropsWithChildren, ReactElement, useState } from 'react';
import { StyleSheet, useColorScheme, LayoutChangeEvent } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { View } from 'tamagui';

type Props = PropsWithChildren<{
  headerComponent: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({
  children,
  headerComponent,
  headerBackgroundColor,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Handle layout changes to dynamically get the header height
  const onHeaderLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-headerHeight, 0, headerHeight],
            [-headerHeight / 2, 0, headerHeight * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-headerHeight, 0, headerHeight], [1.5, 1, 1]),
        },
      ],
    };
  });

  return (
    <View>
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
            headerAnimatedStyle,
          ]}
          onLayout={onHeaderLayout} // Attach layout handler
        >
          {headerComponent}
        </Animated.View>
        <View flex={1} padding={0} gap={16} overflow="hidden">{children}</View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    overflow: 'visible',  // Ensure all content in header is visible
  },
});