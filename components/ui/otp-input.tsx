import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { View, Input } from 'tamagui';

interface OTPInputProps {
    numberOfDigits: number;
    onChange: (otp: string) => void;
}

export function OTPInput({ numberOfDigits, onChange }: OTPInputProps) {
    
  const [otp, setOtp] = useState<string[]>(Array(numberOfDigits).fill(''));
  const inputs = useRef<(Input | null)[]>([]);

  useEffect(() => {
    onChange(otp.join(''));
  }, [otp, onChange]);

  const handleChangeText = (text: string, index: number) => {
    if (/^\d*$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Move focus to the next input field
      if (text && index < numberOfDigits - 1) {
        inputs.current[index + 1]?.focus();
      }

      // If text is empty and it's not the first input, move focus to the previous input
      if (!text && index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <Input
          key={index}
          style={styles.input}
          value={digit}
          onChangeText={(text) => handleChangeText(text, index)}
          keyboardType="numeric"
          maxLength={1}
          ref={(input) => (inputs.current[index] = input)}
          onKeyPress={(e) => handleKeyPress(e, index)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  input: {
    width: 40,
    height: 40,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 18,
  },
});
