import { H1, YStack, XStack, Button, Text, ScrollView } from 'tamagui';
import React, { useState, useEffect } from 'react';
import { MotiView, useAnimationState } from 'moti';
import { getDocuments } from '@/lib/appwrite';

interface Notification {
  id: string;
  title: string;
  content: string;
  href?: string;
  status?: string; // 'read' or 'unread'
  type: 'post' | 'event';
}

interface Notifications {
  messages: Notification[];
  posts: Notification[];
  events: Notification[];
}

const NotificationScreen = () => {
  
  const [selectedTab, setSelectedTab] = useState<keyof Notifications>('messages');
  const [notifications, setNotifications] = useState<Notifications>({ messages: [], posts: [], events: [] });
  const animationState = useAnimationState({
    from: { opacity: 0, translateY: -10 },
    animate: { opacity: 1, translateY: 0 },
    exit: { opacity: 0, translateY: 10 },
  });

  const getNotifications = async () => {
    const fetchedDocuments = await getDocuments('notifications');
    const formattedNotifications: Notifications = { messages: [], posts: [], events: [] };
    
    fetchedDocuments.documents.forEach((doc: any) => {
      const notif: Notification = {
        id: doc.$id,
        title: doc.title || `Notification ${doc.$id}`,
        content: doc.content,
        href: doc.href,
        status: doc.status,
        type: doc.type as 'post' | 'event'
      };


      if (notif.type === 'post') {
        formattedNotifications.posts.push(notif);
      } else if (notif.type === 'event') {
        formattedNotifications.events.push(notif);
      }
    });

    setNotifications(formattedNotifications);
  }

  useEffect(() => {
    animationState.transitionTo('from');
    setTimeout(() => {
      animationState.transitionTo('animate');
    }, 50); // Delay slightly to ensure transitionTo is properly called
  }, [selectedTab]);

  useEffect(() => {
    getNotifications();
  }, []);

  const renderNotifications = () => {
    const currentNotifications = notifications[selectedTab];
    if (currentNotifications.length === 0) {
      return (
        <MotiView
          state={animationState}
          transition={{
            opacity: {
              type: 'timing',
              duration: 500,
            },
            translateY: {
              type: 'timing',
              duration: 500,
            },
          }}
        >
          <YStack alignItems="center" padding="$4">
            <Text fontSize="$6" color="$color">No notifications yet.</Text>
            <Text fontSize="$4" color="$color">Stay tuned for updates and new notifications!</Text>
          </YStack>
        </MotiView>
      );
    }

    return currentNotifications.map((notification) => (
      <MotiView
        key={notification.id}
        state={animationState}
        transition={{
          opacity: {
            type: 'timing',
            duration: 500,
          },
          translateY: {
            type: 'timing',
            duration: 500,
            delay: parseInt(notification.id) * 100, // Assuming ids are numeric strings
          },
        }}
      >
        <YStack padding="$3" backgroundColor="$background" borderRadius="$4" marginBottom="$3">
          <Text fontWeight="700">{notification.title}</Text>
          <Text>{notification.content}</Text>
        </YStack>
      </MotiView>
    ));
  };

  return (
    <YStack flex={1} padding="$4">
      <XStack justifyContent="space-around" marginBottom="$4">
        <Button
          size="$4"
          backgroundColor={selectedTab === 'posts' ? '$primary' : '$background'}
          onPress={() => setSelectedTab('posts')}
        >
          Posts
        </Button>
        <Button
          size="$4"
          backgroundColor={selectedTab === 'events' ? '$primary' : '$background'}
          onPress={() => setSelectedTab('events')}
        >
          Events
        </Button>
      </XStack>
      <ScrollView>
        {renderNotifications()}
      </ScrollView>
    </YStack>
  );
};

export default NotificationScreen;
