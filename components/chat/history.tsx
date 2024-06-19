import { useState, useEffect } from "react";
import { ListItem, Text, YStack, XStack, YGroup } from "tamagui";
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
    );
}
