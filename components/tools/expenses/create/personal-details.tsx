import { Text, XGroup, YStack, Input, Label, Button, YGroup } from 'tamagui'
import { useState, useEffect } from 'react'
import { getDocument, createDocument, updateDocument } from '@/lib/appwrite'
import { useAuth } from '@/components/context/auth-provider'
import { Models } from 'appwrite'

export function PersonalDetails({ user }: { user: Models.User<Models.Preferences> }) {
    

    const { data, isLoading, profile } = useAuth()
    const [isEditing, setIsEditing] = useState(false)

    const [personalDetails, setPersonalDetails] = useState({
        name: '',
        email: '',
        phone: ''
    })

    const handleSave = async () => {
        const personalDetails = {
            name: user.name,
            email: user.email,
            phone: user.phone
        }

        await updateDocument('users', user.$id, personalDetails)
    }

    if (isEditing) {
        
    return (
        <YStack>
            <YGroup>
                <Label>Name</Label>
                <Input
                    value={personalDetails.name}
                    onChangeText={(text) => setPersonalDetails({ ...personalDetails, name: text })}
                />
            </YGroup>
            <YGroup>
                <Label>Email</Label>
                <Input
                    value={personalDetails.email}
                    onChangeText={(text) => setPersonalDetails({ ...personalDetails, email: text })}
                />
            </YGroup>
            <YGroup>
                <Label>Phone</Label>
                <Input
                    value={personalDetails.phone}
                    onChangeText={(text) => setPersonalDetails({ ...personalDetails, phone: text })}
                />
            </YGroup>

            <Button
                onPress={handleSave}
            >
                Save
            </Button>
        </YStack>
    )

    }

    return (
        <YStack>
            <XGroup>
                <Label>Name</Label>
                <Text>{user.name}</Text>
            </XGroup>
            <XGroup>
                <Label>Email</Label>
                <Text>{user.email}</Text>
            </XGroup>
            <XGroup>
                <Label>Phone</Label>
                <Text>{user.phone}</Text>
            </XGroup>
            <Button
                onPress={() => setIsEditing(true)}
            >
                Edit
            </Button>
        </YStack>
    )

}