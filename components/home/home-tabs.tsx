import React, { memo, useMemo, useEffect } from 'react';
import { 
  XStack,
  Text,
  Button,
  styled,
  useTheme,
  Stack,
  ScrollView
} from 'tamagui';
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';

interface Category {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    description: string;
}

interface TabsProps {
    categories: Category[];
    activeCategory: string;
    setActiveCategory: (category: string) => void;
}

const CategoryPill = styled(Button, {
    borderRadius: 20,
    paddingHorizontal: "$4",
    paddingVertical: "$3",
    backgroundColor: "transparent",
    variants: {
      active: {
        true: {
          backgroundColor: "$blue6",
        },
        false: {
          backgroundColor: "transparent",
          borderColor: '$borderColor',
          borderWidth: 1,
        },
      },
    },
  })
CategoryPill.displayName = 'CategoryPill';

// Memoized Category component for better performance
const CategoryButton = memo(({ 
  category, 
  isActive, 
  onPress, 
  theme 
}: { 
  category: Category; 
  isActive: boolean; 
  onPress: () => void;
  theme: any;
}) => {
  const { t } = useTranslation();
  // Add debug logging for button press and make the click handler more direct
  const handlePress = React.useCallback(() => {
    console.log('Category button pressed:', category.id, 'isActive:', isActive);
    // Call the provided onPress handler directly
    onPress();
  }, [category.id, isActive, onPress]);
  
  const Icon = category.icon;
  
  return (
    <CategoryPill
      pressStyle={{ scale: 0.95 }}
      onPress={handlePress}
      active={isActive}
      accessibilityLabel={t('select-category-label-category')}
      accessibilityState={{ selected: isActive }}
    >
      <XStack gap="$2" alignItems="center">
        <Stack
          backgroundColor={isActive ? 'rgba(255,255,255,0.2)' : '$blue4'}
          padding="$2"
          borderRadius="$4"
        >
          <Icon
            size={16}
            color={isActive ? 'white' : theme?.color?.get()}
          />
        </Stack>
        <Text
          color={isActive ? 'white' : theme?.color?.get()}
          fontSize={14}
          fontWeight="500"
        >
          {category.label}
        </Text>
      </XStack>
    </CategoryPill>
  );
});
CategoryButton.displayName = 'CategoryButton';

export const HomeCategories = memo(({ categories, activeCategory, setActiveCategory }: TabsProps) => {
    const theme = useTheme();
    
    // Debug the categories and active category
    useEffect(() => {
        console.log('HomeCategories rendered with activeCategory:', activeCategory);
        console.log('Available categories:', categories.map(c => c.id).join(', '));
    }, [categories, activeCategory]);
    
    // Separate handler function for category selection to ensure it works
    const handleCategorySelect = React.useCallback((categoryId: string) => {
        console.log('HomeCategories: User selected category:', categoryId);
        
        // Skip if already selected
        if (activeCategory === categoryId) {
            console.log('Category already active, skipping update');
            return;
        }
        
        // Use direct function call
        setActiveCategory(categoryId);
        
        // Log confirmation of attempted update
        console.log('HomeCategories: Called setActiveCategory with:', categoryId);
    }, [activeCategory, setActiveCategory]);
    
    // Pre-render all category buttons to avoid re-rendering
    const categoryButtons = useMemo(() => {
        return categories.map((category) => (
            <CategoryButton
                key={category.id}
                category={category}
                isActive={activeCategory === category.id}
                onPress={() => handleCategorySelect(category.id)}
                theme={theme}
            />
        ));
    }, [categories, activeCategory, theme, handleCategorySelect]);

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
        >
            <XStack gap="$3" paddingVertical="$2" paddingRight="$4">
                {categoryButtons}
            </XStack>
        </ScrollView>
    );
});
HomeCategories.displayName = 'HomeCategories';