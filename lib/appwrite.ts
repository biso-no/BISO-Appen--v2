import { Models, Query, Client, OAuthProvider, Role, ExecutionMethod } from 'react-native-appwrite';
import { ID, Account, Databases, Storage, Avatars, Messaging, Permission, Teams, Functions } from 'react-native-appwrite';
import { AuthContextType } from '@/components/context/auth-provider';
import { capitalizeFirstLetter } from './utils/helpers';
import { AnimatableStringValue } from 'react-native';

export const client = new Client();

client
    .setEndpoint('https://appwrite.biso.no/v1')
    .setProject('biso')
    .setEndpointRealtime('wss://appwrite.biso.no/v1/realtime')


const account = new Account(client);

export const databases = new Databases(client);

export const storage = new Storage(client);

const avatars = new Avatars(client);

const messaging = new Messaging(client);

const teams = new Teams(client);

const functions = new Functions(client);

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

export async function verifyOtp(userId: string, otp: string) {
    
    if (!userId || !otp) {
        throw new Error("Missing User ID or OTP. Contact System Admin if the error persists.");
    }

    const response = await account.createSession(userId, otp);

    if (!response.$id) {
        throw new Error("Invalid OTP");
    }

    return response;

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
    const existingPrefs = await getUserPreferences();
    const mergedPrefs = { ...existingPrefs, ...preferences };
    const response = await account.updatePrefs(mergedPrefs);
    return response;
}

export async function getNews(campus_id?: string) {

    const query = campus_id ? [Query.equal('campus_id', campus_id)] : undefined;

    const response = await databases.listDocuments('app', 'news', query);
    return response;
}

export async function getEvents() {
    const response = await databases.listDocuments('app', 'campus');
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

  export async function listDocuments(collectionId: string, filters?: string[]) {
      try {
        const response = await databases.listDocuments('app', collectionId, filters);
        return response;
      } catch (error) {
        console.error("Error fetching documents:", error);
        throw error; // Re-throw the error to be handled by the caller
      }
  }

export async function createDocument(collectionId: string, data?: any, id?: string) {

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

export async function uploadFile(bucketId: string, file: File, refCollection: string, refField: string, refDocument?: string) {
    console.log("Uploading file: ", file); 
    const fileId = ID.unique();
    try {
        const response = await storage.createFile(bucketId, fileId, file);
        if (response.$id) {
            const result = await databases.updateDocument('app', refCollection, refDocument || fileId, {
                [refField]: response.$id
            })
            return result;
        }
    } catch (error) {
        console.error("Error uploading file:", error);
    }
}


export function getUserAvatar(fileId: string) {

    const result = avatars.getImage(
        'https://appwrite.biso.no/v1/storage/buckets/avatars/files/' + fileId + '/view?project=biso',
        100,
        100
    )
    console.log(result)
    return result;
}


export async function getNotificationCount() {
    const notifications = await databases.listDocuments('app', 'notifications', [Query.equal('status', 'unread')]);
    return notifications.total;
}

export function signInWithBI() {
    const response = account.createOAuth2Session(
        OAuthProvider.Microsoft,
        'biso://(tabs)/index',
        'biso://(tabs)/auth/signIn/failed',
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

export async function getDepartments(campusId?: string) {

    let query = [
        //Select only the values used in the UI
        Query.select(['Name', 'description', '$id', 'logo']),
    ];

    if (campusId) {
        query.push(Query.equal('campus_id', campusId));
    }

    const departments = await databases.listDocuments('app', 'departments', query)
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
    const fetchedChats = await databases.listDocuments('app', 'chats');
    console.log(fetchedChats.documents)
    return fetchedChats
}

export function subScribeToChat(callback: (response: any) => void) {

    const unsubscribe = client.subscribe(['databases.app.collections.chats.documents', 'databases.app.collections.chat_messages.documents'], (response) => {
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
    const messages = await databases.listDocuments('app', 'chat_messages', [
        Query.equal('chat_id', chatId)
    ])
    return messages
}

export async function getDepartmentsByCampus(campus: string) {
    const departments = await databases.listDocuments('app', 'departments', [
        Query.equal('Campus', capitalizeFirstLetter(campus))
    ])
    return departments
}

export async function triggerFunction({
    functionId,
    data,
    async,
    xpath,
    method,
    headers
}: {
    functionId: string
    data?: string
    async?: boolean
    xpath?: string
    method?: ExecutionMethod
    headers?: object
}) {
    const response = await functions.createExecution(functionId, data, async, xpath, method, headers)

    return response
}

export async function getFunctionExecution(functionId: string, executionId: string) {
    const executions = await functions.getExecution(functionId, executionId)

    return executions
}

export async function getFunctionExecutions(functionId: string, executionIds: string[]) {
    const executions = await functions.listExecutions(functionId, [
        Query.and(executionIds.map(executionId => Query.equal('$id', executionId)))
    ])

    return executions
}

export async function searchUsers(query: string) {
    const users = await databases.listDocuments('app', 'user', [
        Query.search("name", query)
    ])
    return users
}

export async function createChatGroup({
    name,
    users,
    emails
}: {
    name: string
    users?: Models.Document[]
    emails?: string[]
}) {
    const execution = await triggerFunction({
        functionId: 'create_group',
        async: false,
        data: JSON.stringify({
            name,
            users,
            emails
        })
    })

    return execution

}

export async function acceptChatInvite({
    teamId,
    membershipId,
    userId,
    secret
}: {
    teamId: string
    membershipId: string
    userId: string
    secret: string
}) {
    const acception = await teams.updateMembershipStatus(teamId, membershipId, userId, secret)

    return acception

}

export async function getBisoMembership(userId: string) {

    const functionResponse = await triggerFunction({
        functionId: 'get_biso_membership',
        async: false
    })

    return functionResponse.responseBody
}

export async function createSession(userId: string, secret: string) {

    const session = await account.createSession(userId, secret);

    return session
}
