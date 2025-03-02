import axios from 'axios';

// Define the base URL for your Mastra API
const MASTRA_API_BASE_URL = process.env.EXPO_PUBLIC_MASTRA_API_URL || 'http://192.168.1.229:4111';

// Agent metadata information for UI display and routing
export interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  icon?: string; // Icon to display in UI
}

// Map of agent IDs to their metadata
export const AGENT_METADATA: Record<string, AgentMetadata> = {
  'universalAgent': {
    id: 'universalAgent',
    name: 'University Assistant',
    description: 'A universal assistant that can help with all your university-related questions',
    capabilities: [
      'Search website content', 
      'Find documents', 
      'Match job opportunities', 
      'Provide department information'
    ],
    icon: 'robot',
  },
  // Keeping the old agents for reference, but they won't be used anymore
  'contentSearchAgent': {
    id: 'contentSearchAgent',
    name: 'Content Search',
    description: 'Search content on our WordPress website',
    capabilities: ['Search blogs', 'Find articles', 'Discover web content'],
    icon: 'search-web',
  },
  'documentSearchAgent': {
    id: 'documentSearchAgent',
    name: 'Document Search',
    description: 'Find information in our document library',
    capabilities: ['Search documents', 'Find publications', 'Access reports'],
    icon: 'file-document-outline',
  },
  'jobMatchingAgent': {
    id: 'jobMatchingAgent',
    name: 'Job Matching',
    description: 'Find available jobs on our website',
    capabilities: ['Search jobs', 'Match careers', 'Explore opportunities'],
    icon: 'briefcase-outline',
  },
  'departmentInfoAgent': {
    id: 'departmentInfoAgent',
    name: 'Department Info',
    description: 'Find departments to join',
    capabilities: ['Explore departments', 'Find faculty', 'Discover programs'],
    icon: 'domain',
  }
};

// Define message types
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Define response types
export interface MastraGenerateResponse {
  content: string;
  threadId?: string;
  runId?: string;
}

// Main API client class
class MastraApiClient {
  private readonly baseUrl: string;
  private readonly axios;

  constructor(baseUrl: string = MASTRA_API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.axios = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Get all available agents
  async getAgents() {
    try {
      const response = await this.axios.get('/api/agents');
      return response.data;
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  }

  // Get a specific agent by ID
  async getAgent(agentId: string) {
    try {
      const response = await this.axios.get(`/api/agents/${agentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching agent ${agentId}:`, error);
      throw error;
    }
  }

  // Get agent metadata by ID
  getAgentMetadata(agentId: string): AgentMetadata {
    return AGENT_METADATA[agentId] || AGENT_METADATA['universalAgent'];
  }

  // Generate a response from the agent (non-streaming)
  async generateResponse(agentId: string, messages: Message[], threadId?: string) {
    try {
      // Log the request details for debugging
      console.log('Generating response with:', {
        agentId,
        messageCount: messages.length,
        threadId: threadId || 'undefined',
        firstMessageRole: messages.length > 0 ? messages[0].role : 'none',
      });
      
      if (!messages || messages.length === 0) {
        console.error('Attempting to send empty messages array to Mastra API');
        throw new Error('Messages array cannot be empty');
      }

      const response = await this.axios.post(`/api/agents/${agentId}/generate`, {
        messages,
        threadId,
      });
      
      // Log the full response for debugging
      console.log('Full Mastra API response:', JSON.stringify(response.data));
      
      // The response format has changed - now the response content is in the 'text' property
      if (!response.data || !response.data.text) {
        console.error('Received empty response from Mastra API:', response.data);
        // If the response doesn't have text, provide a fallback
        return {
          content: "I'm sorry, I couldn't process that request. Please try again.",
          threadId: response.data?.threadId,
          runId: response.data?.runId
        };
      }
      
      // Return the response with the text property mapped to content for backward compatibility
      return {
        content: response.data.text,
        threadId: response.data.threadId || threadId,
        runId: response.data.runId
      };
    } catch (error) {
      console.error('Error generating response:', error);
      // Provide a more helpful error response
      return {
        content: "I apologize, but I encountered an error while processing your request. Please try again later.",
        threadId: threadId
      };
    }
  }

  // Stream a response from the agent (for real-time typing effect)
  async streamResponse(agentId: string, messages: Message[], threadId?: string) {
    try {
      // Log the request details for debugging
      console.log('Streaming response with:', {
        agentId, // This might be the old agent ID, but we'll use the universalAgent agent
        messageCount: messages.length,
        threadId: threadId || 'undefined',
      });
      
      // Always use the universalAgent agent for streaming
      const universalAgentId = 'universalAgent';
      
      // Use fetch directly for streaming
      const response = await fetch(`${this.baseUrl}/api/agents/${universalAgentId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, threadId }),
      });

      if (!response.body) {
        throw new Error('Stream response body is null');
      }

      return response.body;
    } catch (error) {
      console.error('Error streaming response:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const mastraApi = new MastraApiClient(); 