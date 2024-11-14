import { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import {
  View, Card, Separator, Text, Button,
  XStack, YStack, H2, H4, Avatar,
  Sheet, Input, Label,
} from 'tamagui';
import { User, Settings, CreditCard, Bell, LogOut } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/context/auth-provider';
import { updateDocument, signOut } from '@/lib/appwrite';
import { ExpenseList } from '@/components/tools/expenses/expense-list';
import DepartmentSelector from '@/components/SelectDepartments';
import { Switch } from '@/components/ui/switch';
import { ProfileCard } from '@/components/profile/profile-card';

interface ProfileSection {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

export default function ProfileScreen() {
  const { data, profile, isLoading, isBisoMember, refetchUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileDetails, setProfileDetails] = useState({
    phone: profile?.phone ?? '',
    address: profile?.address ?? '',
    city: profile?.city ?? '',
    zip: profile?.zip ?? '',
    bank_account: profile?.bank_account ?? ''
  });

  // Profile update handlers
  const handleUpdateProfile = async (updates: Partial<typeof profileDetails>) => {
    if (!profile?.$id) return;
    try {
      await updateDocument('user', profile.$id, updates);
      setProfileDetails(prev => ({ ...prev, ...updates }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = async () => {
    await signOut(refetchUser);
    router.replace('/(tabs)');
  };

  if (isLoading || !data) return null;

  if (!profile?.name) {
    return (
      <YStack space="$4" padding="$6" alignItems="center" justifyContent="center">
        <H2>Welcome!</H2>
        <Text textAlign="center">Complete your profile to get started</Text>
        <Button 
          size="$4" 
          theme="active"
          onPress={() => router.navigate('/onboarding')}
        >
          Complete Profile
        </Button>
      </YStack>
    );
  }

  const sections: ProfileSection[] = [
    {
      icon: <User size={24} />,
      title: "Personal Information",
      content: (
        <Card bordered padding="$4" margin="$2">
          <YStack space="$4">
            <XStack justifyContent="space-between" alignItems="center">
              <H4>{profile.name}</H4>
              <Button 
                size="$3" 
                variant="outlined"
                onPress={() => setIsEditing(true)}
              >
                Edit
              </Button>
            </XStack>
            <Separator />
            <ProfileField label="Phone" value={profileDetails.phone} />
            <ProfileField label="Address" value={profileDetails.address} />
            <ProfileField label="City" value={profileDetails.city} />
            <ProfileField label="ZIP" value={profileDetails.zip} />
          </YStack>
        </Card>
      )
    },
    {
      icon: <CreditCard size={24} />,
      title: "Payment Information",
      content: (
        <Card bordered padding="$4" margin="$2">
          <YStack space="$4">
            <ProfileField 
              label="Bank Account" 
              value={profileDetails.bank_account} 
              secure
            />
            {isBisoMember && (
              <View>
                <Separator />
                <H4>Recent Expenses</H4>
                <ExpenseList withFilters={false} profileScreen />
                <Button 
                  onPress={() => router.push("/explore/expenses")}
                  variant="outlined"
                >
                  View All Expenses
                </Button>
              </View>
            )}
          </YStack>
        </Card>
      )
    },
    {
      icon: <Bell size={24} />,
      title: "Notifications",
      content: (
        <Card bordered padding="$4" margin="$2">
          <YStack space="$4">
            <NotificationSwitch label="New Events" topic="events" />
            <NotificationSwitch label="New Posts" topic="posts" />
            <NotificationSwitch label="Messages" topic="messages" />
            <NotificationSwitch label="Expense Updates" topic="expenses" />
          </YStack>
        </Card>
      )
    },
    {
      icon: <Settings size={24} />,
      title: "Preferences",
      content: (
        <Card bordered padding="$4" margin="$2">
          <YStack space="$4">
            <H4>Department Settings</H4>
            <DepartmentSelector
              campus={profile?.campus_id}
              onSelect={() => {}} // Add your handler
              selectedDepartments={[]}
              multiSelect
            />
          </YStack>
        </Card>
      )
    }
  ];

  return (
    <ScrollView>
      <YStack padding="$4" space="$4">
        {/* Profile Header */}
        <ProfileCard />

        {/* Profile Sections */}
        {sections.map((section, index) => (
          <YStack key={index} space="$2">
            <XStack space="$2" alignItems="center" paddingLeft="$2">
              {section.icon}
              <H4>{section.title}</H4>
            </XStack>
            {section.content}
          </YStack>
        ))}

        {/* Logout Button */}
        <Button 
          onPress={handleLogout}
          variant="outlined"
          icon={<LogOut size={18} />}
          marginTop="$4"
        >
          Sign Out
        </Button>
      </YStack>

      {/* Edit Profile Sheet */}
      <Sheet
        modal
        open={isEditing}
        onOpenChange={setIsEditing}
        snapPoints={[80]}
        dismissOnSnapToBottom
      >
        <Sheet.Frame padding="$4">
          <Sheet.Handle />
          <YStack space="$4">
            <H4>Edit Profile</H4>
            <Input
              value={profileDetails.phone}
              onChangeText={(text) => setProfileDetails(prev => ({ ...prev, phone: text }))}
              placeholder="Phone"
              keyboardType="phone-pad"
            />
            <Input
              value={profileDetails.address}
              onChangeText={(text) => setProfileDetails(prev => ({ ...prev, address: text }))}
              placeholder="Address"
            />
            <Input
              value={profileDetails.city}
              onChangeText={(text) => setProfileDetails(prev => ({ ...prev, city: text }))}
              placeholder="City"
            />
            <Input
              value={profileDetails.zip}
              onChangeText={(text) => setProfileDetails(prev => ({ ...prev, zip: text }))}
              placeholder="ZIP Code"
              keyboardType="number-pad"
            />
            <Button 
              onPress={() => handleUpdateProfile(profileDetails)}
              theme="active"
            >
              Save Changes
            </Button>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </ScrollView>
  );
}

// Helper component for displaying profile fields
const ProfileField = ({ 
  label, 
  value, 
  secure = false 
}: { 
  label: string;
  value: string;
  secure?: boolean;
}) => (
  <YStack space="$2">
    <Text color="$gray11" fontSize="$3">{label}</Text>
    <Text fontSize="$4">
      {secure ? value.replace(/./g, '•') : value || 'Not set'}
    </Text>
  </YStack>
);

interface Props {
  label: string;
  topic: string;
}

const NotificationSwitch = ({ label, topic }: Props) => (

  <View>
    <XStack alignItems="center" justifyContent="space-between">
      <Switch label={label} topic={topic} size="$4" />
    </XStack>
    <Separator />
  </View>
);