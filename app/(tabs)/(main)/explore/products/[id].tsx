import { ProductDetails } from "@/components/shop/product";
import { useLocalSearchParams } from "expo-router";
import { View } from "tamagui";
import { MotiView } from 'moti';

export default function ProductScreen() {
    const params = useLocalSearchParams();


    if (!params.id) {
        return null;
    }
    return (
        <View>
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProductDetails productId={params.id as string} />
            </MotiView>
        </View>
    )
}