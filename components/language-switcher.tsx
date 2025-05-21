import { useState, useEffect } from 'react';
import {
  XStack,
  YStack,
  Text,
  Select,
  Adapt,
  Sheet,
  Label,
  View,
  SizableText
} from 'tamagui';
import { useTranslation } from 'react-i18next';
import { Globe } from '@tamagui/lucide-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { AnimatePresence, MotiView } from 'moti';

const LANGUAGES = [
  { value: 'no', label: 'Norsk' },
  { value: 'en', label: 'English' }
];

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'no');

  // Make sure the component stays in sync with i18n's language
  useEffect(() => {
    // Update local state if i18n language changes
    const updateLanguage = () => {
      setCurrentLanguage(i18n.language);
    };

    // Listen for language changes
    i18n.on('languageChanged', updateLanguage);

    // Initialize with current language
    updateLanguage();

    // Cleanup
    return () => {
      i18n.off('languageChanged', updateLanguage);
    };
  }, [i18n]);

  const handleLanguageChange = async (value: string) => {
    try {
      // This will trigger the languageChanged event and update AsyncStorage
      await i18n.changeLanguage(value);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  // Memoize the language label to avoid recalculation
  const currentLanguageLabel = useMemo(() => {
    return LANGUAGES.find((lang) => lang.value === currentLanguage)?.label || 'Language';
  }, [currentLanguage]);

  return (
    <YStack space="$2">
      <XStack alignItems="center" space="$2">
        <Globe size={20} />
        <Label size="$5" fontWeight="bold">
          {t('language')}
        </Label>
      </XStack>
      
      <Select
        id="language"
        value={currentLanguage}
        onValueChange={handleLanguageChange}
        disablePreventBodyScroll
      >
        <Select.Trigger width="100%" height="$4" borderRadius="$4" borderWidth={1} borderColor="$gray7">
          <Select.Value placeholder={t('select-language')} />
        </Select.Trigger>
        
        <Adapt platform="touch">
          <Sheet modal dismissOnSnapToBottom>
            <Sheet.Frame>
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
            <Sheet.Overlay />
          </Sheet>
        </Adapt>
        
        <Select.Content>
          <Select.ScrollUpButton alignItems="center" justifyContent="center" position="relative" width="100%" height="$3">
            <YStack zIndex={10}>
              <Text>⬆️</Text>
            </YStack>
            <View 
              position="absolute" 
              width="100%" 
              height="100%" 
              style={{ overflow: 'hidden', borderRadius: 10 }}
            >
              <LinearGradient
                start={[0, 0]}
                end={[0, 1]}
                colors={['#ffffff', 'transparent']}
                style={{ width: '100%', height: '100%' }}
              />
            </View>
          </Select.ScrollUpButton>
          
          <Select.Viewport minWidth={200}>
            <Select.Group>
              <Select.Label>{t('select-language')}</Select.Label>
              {LANGUAGES.map((language) => (
                <Select.Item
                  index={LANGUAGES.indexOf(language)}
                  key={language.value}
                  value={language.value}
                >
                  <Select.ItemText>{language.label}</Select.ItemText>
                  <Select.ItemIndicator marginLeft="auto">
                    <Text>✓</Text>
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>
          
          <Select.ScrollDownButton alignItems="center" justifyContent="center" position="relative" width="100%" height="$3">
            <YStack zIndex={10}>
              <Text>⬇️</Text>
            </YStack>
            <View 
              position="absolute" 
              width="100%" 
              height="100%" 
              style={{ overflow: 'hidden', borderRadius: 10 }}
            >
              <LinearGradient
                start={[0, 1]}
                end={[0, 0]}
                colors={['#ffffff', 'transparent']}
                style={{ width: '100%', height: '100%' }}
              />
            </View>
          </Select.ScrollDownButton>
        </Select.Content>
      </Select>

      <AnimatePresence>
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -10 }}
          transition={{ type: 'timing', duration: 300 }}
        >
          <XStack
            backgroundColor="$blue2"
            borderRadius="$4"
            padding="$2"
            borderWidth={1}
            borderColor="$blue5"
            alignItems="center"
            space="$2"
          >
            <View backgroundColor="$blue5" padding="$1" borderRadius="$2">
              <SizableText size="$3" color="$blue11">
                {currentLanguageLabel}
              </SizableText>
            </View>
            <SizableText size="$3" color="$blue11">
              {t('current-language')}
            </SizableText>
          </XStack>
        </MotiView>
      </AnimatePresence>
    </YStack>
  );
}; 