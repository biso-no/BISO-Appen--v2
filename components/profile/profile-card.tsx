import { Card, H3, Paragraph, XStack, YStack, ZStack, SizableText, Button, H5, Box, XGroup, Image, Text } from "tamagui";
import { useAuth } from "@/components/context/auth-provider";
import { getUserAvatar, updateDocument, signOut, signInWithBI, updateUserPreferences } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import { ImagePopover } from "@/components/image-popover";
import { BILoginButton } from "@/components/bi-login-button";
import { useColorScheme } from "react-native";

export function ProfileCard() {
    const { data, profile: initialProfile, isLoading, updateUserPrefs, isBisoMember, studentId} = useAuth();
    const [profile, setProfile] = useState(initialProfile);

    const colorScheme = useColorScheme();

    const isDarkMode = colorScheme === 'dark';

    return (
        <Card>
            <Card.Header height="$13">
                <ZStack maxWidth={"100%"} maxHeight={85} width={"100%"} flex={1}>
                    <YStack marginTop="$3">
                        <XStack space="$3">
                            <ImagePopover />
                            <YStack space="$1">
                                <H3 size="$6">{data?.name}</H3>
                                <Paragraph size="$5">{data?.email}</Paragraph>
                            </YStack>
                        </XStack>
                        <H5 size="$6">Student ID: {profile?.studentId?.student_id}</H5>
                    </YStack>
                    <Image
                        source={{
                            uri: isDarkMode ? require('@/assets/logo-dark.png') : require('@/assets/logo-light.png'),
                            width: 80,
                            height: 80,
                        }}
                        opacity={0.5}
                        rotate="10deg"
                        position="absolute"
                        top={10}
                        right={10}
                    />
                    <Image
                        source={{
                            uri: isDarkMode ? require('@/assets/logo-dark.png') : require('@/assets/logo-light.png'),
                            width: 80,
                            height: 80,
                        }}
                        opacity={0.5}
                        position="absolute"
                        rotate="-10deg"
                        top={50}
                        left={30}
                    />
                    <Image
                        source={{
                            uri: isDarkMode ? require('@/assets/logo-dark.png') : require('@/assets/logo-light.png'),
                            width: 80,
                            height: 80,
                        }}
                        opacity={0.5}
                        position="absolute"
                        rotate="20deg"
                        bottom={10}
                        left={150}
                    />
                </ZStack>
            </Card.Header>
            <Card.Footer padding="$3">
                {!studentId ? (
                    <BILoginButton />
                ) : (
                    isBisoMember ? (
                        <Text color="green">You are a BISO member</Text>
                    ) : (
                        <Button variant="outlined">Buy BISO membership</Button>
                    )
                )}
                </Card.Footer>  
            </Card>
        )
    }
