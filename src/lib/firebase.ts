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

// Initialize Firebase with error handling
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

// Initialize Firebase services
const database = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

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
  return ref(database, 'messages');
};

const getUsersRef = () => {
  return ref(database, 'users');
};

// Message Operations
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
  onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    const messages: Message[] = data ? Object.values(data) : [];
    callback(messages);
  });
};

// User Operations
export const updateUserStatus = async (user: User) => {
  if (!user || !user.id) return;

  const userStatusRef = ref(database, `users/${user.id}`);
  const userStatusDatabaseRef = ref(database, '.info/connected');

  onValue(userStatusDatabaseRef, (snapshot) => {
    if (snapshot.val() === false) {
      return;
    }

    onDisconnect(userStatusRef)
      .update({
        isOnline: false,
        lastSeen: new Date().toISOString()
      })
      .then(() => {
        set(userStatusRef, {
          ...user,
          isOnline: true,
          lastSeen: new Date().toISOString()
        });
      });
  });

  // Clear any existing activity timeout
  if (window.activityTimeout) {
    clearTimeout(window.activityTimeout);
  }

  // Set up activity monitoring
  const activityEvents = ['mousedown', 'keydown', 'touchstart', 'mousemove'];
  let timeoutId: NodeJS.Timeout;

  const resetActivityTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      set(userStatusRef, {
        ...user,
        isOnline: false,
        lastSeen: new Date().toISOString()
      });
    }, 60000); // Set to offline after 1 minute of inactivity
  };

  const handleActivity = () => {
    set(userStatusRef, {
      ...user,
      isOnline: true,
      lastSeen: new Date().toISOString()
    });
    resetActivityTimeout();
  };

  activityEvents.forEach(event => {
    window.removeEventListener(event, handleActivity);
    window.addEventListener(event, handleActivity);
  });

  // Initial status
  set(userStatusRef, {
    ...user,
    isOnline: true,
    lastSeen: new Date().toISOString()
  });

  resetActivityTimeout();

  // Cleanup function
  return () => {
    activityEvents.forEach(event => {
      window.removeEventListener(event, handleActivity);
    });
    if (timeoutId) clearTimeout(timeoutId);
    set(userStatusRef, {
      ...user,
      isOnline: false,
      lastSeen: new Date().toISOString()
    });
  };
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const usersRef = ref(database, 'users');
  onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    const users: User[] = data ? Object.values(data) : [];
    callback(users);
  });
};

export { database };
