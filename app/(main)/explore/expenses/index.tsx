import { ExpenseList } from "@/components/tools/expenses/expense-list";
import { Link } from "expo-router";
import { YStack, Button, XStack, Text } from "tamagui";

export default function Expenses() {
    return (
        <YStack flex={1}>
            <ExpenseList />
        </YStack>
    );
}