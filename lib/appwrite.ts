import { Client, Models } from 'appwrite';
import { ID, Account } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://appwrite-a0w8s4o.biso.no/v1')
    .setProject('biso');

const account = new Account(client);

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

export async function getAccount() {
    const response = await account.get();
    return response;
}

export async function updateUserName(name: string) {
    const response = await account.updateName(name);
    return response;
}

export async function updateUserPreferences(preferences: string[]) {
    const response = await account.updatePrefs(preferences);
    return response;
}