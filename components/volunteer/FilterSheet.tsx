import React from "react";
import { useColorScheme } from 'react-native';
import { 
  Text, 
  YStack, 
  XStack,
  Button,
  H2,
  Separator,
  Sheet
} from "tamagui";
import {
  ChevronDown,
  ChevronUp
} from "@tamagui/lucide-icons";
import { JobCategory } from '../../lib/stores/volunteerStore';
import * as LucideIcons from "@tamagui/lucide-icons";

interface FilterSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categories: JobCategory[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  interests: string[];
  selectedInterests: string[];
  onToggleInterest: (interest: string) => void;
  showAllCategories: boolean;
  onToggleShowAllCategories: () => void;
  showAllInterests: boolean;
  onToggleShowAllInterests: () => void;
  onClearFilters: () => void;
  maxVisibleCategories?: number;
  maxVisibleInterests?: number;
}

export function FilterSheet({
  isOpen,
  onOpenChange,
  categories,
  selectedCategory,
  onSelectCategory,
  interests,
  selectedInterests,
  onToggleInterest,
  showAllCategories,
  onToggleShowAllCategories,
  showAllInterests,
  onToggleShowAllInterests,
  onClearFilters,
  maxVisibleCategories = 5,
  maxVisibleInterests = 5
}: FilterSheetProps) {
  const colorScheme = useColorScheme();
  
  // Colors for interest buttons
  const colors = ['blue', 'purple', 'orange', 'pink', 'green', 'yellow', 'red', 'cyan'];
  
  // Get visible categories based on showAllCategories state
  const visibleCategories = showAllCategories 
    ? categories 
    : categories.slice(0, maxVisibleCategories);
    
  // Get visible interests based on showAllInterests state
  const visibleInterests = showAllInterests
    ? interests
    : interests.slice(0, maxVisibleInterests);
    
  // Get icon component from name
  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.Users;
  };

  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={onOpenChange}
      snapPoints={[50]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame padding="$4">
        <Sheet.Handle />
        <Sheet.ScrollView>
          <YStack gap="$4">
            <H2 size="$6" fontWeight="700">Filters</H2>
            <Separator />
            
            {/* Categories section */}
            <YStack gap="$4">
              <Text fontWeight="600">Position Type</Text>
              <XStack flexWrap="wrap" gap="$2">
                {visibleCategories.map(category => {
                  const isSelected = selectedCategory === category.id;
                  const Icon = getIconComponent(category.icon);
                  
                  return (
                    <Button
                      key={category.id}
                      size="$3"
                      theme={category.color}
                      borderRadius="$6"
                      backgroundColor={isSelected ? 
                        `$${category.color}5` : 
                        `$${category.color}2`
                      }
                      borderColor={isSelected ? 
                        `$${category.color}8` : 
                        `$${category.color}4`
                      }
                      borderWidth={1}
                      icon={<Icon size={16} />}
                      pressStyle={{ scale: 0.96 }}
                      onPress={() => onSelectCategory(category.id)}
                      marginBottom="$2"
                    >
                      <Text 
                        color={isSelected ? 
                          `$${category.color}12` : 
                          `$${category.color}11`
                        }
                        fontWeight={isSelected ? "700" : "500"}
                      >
                        {category.name}
                      </Text>
                    </Button>
                  );
                })}
                
                {categories.length > maxVisibleCategories && (
                  <Button
                    size="$3"
                    theme="gray"
                    borderRadius="$6"
                    backgroundColor="$gray2"
                    borderColor="$gray4"
                    borderWidth={1}
                    pressStyle={{ scale: 0.96 }}
                    onPress={onToggleShowAllCategories}
                    marginBottom="$2"
                    icon={showAllCategories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  >
                    {showAllCategories ? "Show Less" : `${categories.length - maxVisibleCategories} More`}
                  </Button>
                )}
              </XStack>
            </YStack>
            
            {/* Interests section */}
            {interests.length > 0 && (
              <YStack gap="$4">
                <Text fontWeight="600">Interests</Text>
                <XStack flexWrap="wrap" gap="$2">
                  {visibleInterests.map((interest, index) => {
                    const isSelected = selectedInterests.includes(interest);
                    const color = colors[index % colors.length];
                    
                    return (
                      <Button
                        key={interest}
                        size="$3"
                        theme={color}
                        borderRadius="$6"
                        backgroundColor={isSelected ? 
                          `$${color}5` : 
                          `$${color}2`
                        }
                        borderColor={isSelected ? 
                          `$${color}8` : 
                          `$${color}4`
                        }
                        borderWidth={1}
                        pressStyle={{ scale: 0.96 }}
                        onPress={() => onToggleInterest(interest)}
                        marginBottom="$2"
                      >
                        <Text 
                          color={isSelected ? 
                            `$${color}12` : 
                            `$${color}11`
                          }
                          fontWeight={isSelected ? "700" : "500"}
                        >
                          {interest}
                        </Text>
                      </Button>
                    );
                  })}
                  
                  {interests.length > maxVisibleInterests && (
                    <Button
                      size="$3"
                      theme="gray"
                      borderRadius="$6"
                      backgroundColor="$gray2"
                      borderColor="$gray4"
                      borderWidth={1}
                      pressStyle={{ scale: 0.96 }}
                      onPress={onToggleShowAllInterests}
                      marginBottom="$2"
                      icon={showAllInterests ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    >
                      {showAllInterests ? "Show Less" : `${interests.length - maxVisibleInterests} More`}
                    </Button>
                  )}
                </XStack>
              </YStack>
            )}
            
            {/* Action buttons */}
            <XStack gap="$4" marginTop="$4">
              <Button 
                theme="gray" 
                size="$4"
                flex={1}
                onPress={onClearFilters}
              >
                Clear Filters
              </Button>
              
              <Button 
                theme="blue" 
                size="$4"
                flex={1}
                onPress={() => onOpenChange(false)}
              >
                Apply Filters
              </Button>
            </XStack>
          </YStack>
        </Sheet.ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
} 