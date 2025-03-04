import { useRouter } from 'expo-router';
import { useCallback } from 'react';

/**
 * Custom hook to navigate to screens within the app
 * This helps avoid performance issues with nested navigators
 */
export function useAppNavigation() {
  const router = useRouter();

  /**
   * Navigate to a screen within the (main) stack
   * @param screen The screen path within the (main) stack
   * @param params Optional parameters to pass to the screen
   */
  const navigateToMainScreen = useCallback((screen: string, params?: Record<string, any>) => {
    if (screen.startsWith('/')) {
      // If the screen already starts with a slash, remove it
      screen = screen.substring(1);
    }
    
    // Use string concatenation instead of template literals to avoid type issues
    router.push({
      pathname: '/(tabs)/(main)/' + screen as any,
      params
    });
  }, [router]);

  /**
   * Navigate to the explore tab
   * @param params Optional parameters to pass to the screen
   */
  const navigateToExplore = useCallback((params?: Record<string, any>) => {
    router.push({
      pathname: '/(tabs)/explore/index' as any,
      params
    });
  }, [router]);

  return {
    navigateToMainScreen,
    navigateToExplore
  };
}

/**
 * Get the full path for a screen within the (main) stack
 * @param screen The screen path within the (main) stack
 * @returns The full path for the screen
 */
export function getMainScreenPath(screen: string): string {
  if (screen.startsWith('/')) {
    // If the screen already starts with a slash, remove it
    screen = screen.substring(1);
  }
  
  // Use string concatenation instead of template literals
  return '/(tabs)/(main)/' + screen;
}

/**
 * Get the path for the explore tab
 * @returns The path for the explore tab
 */
export function getExplorePath(): string {
  return '/(tabs)/explore/index';
} 