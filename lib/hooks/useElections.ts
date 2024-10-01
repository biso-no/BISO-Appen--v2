import { useState, useEffect } from 'react';
import { databases } from '../appwrite';
import { Models } from 'react-native-appwrite';

// Define your custom fields and extend Models.Document
export interface Election extends Models.Document {
  name: string;
  date: string;
  status: 'upcoming' | 'past' | 'ongoing';
  campus: string;
  description?: string;
}

export function useElections() {
  const [upcomingElections, setUpcomingElections] = useState<Election[]>([]);
  const [pastElections, setPastElections] = useState<Election[]>([]);
  const [startedElections, setStartedElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        // Fetch documents from Appwrite's database
        const response = await databases.listDocuments('app', 'elections');

        // TypeScript will infer that response.documents[] contains the $id, $createdAt fields, no need to remap
        const data: Election[] = response.documents as Election[];  // Directly cast to the Election type

        // Filter elections based on their status
        setUpcomingElections(data.filter(election => election.status === 'upcoming'));
        setPastElections(data.filter(election => election.status === 'past'));
        setStartedElections(data.filter(election => election.status === 'ongoing'));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching elections:', error);
      }
    };

    fetchElections();
  }, []);

  return { upcomingElections,
            pastElections,
            startedElections,
            isLoading };
}
