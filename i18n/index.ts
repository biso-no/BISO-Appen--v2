import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import translationEn from "./locales/en/translation.json";
import translationNo from "./locales/no/translation.json";


const resources = {
  "no": { translation: translationNo },
  "en": { translation: translationEn },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem("language");

  if (!savedLanguage) {
    const deviceLocales = Localization.getLocales();
    const deviceLanguageCode = deviceLocales.length > 0 
      ? deviceLocales[0].languageCode 
      : "no";
      
    // Default to Norwegian if unknown language
    savedLanguage = (deviceLanguageCode === 'en' || deviceLanguageCode === 'no') 
      ? deviceLanguageCode 
      : "no";
    // Save the initial language
    await AsyncStorage.setItem("language", savedLanguage);
  }

  i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: "no",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
};

// Store the original changeLanguage method
const originalChangeLanguage = i18n.changeLanguage;

// Override the changeLanguage method to also save to AsyncStorage
i18n.changeLanguage = async function(lng?: string) {
  if (lng) {
    // Save to AsyncStorage first
    await AsyncStorage.setItem("language", lng);
    // Then call the original method
    return originalChangeLanguage(lng);
  }
  return originalChangeLanguage(lng);
};

initI18n();

export default i18n;
