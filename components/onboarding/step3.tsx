import { ScrollView, View, YStack } from 'tamagui';
import React, { useState } from 'react';
import DepartmentSelector from '@/components/SelectDepartments';
import { MotiView } from 'moti';
import { Models } from 'react-native-appwrite';

interface Step3Props {
  campus?: string;
  onNext?: () => void | Promise<void>;
}

export function Step3({ campus, onNext }: Step3Props) {
  const [departments, setDepartments] = useState<Models.Document[]>([]);

  const handleDepartmentChange = (newDepartment: Models.Document) => {
    setDepartments(prevDepartments => {
      const isAlreadySelected = prevDepartments.some(dept => dept.$id === newDepartment.$id);
      if (isAlreadySelected) {
        return prevDepartments.filter(dept => dept.$id !== newDepartment.$id);
      }
      return [...prevDepartments, newDepartment];
    });
    if (onNext) {
      onNext();
    }
  };

  return (
    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
        <YStack>{campus && <DepartmentSelector campus={campus} onSelect={handleDepartmentChange} selectedDepartments={departments} multiSelect />}</YStack>
      </ScrollView>
    </MotiView>
  );
}
