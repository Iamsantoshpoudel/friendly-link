
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push, Database } from 'firebase/database';
import { Message, User } from './types';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcWUwbXc6r1M14CNfeojVDo7SyFylvrY8",
  authDomain: "website-database-b5b62.firebaseapp.com",
  databaseURL: "https://website-database-b5b62-default-rtdb.firebaseio.com",
  projectId: "website-database-b5b62",
  storageBucket: "website-database-b5b62.appspot.com",
  messagingSenderId: "799535806005",
  appId: "1:799535806005:web:63752dcd35f62feb55a37c",
  measurementId: "G-4F1W5ZS53S"
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
