import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Message, mastraApi } from '../mastra-api';

// Agent ID that will be used by the copilot
const DEFAULT_AGENT_ID = process.env.EXPO_PUBLIC_MASTRA_DEFAULT_AGENT_ID || 'universalAgent';

// We're now using a single agent type, but keeping the enum for backward compatibility
export enum AgentType {
  // Define a single UNIVERSAL type that will be used for everything
  UNIVERSAL = 'universalAgent',
  // The following types are kept for backward compatibility but
  // should be considered deprecated
  MAIN = 'main',
  CONTENT_SEARCH = 'content',
  DOCUMENT_SEARCH = 'document',
  JOB_MATCHING = 'job',
  DEPARTMENT_INFO = 'department',
}

// A mapping to ensure all old agent types map to the universal workflow
export const agentTypeToId: Record<AgentType, string> = {
  [AgentType.UNIVERSAL]: 'universalAgent',
  [AgentType.MAIN]: 'universalAgent',
  [AgentType.CONTENT_SEARCH]: 'universalAgent',
  [AgentType.DOCUMENT_SEARCH]: 'universalAgent',
  [AgentType.JOB_MATCHING]: 'universalAgent',
  [AgentType.DEPARTMENT_INFO]: 'universalAgent',
};

export interface CopilotState {
  // UI state
  isExpanded: boolean;
  isMinimized: boolean;
  isListening: boolean;
  isLoading: boolean;
  currentAnimation: 'idle' | 'thinking' | 'speaking' | 'listening' | 'waving';
  
  // Conversation state
  messages: Message[];
  currentInput: string;
  threadId?: string;
  agentId: string;
  currentAgentType: AgentType;
  
  // Suggestions shown to the user
  suggestions: string[];
  
  // Actions
  expandCopilot: () => void;
  minimizeCopilot: () => void;
  toggleMinimized: () => void;
  
  // Input handling
  setCurrentInput: (input: string) => void;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  
  // Animation control
  setAnimation: (animation: CopilotState['currentAnimation']) => void;
  
  // Suggestions
  setSuggestions: (suggestions: string[]) => void;
  
  // Agent management - simplified since we only have one agent now
  setAgentType: (agentType: AgentType) => void;
}

export const useCopilotStore = create<CopilotState>()(
  immer((set, get) => ({
    // Initial UI state
    isExpanded: false,
    isMinimized: false,
    isListening: false,
    isLoading: false,
    currentAnimation: 'idle',
    
    // Initial conversation state
    messages: [],
    currentInput: '',
    agentId: DEFAULT_AGENT_ID,
    currentAgentType: AgentType.UNIVERSAL,
    
    // Initial suggestions
    suggestions: [
      'What departments are at the university?',
      'Can you help me find events this week?',
      'Tell me about the BISO organization',
    ],
    
    // UI Actions
    expandCopilot: () => set({ isExpanded: true, isMinimized: false }),
    minimizeCopilot: () => set({ isExpanded: false }),
    toggleMinimized: () => set((state) => ({ isMinimized: !state.isMinimized })),
    
    // Input handling
    setCurrentInput: (input) => set({ currentInput: input }),
    
    // Agent management - simplified since we're using a single agent
    setAgentType: (agentType) => {
      set((state) => {
        state.currentAgentType = agentType;
        // Always use the universal agent ID regardless of the AgentType enum
        state.agentId = DEFAULT_AGENT_ID;
      });
    },
    
    sendMessage: async (message) => {
      const state = get();
      // Only proceed if there's a message to send
      if (!message.trim()) return;
      
      // Always use the universalAgent agent
      const universalAgentId = 'universalAgent';
      
      // No need to detect agent type since we're using a universal agent
      // Get the system message
      const systemMessage: Message = { 
        role: 'system', 
        content: "You are a helpful AI assistant for our university. You can search website content, find documents, match jobs, and provide department information. You'll understand the user's intent and provide relevant information."
      };
      
      // Create a new message array to ensure we're not referencing a potentially empty array
      // Add user message to the conversation
      const newUserMessage: Message = { role: 'user', content: message };
      
      // Create messages for the API call
      // We always include the system message at the beginning,
      // followed by the conversation history, and finally the new user message
      let currentMessages = [...state.messages];
      
      // Create the final array of messages to send to the API
      // Always start with a system message
      let apiMessages: Message[] = [];
      
      // If we already have messages in the conversation
      if (currentMessages.length > 0) {
        // Check if first message is a system message
        const hasSystemMessage = currentMessages[0].role === 'system';
        
        if (hasSystemMessage) {
          // If we already have a system message, use the existing conversation + new message
          apiMessages = [...currentMessages, newUserMessage];
        } else {
          // If no system message at the start, add one
          apiMessages = [systemMessage, ...currentMessages, newUserMessage];
        }
      } else {
        // This is a new conversation, so just include system and user message
        apiMessages = [systemMessage, newUserMessage];
      }
      
      // Log the messages being sent to the API for debugging
      console.log('Sending messages to API:', JSON.stringify(apiMessages));
      
      // Update UI state to show user message
      set((state) => {
        state.messages.push(newUserMessage);
        state.currentInput = '';
        state.isLoading = true;
        state.currentAnimation = 'thinking';
      });
      
      try {
        // Send to Mastra API and get response
        const response = await mastraApi.generateResponse(
          universalAgentId, // Always use the universalAgent agent directly
          apiMessages,
          state.threadId
        );
        
        // Log the response for debugging
        console.log('Mastra API response:', JSON.stringify(response));
        
        // Add assistant response to the conversation - ensure content exists
        if (!response.content) {
          console.error('Received empty content in response:', response);
          throw new Error('Received empty response content');
        }
        
        set((state) => {
          state.messages.push({ role: 'assistant', content: response.content });
          state.isLoading = false;
          state.currentAnimation = 'idle';
          
          // Store the threadId if it was returned
          if (response.threadId) {
            state.threadId = response.threadId;
          }
        });
      } catch (error) {
        console.error('Error sending message:', error);
        set((state) => {
          state.messages.push({
            role: 'assistant',
            content: 'Sorry, I encountered an error while processing your request.',
          });
          state.isLoading = false;
          state.currentAnimation = 'idle';
        });
      }
    },
    
    clearMessages: () => set({ 
      messages: [], 
      threadId: undefined,
      currentAgentType: AgentType.UNIVERSAL,
      agentId: DEFAULT_AGENT_ID
    }),
    
    // Animation control
    setAnimation: (animation) => set({ currentAnimation: animation }),
    
    // Suggestions
    setSuggestions: (suggestions) => set({ suggestions }),
  }))
); 