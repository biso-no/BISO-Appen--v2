export async function uriToBlob(uri: string) {
    const response = await fetch(uri);
    const blob = response.blob();
    return blob
}