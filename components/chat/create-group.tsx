import { useEffect, useState } from 'react';
import { XStack, YStack, Card, Avatar, SizableText, Text, Separator, View, ScrollView, Input, Button, Label, YGroup } from 'tamagui';
import { CheckCircle, X } from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { searchUsers, createChatGroup } from '@/lib/appwrite';
import { Models } from 'react-native-appwrite';
import { useDebounce } from 'use-debounce';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export function CreateChatGroup() {
  const [contacts, setContacts] = useState<Models.DocumentList<Models.Document>>();
  const [groupMembers, setGroupMembers] = useState<Models.DocumentList<Models.Document>>({
    documents: [],
    total: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [searching, setSearching] = useState(false);
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();

  const addToGroup = (contact: Models.Document) => {
    setGroupMembers(prev => {
      const isMember = prev.documents.some(member => member.$id === contact.$id);
      const updatedDocuments = isMember
        ? prev.documents.filter(member => member.$id !== contact.$id)
        : [...prev.documents, contact];
      return { ...prev, documents: updatedDocuments, total: updatedDocuments.length };
    });
    setContacts(prev => {
      if (prev) {
        const updatedContacts = {
          ...prev,
          documents: prev.documents.filter(doc => doc.$id !== contact.$id)
        };
        return updatedContacts;
      }
      return prev;
    });
  };

  const removeFromGroup = (contact: Models.Document) => {
    setGroupMembers(prev => {
      const updatedDocuments = prev.documents.filter(member => member.$id !== contact.$id);
      return { ...prev, documents: updatedDocuments, total: updatedDocuments.length };
    });
    setContacts(prev => {
      if (prev) {
        const updatedContacts = {
          ...prev,
          documents: [...prev.documents, contact]
        };
        return updatedContacts;
      }
      return prev;
    });
  };

  const useInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  const handleSearch = async () => {
    setSearching(true);
    console.log('Searching for:', debouncedSearchQuery);
    const users = await searchUsers(debouncedSearchQuery);
    console.log('Search results:', users);
    // Filter out already selected users
    const filteredUsers = {
      ...users,
      documents: users.documents.filter(user => !groupMembers.documents.some(member => member.$id === user.$id))
    };
    setContacts(filteredUsers);
    setSearching(false);
  };

  const handleCreateGroup = async () => {
    const group = await createChatGroup({
      name: groupName,
      emails: groupMembers.documents.map(member => member.email),
    });

    if (group) {
      router.push('/explore/chat/' + group.$id);
    }
  };

  useEffect(() => {
    if (debouncedSearchQuery) {
      handleSearch();
    }
  }, [debouncedSearchQuery]);

  return (
    <ScrollView style={{ flex: 1 }}>
      <YStack space="$4" padding="$4">
        <YGroup>
          <YGroup.Item>
        <Label>Group Name</Label>
        <Input value={groupName} onChangeText={setGroupName} placeholder="Group Name" backgroundColor="transparent" marginBottom="$2" />
        </YGroup.Item>
          <YGroup.Item>
        {groupMembers && groupMembers.total > 0 && (
          <XStack flexWrap="wrap" gap="$2" marginTop="$2">
            {groupMembers.documents.map(member => (
              <MotiView key={member.$id} from={{ scale: 0 }} animate={{ scale: 1 }}>
                <View>
                  <Avatar size={60} circular onPress={() => addToGroup(member)}>
                    <Avatar.Image src={member.avatarUrl} />
                    <Avatar.Fallback backgroundColor="$blue10" alignItems='center' justifyContent='center'>
                      <Text fontSize={30}>{useInitials(member.name)}</Text>
                    </Avatar.Fallback>
                  </Avatar>
                  <TouchableOpacity
                    style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'white', borderRadius: 15, padding: 2 }}
                    onPress={() => removeFromGroup(member)}
                  >
                    <X size={20} color="red" />
                  </TouchableOpacity>
                </View>
              </MotiView>
            ))}
            <Separator />
          </XStack>
        )}
        </YGroup.Item>
          <YGroup.Item>
            <Label>Search</Label>
        <Input onChangeText={setSearchQuery} placeholder="Search" backgroundColor="transparent" />
        {searching && <Text>Searching...</Text>}
        {contacts?.documents.map(contact => (
          <MotiView key={contact.$id} from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card padding="$4" marginBottom="$2" onPress={() => addToGroup(contact)}>
              <XStack alignItems="center" gap="$2">
                <Avatar size={60} circular>
                  <Avatar.Image src={contact.avatarUrl} />
                  <Avatar.Fallback backgroundColor="$blue10" alignItems='center' justifyContent='center'>
                    <Text fontSize={30}>{useInitials(contact.name)}</Text>
                  </Avatar.Fallback>
                </Avatar>
                {groupMembers.documents.some(member => member.$id === contact.$id) && (
                  <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'white', borderRadius: 50 }}>
                    <CheckCircle size={20} color="green" />
                  </View>
                )}
                <YStack>
                  <SizableText>{contact.name}</SizableText>
                  <Text color="$color10">{contact.campus?.name || 'No campus information'}</Text>
                </YStack>
              </XStack>
            </Card>
          </MotiView>
        ))}
        </YGroup.Item>
        </YGroup>
        <Button onPress={handleCreateGroup} backgroundColor="$blue8" color="white">
          <Text>Create Group</Text>
        </Button>
      </YStack>
    </ScrollView>
  );
}
