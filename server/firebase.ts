import admin from "firebase-admin";

let firebaseApp: admin.app.App | null = null;
let firestoreDb: admin.firestore.Firestore | null = null;

export function initializeFirebase() {
  if (firebaseApp) {
    return { app: firebaseApp, db: firestoreDb! };
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set");
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firestoreDb = admin.firestore();
    
    console.log("Firebase initialized successfully");
    
    return { app: firebaseApp, db: firestoreDb };
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    throw error;
  }
}

export function getFirestore(): admin.firestore.Firestore {
  if (!firestoreDb) {
    const { db } = initializeFirebase();
    return db;
  }
  return firestoreDb;
}
