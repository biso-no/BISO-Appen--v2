# Performance Optimizations

This document outlines the performance optimizations implemented in our application to ensure a smooth user experience, even with complex state management requirements.

## Zustand State Management

We've migrated from Context API to Zustand for state management, providing significant performance benefits:

### Core Stores

1. **Auth Store** (`authStore.ts`)
   - Manages authentication state
   - Integrates with React Query for API requests
   - Provides selective re-rendering via selectors

2. **Profile Store** (`profileStore.ts`) 
   - Manages user profile information
   - Granular updates without triggering full re-renders

3. **Membership Store** (`membershipStore.ts`)
   - Handles user membership status and details

4. **Department Store** (`departmentStore.ts`)
   - Manages department data and selections

### UI State Stores

5. **Modal Store** (`modalStore.ts`)
   - Centralized modal management
   - Tracks active modals and their data
   - Prevents unnecessary re-renders when modals change

6. **Form Store** (`formStore.ts`)
   - Manages form state across the application
   - Handles validation, errors, and submission state
   - Only re-renders relevant form components when fields change

7. **Animation Store** (`animationStore.ts`)
   - Tracks animation states and preferences
   - Persists user animation preferences
   - Ensures accessibility via reduced motion support

8. **UI Preferences Store** (`uiPreferencesStore.ts`)
   - Manages user interface preferences
   - Persists settings in AsyncStorage
   - Contains preferences for appearance, layouts, and behavior

## Performance Benefits

### 1. Selective Re-rendering

Zustand provides superior performance compared to Context API through:

- **Granular Subscriptions**: Components only re-render when their specific data changes
- **Selectors**: Extract only the data needed by a component
- **Shallow Equality Checks**: Prevent unnecessary re-renders

Example from `ZustandExample.tsx`:
```tsx
// Only re-renders when user.name changes
const userName = useAuthStore(state => state.user?.name);

// Only re-renders when membership status changes
const membershipStatus = useMembershipStore(state => state.status);
```

### 2. Optimized Animation System

Our custom animation system in `useAnimatedValue.ts` provides:

- **Performance-Optimized Animations**: Using React Native Reanimated
- **Accessibility Support**: Respects user preferences for reduced motion
- **Centralized Animation Management**: Track and control active animations
- **Animation Presets**: Reusable, optimized animation configurations

### 3. Form State Management

Our form store offers significant performance improvements:

- **Field-Level Updates**: Only re-render the specific form fields that change
- **Validation Optimization**: Validate only touched/changed fields during typing
- **Batched Updates**: Group multiple form field updates when needed

### 4. Optimized Modal Management

The modal store prevents common performance issues:

- **Centralized Control**: Manage all modals from a single store
- **Data Segregation**: Modal data is only accessed when needed
- **Transition Management**: Smooth enter/exit animations without janky UI

## Integration with React Query

We maintain a clear separation between:

- **Client State**: Managed by Zustand (UI state, preferences, forms)
- **Server State**: Managed by React Query (data fetching, caching, synchronization)

This separation provides:

- **Optimized Data Fetching**: Background refreshes, request deduplication
- **Automatic Caching**: Prevent redundant API calls
- **Stale-While-Revalidate**: Always show data while refreshing in background

## Usage Patterns

### Direct Store Access (Recommended)

For new components, directly access stores with selectors:

```tsx
import { useAuthStore } from '@/lib/stores/authStore';
import { useMembershipStore } from '@/lib/stores/membershipStore';

function ProfileHeader() {
  // Only re-renders when these specific values change
  const userName = useAuthStore(state => state.user?.name);
  const membershipLevel = useMembershipStore(state => state.membership?.level);
  
  return (
    <Header>
      <Text>{userName}</Text>
      <Badge>{membershipLevel}</Badge>
    </Header>
  );
}
```

### Optimized Form Usage

```tsx
import { useFormStore, FormId } from '@/lib/stores/formStore';

function EmailField({ formId }: { formId: FormId }) {
  // Only subscribe to email field state
  const email = useFormStore(state => state.forms[formId]?.values.email || '');
  const error = useFormStore(state => state.forms[formId]?.errors.email);
  const setFormValue = useFormStore(state => state.setFormValue);
  
  return (
    <Input 
      value={email}
      error={error}
      onChangeText={(text) => setFormValue(formId, 'email', text)}
    />
  );
}
```

### Animation Hooks

```tsx
import { useAnimatedPresence } from '@/lib/hooks/useAnimatedValue';

function AnimatedCard({ visible }) {
  const { animatedStyles } = useAnimatedPresence(
    visible, 
    ['fade', 'scale'], 
    { duration: 300 }
  );
  
  return (
    <Animated.View style={animatedStyles}>
      <Card>...</Card>
    </Animated.View>
  );
}
```

## Performance Testing

To measure the impact of these optimizations:

1. **React DevTools Profiler**: Compare render counts between old and new implementations
2. **Performance Monitor**: Track frame rates during complex interactions
3. **Lighthouse Mobile Metrics**: Track performance scores

## Next Steps

Future performance optimizations to consider:

1. **Code Splitting**: Implement lazy loading for routes
2. **Virtual Lists**: Replace standard lists with FlashList for better performance
3. **Image Optimization**: Implement progressive loading and caching
4. **Worker Threads**: Move heavy computations off the main thread
5. **Memoization Middleware**: Add advanced memoization to Zustand stores

## Conclusion

Our performance optimizations focus on:

1. **Minimizing Re-renders**: Through selective state subscriptions
2. **Efficient Animations**: Using hardware-accelerated animations
3. **Optimized Form Handling**: Field-level granularity for form updates
4. **Clear State Separation**: Client vs server state managed separately
5. **User Preference Respect**: Ensuring accessibility while maintaining performance

These improvements significantly enhance the application's responsiveness and user experience, particularly on lower-end devices and in complex UI scenarios. 