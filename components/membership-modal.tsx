import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { databases, triggerFunction } from '@/lib/appwrite';
import { Sheet } from '@tamagui/sheet';
import { Models, Query } from 'react-native-appwrite';
import { 
  Button, 
  H2, 
  XStack, 
  YStack, 
  Text, 
  Card, 
  Image,
  Paragraph,
  Theme,
  useTheme,
  Spinner
} from 'tamagui';
import { usePathname } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from './context/core/auth-provider';
import { useMembershipContext } from './context/core/membership-provider';
import { useTranslation } from 'react-i18next';
import { MotiView } from 'moti';
import { LinearGradient } from 'tamagui/linear-gradient';
import { useColorScheme, Dimensions } from 'react-native';
import { Check, CreditCard, Wallet } from '@tamagui/lucide-icons';
import i18next from '@/i18n';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width - 64, 400);

interface ApiResponse {
  checkout: {
    ok: boolean;
    data: {
      redirectUrl: string;
      reference: string;
    };
  };
}

interface MembershipModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const MembershipModal = ({ open, setOpen }: MembershipModalProps) => {
  const [selectedMembership, setSelectedMembership] = useState<Models.Document | undefined>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [membershipOptions, setMembershipOptions] = useState<Models.DocumentList<Models.Document>>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useTheme();
  const { t } = useTranslation();

  const pathName = usePathname();
  const { user } = useAuth();
  const { isBisoMember } = useMembershipContext();

  useEffect(() => {
    if (isBisoMember === true) {
      setOpen(false);
    }
  }, [isBisoMember, setOpen]);

  useEffect(() => {
    if (user?.$id) {
      const fetchMemberships = async () => {
        try {
          const response = await databases.listDocuments('app', 'memberships', [
            Query.select(['membership_id', 'price', 'name', '$id']),
            Query.equal('canPurchase', true)
          ]);
          setMembershipOptions(response);
        } catch (error) {
          console.error("Error fetching memberships:", error);
          setError(t('failed-to-load-membership-options-please-try-again-later'));
        }
      };
      fetchMemberships();
    }

  }, [user?.$id]);

  const initiatePurchase = async () => {
    if (!selectedMembership) {
      setError(t('please-select-a-membership'));
      return;
    }

    if (!selectedPaymentMethod) {
      setError(t('please-select-a-payment-method'));
      return;
    }

    setIsLoading(true);
    setError(null);

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
        const responseBody = JSON.parse(execution.responseBody) as ApiResponse;
        const url = responseBody.checkout.data.redirectUrl;
        
        // Open the URL and wait for the result
        const result = await WebBrowser.openAuthSessionAsync(url, '/profile');
        
        if (result.type === 'success') {
          setOpen(false);
        } else {
          setError(t('purchase-was-not-completed-please-try-again'));
        }
      }
    } catch (error) {
      console.error("Error during purchase initiation", error);
      setError(t('an-error-occurred-while-processing-your-purchase-please-try-again'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!membershipOptions) {
    return null;
  }

  return (
    <Sheet
      forceRemoveScrollEnabled={open}
      modal={true}
      open={open}
      onOpenChange={setOpen}
      snapPoints={[90]}
      dismissOnSnapToBottom
      zIndex={100_000}
      animation="medium"
    >
      <Sheet.Overlay 
        animation="lazy" 
        enterStyle={{ opacity: 0 }} 
        exitStyle={{ opacity: 0 }}
        backgroundColor={isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)'} 
      />
      <Sheet.Handle />
      <Sheet.Frame padding="$0" justifyContent="flex-start" alignItems="center">
        {/* Header with gradient */}
        <YStack width="100%" alignItems="center" overflow="hidden">
          <MotiView
            from={{ translateY: -50, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            style={{ width: '100%' }}
          >
            <YStack
              height={90}
              width="100%"
              justifyContent="center"
              alignItems="center"
              overflow="hidden"
            >
              <LinearGradient
                colors={isDark 
                  ? [(theme.blue9?.val || '#0091ff'), (theme.purple9?.val || '#8c00ff')]
                  : [(theme.blue8?.val || '#0080ff'), (theme.purple8?.val || '#7f00ff')]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.5 }}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />
              <H2 color="white">{t('become-a-member')}</H2>
            </YStack>
          </MotiView>
        </YStack>

        <YStack padding="$5" gap="$5" width="100%" flex={1}>
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 100 }}
          >
            <YStack>
              <Text fontSize="$6" fontWeight="bold" marginBottom="$2">{t('select-membership')}</Text>
              <Text fontSize="$3" color={isDark ? '$gray11' : '$gray10'} marginBottom="$4">
                {t('choose-the-membership-that-fits-your-needs')}
              </Text>
              <YStack gap="$3">
                {membershipOptions?.documents?.map((option, index) => (
                  <MotiView
                    key={option.$id}
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'spring', damping: 15, delay: 150 + index * 100 }}
                  >
                    <Button
                      unstyled
                      onPress={() => setSelectedMembership(option)}
                      pressStyle={{ scale: 0.98 }}
                    >
                      <Card
                        bordered
                        borderColor={selectedMembership?.$id === option.$id ? '$blue8' : isDark ? '$gray7' : '$gray4'}
                        animation="bouncy"
                        backgroundColor={selectedMembership?.$id === option.$id ? isDark ? '$blue5' : '$blue2' : undefined}
                        borderRadius="$6"
                        overflow="hidden"
                        borderWidth={selectedMembership?.$id === option.$id ? 2 : 1}
                        padding="$4"
                      >
                        <XStack alignItems="center" justifyContent="space-between">
                          <YStack>
                            <Text fontSize="$5" fontWeight="600">{option.name}</Text>
                            <Paragraph size="$3" theme={selectedMembership?.$id === option.$id ? 'accent' : undefined}>
                              {option.price} kr
                            </Paragraph>
                          </YStack>
                          {selectedMembership?.$id === option.$id && (
                            <MotiView
                              from={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ type: 'spring', damping: 10 }}
                            >
                              <Theme name="accent">
                                <Button
                                  size="$3"
                                  circular
                                  icon={<Check size={18} />}
                                />
                              </Theme>
                            </MotiView>
                          )}
                        </XStack>
                      </Card>
                    </Button>
                  </MotiView>
                ))}
              </YStack>
            </YStack>
          </MotiView>

          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 300 }}
          >
            <YStack marginTop="$2">
              <Text fontSize="$6" fontWeight="bold" marginBottom="$2">{t('select-payment-method')}</Text>
              <Text fontSize="$3" color={isDark ? '$gray11' : '$gray10'} marginBottom="$4">
                {t('choose-how-you-want-to-pay')}
              </Text>
              <YStack gap="$3">
                {/* Credit Card Payment Option */}
                <MotiView
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'spring', damping: 15, delay: 350 }}
                >
                  <Button
                    unstyled
                    onPress={() => setSelectedPaymentMethod('CARD')}
                    pressStyle={{ scale: 0.98 }}
                  >
                    <Card
                      bordered
                      borderColor={selectedPaymentMethod === 'CARD' ? '$blue8' : isDark ? '$gray7' : '$gray4'}
                      animation="bouncy"
                      backgroundColor={selectedPaymentMethod === 'CARD' ? isDark ? '$blue5' : '$blue2' : undefined}
                      borderRadius="$6"
                      overflow="hidden"
                      borderWidth={selectedPaymentMethod === 'CARD' ? 2 : 1}
                      padding="$4"
                    >
                      <XStack alignItems="center" justifyContent="space-between">
                        <XStack alignItems="center" gap="$3">
                          <Theme name="accent">
                            <CreditCard size={24} />
                          </Theme>
                          <Text fontSize="$4" fontWeight="500">{t('credit-card')}</Text>
                        </XStack>
                        {selectedPaymentMethod === 'CARD' && (
                          <MotiView
                            from={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', damping: 10 }}
                          >
                            <Theme name="accent">
                              <Button
                                size="$2"
                                circular
                                icon={<Check size={16} />}
                              />
                            </Theme>
                          </MotiView>
                        )}
                      </XStack>
                    </Card>
                  </Button>
                </MotiView>

                {/* Vipps Payment Option */}
                <MotiView
                  from={{ opacity: 0, translateX: 20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'spring', damping: 15, delay: 400 }}
                >
                  <Button
                    unstyled
                    onPress={() => setSelectedPaymentMethod('WALLET')}
                    pressStyle={{ scale: 0.98 }}
                  >
                    <Card
                      bordered
                      borderColor={selectedPaymentMethod === 'WALLET' ? '$orange8' : isDark ? '$gray7' : '$gray4'}
                      animation="bouncy"
                      backgroundColor={selectedPaymentMethod === 'WALLET' ? isDark ? 'rgba(255, 100, 0, 0.15)' : 'rgba(255, 100, 0, 0.1)' : undefined}
                      borderRadius="$6"
                      overflow="hidden"
                      borderWidth={selectedPaymentMethod === 'WALLET' ? 2 : 1}
                      padding="$4"
                    >
                      <XStack alignItems="center" justifyContent="space-between">
                        <XStack alignItems="center" gap="$3">
                          <Image 
                            source={require('@/assets/images/vipps.png')} 
                            width={80} 
                            height={24} 
                            resizeMode="contain"
                            alt="Vipps"
                          />
                        </XStack>
                        {selectedPaymentMethod === 'WALLET' && (
                          <MotiView
                            from={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', damping: 10 }}
                          >
                            <Theme name="accent">
                              <Button
                                size="$2"
                                circular
                                icon={<Check size={16} />}
                              />
                            </Theme>
                          </MotiView>
                        )}
                      </XStack>
                    </Card>
                  </Button>
                </MotiView>
              </YStack>
            </YStack>
          </MotiView>

          {/* Error message */}
          {error && (
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <YStack
                backgroundColor={isDark ? '$red5' : '$red2'}
                borderRadius="$4"
                padding="$3"
                borderColor={isDark ? '$red7' : '$red5'}
                borderWidth={1}
              >
                <Text color={isDark ? '$red11' : '$red10'}>{error}</Text>
              </YStack>
            </MotiView>
          )}

          {/* Purchase Button */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 15, delay: 450 }}
            style={{ alignItems: 'center', marginTop: 'auto' }}
          >
            {selectedPaymentMethod === 'WALLET' ? (
              <Button
                onPress={initiatePurchase}
                disabled={isLoading || !selectedMembership || !selectedPaymentMethod}
                width={200}
                height={50}
                backgroundColor="#ff5b24"
                borderRadius="$6"
                paddingHorizontal="$5"
                pressStyle={{ opacity: 0.9, scale: 0.98 }}
              >
                <XStack alignItems="center" gap="$2">
                  {isLoading ? <Spinner color="white" /> : (
                    <>
                      <Image 
                        source={require('@/assets/images/vipps.png')} 
                        width={60} 
                        height={20} 
                        resizeMode="contain"
                        alt="Vipps"
                      />
                      <Text color="white" fontWeight="bold">
                        {isLoading ? t('processing') : t('pay')}
                      </Text>
                    </>
                  )}
                </XStack>
              </Button>
            ) : (
              <Button
                onPress={initiatePurchase}
                disabled={isLoading || !selectedMembership || !selectedPaymentMethod}
                theme="accent"
                size="$5"
                width={200}
                borderRadius="$6"
                paddingHorizontal="$5"
                icon={isLoading ? <Spinner /> : undefined}
              >
                {isLoading ? t('processing') : t('buy-biso-membership')}
              </Button>
            )}
          </MotiView>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};