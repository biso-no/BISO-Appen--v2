import React, { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Stack, XStack, Button, H3, H4, Paragraph } from 'tamagui';
import { useAuthStore } from '@/lib/stores/authStore';
import { useProfileStore } from '@/lib/stores/profileStore';
import { useMembershipStore } from '@/lib/stores/membershipStore';

/**
 * This component demonstrates the performance benefits of Zustand
 * By using selectors, we only re-render when specific pieces of state change
 */

// This component only re-renders when the user's name changes
const UserGreeting = memo(() => {
  // Only select what we need (the name)
  const userName = useAuthStore(state => state.user?.name);
  
  console.log('UserGreeting rendered');
  
  return (
    <H3>Hello, {userName || 'Guest'}</H3>
  );
});

// This component only re-renders when membership status changes
const MembershipStatus = memo(() => {
  // Only select what we need (the membership status)
  const isMember = useMembershipStore(state => state.isBisoMember);
  const membershipExpiry = useMembershipStore(state => state.membershipExpiry);
  
  console.log('MembershipStatus rendered');
  
  return (
    <Stack space="$2">
      <H4>Membership</H4>
      <Text>Status: {isMember ? 'Active' : 'Inactive'}</Text>
      {membershipExpiry && (
        <Text>Expires: {membershipExpiry.toLocaleDateString()}</Text>
      )}
    </Stack>
  );
});

// This component only re-renders when profile details change
const ProfileDetails = memo(() => {
  // Only select what we need from the profile
  const profile = useProfileStore(state => ({
    studentId: state.profile?.student_id,
    campus: state.profile?.campus
  }));
  
  console.log('ProfileDetails rendered');
  
  return (
    <Stack space="$2">
      <H4>Profile Details</H4>
      <Text>Student ID: {profile.studentId || 'Not set'}</Text>
      <Text>Campus: {profile.campus || 'Not set'}</Text>
    </Stack>
  );
});

// This component demonstrates updating state without unnecessary re-renders
const UpdateNameButton = memo(() => {
  // Only select the action we need
  const updateName = useAuthStore(state => state.updateName);
  
  console.log('UpdateNameButton rendered');
  
  const handlePress = () => {
    const randomName = `User_${Math.floor(Math.random() * 1000)}`;
    updateName(randomName);
  };
  
  return (
    <Button onPress={handlePress}>
      Update Name
    </Button>
  );
});

/**
 * Main example component
 */
export const ZustandExample = () => {
  console.log('ZustandExample (parent) rendered');
  
  return (
    <Stack space="$4" padding="$4">
      <H3>Zustand Performance Example</H3>
      
      <Paragraph>
        This example demonstrates how Zustand allows components to only 
        re-render when the specific pieces of state they use change.
        Check the console logs to see which components re-render.
      </Paragraph>
      
      <UserGreeting />
      
      <MembershipStatus />
      
      <ProfileDetails />
      
      <UpdateNameButton />
      
      <Paragraph size="$2" opacity={0.7}>
        When you click the button above, only the UserGreeting component re-renders,
        while the other components remain static. This selective re-rendering is a 
        key performance benefit of Zustand.
      </Paragraph>
    </Stack>
  );
}; 