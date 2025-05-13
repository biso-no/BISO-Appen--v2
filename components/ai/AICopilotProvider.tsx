import React, { useEffect, useState } from 'react';
import { StyleSheet, ToastAndroid, Platform, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCopilotStore } from '../../lib/stores/copilotStore';
import { AICopilotPanel } from './AICopilotPanel';
import { useTranslation } from 'react-i18next';

interface AICopilotProviderProps {
  children: React.ReactNode;
  agentId?: string;
}

export function AICopilotProvider({ 
  children,
  agentId,
}: AICopilotProviderProps) {
  const { setAnimation } = useCopilotStore();
  const [apiInitialized, setApiInitialized] = useState(false);
  const { t } = useTranslation();
  
  // Initialize on mount
  useEffect(() => {
    const initializeApi = async () => {
      try {
        // Set as initialized immediately
        setApiInitialized(true);
        
        // Greet the user with a welcome animation
        setTimeout(() => {
          setAnimation('waving');
          
          setTimeout(() => {
            setAnimation('idle');
          }, 2000);
        }, 1000);
      } catch (error) {
        console.error('Failed to initialize API:', error);
        // Show error message but don't prevent the app from loading
        setApiInitialized(false);
        
        // Show a user-friendly message
        if (Platform.OS === 'android') {
          ToastAndroid.show(t('ai-assistant-service-unavailable'), ToastAndroid.SHORT);
        } else if (Platform.OS === 'ios') {
          Alert.alert(t('notice'), t('ai-assistant-service-unavailable-0'));
        }
      }
    };
    
    initializeApi();
  }, [setAnimation]);
  
  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Main app content */}
      {children}
      
      {/* Copilot UI components */}
      <AICopilotPanel />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 