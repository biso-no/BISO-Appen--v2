import { Popover, Button, Text, YGroup, XStack, Separator, H4 } from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";
import { useCampus } from "@/lib/hooks/useCampus";
import { ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import { useEffect, useState } from "react";
import { capitalizeFirstLetter } from "@/lib/utils/helpers";
import { databases, getDocuments } from "@/lib/appwrite";
import { Models, Query } from "react-native-appwrite";
import { Text as RNText } from "react-native";
import { useFonts } from 'expo-font';
import * as Expo from 'expo';
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
            console.log(data);
            setCampuses(data);
        });
    }, []);

    return (
        <Popover size="$4" open={open}>
            <Popover.Trigger asChild>
                <Button chromeless onPress={() => setOpen(!open)}>
                    <XStack alignItems="center">
                        <MaskedView maskElement={<H4>BISO</H4>} style={{ width: 50, height: 30 }}>
                            <LinearGradient
                                start={[0, 0]}
                                end={[0, 1]}
                                themeInverse
                                theme="accent"
                                colors={['$color', '$color2']}
                                style={{ width: 50, height: 30 }}
                            />
                        </MaskedView>
                        
                        <MaskedView maskElement={<H4 color="$color2" themeInverse theme="accent" fontSize={18}>{` ${capitalizeFirstLetter(campus?.name || "Select Campus")}`}</H4>} style={{ width: 80, height: 30 }}>
                            <LinearGradient
                                start={[0, 0]}
                                end={[0, 1]}
                                themeInverse
                                theme="accent"
                                colors={['$color', '$color2']}
                                style={{ width: 80, height: 30 }}
                            />
                        </MaskedView>
                        <MaskedView maskElement={open ? <ChevronUp /> : <ChevronDown />} style={{ width: 20, height: 20 }}>
                            <LinearGradient
                                start={[0, 0]}
                                end={[0, 1]}
                                themeInverse
                                theme="accent"
                                colors={['$color', '$color2']}
                                style={{ width: 20, height: 20 }}
                            />
                        </MaskedView>
                    </XStack>
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
