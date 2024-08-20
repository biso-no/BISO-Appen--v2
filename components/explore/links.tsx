import { Button, Paragraph, Text, XStack, YStack } from "tamagui";
import { useAuth } from "@/components/context/auth-provider";
import { Lock } from "@tamagui/lucide-icons";
import { Accordion } from "../ui/accordion";
import { useRouter } from "expo-router";
import { Newspaper, Calendar, Globe, Vote, WalletCards, Gift, Briefcase, Contact } from "@tamagui/lucide-icons";

export function UsefulLinks() {

    const { push } = useRouter();

    const items = [
        {
            value: "useful-links",
            title: <Text fontSize="$5">Ecosystem</Text>,
            defaultOpen: true,
            content: (
                <YStack space="$4">
                    <XStack justifyContent="center" space="$4">
                        <Button
                            width={"$12"} // Ensure all buttons have the same width
                            height={"$6"} // Ensure all buttons have the same height
                            onPress={() => push("/explore/units")}
                            icon={<Newspaper size={20} />}
                            justifyContent="center" // Center content inside the button
                            alignItems="center" // Center content inside the button
                        >
                            <Text fontSize="$4">Units</Text>
                        </Button>
                        <Button
                            width={"$12"} // Same width as above
                            height={"$6"} // Same height as above
                            onPress={() => push("/explore/volunteer")}
                            icon={<Briefcase size={20} />}
                            justifyContent="center" // Center content inside the button
                            alignItems="center" // Center content inside the button
                        >
                            <Text fontSize="$4">Volunteer</Text>
                        </Button>
                    </XStack>
                    <XStack justifyContent="center" space="$4">
                        <Button
                            width={"$12"} // Same width as above
                            height={"$6"} // Same height as above
                            onPress={() => push("https://biso.no")}
                            icon={<Globe size={20} />}
                            justifyContent="center" // Center content inside the button
                            alignItems="center" // Center content inside the button
                        >
                            <Text fontSize="$4">BISO.no</Text>
                        </Button>
                        <Button
                            width={"$12"} // Same width as above
                            height={"$6"} // Same height as above
                            onPress={() => push("https://biso.no/varsling")}
                            icon={<Contact size={20} />}
                            justifyContent="center" // Center content inside the button
                            alignItems="center" // Center content inside the button
                        >
                            <Text fontSize="$4">Reach out</Text>
                        </Button>
                    </XStack>
                </YStack>
            )
        }
    ];

    return (
        <Accordion items={items} />
    );
}
