import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  YStack, Input, ScrollView, Card, XStack, 
  Button, Spinner, Text, H4,
  Theme
} from 'tamagui';
import { Models, Query } from 'react-native-appwrite';
import { Search, Check, X, Building2, Users2 } from '@tamagui/lucide-icons';
import { databases } from '@/lib/appwrite';
import { MotiView } from 'moti';
import { useColorScheme, ColorSchemeName } from 'react-native';

interface DepartmentSelectorProps {
  campus: string | null | undefined;
  onSelect: (department: Models.Document) => void;
  selectedDepartments: Models.Document[];
  multiSelect?: boolean;
  title?: string;
}

// Memoized department item to prevent unnecessary re-renders
const DepartmentItem = React.memo(({ 
  department, 
  selected, 
  onSelect, 
  colorScheme 
}: { 
  department: Models.Document;
  selected: boolean;
  onSelect: () => void;
  colorScheme: ColorSchemeName;
}) => (
  <Button
    size="$4"
    borderRadius="$6"
    backgroundColor={selected ? '$blue8' : colorScheme === 'dark' ? '$gray3' : 'white'}
    borderWidth={1}
    borderColor={selected ? '$blue7' : '$gray4'}
    pressStyle={{ scale: 0.98 }}
    onPress={onSelect}
    paddingHorizontal="$4"
    paddingVertical="$3"
  >
    <XStack gap="$3" alignItems="center" flex={1}>
      <Building2 
        size={20} 
        color={selected ? 'white' : '$blue10'} 
      />
      <Text 
        color={selected ? 'white' : '$color'}
        fontWeight={selected ? '600' : '400'}
        flex={1}
      >
        {department.Name}
      </Text>
      {selected && <Check size={20} color="white" />}
    </XStack>
  </Button>
));

DepartmentItem.displayName = 'DepartmentItem';

// Memoized selected department tag
const SelectedDepartmentTag = React.memo(({ 
  dept, 
  onSelect, 
  colorScheme 
}: { 
  dept: Models.Document;
  onSelect: () => void;
  colorScheme: ColorSchemeName;
}) => (
  <Theme name="blue">
    <Button
      size="$3"
      borderRadius="$10"
      backgroundColor={colorScheme === 'dark' ? '$blue4' : '$blue3'}
      borderColor={colorScheme === 'dark' ? '$blue5' : '$blue4'}
      borderWidth={1}
      pressStyle={{ scale: 0.97 }}
      onPress={onSelect}
      icon={Building2}
      iconAfter={X}
    >
      <Text 
        fontSize="$3"
        color={colorScheme === 'dark' ? '$blue11' : '$blue11'}
        fontWeight="500"
      >
        {dept.Name}
      </Text>
    </Button>
  </Theme>
));

SelectedDepartmentTag.displayName = 'SelectedDepartmentTag';

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({ 
  campus, 
  onSelect, 
  selectedDepartments,
  title = 'Follow Units'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState<Models.Document[]>([]);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (campus) {
      const fetchDepartments = async () => {
        setLoading(true);
        try {
          const response = await databases.listDocuments('app', 'departments', [
            Query.equal('campus_id', campus),
            Query.equal('active', true),
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

  const filteredDepartments = useMemo(() => 
    departments.filter(dept => 
      dept.Name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  [departments, searchTerm]);

  const isSelected = useCallback((department: Models.Document) => 
    selectedDepartments.some(d => d.$id === department.$id),
  [selectedDepartments]);

  const handleDepartmentSelect = useCallback((department: Models.Document) => {
    onSelect(department);
  }, [onSelect]);

  return (
    <YStack gap="$4" flex={1}>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center">
        <XStack gap="$2" alignItems="center">
          <Building2 size={24} color="$blue10" />
          <H4>{title}</H4>
        </XStack>
        <Theme name="blue">
          <Button
            size="$3"
            borderRadius="$10"
            backgroundColor={colorScheme === 'dark' ? '$blue4' : '$blue3'}
            borderColor={colorScheme === 'dark' ? '$blue5' : '$blue4'}
            borderWidth={1}
            icon={Users2}
            iconAfter={null}
          >
            <Text 
              fontSize="$3"
              color={colorScheme === 'dark' ? '$blue11' : '$blue11'}
              fontWeight="500"
            >
              {selectedDepartments.length} selected
            </Text>
          </Button>
        </Theme>
      </XStack>

      {/* Search bar */}
      <Card 
        bordered 
        padding="$3"
        backgroundColor={colorScheme === 'dark' ? '$gray3' : 'white'}
      >
        <XStack gap="$2" alignItems="center">
          <Search size={20} color="$blue10" />
          <Input
            placeholder="Search units..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            flex={1}
            borderWidth={0}
            backgroundColor="transparent"
            fontSize="$4"
            placeholderTextColor="$gray9"
          />
          {searchTerm && (
            <Button
              size="$3"
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
          <Text color="$gray11" fontSize="$3" fontWeight="500">Selected units:</Text>
          <XStack flexWrap="wrap" gap="$2">
            {selectedDepartments.map((dept) => (
              <SelectedDepartmentTag
                key={dept.$id}
                dept={dept}
                onSelect={() => handleDepartmentSelect(dept)}
                colorScheme={colorScheme}
              />
            ))}
          </XStack>
        </YStack>
      )}

      {/* Units List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$2" paddingBottom="$8">
          {loading ? (
            <Card padding="$6" alignItems="center" backgroundColor="$gray1">
              <Spinner size="large" color="$blue10" />
            </Card>
          ) : filteredDepartments.length > 0 ? (
            filteredDepartments.map((department) => (
              <DepartmentItem
                key={department.$id}
                department={department}
                selected={isSelected(department)}
                onSelect={() => handleDepartmentSelect(department)}
                colorScheme={colorScheme}
              />
            ))
          ) : (
            <Card 
              padding="$6" 
              alignItems="center" 
              backgroundColor={colorScheme === 'dark' ? '$gray3' : '$gray1'}
            >
              <Text color="$gray11" fontSize="$4">No units found</Text>
            </Card>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
};

export default DepartmentSelector;