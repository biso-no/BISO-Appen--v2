import { Card, H5, SizableText, YStack, XStack, Separator, Button } from "tamagui";
import React from "react";
import { useState } from "react";
import { Pressable } from "react-native";


interface Category {
    title: string;
    icon: React.ComponentType<any>;
}

export interface CategoryProps {
    categories: Category[];
    selectedCategory: Category;
    setSelectedCategory: (category: Category) => void;
}

export function Categories({ categories, selectedCategory, setSelectedCategory }: CategoryProps) {

    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

    const handleCategoryClick = (index: number) => {
        setSelectedCategoryIndex(index);
        setSelectedCategory(categories[index]);
    };

    return (
        <YStack space="$4" justifyContent="center" alignItems="center" zIndex={1000}>
        <XStack space="$3">
            {categories.map((category, index) => (
                <XStack key={category.title} space="$2" alignItems="center" justifyContent="center">
                <Card
                    key={category.title}
                    chromeless={selectedCategoryIndex === index ? false : true}
                    width={70}
                    height={70}
                    justifyContent={"center"}
                    alignItems={"center"}
                    onPress={() => handleCategoryClick(index)}
                >
                    <Card.Header>
                    <category.icon />
                        
                    </Card.Header>
                    <Card.Footer>
                    <SizableText>{category.title}</SizableText>
                    </Card.Footer>
                </Card>
                <Separator key={'sep' + category.title} vertical  />
                </XStack>
            ))}
        </XStack>
    </YStack>
    );
}