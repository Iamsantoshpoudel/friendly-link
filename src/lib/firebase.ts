import { initializeApp, getApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push, Database, update, onDisconnect } from 'firebase/database';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
  sendPasswordResetEmail,
  AuthError,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword
} from 'firebase/auth';
import { Message, User } from './types';

declare global {
  interface Window {
    activityTimeout?: NodeJS.Timeout;
  }
}

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

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error: any) {
  if (error.code !== 'app/duplicate-app') {
    console.error('Firebase initialization error:', error);
    throw error;
  }
  app = getApp(); // Get the already initialized app
}

const database = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const formatAuthError = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled. Please try again';
    case 'auth/cancelled-popup-request':
      return 'Only one sign in window allowed at a time';
    case 'auth/popup-blocked':
      return 'Sign in popup was blocked by your browser';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    case 'auth/missing-email':
      return 'Please enter your email address';
    case 'auth/invalid-action-code':
      return 'The password reset link is invalid or has expired';
    default:
      return 'An error occurred during authentication. Please try again';
  }
};

export const registerWithEmail = async (email: string, password: string, name: string) => {
  try {
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
  } catch (error: any) {
    throw new Error(formatAuthError(error));
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
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
  } catch (error: any) {
    throw new Error(formatAuthError(error));
  }
};

export const loginWithGoogle = async () => {
  try {
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
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
  } catch (error: any) {
    throw new Error(formatAuthError(error));
  }
};

export const initRecaptcha = (buttonId: string) => {
  return new RecaptchaVerifier(auth, buttonId, {
    size: 'invisible'
  });
};

export const loginWithPhone = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

const getMessagesRef = () => {
  return ref(database, 'messages');
};

const getUsersRef = () => {
  return ref(database, 'users');
};

export const sendMessage = async (message: Message) => {
  const newMessageRef = push(ref(database, 'messages'));
  await set(newMessageRef, { ...message, id: newMessageRef.key });
};

export const updateMessageReadStatus = async (messageId: string, isRead: boolean) => {
  const messageRef = ref(database, `messages/${messageId}`);
  await update(messageRef, { isRead });
};

export const subscribeToMessages = (callback: (messages: Message[]) => void) => {
  const messagesRef = ref(database, 'messages');
  return onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    const messages: Message[] = data ? Object.values(data) : [];
    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    callback(messages);
  });
};

export const updateUserStatus = async (user: User) => {
  if (!user || !user.id) return () => {};

  const userStatusRef = ref(database, `users/${user.id}`);
  const userStatusDatabaseRef = ref(database, '.info/connected');
  let onDisconnectRef: any;

  return new Promise<() => void>((resolve) => {
    const onConnected = onValue(userStatusDatabaseRef, async (snapshot) => {
      if (snapshot.val() === false) {
        return;
      }

      if (onDisconnectRef) {
        await onDisconnectRef.cancel();
      }

      onDisconnectRef = onDisconnect(userStatusRef);
      await onDisconnectRef.update({
        isOnline: false,
        lastSeen: new Date().toISOString()
      });

      await set(userStatusRef, {
        ...user,
        isOnline: true,
        lastSeen: new Date().toISOString()
      });

      resolve(() => {
        onConnected();
        if (onDisconnectRef) {
          onDisconnectRef.cancel();
        }
        return set(userStatusRef, {
          ...user,
          isOnline: false,
          lastSeen: new Date().toISOString()
        });
      });
    });
  });
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const usersRef = ref(database, 'users');
  return onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    const users: User[] = data ? Object.values(data) : [];
    users.sort((a, b) => {
      if (a.isOnline === b.isOnline) {
        return a.name.localeCompare(b.name);
      }
      return a.isOnline ? -1 : 1;
    });
    callback(users);
  });
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(formatAuthError(error));
  }
};

export const updateUserEmail = async (newEmail: string, currentPassword: string) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No authenticated user found');

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    await updateEmail(user, newEmail);
  } catch (error: any) {
    throw new Error(formatAuthError(error));
  }
};

export const updateUserPassword = async (currentPassword: string, newPassword: string) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No authenticated user found');

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    await updatePassword(user, newPassword);
  } catch (error: any) {
    throw new Error(formatAuthError(error));
  }
};

export { database };
