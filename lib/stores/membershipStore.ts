import { create } from 'zustand';
import { functions } from '@/lib/appwrite';
import { queryClient } from '@/lib/react-query';

// Define the Membership interface
interface Membership {
  membership_id: string;
  name: string;
  price: number;
  category: string;
  status: boolean;
  expiryDate: string;
  $id: string;
}

// Define the membership store state
interface MembershipState {
  membership: Membership | null;
  isLoading: boolean;
  error: string | null;
  
  // Derived state
  isBisoMember: boolean;
  membershipExpiry: Date | null;
  
  // Actions
  setMembership: (membership: Membership | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

// Initial state
const initialState = {
  membership: null,
  isLoading: false,
  error: null,
  isBisoMember: false,
  membershipExpiry: null,
};

// Create the store
export const useMembershipStore = create<MembershipState>((set, get) => ({
  ...initialState,
  
  // State setters
  setMembership: (membership) => set({ 
    membership,
    // Update derived state when membership changes
    isBisoMember: membership?.status ?? false,
    membershipExpiry: membership?.expiryDate ? new Date(membership.expiryDate) : null
  }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Reset state
  resetState: () => set(initialState),
})); 