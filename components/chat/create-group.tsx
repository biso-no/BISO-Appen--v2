import React, { useState, useEffect } from 'react';
import { TamaguiProvider, Button, Input, YStack, Text, View, XGroup, Label } from 'tamagui';
import { useDebounce } from 'use-debounce';
import { MotiView } from 'moti';
import { MyStack } from '../ui/MyStack';

type User = {
  id: number;
  name: string;
  email: string;
};

type SearchResult = User | { email: string };

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <View
            style={{
                padding: 5,
                borderRadius: 5,
                backgroundColor: 'red',
                margin: 5
            }}
        >
            <Text style={{ color: 'white' }}>{children}</Text>
        </View>
    );
}

const GroupComponent = () => {
  const [groupName, setGroupName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [addedUsers, setAddedUsers] = useState<SearchResult[]>([]);
  const [debouncedEmail] = useDebounce(email, 500);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (debouncedEmail) {
      searchForUser(debouncedEmail);
    }
  }, [debouncedEmail]);

  const searchForUser = (email: string) => {
    // Simulate an API call to search for a user
    const dummyUsers: User[] = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ];

    const results = dummyUsers.filter(user =>
      user.email.includes(email) || user.name.includes(email)
    );

    setSearchResults(results.length ? results : [{ email }]);
  };

  const addUserToGroup = (user: SearchResult) => {
    setAddedUsers([...addedUsers, user]);
    setEmail('');
    setSearchResults([]);
  };

  return (
      <MyStack>
            <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: step === 1 ? 1 : 0 }}
        exit={{ opacity: 0 }}
        style={{ display: step === 1 ? 'flex' : 'none' }}
        >
            <Label>Group Name</Label>
            <Input
            placeholder="Enter group name"
            value={groupName}
            onChangeText={setGroupName}
            />
            </MotiView>
            <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: step === 2 ? 1 : 0 }}
        exit={{ opacity: 0 }}
        style={{ display: step === 2 ? 'flex' : 'none' }}
        >
            <Input
            placeholder="Enter email address"
            value={email}
            onChangeText={setEmail}
            />
            <YStack space>
            {addedUsers.map((user, index) => (
                <Badge key={index}>
                {'name' in user ? user.name : user.email}
                </Badge>
            ))}
            </YStack>
            <YStack>
            {searchResults.map((user, index) => (
                <YStack key={index} flexDirection='row' alignItems="center">
                <Text>
                    {'name' in user ? user.name : user.email}
                </Text>
                {'email' in user && !('name' in user) && (
                    <Button onPress={() => addUserToGroup(user)}>
                    Add to Group
                    </Button>
                )}
                </YStack>
            ))}
        </YStack>
        </MotiView>
        <XGroup justifyContent="space-between">
            <Button
            onPress={() => setStep(step - 1)}
            disabled={step === 1}
            >
            Back
            </Button>
            <Button
            onPress={() => setStep(step + 1)}
            disabled={step === 2}
            >
            Next
            </Button>
        </XGroup>
      </MyStack>
  );
};

export default GroupComponent;
