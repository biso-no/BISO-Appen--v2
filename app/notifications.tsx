import { H1, YStack, XStack, Button, Text, ScrollView } from 'tamagui';
import React, { useState, useEffect } from 'react';
import { MotiView, useAnimationState } from 'moti';

interface Notification {
  id: number;
  title: string;
  content: string;
}

interface Notifications {
  messages: Notification[];
  posts: Notification[];
  events: Notification[];
}

const notifications: Notifications = {
  messages: [
    { id: 1, title: 'New Message from Alice', content: 'Hey, how are you doing?' },
    { id: 2, title: 'New Message from Bob', content: 'Don\'t forget our meeting tomorrow.' },
  ],
  posts: [
    { id: 1, title: 'New Post in Tech Group', content: 'Check out the latest tech trends...' },
    { id: 2, title: 'New Post in Cooking Group', content: 'Here is a new recipe for you to try...' },
  ],
  events: [
    { id: 1, title: 'Upcoming Event: Tech Conference', content: 'Join us for the annual tech conference...' },
    { id: 2, title: 'Upcoming Event: Cooking Workshop', content: 'Sign up for a fun cooking workshop...' },
  ],
};

const NotificationScreen = () => {
  const [selectedTab, setSelectedTab] = useState<keyof Notifications>('messages');
  const animationState = useAnimationState({
    from: { opacity: 0, translateY: -10 },
    animate: { opacity: 1, translateY: 0 },
    exit: { opacity: 0, translateY: 10 },
  });

  useEffect(() => {
    animationState.transitionTo('from');
    setTimeout(() => {
      animationState.transitionTo('animate');
    }, 50); // Delay slightly to ensure transitionTo is properly called
  }, [selectedTab]);

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
            delay: notification.id * 100,
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
          backgroundColor={selectedTab === 'messages' ? '$primary' : '$background'}
          onPress={() => setSelectedTab('messages')}
        >
          Messages
        </Button>
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
