'use server';

import { getDb } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import type { SavedQuery } from '@/lib/types';

export async function getSavedQueries(): Promise<SavedQuery[]> {
  try {
    const db = getDb();
    const queriesCollectionRef = collection(db, 'saved_queries');
    const q = query(queriesCollectionRef); // Fetch all documents first
    const querySnapshot = await getDocs(q);
    
    // Map to an intermediate array with a potential `createdAt` field
    const queriesWithTimestamp = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        query: data.query,
        createdAt: data.createdAt || null,
      };
    });

    // Sort by createdAt descending. Documents without it are treated as older.
    queriesWithTimestamp.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        // Both have timestamps, compare them
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      }
      if (a.createdAt) {
        // Only 'a' has a timestamp, so it's newer
        return -1;
      }
      if (b.createdAt) {
        // Only 'b' has a timestamp, so it's newer
        return 1;
      }
      // Neither has a timestamp, keep original order relative to each other
      return 0;
    });

    // Return the sorted array, mapped to the final `SavedQuery` type
    return queriesWithTimestamp.map(({ id, name, query }) => ({
      id,
      name,
      query,
    }));
  } catch (error) {
    console.error("Error fetching saved queries from Firestore:", error);
    if (error instanceof Error) {
        if (error.message.includes('permission-denied') || error.message.includes('9 FAILED_PRECONDITION') || error.message.includes('Missing or insufficient permissions')) {
             throw new Error('Firestore database not found or not accessible. Please go to your Firebase project console, create a Firestore database, and start it in "test mode" to allow read/write access.');
        }
        throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching saved queries.');
  }
}

export async function addSavedQuery(name: string, queryText: string): Promise<void> {
    try {
        const db = getDb();
        const queriesCollectionRef = collection(db, 'saved_queries');
        await addDoc(queriesCollectionRef, {
            name: name,
            query: queryText,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Failed to save query to Firestore:", error);
        if (error instanceof Error) {
            if (error.message.includes('permission-denied') || error.message.includes('9 FAILED_PRECONDITION') || error.message.includes('Missing or insufficient permissions')) {
                throw new Error('Firestore database not found or not accessible. Please go to your Firebase project console, create a Firestore database, and start it in "test mode" to allow read/write access.');
            }
            throw new Error(error.message);
        }
        throw new Error('An unexpected error occurred while saving the query.');
    }
}

export async function deleteSavedQuery(id: string): Promise<void> {
    try {
        const db = getDb();
        const queryDoc = doc(db, 'saved_queries', id);
        await deleteDoc(queryDoc);
    } catch(error) {
        console.error("Failed to delete query from Firestore:", error);
        if (error instanceof Error) {
            if (error.message.includes('permission-denied') || error.message.includes('9 FAILED_PRECONDITION') || error.message.includes('Missing or insufficient permissions')) {
                throw new Error('Firestore database not found or not accessible. Please go to your Firebase project console, create a Firestore database, and start it in "test mode" to allow read/write access.');
            }
            throw new Error(error.message);
        }
        throw new Error('An unexpected error occurred while deleting the query.');
    }
}
