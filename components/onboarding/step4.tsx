import { YStack, XStack, H3, Paragraph, Card, Text } from 'tamagui';
import React, { useState } from 'react';
import { Input } from '@/components/auth/input';
import { MotiView } from 'moti';
import { StyleSheet, Dimensions } from 'react-native';
import { Home, MapPin, Phone, Mail, Building } from '@tamagui/lucide-icons';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSequence,
  Easing 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface Step4Props {
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  setPhone?: (phone: string) => void;
  setAddress?: (address: string) => void;
  setCity?: (city: string) => void;
  setZipCode?: (zipCode: string) => void;
}

export function Step4({ phone, address, city, zipCode, setPhone, setAddress, setCity, setZipCode }: Step4Props) {
  const [activeField, setActiveField] = useState<string | null>(null);
  const { width } = Dimensions.get('window');
  const isSmallDevice = width < 380;
  
  // Animation values
  const homeScale = useSharedValue(1);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(20);
  
  // Start animations when component mounts
  React.useEffect(() => {
    // Animate home icon
    homeScale.value = withSequence(
      withTiming(1.2, { duration: 400 }),
      withTiming(1, { duration: 300 })
    );
    
    // Animate form
    formOpacity.value = withTiming(1, { duration: 600 });
    formTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
    
    return () => {
      // Cleanup
      homeScale.value = 1;
      formOpacity.value = 0;
      formTranslateY.value = 20;
    };
  }, [formOpacity, formTranslateY, homeScale]);
  
  // Animated styles
  const homeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: homeScale.value }],
    };
  });
  
  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [{ translateY: formTranslateY.value }],
    };
  });
  
  // Handle field focus
  const handleFocus = (fieldName: string) => {
    setActiveField(fieldName);
    
    // Animate icon based on field
    homeScale.value = withSequence(
      withTiming(1.1, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );
  };
  
  // Handle field blur
  const handleBlur = () => {
    setActiveField(null);
  };

  return (
    <YStack width="100%" alignItems="center" space="$2">
      <MotiView 
        from={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        style={styles.container}
      >
        <YStack space="$2" width="100%" alignItems="center">
          <XStack alignItems="center" space="$2">
            <Animated.View style={homeAnimatedStyle}>
              <Home size={22} color="$primary" />
            </Animated.View>
            <H3 fontWeight="bold">Your Contact Details</H3>
          </XStack>
          
          <Paragraph textAlign="center" opacity={0.8} paddingHorizontal="$4" marginBottom="$1">
            Let us know how to reach you
          </Paragraph>
          
          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
            <Card
              elevate
              bordered
              animation="quick"
              scale={0.97}
              hoverStyle={{ scale: 1 }}
              pressStyle={{ scale: 0.96 }}
              style={styles.formCard}
            >
              <Card.Background>
                <LinearGradient
                  colors={['rgba(120, 120, 255, 0.05)', 'rgba(100, 100, 255, 0.02)']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              </Card.Background>
              
              <YStack gap={isSmallDevice ? "$2" : "$3"} width="100%">
                <MotiView
                  from={{ opacity: 0, translateX: -10 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'timing', duration: 400, delay: 100 }}
                >
                  <Input size={isSmallDevice ? "$3" : "$4"}>
                    <Input.Label htmlFor="phone">
                      <XStack alignItems="center" space="$2">
                        <Phone 
                          size={16} 
                          color={activeField === 'phone' ? '$primary' : '$color'} 
                        />
                        <Text>Phone</Text>
                      </XStack>
                    </Input.Label>
                    <Input.Box
                      borderColor={activeField === 'phone' ? '$primary' : undefined}
                      animation="quick"
                    >
                      <Input.Area
                        id="phone"
                        placeholder="Enter your phone number"
                        value={phone}
                        keyboardType="phone-pad"
                        onChangeText={setPhone}
                        color="$color"
                        onFocus={() => handleFocus('phone')}
                        onBlur={handleBlur}
                      />
                    </Input.Box>
                  </Input>
                </MotiView>
                
                <MotiView
                  from={{ opacity: 0, translateX: -10 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'timing', duration: 400, delay: 200 }}
                >
                  <Input size={isSmallDevice ? "$3" : "$4"}>
                    <Input.Label htmlFor="address">
                      <XStack alignItems="center" space="$2">
                        <MapPin 
                          size={16} 
                          color={activeField === 'address' ? '$primary' : '$color'} 
                        />
                        <Text>Address</Text>
                      </XStack>
                    </Input.Label>
                    <Input.Box
                      borderColor={activeField === 'address' ? '$primary' : undefined}
                      animation="quick"
                    >
                      <Input.Area
                        id="address"
                        placeholder="Enter your address"
                        value={address}
                        onChangeText={setAddress}
                        color="$color"
                        onFocus={() => handleFocus('address')}
                        onBlur={handleBlur}
                      />
                    </Input.Box>
                  </Input>
                </MotiView>
                
                <MotiView
                  from={{ opacity: 0, translateX: -10 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'timing', duration: 400, delay: 300 }}
                >
                  <Input size={isSmallDevice ? "$3" : "$4"}>
                    <Input.Label htmlFor="city">
                      <XStack alignItems="center" space="$2">
                        <Building 
                          size={16} 
                          color={activeField === 'city' ? '$primary' : '$color'} 
                        />
                        <Text>City</Text>
                      </XStack>
                    </Input.Label>
                    <Input.Box
                      borderColor={activeField === 'city' ? '$primary' : undefined}
                      animation="quick"
                    >
                      <Input.Area
                        id="city"
                        placeholder="Enter your city"
                        value={city}
                        onChangeText={setCity}
                        color="$color"
                        onFocus={() => handleFocus('city')}
                        onBlur={handleBlur}
                      />
                    </Input.Box>
                  </Input>
                </MotiView>
                
                <MotiView
                  from={{ opacity: 0, translateX: -10 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'timing', duration: 400, delay: 400 }}
                >
                  <Input size={isSmallDevice ? "$3" : "$4"}>
                    <Input.Label htmlFor="zipCode">
                      <XStack alignItems="center" space="$2">
                        <Mail 
                          size={16} 
                          color={activeField === 'zipCode' ? '$primary' : '$color'} 
                        />
                        <Text>Zip Code</Text>
                      </XStack>
                    </Input.Label>
                    <Input.Box
                      borderColor={activeField === 'zipCode' ? '$primary' : undefined}
                      animation="quick"
                    >
                      <Input.Area
                        id="zipCode"
                        placeholder="Enter your zip code"
                        value={zipCode}
                        onChangeText={setZipCode}
                        color="$color"
                        onFocus={() => handleFocus('zipCode')}
                        onBlur={handleBlur}
                      />
                    </Input.Box>
                  </Input>
                </MotiView>
              </YStack>
            </Card>
          </Animated.View>
        </YStack>
      </MotiView>
    </YStack>
  );
}

const { width } = Dimensions.get('window');
const isSmallDevice = width < 380;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  formContainer: {
    width: '100%',
    marginTop: 4,
  },
  formCard: {
    width: '100%',
    padding: isSmallDevice ? 10 : 12,
    overflow: 'hidden',
  },
});
