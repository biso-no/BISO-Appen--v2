import React, { useState, useCallback, useEffect } from 'react';
import { YStack, Input, Spinner, ScrollView, YGroup, ListItem, Separator, useTheme } from 'tamagui';
import { Models, Query } from 'react-native-appwrite';
import { Check } from '@tamagui/lucide-icons';
import { databases } from '@/lib/appwrite';

interface DepartmentSelectorProps {
  campus: string | null | undefined;
  onSelect: (department: Models.Document) => void;
  selectedDepartments: Models.Document[];
  multiSelect?: boolean;
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({ campus, onSelect, selectedDepartments, multiSelect = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();
  const [filteredDepartments, setDepartments] = useState<Models.Document[]>([]);

  const handleSelect = useCallback((department: Models.Document) => {
    onSelect(department);
  }, [onSelect]);

  useEffect(() => {
    if (campus) {
      const fetchDepartments = async () => {
        const response = await databases.listDocuments('app', 'departments', [
          Query.equal('campus_id', campus),
          Query.select(['Name', '$id', 'campus_id'])
        ]);
        setDepartments(response.documents);
      };
      fetchDepartments();
    }
  }, [campus]);

  const isSelected = (department: Models.Document) => selectedDepartments.some(d => d.$id === department.$id);

  return (
    <YStack flex={1}>
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
