'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import type { SavedQuery } from '@/lib/types';

const queriesCollectionRef = collection(db, 'saved_queries');

export async function getSavedQueries(): Promise<SavedQuery[]> {
  try {
    const q = query(queriesCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      query: doc.data().query,
    }));
  } catch (error) {
    console.error("Error fetching saved queries from Firestore:", error);
    if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('9 FAILED_PRECONDITION') || error.message.includes('Missing or insufficient permissions'))) {
         throw new Error('Failed to fetch queries. This might be due to missing Firestore security rules or the database not being set up. Please check your Firebase project configuration.');
    }
    throw new Error('An unexpected error occurred while fetching saved queries.');
  }
}

export async function addSavedQuery(name: string, queryText: string): Promise<SavedQuery> {
  const docRef = await addDoc(queriesCollectionRef, {
    name: name,
    query: queryText,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, name, query: queryText };
}

export async function deleteSavedQuery(id: string): Promise<void> {
  const queryDoc = doc(db, 'saved_queries', id);
  await deleteDoc(queryDoc);
}
