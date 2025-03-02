import React from "react";
import { useWindowDimensions, useColorScheme } from 'react-native';
import { MotiView } from 'moti';
import RenderHTML from "react-native-render-html";
import { Models } from "react-native-appwrite";
import { 
  Text, 
  YStack, 
  XStack,
  useTheme, 
  Card, 
  Button,
  Avatar,
  Paragraph,
  H4
} from "tamagui";
import { 
  Building, 
  Users,
  ChevronRight,
  MapPin
} from "@tamagui/lucide-icons";

interface DepartmentCardProps {
  department: Models.Document;
  onPress: () => void;
  index: number;
}

export function DepartmentCard({ department, onPress, index }: DepartmentCardProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  
  // Generate colors for departments based on index or name
  const colors = ['blue', 'purple', 'orange', 'pink', 'green', 'yellow'];
  const colorSeed = department.Name ? department.Name.charCodeAt(0) % colors.length : index % colors.length;
  const departmentColor = colors[colorSeed];
  
  // Determine background and border colors based on color scheme
  const getBgColor = () => colorScheme === 'dark' ? `$${departmentColor}2` : `$${departmentColor}1`;
  const getBorderColor = () => colorScheme === 'dark' ? `$${departmentColor}5` : `$${departmentColor}4`;
  
  // Truncate description for preview
  const truncateHTML = (html: string, maxLength = 100) => {
    if (!html) return '';
    const strippedText = html.replace(/<[^>]+>/g, '');
    if (strippedText.length <= maxLength) return strippedText;
    
    let truncated = strippedText.substr(0, maxLength);
    truncated = truncated.substr(0, Math.min(truncated.length, truncated.lastIndexOf(" ")));
    return truncated + "...";
  };
  
  // Get theme-safe color value
  const getColorValue = (colorPath: string) => {
    // Safely access nested theme properties
    return theme[colorPath]?.val || (colorScheme === 'dark' ? '#FFF' : '#000');
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95, translateY: 15 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{
        type: 'spring',
        delay: Math.min(index * 50, 300), // Cap delay for better performance
        damping: 15,
        mass: 0.8,
      }}
      style={{ marginBottom: 16 }}
    >
      <Card
        bordered
        animation="bouncy"
        scale={0.98}
        hoverStyle={{ scale: 0.99 }}
        pressStyle={{ scale: 0.96 }}
        onPress={onPress}
        borderColor={getBorderColor()}
        backgroundColor={getBgColor()}
        borderRadius="$6"
      >
        <YStack padding="$4" gap="$3">
          {/* Department header */}
          <XStack gap="$3" alignItems="center">
            {department.logo ? (
              <Avatar circular size="$5" borderColor={getBorderColor()} borderWidth={1.5}>
                <Avatar.Image src={department.logo} />
                <Avatar.Fallback backgroundColor={`$${departmentColor}5`}>
                  <Building color={getColorValue(`${departmentColor}11`)} />
                </Avatar.Fallback>
              </Avatar>
            ) : (
              <Avatar circular size="$5" backgroundColor={colorScheme === 'dark' ? `$${departmentColor}3` : `$${departmentColor}4`}>
                <Building
                  size={20}
                  color={getColorValue(`${departmentColor}10`)}
                />
              </Avatar>
            )}
            
            <YStack flex={1} gap="$1">
              <H4 
                fontSize="$5" 
                fontWeight="700" 
                color={colorScheme === 'dark' ? `$${departmentColor}11` : `$${departmentColor}12`}
                numberOfLines={1}
              >
                {department.Name}
              </H4>
            </YStack>
          </XStack>
          
          {/* Department description */}
          {department.description && (
            <Paragraph
              color={colorScheme === 'dark' ? '$gray11' : '$gray12'}
              size="$3"
              numberOfLines={3}
            >
              {truncateHTML(department.description)}
            </Paragraph>
          )}
          
          {/* Additional information and actions */}
          <XStack justifyContent="space-between" alignItems="center">
            <XStack gap="$3" alignItems="center">
              {department.location && (
                <XStack gap="$1" alignItems="center">
                  <MapPin size={14} color={getColorValue('color')} opacity={0.7} />
                  <Text fontSize="$2" color="$color" opacity={0.7}>
                    {department.location}
                  </Text>
                </XStack>
              )}
              
              {department.student_count && (
                <XStack gap="$1" alignItems="center">
                  <Users size={14} color={getColorValue('color')} opacity={0.7} />
                  <Text fontSize="$2" color="$color" opacity={0.7}>
                    {department.student_count} {parseInt(department.student_count) === 1 ? 'Student' : 'Students'}
                  </Text>
                </XStack>
              )}
            </XStack>
            
            <Button
              theme={departmentColor}
              size="$3"
              borderRadius="$10"
              backgroundColor={colorScheme === 'dark' ? `$${departmentColor}4` : `$${departmentColor}5`}
              pressStyle={{ 
                scale: 0.95, 
                backgroundColor: colorScheme === 'dark' ? `$${departmentColor}5` : `$${departmentColor}6` 
              }}
            >
              <Text 
                color={colorScheme === 'dark' ? `$${departmentColor}11` : `$${departmentColor}12`} 
                fontWeight="600"
              >
                Details
              </Text>
              <ChevronRight size={16} />
            </Button>
          </XStack>
        </YStack>
      </Card>
    </MotiView>
  );
} 