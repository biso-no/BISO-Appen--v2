# AI Service Refactoring

This document explains how we've refactored the app's AI implementation to use Appwrite functions instead of directly calling the external AI API.

## Before the Refactoring

Previously, the app directly communicated with the Mastra API:

```
React Native App → Mastra API
```

This approach had several limitations:
- Direct dependency on the Mastra API implementation
- API credentials needed to be stored in the client app
- Difficult to switch to a different AI provider
- Changes to the API required client app updates

## After the Refactoring

Now, the app communicates with the AI API through an Appwrite function:

```
React Native App → Appwrite Function → AI API
```

This approach provides several benefits:
- Abstraction layer that hides the API implementation details
- API credentials can be securely stored in Appwrite
- Easier to switch to a different AI provider if needed
- Changes to the API can be handled in the Appwrite function without updating the client app

## Files Changed

1. **New Files:**
   - `functions/BisoCopilot/index.ts` - The Appwrite function that handles AI requests
   - `functions/BisoCopilot/package.json` - Dependencies for the Appwrite function
   - `functions/BisoCopilot/tsconfig.json` - TypeScript configuration for the function
   - `lib/ai-client.ts` - Client-side implementation for the Vercel AI SDK
   - `functions/BisoCopilot/README.md` - Documentation for the Appwrite function
   - `lib/message-types.ts` - Provides common message interfaces for the AI functionality

2. **Modified Files:**
   - `lib/stores/copilotStore.ts` - Simplified to focus only on UI state and animations
   - `components/ai/AICopilotPanel.tsx` - Updated to use the Vercel AI SDK
   - `components/ai/AICopilotProvider.tsx` - Simplified to focus on UI state management

3. **Removed Files/Code:**
   - Removed `AgentType` enum and related code from the copilotStore
   - Removed Mastra-specific API calls and agent handling
   - Removed `mastra-api.ts` - Replaced with `message-types.ts` for cleaner implementation
   - Backed up `mastra-openapi.json` as it's no longer needed

## Environment Variables

The following environment variables are needed:

In the Appwrite function:
- `AI_API_URL` - The URL of your AI API

In the React Native app:
- `EXPO_PUBLIC_AI_COPILOT_FUNCTION_ID` - The ID of your deployed Appwrite function (set to 'biso_copilot')

## Deployment Steps

1. Build and deploy the Appwrite function (see `functions/BisoCopilot/README.md` for details)
2. Update the environment variables in your React Native app
3. Deploy the updated app

## Vercel AI SDK Integration

We've also added integration with the Vercel AI SDK, which provides several benefits:

1. **Streaming Responses**: Using the Vercel AI SDK allows for streaming responses, which means the AI assistant's responses appear word by word in real-time, creating a more engaging user experience.

2. **Simpler State Management**: The SDK provides hooks like `useChat` that handle complex state management for chat interactions, such as loading states, error handling, and appending messages.

3. **Improved TypeScript Support**: The SDK comes with comprehensive TypeScript definitions, making it easier to work with chat interactions in a type-safe manner.

4. **Better Developer Experience**: The SDK abstracts away many of the complexities of working with chat-based AI, allowing developers to focus on building features rather than managing low-level implementation details.

Implementation notes:
- The AI function has been updated to support both streaming and non-streaming responses
- We've created a custom AI client that works with the Vercel AI SDK but uses our Appwrite function

## Future Improvements

- Implement proper streaming responses through Appwrite
- Add caching to reduce API calls and improve performance
- Implement rate limiting to control API usage
- Add analytics and monitoring for AI interactions 