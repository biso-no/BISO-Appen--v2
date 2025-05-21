import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * A hook that returns a state value that updates when the language changes.
 * This is useful for components that need to react to language changes.
 * 
 * @param translationKey The i18n key to translate
 * @param options Optional parameters for the translation
 * @returns The translated text that updates when language changes
 */
export function useTranslatedText(translationKey: string, options?: Record<string, any>): string {
  const { t, i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string>(t(translationKey, options));

  useEffect(() => {
    // Update the translated text when language changes
    const handleLanguageChanged = () => {
      setTranslatedText(t(translationKey, options));
    };

    // Add the listener
    i18n.on('languageChanged', handleLanguageChanged);

    // Initialize with correct translation
    handleLanguageChanged();

    // Clean up
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n, t, translationKey, options]);

  return translatedText;
}

/**
 * A hook that returns a value indicating when the language changes.
 * Use this to force re-renders in components that need to update with language.
 * 
 * @returns A number that increments every time the language changes
 */
export function useLanguageRefresh(): number {
  const { i18n } = useTranslation();
  const [refreshCounter, setRefreshCounter] = useState<number>(0);

  useEffect(() => {
    // Force refresh when language changes
    const handleLanguageChanged = () => {
      setRefreshCounter(prev => prev + 1);
    };

    // Add the listener
    i18n.on('languageChanged', handleLanguageChanged);

    // Clean up
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  return refreshCounter;
}

export default useLanguageRefresh; 