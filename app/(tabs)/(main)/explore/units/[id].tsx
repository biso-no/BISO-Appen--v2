import React, { useEffect, useState } from 'react';
import { ScrollView, Linking, Image } from 'react-native';
import { Text, View, Button, Image as TamaguiImage, YStack, Separator } from 'tamagui';
import RenderHTML from 'react-native-render-html';
import { useRoute } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { databases } from '@/lib/appwrite';
import { Models } from 'react-native-appwrite';
import { useWindowDimensions } from 'react-native';
import { useTheme } from 'tamagui';


const DepartmentScreen = () => {
  const route = useRoute();
  const searchParams = useLocalSearchParams<{ id: string }>();
  const { id } = searchParams;

  const { width } = useWindowDimensions();

  const [department, setDepartment] = useState<Models.Document>();

  const theme = useTheme();

  const textColor = theme?.color?.val;


  useEffect(() => {
    if (id) {
      databases.getDocument('app', 'departments', id).then(setDepartment);
    }
  }, [id]);

if (!department) {
  return <Text>Uh oh, we couldn't find that department. Please try again.</Text>;
}

const htmlStyles = {
  body: { 
    fontSize: 16, 
    lineHeight: 24, 
    color: textColor,
  }, 
};

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <YStack alignItems="center" marginBottom={20}>
        <TamaguiImage
          source={{ uri: department.logo }}
          width={100}
          height={100}
          borderRadius={16}
          resizeMode="contain"
        />
        <Text fontWeight="bold" fontSize={24} marginTop={8}>
          {department.Name}
        </Text>
        {department.type && (
        <Text color="gray" fontSize={14} marginBottom={8}>
          {department.type} at {department.campus.name}
        </Text>
        )}
        <Separator />
              <RenderHTML 
      source={{ html: department.description }} 
      contentWidth={width - 40}
      tagsStyles={htmlStyles}
          />  
      </YStack>


    {department.news.length > 0 && (
      <View marginTop={16} marginBottom={16}>
        <Text fontWeight="bold" fontSize={20} marginBottom={8}>
          Latest Posts
        </Text>
        {department.news.map((post: Models.Document) => (
          <View key={post.id} marginBottom={8}>
            <Text>{post.content}</Text>
            <Button onPress={() => Linking.openURL(post.url)}>
                <Text>View Post</Text>
            </Button>
          </View>
        ))}
      </View>
    )}

    {department.socialMedia && (
      <View marginTop={16} marginBottom={16}>
        <Text fontWeight="bold" fontSize={20} marginBottom={8}>
          Social Media
        </Text>
        <Button
          onPress={() => Linking.openURL(department.socialMedia.facebook)}
        >
            <Text>Instagram</Text>
        </Button>
      </View>
    )}
        {department.boardOfTrustees && (
      <View marginTop={16} marginBottom={16}>
        <Text fontWeight="bold" fontSize={20} marginBottom={8}>
          Board of Trustees
        </Text>
        {department.boardOfTrustees.map((member: Models.Document, index: number) => (
          <View
            key={index}
            flexDirection="row"
            alignItems="center"
            marginBottom={16}
          >
            <Image
              source={{ uri: member.portrait }}
              style={{ width: 50, height: 50, borderRadius: 25 }}
            />
            <View marginLeft={16}>
              <Text fontWeight="bold">{member.name}</Text>
              <Text>{member.contact}</Text>
            </View>
          </View>
        ))}
      </View>
    )}
    </ScrollView>
  );
};

export default DepartmentScreen;
