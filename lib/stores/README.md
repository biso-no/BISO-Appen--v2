# State Management with Zustand and React Query

This project uses a combination of Zustand for client state management and React Query for server state management. This document outlines the approach and patterns used.

## Architecture Overview

We follow a clear separation of concerns:

- **React Query**: Manages server state (data fetching, caching, synchronization)
- **Zustand**: Manages client state (UI state, application state, derived state)

## Store Structure

Each domain area has its own Zustand store:

- `authStore.ts`: Authentication state and operations
- `profileStore.ts`: User profile state and operations
- `membershipStore.ts`: Membership status and operations
- `departmentStore.ts`: Department data and operations

## Integration Pattern

We use a bridge pattern to integrate React Query with Zustand:

1. Zustand store defines the state shape and operations
2. A custom hook (e.g., `useAuth`, `useZustandProfile`) uses React Query to fetch data
3. The hook syncs React Query data with the Zustand store
4. Components use the hook which provides a unified API

## Migration Status

| Feature | Status | Store | Integration Hook |
|---------|--------|-------|------------------|
| Auth    | ✅ Migrated | `authStore.ts` | `useAuthStore.ts` |
| Profile | ✅ Migrated | `profileStore.ts` | `useProfileStore.ts` |
| Membership | ✅ Migrated | `membershipStore.ts` | `useMembershipStore.ts` |
| Department | ✅ Migrated | `departmentStore.ts` | `useDepartmentStore.ts` |

All core providers have been migrated to Zustand. The React Context providers are still in place as a compatibility layer for existing components, but new components should consider accessing the Zustand stores directly.

## Using Stores Directly (Recommended for new components)

```tsx
// Using Zustand directly
import { useAuthStore } from '@/lib/stores/authStore';

function ProfilePage() {
  // Only select what you need for better performance
  const user = useAuthStore(state => state.user);
  const updateName = useAuthStore(state => state.updateName);
  
  return (
    <View>
      <Text>Welcome, {user?.name}</Text>
      <Button 
        onPress={() => updateName('New Name')}
        title="Update Name"
      />
    </View>
  );
}
```

## Using the Compatibility Layer (For backward compatibility)

```tsx
// Using the compatibility layer
import { useAuth } from '@/lib/hooks/useAuthStore';

function ProfilePage() {
  const { user, actions } = useAuth();
  
  return (
    <View>
      <Text>Welcome, {user?.name}</Text>
      <Button 
        onPress={() => actions.updateName('New Name')}
        title="Update Name"
      />
    </View>
  );
}
```

## Best Practices

1. **Keep stores focused**: Each store should manage a specific domain area
2. **Minimize store dependencies**: Stores should be as independent as possible
3. **Use selectors**: When components only need a part of the state, use Zustand selectors for performance
4. **Keep operations in stores**: Business logic should live in the store, not in components
5. **Respect the pattern**: Follow the established patterns for consistency

## Performance Benefits

This approach offers several performance benefits:

- **Minimized re-renders**: Zustand only triggers re-renders for components that use the specific state that changed
- **Optimized data fetching**: React Query provides caching, deduplication, and background updates
- **Reduced prop drilling**: State is accessible anywhere without prop drilling or excessive context providers
- **Improved developer experience**: Clear separation between server and client state

## Next Steps for Future State Management

Consider implementing these enhancements:

1. **UI state stores**: Create focused stores for UI state (modals, navigation, etc.)
2. **Feature-specific stores**: Implement stores for specific features with complex state
3. **Middleware**: Add middleware for logging, persistence, etc.
4. **Testing utilities**: Create testing utilities for Zustand stores 