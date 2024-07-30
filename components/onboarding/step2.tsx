import { View } from 'tamagui';
import React, { useEffect, useState } from 'react';
import CampusSelector from '@/components/SelectCampus';
import { MotiView } from 'moti';
import { useAuth } from '../context/auth-provider';
import { Models } from 'react-native-appwrite';
import { useCampus } from '@/lib/hooks/useCampus';
import DepartmentSelector from '../SelectDepartments';
import { MyStack } from '../ui/MyStack';
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


  const initialCampus = campus?.$id ? campus : undefined;

  useEffect(() => {
    if (!profile) {
      return;
    }
  
    if (profile?.$id && campus?.$id) {
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
  

  const handleCampusChange = (campus: Models.Document | null) => {
    if (campus) {
      updateProfile({ 
        campus: campus.$id,
        campus_id: campus.$id,
       });
       setSelectedCampus(campus.$id);
      onChange(campus);
    }
    if (onNext) {
      onNext();
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
    if (departments.some((department) => department.$id === selectedDepartment.$id)) {
      await removeDepartment(selectedDepartment);
    } else {
      await addDepartment(selectedDepartment);
    }
  };
    
  return (
    <MyStack justifyContent="center" alignItems="center" space="$4" width="100%">
    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <CampusSelector onSelect={handleCampusChange} initialCampus={initialCampus} />
        <View style={{ flex: 1 }}>{campus && <DepartmentSelector
                  campus={initialCampus ? initialCampus.$id : campus.$id}
                  onSelect={handleUpdateDepartment}
                  selectedDepartments={departments}
                  multiSelect
                />
                }</View>
    </MotiView>
    </MyStack>
  );
};
