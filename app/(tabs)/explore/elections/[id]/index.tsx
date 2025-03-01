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
  Checkbox,
} from 'tamagui'
import { Check, FileText, Users, AlertTriangle } from '@tamagui/lucide-icons'
import { Models, Query } from 'react-native-appwrite'
import { databases } from '@/lib/appwrite'
import { useAuth } from '@/components/context/core/auth-provider'
import { useLocalSearchParams } from 'expo-router'
import { ElectionSession, ElectionState, Vote} from '@/types/election'

export default function OngoingElectionScreen() {
  const [electionState, setElectionState] = useState<ElectionState>('waiting')
  const [currentSession, setCurrentSession] = useState<ElectionSession | null>(null)
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [refreshing, setRefreshing] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const { user } = useAuth()
  const [voter, setVoter] = useState<Models.Document | null>(null)

  const { id } = useLocalSearchParams<{ id: string }>();

  const electionId = id

  useEffect(() => {
    async function fetchVoter() {
      try {
        const voters = await databases.listDocuments('app', 'election_users', [
          Query.equal('electionId', electionId),
        ])
        console.log(voters)
        const voter = voters.documents[0]
        setVoter(voter)
      } catch (error) {
        console.error('Error fetching voter:', error)
      }
    }
    fetchVoter()
  }, [electionId])

  const fetchElectionData = useCallback(async () => {
    try {
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
          electionVotes: session.electionVotes,
        } as ElectionSession
      } else {
        return null
      }
    } catch (error) {
      console.error('Error fetching election data:', error)
      return null
    }
  }, [])

  const checkUserVoteStatus = useCallback(
    async (currentSession: ElectionSession | null) => {
      try {
        if (!currentSession || !user) return false
        const response = await databases.listDocuments('app', 'election_vote', [
          Query.equal('votingSessionId', currentSession.$id),
          Query.equal('voterId', user.$id),
        ])
        return response.documents.length > 0
      } catch (error) {
        console.error('Error checking user vote status:', error)
        return false
      }
    },
    [user]
  )

  const loadElectionData = useCallback(async () => {
    setRefreshing(true)
    setElectionState('sessionStarting')
    try {
      const sessionData = await fetchElectionData()
      setCurrentSession(sessionData)
      if (sessionData) {
        //Only current user's votes are present in electionSession.electionVotes, check if the user has voted
        console.log("Election User ID: ", sessionData.election.electionUsers[0].$id)
        console.log("Session: ", JSON.stringify(sessionData));
        if (sessionData.electionVotes.length > 0) {
          const userHasVoted = sessionData.electionVotes.some(vote => vote.voterId === sessionData.election.electionUsers[0].$id)
          setHasVoted(userHasVoted)
          setElectionState(userHasVoted ? 'waiting' : 'voting')
        } else {
          setElectionState('voting')
        }
      
        setRefreshing(false)
        return sessionData
          
      }}
      catch (error) {
        console.error('Error loading election data:', error)
        setElectionState('waiting')
        setRefreshing(false)
        return null
      }
    }, [electionId])

  useEffect(() => {
    if (electionState !== 'voting') {
    const timer = setTimeout(loadElectionData, 300)
    return () => clearTimeout(timer)
    }
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

      console.log("Updated votes for", itemTitle, ":", updatedVotes)
      return { ...prev, [itemTitle]: updatedVotes }
    })

    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[itemTitle]
      return newErrors
    })
  }

  const isVoteSelected = (itemTitle: string, optionValue: string) => {
    return selectedVotes[itemTitle]?.includes(optionValue) || false
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

  useEffect(() => {
    console.log("Current session: ", JSON.stringify(currentSession));
    console.log("Voter: ", voter);
  }, [currentSession, voter]);

  const handleSubmit = async () => {
    if (validateVotes()) {
      if (!currentSession || !voter) {
        console.error('No current session or voter found');
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
              voterId: voter.$id,
              electionId: currentSession.election.$id,
              votingSessionId: currentSession.$id,
              votingItemId: item.$id,
              weight: voter.voteWeight,
              voter: voter.$id,
              electionSession: currentSession.$id,
            });
          }
        });
      });
  
      console.log("Votes to submit: ", votesToSubmit);
  
      try {
        // Submit votes one by one
        for (const vote of votesToSubmit) {
          console.log("Submitting vote: ", vote);
          await databases.createDocument('app', 'election_vote', 'unique()', vote);
        }
  
        console.log('All votes submitted successfully');
        setElectionState('submitted');
        setTimeout(() => setElectionState('waiting'), 3000);
      } catch (error) {
        console.error('Error submitting votes:', error);
        setErrors({ submit: 'An error occurred while submitting your votes. Please try again.' });
      }
    } else {
      console.log('Vote validation failed');
    }
  };



  const renderWaitingScreen = () => (

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
          <Card key={index} chromeless padding="$4" borderColor="$gray5" borderWidth={1} borderRadius="$4">
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
            {item.votingOptions.map((option, optionIndex) => {
                  const isSelected = isVoteSelected(item.title, option.value)
                  return (
                    <Card
                      key={optionIndex}
                      onPress={() => handleVote(item.title, option.value)}
                      padding="$3"
                      borderColor={isSelected ? "$blue10" : "$gray5"}
                      borderWidth={2}
                      borderRadius="$3"
                      backgroundColor={isSelected ? "$blue5" : "$white"}
                    >
                      <XStack alignItems="center" gap="$2">
                      <Checkbox
                            id={`${item.title}-${option.value}`}
                            checked={isSelected}
                            onCheckedChange={() => handleVote(item.title, option.value)}
                          >
                          <Checkbox.Indicator>
                            <Check />
                          </Checkbox.Indicator>
                        </Checkbox>
                        <Text>{option.value}</Text>
                      </XStack>
                    </Card>
                  )
                })}

            </YStack>
            {errors[item.title] && (
              <XStack alignItems="center" marginTop="$2">
                <AlertTriangle size={16} color="$red10" />
                <Text color="$red10" marginLeft="$1">{errors[item.title]}</Text>
              </XStack>
            )}
          </Card>
        ))}
        <Card 
          onPress={handleSubmit}
          backgroundColor="$green10"
          padding="$4"
          borderRadius="$4"
          alignItems="center"
          justifyContent="center"
        >
          <Text color="$white">Submit Votes</Text>
        </Card>
      </YStack>
    </ScrollView>
  )

//Screen to render when the user has been deactivated for the entire election (Such as cases where they have left the campus)
const renderDeactivatedScreen = () => (
  <YStack flex={1} justifyContent="center" alignItems="center">
    <AlertTriangle size={48} color="$red10" />
    <H2 marginTop="$4">You have been deactivated</H2>
    <Paragraph textAlign="center" marginTop="$2">
      You have been deactivated for the entire election. You will not be able to vote.
    </Paragraph>
  </YStack>
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

  if (voter?.canVote === false) {
    return renderDeactivatedScreen()
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadElectionData} />
      }
    >
      <YStack flex={1}>
        {electionState === 'waiting' && renderWaitingScreen()}
        {electionState === 'sessionStarting' && renderSessionStartingScreen()}
        {electionState === 'voting' && renderVotingScreen()}
        {electionState === 'submitted' && renderSubmittedScreen()}
      </YStack>
      </ScrollView>
  )
}