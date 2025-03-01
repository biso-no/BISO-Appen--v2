import { Button, Paragraph, Text, XStack, YStack } from "tamagui";
import { useAuth } from "../context/core/auth-provider";
import { useMembershipContext } from "../context/core/membership-provider";
import { Lock } from "@tamagui/lucide-icons";
import { Accordion } from "../ui/accordion";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Vote, WalletCards, Gift } from "@tamagui/lucide-icons";

export function MemberAccess() {
    const { user, isLoading } = useAuth();
    const { isBisoMember } = useMembershipContext();
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

    if (!user) {
        return null;
    }

    const items = [
        {
            value: "member-access",
            title: (
                <XStack gap="$2" alignItems="center" justifyContent="center">
                    <Text fontSize="$5">Member Access</Text>
                    {!isBisoMember && (
                        <>
                            <Lock size={20} color="gray" />
                        </>
                    )}
                </XStack>
            ),
            disabled: disabled,
            defaultOpen: open,
            content: (
                <YStack gap="$4">
                    <XStack gap="$4">

                        <Button height={"$5"} onPress={() => push("/explore/elections")} icon={<Vote size={20} />}>
                            <XStack gap="$2" alignItems="center" justifyContent="center"></XStack>
                            <Text fontSize="$4">Elections</Text>
                        </Button>
                    </XStack>
                    <XStack gap="$4">
                        <Button height={"$5"} onPress={() => push("/explore/benefits")} icon={<Gift size={20} />}>
                            <XStack gap="$2" alignItems="center" justifyContent="center"></XStack>
                            <Text fontSize="$4">Benefits</Text>
                        </Button>
                    </XStack>
                </YStack>
            )
        }
    ];

    return <Accordion items={items} />;
}
