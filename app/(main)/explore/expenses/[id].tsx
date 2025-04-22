import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { MotiView } from 'moti';
import { getDocument } from "@/lib/appwrite";
import { 
  YStack, 
  H4, 
  H5, 
  H6, 
  Paragraph, 
  XStack, 
  Card, 
  Separator, 
  Button, 
  Text, 
  View, 
  Image, 
  ScrollView,
  Theme,
  Sheet,
  useTheme,
  Spinner,
  Avatar,
  Circle
} from "tamagui";
import { capitalizeFirstLetter } from "@/lib/utils/helpers";
import { formatDate, getFormattedDateFromString } from "@/lib/format-time";
import { Models } from "react-native-appwrite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Dimensions } from "react-native";
import { ArrowLeft, Calendar, Clock, CreditCard, DollarSign, FileText, MapPin, Tag } from "@tamagui/lucide-icons";

export interface Attachment { 
    url: string; 
    description: string; 
    date: string; 
    amount: string; 
}

interface Expense {
  bank_account: string;
  campus: string;
  department: Models.Document
  expenseAttachments: Attachment[];
  description: string;
  prepayment_amount: number;
  total: number;
  status: string;
};

export default function ExpenseScreen() {
    const params = useLocalSearchParams();
    const { id } = params;
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const screenWidth = Dimensions.get('window').width;
    
    const [expense, setExpense] = useState<Models.Document>();
    const [loading, setLoading] = useState(true);
    const [viewingAttachment, setViewingAttachment] = useState<Attachment | null>(null);

    useEffect(() => {
        getDocument('expense', id as string)
            .then(data => {
                setExpense(data);
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <View flex={1} justifyContent="center" alignItems="center" padding="$4">
                <Spinner size="large" color="$blue10" />
                <Paragraph marginTop="$4" color="$gray11">Loading expense details...</Paragraph>
            </View>
        );
    }

    if (!expense?.$id) {
        return (
            <View flex={1} justifyContent="center" alignItems="center" padding="$4">
                <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'timing', duration: 500 }}
                >
                    <YStack alignItems="center" gap="$4">
                        <Circle size={80} backgroundColor="$gray5">
                            <FileText size={40} color={theme?.gray11?.val || "$gray11"} />
                        </Circle>
                        <H5>Expense not found</H5>
                        <Paragraph color="$gray11" textAlign="center">
                            We couldn't find the expense you're looking for. It may have been deleted or moved.
                        </Paragraph>
                        <Button 
                            size="$4" 
                            theme="blue" 
                            onPress={() => router.back()}
                            icon={ArrowLeft}
                            marginTop="$4"
                        >
                            Back to Expenses
                        </Button>
                    </YStack>
                </MotiView> 
            </View>
        );
    }

    const statusColors = {
        pending: { bg: '$yellow4', text: '$yellow10' },
        approved: { bg: '$green4', text: '$green10' },
        rejected: { bg: '$red4', text: '$red10' },
        completed: { bg: '$blue4', text: '$blue10' },
    };
    
    const status = expense.status?.toLowerCase() || 'pending';
    const statusColor = statusColors[status as keyof typeof statusColors] || statusColors.pending;

    return (
        <ScrollView
            flex={1}
            contentContainerStyle={{
                paddingBottom: insets.bottom + 20,
            }}
        >
            <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 500 }}
            >
                {/* Header with back button */}
                <XStack 
                    alignItems="center" 
                    paddingHorizontal="$4" 
                    paddingTop="$4"
                    paddingBottom="$4"
                >
                    <Button
                        size="$3"
                        circular
                        icon={ArrowLeft}
                        onPress={() => router.back()}
                        theme="gray"
                        marginRight="$3"
                    />
                    <H4 numberOfLines={1} flex={1}>Expense Details</H4>
                </XStack>
                
                {/* Main content */}
                <YStack padding="$4" gap="$6">
                    {/* Main expense image */}
                    {expense?.expenseAttachments[0]?.url && (
                        <Card
                            elevate
                            animation="bouncy"
                            scale={0.95}
                            pressStyle={{ scale: 0.975 }}
                            onPress={() => setViewingAttachment(expense.expenseAttachments[0])}
                        >
                            <Image
                                source={{ uri: expense.expenseAttachments[0].url }}
                                alt="Receipt image"
                                height={200}
                                width="100%"
                                resizeMode="cover"
                                borderRadius="$6"
                            />
                        </Card>
                    )}
                    
                    {/* Main expense details */}
                    <Card
                        bordered
                        borderRadius="$6"
                        padding="$4"
                    >
                        <YStack gap="$3">
                            <H5>{expense?.description}</H5>
                            
                            <XStack alignItems="center" gap="$2">
                                <MapPin size={16} color={theme?.gray11?.val || "$gray11"} />
                                <Paragraph color="$gray11">
                                    {capitalizeFirstLetter(expense?.campus?.name || expense?.campus || 'Unknown campus')}
                                </Paragraph>
                            </XStack>
                            
                            <XStack alignItems="center" gap="$2">
                                <Calendar size={16} color={theme?.gray11?.val || "$gray11"} />
                                <Paragraph color="$gray11">
                                    {formatDate(new Date(expense?.$createdAt))}
                                </Paragraph>
                            </XStack>
                            
                            <Separator />
                            
                            <XStack alignItems="center" justifyContent="space-between">
                                <XStack alignItems="center" gap="$2">
                                    <CreditCard size={16} color={theme?.gray11?.val || "$gray11"} />
                                    <Paragraph>Prepayment</Paragraph>
                                </XStack>
                                <Paragraph fontWeight="bold">{expense?.prepayment_amount.toFixed(2)} kr</Paragraph>
                            </XStack>
                            
                            <XStack alignItems="center" justifyContent="space-between">
                                <XStack alignItems="center" gap="$2">
                                    <DollarSign size={16} color={theme?.gray11?.val || "$gray11"} />
                                    <Paragraph>Total</Paragraph>
                                </XStack>
                                <Paragraph fontWeight="bold">{expense?.total.toFixed(2)} kr</Paragraph>
                            </XStack>
                            
                            <Separator />
                            
                            <XStack justifyContent="space-between" alignItems="center">
                                <XStack alignItems="center" gap="$2">
                                    <Tag size={16} color={theme?.gray11?.val || "$gray11"} />
                                    <Paragraph>Status</Paragraph>
                                </XStack>
                                <View
                                    backgroundColor={statusColor.bg}
                                    paddingHorizontal="$3"
                                    paddingVertical="$1"
                                    borderRadius="$4"
                                >
                                    <Paragraph
                                        color={statusColor.text}
                                        fontWeight="bold"
                                        textTransform="capitalize"
                                    >
                                        {expense?.status}
                                    </Paragraph>
                                </View>
                            </XStack>
                        </YStack>
                    </Card>
                    
                    {/* Additional attachments */}
                    {expense?.expenseAttachments.length > 1 && (
                        <YStack gap="$4">
                            <H5>Attachments</H5>
                            <YStack gap="$3">
                                {expense.expenseAttachments.slice(1).map((attachment: Attachment, index: number) => (
                                    <Card
                                        key={index}
                                        elevate
                                        animation="bouncy"
                                        scale={0.95}
                                        pressStyle={{ scale: 0.975 }}
                                        onPress={() => setViewingAttachment(attachment)}
                                    >
                                        <XStack gap="$3">
                                            <Image
                                                source={{ uri: attachment.url }}
                                                alt="attachment"
                                                height={90}
                                                width={90}
                                                borderRadius="$4"
                                            />
                                            <YStack flex={1} justifyContent="space-between" padding="$2">
                                                <YStack>
                                                    <Paragraph fontWeight="bold" numberOfLines={2}>
                                                        {attachment.description || 'Attachment'}
                                                    </Paragraph>
                                                    
                                                    <XStack alignItems="center" gap="$1" marginTop="$1">
                                                        <Calendar size={14} color={theme?.gray10?.val || "$gray10"} />
                                                        <Paragraph size="$2" color="$gray10">
                                                            {formatDate(new Date(attachment.date))}
                                                        </Paragraph>
                                                    </XStack>
                                                </YStack>
                                                
                                                <Paragraph fontWeight="bold" textAlign="right">
                                                    {attachment.amount} kr
                                                </Paragraph>
                                            </YStack>
                                        </XStack>
                                    </Card>
                                ))}
                            </YStack>
                        </YStack>
                    )}
                </YStack>
            </MotiView>
            
            {/* Full-screen image viewer */}
            <Sheet
                forceRemoveScrollEnabled={!!viewingAttachment}
                modal
                open={!!viewingAttachment}
                onOpenChange={(open: boolean) => {
                    if (!open) setViewingAttachment(null);
                }}
                snapPoints={[90]}
                position={90}
                dismissOnSnapToBottom
            >
                <Sheet.Overlay 
                    animation="lazy" 
                    enterStyle={{ opacity: 0 }} 
                    exitStyle={{ opacity: 0 }}
                />
                <Sheet.Frame padding="$0">
                    <Sheet.Handle />
                    <YStack padding="$4" gap="$4">
                        <Button 
                            size="$3"
                            icon={ArrowLeft}
                            onPress={() => setViewingAttachment(null)}
                            alignSelf="flex-start"
                        >
                            Close
                        </Button>
                        
                        {viewingAttachment && (
                            <YStack gap="$4" alignItems="center">
                                <Image
                                    source={{ uri: viewingAttachment.url }}
                                    alt="attachment"
                                    height={400}
                                    width="100%"
                                    resizeMode="contain"
                                />
                                
                                {viewingAttachment.description && (
                                    <Paragraph textAlign="center" fontWeight="bold">
                                        {viewingAttachment.description}
                                    </Paragraph>
                                )}
                                
                                <XStack justifyContent="space-between" width="100%" marginTop="$2">
                                    {viewingAttachment.date && (
                                        <Paragraph color="$gray11">
                                            {formatDate(new Date(viewingAttachment.date))}
                                        </Paragraph>
                                    )}
                                    {viewingAttachment.amount && (
                                        <Paragraph fontWeight="bold">
                                            {viewingAttachment.amount} kr
                                        </Paragraph>
                                    )}
                                </XStack>
                            </YStack>
                        )}
                    </YStack>
                </Sheet.Frame>
            </Sheet>
        </ScrollView>
    );
}
