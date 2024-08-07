import { Button, Paragraph, Text, XStack, YStack } from "tamagui";
import { useAuth } from "@/components/context/auth-provider";
import { Lock } from "@tamagui/lucide-icons";
import { Accordion } from "../ui/accordion";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Vote, WalletCards, Gift } from "@tamagui/lucide-icons";

export function MemberAccess() {
    const { data, isBisoMember, isLoading } = useAuth();
    const [disabled, setDisabled] = useState(true);
    const [open, setOpen] = useState(false);
    const { push, navigate } = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (isBisoMember) {
            setDisabled(false);
            setOpen(true);
        } else {
            setDisabled(true);
            setOpen(false);
        }
    }, [isBisoMember, isLoading]);

    if (!data) {
        return null;
    }

    const items = [
        {
            value: "member-access",
            title: (
                <XStack space="$2" alignItems="center" justifyContent="center">
                    <Text fontSize="$5">Member Access</Text>
                    {!isBisoMember && (
                        <>
                            <Lock size={20} color="gray" />
                            <Paragraph fontSize="$2" numberOfLines={2} color="gray">
                                Only available to members
                            </Paragraph>
                        </>
                    )}
                </XStack>
            ),
            disabled: disabled,
            defaultOpen: open,
            content: (
                <YStack space="$4">
                    <XStack space="$4">
                        <Button height={"$5"} onPress={() => navigate("/explore/expenses")} icon={<WalletCards size={20} />}>
                            <XStack space="$2" alignItems="center" justifyContent="center"></XStack>
                            <Text fontSize="$4">Expenses</Text>
                        </Button>
                        <Button height={"$5"} onPress={() => push("/explore/elections")} icon={<Vote size={20} />}>
                            <XStack space="$2" alignItems="center" justifyContent="center"></XStack>
                            <Text fontSize="$4">Elections</Text>
                        </Button>
                    </XStack>
                    <XStack space="$4">
                        <Button height={"$5"} onPress={() => push("/explore/benefits")} icon={<Gift size={20} />}>
                            <XStack space="$2" alignItems="center" justifyContent="center"></XStack>
                            <Text fontSize="$4">Benefits</Text>
                        </Button>
                    </XStack>
                </YStack>
            )
        }
    ];

    return <Accordion items={items} />;
}
