import { useState, type RefObject } from "react";
import { TextInput, StyleSheet, Platform } from "react-native";
import { Input, View } from "tamagui";

interface OTPInputProps {
  codes: string[];
  refs: RefObject<TextInput>[];
  errorMessages: string[] | undefined;
  onChangeCode: (text: string, index: number) => void;
  length?: number;
}

interface OTPInputConfig {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  errorColor: string;
  focusColor: string;
}

export function OTPInput({
  codes,
  refs,
  errorMessages,
  onChangeCode,
  length
}: OTPInputProps) {
  return (
    <View flexDirection="row" justifyContent="center" alignItems="center">
      {Array.from({ length: length ?? 6 }, (_, index) => (
        <Input
          key={index}
          ref={refs[index]}
          value={codes[index]}
          onChangeText={(text) => onChangeCode(text, index)}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
          style={{
            width: 40,
            height: 50,
            marginHorizontal: 5,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 5,
            fontSize: 18,
            ...(Platform.OS === "ios" && {
              paddingVertical: 10,
            }),
          }}
          onKeyPress={({ nativeEvent: { key } }) => {
            if (key === "Backspace" && codes[index] === "" && index > 0) {
              refs[index - 1]?.current?.focus();
            }
          }}
        />
      ))}
    </View>
  );
}