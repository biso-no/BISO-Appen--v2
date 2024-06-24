import { useState, useEffect } from "react";
import { ListItem, Text, YStack, XStack, YGroup, View, Button } from "tamagui";
import { getChats } from "@/lib/appwrite";
import { Models } from "react-native-appwrite";
import { MyStack } from "../ui/MyStack";
import { useRouter } from "expo-router";
import { useChat } from "@/lib/ChatContext";

export function ChatHistory() {
    const [chats, setChats] = useState<Models.DocumentList<Models.Document>>();

    const { messages } = useChat();

    const router = useRouter();

    useEffect(() => {
        getChats().then(
            (data) => setChats(data),
            (error) => console.log(error)
        );
    }, []);

    if (!chats) {
        return (
            <MyStack>
                <Text>Loading...</Text>
            </MyStack>
        );
    }

    return (
        <View flex={1}>
        <MyStack>
            <YGroup alignSelf="center" bordered>
                {chats.documents.map((chat) => {
                    const latestMessage = messages[chat.$id]?.slice(-1)[0]; // Get the latest message
                    return (
                        <YGroup.Item key={chat.$id}>
                            <ListItem
                                hoverTheme
                                title={chat.name}
                                subTitle={latestMessage ? latestMessage.content : "No messages yet"}
                                onPress={() => router.push(`/chat/${chat.$id}`)}
                            />
                        </YGroup.Item>
                    );
                })}
            </YGroup>
        </MyStack>
        <Button onPress={() => router.push('/chat/create')} position="absolute" right={16} bottom={16} width={56} height={56} borderRadius={28} justifyContent="center" alignItems="center" fontSize={28}>
            +
        </Button>
        </View>
    );
}
