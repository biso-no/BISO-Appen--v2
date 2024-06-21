import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { View, TextInput } from 'react-native';
import { Input } from 'tamagui';

interface OTPInputProps {
    numberOfDigits: number;
    onChange: (otp: string) => void;
}

export function OTPInput({ numberOfDigits, onChange }: OTPInputProps) {
    const [otp, setOtp] = useState<string[]>(Array(numberOfDigits).fill(''));
    const inputs = useRef<(TextInput | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    useEffect(() => {
        onChange(otp.join(''));
    }, [otp, onChange]);

    const handleChangeText = (text: string, index: number) => {
        const newOtp = [...otp];
        if (text.length > 1) {
            // Handle paste
            const pastedText = text.split('').slice(0, numberOfDigits);
            for (let i = 0; i < pastedText.length; i++) {
                if (i + index < numberOfDigits) {
                    newOtp[i + index] = pastedText[i];
                }
            }
            setOtp(newOtp);
            // Move focus to the last input that was filled
            const nextIndex = Math.min(index + pastedText.length, numberOfDigits - 1);
            inputs.current[nextIndex]?.focus();
        } else {
            // Handle single character input
            newOtp[index] = text;
            setOtp(newOtp);
            // Move focus to the next input field
            if (text && index < numberOfDigits - 1) {
                inputs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (otp[index] === '' && index > 0) {
                setOtp(prevOtp => {
                    const newOtp = [...prevOtp];
                    newOtp[index - 1] = '';
                    return newOtp;
                });
                inputs.current[index - 1]?.focus();
            } else {
                setOtp(prevOtp => {
                    const newOtp = [...prevOtp];
                    newOtp[index] = '';
                    return newOtp;
                });
            }
        }
    };

    const handleFocus = (index: number) => setFocusedIndex(index);
    const handleBlur = () => setFocusedIndex(null);

    return (
        <View style={styles.container}>
            {otp.map((digit, index) => (
                <Input
                    key={index}
                    style={[
                        styles.input,
                        focusedIndex === index && styles.focusedInput,
                    ]}
                    value={digit}
                    onChangeText={(text) => handleChangeText(text, index)}
                    keyboardType="numeric"
                    maxLength={numberOfDigits}
                    ref={(input) => (inputs.current[index] = input)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => handleFocus(index)}
                    onBlur={handleBlur}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    input: {
        width: 50,
        height: 50,
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 5,
        textAlign: 'center',
        fontSize: 18,
    },
    focusedInput: {
        borderColor: '#007AFF',
    },
});
