import { Card, Paragraph, ScrollView, SizableText, Text, View, XGroup, XStack, YStack} from "tamagui";
import { getFormattedDate } from "@/lib/format-time";
import { ExpenseFilter } from "./filter";
import { CustomSelect } from "@/components/ui/select";
import { useState } from "react";

interface ExpenseProps {
    title: string;
    amount: number;
    date: Date;
    status: string;
    category: string;
}

const expenses = [
    {
        title: "Groceries",
        amount: 100,
        date: new Date("2022-01-01"),
        status: "Pending",
        category: "Food",
    },
    {
        title: "Entertainment",
        amount: 50,
        date: new Date("2022-01-02"),
        status: "Pending",
        category: "Entertainment",
    },
]

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

function ExpenseCard({ title, amount, date, status, category }: ExpenseProps) {
    return (
        <Card 
            bordered
            borderWidth={3}
            size="$6"
            width={360}
        >
            <YStack space="$5" alignItems="flex-start" justifyContent="center">
                <Card.Header>
                    <YStack>
                        <Text fontSize={30} fontWeight={"bold"}>{title}</Text>
                        <Text fontSize={20}>{amount} kr</Text>
                    </YStack>
                </Card.Header>
                <Card.Footer>
                    <XStack marginBottom={20} marginLeft={30} justifyContent="space-between" alignItems="center" width="80%">
                        <SizableText size={"$5"}>{getFormattedDate(date)}</SizableText>
                        <StatusBadge status={status} />
                    </XStack>
                </Card.Footer>
            </YStack>
        </Card>
    );
}
export interface CustomSelectProps {
    items: { name: string }[];
    onValueChange: (value: string) => void;
    label?: string;
    initialSelected?: string;
  }


export function ExpenseList() {

    const [sortingOption, setSortingOption] = useState("Date Descending");

    
    return (
        <ScrollView>
            <YStack space="$5" alignItems="center" justifyContent="center">
                <YStack space="$4" alignItems="flex-start" justifyContent="flex-start" marginTop={20}>
                <Paragraph fontSize={22}>
                    View and manage your submitted expenses.
                </Paragraph>
                </YStack>
                <XGroup space="$4">
                <ExpenseFilter />
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
                {expenses.map((expense) => (
                    <ExpenseCard
                        key={expense.title}
                        title={expense.title}
                        amount={expense.amount}
                        date={expense.date}
                        status={expense.status}
                        category={expense.category}
                    />
                ))}
            </YStack>
        </ScrollView>
    );
}