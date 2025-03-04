import { MyStack } from "@/components/ui/MyStack";
import { YStack, H3 } from "tamagui";
import { ScrollView } from "react-native";

export default function DepartmentsScreen() {

   //Display no benefits currently added in the app yet.
    return (
        <ScrollView>
        <MyStack>
            <YStack gap="$4" alignItems="center" justifyContent="center">
                <H3>Coming soon</H3>
            </YStack>
        </MyStack>
        </ScrollView>
    )
}