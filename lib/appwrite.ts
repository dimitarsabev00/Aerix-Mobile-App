import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  ImageGravity,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.dimitarsabev00.aerix",
  projectId: "672e43120021282242dd",
  storageId: "672e4631002309150999",
  databaseId: "672e453f002ef5c2b49c",
  usersCollectionId: "672e456e0012cbf64244",
  videosCollectionId: "672e459a0024e057f70e",
};

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Define the form type
interface VideoPostForm {
  title: string;
  thumbnail: File;
  video: File;
  prompt: string;
  userId: string;
}

// Define allowed types for the `type` parameter
type FileType = "video" | "image";

// Define the File type
interface UploadFile {
  mimeType: string;
  [key: string]: any; // Allow other properties if needed
}

interface UploadFile {
  mimeType: string;
  name: string;
  size: number;
  uri: string;
  // Include any other properties if necessary
}

// Register user
export async function createUser(
  email: string,
  password: string,
  username: string
) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error: any) {
    throw new Error(error);
  }
}

// Sign In
export async function signIn(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    return session;
  } catch (error: any) {
    throw new Error(error);
  }
}

// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error: any) {
    throw new Error(error);
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

// Sign Out
export async function signOut() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error: any) {
    throw new Error(error);
  }
}

// Upload File
export async function uploadFile(
  file: UploadFile,
  type: FileType
): Promise<string | undefined> {
  if (!file) return;

  const { mimeType, ...rest } = file;
  const asset = { type: mimeType, ...rest };

  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error: any) {
    throw new Error(error.message || "An error occurred during file upload");
  }
}

// Get File Preview
export async function getFilePreview(
  fileId: string,
  type: FileType
): Promise<string> {
  let fileUrl: string;

  try {
    if (type === "video") {
      // Convert URL to string
      fileUrl = storage
        .getFileView(appwriteConfig.storageId, fileId)
        .toString();
    } else if (type === "image") {
      // Explicitly cast "center" to ImageGravity type
      fileUrl = storage
        .getFilePreview(
          appwriteConfig.storageId,
          fileId,
          2000,
          2000,
          "center" as ImageGravity,
          100
        )
        .toString();
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw new Error("Failed to retrieve file URL");

    return fileUrl;
  } catch (error: any) {
    throw new Error(
      error.message || "An error occurred while retrieving the file preview"
    );
  }
}

// Create Video Post
export async function createVideoPost(form: VideoPostForm) {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.videosCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId,
      }
    );

    return newPost;
  } catch (error: any) {
    throw new Error(error);
  }
}

// Get all video Posts
export async function getAllPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videosCollectionId
    );

    return posts.documents;
  } catch (error: any) {
    throw new Error(error);
  }
}

// Get video posts created by user
export async function getUserPosts(userId: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videosCollectionId,
      [Query.equal("creator", userId)]
    );

    return posts.documents;
  } catch (error: any) {
    throw new Error(error);
  }
}

// Get video posts that matches search query
export async function searchPosts(query: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videosCollectionId,
      [Query.search("title", query)]
    );

    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } catch (error: any) {
    throw new Error(error);
  }
}

// Get latest created video posts
export async function getLatestPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videosCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(7)]
    );

    return posts.documents;
  } catch (error: any) {
    throw new Error(error);
  }
}
