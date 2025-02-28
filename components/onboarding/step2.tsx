import { View, YStack, Text, H3, Paragraph, XStack, Card, ScrollView } from 'tamagui';
import React, { useEffect, useState } from 'react';
import CampusSelector from '@/components/SelectCampus';
import { MotiView } from 'moti';
import { StyleSheet, Dimensions } from 'react-native';
import { MapPin, Building2, CheckCircle } from '@tamagui/lucide-icons';
import { useAuth } from '../context/auth-provider';
import { Models } from 'react-native-appwrite';
import { useCampus } from '@/lib/hooks/useCampus';
import DepartmentSelector from '../SelectDepartments';
import { updateDocument } from '@/lib/appwrite';

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

  const initialCampus = campus?.$id ? campus : undefined;

  useEffect(() => {
    if (profile?.$id && campus?.$id) {
      async function updateCampusOnInitialLoad() {
        if (!campus) return;
        try {
          const response = await updateDocument('user', profile.$id, { 
            campus: campus.$id,
            campus_id: campus.$id,
          });
          if (response) {
            updateProfile(response);
          }
        } catch (error) {
          console.error("Error updating campus on initial load", error);
        }
      }
      updateCampusOnInitialLoad();
      setSelectedCampus(campus.$id);
    }
  }, []);

  const handleCampusChange = (campus: Models.Document | null) => {
    if (campus) {
      if (profile?.$id) {
        updateProfile({ 
          campus: campus.$id,
          campus_id: campus.$id,
        });
      }
      setSelectedCampus(campus.$id);
      onChange(campus);
      setShowDepartments(true);
    }
  };

  const handleUpdateDepartment = async (selectedDepartment: Models.Document) => {
    const isSelected = departments.some((department) => department.$id === selectedDepartment.$id);
    const newDepartments = isSelected 
      ? departments.filter((department) => department.$id !== selectedDepartment.$id)
      : [...departments, selectedDepartment];
    
    setDepartments(newDepartments);
    
    if (profile?.$id) {
      const response = await updateDocument('user', profile.$id, { 
        departments: newDepartments.map(d => d.$id),
        department_ids: newDepartments.map(d => d.$id),
      });
      if (response) {
        updateProfile(response);
      }
    }
  };
    
  return (
    <ScrollView>
    <YStack width="100%" height={height} alignItems="center">
      <MotiView 
        from={{ opacity: 0, translateY: 20 }} 
        animate={{ opacity: 1, translateY: 0 }} 
        transition={{ type: 'timing', duration: 600 }}
        style={styles.container}
      >
        <YStack space="$4" width="100%">
          <XStack alignItems="center" space="$2">
            <MapPin size={24} color="$primary" />
            <H3>Select Your Campus</H3>
          </XStack>
          
          <Paragraph textAlign="center" opacity={0.8}>
            Choose your campus to see relevant departments and activities
          </Paragraph>
          
          <Card elevate bordered animation="quick" padding="$4">
            <CampusSelector 
              onSelect={handleCampusChange} 
              initialCampus={initialCampus} 
            />
          </Card>
        </YStack>
        
        {showDepartments && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
            style={styles.departmentsContainer}
          >
            <YStack space="$4" flex={1} width="100%">
              <XStack alignItems="center" space="$2">
                <Building2 size={24} color="$primary" />
                <H3>Select Departments</H3>
              </XStack>
              
              <Paragraph textAlign="center" opacity={0.8}>
                Choose one or more departments to follow
              </Paragraph>
              
              <Card 
                elevate 
                bordered 
                animation="quick" 
                padding="$4"
                style={styles.departmentCard}
              >
                {campus && (
                  <DepartmentSelector
                    campus={initialCampus ? initialCampus.$id : campus.$id}
                    onSelect={handleUpdateDepartment}
                    selectedDepartments={departments}
                    multiSelect
                  />
                )}
              </Card>
              
              {departments.length > 0 && (
                <MotiView
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 150 }}
                >
                  <XStack alignItems="center" space="$2" justifyContent="center">
                    <CheckCircle size={18} color="$green10" />
                    <Text color="$green10" fontWeight="600">
                      {departments.length} department{departments.length !== 1 ? 's' : ''} selected
                    </Text>
                  </XStack>
                </MotiView>
              )}
            </YStack>
          </MotiView>
        )}
      </MotiView>
    </YStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  departmentsContainer: {
    width: '100%',
    flex: 1,
    marginTop: 20,
  },
  departmentCard: {
    flex: 1,
    minHeight: 300,
    maxHeight: 500,
  }
});
