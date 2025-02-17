
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push, Database } from 'firebase/database';
import { Message, User } from './types';

// Replace these with your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Database References
const getMessagesRef = () => ref(database, 'messages');
const getUsersRef = () => ref(database, 'users');

// Message Operations
export const sendMessage = async (message: Message) => {
  const newMessageRef = push(getMessagesRef());
  await set(newMessageRef, message);
};

export const subscribeToMessages = (callback: (messages: Message[]) => void) => {
  onValue(getMessagesRef(), (snapshot) => {
    const data = snapshot.val();
    const messages: Message[] = data ? Object.values(data) : [];
    callback(messages);
  });
};

// User Operations
export const updateUserStatus = async (user: User) => {
  await set(ref(database, `users/${user.id}`), user);
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  onValue(getUsersRef(), (snapshot) => {
    const data = snapshot.val();
    const users: User[] = data ? Object.values(data) : [];
    callback(users);
  });
};

export { database };
