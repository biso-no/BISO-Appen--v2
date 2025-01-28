//A cool, feature-rich product details screen consisting of a list of products, each with a title, description, and price, using tamagui components.
import { Card, H5, Paragraph, XStack, YStack, Image, Button, H3, Separator, Text, YGroup, ScrollView } from "tamagui";
import { useEffect, useState } from "react";
import { Models, Query } from "react-native-appwrite";
import { databases, functions, getDocument } from "@/lib/appwrite";
import { useWindowDimensions } from 'react-native';
import { ExternalPathString, useLocalSearchParams, useRouter } from "expo-router";
import RenderHtml from 'react-native-render-html';
import { useTheme } from "tamagui";

interface Product {
    product: {
        id: number;
        name: string;
        campus: { value: string; label: string };
        department: { value: string; label: string };
        images: string[];
        price: string;
        sale_price: string;
        short_description: string;
        description: string;
        url: string;
    };
}

export function ProductDetails({productId}: {productId: string}) {
    const [product, setProduct] = useState<Product | null>(null);
    const router = useRouter();
    const { width } = useWindowDimensions();
    const theme = useTheme();
    const textColor = theme?.color?.val;
    useEffect(() => {
        console.log(productId);
      }, [productId]);

    useEffect(() => {
        if (!productId) {
            return;
        }
      const response = async () => {
        console.log("Product ID: ", productId);
        const body = {
            productId: productId
        }
        const response = await functions.createExecution('webshop_product', productId, false)

        console.log("This is product: ", response.responseBody);
        const data = JSON.parse(response.responseBody) as Product
        setProduct(data);
      }
      response();
    },
    [productId]);

    const htmlStyles = {
      body: { 
        fontSize: 16, 
        lineHeight: 24, 
        color: textColor,
      },    
    };

    if (!product) {
        return <Text>Loading...</Text>;
    }

    return (
        <ScrollView>
        <YStack gap="$4" padding="$4">
            {product && (
                <YStack gap="$4">
                    {product.product.images?.length > 0 &&
                            <Image
                                source={{ uri: product.product.images[0] }}
                                alt="image"
                                height="$16"
                                width="$25"
                                borderRadius="$10"
                            />
                    }
                    {product.product.images?.length > 1 && (
                        <ScrollView horizontal>
                        <XStack gap="$4">
                            {product.product.images.slice(1).map((image: string) => (
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
                    <YGroup gap="$2">
                    <Text fontSize={30} fontWeight={"bold"}>{product.product.name}</Text>
                    <RenderHtml 
                    source={{ html: product?.product.short_description }} 
                    contentWidth={width - 40}
                    tagsStyles={htmlStyles}
                        />
                    </YGroup>
                    <YGroup gap="$2">
                    <Text fontSize={20}>{product.product.price !== product.product.sale_price ? product.product.price + " kr" : product.product.sale_price + " kr"}</Text>
                    {product.product.sale_price && product.product.price !== product.product.sale_price && <Text color="gray" textDecorationLine="line-through" fontSize={20}>{product.product.price + " kr"}</Text>}
                    </YGroup>
                </XStack>
                </YStack>
            )}
                <YStack gap="$4" padding="$4">
                    <XStack gap="$4" alignItems="center" justifyContent="center">
                        
                    </XStack>
                    {product.product.description && (
                    <YStack gap="$4">
                    <Separator />
                    <Text fontSize={20} fontWeight={"bold"}>Description</Text>
                    <RenderHtml 
                    source={{ html: product?.product.description }} 
                    contentWidth={width - 40}
                    tagsStyles={htmlStyles}
                />
                    </YStack>
                    )}
                </YStack>
                <Button onPress={() => router.push(product.product.url as ExternalPathString)}>Go to product</Button>
            </YStack>
        </ScrollView>
        )
}