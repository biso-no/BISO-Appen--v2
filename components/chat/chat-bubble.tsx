import { YStack, Text, XStack } from "tamagui";
import { useAuth } from "../context/core/auth-provider";
import { getFormattedDateFromString } from "@/lib/format-time";
import { Models } from "react-native-appwrite";

export function ChatBubble({ message, status, senderName }: { message: Models.Document, status: string, senderName: string }) {

    const { user } = useAuth();
    const isUser = user?.$id === message.users;
    return (
        <YStack
            alignSelf={isUser ? 'flex-end' : 'flex-start'} marginBottom={8} maxWidth={"80%"}>
                    <YStack
                backgroundColor={isUser ? "#0b93f6" : "#e5e5ea"}
                padding={10}
                borderRadius={16}
              >
                        <Text color={isUser ? "white" : "black"}>{message.content}</Text>
        {user && (
            <Text fontSize={10} color={isUser ? "white" : "gray"}>{senderName}</Text>
        )}
        <XStack justifyContent="space-between" alignItems="center" marginTop={4}>
            <Text fontSize={10} color="gray">
            {getFormattedDateFromString(message.$createdAt)}
            </Text>
            {status && (
            <Text fontSize={10} color="gray">
                {status}
            </Text>
            )}
        </XStack>
        </YStack>
    </YStack>
    );
}