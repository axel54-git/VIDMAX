import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getDecryptedFirebaseConfig } from './utils/securityVault';

// Encrypted credentials dynamically reconstructed inside RAM by Security Vault
const { app, db, auth } = (() => {
  const vaultConfig = getDecryptedFirebaseConfig();
  const internalConfig = {
    apiKey: vaultConfig.apiKey,
    authDomain: vaultConfig.authDomain,
    projectId: vaultConfig.projectId,
    storageBucket: vaultConfig.storageBucket,
    messagingSenderId: vaultConfig.messagingSenderId,
    appId: vaultConfig.appId,
  };
  const dbId = vaultConfig.firestoreDatabaseId || '(default)';
  const firebaseApp = getApps().length === 0 ? initializeApp(internalConfig) : getApp();
  const firestoreDb = getFirestore(firebaseApp, dbId);
  const firebaseAuth = getAuth(firebaseApp);
  return { app: firebaseApp, db: firestoreDb, auth: firebaseAuth };
})();

export { app, db, auth };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo?: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email
    }
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
}

// Initial connection test with offline-resilience
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    // When offline or connecting, Firestore operates seamlessly with local cache
    if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
      console.info("Firestore: Connecting or operating with local cache.");
    }
  }
}

testConnection();
