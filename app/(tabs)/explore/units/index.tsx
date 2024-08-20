import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, Image, ScrollView, XGroup, H3, Separator } from "tamagui";
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
            const departments = await getDepartments(campus?.$id)
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
                <>
                <Card chromeless key={department.$id} width="100%" padding="$3" borderRadius="$3" onPress={() => router.push(`/explore/units/${department.$id}`)}>
                    <Card.Header>
                        <YStack>
                            <XGroup marginRight={10}>
                                <Image
                                    source={{ uri: department.logo }}
                                    alt="Department icon"
                                    width={40}
                                    height={40}
                                />
                                <H3>{department.Name}</H3>
                            </XGroup>

                        </YStack>
                    </Card.Header>
                </Card>
                <Separator key={'sep' + department.$id} />
                </>
            ))}
        </MyStack>
        </ScrollView>
        </>
    )
}