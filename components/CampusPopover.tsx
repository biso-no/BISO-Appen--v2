import { Popover, Button, Text, YGroup, XStack, Separator, H4 } from "tamagui";
import { useCampus } from "@/lib/hooks/useCampus";
import { ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import { useState } from "react";
import { capitalizeFirstLetter } from "@/lib/utils/helpers";

const campuses = ['bergen', 'oslo', 'stavanger', 'trondheim', 'national']

export default function CampusPopover() {

    const { campus, onChange } = useCampus();
    const [open, setOpen] = useState(false);

    const handleCampusChange = (newCampus: string) => {
        onChange(newCampus);
        setOpen(false);
    };

    return (
        <Popover size="$4" open={open}>
            <Popover.Trigger asChild>
                <Button chromeless onPress={() => setOpen(!open)}>
                    <H4 fontSize={18}>BISO {capitalizeFirstLetter(campus)}</H4> 
                    {open ? <ChevronUp /> : <ChevronDown />}
                </Button>
            </Popover.Trigger>
            <Popover.Content
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          'quick',
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
      >

                <YGroup space="$2">
                    {campuses.map((campus) => (
                        <YGroup.Item
                            key={campus}
                        >
                            <Button onPress={() => handleCampusChange(campus)} chromeless>
                            <Text>{capitalizeFirstLetter(campus)}</Text>
                            </Button>
                            {campuses.indexOf(campus) !== campuses.length - 1 && <Separator/>}
                        </YGroup.Item>
                    ))}
                </YGroup>

            </Popover.Content>
        </Popover>
    );
}