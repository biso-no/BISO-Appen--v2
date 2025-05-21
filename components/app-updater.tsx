import React from 'react';
import { useAppUpdates } from '../lib/updates';

/**
 * Component that handles in-app updates
 * This is a "headless" component that doesn't render anything visible
 */
export default function AppUpdater() {
  // Initialize the update hook to check for updates on mount
  useAppUpdates(true);
  
  // This component doesn't render anything
  return null;
} 