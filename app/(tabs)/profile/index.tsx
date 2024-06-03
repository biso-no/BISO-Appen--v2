import { View, H1, H2, H3, Text, Button, XStack, Card, Avatar, Tabs, Accordion, SizableText, Separator, H5, TabsContentProps, Switch, YGroup, Label, Input, ScrollView, YStack } from 'tamagui';
import { FormCard, Hide } from '@/components/auth/layout'
import { useMedia } from 'tamagui'
import { useAuth } from '@/components/context/auth-provider'
import { useRouter } from 'expo-router'
import { FileUpload } from '@/lib/file-upload'
import { getUserAvatar, updateDocument, updatePhoneNumber } from '@/lib/appwrite'
import { useEffect, useRef, useState } from 'react'
import { ExpenseList } from "@/components/tools/expenses/expense-list";
import { Models } from 'react-native-appwrite';
import { MyStack } from '@/components/ui/MyStack';

export default function ProfileScreen() {
  const isMobile = useMedia().xs

  const { data, profile, isLoading } = useAuth()

  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  
  const avatarId = profile?.avatar

  const avatar = getUserAvatar(avatarId)

  return (
    <MyStack flex={1} padding="$4">
      <Card padding="$4" borderRadius="$3" marginBottom="$4">
        <YStack alignItems="center">
          <Avatar circular size={isMobile ? 100 : 150}>
            <Avatar.Image src={avatar.toString()} />
            <Avatar.Fallback backgroundColor="$blue10" />
          </Avatar>
          <H1 size="$8" marginTop="$2" color="$color11">{data?.name}</H1>
          <Text color="$color10" fontSize="$6">{data?.email}</Text>
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
            <SizableText fontFamily="$body" fontSize="$4" fontWeight={"bold"} color={""}>Profile</SizableText>
          </Tabs.Tab>
          <Tabs.Tab flex={1} value="tab2">
            <SizableText fontFamily="$body" fontSize="$4" fontWeight={"bold"}>Expenses</SizableText>
          </Tabs.Tab>
          <Tabs.Tab flex={1} value="tab3">
            <SizableText fontFamily="$body" fontSize="$4" fontWeight={"bold"}>Preferences</SizableText>
          </Tabs.Tab>
        </Tabs.List>
        <Separator />
        <TabsContent 
        value="tab1"
        backgroundColor={"$background"}
        >
          {profile ? <Profile profile={profile} user={data} /> : <NoProfile data={data}/>}
        </TabsContent>

        <TabsContent value="tab2">
          <ExpenseList />
        </TabsContent>

        <TabsContent value="tab3">
          <H5 fontSize="$7">Notifications</H5>
        </TabsContent>
      </Tabs>
    </MyStack>
  );
};

const TabsContent = (props: TabsContentProps) => {
  return (
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
  )
}

const EditProfileDetails = ({ profile, setIsEditing }: { profile: Models.Document | null, setIsEditing: (value: boolean) => void }) => {

  const [name, setName] = useState(profile?.name ?? '')
  const [email, setEmail] = useState(profile?.email ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [address, setAddress] = useState(profile?.address ?? '')
  const [city, setCity] = useState(profile?.city ?? '')
  const [zipCode, setZipCode] = useState(profile?.zipCode ?? '')
  const [bankAccount, setBankAccount] = useState(profile?.bankAccount ?? '')

  const handleSubmit = async () => {

    if (!profile?.$id) {
      return
    }

    if (phone !== profile?.phone) {
      await updatePhoneNumber(profile.$id, phone)
    }

    await updateDocument('users', profile.$id, {
      name,
      email,
      address,
      city,
      zip: zipCode,
      bank_account: bankAccount
    })
    setIsEditing(false)
  }

  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const addressInputRef = useRef(null);
  const cityInputRef = useRef(null);
  const zipCodeInputRef = useRef(null);
  const bankAccountInputRef = useRef(null);

  return (
    <ScrollView automaticallyAdjustsScrollIndicatorInsets width={"100%"}>
      <FormCard>
        <MyStack space="$4" padding="$4" width={'100%'}>

          <YGroup width="100%">
            <Label>Name</Label>
            <Input
              placeholder="Name"
              value={name}
              onChange={setName}
              ref={nameInputRef}
              onSubmitEditing={() => (emailInputRef.current as any)?.focus()}
              returnKeyType="next"
              width="100%"
            />
          </YGroup>
          <YGroup width="100%">
            <Label>Email</Label>
            <Input
              placeholder="Email"
              value={email}
              onChange={setEmail}
              ref={emailInputRef}
              onSubmitEditing={() => (phoneInputRef.current as any)?.focus()}
              returnKeyType="next"
              keyboardType='email-address'
              width="100%"
            />
          </YGroup>
          <YGroup width="100%">
            <Label>Phone</Label>
            <Input
              placeholder="Phone"
              value={phone}
              onChange={setPhone}
              ref={phoneInputRef}
              onSubmitEditing={() => (addressInputRef.current as any)?.focus()}
              returnKeyType="next"
              keyboardType='phone-pad'
              width="100%"
            />
          </YGroup>
          <YGroup width="100%">
            <Label>Address</Label>
            <Input
              placeholder="Address"
              value={address}
              onChange={setAddress}
              ref={addressInputRef}
              onSubmitEditing={() => (cityInputRef.current as any)?.focus()}
              returnKeyType="next"
              width="100%"
            />
          </YGroup>
          <YGroup width="100%">
            <Label>City</Label>
            <Input
              placeholder="City"
              value={city}
              onChange={setCity}
              ref={cityInputRef}
              onSubmitEditing={() => (zipCodeInputRef.current as any)?.focus()}
              returnKeyType="next"
              width="100%"
            />
          </YGroup>
          <YGroup width="100%">
            <Label>Zip Code</Label>
            <Input
              placeholder="Zip Code"
              value={zipCode}
              onChange={setZipCode}
              ref={zipCodeInputRef}
              onSubmitEditing={() => (bankAccountInputRef.current as any)?.focus()}
              returnKeyType="next"
              keyboardType='number-pad'
              width="100%"
            />
          </YGroup>
          <YGroup width="100%">
            <Label>Bank Account</Label>
            <Input
              placeholder="Bank Account"
              value={bankAccount}
              onChange={setBankAccount}
              ref={bankAccountInputRef}
              keyboardType='number-pad'
              width="100%"
            />
          </YGroup>
          <Button onPress={handleSubmit}>Submit</Button>
        </MyStack>
      </FormCard>
    </ScrollView>
  )
}

const ViewProfileDetails = ({ profile, user, setIsEditing }: { profile: Models.Document | null, user: Models.User<Models.Preferences> | null, setIsEditing: (value: boolean) => void }) => {

  return (
    <FormCard>
      <MyStack
        alignItems='stretch'
        gap="$4"
      >
        <XStack justifyContent="center" space="$4" marginTop="$4">
          <Button size="$4" onPress={() => setIsEditing(true)}>Edit Profile</Button>
          <Button size="$4" variant="outlined" onPress={() => { }}>Log Out</Button>
        </XStack>
        <Text fontSize="$6">Name: {profile?.name}</Text>
        <Text fontSize="$6">Email: {profile?.email}</Text>
        <Text fontSize="$6">Phone: {user?.phone}</Text>
        <Text fontSize="$6">Address: {profile?.address}</Text>
        <Text fontSize="$6">City: {profile?.city}</Text>
        <Text fontSize="$6">Zip Code: {profile?.zipCode}</Text>
        <Text fontSize="$6">Bank Account: {profile?.bankAccount}</Text>
      </MyStack>
    </FormCard>
  )
}

function Profile({ profile, user }: { profile: Models.Document | null, user: Models.User<Models.Preferences> | null }) {

  const [isEditing, setIsEditing] = useState(false)

  return (
    <View>
      {isEditing ? (
        <EditProfileDetails profile={profile} setIsEditing={setIsEditing} />
      ) : (
        <ViewProfileDetails profile={profile} user={user} setIsEditing={setIsEditing} />
      )}
    </View>
  )
}

const NoProfile = ({ data }: { data: Models.User<Models.Preferences> | null }) => {
  const router = useRouter();

  return (
    <MyStack space="$4" padding="$4" alignItems="center" justifyContent="center">
      <H5 fontSize="$7">No Profile Found</H5>
      <Text fontSize="$6" textAlign="center">
        It looks like you haven't set up your profile yet. Click the button below to start the onboarding process and set up your profile.
      </Text>
      <Button onPress={() => {
        if (data?.name) {
          router.navigate('/onboarding/?initialStep=2');
        }
        else {
          router.navigate('/onboarding/');
        }
      }}>Go to Onboarding</Button>
    </MyStack>
  );
}