import { ExpenseList } from "@/components/tools/expenses/expense-list";
import { Link } from "expo-router";
import { YStack, Button, XStack, Text } from "tamagui";

export default function Expenses() {
    return (
        <YStack flex={1}>
            <XStack justifyContent="space-between" padding="$4">
                <Link href="/explore/expenses/create" asChild>
                    <Button>Create Expense (Old)</Button>
                </Link>
                <Link href="/explore/expenses/create1" asChild>
                    <Button backgroundColor="$blue9" color="white">Create Expense (New)</Button>
                </Link>
            </XStack>
            <ExpenseList />
        </YStack>
    );
}