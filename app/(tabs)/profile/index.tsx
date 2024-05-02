import { View, Text, Image, H1, H2, Button } from 'tamagui'
import { FormCard, Hide } from '@/components/auth/layout'
import { useMedia } from 'tamagui'
import { useAppwriteAccount } from '@/components/context/auth-context'
import { useRouter } from 'expo-router'

export default function ProfileScreen() {
  const isMobile = useMedia().xs

  const { data } = useAppwriteAccount()

  const router = useRouter()
  

  return (
    <FormCard>
      <View
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="$6"
        $gtSm={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Image
            src="https://www.example.com/avatar.jpg" // Replace with your placeholder or user's avatar URL
            width={isMobile ? 100 : 150}
            height={isMobile ? 100 : 150}
            borderRadius="$6"
          />
          <Hide when="xs">
            <View mt="$4">
              <H1 size="$6">John Doe</H1>
              <Text color="$color7">
                Software Engineer
              </Text>
            </View>
          </Hide>
        </View>
        <Hide when="gtSm">
          <View mt="$4">
            <H1 size="$6">John Doe</H1>
            <Text color="$color7">
              Software Engineer
            </Text>
          </View>
        </Hide>
        <View flexDirection="column" gap="$2">
          <Button onPress={() => router.push('/profile/onboarding/')}>
            Edit Profile
          </Button>
          <Button>
            Settings
          </Button>
          <Button>
            Log Out
          </Button>
        </View>
      </View>
    </FormCard>
  )
}