import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, Image, ScrollView, XGroup, H3 } from "tamagui";
import { getDepartments } from "@/lib/appwrite";
import { useState, useEffect } from 'react';
import type { Models } from "react-native-appwrite";

export default function DepartmentsScreen() {

    const [departments, setDepartments] = useState<Models.DocumentList<Models.Document>>();

    useEffect(() => {
        async function fetchDepartments() {
            const departments = await getDepartments()
            console.log(departments)
            setDepartments(departments)
        }
        fetchDepartments()
    }, [])


    return (
        <ScrollView>
        <MyStack>
            {departments?.documents.map(department => (
                <Card key={department.$id} width="100%" padding="$3" backgroundColor="$background" borderRadius="$3" bordered>
                    <Card.Header>
                        <YStack>
                            <XGroup marginRight={10}>
                                <Image
                                    source={{ uri: department.logo }}
                                    alt="Department icon"
                                    width={40}
                                    height={40}
                                />
                            </XGroup>
                            <H3>{department.name}</H3>
                        </YStack>
                    </Card.Header>
                    <Card.Footer>
                        <Paragraph>{department.description}</Paragraph>
                    </Card.Footer>
                </Card>
            ))}
        </MyStack>
        </ScrollView>
    )
}