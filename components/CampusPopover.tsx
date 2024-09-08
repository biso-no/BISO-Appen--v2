import { Popover, Button, Text, YGroup, XStack, Separator, H4, View } from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";
import { useCampus } from "@/lib/hooks/useCampus";
import { ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import { useEffect, useState } from "react";
import { capitalizeFirstLetter } from "@/lib/utils/helpers";
import { databases, getDocuments } from "@/lib/appwrite";
import { Models, Query } from "react-native-appwrite";
import MaskedView from '@react-native-masked-view/masked-view';

export default function CampusPopover() {
    const { campus, onChange } = useCampus();
    const [open, setOpen] = useState(false);
    const [campuses, setCampuses] = useState<Models.DocumentList<Models.Document>>();

    const handleCampusChange = async (newCampus: Models.Document) => {
        await onChange(newCampus);
        setOpen(false);
    };

    useEffect(() => {
        databases.listDocuments('app', 'campus', [
            Query.select(['name', '$id']),
        ]).then((data) => {
            setCampuses(data);
        });
    }, []);

    return (
        <Popover size="$4" open={open}>
            <Popover.Trigger asChild>
                <Button chromeless onPress={() => setOpen(!open)} style={{ paddingHorizontal: 15, paddingVertical: 5 }}>
                    <MaskedView
                        maskElement={
                            <XStack alignItems="center" justifyContent="center">
                                <View width={140} height={40} justifyContent="center">
                                    {campus?.name &&                                     <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: 16 }}>
                                        BISO {` ${capitalizeFirstLetter(campus?.name)}`}
                                    </Text>
                                    }
                                    {!campus?.name && <Text>Select Campus</Text>}
                                </View>
                                {open ? <ChevronUp /> : <ChevronDown />}
                            </XStack>
                        }
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: 180, height: 40 }}
                    >
                        <LinearGradient
                            start={[0, 0]}
                            end={[0, 1]}
                            themeInverse
                            theme="accent"
                            colors={['$color', '$color2']}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </MaskedView>
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