import React, { createContext, useContext, useMemo } from 'react';
import { useProfile } from './profile-provider';
import { useMembership } from '@/lib/hooks/useMembership';

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
  const { profile } = useProfile();
  const { data: membershipData, isLoading } = useMembership(profile?.student_id);

  // Derive membership status and expiry from membership data
  const isBisoMember = useMemo(() => 
    membershipData?.status ?? false,
    [membershipData]
  );

  const membershipExpiry = useMemo(() => 
    membershipData?.expiryDate ? new Date(membershipData.expiryDate) : null,
    [membershipData]
  );

  const value = {
    membership: membershipData || null,
    isLoading,
    isBisoMember,
    membershipExpiry,
  };

  return (
    <MembershipContext.Provider value={value}>
      {children}
    </MembershipContext.Provider>
  );
}; 