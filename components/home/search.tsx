import { Sheet, Input, YStack, Button, H5, XStack, SizableText, Theme } from "tamagui";
import React, { useState } from "react";
import { Tabs } from "tamagui";
import { useTheme } from "tamagui";

interface SearchProps {
    modalOpen: boolean;
    setModalOpen: (open: boolean) => void;
}

export function Search({ modalOpen, setModalOpen }: SearchProps) {

    const theme = useTheme();


    return (
        <Sheet
            modal
            open={modalOpen}
            onOpenChange={setModalOpen}
            dismissOnSnapToBottom
        >
                   <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Handle />
            <Sheet.Frame
                padding="$4"
                borderRadius="$2"
                backgroundColor="$background"
            >
                <Sheet.ScrollView flex={1} gap="$4">
                    <Input
                        placeholder="Search"
                        borderColor="$accentColor"

                    />
                <Tabs defaultValue="latest" width={400} flexDirection="column">
                    <Tabs.List gap="$4">
                        <Tabs.Tab value="latest">
                            <SizableText>Latest</SizableText></Tabs.Tab>
                        <Tabs.Tab value="popular">
                            <SizableText>Popular</SizableText></Tabs.Tab>
                    </Tabs.List>
                <Tabs.Content value="latest">
                    <LatestSearches />
                </Tabs.Content>
                <Tabs.Content value="popular">
                    <PopularSearches />
                </Tabs.Content>
                </Tabs>
                </Sheet.ScrollView>
            </Sheet.Frame>
        </Sheet>
    );
}

function LatestSearches() {

    return (
        <YStack>
            <H5>Latest Searches</H5>
            <XStack gap="$3">
                <Button>See all</Button>
            </XStack>
        </YStack>
    );
}

function PopularSearches() {

    return (
        <YStack>
            <H5>Popular Searches</H5>
            <XStack gap="$3">
                <Button>See all</Button>
            </XStack>
        </YStack>
    );
}