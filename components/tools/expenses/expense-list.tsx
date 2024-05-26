import { Card, Paragraph, ScrollView, SizableText, Text, View, XGroup, XStack, YStack } from "tamagui";
import { getFormattedDateFromString } from "@/lib/format-time";
import { ExpenseFilter } from "./filter";
import { CustomSelect } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { getDocuments } from "@/lib/appwrite";
import { Models, Query } from "react-native-appwrite";

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

    return (
        <Card 
            bordered
            borderWidth={3}
            width={"100%"}
            size="$6"
        >
            <YStack space="$5" alignItems="flex-start" justifyContent="center">
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

export function ExpenseList() {
    const [sortingOption, setSortingOption] = useState("date descending");
    const [expenses, setExpenses] = useState<Models.DocumentList<Models.Document>>();
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedDepartment, setSelectedDepartment] = useState("all");

    const filters = {
        department: selectedDepartment,
        status: selectedStatus
    };

    const filterConfigs = [
        {
            filterType: 'status',
            options: [
              { name: "All", value: "all" },
              { name: "Pending", value: "pending" },
              { name: "Paid", value: "paid" },
            ],
            label: 'Status',
            initialSelected: selectedStatus,
          },
          {
            filterType: 'department',
            options: [
              { name: "All", value: "all" },
              { name: "Marketing", value: "marketing" },
              { name: "IT", value: "it" },
              { name: "HR", value: "hr" },
              { name: "Finance", value: "finance" },
            ],
            label: 'Department',
            initialSelected: selectedDepartment,
          },
      ];

    useEffect(() => {
        async function fetchExpenses() {
            const fetchedExpenses = await getDocuments('expenses', filters);
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
        const newExpenses = await getDocuments('expenses', { [filterType]: value });
        setExpenses(newExpenses);
      };

    return (
        <ScrollView>
            <YStack space="$5" alignItems="center" justifyContent="center">
                <YStack space="$4" alignItems="flex-start" justifyContent="flex-start" marginTop={20}>
                <Paragraph fontSize={22}>
                    View and manage your submitted expenses.
                </Paragraph>
                </YStack>
                <XGroup space="$4">
                <ExpenseFilter filtersConfig={filterConfigs} onFilterChange={handleFilterChange} />
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
                </XGroup>
                {expenses?.documents?.length === 0 && <Text>No expenses found.</Text>}
                {expenses?.documents?.map((expense) => (
                    <ExpenseCard
                        key={expense.$id} // Use a unique identifier instead of title
                        expense={expense}
                    />
                ))}
            </YStack>
        </ScrollView>
    );
}
