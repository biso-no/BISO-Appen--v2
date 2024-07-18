import React, { useState, useEffect, useCallback } from 'react';
import { YStack, Text, Input, Spinner, ScrollView, YGroup, ListItem, Separator, styled, useTheme, Stack, Card } from 'tamagui';
import { getDepartmentsByCampus } from '@/lib/appwrite';
import { Models } from 'react-native-appwrite';
import { Check } from '@tamagui/lucide-icons';

interface DepartmentSelectorProps {
  campus: string;
  onSelect: (departments: Models.Document) => void;
  selectedDepartments: Models.Document[];
  multiSelect?: boolean;
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
});

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({ campus, onSelect, selectedDepartments, multiSelect = false }) => {
  const [departments, setDepartments] = useState<Models.DocumentList<Models.Document>>();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const theme = useTheme();

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      const response = await getDepartmentsByCampus(campus);
      setDepartments(response);
      setLoading(false);
    };

    fetchDepartments();
  }, [campus]);

  const handleSelect = useCallback((department: Models.Document) => {
    let newSelection;
    if (multiSelect) {
      newSelection = selectedDepartments.some(d => d.$id === department.$id)
        ? selectedDepartments.filter((d) => d.$id !== department.$id)
        : [...selectedDepartments, department];
    } else {
      newSelection = [department];
    }
    onSelect({...department, ...newSelection});
  }, [selectedDepartments, multiSelect, onSelect]);

  const handleRemove = useCallback((department: Models.Document) => {
    const newSelection = selectedDepartments.filter((d) => d.$id !== department.$id);
    onSelect({...department, ...newSelection});
  }, [selectedDepartments, onSelect]);

  const filteredDepartments = departments?.documents.filter((department) =>
    department.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (department: Models.Document) => selectedDepartments.some(d => d.$id === department.$id);

  return (
    <YStack>
      <Input
        placeholder="Search departments..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        marginBottom={20}
      />
      {loading ? (
        <Spinner size="large" />
      ) : (
        <ScrollView flexGrow={1}>
          <YGroup alignSelf='center' size="$4" animation="medium" bordered>
            {filteredDepartments?.map((department) => (
              <YGroup.Item key={department.$id}>
                <ListItem
                  title={department.Name}
                  icon={isSelected(department) ? <Check animation={'spring'} /> : undefined}
                  backgroundColor={isSelected(department) ? theme?.primary?.get() : undefined}
                  onPress={() => {
                    if (isSelected(department)) {
                      handleRemove(department);
                    } else {
                      handleSelect(department);
                    }
                  }}
                />
                <Separator direction='rtl' />
              </YGroup.Item>
            ))}
          </YGroup>
        </ScrollView>
      )}
    </YStack>
  );
};

export default DepartmentSelector;
