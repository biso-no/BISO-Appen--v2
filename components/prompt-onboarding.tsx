import { AlertDialog, Button, XStack, YStack } from 'tamagui'
import { useAuth } from "@/components/context/auth-provider";
import { useRouter } from "expo-router";
import * as AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";

export function PromptOnboarding() {

    const [open, setOpen] = useState(false);

    const { data, profile, isLoading, updateUserPrefs } = useAuth();

    const { push } = useRouter();

    useEffect(() => {
        if (data?.$id && !profile?.name && !isLoading) {
            async function getPromptOnboarding() {
                //If there is a value in Async storage, or it is set to true, then we dont need to prompt the user as they have already been asked. 
                const promptOnboarding = data?.prefs.promptOnboarding;
                console.log("Prompt onboarding: ", promptOnboarding);
                if (promptOnboarding === null || promptOnboarding === 'true' || promptOnboarding === undefined) {
                    setOpen(true);
                    AsyncStorage.default.setItem('promptOnboarding', 'true');
                }
            }
            getPromptOnboarding();
        }

     }, [data?.$id, profile?.name]);

    const onCancel = () => {
        async function setShouldNotPromptOnboarding() {
            await updateUserPrefs('promptOnboarding', false);
        }
        setOpen(false);
        setShouldNotPromptOnboarding();
    }

    const onAccept = async () => {
        await updateUserPrefs('promptOnboarding', false);
        setOpen(false);
        push('/onboarding');
    }

  return (

    <AlertDialog open={open} onOpenChange={setOpen}>

      <AlertDialog.Trigger asChild>
        {null}

      </AlertDialog.Trigger>
      <AlertDialog.Portal>

        <AlertDialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <AlertDialog.Content
          bordered
          elevate
          key="content"
          animation={[
            'quick',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          x={0}
          scale={1}
          opacity={1}
          y={0}
        >

          <YStack space>

            <AlertDialog.Title>Welcome to BISO!</AlertDialog.Title>

            <AlertDialog.Description>

              Would like to set up your profile?

            </AlertDialog.Description>
            <XStack gap="$3" justifyContent="flex-end">

              <AlertDialog.Cancel asChild>

                <Button onPress={onCancel}>Don't ask again</Button>

              </AlertDialog.Cancel>

              <AlertDialog.Action asChild>

                <Button onPress={onAccept} theme="active">Take me there</Button>

              </AlertDialog.Action>

            </XStack>

          </YStack>

        </AlertDialog.Content>

      </AlertDialog.Portal>

    </AlertDialog>

  )

}