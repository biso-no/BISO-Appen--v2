// components/BottomSpacer.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

// These values should match those in your TabLayout
const TAB_BAR_HEIGHT = 65;
const TAB_BAR_MARGIN = 20;
const TOTAL_BOTTOM_SPACE = TAB_BAR_HEIGHT + (TAB_BAR_MARGIN * 2);
const SCROLL_PADDING = 40; // Increased padding for better visibility
const TOTAL_BOTTOM_PADDING = TOTAL_BOTTOM_SPACE + SCROLL_PADDING;

export const BottomSpacer = () => {
  return <View style={styles.spacer} />;
};

const styles = StyleSheet.create({
  spacer: {
    height: TOTAL_BOTTOM_PADDING,
    width: '100%',
  },
});
