import React, { useState, useEffect, useCallback } from 'react';
import { YStack, Text, Input, Spinner, ScrollView, YGroup, ListItem, Separator, styled, useTheme, Stack, Card } from 'tamagui';
import { getDepartmentsByCampus } from '@/lib/appwrite';
import { Models } from 'react-native-appwrite';

interface DepartmentSelectorProps {
  campus: string;
  onSelect: (departments: string[]) => void;
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

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({ campus, onSelect, multiSelect = false }) => {
  const [departments, setDepartments] = useState<Models.DocumentList<Models.Document>>();
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const theme = useTheme();

  const background = theme?.background?.get();

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      const response = await getDepartmentsByCampus(campus);
      setDepartments(response);
      setLoading(false);
    };

    fetchDepartments();
  }, [campus]);

  useEffect(() => {
    setSelectedDepartment(null);
    setSelectedDepartments([]);
  }, [campus]);

  const handleSelect = useCallback((departmentId: string | null) => {

    if (!departmentId) {
      setSelectedDepartment(null);
      onSelect([]);
      return;
    }

    if (!multiSelect) {
      const newSelection = selectedDepartment === departmentId ? null : departmentId;
      setSelectedDepartment(newSelection);
      onSelect(newSelection ? [newSelection] : []);
    } else {
      const newSelection = selectedDepartments.includes(departmentId)
        ? selectedDepartments.filter((id) => id !== departmentId)
        : [...selectedDepartments, departmentId];
      setSelectedDepartments(newSelection);
      onSelect(newSelection);
    }
  }, [selectedDepartment, selectedDepartments, multiSelect, onSelect]);

  const filteredDepartments = departments?.documents.filter((department) =>
    department.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <YStack>
      {!selectedDepartment && (
      <Input
        placeholder="Search departments..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        marginBottom={20}
      />
      )}
      {loading ? (
        <Spinner size="large" />
      ) : (
        <ScrollView flexGrow={1}>
          {selectedDepartment && !multiSelect ? (
            <Card animation="medium" key={selectedDepartment} width="100%" padding="$3" backgroundColor="$background" borderRadius="$3" bordered onPress={() => handleSelect("")}>
              <Card.Header>
                <YStack>
                  <Text>{departments?.documents.find((department) => department.$id === selectedDepartment)?.Name}</Text>
                </YStack>
              </Card.Header>
            </Card>
          ) : (
            
            <YGroup alignSelf='center' size="$4" animation="medium" bordered>
              {filteredDepartments?.map((department) => (
                <YGroup.Item key={department.$id}>
                                <ListItem
                title={department.Name}
                onPress={() => handleSelect(department.$id)}
              />
                  <Separator direction='rtl' />
                </YGroup.Item>
              ))}
            </YGroup>
          )}
        </ScrollView>
      )}
    </YStack>
  );
};

export default DepartmentSelector;
