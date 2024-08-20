//A cool, feature-rich product details screen consisting of a list of products, each with a title, description, and price, using tamagui components.
import { Card, H5, Paragraph, XStack, YStack, Image, Button, H3, Separator, Text, YGroup, ScrollView } from "tamagui";
import { useEffect, useState } from "react";
import { Models, Query } from "react-native-appwrite";
import { databases, getDocument } from "@/lib/appwrite";
import { useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from "expo-router";
import RenderHtml from 'react-native-render-html';


export function ProductDetails({productId}: {productId: string}) {
    const [product, setProduct] = useState<Models.Document>();
    const router = useRouter();
    const { width } = useWindowDimensions();
    useEffect(() => {
        console.log(productId);
      }, [productId]);

    useEffect(() => {
        if (!productId) {
            return;
        }
      const response = async () => {
        const response = await databases.getDocument('app', 'products', productId, [
            Query.select(['images', 'name', 'price', 'sale_price', 'description', 'url'])
        ]);
        console.log(response);
        setProduct(response);
      }
      response();
    },
    [productId]);

    return (
        <ScrollView>
        <YStack space="$4" padding="$4">
            {product && (
                <YStack space="$4">
                            <Image
                                source={{ uri: product.images[0] }}
                                alt="image"
                                height="$16"
                                width="$25"
                                borderRadius="$10"
                            />
                    {product.images.length > 1 && (
                        <ScrollView horizontal>
                        <XStack space="$4">
                            {product.images.slice(1).map((image: string) => (
                                <Image
                                    source={{ uri: image }}
                                    alt="image"
                                    height="$10"
                                    width="$14"
                                    borderRadius="$10"
                                />
                            ))}
                        </XStack>
                        </ScrollView>
                    )}
                <XStack justifyContent="space-between">
                    <Text fontSize={30} fontWeight={"bold"}>{product.name}</Text>
                    <YGroup space="$2">
                    <Text fontSize={20}>{product.price !== product.sale_price ? product.price + " kr" : product.sale_price + " kr"}</Text>
                    {product.sale_price && product.price !== product.sale_price && <Text color="gray" textDecorationLine="line-through" fontSize={20}>{product.regular_price !== null ? product.regular_price + " kr" : "Free"}</Text>}
                    </YGroup>
                </XStack>
                </YStack>
            )}
                <YStack space="$4" padding="$4">
                    <XStack space="$4" alignItems="center" justifyContent="center">
                        <Button onPress={() => router.push(product?.url)}>View on BISO.no</Button>
                    </XStack>
                    <Separator />
                    <Text fontSize={20} fontWeight={"bold"}>Description</Text>
                    <RenderHtml 
                    source={{ html: product?.description }} 
                    contentWidth={width - 40}
                />
                </YStack>
            </YStack>
        </ScrollView>
        )
}