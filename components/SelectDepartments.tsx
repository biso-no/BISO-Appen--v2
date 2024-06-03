import React, { useState, useEffect } from 'react';
import { YStack, Text, Stack, useTheme, styled } from 'tamagui';

interface Department {
  id: string;
  name: string;
  campus: string;
}

interface DepartmentSelectorProps {
  campus: string;
  onSelect: (departments: string[]) => void;
}

const StyledCard = styled(Stack, {
  cursor: 'pointer',
  margin: 10,
  padding: 20,
  borderRadius: 10,
  animation: 'medium',
  hoverStyle: {
    scale: 1.05,
  },
  pressStyle: {
    scale: 0.95,
  },
  justifyContent: 'center',
  alignItems: 'center',
  width: 200,
  height: 100,
});

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({ campus, onSelect }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const theme = useTheme();

  useEffect(() => {
    // Fetch departments from backend (this is a placeholder, replace with your actual fetch logic)
    const fetchDepartments = async () => {
      const response = await fetch('/api/departments'); // Replace with your actual endpoint
      const data: Department[] = await response.json();
      setDepartments(data.filter(dept => dept.campus === campus));
    };
    
    fetchDepartments();
  }, [campus]);

  const handleSelect = (departmentId: string) => {
    const newSelection = selectedDepartments.includes(departmentId)
      ? selectedDepartments.filter((id) => id !== departmentId)
      : [...selectedDepartments, departmentId];
    setSelectedDepartments(newSelection);
    onSelect(newSelection);
  };

  return (
    <YStack>
      {departments.map((department) => (
        <StyledCard
          key={department.id}
          onPress={() => handleSelect(department.id)}
          backgroundColor={selectedDepartments.includes(department.id) ? theme.gray2 : theme.gray1}
        >
          <Text>{department.name}</Text>
        </StyledCard>
      ))}
    </YStack>
  );
};

export default DepartmentSelector;
