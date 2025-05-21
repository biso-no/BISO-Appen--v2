import { MyStack } from "@/components/ui/MyStack";
import { YStack, H3 } from "tamagui";
import { ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
export default function DepartmentsScreen() {
    const { t } = useTranslation();
   //Display no benefits currently added in the app yet.
    return (
        <ScrollView>
        <MyStack>
            <YStack gap="$4" alignItems="center" justifyContent="center">
                <H3>{t('coming-soon')}</H3>
            </YStack>
        </MyStack>
        </ScrollView>
    )
}