import { Popover, Button, Text, YGroup, XStack, Separator, H4 } from "tamagui";
import { useCampus } from "@/lib/hooks/useCampus";
import { ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import { useEffect, useState } from "react";
import { capitalizeFirstLetter } from "@/lib/utils/helpers";
import { getDocuments } from "@/lib/appwrite";
import { Models } from "react-native-appwrite";

export default function CampusPopover() {
    const { campus, onChange } = useCampus();
    const [open, setOpen] = useState(false);
    const [campuses, setCampuses] = useState<Models.DocumentList<Models.Document>>();

    const handleCampusChange = async (newCampus: Models.Document) => {
        await onChange(newCampus);
        setOpen(false);
    };

    useEffect(() => {
        getDocuments('campus').then(setCampuses);
    }, []);

    return (
        <Popover size="$4" open={open}>
            <Popover.Trigger asChild>
                <Button chromeless onPress={() => setOpen(!open)}>
                    <H4 fontSize={18}>BISO {capitalizeFirstLetter(campus?.name || "Select Campus")}</H4>
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
                    {campuses?.documents.map((campus) => (
                        <YGroup.Item key={campus.$id}>
                            <Button onPress={() => handleCampusChange(campus)} chromeless>
                                <Text>{capitalizeFirstLetter(campus.name)}</Text>
                            </Button>
                            {campuses.documents.indexOf(campus) !== campuses.documents.length - 1 && <Separator />}
                        </YGroup.Item>
                    ))}
                </YGroup>
            </Popover.Content>
        </Popover>
    );
}
