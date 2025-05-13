import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import {
  XStack,
  YStack,
  Text,
  Button,
  Avatar,
  Spinner,
  Paragraph,
  useTheme,
  AnimatePresence,
  Input,
  ScrollView,
  styled,
  Theme,
  TextArea,
  Circle,
  Image,
  H4,
  useMedia,
  Sheet,
  Separator,
  Handle,
} from 'tamagui';
import {
  X,
  Send,
  Minimize2,
  Maximize2,
  Bot,
  RefreshCcw,
  Sparkles,
  ChevronRight,
  Zap,
  Lightbulb,
  MessageCircle,
  Wand2,
  Brain,
  Search,
  Star,
  HelpCircle,
  AlertTriangle,
  Trash2,
  MoreHorizontal,
} from '@tamagui/lucide-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  useColorScheme, 
  Keyboard, 
  TouchableWithoutFeedback, 
  KeyboardAvoidingView, 
  Platform, 
  GestureResponderEvent,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  Alert,
  KeyboardEvent,
  LayoutChangeEvent,
  ScrollViewProps,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import { MotiView, MotiText, AnimatePresence as MotiAnimatePresence, useAnimationState } from 'moti';
import { Easing } from 'react-native-reanimated';
import Markdown from 'react-native-markdown-display';
import { useTranslation } from 'react-i18next';
import { useChat, Message as AIMessage } from '@ai-sdk/react';

// Styled components with enhanced visuals
const MessageBubble = styled(YStack, {
  padding: '$4',
  borderRadius: '$4',
  marginBottom: '$3',
  maxWidth: '85%',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  variants: {
    type: {
      user: {
        backgroundColor: '$blue9',
        borderTopRightRadius: '$1',
        alignSelf: 'flex-end',
        borderBottomRightRadius: '$1',
      },
      bot: {
        backgroundColor: '$gray4',
        borderTopLeftRadius: '$1',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: '$1',
      },
    },
  } as const,
});

const SuggestionButton = styled(Button, {
  backgroundColor: 'transparent',
  borderColor: '$blue8',
  borderWidth: 1,
  borderRadius: '$10',
  marginRight: '$2',
  marginBottom: '$2',
  paddingHorizontal: '$3',
  height: 40,
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
});

const PulsatingDot = styled(Circle, {
  width: 10,
  height: 10,
  backgroundColor: '$blue9',
  margin: 2,
});

// Animated header with gradient
const AnimatedHeader = styled(XStack, {
  padding: '$3',
  alignItems: 'center',
  space: '$2',
  overflow: 'hidden',
});

// Interface for our extended message type
interface ExtendedMessage extends AIMessage {
  timestamp?: Date;
}

const ENHANCED_SUGGESTIONS = [
  { id: 'suggest-1', text: 'How can I improve my profile?', icon: <Star size={14} /> },
  { id: 'suggest-2', text: 'Find me a job that matches my skills', icon: <Search size={14} /> },
  { id: 'suggest-3', text: 'Give me feedback on my resume', icon: <HelpCircle size={14} /> },
  { id: 'suggest-4', text: 'Career advice for tech jobs', icon: <Lightbulb size={14} /> },
];

interface AICopilotProps {
  isModal?: boolean;
  theme?: 'default' | 'futuristic' | 'minimal';
  accentColor?: string;
  onClose?: () => void;
  sheetMode?: boolean;
}

export function AICopilot({ isModal = false, theme = 'default', accentColor, onClose, sheetMode = false }: AICopilotProps) {
  const insets = useSafeAreaInsets();
  const tamaguiTheme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const media = useMedia();
  
  // Animation states for visual effects
  const [expanded, setExpanded] = useState(true);
  const [showWelcomeAnim, setShowWelcomeAnim] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<typeof TextArea>(null);
  const opacityAnimRef = useRef(new Animated.Value(0)).current;
  
  // Get the background, text, and accent colors based on theme
  const getThemeColors = () => {
    const customAccent = accentColor || '$blue9';
    
    switch(theme) {
      case 'futuristic':
        return {
          primaryColor: isDark ? customAccent : customAccent,
          bubbleBgUser: isDark ? customAccent : customAccent,
          bubbleBgBot: isDark ? '$gray3' : '$gray4',
          textColorUser: 'white',
          textColorBot: isDark ? '$gray12' : '$gray12',
          headerBg: isDark ? 'transparent' : 'transparent',
          inputBg: isDark ? '$gray3' : '$gray1',
        };
      case 'minimal':
        return {
          primaryColor: isDark ? customAccent : customAccent,
          bubbleBgUser: isDark ? '$gray5' : '$gray3',
          bubbleBgBot: isDark ? '$gray3' : 'white',
          textColorUser: isDark ? '$gray12' : '$gray12',
          textColorBot: isDark ? '$gray12' : '$gray12',
          headerBg: isDark ? '$gray2' : 'white',
          inputBg: isDark ? '$gray2' : 'white',
        };
      default:
        return {
          primaryColor: customAccent || '$blue9',
          bubbleBgUser: isDark ? customAccent || '$blue9' : customAccent || '$blue9',
          bubbleBgBot: isDark ? '$gray4' : '$gray5',
          textColorUser: 'white',
          textColorBot: isDark ? '$gray12' : '$gray12',
          headerBg: isDark ? '$gray2' : 'white',
          inputBg: isDark ? '$gray3' : 'white',
        };
    }
  };
  
  const themeColors = getThemeColors();
  const suggestions = ENHANCED_SUGGESTIONS;

  // Use the Vercel AI SDK's useChat hook
  const {
    messages,
    input,
    handleInputChange: aiHandleInputChange,
    handleSubmit: aiHandleSubmit,
    isLoading,
    error,
    reload,
    stop,
    setMessages: setAIMessages,
  } = useChat({
    api: 'https://68233095312e736521e7.appwrite.biso.no/',
    initialMessages: [
      {
        id: 'welcome-msg',
        content: 'Hello! I\'m your AI Copilot. How can I help you today?',
        role: 'assistant',
      }
    ],
    onError: (error) => {
      console.error('Chat error:', error);
      // Error feedback with native Alert
      Alert.alert(
        t('Message Failed'),
        t('Something went wrong. Please try again.'),
        [{ text: 'OK' }]
      );
      
      // Error haptic feedback
      if (Platform.OS === 'ios') {
        Vibration.vibrate([0, 50, 30, 100]);
      } else {
        Vibration.vibrate(400);
      }
    },
    onFinish: () => {
      // Success feedback
      if (Platform.OS === 'ios') {
        // Use light haptic feedback for success
        Vibration.vibrate(10);
      }
      scrollToBottom(true);
    }
  });

  // Adapter functions for React Native
  const handleInputChange = (text: string) => {
    aiHandleInputChange({ target: { value: text } } as any);
  };

  const handleSendMessage = useCallback(() => {
    if (input.trim()) {
      setShowWelcomeAnim(false);
      aiHandleSubmit(null as any);
      scrollToBottom(true);
    }
  }, [input, aiHandleSubmit]);

  const handleSuggestionPress = useCallback((text: string) => {
    handleInputChange(text);
    // Subtle animation on press
    setTimeout(() => {
      aiHandleSubmit(null as any);
    }, 100);
  }, [aiHandleSubmit]);

  const setMessages = (msgs: ExtendedMessage[]) => {
    setAIMessages(msgs);
  };

  // Handle keyboard showing/hiding with enhanced animations
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event: KeyboardEvent) => {
        setKeyboardVisible(true);
        scrollToBottom(true);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Improved scroll to bottom function with enhanced animation
  const scrollToBottom = useCallback((animated = true) => {
    if (scrollViewRef.current && messages.length > 0) {
      scrollViewRef.current.scrollToEnd({ 
        animated,
      });
    }
  }, [messages.length]);

  // Handle content size change on ScrollView with smooth animations
  const handleContentSizeChange = useCallback((width: number, height: number) => {
    setContentHeight(height);
    scrollToBottom();
  }, [scrollToBottom]);

  // Scroll to bottom with animation when new messages arrive
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  // Minimize/expand chatbot with enhanced animation
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // When in modal mode, always use the expanded view
  useEffect(() => {
    if (isModal) {
      setExpanded(true);
    }
  }, [isModal]);

  // Define typing animation for loading states
  const TypingAnimation = () => (
    <XStack gap="$1" alignItems="center" paddingVertical="$1">
      <MotiView
        from={{ opacity: 0.4, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'timing',
          duration: 600,
          loop: true,
        }}
      >
        <PulsatingDot backgroundColor={themeColors.primaryColor} />
      </MotiView>
      <MotiView
        from={{ opacity: 0.4, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'timing',
          duration: 600,
          loop: true,
          delay: 200,
        }}
      >
        <PulsatingDot backgroundColor={themeColors.primaryColor} />
      </MotiView>
      <MotiView
        from={{ opacity: 0.4, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'timing',
          duration: 600,
          loop: true,
          delay: 400,
        }}
      >
        <PulsatingDot backgroundColor={themeColors.primaryColor} />
      </MotiView>
    </XStack>
  );

  const resetConversation = () => {
    setMessages([]);
    setShowResetConfirm(false);
  };

  // Component for the futuristic gradient header
  const renderHeader = () => (
    <AnimatedHeader
      padding="$3"
      alignItems="center"
      gap="$2"
      borderBottomWidth={1}
      borderBottomColor={isDark ? '$gray8' : '$gray3'}
      position="relative"
      zIndex={10}
    >
      {theme === 'futuristic' ? (
        <LinearGradient
          colors={isDark 
            ? [(tamaguiTheme.blue9?.val ?? '#0091ff') as string, (tamaguiTheme.purple9?.val ?? '#8c00ff') as string] 
            : [(tamaguiTheme.blue8?.val ?? '#0080ff') as string, (tamaguiTheme.purple8?.val ?? '#7f00ff') as string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            opacity: 0.7,
          }}
        />
      ) : null}
      
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 150 }}
      >
        <Circle size={40} backgroundColor={themeColors.primaryColor}>
          <Bot color="white" size={20} />
        </Circle>
      </MotiView>
      
      <YStack flex={1}>
        <MotiText
          from={{ translateX: -10, opacity: 0 }}
          animate={{ translateX: 0, opacity: 1 }}
          transition={{ type: 'timing', duration: 350 }}
        >
          <H4 fontWeight="700" color={isDark ? 'white' : '$gray12'}>
            {t('AI Copilot')}
          </H4>
        </MotiText>
        
        {isLoading && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 300 }}
          >
            <XStack gap="$1" alignItems="center">
              <TypingAnimation />
            </XStack>
          </MotiView>
        )}
      </YStack>
      
      <XStack gap="$1">
        {/* Reset button */}
        <Button
          size="$2"
          circular
          icon={<Trash2 size={16} color={isDark ? '$gray10' : '$gray10'} />}
          onPress={() => setShowResetConfirm(true)}
          chromeless
          opacity={0.8}
          hoverStyle={{ opacity: 1 }}
          pressStyle={{ scale: 0.95 }}
        />
        
        {!isModal && !sheetMode && (
          <>
            {expanded ? (
              <Button
                size="$2"
                circular
                icon={<Minimize2 size={16} color={isDark ? 'white' : '$gray12'} />}
                onPress={toggleExpanded}
                chromeless
              />
            ) : (
              <Button
                size="$2"
                circular
                icon={<Maximize2 size={16} color={isDark ? 'white' : '$gray12'} />}
                onPress={toggleExpanded}
                chromeless
              />
            )}
            <Button
              size="$2"
              circular
              icon={<X size={16} color={isDark ? 'white' : '$gray12'} />}
              onPress={() => {
                if (onClose) onClose();
                else setExpanded(false);
              }}
              chromeless
            />
          </>
        )}
      </XStack>
    </AnimatedHeader>
  );

  // Component for the welcome screen with stunning visuals
  const renderWelcomeScreen = () => (
    <YStack alignItems="center" justifyContent="center" flex={1} paddingVertical="$6">
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 150,
        }}
      >
        <YStack
          backgroundColor={isDark ? '$gray3' : '$blue2'}
          borderRadius="$6"
          overflow="hidden"
          width={Dimensions.get('window').width - 64}
          maxWidth={500}
        >
          <LinearGradient
            colors={
              theme === 'futuristic'
                ? [(tamaguiTheme.blue9?.val ?? '#0091ff') as string, (tamaguiTheme.purple9?.val ?? '#8c00ff') as string]
                : [(tamaguiTheme.blue5?.val ?? '#0080ff') as string, (tamaguiTheme.blue8?.val ?? '#0060ff') as string]
            }
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 80,
              opacity: theme === 'minimal' ? 0.3 : 0.7,
            }}
          />
          
          <YStack padding="$5" alignItems="center">
            <Circle
              size={80}
              marginTop="$2"
              backgroundColor={
                theme === 'futuristic'
                  ? 'rgba(0,0,0,0.2)'
                  : isDark ? '$blue8' : '$blue5'
              }
              shadowColor="$shadowColor"
              shadowRadius={20}
              shadowOpacity={0.5}
              shadowOffset={{ width: 0, height: 5 }}
            >
              <MotiView
                from={{ rotate: '0deg' }}
                animate={{ rotate: '360deg' }}
                transition={{
                  loop: true,
                  repeatReverse: false,
                  type: 'timing',
                  duration: 20000,
                }}
                style={{ position: 'absolute' }}
              >
                <Circle
                  size={90}
                  borderWidth={1}
                  borderColor={isDark ? '$blue8' : '$blue8'}
                  opacity={0.3}
                />
              </MotiView>
              
              <MotiView
                from={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  loop: true,
                  type: 'timing',
                  duration: 2000,
                }}
              >
                <Sparkles color="white" size={30} />
              </MotiView>
            </Circle>
            
            <YStack gap="$3" marginTop="$5" alignItems="center">
              <Text
                fontWeight="800"
                fontSize={24}
                textAlign="center"
                marginBottom="$1"
                color={isDark ? 'white' : '$gray12'}
              >
                {t('AI Copilot')}
              </Text>
              
              <Paragraph
                size="$3"
                textAlign="center"
                color={isDark ? '$gray11' : '$gray11'}
                opacity={0.9}
                maxWidth={300}
              >
                {t('Ask me anything about your job search, resume, or career advice. I\'m here to assist you!')}
              </Paragraph>
            </YStack>
          </YStack>
        </YStack>
      </MotiView>

      {/* Enhanced Suggestions */}
      <YStack gap="$4" marginTop="$6" width="100%" paddingHorizontal="$4">
        <XStack flexWrap="wrap" justifyContent="center">
          {suggestions.map((suggestion, index) => (
            <MotiView
              key={suggestion.id}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: 'timing',
                duration: 400,
                delay: 300 + index * 100,
              }}
            >
              <SuggestionButton
                size="$3"
                marginRight="$2"
                marginBottom="$3"
                onPress={() => handleSuggestionPress(suggestion.text)}
                pressStyle={{ scale: 0.97 }}
                backgrounded
                hoverStyle={{ backgroundColor: isDark ? '$blue5' : '$blue3' }}
                borderColor={theme === 'minimal' ? '$gray8' : themeColors.primaryColor}
                borderWidth={1}
                shadowColor="$shadowColor"
                shadowOpacity={0.2}
                shadowRadius={5}
              >
                <XStack gap="$2" alignItems="center" paddingHorizontal="$1">
                  {suggestion.icon && (
                    <Circle size={26} backgroundColor={isDark ? '$blue8' : '$blue4'}>
                      {React.cloneElement(suggestion.icon, { 
                        color: isDark ? 'white' : themeColors.primaryColor,
                        size: 14 
                      })}
                    </Circle>
                  )}
                  <Text
                    fontSize="$3"
                    color={isDark ? '$gray11' : '$gray12'}
                    fontWeight="500"
                  >
                    {suggestion.text}
                  </Text>
                  <ChevronRight 
                    size={14} 
                    color={isDark ? '$gray10' : '$gray10'} 
                  />
                </XStack>
              </SuggestionButton>
            </MotiView>
          ))}
        </XStack>
      </YStack>
    </YStack>
  );

  // Reset confirmation dialog
  const renderResetConfirmation = () => {
    if (!showResetConfirm) return null;
    
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 15 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 100,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <YStack
          backgroundColor={isDark ? '$gray3' : 'white'}
          borderRadius="$4"
          padding="$4"
          width="90%"
          maxWidth={350}
          gap="$4"
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 5 }}
          shadowOpacity={0.3}
          shadowRadius={20}
        >
          <H4 textAlign="center" color={isDark ? 'white' : '$gray12'}>
            {t('Reset Conversation')}
          </H4>
          
          <Paragraph textAlign="center" color="$gray11">
            {t('Are you sure you want to reset this conversation? This cannot be undone.')}
          </Paragraph>
          
          <XStack gap="$3" justifyContent="center">
            <Button
              size="$3"
              onPress={() => setShowResetConfirm(false)}
              backgroundColor={isDark ? '$gray6' : '$gray3'}
              hoverStyle={{ opacity: 0.9 }}
              pressStyle={{ scale: 0.98 }}
              borderRadius="$4"
              flex={1}
            >
              <Text color={isDark ? 'white' : '$gray12'}>
                {t('Cancel')}
              </Text>
            </Button>
            
            <Button
              size="$3"
              onPress={resetConversation}
              backgroundColor="$red9"
              hoverStyle={{ opacity: 0.9 }}
              pressStyle={{ scale: 0.98 }}
              borderRadius="$4"
              flex={1}
            >
              <Text color="white">
                {t('Reset')}
              </Text>
            </Button>
          </XStack>
        </YStack>
      </MotiView>
    );
  };

  // Enhanced message bubble with animations and markdown support
  const renderMessage = (message: ExtendedMessage, index: number) => {
    const isUser = message.role === 'user';
    const isLastMessage = index === messages.length - 1;
    
    return (
      <MotiView
        key={message.id}
        from={{ 
          opacity: 0, 
          scale: 0.96, 
          translateY: 10,
          translateX: isUser ? 20 : -20 
        }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          translateY: 0,
          translateX: 0
        }}
        transition={{
          type: 'spring',
          damping: 15,
          mass: 0.8,
          stiffness: 120,
        }}
      >
        <XStack width="100%" alignItems="flex-start" gap="$2">
          {!isUser && (
            <Circle 
              size={28} 
              backgroundColor={themeColors.primaryColor}
              opacity={0.9}
              marginTop="$1"
            >
              <Bot color="white" size={16} />
            </Circle>
          )}
          
          <MessageBubble
            type={isUser ? 'user' : 'bot'}
            backgroundColor={isUser ? themeColors.bubbleBgUser : themeColors.bubbleBgBot}
            borderRadius="$4"
            overflow="hidden"
            flex={1}
            maxWidth={isUser ? '85%' : '90%'}
          >
            {isUser && theme === 'futuristic' && (
              <LinearGradient
                colors={[
                  (tamaguiTheme.blue9?.val ?? '#0091ff') as string, 
                  (tamaguiTheme.purple9?.val ?? '#8c00ff') as string
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />
            )}
            
            {isUser ? (
              <Text
                color={isUser ? themeColors.textColorUser : themeColors.textColorBot}
                selectable
                fontSize="$4"
                lineHeight={24}
              >
                {message.content}
              </Text>
            ) : (
              <Markdown
                style={{
                  body: {
                    color: isDark ? tamaguiTheme.gray12?.val : tamaguiTheme.gray12?.val,
                    fontSize: 16, 
                    lineHeight: 24,
                    fontFamily: 'System',
                  },
                  paragraph: {
                    marginVertical: 8,
                  },
                  heading1: {
                    fontSize: 22,
                    fontWeight: 'bold',
                    marginTop: 10,
                    marginBottom: 5,
                    color: isDark ? tamaguiTheme.gray12?.val : tamaguiTheme.gray12?.val,
                  },
                  heading2: {
                    fontSize: 20,
                    fontWeight: 'bold',
                    marginTop: 10,
                    marginBottom: 5,
                    color: isDark ? tamaguiTheme.gray12?.val : tamaguiTheme.gray12?.val,
                  },
                  code_block: {
                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                    padding: 10,
                    borderRadius: 4,
                    fontFamily: 'monospace',
                  },
                  code_inline: {
                    backgroundColor: isDark ? '#334155' : '#e2e8f0',
                    padding: 4,
                    borderRadius: 2,
                    fontFamily: 'monospace',
                  },
                  link: {
                    color: tamaguiTheme.blue9?.val,
                    textDecorationLine: 'underline',
                  },
                  blockquote: {
                    borderLeftColor: isDark ? tamaguiTheme.gray6?.val : tamaguiTheme.gray6?.val,
                    borderLeftWidth: 4,
                    paddingLeft: 12,
                    marginLeft: 0,
                    marginVertical: 10,
                    opacity: 0.8,
                  },
                  list_item: {
                    marginBottom: 6,
                  }
                }}
              >
                {message.content}
              </Markdown>
            )}
          </MessageBubble>
          
          {isUser && (
            <Circle 
              size={28} 
              backgroundColor="$gray6"
              opacity={0}
              marginTop="$1"
            >
              <Avatar size="100%" circular />
            </Circle>
          )}
        </XStack>
      </MotiView>
    );
  };

  // Component for the typing indicator
  const renderTypingIndicator = () => {
    if (!isLoading) return null;
    
    return (
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300 }}
        style={{ alignSelf: 'flex-start', marginVertical: 8 }}
      >
        <XStack
          gap="$2"
          alignItems="center"
          backgroundColor={themeColors.bubbleBgBot}
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$4"
        >
          <Circle size={24} backgroundColor={themeColors.primaryColor}>
            <Bot color="white" size={12} />
          </Circle>
          <TypingAnimation />
        </XStack>
      </MotiView>
    );
  };

  // Enhanced error component
  const renderError = () => {
    if (!error) return null;
    
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <YStack
          padding="$4"
          backgroundColor="$red2"
          borderRadius="$4"
          borderLeftWidth={3}
          borderColor="$red9"
          marginVertical="$3"
          gap="$2"
        >
          <XStack gap="$2" alignItems="center">
            <AlertTriangle size={18} color={(tamaguiTheme.red9?.val ?? '#ff0000') as string} />
            <Text color="$red9" fontWeight="600">
              {t('Message Failed')}
            </Text>
          </XStack>
          
          <Text color="$red9" fontSize="$3">
            {t('Something went wrong. Please try again.')}
          </Text>
          
          <Button
            marginTop="$2"
            size="$3"
            theme="red"
            backgroundColor="$red9"
            color="white"
            icon={<RefreshCcw size={14} color="white" />}
            onPress={() => reload()}
            pressStyle={{ scale: 0.98 }}
          >
            {t('Retry')}
          </Button>
        </YStack>
      </MotiView>
    );
  };

  // Enhanced input area with better positioning
  const renderInputArea = () => (
    <MotiView
      from={{ translateY: 20, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <XStack
        padding="$3"
        paddingBottom={keyboardVisible ? '$4' : insets.bottom > 0 ? insets.bottom + 5 : '$3'}
        gap="$2"
        alignItems="center"
      >
        <YStack flex={1} position="relative">
          <TextArea
            ref={inputRef as any}
            flex={1}
            size="$4"
            borderWidth={1}
            borderColor={isDark ? '$gray7' : '$gray5'}
            backgroundColor={themeColors.inputBg}
            placeholder={t('Message AI Copilot...')}
            placeholderTextColor={isDark ? '$gray9' : '$gray9'}
            value={input}
            onChangeText={handleInputChange}
            autoCapitalize="none"
            minHeight={45}
            maxHeight={120}
            borderRadius="$4"
            onSubmitEditing={() => handleSendMessage()}
            onFocus={() => scrollToBottom(true)}
            paddingRight="$9"
            paddingVertical="$2"
            fontWeight="400"
            fontSize={16}
          />
          
          <XStack 
            position="absolute" 
            right={5} 
            bottom={0}
            top={0} 
            justifyContent="center"
            alignItems="center"
          >
            <Button
              size="$3"
              circular
              backgroundColor={input.trim() ? themeColors.primaryColor : '$gray8'}
              onPress={handleSendMessage}
              disabled={isLoading || !input.trim()}
              opacity={isLoading || !input.trim() ? 0.5 : 1}
              margin="$1"
              pressStyle={{ scale: 0.95 }}
            >
              <Send size={16} color="white" />
            </Button>
          </XStack>
        </YStack>
      </XStack>
    </MotiView>
  );

  const contentView = (
    <YStack flex={1} overflow="hidden">
      {/* Header */}
      {renderHeader()}

      {/* Content - Ensure it's always visible */}
      <YStack flex={1} overflow="hidden" position="relative">
        {expanded && (
          <MotiView
            from={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            style={{ flex: 1 }}
          >
            {/* Messages Container - Update ScrollView with improved props */}
            <Sheet.ScrollView
              ref={scrollViewRef}
              contentContainerStyle={{ 
                padding: 16, 
                flexGrow: messages.length === 0 ? 1 : undefined, 
                paddingBottom: keyboardVisible ? 80 : 100, // More padding at bottom to prevent overflow
              }}
              showsVerticalScrollIndicator={true}
              style={{ 
                flex: 1,
                backgroundColor: isDark ? theme === 'minimal' ? '$gray1' : '$gray1' : theme === 'minimal' ? 'white' : 'white',
              }}
              bounces={true}
              alwaysBounceVertical={false}
              onContentSizeChange={handleContentSizeChange}
              scrollEventThrottle={16}
              overScrollMode="always"
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 100,
              }}
            >
              {messages.length === 0 ? (
                renderWelcomeScreen()
              ) : (
                <YStack gap="$4" paddingBottom="$4">
                  {/* Date separator - could enhance with actual message dates */}
                  <XStack alignItems="center" justifyContent="center" paddingVertical="$2">
                    <Text 
                      fontSize="$1" 
                      color="$gray10" 
                      backgroundColor={isDark ? '$gray3' : '$gray3'}
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius="$10"
                    >
                      {new Date().toLocaleDateString()}
                    </Text>
                  </XStack>
                  
                  {/* Message list with animations */}
                  {messages.map((message, index) => renderMessage(message, index))}
                  
                  {/* Typing indicator */}
                  {renderTypingIndicator()}
                  
                  {/* Error message */}
                  {renderError()}
                </YStack>
              )}
            </Sheet.ScrollView>

            {/* Input Container - Fixed at bottom */}
            <YStack
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              backgroundColor={isDark ? '$gray2' : 'white'}
              borderTopWidth={1}
              borderTopColor={isDark ? '$gray8' : '$gray3'}
              shadowColor="$shadowColor"
              shadowOffset={{ width: 0, height: -3 }}
              shadowOpacity={0.1}
              shadowRadius={5}
              zIndex={5}
            >
              {renderInputArea()}
            </YStack>
          </MotiView>
        )}
        
        {/* Reset Confirmation Dialog */}
        {renderResetConfirmation()}
      </YStack>

      {/* Collapsed Button - Only shown when not in modal/sheet and not expanded */}
      {!isModal && !sheetMode && !expanded && (
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          exit={{ opacity: 0, scale: 0.9, translateY: 20 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <YStack
            position="absolute"
            bottom={insets.bottom + 16}
            right={16}
            shadowColor="$shadowColor"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.15}
            shadowRadius={8}
          >
            <Button
              size="$4"
              theme="blue"
              backgroundColor={themeColors.primaryColor}
              onPress={toggleExpanded}
              borderRadius="$9"
              paddingHorizontal="$4"
              height={50}
              justifyContent="center"
              alignItems="center"
              pressStyle={{ scale: 0.97 }}
            >
              <XStack gap="$2" alignItems="center">
                <Circle size={32} backgroundColor="rgba(255,255,255,0.2)">
                  <MessageCircle color="white" size={16} />
                </Circle>
                <Text color="white" fontWeight="600" fontSize="$4">
                  {t('Ask AI Copilot')}
                </Text>
              </XStack>
            </Button>
          </YStack>
        </MotiView>
      )}
    </YStack>
  );

  // When used as a modal, return just the content
  if (isModal) {
    return (
      <YStack flex={1} backgroundColor={isDark ? '$gray1' : 'white'}>
        {contentView}
      </YStack>
    );
  }
  
  // When used as a sheet, use the Sheet component
  if (sheetMode) {
    return (
      <Sheet
        modal
        dismissOnSnapToBottom
        forceRemoveScrollEnabled={Platform.OS === 'ios'}
        snapPointsMode="percent"
        snapPoints={[85]}
        disableDrag={false}
        animation="medium"
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor="rgba(0,0,0,0.5)"
        />
        <Sheet.Frame 
          padding={0}
          backgroundColor={isDark ? '$gray2' : 'white'} 
          borderTopLeftRadius={20}
          borderTopRightRadius={20}
          overflow="hidden"
        >
          <Sheet.Handle 
            height={30} 
            alignSelf="center" 
            width={50}
            opacity={0.7}
            backgroundColor={isDark ? '$gray7' : '$gray5'}
            marginTop="$1"
          />
          <YStack flex={1}>
            {contentView}
          </YStack>
        </Sheet.Frame>
      </Sheet>
    );
  }

  // When used standalone, wrap in the floating container with enhanced visuals
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 18, stiffness: 150 }}
      style={{
        position: 'absolute',
        bottom: insets.bottom + (expanded ? 0 : 70),
        right: 0,
        left: 0,
        zIndex: 100,
        maxHeight: expanded ? '85%' : 'auto',
      }}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={50}
      >
        <BlurView 
          intensity={isDark ? 40 : 70} 
          tint={isDark ? 'dark' : 'light'}
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            margin: 16,
            borderWidth: 1,
            borderColor: isDark 
              ? theme === 'futuristic' 
                ? (tamaguiTheme.blue8?.val ?? '#0060ff') 
                : (tamaguiTheme.gray7?.val ?? '#333') 
              : theme === 'futuristic' 
                ? (tamaguiTheme.blue5?.val ?? '#60a5fa') 
                : (tamaguiTheme.gray4?.val ?? '#eee'),
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 16,
            elevation: 10,
            maxHeight: Dimensions.get('window').height * 0.8, // Limit height to 80% of screen
          }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            {contentView}
          </TouchableWithoutFeedback>
        </BlurView>
      </KeyboardAvoidingView>
    </MotiView>
  );
}

