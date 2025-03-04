
import { Label, Separator, SizeTokens, Switch as TSwitch, XStack } from 'tamagui';

interface Props {
    label: string;
    size: SizeTokens;
    value: boolean;
    onValueChange: (value: boolean) => void;
}

export function Switch({ label, size, value, onValueChange }: Props) {


    return (
        <XStack width={200} alignItems="center" gap="$4">
            <Label
                paddingRight="$0"
                minWidth={90}
                justifyContent="flex-end"
                size={size}
                htmlFor="switch"
            >
                {label}
            </Label>
            <Separator minHeight={20} vertical />
            <TSwitch checked={value} onCheckedChange={onValueChange} size={size}>
                <TSwitch.Thumb animation="quicker" />
            </TSwitch>
        </XStack>
    );
}
