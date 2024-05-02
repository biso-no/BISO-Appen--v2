import { FeaturedCard } from "../ui/card";
import { YStack, H5, Image } from "tamagui";

interface NewsProps {
    title: string
    description: string
    urlToImage: string
    tags?: string[]
    url: string
}

const news: NewsProps[] = [
    {
        title: "Lorem",
        description: "Ipsum",
        urlToImage: "https://picsum.photos/200/300",
        tags: ["news", "tech"],
        url: "https://picsum.photos/200/300"
    }
]

export function Featured() {
    return (
        <YStack width="90%" justifyContent="center" alignItems="center" space="$4">
            {news.map((news, index) => (
                <FeaturedCard key={index} title={news.title} description={news.description} urlToImage={news.urlToImage} tags={news.tags} url={news.url} />
            ))}
        </YStack>
    )
}