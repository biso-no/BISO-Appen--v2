//A cool, feature-rich products screen consisting of a list of products, each with a title, description, and price, using tamagui components
import { Card, H5, Paragraph, XStack, YStack, Image } from "tamagui";
import { useEffect, useState } from "react";
import { Models, Query } from "react-native-appwrite";
import { getDocuments, listDocuments } from "@/lib/appwrite";
import RenderHtml, { HTMLSource } from 'react-native-render-html';
import { useCampus } from "@/lib/hooks/useCampus";
import { useRouter } from "expo-router";
import { MotiView } from 'moti';
import { useWindowDimensions } from "react-native";
interface Product {
    title: string;
    shortDescription: string;
    price: string;
    image: string;
    onPress: () => void;
}

function ProductCard({
    title,
    shortDescription,
    price,
    image,
    onPress,
}: Product) {

    const { width } = useWindowDimensions();


    const description = shortDescription as unknown as HTMLSource;

    return (
        <Card
            onPress={onPress}
            bordered
            width={400}
        >
            <Card.Header>
                <Image
                    source={{ uri: image }}
                    alt="image"
                    height={200}
                    width={350}
                    borderRadius="$10"
                />
            </Card.Header>
            <Card.Footer>
                <YStack space="$1">
                    <H5>{title}</H5>
                    <XStack space="$3">
                        <RenderHtml
                            source={description}
                            contentWidth={width - 40}
                        />
                        <Paragraph>{price}</Paragraph>
                    </XStack>
                </YStack>
            </Card.Footer>
        </Card>
    );
}

export function Products() {
    const [products, setProducts] = useState<Models.Document[]>([]);

    const { campus } = useCampus();

    const router = useRouter();

    useEffect(() => {
        async function fetchProducts() {

            let query;
            if (campus?.name) {
            query = [
                Query.equal('campus_id', campus.$id),
            ]
        }

            const fetchedProducts = await listDocuments('products', campus?.name ? query : undefined);
            setProducts(fetchedProducts.documents);
            console.log(fetchedProducts);
        }
        fetchProducts();
    }, []);


    return (

        <YStack space="$4" padding="$4">
                    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {products.map((product) => (
                <ProductCard
                    key={product.$id}
                    title={product.name}
                    shortDescription={product.short_description}
                    price={product.price}
                    onPress={() => router.push(`/products/${product.$id}`)}
                    image={product.images[0]}
                />
            ))}
                    </MotiView>
        </YStack>

    );
}