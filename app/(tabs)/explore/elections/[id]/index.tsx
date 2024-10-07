import React, { useState, useEffect, useCallback } from 'react'
import { ScrollView, RefreshControl } from 'react-native'
import { 
  YStack, 
  XStack, 
  Text, 
  Button, 
  Spinner, 
  Card, 
  H1, 
  H2, 
  Paragraph,
  Theme,
  H4,
} from 'tamagui'
import { Check, FileText, Users, AlertTriangle } from '@tamagui/lucide-icons'
import { Models, Query } from 'react-native-appwrite'
import { databases } from '@/lib/appwrite'
import { useAuth } from '@/components/context/auth-provider'

type VotingItemType = 'statute' | 'position'

interface VotingOption extends Models.Document {
  value: string
}

interface VotingItem extends Models.Document {
  type: VotingItemType
  title: string
  votingOptions: VotingOption[]
  maxSelections: number
  allowAbstain: boolean
}

interface Election extends Models.Document {
  electionUsers: ElectionUser[]
  sessions: ElectionSession[]
}

interface ElectionSession extends Models.Document {
  name: string
  votingItems: VotingItem[]
  election: Election
}

interface Vote {
  optionId: string
  voterId: string
  electionId: string
  votingSessionId: string
  votingItemId: string
  weight: number
  electionUsers: string
}

interface ElectionUser extends Models.Document {
  voterId: string
  voteWeight: number
}


type ElectionState = 'waiting' | 'sessionStarting' | 'voting' | 'submitted'

export default function OngoingElectionScreen() {
  const [electionState, setElectionState] = useState<ElectionState>('waiting')
  const [currentSession, setCurrentSession] = useState<ElectionSession | null>(null)
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [refreshing, setRefreshing] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const { data } = useAuth()

  const fetchElectionData = useCallback(async () => {
    try {
      const response = await databases.listDocuments('app', 'election_sessions', [
        Query.equal('status', 'ongoing'),
        Query.limit(1)
      ])

      if (response.documents.length > 0) {
        const session = response.documents[0]
        console.log(JSON.stringify(session))
        return {
          $id: session.$id,
          name: session.name,
          votingItems: session.votingItems,
          election: session.election
        } as ElectionSession
      } else {
        throw new Error('No ongoing election session found')
      }
    } catch (error) {
      console.error('Error fetching election data:', error)
      throw error
    }
  }, [])

  const checkUserVoteStatus = useCallback(async () => {
    try {
      if (!currentSession || !data) return false
      const response = await databases.listDocuments('app', 'election_vote', [
        Query.equal('votingSessionId', currentSession.$id),
      ])

      return response.documents.length > 0
    } catch (error) {
      console.error('Error checking user vote status:', error)
      return false
    }
  }, [])

  useEffect(() => {
    console.log(JSON.stringify(currentSession))
  }, [currentSession])

  const loadElectionData = useCallback(async () => {
    setRefreshing(true)
    setElectionState('sessionStarting')
    try {
      const data = await fetchElectionData()
      const userHasVoted = await checkUserVoteStatus() // Replace with actual user ID
      setHasVoted(userHasVoted)
      
      setTimeout(() => {
        setCurrentSession(data)
        setElectionState(userHasVoted ? 'waiting' : 'voting')
        setRefreshing(false)
      }, 1500)
    } catch (error) {
      console.error('Error loading election data:', error)
      setElectionState('waiting')
      setRefreshing(false)
    }
  }, [fetchElectionData, checkUserVoteStatus])

  useEffect(() => {
    const timer = setTimeout(loadElectionData, 3000)
    return () => clearTimeout(timer)
  }, [loadElectionData])



  const handleVote = (itemTitle: string, optionValue: string) => {
    setSelectedVotes(prev => {
      const item = currentSession?.votingItems.find(i => i.title === itemTitle)
      if (!item) return prev

      let updatedVotes = prev[itemTitle] ? [...prev[itemTitle]] : []
      const isAbstain = optionValue === 'Abstain' && item.allowAbstain

      if (isAbstain) {
        updatedVotes = updatedVotes.includes('Abstain') ? [] : ['Abstain']
      } else {
        updatedVotes = updatedVotes.filter(v => v !== 'Abstain')

        const index = updatedVotes.indexOf(optionValue)
        if (index > -1) {
          updatedVotes.splice(index, 1)
        } else if (updatedVotes.length < item.maxSelections) {
          updatedVotes.push(optionValue)
        } else {
          updatedVotes.shift()
          updatedVotes.push(optionValue)
        }
      }

      return { ...prev, [itemTitle]: updatedVotes }
    })

    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[itemTitle]
      return newErrors
    })
  }

  const validateVotes = () => {
    const newErrors: Record<string, string> = {}

    currentSession?.votingItems.forEach(item => {
      const votes = selectedVotes[item.title] || []
      if (votes.length === 0) {
        newErrors[item.title] = 'Please make a selection'
      } else if (votes.length !== item.maxSelections && !(item.allowAbstain && votes.includes('Abstain'))) {
        newErrors[item.title] = `Please select exactly ${item.maxSelections} option(s) or Abstain`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (validateVotes()) {
      if (!currentSession || !currentSession.election || !currentSession.election.electionUsers || currentSession.election.electionUsers.length === 0) {
        console.error('Invalid session data');
        setErrors({ submit: 'An error occurred while submitting your votes. Please try again.' });
        return;
      }

  
      // Prepare the votes for submission
      const votesToSubmit: Vote[] = [];
      currentSession.votingItems.forEach((item) => {
        const selectedOptions = selectedVotes[item.title] || [];
        selectedOptions.forEach((optionValue) => {
          const option = item.votingOptions.find(opt => opt.value === optionValue);
          if (option) {
            votesToSubmit.push({
              optionId: option.$id,
              voterId: currentSession.election.electionUsers[0].$id,
              electionId: currentSession.election.$id,
              votingSessionId: currentSession.$id,
              votingItemId: item.$id,
              weight: currentSession.election.electionUsers[0].voteWeight,
              electionUsers: currentSession.election.electionUsers[0].$id
            });
          }
        });
      });
  
      try {
        // Submit each vote to the database
        await Promise.all(
          votesToSubmit.map(vote => databases.createDocument('app', 'election_vote', 'unique()', vote))
        );
  
        console.log('Votes submitted:', votesToSubmit);
        setElectionState('submitted');
        setTimeout(() => setElectionState('waiting'), 3000);
      } catch (error) {
        console.error('Error submitting votes:', error);
        setErrors({ submit: 'An error occurred while submitting your votes. Please try again.' });
      }
    }
  };

  const isVoteSelected = (itemTitle: string, optionValue: string) => {
    return selectedVotes[itemTitle]?.includes(optionValue) || false
  }

  const renderWaitingScreen = () => (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadElectionData} />
      }
    >
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" color="$blue10" />
        <H2 marginTop="$4">Please Wait</H2>
        <Paragraph textAlign="center" marginTop="$2">
          {hasVoted 
            ? "You have already voted in this session. Waiting for the next session."
            : "The next voting session is being prepared. We appreciate your patience."}
        </Paragraph>
        <Paragraph textAlign="center" marginTop="$2" color="$gray10">
          Pull down to refresh manually.
        </Paragraph>
      </YStack>
    </ScrollView>
  )

  const renderSessionStartingScreen = () => (
    <YStack flex={1} justifyContent="center" alignItems="center">
      <Spinner size="large" color="$green10" />
      <H2 marginTop="$4">Session Starting</H2>
      <Paragraph textAlign="center" marginTop="$2">
        The next voting session has begun and will load shortly.
      </Paragraph>
    </YStack>
  )

  const renderVotingScreen = () => (
    <ScrollView>
      <YStack padding="$4" gap="$4">
        <H4>{currentSession?.name}</H4>
        {currentSession?.votingItems.map((item, index) => (
          <Card key={index} chromeless padding="$4">
            <XStack alignItems="center" marginBottom="$2">
              {item.type === 'statute' ? (
                <FileText size={20} color="$blue10" />
              ) : (
                <Users size={20} color="$green10" />
              )}
              <H2 marginLeft="$2">{item.title}</H2>
            </XStack>
            <Paragraph>Select {item.maxSelections} option(s){item.allowAbstain ? ' or Abstain' : ''}</Paragraph>
            <YStack gap="$2" marginTop="$2">
              {item.votingOptions.map((option, optionIndex) => (
                <Button
                  key={optionIndex}
                  themeInverse={isVoteSelected(item.title, option.value)}
                  onPress={() => handleVote(item.title, option.value)}
                >
                  {option.value}
                </Button>
              ))}
            </YStack>
            {errors[item.title] && (
              <XStack alignItems="center" marginTop="$2">
                <AlertTriangle size={16} color="$red10" />
                <Text color="$red10" marginLeft="$1">{errors[item.title]}</Text>
              </XStack>
            )}
          </Card>
        ))}
        <Button 
          themeInverse
          onPress={handleSubmit}
          marginTop="$4"
        >
          Submit Votes
        </Button>
      </YStack>
    </ScrollView>
  )

  const renderSubmittedScreen = () => (
    <YStack flex={1} justifyContent="center" alignItems="center">
      <Check size={48} color="$green10" />
      <H2 marginTop="$4">Votes Submitted</H2>
      <Paragraph textAlign="center" marginTop="$2">
        Thank you for voting. Your votes have been recorded.
      </Paragraph>
    </YStack>
  )

  return (
    <Theme name="light">
      <YStack flex={1}>
        {electionState === 'waiting' && renderWaitingScreen()}
        {electionState === 'sessionStarting' && renderSessionStartingScreen()}
        {electionState === 'voting' && renderVotingScreen()}
        {electionState === 'submitted' && renderSubmittedScreen()}
      </YStack>
    </Theme>
  )
}