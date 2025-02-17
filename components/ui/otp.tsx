import React, { useState, useRef, useCallback } from 'react'
import { TextInput } from 'react-native'
import { Input, XStack, getTokens, useTheme } from 'tamagui'

interface OTPInputProps {
  length?: number
  onComplete?: (code: string) => void
  size?: 'small' | 'medium' | 'large'
}

export const OTPInput: React.FC<OTPInputProps> = ({ 
  length = 6, 
  onComplete,
  size = 'medium'
}) => {
  const [otp, setOTP] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<(TextInput | null)[]>([])
  const theme = useTheme()

  const sizes = {
    small: {
      width: 35,
      height: 35,
      fontSize: 16,
    },
    medium: {
      width: 40,
      height: 40,
      fontSize: 18,
    },
    large: {
      width: 50,
      height: 50,
      fontSize: 20,
    },
  }

  const handleChange = useCallback((value: string, index: number) => {
    const newOTP = [...otp]
    newOTP[index] = value.slice(-1)
    setOTP(newOTP)

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newOTP.every(digit => digit !== '')) {
      onComplete?.(newOTP.join(''))
    }
  }, [otp, length, onComplete])

  const handleKeyPress = useCallback((e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }, [otp])

  return (
    <XStack gap="$1.5" justifyContent="center">
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={el => inputRefs.current[index] = el}
          value={digit}
          onChangeText={(value) => handleChange(value, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
          width={sizes[size].width}
          height={sizes[size].height}
          fontSize={sizes[size].fontSize}
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius="$2"
          focusStyle={{ borderColor: theme?.blue10?.get() }}
        />
      ))}
    </XStack>
  )
}