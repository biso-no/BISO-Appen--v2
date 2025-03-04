import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { databases, triggerFunction } from '@/lib/appwrite';
import { Sheet } from '@tamagui/sheet';
import { Models, Query } from 'react-native-appwrite';
import { Button, H2, XStack, YStack, Label, RadioGroup, Image, Text } from 'tamagui';
import { usePathname } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/components/context/auth-provider';

const paymentMethods = [
  { label: 'Credit Card', value: 'CARD', size: '$5' },
  { label: 'Vipps MobilePay', value: 'WALLET', size: '$5' },
];

interface ApiResponse {
  checkout: {
    ok: boolean;
    data: {
      redirectUrl: string;
      reference: string;
    };
  };
}

interface MembershipModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const MembershipModal = ({ open, setOpen }: MembershipModalProps) => {
  const [selectedMembership, setSelectedMembership] = useState<Models.Document | undefined>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [membershipOptions, setMembershipOptions] = useState<Models.DocumentList<Models.Document>>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pathName = usePathname();
  const { isBisoMember, data } = useAuth();

  useEffect(() => {
    if (isBisoMember === true) {
      setOpen(false);
    }
  }, [isBisoMember, setOpen]);

  useEffect(() => {
    if (data?.$id) {
    const fetchMemberships = async () => {
      try {
        const response = await databases.listDocuments('app', 'memberships', [
          Query.select(['membership_id', 'price', 'name', '$id']),
          Query.equal('status', true)
        ]);
        setMembershipOptions(response);
      } catch (error) {
        console.error("Error fetching memberships:", error);
        setError("Failed to load membership options. Please try again later.");
      }
    };
    fetchMemberships();
    }

  }, []);

  const initiatePurchase = async () => {
    if (!selectedMembership) {
      setError("Please select a membership.");
      return;
    }

    if (!selectedPaymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const body = {
      amount: selectedMembership.price,
      description: selectedMembership.name,
      returnUrl: 'biso://' + pathName,
      membershipId: selectedMembership.$id,
      membershipName: selectedMembership.name,
      paymentMethod: selectedPaymentMethod,
    };

    try {
      const execution = await triggerFunction({
        functionId: 'vipps_checkout',
        data: JSON.stringify(body),
        async: false,
      });

      if (execution.responseBody) {
        const responseBody = JSON.parse(execution.responseBody) as ApiResponse;
        const url = responseBody.checkout.data.redirectUrl;
        
        // Open the URL and wait for the result
        const result = await WebBrowser.openAuthSessionAsync(url, '/profile');
        
        if (result.type === 'success') {
          // Handle successful purchase
          console.log("Purchase successful");
          setOpen(false);
        } else {
          // Handle cancelled or failed purchase
          setError("Purchase was not completed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error during purchase initiation", error);
      setError("An error occurred while processing your purchase. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!membershipOptions) {
    return null;
  }

  return (
    <Sheet
      forceRemoveScrollEnabled={open}
      modal={true}
      open={open}
      onOpenChange={setOpen}
      snapPoints={[85]}
      dismissOnSnapToBottom
      zIndex={100_000}
      animation="medium"
    >
      <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Handle />
      <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" gap="$5">
        <H2>Select Membership</H2>
        <RadioGroup
          aria-labelledby="Select a membership"
          name="membership"
          onValueChange={(value) => {
            const membership = membershipOptions?.documents?.find((option) => option.membership_id === value);
            setSelectedMembership(membership);
          }}
        >
          <YStack width={300} alignItems="center" gap="$2">
            {membershipOptions?.documents?.map((option) => {
              const label = `${option.name} - ${option.price} kr`;
              return (
                <RadioGroupItemWithLabel key={option.$id} size="$5" value={option.membership_id} label={label} />
              );
            })}
          </YStack>
        </RadioGroup>

        <H2>Select Payment Method</H2>
        <RadioGroup
          aria-labelledby="Select a payment method"
          name="paymentMethod"
          onValueChange={setSelectedPaymentMethod}
        >
          <YStack width={300} alignItems="center" gap="$2">
            {paymentMethods.map((method) => (
              <RadioGroupItemWithLabel key={method.value} size={method.size} value={method.value} label={method.label} />
            ))}
          </YStack>
        </RadioGroup>
        
        {error && <Text color="$red10">{error}</Text>}
        
        <Button 
          onPress={initiatePurchase} 
          disabled={isLoading || !selectedMembership || !selectedPaymentMethod}
        >
          {isLoading ? 'Processing...' : 'Buy BISO membership'}
        </Button>
      </Sheet.Frame>
    </Sheet>
  );
};

function RadioGroupItemWithLabel({ size, value, label }: { size: string; value: string; label: string }) {
  const id = `radiogroup-${value}`;
  return (
    <XStack width={300} alignItems="center" gap="$4">
      <RadioGroup.Item value={value} id={id} size={size}>
        <RadioGroup.Indicator />
      </RadioGroup.Item>
      <Label size={size} htmlFor={id}>
        {label}
      </Label>
    </XStack>
  );
}