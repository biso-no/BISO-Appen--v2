import { useState, useEffect } from "react";
import { ListItem, Text, YStack, XStack, YGroup, View, Button, Spacer, Avatar, Separator } from "tamagui";
import { getChats } from "@/lib/appwrite";
import { Models } from "react-native-appwrite";
import { MyStack } from "../ui/MyStack";
import { Tabs, useRouter } from "expo-router";
import { useChat } from "@/lib/ChatContext";

export function ChatHistory() {
    const [chats, setChats] = useState<Models.DocumentList<Models.Document>>();

    const { messages, currentChatGroup, setCurrentChatGroup, setCurrentChatGroupName, unreadMessages, typingUsers, fetchMessages } = useChat();

    const router = useRouter();

    useEffect(() => {
        getChats().then(
            (data) => setChats(data),
            (error) => console.log(error)
        );
    }, []);

    useEffect(() => {
        if (chats) {
            chats.documents.forEach(chat => fetchMessages(chat.$id));
        }
    }, [chats]);

    if (!chats) {
        return (
            <MyStack>
                <Text>Loading...</Text>
            </MyStack>
        );
    }

    // Sort chat documents based on the time of the latest message
    const sortedChats = [...chats.documents].sort((a, b) => {
        const latestMessageA = messages[a.$id]?.slice(-1)[0]; 
        const latestMessageB = messages[b.$id]?.slice(-1)[0]; 
        
        if (latestMessageA && latestMessageB) {
            const dateA = new Date(latestMessageA.createdAt).getTime();
            const dateB = new Date(latestMessageB.createdAt).getTime();
            return dateB - dateA;
        }

        if (latestMessageA) return -1;
        if (latestMessageB) return 1;
        
        // If neither chat has messages, keep the original order
        return 0;
    });

    return (
        <>

        <View flex={1} padding={16}>
            <YStack>
                <YGroup alignSelf="center" overflow="hidden">
                    {sortedChats.map((chat) => {
                        const chatGroupId = chat.$id;
                        const latestMessage = messages[chatGroupId]?.slice(-1)[0];
                        const unreadCount = unreadMessages[chatGroupId] || 0;
                        const typingUsersInChat = typingUsers[chatGroupId] || new Set();
                        const typingIndicator = typingUsersInChat.size > 0 ? "Someone is typing..." : "";

                        return (
                            <YGroup.Item key={chatGroupId}>
                                <ListItem
                                    hoverTheme
                                    pressTheme
                                    theme="accent"
                                    chromeless
                                    icon={<Avatar circular size="$10">
                                        <Avatar.Image source={chat.image} />
                                        <Avatar.Fallback>
                                            <Avatar.Image source={require('../../assets/images/placeholder.png')} />
                                        </Avatar.Fallback>
                                    </Avatar>}
                                    title={chat.name}
                                    subTitle={typingIndicator || (latestMessage ? latestMessage.content : "No messages yet")}
                                    onPress={() => {
                                        setCurrentChatGroup(chatGroupId);
                                        setCurrentChatGroupName(chat.name);
                                        router.push(`/explore/chat/${chatGroupId}`);
                                    }}
                                    right={unreadCount > 0 ? unreadCount : undefined}
                                    gap={8}
                                />
                                <Separator />
                            </YGroup.Item>
                        );
                    })}
                </YGroup>
            </YStack>
            <Button
                onPress={() => router.push('/explore/chat/create')}
                position="absolute"
                right={16}
                bottom={16}
                width={56}
                height={56}
                borderRadius={28}
                justifyContent="center"
                alignItems="center"
                theme="accent"
                elevate
            >
                <Text fontSize={30} color="white">+</Text>
            </Button>
        </View>
        </>
    );
}
