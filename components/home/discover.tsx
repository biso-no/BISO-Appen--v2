import { YStack, XStack, H5 } from "tamagui";
import { Categories } from "./categories";
import { useState } from "react";
import { Calendar, Newspaper, Hash, ShoppingBag } from "@tamagui/lucide-icons";
import { News } from "./news";
import { Events } from "./events";
import { MyStack } from "../ui/MyStack";

interface Category {
    title: string;
    icon: React.ComponentType<any>;
}

export interface CategoryProps {
    title: string;
    selectedCategory: Category;
    setSelectedCategory: (category: Category) => void;
}

const categories: Category[] = [
    { title: "News", icon: Newspaper },
    { title: "Events", icon: Calendar },
    { title: "Feed", icon: Hash },
    { title: "Shop", icon: ShoppingBag },
]



export function Discover() {

    const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0]);
    return (
        <MyStack width="90%" justifyContent="center" alignItems="center" space="$4">
            <XStack space="$4">
            <Categories
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
            />
            </XStack>
            {selectedCategory.title === "Events" && <Events />}
            {selectedCategory.title === "News" && <News />}
                        {/*
            {selectedCategory.title === "Community" && <Community />}
            {selectedCategory.title === "Shop" && <Shop />}
            */}
        </MyStack>
    );
}