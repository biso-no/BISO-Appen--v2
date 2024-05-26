import type { CardProps } from 'tamagui'
import { Button, Card as DefaultCard, H5, Paragraph, XStack, YStack, Image } from 'tamagui'
import { useRouter } from 'expo-router'


interface NewsProps {
    title: string
    description: string
    urlToImage: string
    url: string
    tags?: string[]
}

export function FeaturedCard(props: NewsProps) {

    const { push } = useRouter()

    return (
      <DefaultCard bordered width="90%" height={300} onPress={() => push(props.url)}>
        <DefaultCard.Header padded>
          <Image
            source={{ uri: props.urlToImage }}
            alt="image"
            height={200}
            width={350}
            borderRadius="$10"
            />
        </DefaultCard.Header>
        <DefaultCard.Footer padded>
            <YStack space="$1">
          <H5>{props.title}</H5>
          <XStack space="$3">
            {props.tags?.map((tag) => (
              <Button key={tag} size="$3" bordered>
                {tag}
              </Button>
            ))}
          </XStack>
            </YStack>
        </DefaultCard.Footer>
      </DefaultCard>
    )
  }