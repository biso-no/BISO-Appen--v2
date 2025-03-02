import React from "react";
import { useColorScheme } from 'react-native';
import { MotiView } from 'moti';
import { 
  Text, 
  XStack, 
  YStack,
  Button, 
  ScrollView
} from "tamagui";
import {
  ChevronDown,
  ChevronUp,
  Building
} from "@tamagui/lucide-icons";
import * as LucideIcons from "@tamagui/lucide-icons";

interface FacultyFilterProps {
  allFaculties: Array<{
    id: string;
    name: string;
    count?: number;
  }>;
  selectedFaculty: string;
  onSelectFaculty: (facultyId: string) => void;
}

export function FacultyFilter({
  allFaculties,
  selectedFaculty,
  onSelectFaculty
}: FacultyFilterProps) {
  const colorScheme = useColorScheme();
  
  // Predefined colors for faculties
  const colors = ['blue', 'purple', 'orange', 'pink', 'green', 'yellow'];
  
  // Default icons if not specified
  const defaultIcons = ['Building', 'Briefcase', 'Book', 'FlaskConical', 'Wrench', 'GraduationCap'];
  
  // Get icon component
  const getIconComponent = (index: number) => {
    const iconName = defaultIcons[index % defaultIcons.length];
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Building;
    return Icon;
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 5 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', delay: 200 }}
    >
      <YStack padding="$3">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          <XStack gap="$2" paddingVertical="$1">
            {allFaculties.map((faculty, index) => {
              const isSelected = selectedFaculty === faculty.id;
              const color = colors[index % colors.length];
              const Icon = getIconComponent(index);
              
              return (
                <Button
                  key={faculty.id}
                  size="$3"
                  theme={color}
                  borderRadius="$10"
                  backgroundColor={isSelected ? 
                    `$${color}5` : 
                    `$${color}2`
                  }
                  borderColor={isSelected ? 
                    `$${color}8` : 
                    `$${color}4`
                  }
                  borderWidth={1}
                  paddingHorizontal="$3"
                  pressStyle={{ scale: 0.96 }}
                  onPress={() => onSelectFaculty(faculty.id)}
                  marginHorizontal="$1"
                >
                  <Icon size={16} />
                  <Text 
                    color={isSelected ? 
                      `$${color}12` : 
                      `$${color}11`
                    }
                    fontWeight={isSelected ? "700" : "500"}
                  >
                    {faculty.name}
                  </Text>
                  {faculty.count !== undefined && (
                    <Text 
                      fontSize="$2"
                      paddingLeft="$1" 
                      paddingRight="$0.5"
                      color={isSelected ? 
                        `$${color}12` : 
                        `$${color}10`
                      }
                      opacity={0.8}
                    >
                      ({faculty.count})
                    </Text>
                  )}
                </Button>
              );
            })}
          </XStack>
        </ScrollView>
      </YStack>
    </MotiView>
  );
} 