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

type VotingItemType = 'statute' | 'position'

interface VotingOption {
  value: string
}

interface VotingItem {
  type: VotingItemType
  title: string
  votingOptions: VotingOption[]
  maxSelections: number
  allowAbstain: boolean
}

interface ElectionSession {
  name: string
  votingItems: VotingItem[]
}

type ElectionState = 'waiting' | 'sessionStarting' | 'voting' | 'submitted'

export default function OngoingElectionScreen() {
  const [electionState, setElectionState] = useState<ElectionState>('waiting')
  const [currentSession, setCurrentSession] = useState<ElectionSession | null>(null)
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [refreshing, setRefreshing] = useState(false)

  const fetchElectionData = useCallback(() => {
    // Simulating API call
    return new Promise<ElectionSession>((resolve) => {
      setTimeout(() => {
        resolve({
          name: 'Board Member Elections and Statute Changes',
          votingItems: [
            {
              type: 'position',
              title: 'President',
              votingOptions: [
                { value: 'John Doe' },
                { value: 'Jane Smith' },
                { value: 'Abstain' },
              ],
              maxSelections: 1,
              allowAbstain: true,
            },
            {
              type: 'position',
              title: 'Vice Presidents',
              votingOptions: [
                { value: 'Alice Johnson' },
                { value: 'Bob Williams' },
                { value: 'Carol Brown' },
                { value: 'David Lee' },
                { value: 'Abstain' },
              ],
              maxSelections: 3,
              allowAbstain: true,
            },
            {
              type: 'statute',
              title: 'Amendment to Article 5',
              votingOptions: [
                { value: 'Approve' },
                { value: 'Reject' },
              ],
              maxSelections: 1,
              allowAbstain: false,
            },
          ],
        })
      }, 2000)
    })
  }, [])

  const loadElectionData = useCallback(() => {
    setRefreshing(true)
    setElectionState('sessionStarting')
    fetchElectionData().then((data) => {
      setTimeout(() => {
        setCurrentSession(data)
        setElectionState('voting')
        setRefreshing(false)
      }, 1500) // Show the "Session Starting" screen for 1.5 seconds
    })
  }, [fetchElectionData])

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

  const handleSubmit = () => {
    if (validateVotes()) {
      console.log('Submitting votes:', selectedVotes)
      setElectionState('submitted')
      setTimeout(() => setElectionState('waiting'), 3000)
    }
  }

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
          The next voting session is being prepared. We appreciate your patience.
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
      <YStack flex={1} backgroundColor="$background">
        {electionState === 'waiting' && renderWaitingScreen()}
        {electionState === 'sessionStarting' && renderSessionStartingScreen()}
        {electionState === 'voting' && renderVotingScreen()}
        {electionState === 'submitted' && renderSubmittedScreen()}
      </YStack>
    </Theme>
  )
}