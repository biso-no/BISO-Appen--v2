import { useState, useEffect, useCallback } from 'react';
import { databases } from '../appwrite';
import { Models } from 'react-native-appwrite';
import { Election } from '@/types/election';

export function useElections() {
  const [upcomingElections, setUpcomingElections] = useState<Election[]>([]);
  const [pastElections, setPastElections] = useState<Election[]>([]);
  const [startedElections, setStartedElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch elections
  const fetchElections = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch documents from Appwrite's database
      const response = await databases.listDocuments('app', 'elections');
      console.log('Elections:', response);

      // TypeScript will infer that response.documents[] contains the $id, $createdAt fields, no need to remap
      const data: Election[] = response.documents as Election[];

      // Filter elections based on their status
      setUpcomingElections(data.filter(election => election.status === 'upcoming'));
      setPastElections(data.filter(election => election.status === 'past'));
      setStartedElections(data.filter(election => election.status === 'ongoing'));
    } catch (error) {
      console.error('Error fetching elections:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch when the component mounts
  useEffect(() => {
    fetchElections();
  }, [fetchElections]);

  return {
    upcomingElections,
    pastElections,
    startedElections,
    isLoading,
    refetch: fetchElections, // Expose fetchElections as refetch
  };
}
