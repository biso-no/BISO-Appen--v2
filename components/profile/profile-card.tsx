import { 
    Card, H3, Paragraph, XStack, YStack, ZStack, SizableText, Button, H5, Box, XGroup, Image, Text, Square, useControllableState, useTheme, 
    H4
} from "tamagui";
import { LinearGradient } from 'tamagui/linear-gradient'
import { useAuth } from "@/components/context/auth-provider";
import { useEffect, useState } from "react";
import { ImagePopover } from "@/components/image-popover";
import { BILoginButton } from "@/components/bi-login-button";
import { useColorScheme, Dimensions, Platform, SafeAreaView, View } from "react-native";
import { useModal } from "../context/membership-modal-provider";

export function ProfileCard() {
    const { data, profile, isLoading, updateUserPrefs, isBisoMember, studentId } = useAuth();
    const [animate, setAnimate] = useState(false);

    const handleAnimate = () => {
        console.log("Animating");
        setAnimate(!animate);
    }

    useEffect(() => {
        console.log("Student ID:", studentId);
    }, [studentId]);

    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const { openModal } = useModal();
    const theme = useTheme();
    const { width } = Dimensions.get('window');

    const isSmallScreen = width < 375;

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Card theme="accent" themeInverse={isDarkMode} padding={isSmallScreen ? "$2" : "$4"} width="100%">
                <Card.Header height="$13" padding={isSmallScreen ? "$2" : "$4"}>
                    <ZStack maxWidth={"100%"} maxHeight={85} width={"100%"} flex={1}>
                        <YStack marginTop="$3">
                            <XStack space="$3" alignItems="center">
                                <ImagePopover />
                                <YStack space="$1">
                                    <H4 size={isSmallScreen ? "$4" : "$6"}>{profile?.name}</H4>
                                    <Paragraph size={isSmallScreen ? "$3" : "$5"}>{data?.email}</Paragraph>
                                    <H5 size={isSmallScreen ? "$4" : "$6"}>Student ID: {profile?.student_id}</H5>
                                </YStack>
                            </XStack>
                        </YStack>
                    </ZStack>
                </Card.Header>
                <Card.Footer padding={isSmallScreen ? "$2" : "$4"}>
                    {!studentId ? (
                        <BILoginButton />
                    ) : (
                        isBisoMember ? (
                            <View>
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
                                    resizeMode="contain"
                                />
                            </View>
                        ) : (
                            <Button onPress={() => openModal()} variant="outlined">Buy BISO membership</Button>
                        )
                    )}
                </Card.Footer>
            </Card>
        </SafeAreaView>
    )
}