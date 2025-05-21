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
    Input,
    Sheet,
    createStyledContext,
    withStaticProperties,
    GetProps,
    Stack,
    Theme,
    SizableText,
    Separator,
} from "tamagui";
import { functions } from "@/lib/appwrite";
import { useEffect, useState, useMemo } from "react";
import { useCampus } from "@/lib/hooks/useCampus";
import { useRouter } from "expo-router";
import { useWindowDimensions, RefreshControl, Pressable } from "react-native";
import { MyStack } from "../ui/MyStack";
import { ShoppingBag, Tag, MapPin, Search, Filter, X, ChevronDown, SlidersHorizontal } from "@tamagui/lucide-icons";
import { LinearGradient } from "@tamagui/linear-gradient";
import { MotiView, AnimatePresence as MotiPresence } from 'moti';
import { create } from 'zustand';
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';

// Zustand store for product filters
interface FilterStore {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    priceRange: [number, number];
    setPriceRange: (range: [number, number]) => void;
    selectedDepartments: string[];
    toggleDepartment: (dept: string) => void;
    clearFilters: () => void;
}

const useFilterStore = create<FilterStore>((set) => ({
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
    priceRange: [0, 10000],
    setPriceRange: (range) => set({ priceRange: range }),
    selectedDepartments: [],
    toggleDepartment: (dept) => set((state) => ({
        selectedDepartments: state.selectedDepartments.includes(dept) 
            ? state.selectedDepartments.filter(d => d !== dept)
            : [...state.selectedDepartments, dept]
    })),
    clearFilters: () => set({ 
        searchQuery: '', 
        priceRange: [0, 10000], 
        selectedDepartments: [] 
    })
}));

// Enhanced styled components
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

const SearchBar = styled(Input, {
    backgroundColor: "$gray3",
    borderWidth: 0,
    height: 45,
    borderRadius: 25,
    paddingLeft: 45,
    fontSize: 16,
})

const FilterButton = styled(Button, {
    backgroundColor: "$gray3",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
})

const AnimatedCard = ({ children, index, ...props }: any) => {
    return (
        <MotiView
            from={{
                opacity: 0,
                scale: 0.9,
                translateY: 20,
            }}
            animate={{
                opacity: 1,
                scale: 1,
                translateY: 0,
            }}
            transition={{
                type: 'timing',
                duration: 350,
                delay: index * 100,
            }}
            {...props}
        >
            {children}
        </MotiView>
    )
}

// Loading skeleton component with animation
function ProductSkeleton({ compact }: { compact: boolean }) {
    return (
        <MotiView
            from={{
                opacity: 0.5,
            }}
            animate={{
                opacity: 1,
            }}
            transition={{
                type: 'timing',
                duration: 1000,
                loop: true,
            }}
        >
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
        </MotiView>
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

// Replace MotiPressable with a custom component
const AnimatedPressable = ({ onPress, children, style }: any) => {
    const [isPressed, setIsPressed] = useState(false);
    
    return (
        <Pressable 
            onPress={onPress}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
        >
            <MotiView
                style={style}
                animate={{
                    scale: isPressed ? 0.9 : 1,
                }}
                transition={{
                    type: 'timing',
                    duration: 100,
                }}
            >
                {children}
            </MotiView>
        </Pressable>
    )
}

export function Products({ hideAllButton = false }: { hideAllButton?: boolean }) {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { campus } = useCampus();
    const [showFilters, setShowFilters] = useState(false);
    const fallbackImage = "https://example.com/fallback-image.jpg";
    const { t } = useTranslation();
    const { 
        searchQuery, 
        setSearchQuery,
        selectedDepartments,
        toggleDepartment,
        clearFilters 
    } = useFilterStore();

    const fetchProducts = async (isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        } else {
            setIsLoading(true);
        }
        
        try {
            const body = {
                campus: campus?.$id
            }
            const fetchedProducts = await functions.createExecution(
                'sync_webshop_products',
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
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [campus]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDepartment = selectedDepartments.length === 0 || 
                                    selectedDepartments.includes(product.department.value);
            return matchesSearch && matchesDepartment;
        });
    }, [products, searchQuery, selectedDepartments]);

    const departments = useMemo(() => {
        const deptMap = new Map();
        products.forEach(p => {
            if (p.department?.value && p.department?.label) {
                deptMap.set(p.department.value, p.department.label);
            }
        });
        return Array.from(deptMap).map(([value, label]) => ({
            value,
            label
        })).sort((a, b) => a.label.localeCompare(b.label));
    }, [products]);

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
                    <MotiView
                        from={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'timing', duration: 500 }}
                    >
                        <ShoppingBag size={40} color="$gray8" />
                    </MotiView>
                    <H6 color="$gray11">{t('no-products-available')}</H6>
                    <Paragraph color="$gray9">{t('check-back-soon-for-new-items')}</Paragraph>
                </MyStack>
            );
        }

        return (
            <AnimatePresence>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchProducts(true)}
                        />
                    }
                >
                    <XStack 
                        flexWrap="wrap" 
                        justifyContent="center" 
                        gap="$4"
                        paddingHorizontal="$2"
                        paddingBottom="$4"
                    >
                        {filteredProducts.map((product, index) => (
                            <AnimatedCard key={product.id} index={index}>
                                <ProductCard
                                    elevation={2}
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
                                                <MotiView
                                                    from={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ type: 'spring' }}
                                                >
                                                    <Text color="$red10" fontWeight="600">
                                                        Sale: {product.sale_price}
                                                    </Text>
                                                </MotiView>
                                            )}
                                        </YStack>
                                    </Card.Footer>
                                </ProductCard>
                            </AnimatedCard>
                        ))}
                    </XStack>
                </ScrollView>
            </AnimatePresence>
        );
    };

    return (
        <YStack gap="$4">
            <YStack paddingHorizontal="$2" gap="$2">
                <XStack alignItems="center" gap="$2">
                    <XStack flex={1} position="relative">
                        <Search 
                            size={20} 
                            color="$gray11" 
                            style={{ 
                                position: 'absolute', 
                                left: 15, 
                                top: 12,
                                zIndex: 1 
                            }} 
                        />
                        <SearchBar
                            placeholder={t('search-products')}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            flex={1}
                        />
                        {searchQuery && (
                            <AnimatedPressable
                                onPress={() => setSearchQuery('')}
                                style={{
                                    position: 'absolute',
                                    right: 15,
                                    top: 12,
                                    zIndex: 1
                                }}
                            >
                                <X size={20} color="$gray11" />
                            </AnimatedPressable>
                        )}
                    </XStack>
                    <FilterButton
                        icon={SlidersHorizontal}
                        onPress={() => setShowFilters(true)}
                    >
                        {t('filter')}
                    </FilterButton>
                </XStack>

                {selectedDepartments.length > 0 && (
                    <XStack gap="$2" flexWrap="wrap">
                        {selectedDepartments.map(deptValue => {
                            const dept = departments.find(d => d.value === deptValue);
                            return (
                                <MotiView
                                    key={deptValue}
                                    from={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    <Button
                                        size="$2"
                                        backgroundColor="$blue4"
                                        color="$blue11"
                                        onPress={() => toggleDepartment(deptValue)}
                                        icon={X}
                                    >
                                        {dept?.label || deptValue}
                                    </Button>
                                </MotiView>
                            );
                        })}
                        <MotiView
                            from={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Button
                                size="$2"
                                backgroundColor="$gray4"
                                color="$gray11"
                                onPress={clearFilters}
                            >
                                {t('clear-all')}
                            </Button>
                        </MotiView>
                    </XStack>
                )}
            </YStack>

            {renderContent()}

            <Sheet
                modal
                open={showFilters}
                onOpenChange={setShowFilters}
                snapPoints={[60]}
                position={0}
                dismissOnSnapToBottom
            >
                <Sheet.Overlay />
                <Sheet.Frame padding="$4">
                    <Sheet.Handle />
                    <YStack gap="$4">
                        <H6>{t('filter-products')}</H6>
                        <Separator />
                        <YStack gap="$2">
                            <Text color="$gray11" fontWeight="600">{t('departments')}</Text>
                            {departments.length > 0 ? (
                                <XStack flexWrap="wrap" gap="$2">
                                    {departments.map(dept => (
                                        <Button
                                            key={dept.value}
                                            size="$2"
                                            backgroundColor={selectedDepartments.includes(dept.value) ? "$blue4" : "$gray4"}
                                            color={selectedDepartments.includes(dept.value) ? "$blue11" : "$gray11"}
                                            onPress={() => toggleDepartment(dept.value)}
                                        >
                                            {dept.label}
                                        </Button>
                                    ))}
                                </XStack>
                            ) : (
                                <Text color="$gray9">{t('no-departments-available')}</Text>
                            )}
                        </YStack>
                    </YStack>
                </Sheet.Frame>
            </Sheet>
        </YStack>
    );
}