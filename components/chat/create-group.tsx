import { useState } from 'react';
import { XStack, YStack, Card, Avatar, SizableText, Text, Separator, View, ScrollView } from 'tamagui';
import { CheckCircle } from '@tamagui/lucide-icons';
import { MotiView } from 'moti';

type Contact = {
  id: number;
  name: string;
  campus: string;
  avatarUrl: string;
};

const contactsData: Contact[] = [
  { id: 1, name: 'John Doe', campus: 'Main Campus', avatarUrl: 'https://example.com/avatar1.png' },
  { id: 2, name: 'Jane Smith', campus: 'North Campus', avatarUrl: 'https://example.com/avatar2.png' },
  // Add more contacts as needed
];

export function CreateChatGroup() {
  const [contacts, setContacts] = useState<Contact[]>(contactsData);
  const [groupMembers, setGroupMembers] = useState<Contact[]>([]);

  const addToGroup = (contact: Contact) => {
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

  return (
    <ScrollView>
      <YStack padding="$4">
        {groupMembers.length > 0 && (
          <View space="$2" marginVertical={16}>
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
        )}
        
        <View>
          {contacts.map((contact) => (
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
      </YStack>
    </ScrollView>
  );
}
