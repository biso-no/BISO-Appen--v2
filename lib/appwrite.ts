import { Models, Query, Client, OAuthProvider, Role } from 'react-native-appwrite';
import { ID, Account, Databases, Storage, Avatars, Messaging, Permission, Teams } from 'react-native-appwrite';
import * as WebBrowser from 'expo-web-browser';
import { AuthContextType } from '@/components/context/auth-provider';

export const client = new Client();

client
    .setEndpoint('https://appwrite-rg044w0.biso.no/v1')
    .setProject('665313680028cb624457')


const account = new Account(client);

const databases = new Databases(client);

const storage = new Storage(client);

const avatars = new Avatars(client);

const messaging = new Messaging(client);

const teams = new Teams(client);

export async function signIn(email: string) {
    const response = await account.createEmailToken(ID.unique(), email);
    const userId = response.userId;
  
    return userId;
  }
  
  export async function signOut(refetchUser: AuthContextType['refetchUser']) {
    const response = await account.deleteSession("current");
    console.log(response);
  
    await refetchUser();
  }

export async function getUserPreferences() {
    const response = await account.getPrefs();
    return response;
}

export async function verifyOtp(userId: string, otp: string, refetchUser: AuthContextType['refetchUser']) {
    
    if (!userId || !otp) {
        throw new Error("Missing User ID or OTP. Contact System Admin if the error persists.");
    }

    let response;
    let profileStatus = false;

    try {
        response = await account.createSession(userId, otp);
    } catch (error) {
        console.error("Error creating session:", error);
        return {
            user: null,
            hasProfile: false
        };
    }

    if (!response.$id) {
        try {
            const profile = await databases.getDocument('app', 'user', userId);
            if (profile) {
                profileStatus = true;
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    }

    await refetchUser();

    return {
        user: response,
        hasProfile: profileStatus
    };
}



export async function getUser() {
    try {
        const user = await account.get();
        console.log("User Object: ", user);

        let profile;

        if (user.$id) {
            try {
                profile = await databases.getDocument('app', 'user', user.$id);
                console.log("Profile Object: ", profile);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        }

        return { user, profile };
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

export async function getAccount() {
    const response = await account.get();
    return response;
}

export async function updateUserName(name: string) {
    const response = await account.updateName(name);
    return response;
}

export async function updatePhoneNumber(userId: string, phoneNumber: string) {
    const response = await account.updatePhone(userId, phoneNumber);
    return response;
}

export async function updateUserPreferences(preferences: Models.Preferences) {
    const response = await account.updatePrefs(preferences);
    return response;
}

export async function getNews() {
    const response = await databases.listDocuments('app', 'post');
    return response;
}

export async function getEvents() {
    const response = await databases.listDocuments('app', 'event');
    return response;
}

export async function getDocument(collectionId: string, documentId: string) {
    try {
        const response = await databases.getDocument('app', collectionId, documentId);
        return response;
    } catch (error) {
        console.error("Error fetching document:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}


export async function getDocuments(collectionId: string, filters?: Record<string, string>) {
    let query = [];
    
    // Build the query based on filters
    if (filters) {
      for (const [filterType, value] of Object.entries(filters)) {
        const trimmedValue = value.trim();
        if (trimmedValue.toLowerCase() !== "all") {
          query.push(Query.equal(filterType, trimmedValue));
        }
      }
    }
  
    try {
      const response = await databases.listDocuments('app', collectionId, query);
      return response;
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

export async function createDocument(collectionId: string, data: any, id?: string) {

    const documentId = id ?? ID.unique();

    const response = await databases.createDocument('app', collectionId, documentId, data);
    return response;
}

export async function updateDocument(collectionId: string, documentId: string, data: object) {
    const response = await databases.updateDocument('app', collectionId, documentId, data);
    return response;
}

export async function registerDeviceToken(token: string) {
    try {
        await account.createPushTarget(ID.unique(), token);
    } catch (error) {
        console.error("Error registering device token:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

interface File {
    name: string;
    type: string;
    size: number;
    uri: string;
}

export async function uploadFile(bucketId: string, file: File) {
    console.log("Uploading file: ", file);
    try {
        const response = await storage.createFile(bucketId, ID.unique(), file);
        console.log("Response: ", response);
        return response;
    } catch (error) {
        console.error("Error uploading file:", error);
    }
}


export function getUserAvatar(fileId: string) {

    const result = avatars.getImage(
        'https://appwrite-rg044w0.biso.no/v1/storage/buckets/avatar/files/' + fileId + '/view?project=biso',
        100,
        100
    )

    return result;
}

export async function updateUserAvatar(imageUri) => {
    try {
        const response 
    }
}

export async function getNotificationCount() {
    const notifications = await databases.listDocuments('app', 'notifications', [Query.equal('status', 'unread')]);
    return notifications.total;
}

export function signInWithBI() {
    const response = account.createOAuth2Session(
        OAuthProvider.Microsoft,
        'nymheien://(tabs)/index',
        'nymheien://(tabs)/auth/signIn/failed',
    )
    console.log(response)
    return response;
}

export async function createSubscriber(topic: string, user: Models.User<Models.Preferences>) {

    const targetId = user.targets[0].$id;

    try {
        const response = await messaging.createSubscriber(
            topic,
            ID.unique(),
            targetId
        );

        return response;
    } catch (error) {
        console.error("Error creating messaging subscriber:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

export async function deleteSubscriber(topic: string, subscriberId: string) {

    try {
        const response = await messaging.deleteSubscriber(topic, subscriberId);
        return response;
    } catch (error) {
        console.error("Error deleting messaging subscriber:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

export const updateSubscription = async (userId: string, topic: string, subscribed: boolean) => {
    try {
      const documents = await databases.listDocuments('app', 'subs', [
        Query.equal('topic', topic),
      ]);
  
      if (documents.total > 0) {
        await databases.updateDocument('app', 'subs', documents.documents[0].$id, {
          subscribed,
        });
      } else {
        await databases.createDocument('app', 'subs', ID.unique(), {
          user_id: userId,
          topic,
          subscribed,
        }, [
          Permission.read(Role.user(userId)),
          Permission.write(Role.user(userId)),
          Permission.delete(Role.user(userId)),
          Permission.update(Role.user(userId)),
        ]);
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  };
  
  export const fetchSubscription = async (data: Models.User<Models.Preferences>, props: { topic: string }) => {
    if (data) {
      try {
        const documents = await databases.listDocuments('app', 'subs', [
          Query.equal('topic', props.topic),
        ]);

        if (documents.total > 0) {
          return documents.documents[0];
        }

        return null;
      } catch (error) {
        console.error("Error fetching subscription:", error);
        throw error; // Re-throw the error to be handled by the caller
      }
    }

    return null;
  };

export async function getDepartments() {
    const departments = await databases.listDocuments('app', 'departments')
    return departments
}

export async function getExpensesDepartments() {
    const expensesDepartments = await databases.listDocuments('app', 'expense', [
        Query.select(['department'])
    ])
    
    return expensesDepartments
}

export async function createTeam(name: string) {
    const team = await teams.create(ID.unique(), name)

    return team
}

export async function getTeams() {
    const fetchedTeams = await teams.list();
    return fetchedTeams
}

export async function getTeam(teamId: string) {
    const team = await teams.get(teamId);
    return team
}

export async function getChats() {
    const fetchedChats = await databases.listDocuments('app', 'chat_group');
    console.log(fetchedChats.documents)
    return fetchedChats
}

export function subScribeToChat(callback: (response: any) => void) {

    const unsubscribe = client.subscribe(['databases.app.collections.chat_group.documents', 'databases.app.collections.chat_messages.documents'], (response) => {
      console.log(response);
      callback(response);
    });
  
    return unsubscribe;
  }

export async function sendChatMessage(recipient: string, message: string, sender: string) {
    const response = await databases.createDocument('app', 'chat_messages', ID.unique(), {
        chat_id: recipient,
        content: message,
        users: sender
    },
    [
        Permission.read(Role.user(sender)),
        Permission.read(Role.team(recipient)),
        Permission.update(Role.user(sender)),
        Permission.delete(Role.user(sender)),
    ])
    return response
}

/*
export async function createChat(name: string, existingUsers: Models.User<Models.Preferences>[], inviteUsers: string[] = []) {

    const team = await createTeam(name)

    let users = existingUsers

    if (existingUsers ?? inviteUsers) {

        const teamId = team.$id

        //existingUsers are users already in the system, and has an ID. inviteUsers are users that are not in the system, and we use email. team.createMembership accepts both email and ID.

        const usersArray = users.map(user => {
            if (user.$id) {
                await teams.createMembership(teamId, [],"", user.$id)
            } 

        })

        if (inviteUsers) {
            const users = inviteUsers.map(user => {
                await teams.createMembership(teamId, [],"", user)
            })
        }

    const response = await databases.createDocument('app', 'chat', ID.unique(), {
        name: team.name,
        users,
        team_id: teamId
    },

        [Permission.read(Role.team(teamId)), Permission.write(Role.team(teamId)), Permission.update(Role.team(teamId))]
)
    return response
}
*/

export async function getUsers() {
    const users = await databases.listDocuments('app', 'user')
    return users
}

export async function fetchChatMessages(chatId: string) {
    const messages = await databases.listDocuments('app', 'chat_messages')
    return messages
}