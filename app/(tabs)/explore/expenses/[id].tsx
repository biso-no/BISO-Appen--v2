import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { MotiView } from 'moti';
import { getDocument } from "@/lib/appwrite";
import { YStack, H6, Paragraph, XStack, Card, Separator, Button, Text, View, Image, ScrollView } from "tamagui";
import { capitalizeFirstLetter } from "@/lib/utils/helpers";
import { getFormattedDateFromString } from "@/lib/format-time";
import { Models } from "react-native-appwrite";

export interface Attachment { 
    url: string; 
    description: string; 
    date: string; 
    amount: string; 
}

interface Expense {
  bank_account: string;
  campus: string;
  department: Models.Document
  expenseAttachments: Attachment[];
  description: string;
  prepayment_amount: number;
  total: number;
  status: string;
};

export default function ExpenseScreen() {
    const params = useLocalSearchParams();

    const { id } = params;

    const router = useRouter();

    const [expense, setExpense] = useState<Models.Document>();  

    useEffect(() => {
        getDocument('expense', id as string).then(
            (data) => setExpense(data),
            (error) => console.log(error)
        );
    }, [id])

    if (!expense?.$id) {
        return (
            <View>
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <Text>Expense not found</Text>
                </MotiView> 
            </View>
        );
    }

    return (
        <ScrollView>
            <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <Card
                    chromeless
                    width={400}
                    margin="$4"
                    borderRadius="$10"
                    
                >
                    <Card.Header>
                        <Image
                            source={{ uri: expense?.expenseAttachments[0].url}}
                            alt="image"
                            height={200}
                            width="100%"
                            borderRadius="$10"
                        />
                    </Card.Header>
                    <Card.Footer>
                        <YStack gap="$2">
                            <H6>{expense?.description}</H6>
                            <XStack justifyContent="space-between"> 
                                <Paragraph>{capitalizeFirstLetter(expense?.campus.name)}</Paragraph>
                                <Paragraph>{getFormattedDateFromString(expense?.$createdAt)}</Paragraph>
                            </XStack>
                            <Separator />
                            <XStack justifyContent="space-between">
                                <Paragraph>Prepayment Amount:</Paragraph>
                                <Paragraph>{expense?.prepayment_amount.toFixed(2)} kr</Paragraph>
                            </XStack>
                            <XStack justifyContent="space-between">
                                <Paragraph>Total:</Paragraph>
                                <Paragraph>{expense?.total.toFixed(2)} kr</Paragraph>
                            </XStack>
                            <XStack justifyContent="space-between">
                                <Paragraph>Status:</Paragraph>
                                <Paragraph>{capitalizeFirstLetter(expense?.status)}</Paragraph>
                            </XStack>
                        </YStack>
                    </Card.Footer>
                </Card>
                {expense?.expenseAttachments.length > 1 && (
                    <YStack gap="$3">
                        <H6>Attachments</H6>
                        {expense.expenseAttachments.slice(1).map((attachment: Models.Document, index: number) => (
                            <Card
                                key={index}
                                chromeless
                                width={400}
                                padding="$3"
                                margin="$2"
                                borderRadius="$10"
                                backgroundColor="$background"
                            >
                                <Card.Header>
                                    <Image
                                        source={{ uri: attachment.url}}
                                        alt="attachment"
                                        height={200}
                                        width="100%"
                                        borderRadius="$10"
                                    />
                                </Card.Header>
                                <Card.Footer>
                                    <YStack gap="$1">
                                        <Paragraph>{attachment.description}</Paragraph>
                                        <XStack justifyContent="space-between"> 
                                            <Paragraph>{getFormattedDateFromString(attachment.date)}</Paragraph>
                                            <Paragraph>{attachment.amount} kr</Paragraph>
                                        </XStack>
                                    </YStack>
                                </Card.Footer>
                            </Card>
                        ))}
                    </YStack>
                )}
                <Button margin="$4" alignSelf="center" onPress={() => router.back()}>
                    Back to List
                </Button>
            </MotiView>
        </ScrollView>
    );
}
