import React, { useState, useCallback, useEffect } from 'react';
import { 
  YStack, Input, ScrollView, Card, XStack, 
  Button, Spinner, Text, H4,
} from 'tamagui';
import { Models, Query } from 'react-native-appwrite';
import { Search, Check, X, Info } from '@tamagui/lucide-icons';
import { databases } from '@/lib/appwrite';

interface DepartmentSelectorProps {
  campus: string | null | undefined;
  onSelect: (department: Models.Document) => void;
  selectedDepartments: Models.Document[];
  multiSelect?: boolean;
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({ 
  campus, 
  onSelect, 
  selectedDepartments
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState<Models.Document[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (campus) {
      const fetchDepartments = async () => {
        setLoading(true);
        try {
          const response = await databases.listDocuments('app', 'departments', [
            Query.equal('campus_id', campus),
            Query.select(['Name', '$id', 'campus_id']),
            Query.limit(200),
          ]);
          setDepartments(response.documents);
        } catch (error) {
          console.error('Error fetching departments:', error);
        }
        setLoading(false);
      };
      fetchDepartments();
    }
  }, [campus]);

  const filteredDepartments = departments.filter(dept => 
    dept.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = useCallback((department: Models.Document) => 
    selectedDepartments.some(d => d.$id === department.$id),
  [selectedDepartments]);

  return (
    <YStack gap="$4" flex={1}>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center">
        <H4>Follow Units</H4>
        <XStack 
          backgroundColor="$blue4" 
          paddingHorizontal="$3" 
          paddingVertical="$2" 
          borderRadius="$4"
          gap="$2"
          alignItems="center"
        >
          <Info size={16} />
          <Text>
            {selectedDepartments.length} selected
          </Text>
        </XStack>
      </XStack>

      {/* Search */}
      <Card bordered padding="$2">
        <XStack gap="$2" alignItems="center">
          <Search size={20} opacity={0.5} />
          <Input
            placeholder="Search units..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            flex={1}
            borderWidth={0}
            backgroundColor="transparent"
          />
          {searchTerm && (
            <Button
              size="$2"
              circular
              icon={X}
              onPress={() => setSearchTerm('')}
              backgroundColor="transparent"
              opacity={0.5}
            />
          )}
        </XStack>
      </Card>

      {/* Selected Units */}
      {selectedDepartments.length > 0 && (
        <YStack gap="$2">
          <Text color="$gray11">Selected units:</Text>
          <XStack flexWrap="wrap" gap="$2">
            {selectedDepartments.map((dept) => (
              <Button
                key={dept.$id}
                size="$3"
                theme="active"
                onPress={() => onSelect(dept)}
                iconAfter={X}
              >
                {dept.Name}
              </Button>
            ))}
          </XStack>
        </YStack>
      )}

      {/* Units List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$2">
          {loading ? (
            <Card padding="$4" alignItems="center">
              <Spinner size="large" />
            </Card>
          ) : filteredDepartments.length > 0 ? (
            filteredDepartments.map((department) => {
              const selected = isSelected(department);
              return (
                <Button
                  key={department.$id}
                  size="$4"
                  borderRadius="$4"
                  backgroundColor={selected ? '$blue8' : '$gray4'}
                  pressStyle={{ scale: 0.98 }}
                  onPress={() => onSelect(department)}
                  justifyContent="space-between"
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                >
                  <Text 
                    color={selected ? 'white' : '$gray12'}
                    fontWeight={selected ? 'bold' : 'normal'}
                  >
                    {department.Name}
                  </Text>
                  {selected && (
                    <Check 
                      size={20} 
                      color="white"
                    />
                  )}
                </Button>
              );
            })
          ) : (
            <Card padding="$4" alignItems="center">
              <Text color="$gray11">No units found</Text>
            </Card>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
};

export default DepartmentSelector;