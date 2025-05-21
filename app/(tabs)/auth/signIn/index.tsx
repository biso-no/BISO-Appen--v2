import React, { useEffect, useState, useCallback } from 'react';
import { Button, Input, Text, YStack, XStack, H1, H2, View } from 'tamagui';
import { createMagicUrl } from '@/lib/appwrite';
import { useRouter } from 'expo-router';
import { MyStack } from '@/components/ui/MyStack';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'tamagui/linear-gradient';
import { Mail, Check, ExternalLink } from '@tamagui/lucide-icons';
import { useWindowDimensions, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';

// Company Colors
const COLORS = {
  primary: '#001731',
  secondary: '#3DA9E0',
  // Norwegian Business School Colors
  strongBlue: '#002341',
  defaultBlue: '#01417B',
  accentBlue: '#1A77E9',
  subtleBlue: '#E6F2FA',
  mutedBlue: '#F2F9FC',
  strongGold: '#BD9E16',
  defaultGold: '#F7D64A',
  accentGold: '#FFE98C',
  subtleGold: '#ffefa8',
  mutedGold: '#fffae3',
};

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [errorMessages, setErrorMessages] = useState<string[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const { push } = useRouter();

  useEffect(() => {
    const keyboardWillShow = Platform.OS === 'ios' 
      ? Keyboard.addListener('keyboardWillShow', () => setIsKeyboardVisible(true))
      : Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
      
    const keyboardWillHide = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', () => setIsKeyboardVisible(false))
      : Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownTime]);

  const handleEmailSubmit = async () => {
    if (!email) {
      setErrorMessages([t('please-enter-your-email-address')]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await createMagicUrl(email);
      if (response) {
        setIsEmailSent(true);
        setCooldownTime(10); // Set 10 second cooldown
      }
    } catch (error) {
      setErrorMessages([t('failed-to-send-magic-link-please-try-again')]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (cooldownTime > 0) return;
    setIsLoading(true);
    try {
      const response = await createMagicUrl(email);
      if (response) {
        setCooldownTime(10); // Reset cooldown timer
      }
    } catch (error) {
      setErrorMessages([t('failed-to-resend-magic-link-please-try-again')]);
    } finally {
      setIsLoading(false);
    }
  }, [email, cooldownTime]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 40}
    >
      <MyStack flex={1} backgroundColor={COLORS.primary}>
        <LinearGradient
          start={[0, 0]}
          end={[1, 1]}
          fullscreen
          colors={[
            COLORS.primary,
            COLORS.strongBlue,
            COLORS.defaultBlue,
          ]}
          locations={[0, 0.5, 1]}
          opacity={0.95}
        />
        
        <ScrollView 
          contentContainerStyle={{ 
            flexGrow: 1,
            justifyContent: 'center',
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <YStack 
            flex={1} 
            gap="$4" 
            justifyContent="center"
            paddingBottom="$7"
          >
            <AnimatePresence>
              {!isKeyboardVisible && (
                <MotiView
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'timing', duration: 200 }}
                  style={{ zIndex: 2 }}
                >
                  <Image
                    source={require('@/assets/logo-dark.png')}
                    style={{ 
                      width: width * 0.4, 
                      height: width * 0.4, 
                      alignSelf: 'center',
                    }}
                    placeholder={blurhash}
                    contentFit="contain"
                    transition={1000}
                  />
                </MotiView>
              )}
            </AnimatePresence>

            <YStack 
              gap="$4" 
              padding="$4" 
              backgroundColor={COLORS.mutedBlue}
              borderRadius="$6"
              shadowColor={COLORS.primary}
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.15}
              shadowRadius={16}
              elevation={8}
            >
              <H1
                textAlign="center"
                color={COLORS.primary}
                fontWeight="900"
                fontSize={32}
                letterSpacing={-0.5}
              >
                {t('welcome-back')}
              </H1>
              <H2
                textAlign="center"
                color={COLORS.defaultBlue}
                fontSize={18}
                fontWeight="600"
                letterSpacing={-0.2}
              >
                {t('sign-in-to-continue')}
              </H2>

              <YStack gap="$4" marginTop="$6">
                <XStack
                  backgroundColor="white"
                  borderRadius="$4"
                  borderWidth={1}
                  borderColor={COLORS.subtleBlue}
                  padding="$3"
                  alignItems="center"
                >
                  <Mail size={20} color={COLORS.secondary} />
                  <Input
                    flex={1}
                    marginLeft="$2"
                    placeholder={t('enter-your-email')}
                    backgroundColor="transparent"
                    borderWidth={0}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    color={COLORS.primary}
                    placeholderTextColor={COLORS.defaultBlue}
                    fontSize={16}
                    fontWeight="500"
                    editable={!isEmailSent}
                  />
                </XStack>

                {isEmailSent ? (
                  <YStack gap="$4" alignItems="center">
                    <Check size={24} color={COLORS.secondary} />
                    <Text
                      textAlign="center"
                      color={COLORS.defaultBlue}
                      fontSize={14}
                      fontWeight="500"
                      letterSpacing={-0.1}
                      paddingHorizontal="$4"
                    >
                      {t('weve-sent-a-magic-link-to-your-email-please-check-your-inbox-and-click-the-link-to-sign-in')}
                    </Text>
                    <XStack gap="$2" width="100%">
                      <Button
                        flex={1}
                        backgroundColor={COLORS.accentBlue}
                        color="white"
                        size="$4"
                        fontWeight="600"
                        onPress={() => Linking.openURL('mailto:')}
                        pressStyle={{ 
                          backgroundColor: COLORS.defaultBlue,
                          scale: 0.98,
                        }}
                      >
                        <ExternalLink size={16} color="white" />
                        <Text color="white" fontSize={14} fontWeight="600" marginLeft="$1">
                          {t('open-email-app')}
                        </Text>
                      </Button>
                      <Button
                        flex={1}
                        backgroundColor={cooldownTime > 0 ? '$gray8' : COLORS.secondary}
                        color="white"
                        size="$4"
                        fontWeight="600"
                        onPress={handleResend}
                        disabled={cooldownTime > 0 || isLoading}
                        pressStyle={{ 
                          backgroundColor: COLORS.accentBlue,
                          scale: 0.98,
                        }}
                        opacity={cooldownTime > 0 ? 0.7 : 1}
                      >
                        <Text color="white" fontSize={14} fontWeight="600">
                          {isLoading ? 'Sending...' : 
                           cooldownTime > 0 ? t('resend-in-cooldowntime-s') : 
                           t('resend-link')}
                        </Text>
                      </Button>
                    </XStack>
                  </YStack>
                ) : (
                  <Button
                    backgroundColor={COLORS.secondary}
                    color="white"
                    size="$5"
                    fontWeight="700"
                    onPress={handleEmailSubmit}
                    pressStyle={{ 
                      backgroundColor: COLORS.accentBlue,
                      scale: 0.98,
                    }}
                    disabled={isLoading}
                    borderRadius="$4"
                    shadowColor={COLORS.primary}
                    shadowOffset={{ width: 0, height: 2 }}
                    shadowOpacity={0.2}
                    shadowRadius={4}
                    elevation={5}
                  >
                    <Text color="white" fontSize={16} fontWeight="700">
                      {isLoading ? t('sending-link') : t('continue-with-email')}
                    </Text>
                  </Button>
                )}

                <Text 
                  fontSize="$2" 
                  textAlign="center" 
                  opacity={0.7}
                  color={COLORS.defaultBlue}
                >
                  {t('by-continuing-you-agree-to-our')}{' '}
                  <Text
                    color={COLORS.accentBlue}
                    onPress={() => push('https://biso.no/en/privacy-policy/')}
                    fontWeight="500"
                  >
                    {t('privacy-policy')}
                  </Text>
                </Text>
              </YStack>
            </YStack>

            {errorMessages && errorMessages.length > 0 && (
              <AnimatePresence>
                <MotiView
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: 10 }}
                  transition={{ type: 'timing', duration: 300 }}
                >
                  {errorMessages.map((error, index) => (
                    <Text
                      key={index}
                      color={COLORS.subtleBlue}
                      textAlign="center"
                      fontSize={14}
                      fontWeight="600"
                      marginTop="$2"
                      letterSpacing={-0.1}
                    >
                      {error}
                    </Text>
                  ))}
                </MotiView>
              </AnimatePresence>
            )}
          </YStack>
        </ScrollView>
      </MyStack>
    </KeyboardAvoidingView>
  );
}
