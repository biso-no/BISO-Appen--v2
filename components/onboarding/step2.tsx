import { View, YStack, Text, H3, Paragraph, XStack, Card, ScrollView } from 'tamagui';
import React, { useEffect, useState } from 'react';
import CampusSelector from '@/components/SelectCampus';
import { MotiView } from 'moti';
import { useAuth } from '../context/auth-provider';
import { Models } from 'react-native-appwrite';
import { useCampus } from '@/lib/hooks/useCampus';
import DepartmentSelector from '../SelectDepartments';
import { MyStack } from '../ui/MyStack';
import { updateDocument } from '@/lib/appwrite';
import { StyleSheet, Dimensions } from 'react-native';
import { MapPin, Building2, CheckCircle } from '@tamagui/lucide-icons';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSequence, 
  withTiming, 
  withDelay,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface Step2Props {
  onNext?: () => void | Promise<void>;
}

export function Step2({ onNext }: Step2Props) {
  const { updateUserPrefs } = useAuth();
  const { campus, onChange } = useCampus();
  const { profile, updateProfile } = useAuth();
  const [departments, setDepartments] = useState<Models.Document[]>(profile?.departments ?? []);
  const [selectedCampus, setSelectedCampus] = useState<string | null | undefined>(campus?.$id);
  const [showDepartments, setShowDepartments] = useState(false);
  const { width, height } = Dimensions.get('window');
  
  // Animation values
  const mapPinScale = useSharedValue(1);
  const buildingScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(20);

  const initialCampus = campus?.$id ? campus : undefined;

  useEffect(() => {
    // Start animations
    mapPinScale.value = withSequence(
      withTiming(1.2, { duration: 300 }),
      withTiming(1, { duration: 300 })
    );
    
    cardOpacity.value = withTiming(1, { duration: 600 });
    cardTranslateY.value = withTiming(0, { duration: 600 });
    
    if (profile && profile.$id && campus?.$id) {
      async function updateCampusOnInitialLoad() {
        try {
          const response = await updateDocument('user', profile.$id, { 
            campus: campus?.$id,
            campus_id: campus?.$id,
          });
          updateProfile(response);
        } catch (error) {
          console.error("Error updating campus on initial load", error);
        }
      }
      updateCampusOnInitialLoad();
      setSelectedCampus(campus.$id);
    }
  }, []);
  
  // Animate building icon when departments are shown
  useEffect(() => {
    if (showDepartments) {
      buildingScale.value = withSequence(
        withTiming(1.2, { duration: 300 }),
        withTiming(1, { duration: 300 })
      );
    }
  }, [showDepartments]);

  const handleCampusChange = (campus: Models.Document | null) => {
    if (campus) {
      // Animate map pin on selection
      mapPinScale.value = withSequence(
        withTiming(1.3, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
      
      updateProfile({ 
        campus: campus.$id,
        campus_id: campus.$id,
      });
      setSelectedCampus(campus.$id);
      onChange(campus);
      
      // Show departments after a short delay
      setTimeout(() => {
        setShowDepartments(true);
      }, 300);
    }
  };

  const addDepartment = async (selectedDepartment: Models.Document) => {
    if (!profile) {
      return;
    }
    const newDepartments = [...departments, selectedDepartment];
    setDepartments(newDepartments);
    const response = await updateDocument('user', profile.$id, { 
      departments: newDepartments.map(d => d.$id),
      department_ids: newDepartments.map(d => d.$id),
    });
    if (response) {
      updateProfile(response);
    }
  };

  const removeDepartment = async (selectedDepartment: Models.Document) => {
    if (!profile) {
      return;
    }
    const newDepartments = departments.filter((department) => department.$id !== selectedDepartment.$id);
    setDepartments(newDepartments);
    const response = await updateDocument('user', profile.$id, { 
      departments: newDepartments.map(d => d.$id),
      department_ids: newDepartments.map(d => d.$id),
    });
    if (response) {
      updateProfile(response);
    }
  };

  const handleUpdateDepartment = async (selectedDepartment: Models.Document) => {
    if (!profile) {
      return;
    }
    
    // Animate building icon on selection
    buildingScale.value = withSequence(
      withTiming(1.2, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );
    
    if (departments.some((department) => department.$id === selectedDepartment.$id)) {
      await removeDepartment(selectedDepartment);
    } else {
      await addDepartment(selectedDepartment);
    }
  };
  
  // Animated styles
  const mapPinAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: mapPinScale.value }],
    };
  });
  
  const buildingAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buildingScale.value }],
    };
  });
  
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cardOpacity.value,
      transform: [{ translateY: cardTranslateY.value }],
    };
  });
    
  return (
    <YStack flex={1} width="100%" alignItems="center">
      <ScrollView 
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <MotiView 
          from={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          style={styles.container}
        >
          <YStack space="$2" width="100%" alignItems="center">
            <XStack alignItems="center" space="$2">
              <Animated.View style={mapPinAnimatedStyle}>
                <MapPin size={22} color="$primary" />
              </Animated.View>
              <H3 fontWeight="bold">Select Your Campus</H3>
            </XStack>
            
            <Paragraph textAlign="center" opacity={0.8} paddingHorizontal="$4" marginBottom="$1">
              Choose your campus to see relevant departments and activities
            </Paragraph>
            
            <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
              <Card
                elevate
                bordered
                animation="quick"
                scale={0.97}
                hoverStyle={{ scale: 1 }}
                pressStyle={{ scale: 0.96 }}
                style={styles.campusCard}
              >
                <Card.Background>
                  <LinearGradient
                    colors={['rgba(120, 120, 255, 0.1)', 'rgba(100, 100, 255, 0.05)']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                </Card.Background>
                <CampusSelector 
                  onSelect={handleCampusChange} 
                  initialCampus={initialCampus} 
                />
              </Card>
            </Animated.View>
            
            {showDepartments && (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 500 }}
                style={styles.departmentsContainer}
              >
                <YStack space="$2" width="100%" alignItems="center" marginTop="$2">
                  <XStack alignItems="center" space="$2">
                    <Animated.View style={buildingAnimatedStyle}>
                      <Building2 size={22} color="$primary" />
                    </Animated.View>
                    <H3 fontWeight="bold">Select Departments</H3>
                  </XStack>
                  
                  <Paragraph textAlign="center" opacity={0.8} paddingHorizontal="$4" marginBottom="$1">
                    Choose one or more departments to follow
                  </Paragraph>
                  
                  <Card
                    elevate
                    bordered
                    animation="quick"
                    scale={0.97}
                    hoverStyle={{ scale: 1 }}
                    pressStyle={{ scale: 0.96 }}
                    style={styles.departmentCard}
                  >
                    <Card.Background>
                      <LinearGradient
                        colors={['rgba(120, 120, 255, 0.05)', 'rgba(100, 100, 255, 0.02)']}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                    </Card.Background>
                    
                    <ScrollView 
                      style={styles.departmentScroll} 
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.scrollContent}
                    >
                      {campus && (
                        <DepartmentSelector
                          campus={initialCampus ? initialCampus.$id : campus.$id}
                          onSelect={handleUpdateDepartment}
                          selectedDepartments={departments}
                          multiSelect
                        />
                      )}
                    </ScrollView>
                  </Card>
                  
                  {departments.length > 0 && (
                    <MotiView
                      from={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 150 }}
                      style={styles.selectionIndicator}
                    >
                      <XStack alignItems="center" space="$2">
                        <CheckCircle size={16} color="$green10" />
                        <Text color="$green10" fontWeight="600">
                          {departments.length} department{departments.length !== 1 ? 's' : ''} selected
                        </Text>
                      </XStack>
                    </MotiView>
                  )}
                </YStack>
              </MotiView>
            )}
          </YStack>
        </MotiView>
      </ScrollView>
    </YStack>
  );
}

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380;

const styles = StyleSheet.create({
  mainScroll: {
    width: '100%',
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    width: '100%',
    paddingBottom: 20,
  },
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cardContainer: {
    width: '100%',
    marginTop: 4,
  },
  campusCard: {
    width: '100%',
    padding: 12,
    overflow: 'hidden',
  },
  departmentsContainer: {
    width: '100%',
  },
  departmentCard: {
    width: '100%',
    padding: 12,
    overflow: 'hidden',
    height: isSmallDevice ? 200 : 260,
  },
  departmentScroll: {
    height: isSmallDevice ? 160 : 220,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  selectionIndicator: {
    marginTop: 8,
    paddingVertical: 2,
  },
});
