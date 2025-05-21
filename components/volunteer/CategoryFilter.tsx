import React from "react";
import { MotiView } from 'moti';
import { 
  Text, 
  XStack, 
  YStack,
  Button, 
} from "tamagui";
import {
  ChevronDown,
  ChevronUp
} from "@tamagui/lucide-icons";
import { JobCategory } from '../../lib/stores/volunteerStore';
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';

// Import the necessary icons from lucide-icons
import * as LucideIcons from "@tamagui/lucide-icons";

interface CategoryFilterProps {
  categories: JobCategory[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  showAllCategories: boolean;
  onToggleShowAll: () => void;
  maxVisible?: number;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  showAllCategories,
  onToggleShowAll,
  maxVisible = 5
}: CategoryFilterProps) {
  const { t } = useTranslation();
  // Only show up to maxVisible categories when not showing all
  const visibleCategories = showAllCategories 
    ? categories 
    : categories.slice(0, maxVisible);
  
  // Get the correct icon component based on the icon name
  const getIconComponent = (iconName: string) => {
    // Try to get the icon from Lucide Icons
    const Icon = (LucideIcons as any)[iconName];
    
    if (Icon) {
      return Icon;
    }
    
    // Fallback to Users icon if not found
    return LucideIcons.Users;
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', delay: 400 }}
    >
      <YStack padding="$4" paddingTop="$5" gap="$3">
        <XStack flexWrap="wrap" gap="$2" justifyContent="center">
          {visibleCategories.map((category) => {
            const isSelected = selectedCategory === category.id;
            const Icon = getIconComponent(category.icon);
            
            return (
              <Button
                key={category.id}
                size="$3"
                theme={category.color}
                borderRadius="$10"
                backgroundColor={isSelected ? 
                  `$${category.color}5` : 
                  `$${category.color}2`
                }
                borderColor={isSelected ? 
                  `$${category.color}8` : 
                  `$${category.color}4`
                }
                borderWidth={1}
                paddingHorizontal="$3"
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
          
          {categories.length > maxVisible && (
            <Button
              size="$3"
              theme="gray"
              borderRadius="$10"
              backgroundColor="$gray2"
              borderColor="$gray4"
              borderWidth={1}
              paddingHorizontal="$3"
              icon={showAllCategories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              pressStyle={{ scale: 0.96 }}
              onPress={onToggleShowAll}
              marginBottom="$2"
            >
              <Text color="$gray11" fontWeight="500">
                {showAllCategories ? t('show-less') : t('categories-length-maxvisible-more')}
              </Text>
            </Button>
          )}
        </XStack>
      </YStack>
    </MotiView>
  );
} 