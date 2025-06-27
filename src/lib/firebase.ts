import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let db: Firestore;

function initializeDb() {
  if (!getApps().length) {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      // This error will be caught by the server action's try/catch block
      throw new Error('Firebase configuration is missing. Please check your .env file and ensure all NEXT_PUBLIC_FIREBASE_ variables are set.');
    }
    const app: FirebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    db = getFirestore(getApp());
  }
}

// Export a function that returns the db instance, initializing it if necessary.
export function getDb() {
  if (!db) {
    initializeDb();
  }
  return db;
}
