import { Card, Image, H6, Paragraph, YStack, XStack, Button } from "tamagui";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useWindowDimensions } from "react-native";
import { useCampus } from "@/lib/hooks/useCampus";
import { MyStack } from "../ui/MyStack";
import { getFormattedDateFromString } from "@/lib/format-time";
import { functions } from "@/lib/appwrite";
import { ExecutionMethod } from "react-native-appwrite";

export function HomeProducts() {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const { campus, availableCampuses } = useCampus();

    useEffect(() => {
        async function fetchProducts() {
            try {
                // Construct query parameters based on campus and department
                const queryParams = new URLSearchParams();
                if (campus?.$id) {
                    queryParams.append("campus", campus.$id);
                }
                // Add department filtering here if needed

                // Execute the server-side function with Appwrite
                const result = await functions.createExecution(
                    '66a3d188000dd012e6de',            // Replace with actual function ID
                    '',                         // No body needed for this GET request
                    false,                      // Execute synchronously
                    `/products?${queryParams.toString()}`, // Path with query parameters
                    ExecutionMethod.GET         // HTTP GET request
                );

                // Parse and set products from the result response
                const data = JSON.parse(result.responseBody);
                setProducts(data);
                console.log(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }
        }

        fetchProducts();
    }, [campus]);

    const capitalizeFirstLetter = (str: string) => {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    };

    const getCampusName = (campusId: string) => {
        const campus = availableCampuses.find(campus => campus.id === campusId);
        return campus ? campus.name : 'Unknown Campus';
    };

    if (!products || products.length === 0) {
        return (
            <MyStack justifyContent="center" alignItems="center" space="$2">
                <H6>Stay tuned!</H6>
            </MyStack>
        );
    }

    return (
        <YStack space="$4" justifyContent="center" alignItems="center">
            <XStack justifyContent="space-between" alignItems="center">
                <Button bordered transparent onPress={() => router.push("/explore/products")}>See all</Button>
            </XStack>
            <XStack space="$3" flexWrap="wrap" justifyContent="center" alignItems="center">
                {products.map((product) => (
                    <Card
                        key={product.id}
                        chromeless
                        width={width < 375 ? 300 : 380}
                        onPress={() => router.push(`/explore/products/${product.id}`)}
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
                                    <Paragraph>{capitalizeFirstLetter(getCampusName(product.acf.campus?.value))}</Paragraph>
                                    <Paragraph>{capitalizeFirstLetter(product.acf.department_oslo?.value || "Unknown Department")}</Paragraph>
                                </XStack>
                                <H6>{product.name}</H6>
                                <XStack space="$2" alignItems="center" justifyContent="space-between">
                                    <Paragraph>{getFormattedDateFromString(product.date_created)}</Paragraph>
                                </XStack>
                            </YStack>
                        </Card.Footer>
                    </Card>
                ))}
            </XStack>
        </YStack>
    );
}
