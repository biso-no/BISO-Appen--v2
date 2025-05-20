/**
 * Script to create the initial AI Copilot feature flag in Appwrite
 * 
 * Usage:
 * 1. Update the values if needed
 * 2. Run with: npx ts-node scripts/create-ai-copilot-feature-flag.ts
 */

import { databases, createDocument } from '../lib/appwrite';
import { ID } from 'react-native-appwrite';

async function createFeatureFlag() {
  try {
    // Check if the feature flag already exists
    const flags = await databases.listDocuments('app', 'feature_flags', []);
    const existingFlag = flags.documents.find((doc: any) => doc.key === 'ai_copilot');
    
    if (existingFlag) {
      console.log('AI Copilot feature flag already exists:', existingFlag);
      return;
    }
    
    // Create the feature flag
    const flag = await createDocument('feature_flags', {
      key: 'ai_copilot',
      enabled: false, // Default to disabled
      title: 'AI Copilot',
      description: 'Enable the AI Copilot feature for assistance throughout the app',
    });
    
    console.log('Created AI Copilot feature flag:', flag);
  } catch (error) {
    console.error('Error creating feature flag:', error);
  }
}

// Run the script
createFeatureFlag()
  .then(() => console.log('Done!'))
  .catch(console.error); 