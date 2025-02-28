import type { WooProduct } from "@/types/product";
import { Tag, ChevronRight } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import React from "react";
import { LinearGradient } from "tamagui/linear-gradient";
import { YStack, XStack, H3, Card, Image, Text, Button, styled } from "tamagui";
import { MotiView, MotiScrollView } from "moti";

interface HomeProductsProps {
    products: WooProduct[];
    activeCategory: string;
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
  

export function HomeProducts({ products, activeCategory }: HomeProductsProps) {
    return (
        <MotiView
                key="products-section"
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 15 }}
              >
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

                  {activeCategory === 'all' ? (
                    <MotiScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      from={{ opacity: 0, translateX: 20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ type: 'timing', duration: 1000 }}
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
                            colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']} // Enhanced gradient
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              padding: 16,
                              paddingTop: 32, // Increased padding for better gradient fade
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
                    </MotiScrollView>
                  ) : (
                    <YStack gap="$4">
                      {products.map((product) => (
                        <MotiView
                          key={`vertical-product-${product.id}`}
                          from={{ opacity: 0, translateY: 20 }}
                          animate={{ opacity: 1, translateY: 0 }}
                          transition={{ type: 'spring', damping: 15 }}
                        >
                          <Card
                            pressStyle={{ scale: 0.98 }}
                            onPress={() => router.push(`/explore/products/${product.id}`)}
                            borderRadius={24}
                            overflow="hidden"
                          >
                            <XStack>
                              <Image
                                source={{ uri: product.images[0] }}
                                alt={product.name}
                                width={120}
                                height={120}
                                borderRadius={16}
                              />
                              <YStack flex={1} padding="$4" justifyContent="space-between">
                                <YStack gap="$2">
                                  <Text fontSize={18} fontWeight="600">
                                    {product.name}
                                  </Text>
                                  <Text fontSize={14} color="$gray11">
                                    {product.campus?.label}
                                  </Text>
                                </YStack>
                                <XStack justifyContent="space-between" alignItems="center">
                                  <PriceTag>
                                    <Tag size={14} color="$blue11" />
                                    <Text color="$blue11" fontWeight="600">
                                      {product.price} kr
                                    </Text>
                                  </PriceTag>
                                  <ChevronRight size={20} color="$gray11" />
                                </XStack>
                              </YStack>
                            </XStack>
                          </Card>
                        </MotiView>
                      ))}
                    </YStack>
                  )}
                </YStack>
              </MotiView>
    )
}