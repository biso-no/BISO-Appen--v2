//A cool, feature-rich product details screen consisting of a list of products, each with a title, description, and price, using tamagui components.
import { XStack, YStack, Image, Button, Separator, Text, YGroup, ScrollView, AnimatePresence, Card, H2, H3, Paragraph } from "tamagui";
import { useEffect, useState } from "react";
import { functions } from "@/lib/appwrite";
import { useWindowDimensions, ImageBackground } from 'react-native';
import { ExternalPathString, useRouter } from "expo-router";
import RenderHtml from 'react-native-render-html';
import { useTheme } from "tamagui";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import React from 'react';

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

const AnimatedCard = Animated.createAnimatedComponent(Card);

export function ProductDetails({productId}: {productId: string}) {
    const [product, setProduct] = useState<Product | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const router = useRouter();
    const { width } = useWindowDimensions();
    const theme = useTheme();
    const textColor = theme?.color?.val;

    useEffect(() => {
        if (!productId) return;
        
        const response = async () => {
            const response = await functions.createExecution('webshop_product', productId, false)
            const data = JSON.parse(response.responseBody) as Product
            setProduct(data);
        }
        response();
    }, [productId]);

    const htmlStyles = {
        body: { 
            fontSize: 16, 
            lineHeight: 24, 
            color: textColor,
            fontFamily: 'Inter',
        },    
    };

    if (!product) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center">
                <Text>Loading amazing products...</Text>
            </YStack>
        );
    }

    return (
        <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 80 }}>
            <YStack>
                {/* Hero Image Section with Gradient Overlay */}
                <YStack height={300} width={width}>
                    <ImageBackground
                        source={{ uri: product.product.images[currentImageIndex] }}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <LinearGradient
                            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.8)']}
                            style={{ flex: 1, padding: 20 }}
                        >
                        </LinearGradient>
                    </ImageBackground>
                </YStack>

                {/* Image Carousel Indicators */}
                <XStack padding="$4" justifyContent="center" gap="$2">
                    {product.product.images.map((_, index) => (
                        <Button
                            key={index}
                            width={8}
                            height={8}
                            borderRadius="$10"
                            backgroundColor={index === currentImageIndex ? '$blue8' : '$gray5'}
                            onPress={() => setCurrentImageIndex(index)}
                        />
                    ))}
                </XStack>

                {/* Product Info Section */}
                <AnimatePresence>
                    <AnimatedCard
                        entering={FadeInDown.delay(200)}
                        marginHorizontal="$4"
                        marginTop="$2"
                        padding="$4"
                        bordered
                        elevation="$4"
                        backgroundColor="$blue1"
                    >
                        <YStack gap="$4">
                            <YStack gap="$2">
                                <H2 color="$blue11">{product.product.name}</H2>
                                <XStack justifyContent="space-between" alignItems="center">
                                    <YStack>
                                        {product.product.price !== product.product.sale_price && (
                                            <Text color="$gray11" fontSize="$6">
                                                {product.product.price} kr
                                            </Text>
                                        )}
                                    </YStack>
                                    <Button
                                        backgroundColor="$blue8"
                                        color="white"
                                        size="$4"
                                        pressStyle={{ opacity: 0.85 }}
                                        onPress={() => router.push(product.product.url as ExternalPathString)}
                                    >
                                        Go to shop
                                    </Button>
                                </XStack>
                            </YStack>

                            <Separator />
                            
                            <YStack gap="$2">
                                <H3 color="$blue11">Overview</H3>
                                <RenderHtml
                                    source={{ html: product.product.short_description }}
                                    contentWidth={width - 80}
                                    tagsStyles={htmlStyles}
                                />
                            </YStack>

                            <Separator />

                            <YStack gap="$2">
                                <H3 color="$blue11">Product Details</H3>
                                <RenderHtml
                                    source={{ html: product.product.description }}
                                    contentWidth={width - 80}
                                    tagsStyles={htmlStyles}
                                />
                            </YStack>
                        </YStack>
                    </AnimatedCard>
                </AnimatePresence>
            </YStack>
        </ScrollView>
    );
}