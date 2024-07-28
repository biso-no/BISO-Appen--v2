import { Card, Image, H6, Paragraph, YStack, XStack, View, SizableText, Button } from "tamagui";
import { getEvents, listDocuments } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import { Query, type Models } from "react-native-appwrite";
import { getFormattedDateFromString } from "@/lib/format-time";
import { Frown } from "@tamagui/lucide-icons";
import { MyStack } from "../ui/MyStack";
import { getEvents as getWebsiteEvents, Event } from "@/lib/get-events";
import { useCampus } from "@/lib/hooks/useCampus";
import { useRouter } from "expo-router";

export function HomeProducts() {

    const router = useRouter();

    const [products, setProducts] = useState<Models.Document[]>([]);

    const { campus } = useCampus();

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

    const capitalizeFirstLetter = (str: string) => {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    };

    if (!products || products.length === 0) {
        return (
            <MyStack justifyContent="center" alignItems="center" space="$2">
              <Frown size={48} />
              <H6>No products found</H6>
            </MyStack>
          );
        }

    return (
        <YStack space="$4" justifyContent="center" alignItems="center">
            <XStack justifyContent="space-between" alignItems="center">
            <Button onPress={() => router.push("/products")}>See all</Button>
            </XStack>
            <XStack space="$3" flexWrap="wrap" justifyContent="center" alignItems="center">
                {products.map((product) => (
                    <Card
                        key={product.$id}
                        backgroundColor="$backgroundHover"
                        bordered
                        width={380}
                        onPress={() => router.push(`/products/${product.$id}`)}
                    >
                        <Card.Header>
                            <Image
                                source={{ uri: product.images[0] }}
                                alt="image"
                                height={120}
                                borderRadius="$2"
                            />
                        </Card.Header>
                        <Card.Footer>
                        <YStack space="$1">
                            <XStack justifyContent="space-between">
                            <Paragraph>{capitalizeFirstLetter(product.campus.name)}</Paragraph>

                            </XStack>
                            <H6>{product.name}</H6>
                            <XStack space="$2" alignItems="center" justifyContent="space-between">
                            <Paragraph>{getFormattedDateFromString(product.$createdAt)}</Paragraph>
                            </XStack>
                        </YStack>
                        </Card.Footer>
                    </Card>
                ))}
            </XStack>
        </YStack>
    );
}