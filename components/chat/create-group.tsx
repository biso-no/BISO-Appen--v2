import { useState } from 'react';
import { XStack, YStack, Card, Avatar, SizableText, Text, Separator, View, ScrollView, Input, YGroup, Button } from 'tamagui';
import { CheckCircle } from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { searchUsers, createChatGroup } from '@/lib/appwrite';
import { Models } from 'react-native-appwrite';




export function CreateChatGroup() {
  const [contacts, setContacts] = useState<Models.DocumentList<Models.Document>>();
  const [groupMembers, setGroupMembers] = useState<Models.Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('navn');

  const addToGroup = (contact: Models.Document) => {
    setGroupMembers((prev) => {
      if (prev.includes(contact)) {
        return prev.filter((member) => member.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const useInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const handleSearch = async () => {
    const users = await searchUsers(searchQuery);
    setContacts(users);
  };

  const handleCreateGroup = async () => {
    const group = await createChatGroup({
      name: groupName,
      emails: ['markushei@hotmail.no'],
    });
  };


  return (
    <ScrollView>
      <YStack padding="$4">
        <YGroup>
            <YGroup.Item>
                <Input value={groupName} onChangeText={setGroupName} placeholder="Group Name" />
            </YGroup.Item>
          <YGroup.Item>
        <Input onBlur={handleSearch} onChangeText={setSearchQuery} placeholder="Search" />
        </YGroup.Item>
        {groupMembers.length > 0 && (
          <YGroup.Item>
          <View space="$2" marginVertical={16} key={groupMembers.length}>
            <XStack flexWrap="wrap" gap="$2" marginTop="$2">
              {groupMembers.map((member) => (
                <MotiView
                  key={member.id}
                  from={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Avatar size={60} circular>
                    <Avatar.Image src={member.avatarUrl} />
                    <Avatar.Fallback backgroundColor="$blue10" alignItems='center' justifyContent='center'>
                      <Text fontSize={30}>{useInitials(member.name)}</Text>
                    </Avatar.Fallback>
                  </Avatar>
                </MotiView>
              ))}
            </XStack>
            <Separator direction='ltr' />
          </View>
          </YGroup.Item>
        )}
        
        <View>
          {contacts?.documents.map((contact) => (
            <Card key={contact.id} padding="$4" marginBottom="$2" onPress={() => addToGroup(contact)}>
              <XStack alignItems="center" gap="$2">
                <View style={{ position: 'relative' }}>
                  <Avatar size={60} circular>
                    <Avatar.Image src={contact.avatarUrl} />
                    <Avatar.Fallback backgroundColor="$blue10" alignItems='center' justifyContent='center'>
                      <Text fontSize={30}>{useInitials(contact.name)}</Text>
                    </Avatar.Fallback>
                  </Avatar>
                  {groupMembers.some((member) => member.id === contact.id) && (
                    <View style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'white',
                      borderRadius: 50,
                    }}>
                      <CheckCircle size={20} color="green" />
                    </View>
                  )}
                </View>
                <YStack>
                  <SizableText>{contact.name}</SizableText>
                  <SizableText color="$color10">{contact.campus}</SizableText>
                </YStack>
              </XStack>
            </Card>
          ))}
        </View>
        </YGroup>
        <Button onPress={handleCreateGroup}>Create Group</Button>
      </YStack>
    </ScrollView>
  );
}