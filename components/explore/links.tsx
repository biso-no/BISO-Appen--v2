import { Button, Paragraph, Text, XStack, YStack } from "tamagui";
import { useAuth } from "@/components/context/auth-provider";
import { Lock } from "@tamagui/lucide-icons";
import { Accordion, } from "../ui/accordion";
import { useRouter } from "expo-router";
import { Newspaper, Calendar, Globe, Vote, WalletCards, Gift, Briefcase, Contact } from "@tamagui/lucide-icons";

export function UsefulLinks() {

    const { push } = useRouter();



    const items = [
        {
            value: "usefdul-links",
            title: <Text fontSize="$5">Ecosystem</Text>,
            defaultOpen: true,
            content: (
                <YStack space="$4">
                    <XStack space="$4">
                        <Button height={"$5"} onPress={() => push("/explore/units")} icon={<Newspaper size={20} />}>
                            <Text fontSize="$4">Units</Text>
                        </Button>
                    </XStack>
                    <XStack space="$4">
                        <Button height={"$5"} onPress={() => push("https://biso.no")} icon={<Globe size={20} />}>
                            <Text fontSize="$4">BISO.no</Text>
                        </Button>
                        <Button height={"$5"} onPress={() => push("https://biso.no/varsling")} icon={<Contact size={20} />}>
                            <Text fontSize="$4">Reach out</Text>
                        </Button>
                    </XStack>
                </YStack>
            )
        }
    ]

    return (
        <Accordion
        items={items}
        />
    );
}