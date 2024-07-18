import { useState, useEffect } from "react";
import { ListItem, Text, YStack, XStack, YGroup, View, Button } from "tamagui";
import { getChats } from "@/lib/appwrite";
import { Models } from "react-native-appwrite";
import { MyStack } from "../ui/MyStack";
import { useRouter } from "expo-router";
import { useChat } from "@/lib/ChatContext";

export function ChatHistory() {
    const [chats, setChats] = useState<Models.DocumentList<Models.Document>>();

    const { messages, currentChatGroup, setCurrentChatGroup, setCurrentChatGroupName, unreadMessages, typingUsers } = useChat();

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
                        const chatGroupId = chat.$id;
                        const latestMessage = messages[chatGroupId]?.slice(-1)[0]; // Get the latest message
                        const unreadCount = unreadMessages[chatGroupId] || 0;
                        const typingUsersInChat = typingUsers[chatGroupId] || new Set();
                        const typingIndicator = typingUsersInChat.size > 0 ? "Someone is typing..." : "";

                        return (
                            <YGroup.Item key={chatGroupId}>
                                <ListItem
                                    hoverTheme
                                    title={chat.name}
                                    subTitle={latestMessage ? latestMessage.content : "No messages yet"}
                                    onPress={() => {
                                        setCurrentChatGroup(chatGroupId);
                                        setCurrentChatGroupName(chat.name);
                                        router.push(`/chat/${chatGroupId}`);
                                    }}
                                    right={unreadCount > 0 ? unreadCount : null}
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
