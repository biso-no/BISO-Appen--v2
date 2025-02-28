import { Card, Image, Stack, View, YStack, Text, styled, AnimatePresence } from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";
import { Pressable, Animated, Platform } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useCampus } from "@/lib/hooks/useCampus";
import { router } from "expo-router";
import CompactWeather from "@/components/CompactWeather";
import { Campus } from "@/lib/get-weather";

type CampusId = "1" | "2" | "3" | "4";

type CampusImageMap = {
    [key in CampusId]: any;
};

const CAMPUS_NAMES: Record<CampusId, string> = {
    "1": "Oslo",
    "2": "Bergen",
    "3": "Trondheim",
    "4": "Stavanger"
};

// Map campus IDs to Campus enum values
const CAMPUS_ID_TO_ENUM: Record<CampusId, Campus> = {
    "1": Campus.OSLO,
    "2": Campus.BERGEN,
    "3": Campus.TRONDHEIM,
    "4": Campus.STAVANGER
};

const StyledCard = styled(Card, {
    pressStyle: {
        scale: 0.98,
    },
    animation: 'quick',
});

const ShimmerView = styled(Animated.View, {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
});

export function CampusHero() {
    const { campus } = useCampus();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPressed, setIsPressed] = useState(false);
    
    // Animation values
    const shimmerAnim = useRef(new Animated.Value(-200)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const imageTranslateY = useRef(new Animated.Value(0)).current;

    // Pre-require all images to avoid dynamic requires
    const campusImages: CampusImageMap = {
        "1": require("@/assets/images/campus-oslo.jpg"),
        "2": require("@/assets/images/campus-bergen.jpeg"),
        "3": require("@/assets/images/campus-trd.jpeg"),
        "4": require("@/assets/images/campus-stv.jpeg"),
    };

    useEffect(() => {
        if (campus) {
            setIsLoading(false);
        }
    }, [campus]);

    // Shimmer animation
    useEffect(() => {
        if (isLoading) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerAnim, {
                        toValue: 400,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shimmerAnim, {
                        toValue: -200,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [isLoading]);

    if (!campus?.$id) {
        return null;
    }

    const campusId = campus.$id as CampusId;
    const campusName = campus.name.toLowerCase().replace(/\s+/g, '-');
    
    const handlePressIn = () => {
        setIsPressed(true);
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.95,
                useNativeDriver: true,
            }),
            Animated.spring(imageTranslateY, {
                toValue: -10,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        setIsPressed(false);
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.spring(imageTranslateY, {
                toValue: 0,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePress = () => {
        router.push(`/campus/${campusName}`);
    };

    return (
        <YStack width="100%" marginVertical="$4">
            <AnimatePresence>
                <StyledCard 
                    width="100%" 
                    height={160} 
                    borderRadius="$6" 
                    overflow="hidden"
                    elevation={2}
                    {...(Platform.OS === 'ios' ? {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                    } : {})}
                    animation="quick"
                >
                    <Pressable 
                        onPress={handlePress}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        style={{ width: '100%', height: '100%' }}
                        android_ripple={{ color: 'rgba(255, 255, 255, 0.3)' }}
                    >
                        <Animated.View 
                            style={{ 
                                width: '100%', 
                                height: '100%',
                                transform: [
                                    { scale: scaleAnim }
                                ]
                            }}
                        >
                            <Animated.View style={{
                                width: '100%',
                                height: '100%',
                                transform: [
                                    { translateY: imageTranslateY }
                                ]
                            }}>
                                <Image
                                    source={campusImages[campusId]}
                                    resizeMode="cover"
                                    width="100%"
                                    height="100%"
                                    alt={`${CAMPUS_NAMES[campusId]} campus`}
                                />
                            </Animated.View>
                            <LinearGradient
                                start={[0, 0]}
                                end={[0, 1]}
                                fullscreen
                                colors={[
                                    'rgba(0,0,0,0.1)',
                                    isPressed ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.6)'
                                ]}
                                position="absolute"
                            />
                            {isLoading && (
                                <ShimmerView
                                    style={{
                                        transform: [{ translateX: shimmerAnim }],
                                        backgroundColor: 'white',
                                    }}
                                />
                            )}
                            <YStack
                                position="absolute"
                                bottom="$4"
                                left="$4"
                                right="$4"
                                gap="$1"
                            >
                                <Animated.View style={{
                                    transform: [{ scale: Animated.add(1, Animated.multiply(scaleAnim, -0.05)) }]
                                }}>
                                    <Text 
                                        color="white" 
                                        fontSize={24}
                                        lineHeight={28}
                                        fontWeight="700"
                                        shadowColor="black"
                                        shadowOffset={{ width: 0, height: 1 }}
                                        shadowOpacity={0.3}
                                        shadowRadius={2}
                                    >
                                        {CAMPUS_NAMES[campusId]}
                                    </Text>
                                </Animated.View>
                                <Animated.View style={{
                                    transform: [{ scale: Animated.add(1, Animated.multiply(scaleAnim, -0.1)) }],
                                    opacity: Animated.add(1, Animated.multiply(scaleAnim, -0.2))
                                }}>
                                    <Stack 
                                        flexDirection="row" 
                                        justifyContent="space-between" 
                                        alignItems="center"
                                    >
                                        <Text 
                                            color="white" 
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="400"
                                            opacity={0.95}
                                            shadowColor="black"
                                            shadowOffset={{ width: 0, height: 1 }}
                                            shadowOpacity={0.3}
                                            shadowRadius={2}
                                        >
                                            Tap to explore campus details
                                        </Text>
                                        
                                        {/* Weather component */}
                                        <CompactWeather 
                                            campus={CAMPUS_ID_TO_ENUM[campusId]} 
                                            color="white" 
                                        />
                                    </Stack>
                                </Animated.View>
                            </YStack>
                        </Animated.View>
                    </Pressable>
                </StyledCard>
            </AnimatePresence>
        </YStack>
    );
}