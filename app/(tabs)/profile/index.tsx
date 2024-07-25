import {
  View, H1, H3, Button, XStack, Card, Tabs, SizableText,
  Separator, H5, TabsContentProps, YGroup, Label, Input,
  ScrollView, YStack, XGroup
} from 'tamagui';
import { useMedia } from 'tamagui';
import { useAuth } from '@/components/context/auth-provider';
import { router, useRouter } from 'expo-router';
import { getUserAvatar, updateDocument, signOut, signInWithBI, updateUserPreferences } from '@/lib/appwrite';
import { useState } from 'react';
import { ExpenseList } from "@/components/tools/expenses/expense-list";
import { Models } from 'react-native-appwrite';
import { MyStack } from '@/components/ui/MyStack';
import * as WebBrowser from 'expo-web-browser';
import { SwitchWithLabel as Switch } from '@/components/subscriber-switch';
import { CreateExpenseCard } from '@/components/tools/expenses/expense-list';
import { ImagePopover } from '@/components/image-popover';
import DepartmentSelector from '@/components/SelectDepartments';
import { BILoginButton } from '@/components/bi-login-button';
import { ProfileCard } from '@/components/profile/profile-card';
import { ParallaxScrollView } from '@/components/ParallaxScrollView';

type Notifications = {
  newEvents: boolean;
  newPosts: boolean;
  messages: boolean;
  expenses: boolean;
};

type Department = string;

export default function ProfileScreen() {
  const isMobile = useMedia().xs;
  const { data, profile: initialProfile, isLoading, updateUserPrefs } = useAuth();
  const [profile, setProfile] = useState(initialProfile);
  const [notifications, setNotifications] = useState<Notifications>({
    newEvents: false,
    newPosts: false,
    messages: false,
    expenses: false,
  });


  const initialDepartments = initialProfile?.departments ?? [];

  const [departments, setDepartments] = useState<Models.Document[]>(initialDepartments);

  const updateProfile = (newProfile: any) => {
    setProfile(newProfile);
  };

  const addDepartment = async (selectedDepartment: Models.Document) => {
    if (!profile) {
      return;
    }
    const newDepartments = [...departments, selectedDepartment];
    setDepartments(newDepartments);
    const response = await updateDocument('user', profile.$id, { departments: newDepartments.map(d => d.$id) });
    if (response) {
      setProfile(response);
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
      setProfile(response);
    }
  };


  const handleUpdateDepartment = async (selectedDepartment: Models.Document) => {
    if (!profile) {
      return;
    }
    //If the selected department is already in the list, remove it
    if (departments.some((department) => department.$id === selectedDepartment.$id)) {
      await removeDepartment(selectedDepartment);
    } else {
      await addDepartment(selectedDepartment);
    }
  };

  if (!data) {
    return null;
  }

  const linkIdentity = async () => {
    try {
      const url = signInWithBI();  // Make sure this is properly calling your cloud function
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
            {profile ? (
              <Profile />
            ) : (
              <NoProfile />
            )}
          </TabsContent>

          <TabsContent value="tab2">
            <MyStack space="$4" padding="$4">
              <XGroup space="$4" alignItems="center" justifyContent="center" width="100%">
                <Button onPress={() => router.push("/expenses/create")}>Create new expense</Button>
                <Button onPress={() => router.push("/expenses")} chromeless>View all</Button>
              </XGroup>
              <ExpenseList withFilters={false} />
            </MyStack>
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
                  campus={data.prefs.campus}
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
      <MyStack space="$4" padding="$4" width="100%">
        <YGroup width="100%">
          <Label>Phone</Label>
          <Input
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType='phone-pad'
            width="100%"
          />
        </YGroup>
        <YGroup width="100%">
          <Label>Address</Label>
          <Input
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            width="100%"
          />
        </YGroup>
        <YGroup width="100%">
          <Label>City</Label>
          <Input
            placeholder="City"
            value={city}
            onChangeText={setCity}
            width="100%"
          />
        </YGroup>
        <YGroup width="100%">
          <Label>Zip Code</Label>
          <Input
            placeholder="Zip Code"
            value={zip}
            onChangeText={setZip}
            keyboardType='number-pad'
            width="100%"
          />
        </YGroup>
        <YGroup width="100%">
          <Label>Bank Account</Label>
          <Input
            placeholder="Bank Account"
            value={bankAccount}
            onChangeText={setBankAccount}
            keyboardType='number-pad'
            width="100%"
          />
        </YGroup>
        <Button marginTop="$2" onPress={handleSubmit}>Submit</Button>
      </MyStack>
    </ScrollView>
  );
};

const ViewProfileDetails = ({ setIsEditing }: { setIsEditing: (value: boolean) => void }) => {
  const { refetchUser, profile } = useAuth();

  const handleLogout = async () => {
    await signOut(refetchUser);
    router.replace('/');
  };

  return (
    <MyStack alignItems='stretch' gap="$4">
      <XStack justifyContent="center" space="$4" marginTop="$4">
        <Button size="$4" onPress={() => setIsEditing(true)}>Edit Profile</Button>
        <Button size="$4" variant="outlined" onPress={handleLogout}>Sign Out</Button>
      </XStack>
      <SizableText fontSize="$6">Phone: {profile?.phone}</SizableText>
      <SizableText fontSize="$6">Address: {profile?.address}</SizableText>
      <SizableText fontSize="$6">City: {profile?.city}</SizableText>
      <SizableText fontSize="$6">Zip Code: {profile?.zip}</SizableText>
      <SizableText fontSize="$6">Bank Account: {profile?.bank_account}</SizableText>
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
        if (data?.name) {
          router.navigate('/onboarding/?initialStep=2');
        } else {
          router.navigate('/onboarding/');
        }
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
