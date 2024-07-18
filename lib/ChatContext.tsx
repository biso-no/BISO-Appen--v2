import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

interface TypingState {
  [chatGroupId: string]: Set<string>;
}

interface UnreadMessagesState {
  [chatGroupId: string]: number;
}

interface MessageStatusState {
  [messageId: string]: 'sending' | 'sent' | 'delivered' | 'read';
}

interface ChatContextType {
  messages: MessagesState;
  currentChatGroup: string | null;
  currentChatGroupName: string | undefined;
  typingUsers: TypingState;
  unreadMessages: UnreadMessagesState;
  messageStatus: MessageStatusState;
  notify: (message: string) => void;
  updateChatList: (chatGroupId: string, message: Models.Document) => void;
  updateSpecificChat: (chatGroupId: string, message: Models.Document) => void;
  fetchMessages: (chatGroupId: string) => Promise<void>;
  setCurrentChatGroup: (chatGroupId: string) => void;
  setCurrentChatGroupName: (chatGroupName: string) => void;
  setUserTyping: (chatGroupId: string, userId: string, isTyping: boolean) => void;
  markMessagesAsRead: (chatGroupId: string) => void;
  addReaction: (chatGroupId: string, messageId: string, reaction: string) => void;
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
  const [currentChatGroup, setCurrentChatGroup] = useState<string | null>(null);
  const [currentChatGroupName, setCurrentChatGroupName] = useState<string | undefined>(undefined);
  const [typingUsers, setTypingUsers] = useState<TypingState>({});
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessagesState>({});
  const [messageStatus, setMessageStatus] = useState<MessageStatusState>({});
  const [subscriptions, setSubscriptions] = useState<(() => void)[]>([]);

  const notify = (message: string) => {
    console.log("New notification: ", message);
  };

  const updateChatList = (chatGroupId: string, message: Models.Document) => {
    console.log(`Update chat list for group ${chatGroupId}: `, message);
    setUnreadMessages((prev) => ({
      ...prev,
      [chatGroupId]: (prev[chatGroupId] || 0) + 1,
    }));
  };

  const updateSpecificChat = (chatGroupId: string, message: Models.Document) => {
    console.log(`Update specific chat ${chatGroupId}: `, message);
    setMessages((prevMessages) => ({
      ...prevMessages,
      [chatGroupId]: [
        ...(prevMessages[chatGroupId] || []),
        message,
      ],
    }));
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

  const setUserTyping = useCallback((chatGroupId: string, userId: string, isTyping: boolean) => {
    setTypingUsers((prev) => {
      const currentTypingUsers = prev[chatGroupId] || new Set();
      if (isTyping) {
        currentTypingUsers.add(userId);
      } else {
        currentTypingUsers.delete(userId);
      }
      return {
        ...prev,
        [chatGroupId]: currentTypingUsers,
      };
    });
  }, []);

  const markMessagesAsRead = (chatGroupId: string) => {
    setUnreadMessages((prev) => ({
      ...prev,
      [chatGroupId]: 0,
    }));
  };

  const addReaction = (chatGroupId: string, messageId: string, reaction: string) => {
    // Implement reaction logic here
    console.log(`Add reaction ${reaction} to message ${messageId} in chat group ${chatGroupId}`);
  };

  useEffect(() => {
    if (data?.$id) {
      console.log("Subscribing to chat...");
      try {
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

          setMessageStatus((prevStatus) => ({
            ...prevStatus,
            [message.$id]: 'delivered',
          }));
        } else {
          console.error('Received invalid response:', response);
        }
      });

      setSubscriptions((prev) => [...prev, unsubscribe]);

      return () => {
        subscriptions.forEach((unsubscribe) => unsubscribe());
      };
    } catch (error) {
      console.error('Error subscribing to chat:', error);
    }
    }
  }, [data?.$id]);

  return (
    <ChatContext.Provider value={{
      messages,
      currentChatGroup,
      currentChatGroupName,
      typingUsers,
      unreadMessages,
      messageStatus,
      notify,
      updateChatList,
      updateSpecificChat,
      fetchMessages,
      setCurrentChatGroup,
      setCurrentChatGroupName,
      setUserTyping,
      markMessagesAsRead,
      addReaction,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
