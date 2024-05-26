import { H1, H2, Text, View, YStack, Button, XStack, Select, Label } from 'tamagui'
import React, { useState } from 'react'
import { SelectCampusDemo } from '@/components/select-campus'
import { FormCard } from '@/components/auth/layout'
import { Input } from '@/components/auth/input'
import { useAppwriteAccount } from '@/components/context/auth-context'

enum Campus {
    Bergen = "bergen",
    Oslo = "oslo",
    Trondheim = "trondheim",
    Stavanger = "stavanger",
    Undefined = "",
}

interface UserPreferences {
    campus: Campus
    features: string[]
    studentID: string
}

export default function Onboarding() {
    const [preferences, setPreferences] = useState<UserPreferences>({
        campus: Campus.Undefined,
        features: [],
        studentID: '',
    })
    const [name, setName] = useState('')
    const [step, setStep] = useState(1)

    const { updateName, updatePrefs } = useAppwriteAccount()

    const handleNext = () => {
        setStep(step + 1)
    }

    const handleNameChange = (name: string) => {
        setName(name)
    }

    const handleCampusChange = (campus: Campus) => {
        
        setPreferences({ ...preferences, campus })
    }

    const handleFeaturesChange = (features: string[]) => {
        setPreferences({ ...preferences, features })
    }

    const handleStudentIDChange = (studentID: string) => {
        setPreferences({ ...preferences, studentID })
    }

    return (
        <FormCard>
                  <View
        flexDirection="column"
        alignItems="stretch"
        minWidth="100%"
        maxWidth="100%"
        gap="$4"
        $gtSm={{
          width: 400,
        }}
      >
            <H1>Welcome to BISO</H1>

            {step === 1 && (
                <View>
                                <Input size="$4">
              <Input.Label htmlFor="name">Name</Input.Label>
              <Input.Box>
                <Input.Area
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={handleNameChange}
                />
              </Input.Box>
            </Input>
                    <Button onPress={() => {
                        updateName(name)
                        handleNext()
                    }}>Next</Button>
                </View>
            )}
            {step === 2 && (
                <View>
                    <SelectCampusDemo />
                    <Button onPress={handleNext}>Next</Button>
                </View>
            )}

      </View>
    </FormCard>
    )
}