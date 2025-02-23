import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push, Database, update } from 'firebase/database';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile
} from 'firebase/auth';
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
const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Auth Operations
export const registerWithEmail = async (email: string, password: string, name: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });
  const user: User = {
    id: userCredential.user.uid,
    name: name,
    email: email,
    isOnline: true,
    lastSeen: new Date().toISOString()
  };
  await updateUserStatus(user);
  return user;
};

export const loginWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user: User = {
    id: userCredential.user.uid,
    name: userCredential.user.displayName || 'User',
    email: email,
    isOnline: true,
    lastSeen: new Date().toISOString()
  };
  await updateUserStatus(user);
  return user;
};

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user: User = {
    id: result.user.uid,
    name: result.user.displayName || 'User',
    email: result.user.email || undefined,
    photoURL: result.user.photoURL || undefined,
    isOnline: true,
    lastSeen: new Date().toISOString()
  };
  await updateUserStatus(user);
  return user;
};

// Initialize RecaptchaVerifier
export const initRecaptcha = (buttonId: string) => {
  return new RecaptchaVerifier(auth, buttonId, {
    size: 'invisible'
  });
};

export const loginWithPhone = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

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
  await set(newMessageRef, { ...message, id: newMessageRef.key });
};

export const updateMessageReadStatus = async (messageId: string, isRead: boolean) => {
  if (!database) throw new Error('Firebase database not initialized');
  const updates: { [key: string]: boolean } = {};
  updates[`messages/${messageId}/isRead`] = isRead;
  await update(ref(database), updates);
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
