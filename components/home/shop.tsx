import { 
    Card, 
    Image, 
    H6, 
    Paragraph, 
    YStack, 
    XStack, 
    Button, 
    Text,
    styled,
    View,
    AnimatePresence,
    ScrollView,
} from "tamagui";
import { functions } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import { useCampus } from "@/lib/hooks/useCampus";
import { useRouter } from "expo-router";
import { useWindowDimensions } from "react-native";
import { MyStack } from "../ui/MyStack";
import { ShoppingBag, Tag, MapPin } from "@tamagui/lucide-icons";
import { LinearGradient } from "@tamagui/linear-gradient";

// Styled components for consistent design
const ProductCard = styled(Card, {
    borderRadius: "$4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
    
    variants: {
        compact: {
            true: {
                width: 300,
            },
            false: {
                width: 380,
            }
        }
    } as const,
})

const PriceTag = styled(XStack, {
    backgroundColor: "$blue4",
    borderRadius: "$10",
    paddingHorizontal: "$3",
    paddingVertical: "$1",
    alignItems: "center",
    gap: "$1",
})

const LocationBadge = styled(XStack, {
    backgroundColor: "$gray3",
    borderRadius: "$10",
    paddingHorizontal: "$3",
    paddingVertical: "$1",
    alignItems: "center",
    gap: "$1",
})

// Shimmer effect components
const ShimmerView = styled(View, {
    overflow: "hidden",
    position: "relative",
    backgroundColor: "$gray4",

    variants: {
        animate: {
            true: {
                opacity: 0.7,
            }
        }
    }
})

const ShimmerCard = styled(ProductCard, {
    opacity: 0.8,
})

// Loading skeleton component
function ProductSkeleton({ compact }: { compact: boolean }) {
    return (
        <ShimmerCard compact={compact}>
            <Card.Header>
                <ShimmerView 
                    height={200} 
                    width="100%" 
                    animate
                />
            </Card.Header>
            <Card.Footer padding="$3" gap="$2">
                <YStack gap="$2" width="100%">
                    <ShimmerView height={20} width="80%" animate />
                    <ShimmerView height={20} width="60%" animate />
                    <XStack justifyContent="space-between" alignItems="center">
                        <ShimmerView height={24} width={80} animate borderRadius="$10" />
                        <ShimmerView height={24} width={100} animate borderRadius="$10" />
                    </XStack>
                </YStack>
            </Card.Footer>
        </ShimmerCard>
    )
}

interface Product {
    id: number;
    name: string;
    campus: { value: string; label: string };
    department: { value: string; label: string };
    images: string[];
    price: string;
    sale_price: string;
    description: string;
    url: string;
}

interface ProductResponse {
    products: Product[];
}

export function HomeProducts({ hideAllButton = false }: { hideAllButton?: boolean }) {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { campus } = useCampus();
    const fallbackImage = "https://example.com/fallback-image.jpg";

    useEffect(() => {
        async function fetchProducts() {
            setIsLoading(true);
            try {
                const body = {
                    campus: campus?.$id
                }
                const fetchedProducts = await functions.createExecution(
                    '66a3d188000dd012e6de',
                    JSON.stringify(body),
                    false
                );

                const productBody = JSON.parse(fetchedProducts.responseBody) as ProductResponse;
                
                if (productBody?.products) {
                    setProducts(
                        productBody.products.map((product: Product) => ({
                            ...product,
                            campus: product.campus 
                                ? { value: product.campus.value, label: capitalizeFirstLetter(product.campus.label) } 
                                : { value: '', label: 'N/A' },
                            department: product.department 
                                ? { value: product.department.value, label: capitalizeFirstLetter(product.department.label) }
                                : { value: '', label: 'N/A' },
                            images: product.images?.length > 0 ? product.images : [fallbackImage],
                        }))
                    );
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProducts();
    }, [campus]);

    const capitalizeFirstLetter = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    const renderContent = () => {
        if (isLoading) {
            return (
                <XStack 
                    flexWrap="wrap" 
                    justifyContent="center" 
                    gap="$4"
                    paddingHorizontal="$2"
                >
                    {Array.from({ length: 4 }).map((_, index) => (
                        <ProductSkeleton key={index} compact={width < 380} />
                    ))}
                </XStack>
            );
        }

        if (products.length === 0) {
            return (
                <MyStack 
                    justifyContent="center" 
                    alignItems="center" 
                    gap="$2"
                    padding="$8"
                    backgroundColor={"transparent"}
                >
                    <ShoppingBag size={40} color="$gray8" />
                    <H6 color="$gray11">No products available</H6>
                    <Paragraph color="$gray9">Check back soon for new items!</Paragraph>
                </MyStack>
            );
        }

        return (
            <AnimatePresence>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    >
                <XStack 
                    flexWrap="wrap" 
                    justifyContent="center" 
                    gap="$4"
                    paddingHorizontal="$2"
                >
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            elevation={2}
                            animation="lazy"
                            pressStyle={{ scale: 0.98 }}
                            onPress={() => router.push(`/explore/products/${product.id}`)}
                            compact={width < 380}
                        >
                            <Card.Header>
                                <Image
                                    source={{ uri: product.images[0] || fallbackImage }}
                                    alt={product.name}
                                    height={200}
                                    width="100%"
                                    resizeMode="cover"
                                />
                                <LinearGradient
                                    start={[0, 0]}
                                    end={[0, 1]}
                                    colors={['transparent', 'rgba(0,0,0,0.3)']}
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: 100,
                                    }}
                                />
                            </Card.Header>

                            <Card.Footer padding="$3" gap="$2">
                                <YStack gap="$2">
                                    <H6 
                                        color="$gray12"
                                        numberOfLines={2}
                                        ellipsizeMode="tail"
                                    >
                                        {product.name}
                                    </H6>

                                    <XStack justifyContent="space-between" alignItems="center">
                                        <PriceTag>
                                            <Tag size={14} color="$blue11" />
                                            <Text color="$blue11" fontWeight="600">
                                                {product.price}
                                            </Text>
                                        </PriceTag>

                                        <LocationBadge>
                                            <MapPin size={14} color="$gray11" />
                                            <Text color="$gray11" fontSize="$2">
                                                {product.campus.label}
                                            </Text>
                                        </LocationBadge>
                                    </XStack>

                                    {product.sale_price && (
                                        <Text color="$red10" fontWeight="600">
                                            Sale: {product.sale_price}
                                        </Text>
                                    )}
                                </YStack>
                            </Card.Footer>
                        </ProductCard>
                    ))}
                </XStack>
                </ScrollView>
            </AnimatePresence>
        );
    };

    return (
        <YStack gap="$4">
            {!hideAllButton && (
                
            <XStack justifyContent="space-between" alignItems="center" paddingHorizontal="$2">

                <Button
                    icon={ShoppingBag}
                    bordered
                    transparent
                    onPress={() => router.push("/explore/products")}
                    animation="bouncy"
                    pressStyle={{ scale: 0.97 }}
                    disabled={isLoading}
                >
                    Browse All Products
                </Button>

            </XStack>
            )}
            {renderContent()}
        </YStack>
    );
}