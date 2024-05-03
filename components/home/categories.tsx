import { Card, H5, SizableText, YStack, XStack } from "tamagui";
import React from "react";


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
    return (
        <YStack space="$4" justifyContent="center" alignItems="center">
        <H5>Discover</H5>
        <XStack space="$3">
            {categories.map((category) => (
                <Card
                    key={category.title}
                    backgroundColor={
                        selectedCategory.title === category.title
                            ? "$backgroundHover"
                            : "$background"
                    }
                    bordered
                    width={80}
                    height={80}
                    jc={"center"}
                    ai={"center"}
                    onPress={() => setSelectedCategory(category)}
                >
                    <Card.Header>
                    <category.icon />
                        
                    </Card.Header>
                    <Card.Footer>
                    <SizableText>{category.title}</SizableText>
                    </Card.Footer>
                </Card>
            ))}
        </XStack>
    </YStack>
    );
}