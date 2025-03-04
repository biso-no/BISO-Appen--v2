import React, { createContext, useContext, useRef, useCallback, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  frameTime: number;
  renderTime: number;
  jsHeapSize?: number;
  memoryUsage?: number;
}

/**
 * Context for performance monitoring
 */
interface PerformanceContextType {
  startMeasure: (id: string) => void;
  endMeasure: (id: string) => void;
  getMetrics: (id: string) => number | undefined;
  clearMetrics: () => void;
  isMonitoringEnabled: boolean;
  toggleMonitoring: () => void;
  renderCount: number;
  incrementRenderCount: () => void;
  resetRenderCount: () => void;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

/**
 * Provider component for performance monitoring
 */
export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store for performance measurements
  const metrics = useRef<Record<string, number>>({});
  const startTimes = useRef<Record<string, number>>({});
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(false);
  const [renderCount, setRenderCount] = useState(0);
  
  // Start measuring performance for a given ID
  const startMeasure = useCallback((id: string) => {
    if (!isMonitoringEnabled) return;
    startTimes.current[id] = performance.now();
  }, [isMonitoringEnabled]);
  
  // End measuring and calculate duration
  const endMeasure = useCallback((id: string) => {
    if (!isMonitoringEnabled || !startTimes.current[id]) return;
    
    const endTime = performance.now();
    const startTime = startTimes.current[id];
    metrics.current[id] = endTime - startTime;
    
    // Log the results for development purposes
    console.log(`[Performance] ${id}: ${metrics.current[id].toFixed(2)}ms`);
  }, [isMonitoringEnabled]);
  
  // Get metrics for a specific ID
  const getMetrics = useCallback((id: string) => {
    return metrics.current[id];
  }, []);
  
  // Clear all metrics
  const clearMetrics = useCallback(() => {
    metrics.current = {};
    startTimes.current = {};
  }, []);
  
  // Toggle monitoring state
  const toggleMonitoring = useCallback(() => {
    setIsMonitoringEnabled(prev => !prev);
    clearMetrics();
    resetRenderCount();
  }, [clearMetrics, resetRenderCount]);
  
  // Track component render counts
  const incrementRenderCount = useCallback(() => {
    if (isMonitoringEnabled) {
      setRenderCount(prev => prev + 1);
    }
  }, [isMonitoringEnabled]);
  
  // Reset render count
  const resetRenderCount = useCallback(() => {
    setRenderCount(0);
  }, []);
  
  const value = {
    startMeasure,
    endMeasure,
    getMetrics,
    clearMetrics,
    isMonitoringEnabled,
    toggleMonitoring,
    renderCount,
    incrementRenderCount,
    resetRenderCount,
  };
  
  return (
    <PerformanceContext.Provider value={value}>
      {children}
      {isMonitoringEnabled && <PerformanceOverlay />}
    </PerformanceContext.Provider>
  );
};

/**
 * Hook to use performance monitoring
 */
export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  
  return context;
};

/**
 * Hook to measure screen render time
 */
export const useScreenPerformance = (screenName: string) => {
  const { startMeasure, endMeasure, incrementRenderCount, resetRenderCount } = usePerformance();
  
  useFocusEffect(
    useCallback(() => {
      const perfId = `screen_${screenName}`;
      startMeasure(perfId);
      
      // Use requestAnimationFrame to measure after render complete
      const rafId = requestAnimationFrame(() => {
        endMeasure(perfId);
        incrementRenderCount();
      });
      
      return () => {
        cancelAnimationFrame(rafId);
        resetRenderCount();
      };
    }, [screenName, startMeasure, endMeasure, incrementRenderCount, resetRenderCount])
  );
};

/**
 * Component performance measure HOC
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => {
    const { startMeasure, endMeasure, incrementRenderCount } = usePerformance();
    const componentId = `component_${componentName}`;
    
    startMeasure(componentId);
    
    // Use setTimeout with 0ms to measure after render
    setTimeout(() => {
      endMeasure(componentId);
      incrementRenderCount();
    }, 0);
    
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `WithPerformance(${componentName})`;
  return WrappedComponent;
}

// Define a custom Performance type that may include memory stats
interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

/**
 * Performance metrics display overlay
 */
const PerformanceOverlay: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    frameTime: 0,
    renderTime: 0,
  });
  const { renderCount } = usePerformance();
  const frameStartTime = useRef(performance.now());
  const frameCount = useRef(0);
  
  // Update metrics on regular interval
  React.useEffect(() => {
    let rafId: number;
    
    const updateMetrics = () => {
      const now = performance.now();
      frameCount.current += 1;
      
      // Update metrics every 1 second
      if (now - frameStartTime.current >= 1000) {
        const frameTime = 1000 / frameCount.current;
        
        setMetrics(prev => ({
          ...prev,
          frameTime,
          renderTime: prev.renderTime,
          // Add memory info if available on platform
          ...(Platform.OS === 'android' ? { 
            jsHeapSize: ((performance as ExtendedPerformance).memory?.usedJSHeapSize ?? 0) / 1048576 
          } : {})
        }));
        
        frameStartTime.current = now;
        frameCount.current = 0;
      }
      
      rafId = requestAnimationFrame(updateMetrics);
    };
    
    rafId = requestAnimationFrame(updateMetrics);
    
    return () => cancelAnimationFrame(rafId);
  }, []);
  
  return (
    <View style={styles.overlay}>
      <Text style={styles.text}>FPS: {(1000 / metrics.frameTime).toFixed(1)}</Text>
      <Text style={styles.text}>Renders: {renderCount}</Text>
      {metrics.jsHeapSize && (
        <Text style={styles.text}>JS Memory: {metrics.jsHeapSize.toFixed(1)} MB</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 4,
    zIndex: 9999,
  },
  text: {
    color: '#fff',
    fontSize: 12,
  },
  toggleButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 8,
    borderRadius: 4,
    zIndex: 9999,
  },
  toggleText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  }
});

// Component for toggling performance monitoring
export const PerformanceToggle: React.FC = () => {
  const { toggleMonitoring, isMonitoringEnabled } = usePerformance();
  
  return (
    <TouchableOpacity 
      onPress={toggleMonitoring} 
      style={[
        styles.toggleButton, 
        { backgroundColor: isMonitoringEnabled ? '#f55' : '#5f5' }
      ]}
    >
      <Text style={styles.toggleText}>
        {isMonitoringEnabled ? 'Disable Perf Monitor' : 'Enable Perf Monitor'}
      </Text>
    </TouchableOpacity>
  );
}; 