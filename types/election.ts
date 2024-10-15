import { Models } from "react-native-appwrite"

export type VotingItemType = 'statute' | 'position'

export interface VotingOption extends Models.Document {
  value: string
}

export interface VotingItem extends Models.Document {
  type: VotingItemType
  title: string
  votingOptions: VotingOption[]
  maxSelections: number
  allowAbstain: boolean
}

export interface Election extends Models.Document {
  electionUsers: ElectionUser[]
  sessions: ElectionSession[]
}

export interface ElectionSession extends Models.Document {
  name: string
  votingItems: VotingItem[]
  election: Election;
  electionVotes: Vote[];
}

export interface Vote {
  optionId: string
  voterId: string
  electionId: string
  votingSessionId: string
  votingItemId: string
  weight: number
  voter: string
  electionSession: string
}

export interface ElectionUser extends Models.Document {
  voterId: string
  voteWeight: number
}


export type ElectionState = 'waiting' | 'sessionStarting' | 'voting' | 'submitted'