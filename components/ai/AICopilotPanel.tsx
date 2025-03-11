import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCopilotStore } from '../../lib/stores/copilotStore';
import { Message } from '../../lib/mastra-api';
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
} from '@tamagui/lucide-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'react-native';
import { MotiView, MotiText, AnimatePresence as MotiAnimatePresence } from 'moti';
import { Easing } from 'react-native-reanimated';
import Markdown from 'react-native-markdown-display';

interface AICopilotPanelProps {}

export function AICopilotPanel({}: AICopilotPanelProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useTheme();
  const inputRef = useRef<RNTextInput>(null);
  const flatListRef = useRef<FlatList>(null);
  const windowDimensions = Dimensions.get('window');

  
  
  const {
    isExpanded,
    isMinimized,
    currentInput,
    setCurrentInput,
    sendMessage,
    messages,
    clearMessages,
    isLoading,
    isListening,
    minimizeCopilot,
    toggleMinimized,
    suggestions,
  } = useCopilotStore();
  
  // State for showing/hiding suggestions and pulse animation
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isSendButtonPulsing, setIsSendButtonPulsing] = useState(false);
  const [messageBubbleState, setMessageBubbleState] = useState({
    opacity: 0,
    scale: 0.9,
    translateY: 10,
  });
  
  // Start send button pulsing animation when input is not empty
  useEffect(() => {
    if (currentInput.trim() !== '') {
      setIsSendButtonPulsing(true);
    } else {
      setIsSendButtonPulsing(false);
    }
  }, [currentInput]);
  
  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      setMessageBubbleState({
        opacity: 1,
        scale: 1,
        translateY: 0,
      });
    }
  }, [messages.length]);
  
  // Hide suggestions when there are messages
  useEffect(() => {
    if (messages.length > 0 && showSuggestions) {
      setTimeout(() => setShowSuggestions(false), 200);
    } else if (messages.length === 0) {
      setShowSuggestions(true);
    }
  }, [messages.length, showSuggestions]);
  
  // Safe access to theme colors
  const primaryColor = theme.blue9?.val || '#3366FF';
  const accentColor = theme.blue5?.val || '#D1E0FF';
  const textColor = isDark ? 'white' : theme.gray12?.val || '#333333';
  const textMutedColor = theme.gray10?.val || '#888888';
  
  // Improved background gradient colors
  const darkGradient: [string, string] = ['#1A1B25', '#2A2C3E'];
  const lightGradient: [string, string] = ['#F5F7FF', '#E8EDFF'];
  
  // Message bubble colors
  const userBubbleGradient: [string, string] = ['#3366FF', '#5E83FC'];
  const aiBubbleGradient: [string, string] = isDark 
    ? ['#2A2D3E', '#3D4055'] 
    : ['#E8EDFF', '#D1E0FF'];

  // Determine panel dimensions based on screen size
  const panelWidth = Math.min(windowDimensions.width * 0.9, 480);
  const panelHeight = Math.min(windowDimensions.height * 0.7, 700);
  const minimizedHeight = 80;

  // Setup markdown styling
  const markdownStyles = {
    body: {
      color: isDark ? 'white' : theme.gray12?.val || '#333333',
      fontSize: 16,
      lineHeight: 24,
    },
    paragraph: {
      marginVertical: 8,
    },
    heading1: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      marginVertical: 12,
      color: isDark ? 'white' : theme.gray12?.val || '#333333',
    },
    heading2: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      marginVertical: 10,
      color: isDark ? 'white' : theme.gray12?.val || '#333333',
    },
    heading3: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      marginVertical: 8,
      color: isDark ? 'white' : theme.gray12?.val || '#333333',
    },
    link: {
      color: primaryColor,
      textDecorationLine: 'underline' as const,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
      paddingLeft: 12,
      marginLeft: 8,
      fontStyle: 'italic' as const,
      color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
    },
    code_block: {
      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
      padding: 10,
      borderRadius: 4,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
    },
    code_inline: {
      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
      padding: 4,
      borderRadius: 4,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
    },
    bullet_list: {
      marginVertical: 8,
    },
    ordered_list: {
      marginVertical: 8,
    },
    list_item: {
      flexDirection: 'row' as const,
      marginVertical: 4,
    },
    hr: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
      height: 1,
      marginVertical: 16,
    },
    image: {
      borderRadius: 8,
      marginVertical: 8,
    },
    table: {
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
      borderRadius: 4,
      marginVertical: 8,
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      flexDirection: 'row' as const,
    },
    th: {
      padding: 8,
      fontWeight: 'bold' as const,
    },
    td: {
      padding: 8,
    },
  };
  
  // Helper function to detect if content is Markdown
  const containsMarkdown = (text: string): boolean => {
    // Check for common markdown patterns
    const markdownPatterns = [
      /^#+\s+/m,              // Headers
      /\*{1,2}[^*]+\*{1,2}/,  // Bold/Italic
      /\[.*?\]\(.*?\)/,       // Links
      /```[\s\S]*?```/,       // Code blocks
      /^\s*[-*+]\s+/m,        // Unordered lists
      /^\s*\d+\.\s+/m,        // Ordered lists
      /^\s*>\s+/m,            // Blockquotes
      /!\[.*?\]\(.*?\)/,      // Images
      /\|.*\|.*\|/,           // Tables
      /^-{3,}$/m,             // Horizontal rules
      /`[^`]+`/,              // Inline code
    ];

    return markdownPatterns.some(pattern => pattern.test(text));
  };
  
  // Render message item with enhanced styling and animation
  const renderMessageItem = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.role === 'user';
    const isLast = index === messages.length - 1;
    const isAiThinking = isLoading && isLast && !isUser;
    const hasMarkdown = !isUser && item.content && containsMarkdown(item.content);
    
    return (
      <MotiView
        from={{
          opacity: 0,
          scale: 0.9,
          translateY: 10,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          translateY: 0,
        }}
        transition={{
          type: 'timing',
          duration: 300,
          delay: index * 50,
          easing: Easing.out(Easing.ease),
        }}
        style={[
          styles.messageBubbleContainer,
          { justifyContent: isUser ? 'flex-end' : 'flex-start' }
        ]}
      >
        {!isUser && (
          <Avatar circular size="$3" scale={1.1} elevate bordered borderColor={accentColor}>
            <LinearGradient
              colors={userBubbleGradient}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Bot color="white" size={16} />
          </Avatar>
        )}
        
        <YStack 
          maxWidth={isUser ? "80%" : "85%"}
          padding="$3"
          paddingVertical="$3.5"
          borderRadius="$4"
          borderBottomRightRadius={isUser ? '$1' : '$4'}
          borderBottomLeftRadius={!isUser ? '$1' : '$4'}
          overflow="hidden"
          elevation={2}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
        >
          <LinearGradient
            colors={isUser ? userBubbleGradient : aiBubbleGradient}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {isAiThinking && (
            <MotiView
              from={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{
                loop: true,
                repeatReverse: true,
                duration: 800,
              }}
              style={StyleSheet.absoluteFill}
            >
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent'] as [string, string, string]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            </MotiView>
          )}
          
          {item.content ? (
            hasMarkdown ? (
              <View style={{ padding: 4 }}>
                <Markdown 
                  style={markdownStyles}
                >
                  {item.content}
                </Markdown>
              </View>
            ) : (
              <Paragraph 
                color={isUser ? 'white' : textColor} 
                fontWeight={isUser ? '500' : '400'}
                selectable
                letterSpacing={0.2}
                lineHeight={22}
              >
                {item.content}
              </Paragraph>
            )
          ) : (
            <Text color="$red9">No content available</Text>
          )}
        </YStack>
        
        {isUser && (
          <Avatar circular size="$3" scale={1.1} elevation={2} backgroundColor="$gray5">
            <LinearGradient
              colors={['#8B8FA3', '#6D7185'] as [string, string]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <MessageCircle color="white" size={14} />
          </Avatar>
        )}
      </MotiView>
    );
  };
  
  // Render suggestion item with enhanced styling
  const renderSuggestionItem = (suggestion: string, index: number) => (
    <Pressable 
      onPress={() => handleSuggestionClick(suggestion)}
      style={({ pressed }) => [
        styles.suggestionItem,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }
      ]}
      key={index}
    >
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 100 + index * 100, type: 'timing', duration: 400 }}
        style={StyleSheet.absoluteFill}
      >
        <View style={[StyleSheet.absoluteFill, { borderRadius: 16, overflow: 'hidden' }]}>
          <LinearGradient
            colors={isDark 
              ? ['rgba(50, 52, 75, 0.9)', 'rgba(60, 63, 90, 0.9)'] as [string, string]
              : ['rgba(232, 237, 255, 0.9)', 'rgba(209, 224, 255, 0.9)'] as [string, string]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
      </MotiView>
      
      <XStack alignItems="center" justifyContent="space-between" flex={1} gap="$2">
        <Lightbulb size={16} color={primaryColor} />
        <Text color={textColor} flex={1} paddingRight="$3" fontWeight="500">
          {suggestion}
        </Text>
        <MotiView
          from={{ translateX: 0 }}
          animate={{ translateX: 0 }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <ChevronRight size={16} color={primaryColor} />
        </MotiView>
      </XStack>
    </Pressable>
  );
  
  // Handle sending message
  const handleSendMessage = () => {
    if (currentInput.trim()) {
      sendMessage(currentInput);
      inputRef.current?.blur();
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setCurrentInput(suggestion);
    setTimeout(() => {
      sendMessage(suggestion);
    }, 300);
  };
  
  // If not expanded, don't render
  if (!isExpanded) return null;
  
  return (
    <AnimatePresence>
      {isExpanded && (
        <MotiView
          from={{ 
            opacity: 0,
            translateY: 50,
            height: 0,
            scale: 0.95,
          }}
          animate={{ 
            opacity: 1,
            translateY: 0,
            height: isMinimized ? minimizedHeight : panelHeight,
            scale: 1,
          }}
          exit={{ 
            opacity: 0,
            translateY: 50,
            height: 0,
            scale: 0.95,
          }}
          transition={{
            type: 'timing',
            duration: 350,
            easing: Easing.out(Easing.ease),
          }}
          style={[styles.container, {
            position: 'absolute',
            width: panelWidth,
            left: (windowDimensions.width - panelWidth) / 2, // Center horizontally
            top: (windowDimensions.height - panelHeight) / 2 - 50, // Center vertically with slight offset
            maxHeight: windowDimensions.height * 0.8, // Cap maximum height
            borderRadius: 24,
            overflow: 'hidden',
            zIndex: 1000,
          }]}
        >
          {/* Main background with reduced transparency */}
          <LinearGradient
            colors={isDark ? darkGradient : lightGradient}
            style={[StyleSheet.absoluteFill, { opacity: 0.95 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {/* Programmatic subtle pattern background instead of image */}
          <View style={StyleSheet.absoluteFill}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View 
                key={`pattern-dot-${i}`}
                style={{
                  position: 'absolute',
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  top: Math.random() * panelHeight,
                  left: Math.random() * panelWidth,
                }}
              />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <View 
                key={`pattern-line-${i}`}
                style={{
                  position: 'absolute',
                  width: 30 + Math.random() * 60,
                  height: 1,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  top: Math.random() * panelHeight,
                  left: Math.random() * panelWidth,
                  transform: [{ rotate: `${Math.random() * 180}deg` }],
                }}
              />
            ))}
          </View>
          
          {/* Subtle blur overlay */}
          <BlurView
            intensity={isDark ? 15 : 10}
            tint={isDark ? 'dark' : 'light'}
            style={[StyleSheet.absoluteFill, { opacity: 0.7 }]}
          />
          
          {/* Animated accent line at the top */}
          <MotiView
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              backgroundColor: primaryColor,
              zIndex: 10,
            }}
            from={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ type: 'timing', duration: 600 }}
          />
          
          {/* Minimized View */}
          {isMinimized ? (
            <XStack 
              padding="$3" 
              justifyContent="space-between" 
              alignItems="center"
            >
              <XStack gap="$2" alignItems="center">
                <MotiView
                  from={{ rotate: '0deg' }}
                  animate={{ rotate: '360deg' }}
                  transition={{
                    loop: true,
                    repeatReverse: false,
                    duration: 10000,
                    easing: Easing.linear,
                  }}
                >
                  <Avatar circular size="$3" elevation={3}>
                    <LinearGradient
                      colors={['#3366FF', '#5E83FC'] as [string, string]}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    <Zap color="white" size={16} />
                  </Avatar>
                </MotiView>
                <YStack>
                  <Text fontWeight="700" fontSize="$4" color={textColor}>BISO Copilot</Text>
                  <Text fontSize="$2" color={textMutedColor}>Ready to assist</Text>
                </YStack>
              </XStack>
              
              <XStack gap="$2">
                <Button
                  size="$3"
                  circular
                  opacity={0.9}
                  hoverStyle={{ opacity: 1 }}
                  pressStyle={{ scale: 0.95 }}
                  onPress={toggleMinimized}
                  icon={<Maximize2 size={18} color={textColor} />}
                  backgroundColor={isDark ? '$gray3' : 'white'}
                  borderColor={isDark ? '$gray5' : '$gray3'}
                  borderWidth={1}
                  elevation={2}
                />
              </XStack>
            </XStack>
          ) : (
            <>
              {/* Header */}
              <XStack 
                height={66} 
                paddingHorizontal="$4"
                paddingVertical="$3" 
                justifyContent="space-between" 
                alignItems="center"
                borderBottomWidth={1}
                borderBottomColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
              >
                <XStack gap="$3" alignItems="center">
                  <MotiView
                    from={{ rotate: '0deg' }}
                    animate={{ rotate: '360deg' }}
                    transition={{
                      loop: true,
                      repeatReverse: false,
                      duration: 15000,
                      easing: Easing.linear,
                    }}
                  >
                    <Avatar circular size="$4" elevation={5}>
                      <LinearGradient
                        colors={['#3366FF', '#5E83FC'] as [string, string]}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                      <Bot color="white" size={20} />
                    </Avatar>
                  </MotiView>
                  <YStack>
                    <Text fontWeight="700" fontSize="$5" color={textColor}>BISO Copilot</Text>
                    <XStack alignItems="center" gap="$1">
                      <MotiView
                        from={{ opacity: 0.5, scale: 1 }}
                        animate={{ opacity: 1, scale: isLoading ? 1.1 : 1 }}
                        transition={{
                          loop: isLoading,
                          duration: 1000,
                          repeatReverse: true,
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: isLoading ? '#FF9D00' : isListening ? '#FF3B30' : '#34C759',
                          }}
                        />
                      </MotiView>
                      <Text fontSize="$2" color={textMutedColor} fontWeight="500">
                        {isLoading ? 'Thinking...' : isListening ? 'Listening...' : 'Ready to help'}
                      </Text>
                    </XStack>
                  </YStack>
                </XStack>
                
                <XStack gap="$2">
                  <Button
                    size="$3"
                    circular
                    backgroundColor={isDark ? 'rgba(60, 63, 90, 0.8)' : 'rgba(232, 237, 255, 0.9)'}
                    hoverStyle={{ opacity: 0.9 }}
                    pressStyle={{ scale: 0.95 }}
                    onPress={toggleMinimized}
                    icon={<Minimize2 size={18} color={textColor} />}
                    borderColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                    borderWidth={1}
                    elevation={1}
                  />
                  
                  <Button
                    size="$3"
                    circular
                    backgroundColor={isDark ? 'rgba(60, 63, 90, 0.8)' : 'rgba(232, 237, 255, 0.9)'}
                    hoverStyle={{ opacity: 0.9 }}
                    pressStyle={{ scale: 0.95 }}
                    onPress={minimizeCopilot}
                    icon={<X size={18} color={textColor} />}
                    borderColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                    borderWidth={1}
                    elevation={1}
                  />
                </XStack>
              </XStack>
              
              {/* Messages */}
              <KeyboardAvoidingView
                style={[styles.messagesContainer, { flex: 1 }]}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={20}
              >
                {messages.length === 0 ? (
                  <YStack 
                    flex={1} 
                    justifyContent="center" 
                    alignItems="center" 
                    padding="$6"
                    paddingTop="$4"  // Reduced padding to avoid overlap
                  >
                    <MotiView
                      from={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'timing', duration: 600 }}
                    >
                      <Avatar circular size="$6" elevation={10}> {/* Reduced size from $7 to $6 */}
                        <LinearGradient
                          colors={['#3366FF', '#5E83FC'] as [string, string]}
                          style={StyleSheet.absoluteFill}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                        <MotiView
                          from={{ transform: [{ rotate: '0deg' }] }}
                          animate={{ transform: [{ rotate: '20deg' }] }}
                          transition={{
                            loop: true,
                            repeatReverse: true,
                            duration: 2000,
                            delay: 1000,
                          }}
                        >
                          <Text>
                            <Sparkles size={40} color="white" />
                          </Text>
                        </MotiView>
                      </Avatar>
                    </MotiView>
                    <MotiText
                      from={{ opacity: 0, translateY: 20 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ delay: 300, type: 'timing', duration: 600 }}
                      style={{ 
                        fontWeight: '700', 
                        fontSize: 20, // Reduced from 24
                        marginTop: 16, // Reduced from 24
                        color: textColor,
                      }}
                    >
                      How can I help you today?
                    </MotiText>
                    <MotiView
                      from={{ opacity: 0, translateY: 20 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ delay: 600, type: 'timing', duration: 600 }}
                    >
                      <Paragraph 
                        textAlign="center" 
                        marginTop="$2" // Reduced from $3
                        marginBottom="$3" // Added bottom margin
                        color={textMutedColor}
                        maxWidth={280} // Reduced from 300
                        fontSize="$2" // Reduced from $3
                        lineHeight={18} // Reduced from 22
                      >
                        Ask me anything about departments, events, or how to navigate BISO.
                      </Paragraph>
                    </MotiView>
                  </YStack>
                ) : (
                  <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessageItem}
                    keyExtractor={(_, index) => `message-${index}`}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={true}
                    scrollEnabled={true}
                    bounces={true}
                    style={{ flexGrow: 1, height: '100%' }} // Ensure the FlatList takes available space
                  />
                )}
                
                {/* Suggestions */}
                <AnimatePresence>
                  {showSuggestions && (
                    <MotiView
                      from={{ 
                        height: 0,
                        opacity: 0 
                      }}
                      animate={{ 
                        height: 'auto', // Changed from fixed 180px to auto
                        opacity: 1 
                      }}
                      exit={{ 
                        height: 0,
                        opacity: 0 
                      }}
                      transition={{ type: 'timing', duration: 400 }}
                      style={[styles.suggestionsContainer, { maxHeight: 200 }]} // Added maxHeight with scrollview
                    >
                      <ScrollView 
                        showsVerticalScrollIndicator={true} 
                        bounces={true}
                        style={{ maxHeight: 200 }}
                        contentContainerStyle={{ paddingVertical: 4 }}
                      >
                        <YStack gap="$3">
                          {suggestions.map(renderSuggestionItem)}
                        </YStack>
                      </ScrollView>
                    </MotiView>
                  )}
                </AnimatePresence>
                
                {/* Loading indicator */}
                {isLoading && (
                  <XStack 
                    padding="$3" 
                    justifyContent="center" 
                    alignItems="center"
                  >
                    <MotiView
                      from={{ opacity: 0.7, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        loop: true,
                        duration: 1000,
                        repeatReverse: true,
                      }}
                    >
                      <Spinner size="small" color={primaryColor} />
                    </MotiView>
                    <Text marginLeft="$2" color={textColor} fontWeight="500">
                      Thinking...
                    </Text>
                  </XStack>
                )}
                
                {/* Input area */}
                <XStack
                  padding="$4"
                  alignItems="center"
                  gap="$3"
                  borderTopWidth={1}
                  borderTopColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                  backgroundColor={isDark ? 'rgba(36, 37, 53, 0.95)' : 'rgba(245, 247, 255, 0.95)'}
                >
                  {messages.length > 0 && (
                    <Button
                      size="$3"
                      circular
                      backgroundColor={isDark ? 'rgba(60, 63, 90, 0.8)' : 'rgba(232, 237, 255, 0.9)'}
                      hoverStyle={{ opacity: 0.9 }}
                      pressStyle={{ scale: 0.95 }}
                      onPress={clearMessages}
                      icon={<RefreshCcw size={18} color={textColor} />}
                      borderColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                      borderWidth={1}
                      elevation={1}
                    />
                  )}
                  
                  {/* Custom styled TextInput with container */}
                  <View style={styles.inputContainer}>
                    <RNTextInput
                      ref={inputRef}
                      style={[
                        styles.input,
                        {
                          color: textColor,
                          backgroundColor: 'transparent',
                        }
                      ]}
                      value={currentInput}
                      onChangeText={setCurrentInput}
                      placeholder="Ask me anything..."
                      placeholderTextColor={isDark ? '#8B8FA3' : '#9DA3C5'}
                      autoCapitalize="none"
                      onSubmitEditing={handleSendMessage}
                      returnKeyType="send"
                    />
                    <View style={[StyleSheet.absoluteFill, { borderRadius: 16, overflow: 'hidden' }]}>
                      <LinearGradient
                        colors={isDark 
                          ? ['rgba(50, 52, 75, 0.9)', 'rgba(60, 63, 90, 0.9)'] as [string, string]
                          : ['rgba(255, 255, 255, 0.95)', 'rgba(240, 242, 255, 0.95)'] as [string, string]}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                    </View>
                  </View>
                  
                  {/* Enhanced send button with pulse animation */}
                  <Button
                    size="$3"
                    circular
                    pressStyle={{ scale: 0.92 }}
                    onPress={isListening ? handleSendMessage : handleSendMessage}
                    disabled={currentInput.trim() === ''}
                    opacity={currentInput.trim() === '' ? 0.6 : 1}
                    elevation={5}
                    style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}
                  >
                    <MotiView
                      style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}
                      from={{ 
                        scale: isSendButtonPulsing ? 0.9 : 1, 
                      }}
                      animate={{ 
                        scale: isSendButtonPulsing ? 1.1 : 1, 
                      }}
                      transition={{
                        loop: isSendButtonPulsing,
                        repeatReverse: true,
                        duration: 1200,
                      }}
                    >
                      <View style={[StyleSheet.absoluteFill, { borderRadius: 999, overflow: 'hidden' }]}>
                        <LinearGradient
                          colors={['#3366FF', '#5E83FC'] as [string, string]}
                          style={StyleSheet.absoluteFill}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                      </View>
                    </MotiView>
                    
                    <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2 }}>
                      {isListening ? (
                        <X size={18} color="white" />
                      ) : (
                        <Send size={18} color="white" />
                      )}
                    </View>
                  </Button>
                </XStack>
              </KeyboardAvoidingView>
            </>
          )}
        </MotiView>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 20,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  messagesContainer: {
    flex: 1,
    position: 'relative',
    flexGrow: 1,
    height: '100%',  // Ensure container takes full height
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    flexGrow: 1,
  },
  messageBubbleContainer: {
    width: '100%',
    marginVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  suggestionsContainer: {
    padding: 12,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    marginTop: 8,  // Add spacing between intro text and suggestions
  },
  suggestionItem: {
    padding: 14,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputContainer: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    height: '100%',
    width: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    zIndex: 2,
  },
});