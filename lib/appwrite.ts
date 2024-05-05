import { Models, Query, Client } from 'react-native-appwrite/src';
import { ID, Account, Databases, Storage } from 'react-native-appwrite/src';

const client = new Client();

client
    .setEndpoint('https://appwrite-a0w8s4o.biso.no/v1')
    .setProject('biso')


const account = new Account(client);

const databases = new Databases(client);

const storage = new Storage(client);


export async function signIn(email: string) {
    const response = await account.createEmailToken(ID.unique(), email)

    const userId = response.userId

    return userId;
}

export async function verifyOtp(userId: string, otp: string) {
    
    if (!userId && !otp) {
        throw new Error("Missing User ID or OTP. Contact System Admin if the error persists.")
    }

    const response = await account.createSession(userId, otp)

    if (!response.$id) return null;

    return response;
}

export async function getUser() {
    try {
        const user = await account.get();
        console.log("User Object: ", user);

        let profile;

        if (user.$id) {
            try {
                profile = await databases.getDocument('app', 'users', user.$id);
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

export async function updateUserPreferences(preferences: string[]) {
    const response = await account.updatePrefs(preferences);
    return response;
}

export async function getNews() {
    const response = await databases.listDocuments('app', 'news');
    return response;
}

export async function getEvents() {
    const response = await databases.listDocuments('app', 'events');
    return response;
}

export async function registerDeviceToken(userId: string, token: string) {
    // Search for an existing document with the same userId and token
    const searchResponse = await databases.listDocuments('app', 'devices', [
        Query.equal('user_id', userId),
        Query.equal('token', token)
    ]);

    // Check if a document already exists
    if (searchResponse.documents.length > 0) {
        // Token already registered, return the existing document or perform an update if needed
        return searchResponse.documents[0];
    } else {
        account.createPushTarget(ID.unique(), token);
        // Token not registered, create a new document
        const createResponse = await databases.createDocument('app', 'devices', ID.unique(), {
            user_id: userId,
            token: token
        });

        return createResponse;
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

