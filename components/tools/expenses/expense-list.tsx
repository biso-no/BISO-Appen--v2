import { Card, Paragraph, ScrollView, SizableText, Text, View, XGroup, XStack, YStack, Image, Button, Separator } from "tamagui";
import { getFormattedDateFromString } from "@/lib/format-time";
import { ExpenseFilter } from "./filter";
import { CustomSelect } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { getDocuments, getExpensesDepartments } from "@/lib/appwrite";
import { Models, Query } from "react-native-appwrite";
import { Wallet, PlusCircle } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";

function StatusBadge({ status }: { status: string }) {
    return (
        <View
            style={{
                paddingVertical: 5,
                paddingHorizontal: 10, // Slightly increased from 5 to 10
                borderRadius: 16,
                borderWidth: 1,
            }}
        >
            <Text fontWeight={"bold"}>{status}</Text>
        </View>
    );
}

function ExpenseCard({ expense }: { expense: Models.Document }) {
    const { description, total, $createdAt: created_at, status } = expense;

    const formattedDate = created_at ? getFormattedDateFromString(created_at) : 'Invalid date';

    const router = useRouter();

    return (
        <Card 
            width={"100%"}
            size="$6"
            onPress={() => router.push(`/explore/expenses/${expense.$id}`)}
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
                        <SizableText size={"$5"}>{formattedDate}</SizableText>
                        <StatusBadge status={status} />
                    </XStack>
                </Card.Footer>
            </YStack>
        </Card>
    );
}

//A component mocking the structure of an expense card, but instead renders "Create new expense" with a plus icon
export function CreateExpenseCard() {
    return (
        <Card
            bordered
            borderWidth={3}
        >
            <YStack gap="$5" alignItems="flex-start" justifyContent="center">
                <Card.Header>
                    <YStack>
                        <XGroup marginRight={10}>
                        <PlusCircle size={20} />
                        <Text fontSize={15} fontWeight={"bold"}>Create new expense</Text>
                        </XGroup>
                    </YStack>
                </Card.Header>
            </YStack>
        </Card>
    );
}

function NoExpensesPlaceholder() {
    return (
        <YStack alignItems="center" justifyContent="center" marginTop={50} padding="$4">
            <Wallet size={48} />
            <Text fontSize={24} fontWeight="bold">No Expenses Found</Text>
            <Paragraph fontSize={18} color="$color7" textAlign="center" marginTop="$2">
                It looks like you haven't submitted any expenses yet. Start by adding your first expense.
            </Paragraph>
        </YStack>
    );
}

export function ExpenseList({withFilters = true, profileScreen = false}: {withFilters?: boolean, profileScreen?: boolean}) {
    const [sortingOption, setSortingOption] = useState("date descending");
    const [expenses, setExpenses] = useState<Models.DocumentList<Models.Document>>();
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [departmentFilters, setDepartmentFilters] = useState<string[]>([]);

    const router = useRouter();

    const filters = {
        department: selectedDepartment,
        status: selectedStatus
    };

    useEffect(() => {
        getExpensesDepartments().then((data) => {
            // Assuming data.documents is the array of department documents
            const departments = data.documents.map(doc => doc.department);
            setDepartmentFilters(departments);
        });
    }, []);

    const filterConfigs = [
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
    ];

    useEffect(() => {
        async function fetchExpenses() {
            const fetchedExpenses = await getDocuments('expense', filters);
            setExpenses(fetchedExpenses);
            console.log(fetchedExpenses);
        }
        fetchExpenses();
    }, [selectedStatus, selectedDepartment]);

    const handleFilterChange = async (filterType: string, value: string) => {
        if (filterType === 'status') {
          setSelectedStatus(value);
        } else if (filterType === 'department') {
          setSelectedDepartment(value);
        }
        const newExpenses = await getDocuments('expense', { [filterType]: value });
        setExpenses(newExpenses);
    };

    return (
        <ScrollView>
            <YStack gap="$2" alignItems="center" justifyContent="center" padding="$2">
                {withFilters && (
                <XGroup gap="$4" flex={1} alignItems="center" justifyContent="center" width="100%">
                    <ExpenseFilter filtersConfig={filterConfigs} onFilterChange={handleFilterChange} />
                    <View flex={1} maxWidth="300px">
                        <CustomSelect
                            items={[
                                { name: "Date Ascending" },
                                { name: "Date Descending" },
                                { name: "Amount Ascending" },
                                { name: "Amount Descending" },
                            ]}
                            onValueChange={(value) => setSortingOption(value)} // Convert value to SortingOptions
                            label="Sort by"
                            initialSelected={sortingOption}
                        />
                    </View>
                </XGroup>
                )}
                {!profileScreen && (
                    <YStack>
                <Separator />
                <Button margin="$4" alignSelf="center" onPress={() => router.push("/explore/expenses/create")}>
                Create new expense
            </Button>
                    </YStack>
                )}
                {expenses?.documents?.length === 0 ? (
                    <NoExpensesPlaceholder />
                ) : (
                    expenses?.documents?.map((expense) => (
                        <ExpenseCard
                            key={expense.$id} // Use a unique identifier instead of title
                            expense={expense}
                        />
                    ))
                )}
            </YStack>
        </ScrollView>
    );
}
