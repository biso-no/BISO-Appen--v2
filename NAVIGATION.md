# Navigation Structure and Optimization

This document explains the navigation structure of the app and the optimizations made to improve performance.

## Navigation Structure

The app uses Expo Router for navigation with the following structure:

```
app/
├── _layout.tsx (Root Stack Navigator)
├── (tabs)/
│   ├── _layout.tsx (Tab Navigator)
│   ├── index.tsx (Home Tab)
│   ├── explore/
│   │   └── index.tsx (Explore Tab)
│   ├── (main)/
│   │   ├── _layout.tsx (Main Stack Navigator)
│   │   ├── index.tsx (Main Screen)
│   │   └── explore/
│   │       ├── events/
│   │       ├── products/
│   │       ├── units/
│   │       ├── expenses/
│   │       └── volunteer/
│   ├── profile/
│   │   └── index.tsx (Profile Tab)
│   └── auth/
│       └── signIn/
│           └── index.tsx (Sign In Tab)
└── onboarding/
    └── index.tsx
```

## Performance Optimizations

### 1. Lazy Loading Tabs

The Tab Navigator is configured to use lazy loading, which means that screens are only rendered when they are first navigated to. This reduces the initial load time of the app.

```typescript
<Tabs
  screenOptions={{
    lazy: true,
    unmountOnBlur: Platform.OS !== 'web'
  }}
>
```

### 2. Nested Stack Navigator

The (main) Stack Navigator is nested inside the Tab Navigator to allow for multiple screens within the main tab without adding them as separate tabs. This reduces the number of tabs that need to be loaded on startup.

### 3. Custom Navigation Utility

A custom navigation utility (`useAppNavigation`) is provided to navigate between screens in the app more efficiently. This utility handles the navigation path construction and ensures that screens are navigated to correctly.

```typescript
// Example usage
const { navigateToMainScreen, navigateToExplore } = useAppNavigation();

// Navigate to a screen in the main stack
navigateToMainScreen('explore/events');

// Navigate to the explore tab
navigateToExplore();
```

### 4. Reduced Animation Duration

The animation duration for the (main) Stack Navigator is reduced to improve performance:

```typescript
<Stack
  screenOptions={{
    animation: 'slide_from_right',
    animationDuration: 200,
  }}
>
```

### 5. Tab Structure Optimization

The tab structure is optimized to show only the necessary tabs in the bottom navigation:
- Home tab (index)
- Explore tab (explore/index)
- Profile tab (profile/index)
- Auth tab (auth/signIn/index) - only shown when not logged in

The (main) stack is hidden from the tab bar but still accessible through navigation.

## Best Practices

1. **Use the Navigation Utility**: Always use the `useAppNavigation` hook to navigate between screens in the app.

2. **Avoid Deep Nesting**: Avoid deeply nesting navigators as it can lead to performance issues.

3. **Lazy Load Components**: Use lazy loading for components that are not immediately visible.

4. **Optimize Images**: Ensure that images are properly optimized and sized for mobile devices.

5. **Minimize State Updates**: Minimize state updates during navigation to reduce re-renders.

## Troubleshooting

If you encounter navigation issues:

1. Check that you're using the correct navigation path.
2. Ensure that the screen you're navigating to is properly registered in the appropriate layout file.
3. Use the `useAppNavigation` hook for navigating within the app.
4. Check the console for any navigation errors.

## Further Improvements

1. **Code Splitting**: Implement code splitting to further reduce the initial bundle size.
2. **Preloading**: Preload critical screens to improve perceived performance.
3. **Navigation State Persistence**: Implement navigation state persistence to restore the navigation state after app restart. 