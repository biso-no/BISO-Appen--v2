import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, Image, ScrollView, XGroup, H3 } from "tamagui";
import { getDepartments } from "@/lib/appwrite";
import { useState, useEffect } from 'react';
import type { Models } from "react-native-appwrite";
import { useCampus } from "@/lib/hooks/useCampus";
import CampusPopover from "@/components/CampusPopover";
import { Tabs, useRouter } from "expo-router";

export default function DepartmentsScreen() {

    const [departments, setDepartments] = useState<Models.DocumentList<Models.Document>>();

    const { campus } = useCampus();
    const router = useRouter();
    useEffect(() => {
        async function fetchDepartments() {
            const departments = await getDepartments(campus?.$id, true)
            console.log(departments)
            setDepartments(departments)
        }
        fetchDepartments()
    }, [campus?.$id])


    return (
        <>
        <ScrollView>
        <MyStack>
            {departments?.documents.map(department => (
                <Card key={department.$id} width="100%" padding="$3" backgroundColor="$background" borderRadius="$3" bordered onPress={() => router.push(`/explore/units/${department.$id}`)}>
                    <Card.Header>
                            <XGroup space="$3" alignItems="center" justifyContent="center">
                                {department.logo && (
                                <Image
                                    source={{ uri: department.logo }}
                                    alt="Department icon"
                                    width={60}
                                    height={60}
                                    borderRadius={10}
                                />
                                )}
                                <H3>{department.Name}</H3>
                            </XGroup>

                    </Card.Header>
                </Card>
            ))}
        </MyStack>
        </ScrollView>
        </>
    )
}