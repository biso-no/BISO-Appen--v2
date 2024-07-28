import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import { Sheet, SheetProps } from '@tamagui/sheet'
import { Dispatch, SetStateAction, useState } from 'react'
import { Button, H2, XStack, YStack, Input, Label, RadioGroup } from 'tamagui'

const membershipOptions = [
  { label: '1 Semester - 350 kr', value: '350', size: '$5' },
  { label: '1 Year - $550 kr', value: '550', size: '$5' },
  { label: '3 Years - $1350 kr', value: '1350', size: '$5' },
]

const paymentMethods = [
  { label: 'Credit Card', value: 'credit-card', size: '$5' },
  { label: 'Vipps', value: 'vipps', size: '$5' },
]

type SnapPointsMode = 'percent' | 'constant' | 'fit' | 'mixed'

interface MembershipModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const MembershipModal = ({ open, setOpen }: MembershipModalProps) => {
  const [position, setPosition] = useState(0)
  const [modal, setModal] = useState(true)
  const [selectedMembership, setSelectedMembership] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [snapPointsMode, setSnapPointsMode] = useState<SnapPointsMode>('percent')
  const snapPoints = snapPointsMode === 'percent' ? [85, 50, 25] : ['80%', 256, 190]

  const initiatePurchase = () => {
    // Handle purchase logic here
    console.log('Initiating purchase with:', {
      membership: selectedMembership,
      paymentMethod: selectedPaymentMethod,
    })
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
          onValueChange={(value) => setSelectedMembership(value)}
        >
          <YStack width={300} alignItems="center" space="$2">
            {membershipOptions.map((option) => (
              <RadioGroupItemWithLabel key={option.value} size={option.size} value={option.value} label={option.label} />
            ))}
          </YStack>
        </RadioGroup>

        <H2>Select Payment Method</H2>
        <RadioGroup
          aria-labelledby="Select a payment method"
          name="paymentMethod"
          onValueChange={(value) => setSelectedPaymentMethod(value)}
        >
          <YStack width={300} alignItems="center" space="$2">
            {paymentMethods.map((method) => (
              <RadioGroupItemWithLabel key={method.value} size={method.size} value={method.value} label={method.label} />
            ))}
          </YStack>
        </RadioGroup>

        <Button size="$6" onPress={initiatePurchase} disabled={!selectedMembership || !selectedPaymentMethod}>
          Purchase
        </Button>
      </Sheet.Frame>
    </Sheet>
  )
}

function RadioGroupItemWithLabel(props: { size: string, value: string, label: string }) {
  const id = `radiogroup-${props.value}`

  return (
    <XStack width={300} alignItems="center" space="$4">
      <RadioGroup.Item value={props.value} id={id} size={props.size}>
        <RadioGroup.Indicator />
      </RadioGroup.Item>
      <Label size={props.size} htmlFor={id}>
        {props.label}
      </Label>
    </XStack>
  )
}
