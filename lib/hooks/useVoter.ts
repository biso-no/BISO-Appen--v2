import { useState, useEffect } from 'react';
import { databases } from '@/lib/appwrite';
import { Models, Query } from 'react-native-appwrite';

export function useVoter(electionId: string) {
  const [voter, setVoter] = useState<Models.Document | null>(null);

  useEffect(() => {
    async function fetchVoter() {
      try {
        const voters = await databases.listDocuments('app', 'election_users', [
          Query.equal('electionId', electionId),
        ]);
        setVoter(voters.documents[0]);
      } catch (error) {
        console.error('Error fetching voter:', error);
      }
    }
    fetchVoter();
  }, [electionId]);

  return { voter };
}
