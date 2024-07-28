import { Button, Paragraph, Text, XStack, YStack } from "tamagui";
import { useAuth } from "@/components/context/auth-provider";
import { Lock } from "@tamagui/lucide-icons";
import { Accordion, } from "../ui/accordion";
import { useRouter } from "expo-router";

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
                        <Button size="$6" width="$13" onPress={() => push("/explore/units")}>
                            <Text fontSize="$4">Units</Text>
                        </Button>
                    </XStack>
                    <XStack space="$4">
                        <Button size="$6" width="$13" onPress={() => push("https://biso.no")}>
                            <Text fontSize="$4">BISO.no</Text>
                        </Button>
                        <Button size="$6" width="$13" onPress={() => push("https://biso.no/varsling")}>
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