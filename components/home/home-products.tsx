import type { WooProduct } from "@/types/product";
import { Tag, ChevronRight } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import React, { memo, useMemo } from "react";
import { LinearGradient } from "tamagui/linear-gradient";
import { YStack, XStack, H3, Card, Image, Text, Button, styled, ScrollView } from "tamagui";

interface HomeProductsProps {
    products: WooProduct[];
}

const ProductCard = styled(Card, {
    borderRadius: 24,
    shadowColor: "$shadowColor",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    overflow: "hidden",
    width: 300,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  })

  const PriceTag = styled(XStack, {
    backgroundColor: "$blue4",
    borderRadius: "$10",
    paddingHorizontal: "$3",
    paddingVertical: "$1",
    alignItems: "center",
    gap: "$1",
    alignSelf: "flex-start", // This ensures the tag only takes up needed width
  })
  
// Optimize with memo and minimal animations
export const HomeProducts = memo(({ products }: HomeProductsProps) => {
    // Using useMemo to prevent recreating elements on each render
    const renderProducts = useMemo(() => {
        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
            >
                <XStack gap="$4" paddingRight="$4">
                    {products.map((product) => (
                        <ProductCard
                            key={`horizontal-product-${product.id}`}
                            pressStyle={{ scale: 0.95 }}
                            onPress={() => router.push(`/explore/products/${product.id}`)}
                        >
                            <Image
                                source={{ uri: product.images[0] }}
                                alt={product.name}
                                height={200}
                                width={300}
                            />
                            <LinearGradient
                                start={[0, 0]}
                                end={[0, 1]}
                                colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: 16,
                                    paddingTop: 32,
                                }}
                            >
                                <YStack gap="$2">
                                    <Text
                                        color="white"
                                        fontWeight="bold"
                                        fontSize={18}
                                        style={{
                                            textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                            textShadowOffset: { width: 0, height: 1 },
                                            textShadowRadius: 3
                                        }}
                                    >
                                        {product.name}
                                    </Text>
                                    <PriceTag>
                                        <Tag size={14} color="$blue11" />
                                        <Text color="$blue11" fontWeight="600">
                                            {product.price} kr
                                        </Text>
                                    </PriceTag>
                                </YStack>
                            </LinearGradient>
                        </ProductCard>
                    ))}
                </XStack>
            </ScrollView>
        );
    }, [products]);

    return (
        <YStack gap="$4">
            <XStack justifyContent="space-between" alignItems="center">
                <H3>Featured Products</H3>
                <Button
                    chromeless
                    onPress={() => router.push('/explore/products')}
                >
                    <Text fontSize={14} color="$blue9">See all</Text>
                </Button>
            </XStack>
            {renderProducts}
        </YStack>
    );
});