import { Models, Query, Client, OAuthProvider } from 'react-native-appwrite';
import { ID, Account, Databases, Storage, Avatars, Messaging } from 'react-native-appwrite';
import * as WebBrowser from 'expo-web-browser';

const client = new Client();

client
    .setEndpoint('https://appwrite-rg044w0.biso.no/v1')
    .setProject('665313680028cb624457')


const account = new Account(client);

const databases = new Databases(client);

const storage = new Storage(client);

const avatars = new Avatars(client);

const messaging = new Messaging(client);

export async function signIn(email: string) {
    const response = await account.createEmailToken(ID.unique(), email)

    const userId = response.userId

    return userId;
}

export async function signOut() {
    await account.deleteSession("current");
}

export async function getUserPreferences() {
    const response = await account.getPrefs();
    return response;
}

export async function verifyOtp(userId: string, otp: string) {
    
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

export async function createMessagingSubscriber(topic: string, user: Models.User<Models.Preferences>) {

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