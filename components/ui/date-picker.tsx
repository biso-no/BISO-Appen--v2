import { useEffect, useState, useCallback } from "react";
import { Pressable } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { XStack, Input } from "tamagui";
import { Calendar, Clock } from "@tamagui/lucide-icons";

interface datePickerProps {
    date?: Date;
    type: "date" | "time";
    confirmText?: string;
    cancelText?: string;
    accentColor?: string;
    textColor?: string;
    buttonTextColorIOS?: string;
    onChange?: (date: Date) => void;
    onConfirm?: (date: Date) => void;
}

export function DateTimePicker(props: datePickerProps) {
    const [show, setShow] = useState(false);
    const [date, setDate] = useState(props.date);

    useEffect(() => {
        setDate(props.date);
    }, [props.date]);

    const hideDatePicker = useCallback(() => {
        setShow(false);
    }, []);

    const handleConfirm = useCallback(
        (selectedDate: Date) => {
            setDate(selectedDate);
            props.onConfirm && props.onConfirm(selectedDate);
            hideDatePicker();
        },
        [props, hideDatePicker]
    );

    const type = props.type || "date";

    return (
        <Pressable onPress={() => setShow(true)}>
            <XStack alignItems={"center"} justifyContent="flex-end">
                <Input pointerEvents="none" editable={false} flexGrow={1}>
                    {type === "date" && date?.toLocaleDateString()}
                    {type === "time" && date?.toLocaleTimeString()}
                </Input>
                <XStack paddingRight={10} position="absolute">
                    {type === "date" && <Calendar />}
                    {type === "time" && <Clock />}
                </XStack>
            </XStack>
            <DateTimePickerModal
                cancelTextIOS={props.cancelText}
                confirmTextIOS={props.confirmText}
                date={date}
                isVisible={show}
                mode={type}
                accentColor={props.accentColor}
                textColor={props.textColor}
                buttonTextColorIOS={props.buttonTextColorIOS}
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
            />
        </Pressable>
    );
}