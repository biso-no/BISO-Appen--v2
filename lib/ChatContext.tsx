import React, { createContext, useContext, useState, useEffect } from 'react';
import { subScribeToChat, fetchChatMessages } from './appwrite';
import { Models } from 'react-native-appwrite';

interface ChatResponse {
  channels: string[];
  events: string[];
  payload: Models.Document;
  timestamp: string;
}

interface MessagesState {
  [chatGroupId: string]: Models.Document[];
}

interface ChatContextType {
  messages: MessagesState;
  notify: (message: string) => void;
  updateChatList: (chatGroupId: string, message: Models.Document) => void;
  updateSpecificChat: (chatGroupId: string, message: Models.Document) => void;
  fetchMessages: (chatGroupId: string) => Promise<void>;
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
    console.log("New notification: ", message);
  };

  const updateChatList = (chatGroupId: string, message: Models.Document) => {
    console.log(`Update chat list for group ${chatGroupId}: `, message);
  };

  const updateSpecificChat = (chatGroupId: string, message: Models.Document) => {
    console.log(`Update specific chat ${chatGroupId}: `, message);
  };

  const fetchMessages = async (chatGroupId: string) => {
    try {
      const fetchedMessages = await fetchChatMessages(chatGroupId);
      setMessages((prevMessages) => ({
        ...prevMessages,
        [chatGroupId]: fetchedMessages.documents,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (data?.$id) {
      const unsubscribe = subScribeToChat((response: ChatResponse) => {
        const message = response.payload;
        console.log("Received message:", message);

        if (message && message.content && message.chat_id) {
          setMessages((prevMessages) => {
            const newMessages = {
              ...prevMessages,
              [message.chat_id]: [
                ...(prevMessages[message.chat_id] || []),
                message,
              ],
            };
            notify(message.content);
            updateChatList(message.chat_id, message);
            updateSpecificChat(message.chat_id, message);
            return newMessages;
          });
        } else {
          console.error('Received invalid response:', response);
        }
      });

      setSubscriptions((prev) => [...prev, unsubscribe]);

      return () => {
        subscriptions.forEach((unsubscribe) => unsubscribe());
      };
    }
  }, [data?.$id]);

  return (
    <ChatContext.Provider value={{ messages, notify, updateChatList, updateSpecificChat, fetchMessages }}>
      {children}
    </ChatContext.Provider>
  );
};
