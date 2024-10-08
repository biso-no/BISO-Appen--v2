import { YStack, XStack, H5, Button } from "tamagui";
import { Categories } from "./categories";
import { useState } from "react";
import { Calendar, Newspaper, Hash, ShoppingBag, Briefcase } from "@tamagui/lucide-icons";
import { News } from "./news";
import { Events } from "./events";
import { MyStack } from "../ui/MyStack";
import { HomeProducts } from "./shop";
import VolunteerList from "../explore/volunteer-list";
import { useRouter } from "expo-router";

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
    { title: "Work", icon: Briefcase },
    { title: "Shop", icon: ShoppingBag },
]



export function Discover() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0]);
    return (
        <MyStack justifyContent="center" alignItems="center" space="$4" padding="$4">
            <XStack space="$4">
            <Categories
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
            />
            </XStack>
            {selectedCategory.title === "Events" && <Events />}
            {selectedCategory.title === "News" && <News />}
            {selectedCategory.title === "Work" && (
                <YStack space="$4" padding="$4" width="100%">
                    <Button onPress={() => router.push("/explore/volunteer")}>View all</Button>
                    <VolunteerList limit={15} />
                </YStack>
            )}
            {selectedCategory.title === "Shop" && <HomeProducts />}

        </MyStack>
    );
}