import React from 'react';
import { 
  XStack,
  Text,
  Button,
  styled,
  useTheme,
  Stack,
} from 'tamagui';
import { MotiView, MotiScrollView } from 'moti';


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

export function HomeCategories({ categories, activeCategory, setActiveCategory }: TabsProps) {

    const theme = useTheme();


    return (
        <MotiScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        from={{ opacity: 0, translateX: -20 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <XStack gap="$3" paddingVertical="$2" paddingRight="$4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <MotiView
                key={category.id}
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 100 }}
              >
                <CategoryPill
                  pressStyle={{ scale: 0.95 }}
                  onPress={() => setActiveCategory(category.id)}
                  active={activeCategory === category.id}
                >
                  <XStack gap="$2" alignItems="center">
                    <Stack
                      backgroundColor={
                        activeCategory === category.id
                          ? 'rgba(255,255,255,0.2)'
                          : '$blue4'
                      }
                      padding="$2"
                      borderRadius="$4"
                    >
                      <Icon
                        size={16}
                        color={
                          activeCategory === category.id
                            ? 'white'
                            : theme?.color?.get()
                        }
                      />
                    </Stack>
                    <Text
                      color={
                        activeCategory === category.id
                          ? 'white'
                          : theme?.color?.get()
                      }
                      fontSize={14}
                      fontWeight="500"
                    >
                      {category.label}
                    </Text>
                  </XStack>
                </CategoryPill>
              </MotiView>
            );
          })}
        </XStack>
      </MotiScrollView>
    )
}