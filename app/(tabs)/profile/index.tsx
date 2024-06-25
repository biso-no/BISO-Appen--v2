import { View, H1, H3, Button, XStack, Card, Tabs, SizableText, Separator, H5, TabsContentProps, YGroup, Label, Input, ScrollView, YStack, XGroup } from 'tamagui';
import { useMedia } from 'tamagui'
import { useAuth } from '@/components/context/auth-provider'
import { router, useRouter } from 'expo-router'
import { getUserAvatar, updateDocument, signOut, signInWithBI } from '@/lib/appwrite'
import { useState } from 'react'
import { ExpenseList } from "@/components/tools/expenses/expense-list";
import { Models } from 'react-native-appwrite';
import { MyStack } from '@/components/ui/MyStack';
import * as WebBrowser from 'expo-web-browser';
import { SwitchWithLabel as Switch } from '@/components/subscriber-switch';
import { CreateExpenseCard } from '@/components/tools/expenses/expense-list';
import { ImagePopover } from '@/components/image-popover';

type Notifications = {
  newEvents: boolean;
  newPosts: boolean;
  messages: boolean;
  expenses: boolean;
};

type Department = string;

export default function ProfileScreen() {
  const isMobile = useMedia().xs;
  const { data, profile: initialProfile, isLoading } = useAuth();
  const [profile, setProfile] = useState(initialProfile);
  const [notifications, setNotifications] = useState<Notifications>({
    newEvents: false,
    newPosts: false,
    messages: false,
    expenses: false,
  });
  const [departments, setDepartments] = useState<Department[]>([]);




  const updateProfile = (newProfile: any) => {
    setProfile(newProfile);
  };

  console.log(profile);

  const updateDepartments = (department: Department) => {
    setDepartments((prev) => {
      if (prev.includes(department)) {
        return prev.filter((dep) => dep !== department);
      } else {
        return [...prev, department];
      }
    });
  };

  if (!data) {
    return null;
  }

  const linkIdentity = async () => {
    try {
      // First run signInWithBI. This returns a URL to trigger the OAuth flow.
      // Then we need to redirect the user to that URL for the OAuth flow.
      // The OAuth flow will redirect the user back to the app.
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



  return (
    <ScrollView>
      <MyStack flex={1} padding="$4">
        <Card padding="$4" borderRadius="$3" marginBottom="$4">
          <YStack alignItems="center">
            <ImagePopover />
            <H1 size="$8" marginTop="$2" color="$color11">{data?.name}</H1>
            <SizableText color="$color10" fontSize="$6">{data?.email}</SizableText>
            <Button onPress={() => linkIdentity()}>Sign in with BI</Button>
          </YStack>
        </Card>

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
          <TabsContent value="tab1" backgroundColor="$background">
            {profile ? <Profile profile={profile} user={data} updateProfile={updateProfile} /> : <NoProfile data={data} />}
          </TabsContent>

          <TabsContent value="tab2">
          <XGroup space="$4" flex={1} alignItems="center" justifyContent="center" width="100%">
                <Button onPress={() => router.push("/expenses/create")}>Create new expense</Button>
                <Button onPress={() => router.push("/expenses")} chromeless>View all</Button>
                </XGroup>
            <ExpenseList withFilters={false} />
          </TabsContent>

          <TabsContent value="tab3">
            <MyStack space="$4" padding="$4" alignItems="center" justifyContent="center">
              <H3>Notifications</H3>
                <XStack alignItems="center" justifyContent="space-between">
                  <Switch label='New events' topic='events' size="$4" />
                </XStack>
                <Separator />
                <XStack alignItems="center" justifyContent="space-between">
                  <Switch label='New posts' topic='posts' size="$4" />
                </XStack>
                <Separator />
                <XStack alignItems="center" justifyContent="space-between">
                  <Switch label='New messages' topic='messages' size="$4" />
                </XStack>
                <Separator />
                <XStack alignItems="center" justifyContent="space-between">
                  <Switch label='New expenses' topic='expenses' size="$4" />
                </XStack>
              <Separator />
              <H3>Departments</H3>
              <YStack space="$2">
                {/* Replace with actual departments list */}
                {['Marketing', 'Sales', 'Engineering', 'HR'].map((department) => (
                  <XStack alignItems="center" justifyContent="space-between" key={department}>
                    <Switch label={department} topic={department} size="$4" />
                  </XStack>
                ))}
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
    key="tab3"
    padding="$4"
    alignItems="flex-start"
    justifyContent="flex-start"
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

const EditProfileDetails = ({ profile, setIsEditing, updateProfile }: { profile: Models.Document | null, setIsEditing: (value: boolean) => void, updateProfile: (newProfile: Models.Document) => void }) => {
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [zipCode, setZipCode] = useState(profile?.zipCode ?? '');
  const [bankAccount, setBankAccount] = useState(profile?.bankAccount ?? '');

  const handleSubmit = async () => {
    if (!profile?.$id) {
      return;
    }

    const updatedProfile = {
      ...profile,
      phone,
      address,
      city,
      zipCode,
      bankAccount
    };

    try {
      await updateDocument('user', profile.$id, updatedProfile);
      updateProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  return (
    <ScrollView automaticallyAdjustsScrollIndicatorInsets width={"100%"} contentContainerStyle={{ flexGrow: 1 }}>
      <MyStack space="$4" padding="$4" width={'100%'}>
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
            value={zipCode}
            onChangeText={setZipCode}
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
        <Button onPress={handleSubmit}>Submit</Button>
      </MyStack>
    </ScrollView>
  );
};

const ViewProfileDetails = ({ profile, user, setIsEditing }: { profile: Models.Document | null, user: Models.User<Models.Preferences> | null, setIsEditing: (value: boolean) => void }) => {

  const { refetchUser } = useAuth()

  const handleLogout = async () => {
    await signOut(refetchUser);
    router.replace('/');
  };

  return (
  <MyStack alignItems='stretch' gap="$4">
    <XStack justifyContent="center" space="$4" marginTop="$4">
      <Button size="$4" onPress={() => setIsEditing(true)}>Edit Profile</Button>
      <Button size="$4" variant="outlined" onPress={() => handleLogout()}>Sign Out</Button>
    </XStack>
    <SizableText fontSize="$6">Phone: {profile?.phone}</SizableText>
    <SizableText fontSize="$6">Address: {profile?.address}</SizableText>
    <SizableText fontSize="$6">City: {profile?.city}</SizableText>
    <SizableText fontSize="$6">Zip Code: {profile?.zip}</SizableText>
    <SizableText fontSize="$6">Bank Account: {profile?.bank_account}</SizableText>
  </MyStack>
)}

const Profile = ({ profile, user, updateProfile }: { profile: Models.Document | null, user: Models.User<Models.Preferences> | null, updateProfile: (newProfile: Models.Document) => void }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {isEditing ? (
        <EditProfileDetails profile={profile} setIsEditing={setIsEditing} updateProfile={updateProfile} />
      ) : (
        <ViewProfileDetails profile={profile} user={user} setIsEditing={setIsEditing} />
      )}
    </View>
  );
};

const NoProfile = ({ data }: { data: Models.User<Models.Preferences> | null }) => {
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