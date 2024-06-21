import React, { useState, useEffect, useRef } from "react";
import { ScrollView as ScrollViewType } from "react-native";
import { Text, YStack, XStack, ScrollView, Input, Button } from "tamagui";
import { useChat } from "@/lib/ChatContext";
import { useRouter } from "expo-router";
import { sendChatMessage } from "@/lib/appwrite";
import { Equal } from "@tamagui/lucide-icons";
import { useAuth } from "../context/auth-provider";
import { Models } from 'react-native-appwrite';
import { getFormattedDateFromString } from "@/lib/format-time";

interface ChatWindowProps {
  chatGroupId: string;
}

export function ChatWindow({ chatGroupId }: ChatWindowProps) {
  const { messages, fetchMessages } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const scrollViewRef = useRef<ScrollViewType>(null);
  const router = useRouter();

  const { data } = useAuth();

  useEffect(() => {

    fetchMessages(chatGroupId);
  }, [chatGroupId]);

  useEffect(() => {

    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, chatGroupId]);

  useEffect(() => {
    console.log("Chat Group ID:", chatGroupId);
    console.log("Messages:", messages);

    // Log the users object within each message
    messages[chatGroupId]?.forEach((message: Models.Document, index: number) => {
      console.log(`Message ${index}: Users ${message.users}`);
    });
  }, [chatGroupId, messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && data) {
      await sendChatMessage(chatGroupId, newMessage, data.$id);
      setNewMessage("");
    }
  };

  return (
    <YStack flex={1} padding={16}>
      <ScrollView ref={scrollViewRef} flex={1} padding={8} borderRadius={8}>
        {messages[chatGroupId]?.map((message: Models.Document, index: number) => {
          const user = message.users;
          const isSender = user.$id === data?.$id;
          return (
            <YStack key={index} alignSelf={isSender ? "flex-end" : "flex-start"} marginBottom={8} maxWidth="80%">
              <YStack
                backgroundColor={isSender ? "#0b93f6" : "#e5e5ea"}
                padding={10}
                borderRadius={16}
              >
                <Text color={isSender ? "white" : "black"}>{message.content}</Text>
                {user && (
                  <Text fontSize={10} color={isSender ? "white" : "gray"}>{user.name}</Text>
                )}
              </YStack>
              <Text fontSize={10} color="gray" marginTop={4} alignSelf="center">
                {getFormattedDateFromString(message.$createdAt)}
              </Text>
            </YStack>
          );
        })}
      </ScrollView>
      <XStack alignItems="center" paddingTop={16}>
        <Input
          flex={1}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          borderRadius={16}
          paddingHorizontal={16}
          paddingVertical={12}
        />
        <Button onPress={handleSendMessage} backgroundColor="#0b93f6" borderRadius={16}>
          Send
        </Button>
      </XStack>
    </YStack>
  );
}
