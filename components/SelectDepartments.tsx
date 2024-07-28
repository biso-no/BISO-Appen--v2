import React, { useState, useCallback, useEffect } from 'react';
import { YStack, Input, Spinner, ScrollView, YGroup, ListItem, Separator, useTheme } from 'tamagui';
import { Models } from 'react-native-appwrite';
import { Check } from '@tamagui/lucide-icons';

interface DepartmentSelectorProps {
  campus: Models.Document | null | undefined;
  onSelect: (department: Models.Document) => void;
  selectedDepartments: Models.Document[];
  multiSelect?: boolean;
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({ campus, onSelect, selectedDepartments, multiSelect = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();

  const handleSelect = useCallback((department: Models.Document) => {
    onSelect(department);
  }, [onSelect]);

  const filteredDepartments = campus?.departments?.filter((department: Models.Document) =>
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
      <ScrollView flexGrow={1}>
        <YGroup alignSelf='center' size="$4" animation="medium" bordered>
          {filteredDepartments?.map((department: Models.Document) => (
            <YGroup.Item key={department.$id}>
              <ListItem
                title={department.Name}
                icon={isSelected(department) ? <Check animation={'spring'} /> : undefined}
                backgroundColor={isSelected(department) ? theme?.primary?.get() : undefined}
                onPress={() => handleSelect(department)}
              />
              <Separator direction='rtl' />
            </YGroup.Item>
          ))}
        </YGroup>
      </ScrollView>
    </YStack>
  );
};

export default DepartmentSelector;
