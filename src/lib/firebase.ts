
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push, Database } from 'firebase/database';
import { Message, User } from './types';

// Replace these with your Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://your-project.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

let database: Database | null = null;

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Database References
const getMessagesRef = () => {
  if (!database) throw new Error('Firebase database not initialized');
  return ref(database, 'messages');
};

const getUsersRef = () => {
  if (!database) throw new Error('Firebase database not initialized');
  return ref(database, 'users');
};

// Message Operations
export const sendMessage = async (message: Message) => {
  if (!database) throw new Error('Firebase database not initialized');
  const newMessageRef = push(getMessagesRef());
  await set(newMessageRef, message);
};

export const subscribeToMessages = (callback: (messages: Message[]) => void) => {
  if (!database) {
    console.error('Firebase database not initialized');
    callback([]);
    return;
  }
  
  onValue(getMessagesRef(), (snapshot) => {
    const data = snapshot.val();
    const messages: Message[] = data ? Object.values(data) : [];
    callback(messages);
  });
};

// User Operations
export const updateUserStatus = async (user: User) => {
  if (!database) throw new Error('Firebase database not initialized');
  await set(ref(database, `users/${user.id}`), user);
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  if (!database) {
    console.error('Firebase database not initialized');
    callback([]);
    return;
  }

  onValue(getUsersRef(), (snapshot) => {
    const data = snapshot.val();
    const users: User[] = data ? Object.values(data) : [];
    callback(users);
  });
};

export { database };
