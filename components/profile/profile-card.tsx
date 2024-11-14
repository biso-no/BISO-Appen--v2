import { 
    Card, H3, H4, H5, Paragraph, XStack, YStack, ZStack, 
    Text, Button, Image, useTheme, SizableText
} from "tamagui";
import { LinearGradient } from 'tamagui/linear-gradient';
import { useAuth } from "@/components/context/auth-provider";
import { useState, useEffect } from "react";
import { ImagePopover } from "@/components/image-popover";
import { BILoginButton } from "@/components/bi-login-button";
import { useColorScheme, Dimensions, Platform, SafeAreaView } from "react-native";
import { useModal } from "../context/membership-modal-provider";
// Using React Native icons instead of lucide-react
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function ProfileCard() {
    const { data, profile, membership, studentId } = useAuth();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const { openModal } = useModal();
    const theme = useTheme();
    const { width } = Dimensions.get('window');
    const isSmallScreen = width < 375;
    const primaryColor = theme?.color1?.val;
    // Format expiry date
    const formatExpiryDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get membership status color
    const getMembershipColor = () => {
        if (!membership) return '$gray9';
        switch (membership.category.toLowerCase()) {
            case 'gold':
                return '#FFD700';
            case 'silver':
                return '#C0C0C0';
            case 'bronze':
                return '#CD7F32';
            default:
                return '$blue9';
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Card 
            themeInverse={isDarkMode} 
            padding={isSmallScreen ? "$2" : "$4"} 
            width="100%"
            overflow="hidden"  // Important for gradient
            >
                    <LinearGradient
                        fullscreen
                        colors={isDarkMode ? 
                            ['#1a1b1e', '#2c2e33'] :  // Dark theme gradient
                            ['#ffffff', '#f5f5f5']     // Light theme gradient
                        }
                        start={[0, 0]}
                        end={[1, 1]}
                    />
                    <YStack padding={isSmallScreen ? "$3" : "$4"} space="$4">
                        {/* Profile Info Section */}
                        <XStack space="$4" alignItems="center">
                            <ImagePopover />
                            <YStack space="$2" flex={1}>
                                <H4 
                                    fontSize={isSmallScreen ? "$4" : "$6"}
                                    color={isDarkMode ? "white" : "black"}
                                >
                                    {profile?.name}
                                </H4>
                                <SizableText 
                                    fontSize={isSmallScreen ? "$3" : "$4"}
                                    opacity={0.7}
                                >
                                    {data?.email}
                                </SizableText>
                                <SizableText
                                    fontSize={isSmallScreen ? "$3" : "$4"}
                                    opacity={0.8}
                                >
                                    ID: {profile?.student_id}
                                </SizableText>
                            </YStack>
                        </XStack>

                        {/* Membership Section */}
                        {!studentId ? (
                            <BILoginButton />
                        ) : membership ? (
                            <YStack>
                                <Card
                                    bordered
                                    borderColor={getMembershipColor()}
                                    backgroundColor={isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'}
                                    borderWidth={2}
                                >
                                    <XStack 
                                        padding="$3" 
                                        space="$3" 
                                        alignItems="center" 
                                        justifyContent="space-between"
                                    >
                                        <XStack space="$2" alignItems="center">
                                            <MaterialCommunityIcons 
                                                name="crown" 
                                                size={24} 
                                                color={getMembershipColor()} 
                                            />
                                            <YStack>
                                                <SizableText 
                                                    color={getMembershipColor()}
                                                    fontWeight="bold"
                                                    fontSize="$5"
                                                >
                                                   Member -  {membership.name}
                                                </SizableText>
                                                <XStack space="$1" alignItems="center">
                                                    <MaterialCommunityIcons 
                                                        name="calendar" 
                                                        size={14} 
                                                        color={isDarkMode ? 'white' : 'black'}
                                                    />
                                                    <SizableText fontSize="$3" opacity={0.8}>
                                                        Expires: {formatExpiryDate(membership.expiryDate)}
                                                    </SizableText>
                                                </XStack>
                                            </YStack>
                                        </XStack>
                                        <Button
                                            size="$3"
                                            icon={<MaterialCommunityIcons 
                                                name="chevron-right" 
                                                size={20} 
                                                color="white" 
                                            />}
                                            circular
                                            onPress={() => openModal()}
                                            backgroundColor={getMembershipColor()}
                                            opacity={0.8}
                                        />
                                    </XStack>
                                </Card>
                            </YStack>
                        ) : (
                            <Button 
                                onPress={() => openModal()} 
                                variant="outlined"
                                icon={<MaterialCommunityIcons 
                                    name="crown" 
                                    size={20} 
                                    color={isDarkMode ? 'white' : 'black'} 
                                />}
                                backgroundColor={isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'}
                                borderColor="$blue8"
                            >
                                Get BISO Membership
                            </Button>
                        )}
                    </YStack>
            </Card>
        </SafeAreaView>
    );
}