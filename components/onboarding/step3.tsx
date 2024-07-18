import { View } from 'tamagui';
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
    setDepartments(prevDepartments => [...prevDepartments, newDepartment]);
    if (onNext) {
      onNext();
    }
  };

  return (
    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <View>{campus && <DepartmentSelector campus={campus} onSelect={handleDepartmentChange} selectedDepartments={departments} multiSelect />}</View>
    </MotiView>
  );
};

