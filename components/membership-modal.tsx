import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { databases, triggerFunction } from '@/lib/appwrite';
import { Sheet } from '@tamagui/sheet';
import { Models, Query, RealtimeResponseEvent } from 'react-native-appwrite';
import { Button, H2, XStack, YStack, Input, Label, RadioGroup, Image, Text } from 'tamagui';
import { usePathname } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSubscription } from '@/lib/subscription';
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

type SnapPointsMode = 'percent' | 'constant' | 'fit' | 'mixed';

interface MembershipModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const MembershipModal = ({ open, setOpen }: MembershipModalProps) => {
  const [position, setPosition] = useState(0);
  const [modal, setModal] = useState(true);
  const [selectedMembership, setSelectedMembership] = useState<Models.Document | undefined>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [membershipOptions, setMembershipOptions] = useState<Models.DocumentList<Models.Document>>();
  const [snapPointsMode, setSnapPointsMode] = useState<SnapPointsMode>('percent');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldSubscribe, setShouldSubscribe] = useState(false);
  const snapPoints = snapPointsMode === 'percent' ? [85, 50, 25] : ['80%', 256, 190];
  const timeoutDuration = 15000; // 1 minute
  const [buttonTitle, setButtonTitle] = useState('Buy BISO membership');

  const pathName = usePathname();
  const { data, profile, isBisoMember } = useAuth();

  useEffect(() => {
    if (isBisoMember === true) {
      setOpen(false);
    }
  }, [isBisoMember]);

  const initiatePurchase = async () => {
    setIsLoading(true);
    if (!selectedMembership) {
      console.error("No membership selected");
      setIsLoading(false);
      return;
    }

    if (!selectedPaymentMethod) {
      console.error("No payment method selected");
      setIsLoading(false);
      return;
    }

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
        console.log("Response Body:", execution);
        const responseBody = JSON.parse(execution.responseBody) as ApiResponse;
        console.log("Response Body:", responseBody.checkout.data);
        const url = responseBody.checkout.data.redirectUrl;
        let result = await WebBrowser.openAuthSessionAsync(url, '/profile');
        console.log("Result:", result);

        if (result.type === 'success') {
          console.log("Successfully opened the URL");
        } else if (result.type === 'dismiss') {
          console.log("User dismissed the URL");
          setIsLoading(false);
          setShouldSubscribe(true); // Start listening for changes after dismissal
        }
      }
    } catch (error) {
      console.error("Error during purchase initiation", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchMemberships = async () => {
      const response = await databases.listDocuments('app', 'memberships', [
        Query.select(['membership_id', 'price', 'name', '$id']),
      ]);

      if (response.documents) {
        setMembershipOptions(response);
      }
    };
    fetchMemberships();
  }, []);

  if (!membershipOptions) {
    return <Text>Loading...</Text>;
  }

  if (!profile) {
    return null;
  }


  

  return (
    <Sheet
      forceRemoveScrollEnabled={open}
      modal={modal}
      open={open}
      onOpenChange={setOpen}
      snapPoints={snapPoints}
      snapPointsMode={snapPointsMode}
      dismissOnSnapToBottom
      position={position}
      onPositionChange={setPosition}
      zIndex={100_000}
      animation="medium"
    >
      <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Handle />
      <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" space="$5">
        <H2>Select Membership</H2>
        <RadioGroup
          aria-labelledby="Select a membership"
          name="membership"
          onValueChange={(value) => {
            const membership = membershipOptions?.documents?.find((option) => option.membership_id === value);
            console.log("Selected Membership:", membership);
            setSelectedMembership(membership);
          }}
        >
          <YStack width={300} alignItems="center" space="$2">
            {membershipOptions?.documents?.map((option) => {
              const label = option.name + ' - ' + option.price + ' kr';
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
          onValueChange={(value) => {
            console.log("Selected Payment Method:", value);
            setSelectedPaymentMethod(value);
          }}
        >
          <YStack width={300} alignItems="center" space="$2">
            {paymentMethods.map((method) => (
              <RadioGroupItemWithLabel key={method.value} size={method.size} value={method.value} label={method.label} />
            ))}
          </YStack>
        </RadioGroup>
        <Button onPress={initiatePurchase} disabled={isLoading} chromeless>
          <Image source={require('@/assets/images/vipps2.png')} />
        </Button>
      </Sheet.Frame>
    </Sheet>
  );
};

function RadioGroupItemWithLabel(props: { size: string; value: string; label: string }) {
  const id = `radiogroup-${props.value}`;

  return (
    <XStack width={300} alignItems="center" space="$4">
      <RadioGroup.Item value={props.value} id={id} size={props.size}>
        <RadioGroup.Indicator />
      </RadioGroup.Item>
      <Label size={props.size} htmlFor={id}>
        {props.label}
      </Label>
    </XStack>
  );
}