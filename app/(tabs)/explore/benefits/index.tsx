import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, Image, ScrollView, XStack, H3, Text, Button } from "tamagui";
import { useEffect, useState } from 'react';
import { Models } from "react-native-appwrite";
import { useCampus } from "@/lib/hooks/useCampus";
import { Ticket, Calendar, Coffee, Gift, Tag, Star } from '@tamagui/lucide-icons';
import { MotiView } from 'moti';

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
}

const benefits: Benefit[] = [
  {
    id: 'events',
    title: 'Event Discounts',
    description: 'Get exclusive discounts on all BISO events',
    icon: Ticket,
    color: 'purple',
  },
  {
    id: 'exclusive',
    title: 'Exclusive Events',
    description: 'Access to member-only events and activities',
    icon: Star,
    color: 'orange',
  },
  {
    id: 'lunch',
    title: 'BISO Lunch',
    description: 'Special lunch deals and discounts',
    icon: Coffee,
    color: 'blue',
  },
  {
    id: 'deals',
    title: 'Partner Deals',
    description: 'Exclusive discounts from our partners',
    icon: Tag,
    color: 'green',
  },
];

const BenefitCard = ({ benefit }: { benefit: Benefit }) => {
  return (
    <MotiView
      from={{ 
        opacity: 0,
        scale: 0.9,
        translateY: 20
      }}
      animate={{ 
        opacity: 1,
        scale: 1,
        translateY: 0
      }}
      transition={{
        type: 'spring',
        damping: 18,
        mass: 0.8
      }}
    >
      <Card
        elevate
        size="$4"
        bordered
        animation="quick"
        scale={0.9}
        hoverStyle={{ scale: 0.925 }}
        pressStyle={{ scale: 0.875 }}
      >
        <Card.Header padded>
          <XStack gap="$3" alignItems="center">
            <YStack
              backgroundColor={`$${benefit.color}3`}
              padding="$3"
              borderRadius="$4"
            >
              <benefit.icon
                size={24}
                color={`var(--${benefit.color}11)`}
              />
            </YStack>
            <YStack>
              <H3>{benefit.title}</H3>
              <Paragraph theme="alt2">{benefit.description}</Paragraph>
            </YStack>
          </XStack>
        </Card.Header>
      </Card>
    </MotiView>
  );
};

export default function BenefitsScreen() {
  return (
    <ScrollView>
      <MyStack>
        <YStack padding="$4" gap="$4">
          <YStack gap="$2">
            <H3>Member Benefits</H3>
            <Paragraph theme="alt2">
              Enjoy exclusive perks and discounts with your BISO membership
            </Paragraph>
          </YStack>
          
          <YStack gap="$4">
            {benefits.map((benefit) => (
              <BenefitCard key={benefit.id} benefit={benefit} />
            ))}
          </YStack>
        </YStack>
      </MyStack>
    </ScrollView>
  );
}