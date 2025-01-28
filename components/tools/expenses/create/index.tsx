import { Stepper } from "./stepper";
import { PersonalDetails } from "./personal-details";
import { YStack } from "tamagui";
import { useAuth } from "@/components/context/auth-provider";

export function Create() {
    const { data } = useAuth();

    if (!data) {
        return null;
    }

    return (
        <YStack gap="$5" alignItems="center" justifyContent="center">
            <Stepper
                steps={[
                    {
                        title: "Personal Details",
                        description: "Provide your personal details",
                        component: () => <PersonalDetails user={data} />,  // Changed to a function returning the component
                    },
                    {
                        title: "Expense Details",   
                        description: "Provide your expense details",
                        component: () => <PersonalDetails user={data} />,  // Changed to a function returning the component
                    },
                ]}
                onSubmit={(component) => {
                    console.log(component);
                }}
            />
        </YStack>
    );
}
