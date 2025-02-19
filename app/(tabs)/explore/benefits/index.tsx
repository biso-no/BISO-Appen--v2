import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, Image, ScrollView, XStack, H3, H4, Text, Button } from "tamagui";
import { useEffect, useState } from 'react';
import { Shield, Ticket, Coffee, Gift, ChevronRight } from '@tamagui/lucide-icons';
import { Link } from 'expo-router';
import { useAuth } from '@/components/context/auth-provider';

interface Benefit {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    link: string;
}

export default function BenefitsScreen() {
    const { data } = useAuth();
    const isAuthenticated = data?.$id !== null;

    const benefits: Benefit[] = [
        {
            id: 'biso-lunch',
            title: 'BISO Lunch',
            description: 'Enjoy exclusive access to our subsidized lunch program at the BISO Café',
            icon: <Coffee size="$1" />,
            link: '/explore/benefits/lunch' as const
        },
        {
            id: 'event-discounts',
            title: 'Event Discounts',
            description: 'Get special member prices on all BISO events and activities',
            icon: <Ticket size="$1" />,
            link: '/explore/events' as const
        },
        {
            id: 'exclusive-events',
            title: 'Exclusive Events',
            description: 'Access to member-only events and early bird tickets',
            icon: <Gift size="$1" />,
            link: '/explore/events/exclusive' as const
        },
        {
            id: 'member-perks',
            title: 'Member Perks',
            description: 'Additional benefits with our partners and at campus facilities',
            icon: <Shield size="$1" />,
            link: '/explore/benefits/perks' as const
        }
    ];

    return (
        <ScrollView>
            <MyStack>
                <YStack gap="$4" padding="$4">
                    <H3>Membership Benefits</H3>
                    {!isAuthenticated ? (
                        <Card bordered padding="$4" animation="bouncy">
                            <YStack gap="$3">
                                <H4>Become a Member</H4>
                                <Paragraph>Join BISO to unlock exclusive benefits and be part of our community</Paragraph>
                                <Link href="/auth/signIn" asChild>
                                    <Button themeInverse>Sign In to Access Benefits</Button>
                                </Link>
                            </YStack>
                        </Card>
                    ) : null}
                    
                    <YStack gap="$4">
                        {benefits.map((benefit) => (
                            <Link key={benefit.id} href={benefit.link as any} asChild>
                                <Card bordered pressStyle={{ scale: 0.98 }} animation="bouncy">
                                    <XStack padding="$4" gap="$4" alignItems="center">
                                        <YStack backgroundColor="$color5" padding="$3" borderRadius="$4">
                                            {benefit.icon}
                                        </YStack>
                                        <YStack flex={1} gap="$2">
                                            <H4>{benefit.title}</H4>
                                            <Paragraph>{benefit.description}</Paragraph>
                                        </YStack>
                                        <ChevronRight size="$1" />
                                    </XStack>
                                </Card>
                            </Link>
                        ))}
                    </YStack>
                </YStack>
            </MyStack>
        </ScrollView>
    );
}