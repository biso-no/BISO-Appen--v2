// ChatContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { subScribeToChat } from './appwrite';
import { Models } from 'react-native-appwrite';

interface ChatMessage {
  content: string;
  sender: string;
  timestamp: string;
}

interface ChatResponse {
  chatGroupId: string;
  message: ChatMessage;
}

interface MessagesState {
  [chatGroupId: string]: ChatMessage[];
}

interface ChatContextType {
  messages: MessagesState;
  notify: (message: string) => void;
  updateChatList: (chatGroupId: string, message: ChatMessage) => void;
  updateSpecificChat: (chatGroupId: string, message: ChatMessage) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ProviderProps {
  children: React.ReactNode;
  data: Models.User<Models.Preferences> | null;
}

export const ChatProvider = ({ children, data }: ProviderProps) => {
  const [messages, setMessages] = useState<MessagesState>({});
  const [subscriptions, setSubscriptions] = useState<(() => void)[]>([]);

  const notify = (message: string) => {
    // Implement your notification logic here
    console.log("New notification: ", message);
  };

  const updateChatList = (chatGroupId: string, message: ChatMessage) => {
    // Implement logic to update the chat list
    // This can be used to update the latest message preview in the chat list
    console.log(`Update chat list for group ${chatGroupId}: `, message);
  };

  const updateSpecificChat = (chatGroupId: string, message: ChatMessage) => {
    // Implement logic to update a specific chat
    // This can be used to update the currently open chat window
    console.log(`Update specific chat ${chatGroupId}: `, message);
  };

  useEffect(() => {
    if (data?.$id) {
      const unsubscribe = subScribeToChat((response: ChatResponse) => {
        setMessages((prevMessages) => {
          const newMessages = {
            ...prevMessages,
            [response.chatGroupId]: [
              ...(prevMessages[response.chatGroupId] || []),
              response.message,
            ],
          };
          // Notify user
          notify(response.message.content);
          // Update chat list
          updateChatList(response.chatGroupId, response.message);
          // Update specific chat if open
          updateSpecificChat(response.chatGroupId, response.message);
          return newMessages;
        });
      });

      setSubscriptions((prev) => [...prev, unsubscribe]);

      return () => {
        subscriptions.forEach((unsubscribe) => unsubscribe());
      };
    }
  }, [data?.$id]);

  return (
    <ChatContext.Provider value={{ messages, notify, updateChatList, updateSpecificChat }}>
      {children}
    </ChatContext.Provider>
  );
};
