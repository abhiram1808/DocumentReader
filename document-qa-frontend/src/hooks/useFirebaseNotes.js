// src/hooks/useFirebaseNotes.js
import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore, collection, addDoc, onSnapshot,
  query, orderBy, serverTimestamp, deleteDoc, doc
} from 'firebase/firestore';

// Define global variables for Firebase configuration if they exist, otherwise use defaults
const canvasAppId = typeof __app_id !== 'undefined' ? __app_id : null;
const canvasFirebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const canvasInitialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Determine Firebase config and app ID based on environment
const effectiveFirebaseConfig = canvasFirebaseConfig || {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const currentAppId = canvasAppId || effectiveFirebaseConfig.projectId || 'document-reader-local';
const initialAuthToken = canvasInitialAuthToken;

// Custom hook for Firebase Notes management AND exposing core Firebase instances
const useFirebaseNotes = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState(null);

  // --- Firebase Initialization and Authentication ---
  useEffect(() => {
    let unsubscribeAuth = () => {};

    try {
      // Robust check for essential Firebase config fields
      if (!effectiveFirebaseConfig.apiKey || !effectiveFirebaseConfig.authDomain || !effectiveFirebaseConfig.projectId) {
        throw new Error("Firebase config is incomplete. Ensure apiKey, authDomain, and projectId are provided in .env.local or by Canvas.");
      }

      const app = initializeApp(effectiveFirebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestore);
      setAuth(firebaseAuth);

      unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
          console.log('useFirebaseNotes: User authenticated:', user.uid);
        } else {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
              console.log('useFirebaseNotes: Signed in with custom token.');
            } else {
              await signInAnonymously(firebaseAuth);
              console.log('useFirebaseNotes: Signed in anonymously.');
            }
          } catch (error) {
            console.error('useFirebaseNotes: Firebase authentication failed:', error);
            setNotesError('Error signing into Firebase. Notes functionality may be limited.');
          }
        }
        setIsAuthReady(true); // Auth state is ready
        setNotesLoading(false); // Authentication check is complete
      });

      return () => {
        unsubscribeAuth();
      };
    } catch (error) {
      console.error("useFirebaseNotes: Failed to initialize Firebase:", error);
      setNotesError("Failed to initialize Firebase. Notes functionality will not work.");
      setIsAuthReady(true);
      setNotesLoading(false);
    }
  }, [effectiveFirebaseConfig, initialAuthToken]); // Dependencies for re-running effect

  // --- Firestore Notes Listener ---
  useEffect(() => {
    let unsubscribeNotes = () => {};
    if (db && userId && isAuthReady) {
      setNotesLoading(true);
      setNotesError(null);
      try {
        const notesCollectionRef = collection(db, `artifacts/${currentAppId}/users/${userId}/notes`);
        const q = query(notesCollectionRef, orderBy('timestamp', 'desc'));

        unsubscribeNotes = onSnapshot(q, (snapshot) => {
          const fetchedNotes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setNotes(fetchedNotes);
          setNotesLoading(false);
          console.log('useFirebaseNotes: Notes updated from Firestore.');
        }, (error) => {
          console.error('useFirebaseNotes: Error fetching notes from Firestore:', error);
          setNotesError('Error loading notes.');
          setNotesLoading(false);
        });
      } catch (error) {
        console.error('useFirebaseNotes: Error setting up notes snapshot listener:', error);
        setNotesError('Error setting up notes listener.');
        setNotesLoading(false);
      }
    } else if (isAuthReady && !userId) {
      setNotesLoading(false);
      setNotesError('Not authenticated to load notes.');
    }
    return () => unsubscribeNotes(); // Cleanup notes listener
  }, [db, userId, isAuthReady, currentAppId]); // Re-run if db, userId, isAuthReady, or appId changes

  /**
   * Adds a new note to Firestore.
   * @param {string} content - The content of the note.
   * @returns {Promise<boolean>} True if successful, false otherwise.
   */
  const addNote = async (content) => {
    if (!db || !userId || !isAuthReady) {
      setNotesError('Firebase not ready or user not authenticated. Cannot add note.');
      return false;
    }
    try {
      await addDoc(collection(db, `artifacts/${currentAppId}/users/${userId}/notes`), {
        content: content,
        timestamp: serverTimestamp(), // Use server timestamp for consistency
      });
      return true;
    } catch (error) {
      console.error('useFirebaseNotes: Error adding note:', error);
      setNotesError('Failed to add note.');
      return false;
    }
  };

  /**
   * Deletes a note from Firestore.
   * @param {string} noteId - The ID of the note to delete.
   * @returns {Promise<boolean>} True if successful, false otherwise.
   */
  const deleteNote = async (noteId) => {
    if (!db || !userId || !isAuthReady) {
      setNotesError('Firebase not ready or user not authenticated. Cannot delete note.');
      return false;
    }
    try {
      await deleteDoc(doc(db, `artifacts/${currentAppId}/users/${userId}/notes`, noteId));
      return true;
    } catch (error) {
      console.error('useFirebaseNotes: Error deleting note:', error);
      setNotesError('Failed to delete note.');
      return false;
    }
  };

  return {
    // Core Firebase instances and auth state
    db,
    auth,
    userId,
    isAuthReady,
    currentAppId, // Also export currentAppId for consistency

    // Notes-specific state and functions
    notes,
    notesLoading,
    notesError,
    addNote,
    deleteNote,
  };
};

export default useFirebaseNotes;
