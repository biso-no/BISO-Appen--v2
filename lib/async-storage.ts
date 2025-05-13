import AsyncStorage from '@react-native-async-storage/async-storage';

export async function storeData(key: string, value: string) {
    try {
        await AsyncStorage.setItem(key, value)
    } catch (e) {
        console.log(e)
    }
}

export async function storeObjectData(key: string, value: any) {
    try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem(key, jsonValue)
    } catch (e) {
        console.log(e)
    }
}

export async function getData(key: string) {
    try {
        const value = await AsyncStorage.getItem(key)
        return value
    } catch (e) {
        console.log(e)
    }
}

export async function removeData(key: string) {
    try {
        await AsyncStorage.removeItem(key)
    } catch (e) {
        console.log(e)
    }
}

export async function clearData() {
    try {
        await AsyncStorage.clear()
    } catch (e) {
        console.log(e)
    }
}
