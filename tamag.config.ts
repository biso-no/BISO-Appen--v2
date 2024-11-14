import { createTamagui } from 'tamagui';
import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';
import { tokens } from '@tamagui/config/v3';
import * as themes from './theme-output'
import { createMedia } from '@tamagui/react-native-media-driver';
import { createAnimations } from '@tamagui/animations-moti';

// Define new color tokens
const extendedTokens = {
  ...tokens,
  color: {
    ...tokens.color,
    // Blue spectrum
    blue1: '#f0f4ff',
    blue2: '#e1e9ff',
    blue3: '#c3d4ff',
    blue4: '#a5beff',
    blue5: '#87a9ff',
    blue6: '#6992ff',
    blue7: '#4b7bff',
    blue8: '#2d64ff',
    blue9: '#0f4dff',
    blue10: '#0037d0',

    // Green spectrum
    green1: '#e7f9ed',
    green2: '#d0f4dc',
    green3: '#b8eeca',
    green4: '#a1e9b8',
    green5: '#89e3a6',
    green6: '#72de94',
    green7: '#5ad882',
    green8: '#43d370',
    green9: '#2bce5e',
    green10: '#14c94c',
  }
};

// Update themes with new colors
const extendedThemes = {
  ...themes,
  light: {
    ...themes.light,
    blue1: '#f0f4ff',
    blue2: '#e1e9ff',
    blue3: '#c3d4ff',
    blue4: '#a5beff',
    blue5: '#87a9ff',
    blue6: '#6992ff',
    blue7: '#4b7bff',
    blue8: '#2d64ff',
    blue9: '#0f4dff',
    blue10: '#0037d0',

    green1: '#e7f9ed',
    green2: '#d0f4dc',
    green3: '#b8eeca',
    green4: '#a1e9b8',
    green5: '#89e3a6',
    green6: '#72de94',
    green7: '#5ad882',
    green8: '#43d370',
    green9: '#2bce5e',
    green10: '#14c94c',
  },
  dark: {
    ...themes.dark,
    blue1: '#0037d0',
    blue2: '#0f4dff',
    blue3: '#2d64ff',
    blue4: '#4b7bff',
    blue5: '#6992ff',
    blue6: '#87a9ff',
    blue7: '#a5beff',
    blue8: '#c3d4ff',
    blue9: '#e1e9ff',
    blue10: '#f0f4ff',

    green1: '#14c94c',
    green2: '#2bce5e',
    green3: '#43d370',
    green4: '#5ad882',
    green5: '#72de94',
    green6: '#89e3a6',
    green7: '#a1e9b8',
    green8: '#b8eeca',
    green9: '#d0f4dc',
    green10: '#e7f9ed',
  }
};

const headingFont = createInterFont({
  size: {
    6: 15,
  },
  transform: {
    6: 'uppercase',
    7: 'none',
  },
  weight: {
    6: '400',
    7: '700',
  },
  color: {
    6: '$colorFocus',
    7: '$color',
  },
  letterSpacing: {
    5: 2,
    6: 1,
    7: 0,
    8: -1,
    9: -2,
    10: -3,
    12: -4,
    14: -5,
    15: -6,
  },
  face: {
    700: { normal: 'InterBold' },
  },
});

const bodyFont = createInterFont(
  {
    face: {
      700: { normal: 'InterBold' },
    },
  },
  {
    sizeSize: (size) => Math.round(size * 1.1),
    sizeLineHeight: (size) => Math.round(size * 1.1 + (size > 20 ? 10 : 10)),
  }
);

const animations = createAnimations({
  fast: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  slow: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
});

export const config = createTamagui({
  defaultFont: 'body',
  animations,
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  onlyAllowShorthands: false,
  shorthands,
  fonts: {
    body: bodyFont,
    heading: headingFont,
  },
  settings: {
    allowedStyleValues: 'somewhat-strict',
  },
  themes: extendedThemes,
  tokens: extendedTokens,
  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  }),
});

export type AppConfig = typeof config;