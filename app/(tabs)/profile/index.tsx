import { useState, useEffect } from 'react';
import {
  YStack, Avatar, Card, H2, H4, Text, Input, Separator,
  Label, YGroup, Switch, Button, XStack, useTheme, View, Sheet, ScrollView,
  SizableText, RadioGroup, Stack, Form
} from 'tamagui';
import { 
  LogOut, ArrowLeft, User, Settings, 
  CreditCard, Bell 
} from '@tamagui/lucide-icons';
import { MotiView, AnimatePresence } from 'moti';
import { useAuth } from '@/components/context/core/auth-provider';
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
import { Image } from 'tamagui';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMembershipContext } from '@/components/context/core/membership-provider';
import { useProfile } from '@/components/context/core/profile-provider';

// Type definitions
type ProfileSection = 'menu' | 'personal' | 'departments' | 'notifications' | 'payment' | 'expenses' | 'preferences';

const paymentMethods = [
  { label: 'Credit Card', value: 'CARD', size: '$5' },
  { label: 'Vipps MobilePay', value: 'WALLET', size: '$5' },
];

// Form Schemas
const profileFormSchema = z.object({
  phone: z.string().min(8, 'Phone number must be at least 8 characters'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  zip: z.string().min(4, 'ZIP code must be at least 4 characters'),
});

const norwegianPaymentFormSchema = z.object({
  bank_account: z.string().length(11, 'Norwegian bank account must be 11 digits'),
});

const internationalPaymentFormSchema = z.object({
  bank_account: z.string().min(15, 'IBAN must be at least 15 characters'),
  swift: z.string().min(8, 'SWIFT/BIC must be at least 8 characters'),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;
type NorwegianPaymentFormData = z.infer<typeof norwegianPaymentFormSchema>;
type InternationalPaymentFormData = z.infer<typeof internationalPaymentFormSchema>;

const ProfileScreen = () => {
  const { user, actions, isLoading } = useAuth();
  const { profile, actions: profileActions } = useProfile();
  const { membership, isBisoMember, membershipExpiry } = useMembershipContext();
  const router = useRouter();
  const theme = useTheme();
  const pathName = usePathname();
  
  // Display States - Only for showing data
  const [displayProfile, setDisplayProfile] = useState({
    phone: profile?.phone ?? '',
    address: profile?.address ?? '',
    city: profile?.city ?? '',
    zip: profile?.zip ?? '',
  });

  const [displayPayment, setDisplayPayment] = useState({
    bank_account: profile?.bank_account ?? '',
    swift: profile?.swift ?? '',
  });

  // Update display states when profile changes
  useEffect(() => {
    if (profile) {
      setDisplayProfile({
        phone: profile.phone ?? '',
        address: profile.address ?? '',
        city: profile.city ?? '',
        zip: profile.zip ?? '',
      });
      setDisplayPayment({
        bank_account: profile.bank_account ?? '',
        swift: profile.swift ?? '',
      });
    }
  }, [profile]);

  // Profile Form
  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { isValid: profileIsValid, isSubmitting: profileIsSubmitting },
    reset: resetProfileForm
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      phone: profile?.phone ?? '',
      address: profile?.address ?? '',
      city: profile?.city ?? '',
      zip: profile?.zip ?? ''
    }
  });

  // Norwegian Payment Form
  const {
    control: norwegianControl,
    handleSubmit: handleNorwegianSubmit,
    formState: { isValid: norwegianIsValid, isSubmitting: norwegianIsSubmitting },
    reset: resetNorwegianForm
  } = useForm<NorwegianPaymentFormData>({
    resolver: zodResolver(norwegianPaymentFormSchema),
    defaultValues: {
      bank_account: profile?.bank_account ?? ''
    }
  });

  // International Payment Form
  const {
    control: internationalControl,
    handleSubmit: handleInternationalSubmit,
    formState: { isValid: internationalIsValid, isSubmitting: internationalIsSubmitting },
    reset: resetInternationalForm
  } = useForm<InternationalPaymentFormData>({
    resolver: zodResolver(internationalPaymentFormSchema),
    defaultValues: {
      bank_account: profile?.bank_account ?? '',
      swift: profile?.swift ?? ''
    }
  });

  // Section and UI States
  const [currentSection, setCurrentSection] = useState<ProfileSection>('menu');
  const [bankType, setBankType] = useState<'norwegian' | 'international'>('norwegian');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [followedDepartments, setFollowedDepartments] = useState<Models.Document[]>([]);

  // Membership States
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<Models.Document>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [membershipOptions, setMembershipOptions] = useState<Models.DocumentList<Models.Document>>();
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipError, setMembershipError] = useState<string | null>(null);
  
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Local prefs
  const [localPrefs, setLocalPrefs] = useState<{[key: string]: boolean}>({});

  // Add properly typed refs for form inputs
  const addressInputRef = React.useRef<any>(null);
  const cityInputRef = React.useRef<any>(null);
  const zipInputRef = React.useRef<any>(null);
  const swiftInputRef = React.useRef<any>(null);

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

  const resetForms = () => {
    resetProfileForm({
      phone: profile?.phone ?? '',
      address: profile?.address ?? '',
      city: profile?.city ?? '',
      zip: profile?.zip ?? ''
    });
    
    if (bankType === 'norwegian') {
      resetNorwegianForm({
        bank_account: profile?.bank_account ?? ''
      });
    } else {
      resetInternationalForm({
        bank_account: profile?.bank_account ?? '',
        swift: profile?.swift ?? ''
      });
    }
  };

  

  

  // Load membership options
  useEffect(() => {
    if (user?.$id && isMembershipOpen) {
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
  }, [user?.$id, isMembershipOpen]);

  const openEditProfile = () => {
    resetProfileForm({
      phone: profile?.phone ?? '',
      address: profile?.address ?? '',
      city: profile?.city ?? '',
      zip: profile?.zip ?? ''
    });
    setIsEditing(true);
  };
  
  const openEditPayment = () => {
    if (bankType === 'norwegian') {
      resetNorwegianForm({
        bank_account: profile?.bank_account ?? ''
      });
    } else {
      resetInternationalForm({
        bank_account: profile?.bank_account ?? '',
        swift: profile?.swift ?? ''
      });
    }
    setIsEditingPayment(true);
  };

  // Close membership sheet if user becomes a member
  useEffect(() => {
    if (isBisoMember === true) {
      setIsMembershipOpen(false);
    }
  }, [isBisoMember]);

  // Initialize local prefs
  useEffect(() => {
    if (user?.prefs) {
      setLocalPrefs(user.prefs);
    }
  }, [user?.prefs]);

  // Reset form values when opening edit modals
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        resetProfileForm({
          phone: profile?.phone ?? '',
          address: profile?.address ?? '',
          city: profile?.city ?? '',
          zip: profile?.zip ?? ''
        });
      }, 100);
    }
  }, [isEditing, profile]);

  useEffect(() => {
    if (isEditingPayment) {
      setTimeout(() => {
        if (bankType === 'norwegian') {
          resetNorwegianForm({
            bank_account: profile?.bank_account ?? ''
          });
        } else {
          resetInternationalForm({
            bank_account: profile?.bank_account ?? '',
            swift: profile?.swift ?? ''
          });
        }
      }, 100);
    }
  }, [isEditingPayment, bankType, profile]);

  // Form submission handlers
  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!profile?.$id) return;
    try {
      await profileActions.updateProfile(data);
      setDisplayProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const onNorwegianPaymentSubmit = async (data: NorwegianPaymentFormData) => {
    if (!profile?.$id) return;
    try {
      await profileActions.updateProfile(data);
      setDisplayPayment(prev => ({ ...prev, ...data }));
      setIsEditingPayment(false);
    } catch (error) {
      console.error('Error updating payment details:', error);
      Alert.alert('Error', 'Failed to update payment details');
    }
  };

  const onInternationalPaymentSubmit = async (data: InternationalPaymentFormData) => {
    if (!profile?.$id) return;
    try {
      await profileActions.updateProfile(data);
      setDisplayPayment(data);
      setIsEditingPayment(false);
    } catch (error) {
      console.error('Error updating payment details:', error);
      Alert.alert('Error', 'Failed to update payment details');
    }
  };

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
    await signOut();
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
      <XStack width={300} alignItems="center" gap="$4">
        <RadioGroup.Item value={value} id={id} size={size}>
          <RadioGroup.Indicator />
        </RadioGroup.Item>
        <Label size={size} htmlFor={id}>
          {label}
        </Label>
      </XStack>
    );
  }

  const EditableProfileField = React.memo(({ 
    label, 
    value, 
    secure = false,
    isEditing = false,
    onChangeText,
    error,
    keyboardType = 'default',
    placeholder,
    autoCapitalize = 'none',
    returnKeyType = 'next',
    onSubmitEditing,
    inputRef,
  }: { 
    label: string;
    value: string;
    secure?: boolean;
    isEditing?: boolean;
    onChangeText?: (text: string) => void;
    error?: { message?: string };
    keyboardType?: 'default' | 'number-pad' | 'phone-pad';
    placeholder?: string;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    returnKeyType?: 'done' | 'next';
    onSubmitEditing?: () => void;
    inputRef?: React.RefObject<any>;
  }) => {
    const [showFull, setShowFull] = useState(false);
    
    const getSecureDisplay = (value: string) => {
      if (!value) return 'Not set';
      if (!secure) return value;
      if (showFull) return value;
      
      const last4 = value.slice(-4);
      const maskedPart = value.slice(0, -4).replace(/./g, '•');
      return maskedPart + last4;
    };
    
    return (
    <YStack gap="$2">
      <XStack justifyContent="space-between" alignItems="center">
        <Text color="$gray11" fontSize="$3">{label}</Text>
        {secure && value && !isEditing && (
          <Button
            size="$2"
            theme="gray"
            onPress={() => setShowFull(!showFull)}
          >
            {showFull ? 'Hide' : 'Show All'}
          </Button>
        )}
      </XStack>
      {isEditing ? (
        <YStack gap="$2">
          <Input
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            borderColor={error ? '$red8' : undefined}
            focusStyle={{ borderColor: '$blue8', borderWidth: 2 }}
            autoComplete="off"
            pointerEvents="auto"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onSubmitEditing={onSubmitEditing}
            returnKeyType={returnKeyType}
            secureTextEntry={secure && !showFull}
          />
          {error && <Text color="$red10">{error.message}</Text>}
        </YStack>
      ) : (
        <Text fontSize="$4">
          {getSecureDisplay(value)}
        </Text>
      )}
    </YStack>
  )});

  const CustomSwitch = React.memo(({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: (checked: boolean) => void }) => (
    <XStack
      backgroundColor={checked ? "$blue5" : "$gray5"}
      borderRadius="$10"
      width={52}
      height={28}
      padding="$1"
      animation="quick"
      pressStyle={{ scale: 0.97 }}
      onPress={() => onCheckedChange(!checked)}
      borderWidth={1}
      borderColor={checked ? "$blue8" : "$gray8"}
    >
      <Stack
        animation="bouncy"
        backgroundColor={checked ? "$blue10" : "white"}
        borderRadius="$10"
        width={24}
        height={24}
        x={checked ? 24 : 0}
        scale={checked ? 1.1 : 1}
      />
    </XStack>
  ));

  const NotificationSection = React.memo(() => {
    const [localPrefs, setLocalPrefs] = useState<{[key: string]: boolean}>({});
    const { user, actions } = useAuth();

    useEffect(() => {
      if (user?.prefs) {
        setLocalPrefs(user.prefs);
      }
    }, [user?.prefs]);

    return (
      <YStack gap="$3">
        <XStack alignItems="center" justifyContent="space-between">
          <Text>Expense Updates</Text>
          <CustomSwitch
            checked={localPrefs?.expenses ?? false}
            onCheckedChange={async (checked: boolean) => {
              setLocalPrefs(prev => ({ ...prev, expenses: checked }));
              try {
                await actions.updatePreferences('expenses', checked);
              } catch (error) {
                setLocalPrefs(prev => ({ ...prev, expenses: !checked }));
                console.error('Failed to update notification settings:', error);
                Alert.alert('Error', 'Failed to update notification settings');
              }
            }}
          />
        </XStack>
        <Text theme="alt2" fontSize="$2">
          Receive notifications when expenses are approved, rejected or need attention
        </Text>
      </YStack>
    );
  });

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
          <Form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <YStack gap="$4">
              <EditableProfileField 
                label="Name" 
                value={profile?.name || ""} 
              />
              <Controller
                control={profileControl}
                name="phone"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <EditableProfileField 
                    label="Phone"
                    value={value}
                    isEditing={isEditing}
                    onChangeText={onChange}
                    error={error}
                    keyboardType="phone-pad"
                    placeholder="Phone"
                    inputRef={addressInputRef}
                    onSubmitEditing={() => addressInputRef.current?.focus()}
                  />
                )}
              />
              <Controller
                control={profileControl}
                name="address"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <EditableProfileField 
                    label="Address"
                    value={value}
                    isEditing={isEditing}
                    onChangeText={onChange}
                    error={error}
                    placeholder="Address"
                    inputRef={addressInputRef}
                    onSubmitEditing={() => cityInputRef.current?.focus()}
                  />
                )}
              />
              <Controller
                control={profileControl}
                name="city"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <EditableProfileField 
                    label="City"
                    value={value}
                    isEditing={isEditing}
                    onChangeText={onChange}
                    error={error}
                    placeholder="City"
                    inputRef={cityInputRef}
                    onSubmitEditing={() => zipInputRef.current?.focus()}
                  />
                )}
              />
              <Controller
                control={profileControl}
                name="zip"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <EditableProfileField 
                    label="ZIP"
                    value={value}
                    isEditing={isEditing}
                    onChangeText={onChange}
                    error={error}
                    placeholder="ZIP Code"
                    keyboardType="number-pad"
                    inputRef={zipInputRef}
                    returnKeyType="done"
                    onSubmitEditing={handleProfileSubmit(onProfileSubmit)}
                  />
                )}
              />
              <XStack gap="$2">
                {isEditing ? (
                  <>
                    <Button 
                      flex={1}
                      onPress={handleProfileSubmit(onProfileSubmit)}
                      theme="active"
                      disabled={!profileIsValid || profileIsSubmitting}
                    >
                      {profileIsSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                    <Button 
                      flex={1}
                      onPress={() => {
                        setIsEditing(false);
                        resetProfileForm();
                      }}
                      theme="red"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button 
                    onPress={() => setIsEditing(true)}
                    theme="blue"
                  >
                    Edit Details
                  </Button>
                )}
              </XStack>
            </YStack>
          </Form>
        );

      case 'payment':
        return (
          <YStack gap="$4">
            <YStack gap="$2">
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
              <Form onSubmit={handleNorwegianSubmit(onNorwegianPaymentSubmit)}>
                <YStack gap="$4">
                  <Controller
                    control={norwegianControl}
                    name="bank_account"
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <EditableProfileField 
                        label="Bank Account"
                        value={value}
                        isEditing={isEditingPayment}
                        onChangeText={onChange}
                        error={error}
                        placeholder="XXXX XX XXXXX"
                        keyboardType="number-pad"
                        secure
                        returnKeyType="done"
                        onSubmitEditing={handleNorwegianSubmit(onNorwegianPaymentSubmit)}
                      />
                    )}
                  />
                  <XStack gap="$2">
                    {isEditingPayment ? (
                      <>
                        <Button 
                          flex={1}
                          onPress={handleNorwegianSubmit(onNorwegianPaymentSubmit)}
                          theme="active"
                          disabled={!norwegianIsValid || norwegianIsSubmitting}
                        >
                          {norwegianIsSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                        <Button 
                          flex={1}
                          onPress={() => {
                            setIsEditingPayment(false);
                            resetNorwegianForm();
                          }}
                          theme="red"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onPress={() => setIsEditingPayment(true)}
                        theme="blue"
                      >
                        Edit Bank Details
                      </Button>
                    )}
                  </XStack>
                </YStack>
              </Form>
            ) : (
              <Form onSubmit={handleInternationalSubmit(onInternationalPaymentSubmit)}>
                <YStack gap="$4">
                  <Controller
                    control={internationalControl}
                    name="bank_account"
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <EditableProfileField 
                        label="IBAN"
                        value={value}
                        isEditing={isEditingPayment}
                        onChangeText={onChange}
                        error={error}
                        placeholder="IBAN"
                        autoCapitalize="characters"
                        secure
                        onSubmitEditing={() => swiftInputRef.current?.focus()}
                      />
                    )}
                  />
                  <Controller
                    control={internationalControl}
                    name="swift"
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <EditableProfileField 
                        label="SWIFT/BIC"
                        value={value}
                        isEditing={isEditingPayment}
                        onChangeText={onChange}
                        error={error}
                        placeholder="SWIFT/BIC"
                        autoCapitalize="characters"
                        secure
                        inputRef={swiftInputRef}
                        returnKeyType="done"
                        onSubmitEditing={handleInternationalSubmit(onInternationalPaymentSubmit)}
                      />
                    )}
                  />
                  <XStack gap="$2">
                    {isEditingPayment ? (
                      <>
                        <Button 
                          flex={1}
                          onPress={handleInternationalSubmit(onInternationalPaymentSubmit)}
                          theme="active"
                          disabled={!internationalIsValid || internationalIsSubmitting}
                        >
                          {internationalIsSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                        <Button 
                          flex={1}
                          onPress={() => {
                            setIsEditingPayment(false);
                            resetInternationalForm();
                          }}
                          theme="red"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onPress={() => setIsEditingPayment(true)}
                        theme="blue"
                      >
                        Edit Bank Details
                      </Button>
                    )}
                  </XStack>
                </YStack>
              </Form>
            )}
          </YStack>
        );

      case 'notifications':
        return (
          <YStack gap="$4">
            <H4>Notification Settings</H4>
            <NotificationSection />
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

  if (isLoading || !user) return null;

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
    <ScrollView 
      backgroundColor="$backgroundStrong" 
      flex={1}
      contentContainerStyle={{
        paddingBottom: 80 // Add padding at the bottom for the tab bar
      }}
    >
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
        {!profile.student_id ? (
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
                gap="$3" 
                alignItems="center" 
                justifyContent="space-between"
              >
                <XStack gap="$4" alignItems="center">
                  <Image 
                    source={require('@/assets/logo-light.png')} 
                    width={40}
                    height={40}
                  />
                  <YStack>
                    <SizableText 
                      color={getMembershipColor()}
                      fontWeight="bold"
                      fontSize="$5"
                    >
                      Member - {membership.name}
                    </SizableText>
                    <XStack gap="$1" alignItems="center">
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
                {!membership && (
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
                )}
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
  <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" gap="$5">
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
      <YStack width={300} alignItems="center" gap="$2">
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
      <YStack width={300} alignItems="center" gap="$2">
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

export default ProfileScreen;