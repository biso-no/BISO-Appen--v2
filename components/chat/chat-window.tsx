import React, { useState, useEffect, useRef } from "react";
import { ScrollView as ScrollViewType } from "react-native";
import { Text, YStack, XStack, ScrollView, Input, Button } from "tamagui";
import { useChat } from "@/lib/ChatContext";
import { useRouter } from "expo-router";
import { sendChatMessage } from "@/lib/appwrite";
import { Equal, Send } from "@tamagui/lucide-icons";
import { useAuth } from "../context/core/auth-provider";
import { Models } from 'react-native-appwrite';
import { getFormattedDateFromString } from "@/lib/format-time";
import { Pressable } from "react-native";
import { ChatBubble } from "./chat-bubble";

interface ChatWindowProps {
  chatGroupId: string;
}

export function ChatWindow({ chatGroupId }: ChatWindowProps) {
  const { messages, fetchMessages, setUserTyping, messageStatus, addReaction } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const scrollViewRef = useRef<ScrollViewType>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages(chatGroupId);
  }, [chatGroupId]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, chatGroupId]);

  useEffect(() => {
    console.log("Chat Group ID:", chatGroupId);
    console.log("Messages:", messages);
    messages[chatGroupId]?.forEach((message: Models.Document, index: number) => {
      console.log(`Message ${index}: Users ${message.users}`);
    });
  }, [chatGroupId, messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && user) {
      await sendChatMessage(chatGroupId, newMessage, user.$id);
      setNewMessage("");
      setUserTyping(chatGroupId, user.$id, false);
    }
  };

  const handleInputChange = (text: string) => {
    setNewMessage(text);
    if (user) {
      setUserTyping(chatGroupId, user.$id, text.length > 0);
    }
  };

  const handleReaction = (messageId: string, reaction: string) => {
    addReaction(chatGroupId, messageId, reaction);
  };

  return (
    <YStack flex={1} padding={16}>
      <ScrollView ref={scrollViewRef} flex={1} padding={8} borderRadius={8}>
        {messages[chatGroupId]?.map((message: Models.Document, index: number) => {
          const user = message.users;
          const isSender = user === user?.$id;
          const status = messageStatus[message.$id];

          return (
            <ChatBubble key={message.$id} message={message} status={status} senderName={user} />
          );
        })}
      </ScrollView>
      <XStack alignItems="center" paddingTop={16} gap="$2">
        <Input
          flex={1}
          value={newMessage}
          onChangeText={handleInputChange}
          placeholder="Type a message..."
          borderRadius={16}
          paddingHorizontal={16}
          paddingVertical={12}
        />
        <Button onPress={handleSendMessage} borderRadius={16} theme="accent" themeInverse>
          <Send size={20} />
        </Button>
      </XStack>
    </YStack>
  );
}