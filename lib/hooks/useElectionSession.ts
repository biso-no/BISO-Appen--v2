import { useState, useCallback } from 'react';
import { databases } from '@/lib/appwrite';
import { Models, Query } from 'react-native-appwrite';
import { VotingItem, Vote, Election } from '@/types/election';

interface ElectionSession extends Models.Document {
    name: string
    votingItems: VotingItem[]
    election: Election;
    electionVotes: Vote[];
  }

export function useCurrentSession(electionId: string, userId: string) {
  const [currentSession, setCurrentSession] = useState<ElectionSession | null>(
    null
  );
  const [hasVoted, setHasVoted] = useState(false);

  const loadElectionData = useCallback(async () => {
    const response = await databases.listDocuments('app', 'election_sessions', [
        Query.and([Query.equal('electionId', electionId), Query.equal('status', 'ongoing')]),
        Query.limit(1),
      ])
      if (response.documents.length > 0) {
        const session = response.documents[0]
        return {
          $id: session.$id,
          name: session.name,
          votingItems: session.votingItems,
          election: session.election,
        } as ElectionSession
      } else {
        return null
      }
    }, [electionId])

  return { currentSession, hasVoted, loadElectionData };
}
