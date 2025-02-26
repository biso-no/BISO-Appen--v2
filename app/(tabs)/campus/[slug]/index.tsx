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
  withSpring
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
  ExternalLink
} from '@tamagui/lucide-icons';
import { useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import { useCampus } from '@/lib/hooks/useCampus';
import { BoardShowcase } from '@/components/board-showcase';

interface TeamMember {
  name: string;
  role: string;
  imageUrl: string;
}

interface CampusData {
  name: string;
  description: string;
  studentBenefits: string[];
  businessBenefits: string[];
  careerAdvantages: string[];
  socialNetwork: string[];
  safety: string[];
  location: {
    address: string;
    email: string;
  };
  team: TeamMember[];
}

// This would typically come from an API or CMS
const CAMPUS_DATA: Record<string, CampusData> = {
  oslo: {
    name: 'BISO Oslo',
    description: 'BISO Oslo er studentorganisasjonen ved Handelshøyskolen BI i Oslo, drevet av og for studenter.',
    studentBenefits: [
      'Bli med på store og små eventer',
      '40% avslag på Fadderullan',
      'Intervju-coaching med BISO HR',
      'Relevant arbeidserfaring',
      'Bli med i utvalg og få venner for livet'
    ],
    businessBenefits: [
      'Business Hotspot - Stå i spotten i et halvt semester',
      'Bedriftpresentasjoner',
      'Stand på campus Oslo',
      'BISO Oslos største eventer',
      'Fagdager og faglige eventer',
      'Og mye mer...'
    ],
    careerAdvantages: [
      'Gratis bedriftspresentasjoner',
      'Intervju-coaching med BISO HR',
      'Arbeidslivsspesifikke kurs',
      'Relevant arbeidserfaring',
      'CV-portrettbilde med BISO Media'
    ],
    socialNetwork: [
      'Bli med i våre undergrupper',
      'Eventer på Campus',
      'Delta på Winter Games',
      '40% rabatt på Fadderullan'
    ],
    safety: [
      'BISO HR hjelper deg å finne en undergruppe som passer deg',
      'Styrker din stemme i politikken',
      'Rabatter for medlemmer'
    ],
    location: {
      address: 'Handelshøyskolen BI - campus Oslo, Nydalsveien 37, 0484',
      email: 'president.oslo@biso.no'
    },
    team: [
      {
        name: 'Marie Haga Eriksen',
        role: 'President',
        imageUrl: '/path/to/image'
      },
      // Add other team members here
    ]
  }
};

// Add type for router paths
type RouterPaths = {
  events: string;
  join: string;
  benefits: string;
  campus: string;
  contact: string;
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

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      
      // Add subtle parallax effect to the image
      imageTranslateY.value = event.contentOffset.y * 0.5;
      
      // Scale effect on pull-to-refresh
      if (event.contentOffset.y < 0) {
        imageScale.value = withSpring(1 + Math.abs(event.contentOffset.y) / 500);
      } else {
        imageScale.value = withSpring(1);
      }
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [HEADER_HEIGHT/2, 0, -HEADER_HEIGHT/3],
            Extrapolate.CLAMP
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
          resizeMode="cover"
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

export default function CampusPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const campusData = CAMPUS_DATA[slug as string];
  const theme = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { height: windowHeight } = useWindowDimensions();

  const { campus } = useCampus();

  useEffect(() => {
    if (campus) {
      router.push(`/campus/${campus.name.toLowerCase()}`);
    }
  }, [campus]);

  const routerPaths: RouterPaths = {
    events: '/explore/events',
    join: '/explore/units',
    benefits: '/explore/benefits',
    campus: '/explore/campus',
    contact: '/contact'
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleQuickAction = (action: keyof RouterPaths) => {
    const basePath = routerPaths[action];
    router.push(`${basePath}?campus=${slug}` as any);
  };

  if (!campusData) {
    return (
      <SafeAreaView>
        <YStack padding="$4">
          <H1>Campus not found</H1>
        </YStack>
      </SafeAreaView>
    );
  }

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
              icon={Gift} 
              title="Benefits" 
              color="pink"
              onPress={() => handleQuickAction('benefits')}
            />
            <QuickActionButton 
              icon={Building} 
              title="Campus" 
              color="orange"
              onPress={() => handleQuickAction('campus')}
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
            <BoardShowcase campus={campusData.name} departmentId="1" title="Board Members" />
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
                      <Text color="$color" flex={1}>{campusData.location.address}</Text>
                    </XStack>
                    <XStack flex={1} gap="$2" alignItems="center" minWidth={200}>
                      <Mail size={20} color={theme?.color?.get()} />
                      <Text color="$color" flex={1}>{campusData.location.email}</Text>
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
