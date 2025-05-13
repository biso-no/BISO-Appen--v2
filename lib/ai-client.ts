/**
 * AI Client for BISO app using Vercel AI SDK
 * This client interfaces with the Appwrite AICopilot function
 */

import { functions } from './appwrite';
import { ExecutionMethod } from 'react-native-appwrite';

// Define the ID of your AICopilot function in Appwrite
const AI_COPILOT_FUNCTION_ID = process.env.EXPO_PUBLIC_AI_COPILOT_FUNCTION_ID || 'biso_copilot';

/**
 * Create a fetch-based API for Vercel AI SDK that works with Appwrite function
 * This allows us to use useChat and other Vercel AI SDK hooks with our Appwrite backend
 */
export const aiApi = {
  /**
   * Chat completion endpoint that works with useChat from Vercel AI SDK
   */
  chatCompletions: {
    create: async (payload: any) => {
      try {
        const messages = payload.messages || [];
        const threadId = payload.threadId;
        const stream = payload.stream || false;

        console.log('AI Client sending request to Appwrite function:', {
          messageCount: messages.length,
          threadId: threadId || 'undefined',
          stream,
        });

        // Call the Appwrite function
        const response = await functions.createExecution(
          AI_COPILOT_FUNCTION_ID,
          JSON.stringify({
            messages,
            threadId,
            stream,
          }),
          false,
          '/', // Use '/' as the path instead of empty string which causes Invalid path param error
          'POST' as ExecutionMethod
        );
        console.log('AI Client received response from Appwrite function:', response);

        // If streaming is requested, return the ReadableStream directly
        if (stream) {
          // This is a workaround since Appwrite doesn't support streaming responses directly
          // We'll need to parse the responseBody and convert it to a stream for Vercel AI SDK
          
          // Return an object with a body property to simulate a fetch response
          return {
            ok: true,
            status: 200,
            statusText: 'OK',
            headers: new Headers({
              'Content-Type': 'text/event-stream',
            }),
            body: simulateStream(response.responseBody || '[]'),
          };
        }

        // For non-streaming responses, parse the response and return in OpenAI-like format
        const data = JSON.parse(response.responseBody || '{}');
        
        if (!data.success || !data.data) {
          throw new Error(data.message || 'Failed to get response from AI service');
        }

        // Return in a format similar to OpenAI's API for compatibility with Vercel AI SDK
        return {
          id: response.$id,
          object: 'chat.completion',
          created: Date.now(),
          model: 'biso-ai',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: data.data.content,
              },
              finish_reason: 'stop',
            }
          ],
          threadId: data.data.threadId || threadId,
        };
      } catch (error) {
        console.error('Error in AI client chatCompletions.create:', error);
        throw error;
      }
    }
  }
};

/**
 * Helper function to simulate a ReadableStream from a string response
 * This is needed because Appwrite functions don't support returning actual streams
 */
function simulateStream(responseBody: string): ReadableStream {
  try {
    // Parse the response body
    const data = JSON.parse(responseBody);
    
    // If we have valid data with content, create a stream of that content
    if (data && data.success && data.data && data.data.content) {
      const content = data.data.content;
      const threadId = data.data.threadId;
      
      // Create a ReadableStream that emits the content character by character
      return new ReadableStream({
        start(controller) {
          // Send initial event
          const initialEvent = {
            id: Date.now().toString(),
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: 'biso-ai',
            choices: [
              {
                index: 0,
                delta: {
                  role: 'assistant'
                },
                finish_reason: null
              }
            ]
          };
          
          controller.enqueue(`data: ${JSON.stringify(initialEvent)}\n\n`);
          
          // Split content into characters and send each as a chunk
          for (let i = 0; i < content.length; i++) {
            const char = content[i];
            
            // Create a chunk event for each character
            const event = {
              id: `${Date.now()}-${i}`,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: 'biso-ai',
              choices: [
                {
                  index: 0,
                  delta: {
                    content: char
                  },
                  finish_reason: null
                }
              ]
            };
            
            // Enqueue the event
            controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
          }
          
          // Send final event
          const finalEvent = {
            id: Date.now().toString(),
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: 'biso-ai',
            choices: [
              {
                index: 0,
                delta: {},
                finish_reason: 'stop'
              }
            ],
            threadId: threadId
          };
          
          controller.enqueue(`data: ${JSON.stringify(finalEvent)}\n\n`);
          controller.enqueue('data: [DONE]\n\n');
          controller.close();
        }
      });
    }
    
    // If we don't have valid content, return an empty stream with an error
    return new ReadableStream({
      start(controller) {
        const errorEvent = {
          object: 'error',
          message: 'Failed to parse response from AI service',
        };
        
        controller.enqueue(`data: ${JSON.stringify(errorEvent)}\n\n`);
        controller.close();
      }
    });
  } catch (error) {
    // If we can't parse the response, return an error stream
    return new ReadableStream({
      start(controller) {
        const errorEvent = {
          object: 'error',
          message: 'Failed to parse response from AI service',
        };
        
        controller.enqueue(`data: ${JSON.stringify(errorEvent)}\n\n`);
        controller.close();
      }
    });
  }
} 