import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWindowDimensions, RefreshControl, Pressable, AppState } from 'react-native';
import { 
  H1, H2, H3, Paragraph, YStack, XStack, Button, Text, 
 useTheme, Sheet, Separator,
  View
} from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, MotiScrollView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { 
  ChevronRight, 
  MapPin, 
  Mail, 
  Users, 
  Briefcase, 
  GraduationCap,
  Calendar,
  Building,
  X,
  ExternalLink,
  ShoppingBag
} from '@tamagui/lucide-icons';
import { useColorScheme } from 'react-native';
import { useEffect, useState, useMemo, useCallback, memo, useRef } from 'react';
import { useCampus } from '@/lib/hooks/useCampus';
import { DepartmentMembersShowcase } from '@/components/board-showcase';
import { databases } from '@/lib/appwrite';
import { Models } from 'react-native-appwrite';
import { mapCampusNameToId } from '@/lib/utils/map-campus';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image as ExpoImage } from 'expo-image';
import { Asset } from 'expo-asset';
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';

// Define query keys for React Query
const QUERY_KEYS = {
  campus: 'campus',
}

// Use a more performant way to load images
// Add blurhash placeholders for faster perceived loading times
const CAMPUS_IMAGES: Record<string, any> = {
  'oslo': {
    uri: require("@/assets/images/campus-oslo.jpg"),
    blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
  },
  'bergen': {
    uri: require("@/assets/images/campus-bergen.jpeg"),
    blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
  },
  'trondheim': {
    uri: require("@/assets/images/campus-trd.jpeg"),
    blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
  },
  'stavanger': {
    uri: require("@/assets/images/campus-stv.jpeg"),
    blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
  },
};

// Fetch campus data function for React Query
const fetchCampusData = async (slug: string): Promise<Models.Document> => {

  if (!slug) throw new Error(i18next.t('no-campus-slug-provided'));
  
  const campusId = mapCampusNameToId(slug);
  
  const campusData = await databases.getDocument('app', 'campus_data', campusId);
  console.log("Campus Data: ", campusData);
  return campusData;
};

// Memoize ParallaxHeader for performance
const ParallaxHeader = memo(({ campusData, slug }: { campusData: Models.Document; slug: string }) => {
  const { height: windowHeight } = useWindowDimensions();
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

  // Use ExpoImage for better performance with caching
  return (
    <Animated.View style={[{ height: HEADER_HEIGHT, overflow: 'hidden' }, headerStyle]}>
      <Animated.View style={[{ height: HEADER_HEIGHT + 50 }, imageStyle]}>
        <ExpoImage
          source={CAMPUS_IMAGES[slug].uri}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={300}
          placeholderContentFit="cover"
          placeholder={CAMPUS_IMAGES[slug].blurhash ? { blurhash: CAMPUS_IMAGES[slug].blurhash } : undefined}
          priority="high"
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
});
ParallaxHeader.displayName = 'ParallaxHeader';

// Memoize QuickActionButton
const QuickActionButton = memo(({ icon: Icon, title, color, onPress }: { 
  icon: any, 
  title: string, 
  color: string,
  onPress?: () => void 
}) => {
  const colorScheme = useColorScheme();
  
  // Memoize color calculations
  const backgroundColor = useMemo(() => 
    colorScheme === 'dark' ? `$${color}7` : `$${color}2`,
  [colorScheme, color]);
  
  const iconColor = useMemo(() => 
    colorScheme === 'dark' ? `$${color}11` : `$${color}9`,
  [colorScheme, color]);

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
          backgroundColor={backgroundColor}
          padding="$3"
          borderRadius="$5"
        >
          <Icon size={24} color={iconColor} />
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
});
QuickActionButton.displayName = 'QuickActionButton';

// Memoize BenefitsModal
const BenefitsModal = memo(({ 
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
}) => {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  // Memoize color calculations
  const iconColor = useMemo(() => 
    colorScheme === 'dark' ? `$${color}11` : `$${color}9`,
  [colorScheme, color]);
  
  const snapPoints = useMemo(() => 
    [(items.length * 10)],
  [items.length]);

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={(isOpen: boolean) => !isOpen && onClose()}
      snapPoints={snapPoints}
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
                <Icon size={24} color={iconColor} />
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
                  <Text color={iconColor} fontSize={20}>{t('key')}</Text>
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
});
BenefitsModal.displayName = 'BenefitsModal';
// Memoize BenefitCard
const BenefitCard = memo(({ title, items, icon: Icon, color, delay = 0 }: {
  title: string;
  items: string[];
  icon: any;
  color: string;
  delay?: number;
}) => {
  const [showModal, setShowModal] = useState(false);
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  // Memoize color calculations
  const backgroundColor = useMemo(() => 
    colorScheme === 'dark' ? `$${color}7` : `$${color}1`,
  [colorScheme, color]);
  
  const borderColor = useMemo(() => 
    colorScheme === 'dark' ? `$${color}5` : `$${color}3`,
  [colorScheme, color]);
  
  const iconColor = useMemo(() => 
    colorScheme === 'dark' ? `$${color}11` : `$${color}9`,
  [colorScheme, color]);

  // Memoize handlers
  const handleOpenModal = useCallback(() => setShowModal(true), []);
  const handleCloseModal = useCallback(() => setShowModal(false), []);

  return (
    <View>
      <MotiView
        from={{ opacity: 0, scale: 0.9, translateY: 20 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: 'spring', delay, damping: 15 }}
      >
        <YStack
          backgroundColor={backgroundColor}
          borderColor={borderColor}
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
              <Icon size={20} color={iconColor} />
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
                  <Text color={iconColor}>{t('key-0')}</Text>
                  <Text color="$color" opacity={0.9}>{item}</Text>
                </XStack>
              </MotiView>
            ))}
            {items.length > 3 && (
              <Button
                backgroundColor={backgroundColor}
                borderColor={borderColor}
                borderWidth={1}
                marginTop="$2"
                pressStyle={{ scale: 0.97 }}
                onPress={handleOpenModal}
                icon={ExternalLink}
                iconAfter={ExternalLink}
              >
                <Text color={iconColor}>{t('view-all')} {items.length} {t('benefits')}</Text>
              </Button>
            )}
          </YStack>
        </YStack>
      </MotiView>

      <BenefitsModal
        open={showModal}
        onClose={handleCloseModal}
        title={title}
        items={items}
        icon={Icon}
        color={color}
      />
    </View>
  );
});
BenefitCard.displayName = 'BenefitCard';
// Loading skeleton components
// Memoizing skeleton components isn't necessary as they're only rendered during loading
function SkeletonBox({ width, height, borderRadius = "$4", delay = 0 }: { 
  width: number | string, 
  height: number | string, 
  borderRadius?: string,
  delay?: number
}) {
  const colorScheme = useColorScheme();
  const baseColor = colorScheme === 'dark' ? '$gray5' : '$gray3';
  
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
SkeletonBox.displayName = 'SkeletonBox';
// Combine all skeleton components into a single function
function CampusLoadingState() {
  const { height: windowHeight } = useWindowDimensions();
  const HEADER_HEIGHT = windowHeight * 0.45;
  
  const SkeletonParallaxHeader = () => (
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

  const SkeletonQuickActions = () => (
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

  const SkeletonBenefitCard = ({ delay = 0 }: { delay?: number }) => (
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

  const SkeletonBoardShowcase = ({ delay = 0 }: { delay?: number }) => (
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

  const SkeletonContactCard = ({ delay = 0 }: { delay?: number }) => (
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
CampusLoadingState.displayName = 'CampusLoadingState';
// Add lazy loaded components for better initial load time
const LazyDepartmentMembersShowcase = memo(({ campusId, title }: { campusId: string, title: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Only show department members when user has scrolled to that point
  useEffect(() => {
    // Delay loading the department members to prioritize critical content
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isVisible) {
    return (
      <YStack height={150} padding="$4">
        {/* Empty placeholder with proper height to prevent layout shifts */}
      </YStack>
    );
  }
  
  return <DepartmentMembersShowcase campusId={campusId} title={title} />;
});
LazyDepartmentMembersShowcase.displayName = 'LazyDepartmentMembersShowcase';
// Add global pre-loading for campus images
const preloadCampusImages = async () => {
  try {
    // Extract all image URIs from the campus images object
    const imageUris = Object.values(CAMPUS_IMAGES).map(img => img.uri);
    
    // Preload all images in parallel
    await Promise.all(imageUris.map(uri => Asset.fromModule(uri).downloadAsync()));
  } catch (error) {
    console.error('Failed to preload campus images:', error);
  }
};

// Call preload when app starts
preloadCampusImages();

export default function CampusPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const { campus } = useCampus();
  const queryClient = useQueryClient();
  const appState = useRef(AppState.currentState);
  const isInitialMount = useRef(true);
  const { t } = useTranslation();
  // Set up router paths as memoized object to prevent re-creation
  const routerPaths = useMemo(() => ({
    events: '/explore/events',
    join: '/explore/units',
    benefits: '/explore/benefits',
    campus: '/explore/campus',
    contact: '/contact',
    products: '/explore/products',
    jobs: '/explore/volunteer'
  }), []);

  // Use React Query for data fetching with automatic caching
  const { 
    data: campusData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: [QUERY_KEYS.campus, slug],
    queryFn: () => fetchCampusData(slug as string),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Cache data for 30 minutes (formerly cacheTime)
    retry: 2 // Only retry failed requests twice
  });

  // Sync URL with campus context
  useEffect(() => {
    if (campus && campus.name.toLowerCase() !== slug?.toLowerCase()) {
      router.replace(`/campus/${campus.name.toLowerCase()}` as any);
    }
  }, [campus, slug, router]);

  // Prefetch related data
  useEffect(() => {
    if (slug) {
      // Prefetch department members data
      queryClient.prefetchQuery({
        queryKey: ['departmentMembers', slug],
        queryFn: () => {
          // This will be called by DepartmentMembersShowcase component
          return Promise.resolve([]);
        }
      });
    }
  }, [slug, queryClient]);
  
  // Add AppState monitoring to refresh data when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) && 
        nextAppState === 'active' &&
        !isInitialMount.current
      ) {
        // App has come to the foreground, refresh data if stale
        refetch();
      }
      
      appState.current = nextAppState;
      isInitialMount.current = false;
    });

    return () => {
      subscription.remove();
    };
  }, [refetch]);

  // Memoize handlers
  const handleQuickAction = useCallback((action: string) => {
    const basePath = routerPaths[action as keyof typeof routerPaths];
    router.push(`${basePath}?campus=${slug}` as any);
  }, [routerPaths, router, slug]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Show loading state
  if (isLoading) {
    return <CampusLoadingState />;
  }

  // Show error state if campus data not found
  if (isError || !campusData) {
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
              <H1>{t('campus-not-found')}</H1>
              <Paragraph textAlign="center">
                {isError ? `Error: ${error?.toString()}` : t('we-couldnt-find-information-for-this-campus')}
              </Paragraph>
              <Button
                onPress={() => router.back()}
                marginTop="$4"
              >
                {t('go-back')}
              </Button>
            </YStack>
          </MotiView>
        </YStack>
      </SafeAreaView>
    );
  }

  // Parse the location safely with default values
  const location = (() => {
    try {
      return typeof campusData?.location === 'string' 
        ? JSON.parse(campusData.location) 
        : { address: t('address-not-available'), email: t('email-not-available') };
    } catch (e) {
      console.error('Error parsing location:', e);
      return { address: t('address-not-available-0'), email: t('email-not-available-0') };
    }
  })();

  return (
    <AnimatePresence>
      <MotiScrollView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
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
              title={t('explore.categories.events.title')} 
              color="purple"
              onPress={() => handleQuickAction('events')}
            />
            <QuickActionButton 
              icon={Users} 
              title={t('join-club')} 
              color="blue"
              onPress={() => handleQuickAction('join')}
            />
            <QuickActionButton 
              icon={Briefcase} 
              title={t('positions')} 
              color="pink"
              onPress={() => handleQuickAction('jobs')}
            />
            <QuickActionButton 
              icon={ShoppingBag} 
              title={t('products')} 
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
              title={t('for-students')}
              items={campusData?.studentBenefits || []}
              icon={GraduationCap}
              color="blue"
              delay={200}
            />

            <BenefitCard
              title={t('for-business')}
              items={campusData?.businessBenefits || []}
              icon={Briefcase}
              color="purple"
              delay={400}
            />

            <BenefitCard
              title={t('career-benefits')}
              items={campusData?.careerAdvantages || []}
              icon={ChevronRight}
              color="pink"
              delay={600}
            />

            {/* Lazy load department members for better initial load time */}
            <LazyDepartmentMembersShowcase campusId={slug as string} title={t('management')} />
            
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
