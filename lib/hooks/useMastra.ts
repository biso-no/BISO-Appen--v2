import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mastraApi, Message, AgentMetadata, AGENT_METADATA } from '../mastra-api';
import { AgentType, agentTypeToId } from '../stores/copilotStore';

// Query keys for React Query
const QUERY_KEYS = {
  agents: 'agents',
  agent: (agentId: string) => ['agent', agentId],
  agentMetadata: 'agentMetadata',
};

/**
 * Hook to fetch all available Mastra agents
 */
export function useAgents() {
  return useQuery({
    queryKey: [QUERY_KEYS.agents],
    queryFn: () => mastraApi.getAgents(),
  });
}

/**
 * Hook to fetch a specific Mastra agent by ID
 */
export function useAgent(agentId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.agent(agentId),
    queryFn: () => mastraApi.getAgent(agentId),
    enabled: !!agentId,
  });
}

/**
 * Hook to fetch metadata for all agents to show in the UI
 */
export function useAgentMetadata() {
  return useQuery({
    queryKey: [QUERY_KEYS.agentMetadata],
    queryFn: () => {
      // This data is static and comes from the AGENT_METADATA constant
      // We transform it to an array for easier consumption in UI components
      // Only return the universal workflow agent now
      return [AGENT_METADATA['universalAgent']];
    },
    // This data doesn't change, so we can cache it indefinitely
    staleTime: Infinity,
  });
}

/**
 * Hook to get agent-specific suggestions 
 * Now returns universal suggestions for all agent types
 */
export function useAgentSuggestions(agentType: AgentType) {
  // Universal suggestions for all agent types
  return [
    'How can you help me?',
    'Tell me about the university',
    'Find available job openings',
    'Tell me about the Computer Science department',
    'Where can I find the student handbook?'
  ];
}

/**
 * Hook to send a message to a Mastra agent and get a response
 * Always uses the universalAgent agent
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      agentId,
      messages,
      threadId,
    }: {
      agentId: string;
      messages: Message[];
      threadId?: string;
    }) => {
      // Always use the universalAgent agent
      const universalAgentId = 'universalAgent';
      console.log('Sending message to universal agent from useSendMessage hook');
      return mastraApi.generateResponse(universalAgentId, messages, threadId);
    },
    // Optional: invalidate any cache that depends on the conversation
    onSuccess: (data) => {
      // Log the successful response
      console.log('Successfully received response in useSendMessage hook:', data);
      // If you store conversation data in React Query, invalidate it here
    },
    onError: (error) => {
      // Log any errors
      console.error('Error in useSendMessage hook:', error);
    }
  });
}

/**
 * Hook to generate a system message context
 * Now returns a single system message for all agent types
 */
export function useAgentSystemMessage(agentType: AgentType): string {
  // Universal system message for all agent types
  return "You are a helpful AI assistant for our university. You can search website content, find documents, match jobs, and provide department information. You'll understand the user's intent and provide relevant information.";
} 