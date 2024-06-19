import { useLocalSearchParams } from "expo-router";
import { ChatWindow } from "@/components/chat/chat-window";

export default function ChatScreen() {
    const params = useLocalSearchParams<{ id: string }>();

    if (!params.id) {
        return null;
    }
    
    return <ChatWindow chatGroupId={params.id} />;
}