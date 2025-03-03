import { Card, Paragraph, Text, View, XGroup, XStack, YStack, Button, Separator } from "tamagui";
import { getFormattedDateFromString } from "@/lib/format-time";
import { ExpenseFilter } from "./filter";
import { CustomSelect } from "@/components/ui/select";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { getDocuments, getExpensesDepartments } from "@/lib/appwrite";
import { Models } from "react-native-appwrite";
import { Wallet } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { FlatList } from "react-native";

// Memoize static components
const StatusBadge = memo(({ status }: { status: string }) => (
    <View
        style={{
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 16,
            borderWidth: 1,
        }}
    >
        <Text fontWeight={"bold"}>{status}</Text>
    </View>
));
StatusBadge.displayName = 'StatusBadge';

const ExpenseCard = memo(({ expense, onPress }: { expense: Models.Document, onPress: () => void }) => {
    const { description, total, $createdAt: created_at, status } = expense;
    const formattedDate = useMemo(() => 
        created_at ? getFormattedDateFromString(created_at) : 'Invalid date',
        [created_at]
    );

    return (
        <Card 
            width={"100%"}
            size="$6"
            onPress={onPress}
        >
            <YStack gap="$5" alignItems="flex-start" justifyContent="center">
                <Card.Header>
                    <YStack>
                        <Text fontSize={30} fontWeight={"bold"}>{description}</Text>
                        <Text fontSize={20}>{total} kr</Text>
                    </YStack>
                </Card.Header>
                <Card.Footer>
                    <XStack marginBottom={20} marginLeft={30} justifyContent="space-between" alignItems="center" width="80%">
                        <Text fontSize="$5">{formattedDate}</Text>
                        <StatusBadge status={status} />
                    </XStack>
                </Card.Footer>
            </YStack>
        </Card>
    );
});
ExpenseCard.displayName = 'ExpenseCard';

const NoExpensesPlaceholder = memo(() => (
    <YStack alignItems="center" justifyContent="center" marginTop={50} padding="$4">
        <Wallet size={48} />
        <Text fontSize={24} fontWeight="bold">No Expenses Found</Text>
        <Paragraph fontSize={18} color="$color7" textAlign="center" marginTop="$2">
            It looks like you haven't submitted any expenses yet. Start by adding your first expense.
        </Paragraph>
    </YStack>
));
NoExpensesPlaceholder.displayName = 'NoExpensesPlaceholder';
export function ExpenseList({withFilters = true, profileScreen = false}: {withFilters?: boolean, profileScreen?: boolean}) {
    const [sortingOption, setSortingOption] = useState("date descending");
    const [expenses, setExpenses] = useState<Models.DocumentList<Models.Document>>();
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [departmentFilters, setDepartmentFilters] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const filters = useMemo(() => ({
        department: selectedDepartment,
        status: selectedStatus
    }), [selectedDepartment, selectedStatus]);

    const fetchExpenses = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedExpenses = await getDocuments('expense', filters);
            setExpenses(fetchedExpenses);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const loadDepartments = async () => {
            const data = await getExpensesDepartments();
            const departments = data.documents.map(doc => doc.department);
            setDepartmentFilters(departments);
        };
        loadDepartments();
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleFilterChange = useCallback((filterType: string, value: string) => {
        if (filterType === 'status') {
            setSelectedStatus(value);
        } else if (filterType === 'department') {
            setSelectedDepartment(value);
        }
    }, []);

    const filterConfigs = useMemo(() => [
        {
            filterType: 'status',
            options: [
                { name: "All", value: "all" },
                { name: "Pending", value: "pending" },
                { name: "Success", value: "success" },
                { name: "Submitted", value: "submitted" },
            ],
            label: 'Status',
            initialSelected: selectedStatus,
        },
        {
            filterType: 'department',
            options: [
                { name: "All", value: "all" },
                ...departmentFilters.map(department => ({
                    name: department,
                    value: department
                }))
            ],
            label: 'Department',
            initialSelected: selectedDepartment,
        },
    ], [departmentFilters, selectedStatus, selectedDepartment]);

    const sortedExpenses = useMemo(() => {
        if (!expenses?.documents) return [];
        
        const docs = [...expenses.documents];
        switch (sortingOption) {
            case "Date Ascending":
                return docs.sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());
            case "Date Descending":
                return docs.sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime());
            case "Amount Ascending":
                return docs.sort((a, b) => a.total - b.total);
            case "Amount Descending":
                return docs.sort((a, b) => b.total - a.total);
            default:
                return docs;
        }
    }, [expenses?.documents, sortingOption]);

    const renderItem = useCallback(({ item: expense }: { item: Models.Document }) => (
        <ExpenseCard
            key={expense.$id}
            expense={expense}
            onPress={() => router.push(`/explore/expenses/${expense.$id}`)}
        />
    ), [router]);

    const getItemLayout = useCallback((data: any, index: number) => ({
        length: 200, // Adjust based on your card height
        offset: 200 * index,
        index,
    }), []);

    return (
        <YStack flex={1}>
            {withFilters && (
                <XGroup gap="$4" flex={1} alignItems="center" justifyContent="center" width="100%" padding="$2">
                    <ExpenseFilter filtersConfig={filterConfigs} onFilterChange={handleFilterChange} />
                    <View flex={1} maxWidth="300px">
                        <CustomSelect
                            items={[
                                { name: "Date Ascending" },
                                { name: "Date Descending" },
                                { name: "Amount Ascending" },
                                { name: "Amount Descending" },
                            ]}
                            onValueChange={setSortingOption}
                            label="Sort by"
                            initialSelected={sortingOption}
                        />
                    </View>
                </XGroup>
            )}

            {!profileScreen && (
                <YStack padding="$2">
                    <Separator />
                    <Button margin="$4" alignSelf="center" onPress={() => router.push("/explore/expenses/create")}>
                        Create new expense
                    </Button>
                </YStack>
            )}

            {sortedExpenses.length === 0 ? (
                <NoExpensesPlaceholder />
            ) : (
                <FlatList
                    data={sortedExpenses}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.$id}
                    getItemLayout={getItemLayout}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    initialNumToRender={5}
                    contentContainerStyle={{ padding: 8 }}
                />
            )}
        </YStack>
    );
}
