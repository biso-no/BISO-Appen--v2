import {
  View, H1, H3, Button, XStack, Card, Tabs, SizableText,
  Separator, H5, TabsContentProps, YGroup, Label, Input,
  ScrollView, YStack, XGroup
} from 'tamagui';
import { useMedia } from 'tamagui';
import { useAuth } from '@/components/context/auth-provider';
import { router, useRouter } from 'expo-router';
import { updateDocument, signOut, signInWithBI } from '@/lib/appwrite';
import { useEffect, useState, useCallback } from 'react';
import { ExpenseList } from "@/components/tools/expenses/expense-list";
import { Models } from 'react-native-appwrite';
import { MyStack } from '@/components/ui/MyStack';
import * as WebBrowser from 'expo-web-browser';
import { SwitchWithLabel as Switch } from '@/components/subscriber-switch';
import DepartmentSelector from '@/components/SelectDepartments';
import { ProfileCard } from '@/components/profile/profile-card';

WebBrowser.maybeCompleteAuthSession();

type Notifications = {
  newEvents: boolean;
  newPosts: boolean;
  messages: boolean;
  expenses: boolean;
};

export default function ProfileScreen() {
  const isMobile = useMedia().xs;
  const { data, profile, isLoading, updateUserPrefs, updateProfile, isBisoMember } = useAuth();
  const [notifications, setNotifications] = useState<Notifications>({
    newEvents: false,
    newPosts: false,
    messages: false,
    expenses: false,
  });

  const initialDepartments = profile?.department_ids ?? [];
  const [departments, setDepartments] = useState<Models.Document[]>(initialDepartments);
  const [hasProfile, setHasProfile] = useState(false);




  const addDepartment = async (selectedDepartment: Models.Document) => {
    if (!profile) {
      return;
    }
    const newDepartments = [...departments, selectedDepartment];
    setDepartments(newDepartments);
    const response = await updateDocument('user', profile.$id, { departments: newDepartments.map(d => d.$id) });
    if (response) {
      updateProfile(response);
    }
  };

  const removeDepartment = async (selectedDepartment: Models.Document) => {
    if (!profile) {
      return;
    }
    const newDepartments = departments.filter((department) => department.$id !== selectedDepartment.$id);
    setDepartments(newDepartments);
    const response = await updateDocument('user', profile.$id, { departments: newDepartments.map(d => d.$id) });
    if (response) {
      updateProfile(response);
    }
  };

  const handleUpdateDepartment = async (selectedDepartment: Models.Document) => {
    if (!profile) {
      return;
    }
    if (departments.some((department) => department.$id === selectedDepartment.$id)) {
      await removeDepartment(selectedDepartment);
    } else {
      await addDepartment(selectedDepartment);
    }
  };

  useEffect(() => {
    if (profile) {
      setHasProfile(true);
    }
  }, [profile]);

  if (!data) {
    return null;
  }

  const linkIdentity = async () => {
    try {
      const url = signInWithBI();
      if (url instanceof URL) {
        const result = await WebBrowser.openBrowserAsync(url.toString());
        console.log(result);
      } else {
        console.error('Failed to get URL from signInWithBI');
      }
    } catch (error) {
      console.error('Error during linkIdentity', error);
    }
  };

  useEffect(() => {
    console.log('Profile: ', profile);
  }, [profile]);

  if (isLoading) {
    return null;
  }

  return (
    <ScrollView>
      <MyStack flex={1} padding="$4">
        <ProfileCard />
        <Tabs
          defaultValue="tab1"
          orientation="horizontal"
          flexDirection="column"
          flex={1}
          borderRadius="$4"
          borderWidth="$0.25"
          overflow="hidden"
          borderColor="$borderColor"
        >
          <Tabs.List
            separator={<Separator vertical />}
            disablePassBorderRadius="bottom"
            aria-label="Manage your account"
          >
            <Tabs.Tab flex={1} value="tab1">
              <SizableText fontFamily="$body" fontSize="$4" fontWeight="bold">Profile</SizableText>
            </Tabs.Tab>
            <Tabs.Tab flex={1} value="tab2">
              <SizableText fontFamily="$body" fontSize="$4" fontWeight="bold">Expenses</SizableText>
            </Tabs.Tab>
            <Tabs.Tab flex={1} value="tab3">
              <SizableText fontFamily="$body" fontSize="$4" fontWeight="bold">Preferences</SizableText>
            </Tabs.Tab>
          </Tabs.List>
          <Separator />
          <TabsContent value="tab1">
            {!isLoading && profile?.name ? (
              <Profile />
            ) : (
              <NoProfile />
            )}
          </TabsContent>
          <TabsContent value="tab2">
            {isBisoMember ? (
            <MyStack space="$4" padding="$4">
              <XGroup space="$4" alignItems="center" justifyContent="center" width="100%">
                <Button onPress={() => router.push("/explore/expenses/create")}>Create new expense</Button>
                <Button onPress={() => router.push("/explore/expenses")} chromeless>View all</Button>
              </XGroup>
              <ExpenseList withFilters={false} profileScreen />
            </MyStack>
            ) : (
              <MyStack space="$4" padding="$4">
                <H3>You must be a BISO member to submit expenses</H3>
              </MyStack>
            )}
          </TabsContent>
          <TabsContent value="tab3">
            <MyStack space="$4" padding="$4" alignItems="center">
              <H3>Notifications</H3>
              <YStack space="$4" width="100%">
                <NotificationSwitch label="New events" topic="events" />
                <NotificationSwitch label="New posts" topic="posts" />
                <NotificationSwitch label="New messages" topic="messages" />
                <NotificationSwitch label="New expense details" topic="expenses" />
              </YStack>
              <Separator />
              <H3>Departments</H3>
              <YStack space="$2" width="100%">
                <DepartmentSelector
                  campus={profile?.campus_id}
                  onSelect={handleUpdateDepartment}
                  selectedDepartments={departments}
                  multiSelect
                />
              </YStack>
            </MyStack>
          </TabsContent>
        </Tabs>
      </MyStack>
    </ScrollView>
  );
}


const TabsContent = (props: TabsContentProps) => (
  <Tabs.Content
    backgroundColor="$background"
    padding="$4"
    flex={1}
    borderColor="$background"
    borderRadius="$2"
    borderTopLeftRadius={0}
    borderTopRightRadius={0}
    borderWidth="$2"
    {...props}
  >
    {props.children}
  </Tabs.Content>
);




const EditProfileDetails = ({ setIsEditing }: { setIsEditing: (value: boolean) => void }) => {

  const { profile } = useAuth();

  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [zip, setZip] = useState(profile?.zip ?? '');
  const [bankAccount, setBankAccount] = useState(profile?.bank_account ?? '');

  const handleSubmit = async () => {
    if (!profile?.$id) {
      return;
    }

    const updatedProfile = {
      phone,
      address,
      city,
      zip,
      bank_account: bankAccount,
    };

    try {
      await updateDocument('user', profile.$id, updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  return (
    <ScrollView automaticallyAdjustsScrollIndicatorInsets width="100%" contentContainerStyle={{ flexGrow: 1 }}>
      <MyStack space="$2" width="100%">
        <YGroup width="100%">
          <Label>Phone</Label>
          <Input
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType='phone-pad'
            width="100%"
          />
        <YGroup.Item>
          <Label>Address</Label>
          <Input
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            width="100%"
          />
        </YGroup.Item>
        <YGroup.Item>
          <Label>City</Label>
          <Input
            placeholder="City"
            value={city}
            onChangeText={setCity}
            width="100%"
          />
        </YGroup.Item>
        <YGroup.Item>
          <Label>Zip Code</Label>
          <Input
            placeholder="Zip Code"
            value={zip}
            onChangeText={setZip}
            keyboardType='number-pad'
            width="100%"
          />
        </YGroup.Item>
        <YGroup.Item>
          <Label>Bank Account</Label>
          <Input
            placeholder="Bank Account"
            value={bankAccount}
            onChangeText={setBankAccount}
            keyboardType='number-pad'
            width="100%"
          />
        </YGroup.Item>
        </YGroup>
        <Button marginTop="$2" onPress={handleSubmit}>Submit</Button>
      </MyStack>
    </ScrollView>
  );
};

interface ProfileDetails {
  phone: string;
  address: string;
  city: string;
  zip: string;
  bank_account: string;
}

const ViewProfileDetails = ({ setIsEditing }: { setIsEditing: (value: boolean) => void }) => {
  const { refetchUser, profile } = useAuth();

  const [profileDetails, setProfileDetails] = useState<ProfileDetails>({
    phone: profile?.phone ?? '',
    address: profile?.address ?? '',
    city: profile?.city ?? '',
    zip: profile?.zip ?? '',
    bank_account: profile?.bank_account ?? '',
  });

  const handleLogout = async () => {
    await signOut(refetchUser);
    router.replace('/');
  };

  useEffect(() => {
    if (profile) {
      setProfileDetails({
        phone: profile?.phone ?? '',
        address: profile?.address ?? '',
        city: profile?.city ?? '',
        zip: profile?.zip ?? '',
        bank_account: profile?.bank_account ?? '',
      });
    }
  }, [profile]);
  return (
    <MyStack alignItems='stretch' space="$4">
      <XStack justifyContent="center" space="$4" marginTop="$4">
        <Button size="$4" onPress={() => setIsEditing(true)}>Edit Profile</Button>
        <Button size="$4" variant="outlined" onPress={handleLogout}>Sign Out</Button>
      </XStack>
      <SizableText fontSize="$6">Phone: {profileDetails?.phone}</SizableText>
      <Separator />
      <SizableText fontSize="$6">Address: {profileDetails?.address}</SizableText>
      <Separator />
      <SizableText fontSize="$6">City: {profileDetails?.city}</SizableText>
      <Separator />
      <SizableText fontSize="$6">Zip Code: {profileDetails?.zip}</SizableText>
      <Separator />
      <SizableText fontSize="$6">Bank Account: {profileDetails?.bank_account}</SizableText>
    </MyStack>
  );
};

function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {isEditing ? (
        <EditProfileDetails setIsEditing={setIsEditing} />
      ) : (
        <ViewProfileDetails setIsEditing={setIsEditing} />
      )}
    </View>
  );
};

function NoProfile() {

  const { data } = useAuth();
  const router = useRouter();

  return (
    <MyStack space="$4" padding="$4" alignItems="center" justifyContent="center">
      <H5 fontSize="$7">No Profile Found</H5>
      <SizableText fontSize="$6" textAlign="center">
        It looks like you haven't set up your profile yet. Click the button below to start the onboarding process and set up your profile.
      </SizableText>
      <Button onPress={() => {
          router.navigate('/onboarding');
        }}>Go to Onboarding</Button>
    </MyStack>
  );
};

interface Props {
  label: string;
  topic: string;
}

const NotificationSwitch = ({ label, topic }: Props) => (

  <>
    <XStack alignItems="center" justifyContent="space-between">
      <Switch label={label} topic={topic} size="$4" />
    </XStack>
    <Separator />
  </>
);
