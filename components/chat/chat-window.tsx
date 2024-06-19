import React, { useState, useEffect, useRef } from "react";
import { Text, YStack, XStack, ScrollView, Input, Button } from "tamagui";
import { useChat } from "@/lib/ChatContext";
import { useRouter } from "expo-router";
import { sendChatMessage } from "@/lib/appwrite"; // Assuming this function sends a message to the chat
import { Equal } from "@tamagui/lucide-icons";
import { useAppwriteAccount } from "../context/auth-context";

interface ChatWindowProps {
  chatGroupId: string;
}

export function ChatWindow({ chatGroupId }: ChatWindowProps) {
  const { messages } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const { data } = useAppwriteAccount();

  useEffect(() => {
    // Scroll to the bottom when a new message is added
    scrollViewRef.current?.scrollTo({ animated: true, y: 0 });
  }, [messages]);

  useEffect(() => {
    console.log("Chat Group ID:", chatGroupId);
  }, [chatGroupId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && data) {
      await sendChatMessage(chatGroupId, newMessage, data.$id);
      setNewMessage(""); // Clear the input after sending the message
    }
  };
  

  return (
    <YStack flex={1} padding={16} backgroundColor="#f0f0f5">
      <XStack justifyContent="space-between" alignItems="center" marginBottom={16}>
        <Button onPress={() => router.back()}>Back</Button>
        <Text fontSize={18} fontWeight="bold">Chat</Text>
        <Button onPress={() => {}}>
          <Equal />
        </Button>
      </XStack>
      <ScrollView flex={1} padding={8} backgroundColor="white" borderRadius={8}>
        {messages[chatGroupId]?.map((message, index) => (
          <YStack
            key={index}
            alignSelf={message.sender === "user" ? "flex-end" : "flex-start"}
            backgroundColor={message.sender === "user" ? "#0b93f6" : "#e5e5ea"}
            padding={10}
            borderRadius={16}
            marginBottom={8}
            maxWidth="80%"
          >
            <Text color={message.sender === "user" ? "white" : "black"}>{message.content}</Text>
            <Text fontSize={10} color={message.sender === "user" ? "white" : "gray"}>{message.timestamp}</Text>
          </YStack>
        ))}
      </ScrollView>
      <XStack alignItems="center" paddingTop={16}>
        <Input
          flex={1}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          backgroundColor="white"
          borderRadius={16}
          paddingHorizontal={16}
          paddingVertical={12}
        />
        <Button onPress={handleSendMessage} marginLeft={8} backgroundColor="#0b93f6" borderRadius={16} paddingVertical={12} paddingHorizontal={16}>
          Send
        </Button>
      </XStack>
    </YStack>
  );
}
