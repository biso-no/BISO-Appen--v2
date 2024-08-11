import { 
    Card, H3, Paragraph, XStack, YStack, ZStack, SizableText, Button, H5, Box, XGroup, Image, Text, Square, useControllableState, useTheme 
} from "tamagui";
import { LinearGradient } from 'tamagui/linear-gradient'
import { useAuth } from "@/components/context/auth-provider";
import { useEffect, useState } from "react";
import { ImagePopover } from "@/components/image-popover";
import { BILoginButton } from "@/components/bi-login-button";
import { useColorScheme, Dimensions, Platform } from "react-native";
import { useModal } from "../context/membership-modal-provider";

export function ProfileCard() {
    const { data, profile: initialProfile, isLoading, updateUserPrefs, isBisoMember, studentId } = useAuth();
    const [profile, setProfile] = useState(initialProfile);
    const [animate, setAnimate] = useState(false);

    const handleAnimate = () => {
        console.log("Animating");
        setAnimate(!animate);
    }

    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const { openModal } = useModal();
    const theme = useTheme();
    const { width } = Dimensions.get('window');

    const isSmallScreen = width < 375;


    return (
        <Card theme="accent" themeInverse padding={isSmallScreen ? "$2" : "$4"}>
            <Card.Header height="$13" padding={isSmallScreen ? "$2" : "$4"}>
                <ZStack maxWidth={"100%"} maxHeight={85} width={"100%"} flex={1}>
                    <YStack marginTop="$3">
                        <XStack space="$3" alignItems="center">
                            <ImagePopover />
                            <YStack space="$1">
                                <H3 size={isSmallScreen ? "$4" : "$6"}>{data?.name}</H3>
                                <Paragraph size={isSmallScreen ? "$3" : "$5"}>{data?.email}</Paragraph>
                            </YStack>
                        </XStack>
                        <H5 size={isSmallScreen ? "$4" : "$6"}>Student ID: {profile?.studentId?.student_id}</H5>
                    </YStack>
                </ZStack>
            </Card.Header>
            <Card.Footer padding={isSmallScreen ? "$2" : "$4"}>
                {!studentId ? (
                    <BILoginButton />
                ) : (
                    isBisoMember ? (
                        <>
                            <Text theme="alt2">You are a BISO member</Text>
                                <Image
                                    source={require('@/assets/logo-dark.png')}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        opacity: 0.7,
                                        position: 'absolute',
                                        bottom: 0,
                                        right: isSmallScreen ? 0 : 12,
                                    }}
                                />
                        </>
                    ) : (
                        <Button onPress={() => openModal()} variant="outlined">Buy BISO membership</Button>
                    )
                )}
            </Card.Footer>
        </Card>
    )
}
