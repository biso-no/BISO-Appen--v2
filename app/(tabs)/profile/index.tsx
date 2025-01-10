import { useState, useEffect } from 'react';
import {
  YStack, Avatar, Card, H2, H4, Text, Input, Separator,
  Label, YGroup, Switch, Button, XStack, useTheme, View, Sheet, ScrollView,
  SizableText, RadioGroup
} from 'tamagui';
import { 
  LogOut, ArrowLeft, User, Settings, 
  CreditCard, Bell 
} from '@tamagui/lucide-icons';
import { MotiView, AnimatePresence } from 'moti';
import { useAuth } from '@/components/context/auth-provider';
import { useRouter } from 'expo-router';
import { updateDocument, signOut, databases, triggerFunction } from '@/lib/appwrite';
import { ExpenseList } from '@/components/tools/expenses/expense-list';
import DepartmentSelector from '@/components/SelectDepartments';
import { Models, Query } from 'react-native-appwrite';
import { Alert, useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BILoginButton } from '@/components/bi-login-button';
import { ImagePopover } from '@/components/image-popover';
import { usePathname } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

// Type definitions
type ProfileSection = 'menu' | 'personal' | 'departments' | 'notifications' | 'payment' | 'expenses' | 'preferences';

const paymentMethods = [
  { label: 'Credit Card', value: 'CARD', size: '$5' },
  { label: 'Vipps MobilePay', value: 'WALLET', size: '$5' },
];

const ProfileScreen = () => {
  const { profile, isLoading, data, isBisoMember, refetchUser, studentId, membership } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const pathName = usePathname();
  
  // Profile States
  const [currentSection, setCurrentSection] = useState<ProfileSection>('menu');
  const [bankType, setBankType] = useState<'norwegian' | 'international'>('norwegian');
  const [isEditing, setIsEditing] = useState(false);
  const [followedDepartments, setFollowedDepartments] = useState<Models.Document[]>([]);
  const [profileDetails, setProfileDetails] = useState({
    phone: profile?.phone ?? '',
    address: profile?.address ?? '',
    city: profile?.city ?? '',
    zip: profile?.zip ?? '',
    bank_account: profile?.bank_account ?? ''
  });

  // Payment States
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    bank_account: profile?.bank_account ?? '',
    swift: profile?.swift ?? '',
  });

  // Membership States
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<Models.Document>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [membershipOptions, setMembershipOptions] = useState<Models.DocumentList<Models.Document>>();
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipError, setMembershipError] = useState<string | null>(null);
  
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Fetch followed departments
  useEffect(() => {
    const fetchFollowedDepartments = async () => {
      if (!profile?.$id) return;
      
      try {
        const response = await databases.listDocuments('app', 'followed_units', [
          Query.equal('user_id', profile.$id),
        ]);
        
        if (response.documents.length > 0) {
          const departmentIds = response.documents[0].department_ids || [];
          
          const departmentsResponse = await databases.listDocuments('app', 'departments', [
            Query.equal('$id', departmentIds),
          ]);
          
          setFollowedDepartments(departmentsResponse.documents);
        }
      } catch (error) {
        console.error('Error fetching followed departments:', error);
      }
    };

    fetchFollowedDepartments();
  }, [profile?.$id]);

  // Load membership options
  useEffect(() => {
    if (data?.$id && isMembershipOpen) {
      const fetchMemberships = async () => {
        try {
          const response = await databases.listDocuments('app', 'memberships', [
            Query.select(['membership_id', 'price', 'name', '$id']),
          ]);
          setMembershipOptions(response);
        } catch (error) {
          console.error("Error fetching memberships:", error);
          setMembershipError("Failed to load membership options. Please try again later.");
        }
      };
      fetchMemberships();
    }
  }, [data?.$id, isMembershipOpen]);

  // Close membership sheet if user becomes a member
  useEffect(() => {
    if (isBisoMember === true) {
      setIsMembershipOpen(false);
    }
  }, [isBisoMember]);

  // Handlers
  const handleDepartmentSelect = async (department: Models.Document) => {
    if (!profile?.$id) return;

    const isSelected = followedDepartments.some(d => d.$id === department.$id);
    let updatedDepartments: Models.Document[];

    if (isSelected) {
      updatedDepartments = followedDepartments.filter(d => d.$id !== department.$id);
    } else {
      updatedDepartments = [...followedDepartments, department];
    }

    setFollowedDepartments(updatedDepartments);

    try {
      const existingDoc = await databases.listDocuments('app', 'followed_units', [
        Query.equal('user_id', profile.$id),
      ]);

      if (existingDoc.documents.length > 0) {
        await databases.updateDocument('app', 'followed_units', existingDoc.documents[0].$id, {
          department_ids: updatedDepartments.map(d => d.$id),
        });
      } else {
        await databases.createDocument('app', 'followed_units', profile.$id, {
          user_id: profile.$id,
          department_ids: updatedDepartments.map(d => d.$id),
        });
      }
    } catch (error) {
      console.error('Error updating followed departments:', error);
      setFollowedDepartments(followedDepartments);
    }
  };

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

  const validatePaymentDetails = (details: typeof paymentDetails) => {
    if (bankType === 'norwegian') {
      return details.bank_account.replace(/\s/g, '').length === 11;
    } else {
      return details.bank_account.length >= 15 && details.swift.length >= 8;
    }
  };

  const handleUpdatePayment = async (updates: Partial<typeof paymentDetails>) => {
    if (!profile?.$id) return;
    
    if (!validatePaymentDetails(updates as typeof paymentDetails)) {
      Alert.alert('Invalid Details', 'Please check your payment information');
      return;
    }
  
    try {
      await updateDocument('user', profile.$id, updates);
      setPaymentDetails(prev => ({ ...prev, ...updates }));
      setIsEditingPayment(false);
    } catch (error) {
      console.error('Error updating payment details:', error);
      Alert.alert('Error', 'Failed to update payment details');
    }
  };

  const initiatePurchase = async () => {
    if (!selectedMembership) {
      setMembershipError("Please select a membership.");
      return;
    }

    if (!selectedPaymentMethod) {
      setMembershipError("Please select a payment method.");
      return;
    }

    setMembershipLoading(true);
    setMembershipError(null);

    const body = {
      amount: selectedMembership.price,
      description: selectedMembership.name,
      returnUrl: 'biso://' + pathName,
      membershipId: selectedMembership.$id,
      membershipName: selectedMembership.name,
      paymentMethod: selectedPaymentMethod,
    };

    try {
      const execution = await triggerFunction({
        functionId: 'vipps_checkout',
        data: JSON.stringify(body),
        async: false,
      });

      if (execution.responseBody) {
        const responseBody = JSON.parse(execution.responseBody) as {
          checkout: {
            ok: boolean;
            data: {
              redirectUrl: string;
              reference: string;
            };
          };
        };
        
        const url = responseBody.checkout.data.redirectUrl;
        const result = await WebBrowser.openAuthSessionAsync(url, '/profile');
        
        if (result.type === 'success') {
          console.log("Purchase successful");
          setIsMembershipOpen(false);
        } else {
          setMembershipError("Purchase was not completed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error during purchase initiation:", error);
      setMembershipError("An error occurred while processing your purchase. Please try again.");
    } finally {
      setMembershipLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(refetchUser);
    router.replace('/(tabs)');
  };

  // Helper Components
  const AnimatedContent = ({ children }: { children: React.ReactNode }) => (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'timing', duration: 300 }}
      style={{ flex: 1 }}
    >
      {children}
    </MotiView>
  );

  const getMembershipColor = () => {
    if (!membership) return '$gray9';
    switch (membership.category.toLowerCase()) {
      case 'gold':
        return '#FFD700';
      case 'silver':
        return '#C0C0C0';
      case 'bronze':
        return '#CD7F32';
      default:
        return '$blue9';
    }
  };

  const formatExpiryDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  function RadioGroupItemWithLabel({ size, value, label }: { size: string; value: string; label: string }) {
    const id = `radiogroup-${value}`;
    return (
      <XStack width={300} alignItems="center" space="$4">
        <RadioGroup.Item value={value} id={id} size={size}>
          <RadioGroup.Indicator />
        </RadioGroup.Item>
        <Label size={size} htmlFor={id}>
          {label}
        </Label>
      </XStack>
    );
  }

  const ProfileSection = ({ 
    title, 
    children, 
    onBack 
  }: { 
    title: string; 
    children: React.ReactNode;
    onBack?: () => void;
  }) => (
    <Card 
      padding="$4" 
      borderRadius="$4" 
      backgroundColor="$background"
      elevation={2}
      minHeight={400}
    >
      <XStack alignItems="center" marginBottom="$4">
        {onBack && (
          <Button 
            icon={ArrowLeft} 
            variant="outlined" 
            marginRight="$3" 
            onPress={onBack}
          />
        )}
        <H4>{title}</H4>
      </XStack>
      <Separator marginBottom="$4" />
      {children}
    </Card>
  );

  const ProfileField = ({ 
    label, 
    value, 
    secure = false 
  }: { 
    label: string;
    value: string;
    secure?: boolean;
  }) => (
    <YStack gap="$2">
      <Text color="$gray11" fontSize="$3">{label}</Text>
      <Text fontSize="$4">
        {secure ? value.replace(/./g, '•') : value || 'Not set'}
      </Text>
    </YStack>
  );

  const NotificationSwitch = ({ label, topic }: { label: string; topic: string }) => (
    <View>
      <XStack alignItems="center" justifyContent="space-between">
        <Switch label={label} topic={topic} size="$4" />
      </XStack>
      <Separator />
    </View>
  );

  // Content Renderer
  const renderContent = () => {
    switch (currentSection) {
      case 'menu':
        return (
          <YStack gap="$3">
            <Button 
              onPress={() => setCurrentSection('personal')}
              theme="blue"
              icon={User}
            >
              Personal Details
            </Button>
            <Button 
              onPress={() => setCurrentSection('payment')}
              theme="purple"
              icon={CreditCard}
            >
              Payment Details
            </Button>
            <Button 
              onPress={() => setCurrentSection('notifications')}
              theme="orange"
              icon={Bell}
            >
              Notification Preferences
            </Button>
            <Button 
              onPress={() => setCurrentSection('preferences')}
              theme="green"
              icon={Settings}
            >
              Clubs & Departments
            </Button>
            {isBisoMember && (
              <Button 
                onPress={() => setCurrentSection('expenses')}
                theme="yellow"
                icon={CreditCard}
              >
                Expenses
              </Button>
            )}
            <Button 
              icon={LogOut} 
              marginTop="$4" 
              theme="red"
              onPress={handleLogout}
            >
              Sign Out
            </Button>
          </YStack>
        );

      case 'personal':
        return (
          <YStack gap="$4">
            <ProfileField label="Name" value={profile?.name || ""} />
            <ProfileField label="Phone" value={profileDetails.phone} />
            <ProfileField label="Address" value={profileDetails.address} />
            <ProfileField label="City" value={profileDetails.city} />
            <ProfileField label="ZIP" value={profileDetails.zip} />
            <Button 
              onPress={() => setIsEditing(true)}
              theme="blue"
            >
              Edit Details
            </Button>
          </YStack>
        );

      case 'payment':
        return (
          <YStack space="$4">
            <YStack space="$2">
              <Label>Account Type</Label>
              <XStack gap="$2">
                <Button
                  flex={1}
                  theme={bankType === 'norwegian' ? 'active' : 'neutral'}
                  onPress={() => setBankType('norwegian')}
                >
                  Norwegian Account
                </Button>
                <Button
                  flex={1}
                  theme={bankType === 'international' ? 'active' : 'neutral'}
                  onPress={() => setBankType('international')}
                >
                  International Account
                </Button>
              </XStack>
            </YStack>

            {bankType === 'norwegian' ? (
              <YStack space="$4">
                <ProfileField 
                  label="Bank Account" 
                  value={paymentDetails.bank_account}
                  secure 
                />
                <Button 
                  onPress={() => setIsEditingPayment(true)}
                  theme="blue"
                >
                  Edit Bank Details
                </Button>
              </YStack>
            ) : (
              <YStack space="$4">
                <ProfileField 
                  label="IBAN" 
                  value={paymentDetails.bank_account}
                  secure 
                />
                <ProfileField 
                  label="SWIFT/BIC" 
                  value={paymentDetails.swift}
                  secure 
                />
                <Button 
                  onPress={() => setIsEditingPayment(true)}
                  theme="blue"
                >
                  Edit Bank Details
                </Button>
              </YStack>
            )}
          </YStack>
        );

      case 'notifications':
        return (
          <YStack gap="$4">
            <NotificationSwitch label="New Events" topic="events" />
            <NotificationSwitch label="New Posts" topic="posts" />
            <NotificationSwitch label="Messages" topic="messages" />
            <NotificationSwitch label="Expense Updates" topic="expenses" />
          </YStack>
        );

      case 'preferences':
        return (
          <YStack gap="$4">
            <H4>Department Settings</H4>
            <DepartmentSelector
              campus={profile?.campus_id}
              onSelect={handleDepartmentSelect}
              selectedDepartments={followedDepartments}
              multiSelect
            />
          </YStack>
        );

      case 'expenses':
        return (
          <YStack gap="$4">
            <ExpenseList withFilters={false} profileScreen />
            <Button 
              onPress={() => router.push("/explore/expenses")}
              variant="outlined"
            >
              View All Expenses
            </Button>
          </YStack>
        );
    }
  };

  // Get section title
  const getSectionTitle = () => {
    switch (currentSection) {
      case 'menu': return 'Profile Options';
      case 'personal': return 'Personal Details';
      case 'payment': return 'Payment Details';
      case 'notifications': return 'Notification Preferences';
      case 'preferences': return 'Clubs & Departments';
      case 'expenses': return 'Recent Expenses';
      default: return 'Profile';
    }
  };

  if (isLoading || !data) return null;

  // Welcome screen for new users
  if (!profile?.name) {
    return (
      <YStack gap="$4" padding="$6" alignItems="center" justifyContent="center">
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

  return (
    <ScrollView backgroundColor="$backgroundStrong" flex={1}>
      {/* Profile Summary Card */}
      <Card 
        padding="$4" 
        borderRadius="$4" 
        alignItems="center" 
        backgroundColor="$background"
        elevation={2}
        marginBottom="$4"
      >
        <ImagePopover />
        <H4>{profile.name}</H4>
        <Text color="$gray10">{profile.email}</Text>
        
        {/* Membership Section */}
        {!studentId ? (
          <BILoginButton />
        ) : membership ? (
          <YStack>
            <Card
              bordered
              borderColor={getMembershipColor()}
              backgroundColor={isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'}
              borderWidth={2}
            >
              <XStack 
                padding="$3" 
                space="$3" 
                alignItems="center" 
                justifyContent="space-between"
              >
                <XStack space="$2" alignItems="center">
                  <MaterialCommunityIcons 
                    name="crown" 
                    size={24} 
                    color={getMembershipColor()} 
                  />
                  <YStack>
                    <SizableText 
                      color={getMembershipColor()}
                      fontWeight="bold"
                      fontSize="$5"
                    >
                      Member - {membership.name}
                    </SizableText>
                    <XStack space="$1" alignItems="center">
                      <MaterialCommunityIcons 
                        name="calendar" 
                        size={14} 
                        color={isDarkMode ? 'white' : 'black'}
                      />
                      <SizableText fontSize="$3" opacity={0.8}>
                        Expires: {formatExpiryDate(membership.expiryDate)}
                      </SizableText>
                    </XStack>
                  </YStack>
                </XStack>
                <Button
                  size="$3"
                  icon={<MaterialCommunityIcons 
                    name="chevron-right" 
                    size={20} 
                    color="white" 
                  />}
                  circular
                  onPress={() => setIsMembershipOpen(true)}
                  backgroundColor={getMembershipColor()}
                  opacity={0.8}
                />
              </XStack>
            </Card>
          </YStack>
        ) : (
          <Button 
            onPress={() => setIsMembershipOpen(true)} 
            variant="outlined"
            icon={<MaterialCommunityIcons 
              name="crown" 
              size={20} 
              color={isDarkMode ? 'white' : 'black'} 
            />}
            backgroundColor={isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'}
            borderColor="$blue8"
          >
            Get BISO Membership
          </Button>
        )}
      </Card>

      {/* Main Content Section */}
      <YStack padding="$4">
        <ProfileSection 
          title={getSectionTitle()} 
          onBack={currentSection !== 'menu' ? () => setCurrentSection('menu') : undefined}
        >
          <AnimatePresence>
            <AnimatedContent key={currentSection}>
              {renderContent()}
            </AnimatedContent>
          </AnimatePresence>
        </ProfileSection>
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
          <YStack gap="$4">
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

      {/* Edit Payment Sheet */}
      <Sheet
        modal
        open={isEditingPayment}
        onOpenChange={setIsEditingPayment}
        snapPoints={[80]}
        dismissOnSnapToBottom
      >
        <Sheet.Frame padding="$4">
          <Sheet.Handle />
          <YStack space="$4">
            <H4>Edit Payment Details</H4>
            {bankType === 'norwegian' ? (
              <YStack space="$4">
                <Label>Norwegian Bank Account</Label>
                <Input
                  value={paymentDetails.bank_account}
                  onChangeText={(text) => setPaymentDetails(prev => ({ 
                    ...prev, 
                    bank_account: text 
                  }))}
                  placeholder="XXXX XX XXXXX"
                  keyboardType="number-pad"
                />
              </YStack>
            ) : (
              <YStack space="$4">
                <Label>IBAN</Label>
                <Input
                  value={paymentDetails.bank_account}
                  onChangeText={(text) => setPaymentDetails(prev => ({ 
                    ...prev, 
                    bank_account: text 
                  }))}
                  placeholder="IBAN"
                  autoCapitalize="characters"
                />
                <Label>SWIFT/BIC</Label>
                <Input
                  value={paymentDetails.swift}
                  onChangeText={(text) => setPaymentDetails(prev => ({ 
                    ...prev, 
                    swift: text 
                  }))}
                  placeholder="SWIFT/BIC"
                  autoCapitalize="characters"
                />
              </YStack>
            )}
            <Button 
              onPress={() => handleUpdatePayment(paymentDetails)}
              theme="active"
            >
              Save Changes
            </Button>
          </YStack>
        </Sheet.Frame>
      </Sheet>

      {/* Membership Sheet */}
      <Sheet
        modal
        open={isMembershipOpen}
        onOpenChange={setIsMembershipOpen}
        snapPoints={[85]}
        dismissOnSnapToBottom
        zIndex={100_000}
        animation="medium"
      >
        <Sheet.Overlay 
          animation="lazy" 
          enterStyle={{ opacity: 0 }} 
          exitStyle={{ opacity: 0 }} 
        />
        <Sheet.Handle />
        <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" space="$5">
          <H2>Select Membership</H2>
          <RadioGroup
            aria-labelledby="Select a membership"
            name="membership"
            onValueChange={(value) => {
              const membership = membershipOptions?.documents?.find(
                (option) => option.membership_id === value
              );
              setSelectedMembership(membership);
            }}
          >
            <YStack width={300} alignItems="center" space="$2">
              {membershipOptions?.documents?.map((option) => {
                const label = `${option.name} - ${option.price} kr`;
                return (
                  <RadioGroupItemWithLabel 
                    key={option.$id} 
                    size="$5" 
                    value={option.membership_id} 
                    label={label} 
                  />
                );
              })}
            </YStack>
          </RadioGroup>

          <H2>Select Payment Method</H2>
          <RadioGroup
            aria-labelledby="Select a payment method"
            name="paymentMethod"
            onValueChange={setSelectedPaymentMethod}
          >
            <YStack width={300} alignItems="center" space="$2">
              {paymentMethods.map((method) => (
                <RadioGroupItemWithLabel 
                  key={method.value} 
                  size={method.size} 
                  value={method.value} 
                  label={method.label} 
                />
              ))}
            </YStack>
          </RadioGroup>
          
          {membershipError && <Text color="$red10">{membershipError}</Text>}
          
          <Button 
            onPress={initiatePurchase} 
            disabled={membershipLoading || !selectedMembership || !selectedPaymentMethod}
          >
            {membershipLoading ? 'Processing...' : 'Buy BISO membership'}
          </Button>
        </Sheet.Frame>
      </Sheet>
    </ScrollView>
  );
};

export default ProfileScreen;