import React, { createContext, useContext } from 'react';
import { useZustandMembership } from '@/lib/hooks/useMembershipStore';

interface Membership {
  membership_id: string;
  name: string;
  price: number;
  category: string;
  status: boolean;
  expiryDate: string;
  $id: string;
}

interface MembershipContextType {
  membership: Membership | null;
  isLoading: boolean;
  isBisoMember: boolean;
  membershipExpiry: Date | null;
  refetch: () => Promise<any>;
}

const MembershipContext = createContext<MembershipContextType | undefined>(undefined);

export const useMembershipContext = () => {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error('useMembershipContext must be used within a MembershipProvider');
  }
  return context;
};

export const MembershipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use our new Zustand-based hook
  const { membership, isLoading, isBisoMember, membershipExpiry, refetch } = useZustandMembership();
  
  const value = {
    membership,
    isLoading,
    isBisoMember,
    membershipExpiry,
    refetch
  };

  return (
    <MembershipContext.Provider value={value}>
      {children}
    </MembershipContext.Provider>
  );
}; 