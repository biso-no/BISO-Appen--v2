import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, useWindowDimensions, Platform, RefreshControl, Pressable } from 'react-native';
import { 
  H1, H2, H3, H4, Paragraph, YStack, XStack, Button, Image, Text, 
  Card, Theme, useTheme, Sheet, Adapt, Dialog, Separator
} from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, MotiScrollView, AnimatePresence, motify } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate,
  withSpring,
  Extrapolation
} from 'react-native-reanimated';
import { 
  ChevronRight, 
  MapPin, 
  Mail, 
  Users, 
  Briefcase, 
  Shield, 
  GraduationCap,
  Calendar,
  Gift,
  Building,
  X,
  ExternalLink,
  ShoppingBag
} from '@tamagui/lucide-icons';
import { useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import { useCampus } from '@/lib/hooks/useCampus';
import { BoardShowcase } from '@/components/board-showcase';
import { databases } from '@/lib/appwrite';
import { Models, Query } from 'react-native-appwrite';
import { mapCampus, mapCampusNameToId } from '@/lib/utils/map-campus';

interface TeamMember {
  name: string;
  role: string;
  imageUrl: string;
}

interface Campus extends Models.Document {
  name: string;
  campusData: CampusData
}

interface CampusData extends Models.Document {
  description: string;
  studentBenefits: string[];
  businessBenefits: string[];
  careerAdvantages: string[];
  socialNetwork: string[];
  safety: string[];
  location: string;
  departmentBoard: TeamMember[];
}


// Add type for router paths
type RouterPaths = {
  events: string;
  join: string;
  benefits: string;
  campus: string;
  contact: string;
  products: string;
  jobs: string;
};

// Add campus image mapping
const CAMPUS_IMAGES: Record<string, any> = {
  'oslo': require("@/assets/images/campus-oslo.jpg"),
  'bergen': require("@/assets/images/campus-bergen.jpeg"),
  'trondheim': require("@/assets/images/campus-trd.jpeg"),
  'stavanger': require("@/assets/images/campus-stv.jpeg"),
};

function ParallaxHeader({ campusData, slug }: { campusData: CampusData; slug: string }) {
  const { height: windowHeight, width } = useWindowDimensions();
  const scrollY = useSharedValue(0);
  const HEADER_HEIGHT = windowHeight * 0.45;
  const imageScale = useSharedValue(1);
  const imageTranslateY = useSharedValue(0);


  const headerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [HEADER_HEIGHT/2, 0, -HEADER_HEIGHT/3],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const imageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: imageScale.value,
        },
        {
          translateY: imageTranslateY.value,
        },
      ],
    };
  });

  return (
    <Animated.View style={[{ height: HEADER_HEIGHT, overflow: 'hidden' }, headerStyle]}>
      <Animated.View style={[{ height: HEADER_HEIGHT + 50 }, imageStyle]}>
        <Image
          source={CAMPUS_IMAGES[slug]}
          alt={`${campusData.name} campus`}
          style={{ width: '100%', height: '100%' }}
          objectFit="cover"
        />
      </Animated.View>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT,
          padding: 20,
          paddingBottom: 40,
          justifyContent: 'flex-end',
        }}
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <H1 
            color="white" 
            size="$10"
            shadowColor="black"
            shadowOffset={{ width: 0, height: 1 }}
            shadowOpacity={0.3}
            shadowRadius={2}
          >
            {campusData.name}
          </H1>
          <Paragraph 
            color="white" 
            size="$6" 
            marginTop="$2" 
            opacity={0.95}
            shadowColor="black"
            shadowOffset={{ width: 0, height: 1 }}
            shadowOpacity={0.3}
            shadowRadius={2}
          >
            {campusData.description}
          </Paragraph>
        </MotiView>
      </LinearGradient>
    </Animated.View>
  );
}

function QuickActionButton({ icon: Icon, title, color, onPress }: { 
  icon: any, 
  title: string, 
  color: string,
  onPress?: () => void 
}) {
  const colorScheme = useColorScheme();
  const getBackgroundColor = () => colorScheme === 'dark' ? `$${color}7` : `$${color}2`;
  const getIconColor = () => colorScheme === 'dark' ? `$${color}11` : `$${color}9`;

  return (
    <Button
      unstyled
      onPress={onPress}
      flexDirection="column"
      alignItems="center"
      gap="$2"
      flex={1}
      pressStyle={{ scale: 0.97 }}
    >
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <YStack
          backgroundColor={getBackgroundColor()}
          padding="$3"
          borderRadius="$5"
        >
          <Icon size={24} color={getIconColor()} />
        </YStack>
      </MotiView>
      <Text 
        color="$color" 
        fontSize={12} 
        textAlign="center"
        numberOfLines={1}
      >
        {title}
      </Text>
    </Button>
  );
}

function BenefitsModal({ 
  open, 
  onClose, 
  title, 
  items, 
  icon: Icon, 
  color 
}: { 
  open: boolean;
  onClose: () => void;
  title: string;
  items: string[];
  icon: any;
  color: string;
}) {
  const colorScheme = useColorScheme();
  const getIconColor = () => colorScheme === 'dark' ? `$${color}11` : `$${color}9`;
  
  return (
    <Sheet
      modal
      open={open}
      onOpenChange={(isOpen: boolean) => !isOpen && onClose()}
      snapPoints={[85]}
      position={0}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame>
        <Sheet.Handle />
        <YStack padding="$4" gap="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <XStack gap="$3" alignItems="center">
              <YStack
                backgroundColor={colorScheme === 'dark' ? `$${color}5` : `$${color}2`}
                padding="$2"
                borderRadius="$3"
              >
                <Icon size={24} color={getIconColor()} />
              </YStack>
              <H2>{title}</H2>
            </XStack>
            <Button
              size="$3"
              circular
              icon={X}
              onPress={onClose}
              backgroundColor="$backgroundHover"
            />
          </XStack>
          
          <YStack gap="$4">
            {items.map((item, index) => (
              <MotiView
                key={index}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: index * 50, type: 'spring', damping: 15 }}
              >
                <XStack gap="$3" alignItems="center">
                  <Text color={getIconColor()} fontSize={20}>•</Text>
                  <Text color="$color" fontSize={16}>{item}</Text>
                </XStack>
                {index < items.length - 1 && (
                  <Separator marginVertical="$2" />
                )}
              </MotiView>
            ))}
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}

function BenefitCard({ title, items, icon: Icon, color, delay = 0 }: {
  title: string;
  items: string[];
  icon: any;
  color: string;
  delay?: number;
}) {
  const [showModal, setShowModal] = useState(false);
  const colorScheme = useColorScheme();
  const getBackgroundColor = () => colorScheme === 'dark' ? `$${color}7` : `$${color}1`;
  const getBorderColor = () => colorScheme === 'dark' ? `$${color}5` : `$${color}3`;
  const getIconColor = () => colorScheme === 'dark' ? `$${color}11` : `$${color}9`;

  return (
    <>
      <MotiView
        from={{ opacity: 0, scale: 0.9, translateY: 20 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: 'spring', delay, damping: 15 }}
      >
        <YStack
          backgroundColor={getBackgroundColor()}
          borderColor={getBorderColor()}
          borderWidth={1}
          borderRadius="$4"
          padding="$4"
          gap="$3"
        >
          <XStack gap="$3" alignItems="center">
            <YStack
              backgroundColor={colorScheme === 'dark' ? `$${color}5` : `$${color}2`}
              padding="$2"
              borderRadius="$3"
            >
              <Icon size={20} color={getIconColor()} />
            </YStack>
            <H3 color="$color">{title}</H3>
          </XStack>
          
          <YStack gap="$2">
            {items.slice(0, 3).map((item, index) => (
              <MotiView
                key={index}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: delay + (index * 100), type: 'spring', damping: 15 }}
              >
                <XStack gap="$2" alignItems="center">
                  <Text color={getIconColor()}>•</Text>
                  <Text color="$color" opacity={0.9}>{item}</Text>
                </XStack>
              </MotiView>
            ))}
            {items.length > 3 && (
              <Button
                backgroundColor={getBackgroundColor()}
                borderColor={getBorderColor()}
                borderWidth={1}
                marginTop="$2"
                pressStyle={{ scale: 0.97 }}
                onPress={() => setShowModal(true)}
                icon={ExternalLink}
                iconAfter={ExternalLink}
              >
                <Text color={getIconColor()}>View all {items.length} benefits</Text>
              </Button>
            )}
          </YStack>
        </YStack>
      </MotiView>

      <BenefitsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={title}
        items={items}
        icon={Icon}
        color={color}
      />
    </>
  );
}

// Loading skeleton components
function SkeletonBox({ width, height, borderRadius = "$4", delay = 0 }: { 
  width: number | string, 
  height: number | string, 
  borderRadius?: string,
  delay?: number
}) {
  const colorScheme = useColorScheme();
  const baseColor = colorScheme === 'dark' ? '$gray5' : '$gray3';
  const highlightColor = colorScheme === 'dark' ? '$gray7' : '$gray1';
  
  return (
    <MotiView
      from={{ opacity: 0.4 }}
      animate={{ opacity: 0.8 }}
      transition={{
        type: 'timing',
        duration: 1000,
        loop: true,
        delay,
        repeatReverse: true
      }}
    >
      <YStack
        width={width}
        height={height}
        backgroundColor={baseColor}
        borderRadius={borderRadius}
      />
    </MotiView>
  );
}

function SkeletonParallaxHeader() {
  const { height: windowHeight } = useWindowDimensions();
  const HEADER_HEIGHT = windowHeight * 0.45;
  
  return (
    <YStack height={HEADER_HEIGHT} overflow="hidden">
      <SkeletonBox width="100%" height="100%" borderRadius="$0" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT,
          padding: 20,
          paddingBottom: 40,
          justifyContent: 'flex-end',
        }}
      >
        <YStack gap="$2">
          <SkeletonBox width={200} height={40} delay={100} />
          <SkeletonBox width="80%" height={20} delay={200} />
          <SkeletonBox width="60%" height={20} delay={300} />
        </YStack>
      </LinearGradient>
    </YStack>
  );
}

function SkeletonQuickActions() {
  return (
    <XStack 
      padding="$4" 
      gap="$4" 
      backgroundColor="$background"
      borderRadius="$4"
      margin="$4"
      marginTop="-$8"
      elevation={5}
      shadowColor="black"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.25}
      shadowRadius={8}
    >
      {[0, 1, 2, 3].map((i) => (
        <YStack key={i} flex={1} alignItems="center" gap="$2">
          <SkeletonBox width={50} height={50} borderRadius="$5" delay={i * 100} />
          <SkeletonBox width={40} height={12} delay={i * 100 + 50} />
        </YStack>
      ))}
    </XStack>
  );
}

function SkeletonBenefitCard({ delay = 0 }: { delay?: number }) {
  return (
    <YStack
      backgroundColor="$background"
      borderColor="$borderColor"
      borderWidth={1}
      borderRadius="$4"
      padding="$4"
      gap="$3"
    >
      <XStack gap="$3" alignItems="center">
        <SkeletonBox width={36} height={36} borderRadius="$3" delay={delay} />
        <SkeletonBox width={120} height={24} delay={delay + 100} />
      </XStack>
      
      <YStack gap="$3">
        {[0, 1, 2].map((i) => (
          <XStack key={i} gap="$2" alignItems="center">
            <SkeletonBox width={8} height={8} borderRadius="$circle" delay={delay + 200 + (i * 50)} />
            <SkeletonBox width="90%" height={16} delay={delay + 200 + (i * 50)} />
          </XStack>
        ))}
        <SkeletonBox width="50%" height={40} delay={delay + 400} />
      </YStack>
    </YStack>
  );
}

function SkeletonBoardShowcase({ delay = 0 }: { delay?: number }) {
  return (
    <YStack gap="$4">
      <XStack justifyContent="space-between" alignItems="center">
        <SkeletonBox width={150} height={24} delay={delay} />
        <SkeletonBox width={80} height={20} delay={delay + 50} />
      </XStack>
      
      <XStack gap="$4" flexWrap="wrap">
        {[0, 1, 2].map((i) => (
          <YStack key={i} width={100} alignItems="center" gap="$2">
            <SkeletonBox width={80} height={80} borderRadius="$circle" delay={delay + 100 + (i * 50)} />
            <SkeletonBox width={70} height={16} delay={delay + 150 + (i * 50)} />
            <SkeletonBox width={60} height={12} delay={delay + 200 + (i * 50)} />
          </YStack>
        ))}
      </XStack>
    </YStack>
  );
}

function SkeletonContactCard({ delay = 0 }: { delay?: number }) {
  return (
    <YStack
      backgroundColor="$background"
      borderColor="$borderColor"
      borderWidth={1}
      borderRadius="$4"
      padding="$4"
    >
      <XStack gap="$4" flexWrap="wrap">
        <XStack flex={1} gap="$2" alignItems="center" minWidth={200}>
          <SkeletonBox width={20} height={20} delay={delay} />
          <SkeletonBox width="80%" height={16} delay={delay + 50} />
        </XStack>
        <XStack flex={1} gap="$2" alignItems="center" minWidth={200}>
          <SkeletonBox width={20} height={20} delay={delay + 100} />
          <SkeletonBox width="80%" height={16} delay={delay + 150} />
        </XStack>
      </XStack>
    </YStack>
  );
}

function CampusLoadingState() {
  const { height: windowHeight } = useWindowDimensions();
  
  return (
    <AnimatePresence>
      <MotiScrollView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        contentContainerStyle={{
          minHeight: windowHeight,
          paddingBottom: 100
        }}
      >
        <YStack flex={1}>
          <SkeletonParallaxHeader />
          <SkeletonQuickActions />
          
          <YStack padding="$4" gap="$4" flex={1}>
            <SkeletonBenefitCard delay={200} />
            <SkeletonBenefitCard delay={400} />
            <SkeletonBenefitCard delay={600} />
            <SkeletonBoardShowcase delay={800} />
            <SkeletonContactCard delay={1000} />
          </YStack>
        </YStack>
      </MotiScrollView>
    </AnimatePresence>
  );
}

export default function CampusPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const theme = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { height: windowHeight } = useWindowDimensions();
  const { campus } = useCampus();
  const [campusData, setCampusData] = useState<CampusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync URL with campus context
  useEffect(() => {
    if (campus && campus.name.toLowerCase() !== slug?.toLowerCase()) {
      router.replace(`/campus/${campus.name.toLowerCase()}` as any);
    }
  }, [campus]);

  // Fetch campus data based on slug
  useEffect(() => {
    const fetchCampusData = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      
      // Get the campus ID from the slug name
      const campusId = mapCampusNameToId(slug);
      console.log("Campus ID for", slug, ":", campusId);
      
      try {
        const campusData = await databases.getDocument('app', 'campus_data', campusId);
        console.log("Campus data for", slug, ":", campusData);
        setCampusData(campusData as CampusData);
      } catch (error) {
        console.error("Error fetching campus data:", error);
      } finally {
        // Add a small delay to ensure smooth transition
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    }
    
    fetchCampusData();
  }, [slug]); // Only depend on slug changes

  const routerPaths: RouterPaths = {
    events: '/explore/events',
    join: '/explore/units',
    benefits: '/explore/benefits',
    campus: '/explore/campus',
    contact: '/contact',
    products: '/explore/products',
    jobs: '/explore/volunteer'
  };

  const onRefresh = () => {
    setRefreshing(true);
    setIsLoading(true);
    
    // Simulate refetch
    setTimeout(() => {
      setRefreshing(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleQuickAction = (action: keyof RouterPaths) => {
    const basePath = routerPaths[action];
    router.push(`${basePath}?campus=${slug}` as any);
  };

  // Show loading state
  if (isLoading) {
    return <CampusLoadingState />;
  }

  // Show error state if campus data not found
  if (!campusData) {
    return (
      <SafeAreaView>
        <YStack padding="$4" alignItems="center" justifyContent="center" height="100%">
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <YStack alignItems="center" gap="$4">
              <Building size={64} color="$gray9" />
              <H1>Campus not found</H1>
              <Paragraph textAlign="center">We couldn't find information for this campus.</Paragraph>
              <Button
                onPress={() => router.back()}
                marginTop="$4"
              >
                Go Back
              </Button>
            </YStack>
          </MotiView>
        </YStack>
      </SafeAreaView>
    );
  }

  const location = JSON.parse(campusData?.location as string);

  return (
    <AnimatePresence>
      <MotiScrollView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          minHeight: windowHeight,
          paddingBottom: 100 // Add padding for tab bar
        }}
      >
        <YStack flex={1}>
          <ParallaxHeader campusData={campusData} slug={slug as string} />

          {/* Quick Actions */}
          <XStack 
            padding="$4" 
            gap="$4" 
            backgroundColor="$background"
            borderRadius="$4"
            margin="$4"
            marginTop="-$8"
            elevation={5}
            shadowColor="black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.25}
            shadowRadius={8}
          >
            <QuickActionButton 
              icon={Calendar} 
              title="Events" 
              color="purple"
              onPress={() => handleQuickAction('events')}
            />
            <QuickActionButton 
              icon={Users} 
              title="Join Club" 
              color="blue"
              onPress={() => handleQuickAction('join')}
            />
            <QuickActionButton 
              icon={Briefcase} 
              title="Positions" 
              color="pink"
              onPress={() => handleQuickAction('jobs')}
            />
            <QuickActionButton 
              icon={ShoppingBag} 
              title="Products" 
              color="orange"
              onPress={() => handleQuickAction('products')}
            />
          </XStack>

          <YStack 
            padding="$4" 
            gap="$4"
            flex={1}
          >
            <BenefitCard
              title="For Students"
              items={campusData.studentBenefits}
              icon={GraduationCap}
              color="blue"
              delay={200}
            />

            <BenefitCard
              title="For Business"
              items={campusData.businessBenefits}
              icon={Briefcase}
              color="purple"
              delay={400}
            />

            <BenefitCard
              title="Career Benefits"
              items={campusData.careerAdvantages}
              icon={ChevronRight}
              color="pink"
              delay={600}
            />
            <BoardShowcase boardMembers={campusData.departmentBoard} title="Board Members" />
            {/* Contact Card */}
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 800 }}
            >
              <Pressable 
                onPress={() => {
                  router.push(`${routerPaths.contact}?campus=${slug}` as any);
                }}
              >
                <YStack
                  backgroundColor="$background"
                  borderColor="$borderColor"
                  borderWidth={1}
                  borderRadius="$4"
                  padding="$4"
                  pressStyle={{ scale: 0.97 }}
                  marginBottom="$8" // Add extra margin at the bottom
                >
                  <XStack gap="$4" flexWrap="wrap">
                    <XStack flex={1} gap="$2" alignItems="center" minWidth={200}>
                      <MapPin size={20} color={theme?.color?.get()} />
                      <Text color="$color" flex={1}>{location.address}</Text>
                    </XStack>
                    <XStack flex={1} gap="$2" alignItems="center" minWidth={200}>
                      <Mail size={20} color={theme?.color?.get()} />
                      <Text color="$color" flex={1}>{location.email}</Text>
                    </XStack>
                  </XStack>
                </YStack>
              </Pressable>
            </MotiView>
          </YStack>
        </YStack>
      </MotiScrollView>
    </AnimatePresence>
  );
}
