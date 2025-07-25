// src/hooks/useFirebaseNotes.js
import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore, collection, addDoc, onSnapshot,
  query, orderBy, serverTimestamp, deleteDoc, doc
} from 'firebase/firestore';

// Define global variables for Firebase configuration if they exist, otherwise use defaults
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Custom hook for Firebase Notes management
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
    let unsubscribeNotes = () => {};

    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestore);
      setAuth(firebaseAuth);

      unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
          console.log('User authenticated:', user.uid);
        } else {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
              console.log('Signed in with custom token.');
            } else {
              await signInAnonymously(firebaseAuth);
              console.log('Signed in anonymously.');
            }
          } catch (error) {
            console.error('Firebase authentication failed:', error);
            setNotesError('Error signing into Firebase. Notes functionality may be limited.');
          }
        }
        setIsAuthReady(true); // Auth state is ready
        setNotesLoading(false); // Authentication check is complete
      });

      return () => {
        unsubscribeAuth();
        unsubscribeNotes(); // Ensure notes listener is also cleaned up
      };
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
      setNotesError("Failed to initialize Firebase. Notes functionality will not work.");
      setIsAuthReady(true);
      setNotesLoading(false);
    }
  }, []); // Run only once on component mount

  // --- Firestore Notes Listener ---
  useEffect(() => {
    let unsubscribeNotes = () => {};
    if (db && userId && isAuthReady) {
      setNotesLoading(true);
      setNotesError(null);
      try {
        const notesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/notes`);
        // Order notes by timestamp in descending order (latest first)
        const q = query(notesCollectionRef, orderBy('timestamp', 'desc'));

        unsubscribeNotes = onSnapshot(q, (snapshot) => {
          const fetchedNotes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setNotes(fetchedNotes);
          setNotesLoading(false);
          console.log('Notes updated from Firestore.');
        }, (error) => {
          console.error('Error fetching notes from Firestore:', error);
          setNotesError('Error loading notes.');
          setNotesLoading(false);
        });
      } catch (error) {
        console.error('Error setting up notes snapshot listener:', error);
        setNotesError('Error setting up notes listener.');
        setNotesLoading(false);
      }
    } else if (isAuthReady && !userId) {
        // If auth is ready but no user ID (e.g., anonymous sign-in failed),
        // notes won't load, but we should stop loading state.
        setNotesLoading(false);
        setNotesError('Not authenticated to load notes.');
    }
    return () => unsubscribeNotes(); // Cleanup notes listener
  }, [db, userId, isAuthReady]); // Re-run if db, userId, or isAuthReady changes

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
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/notes`), {
        content: content,
        timestamp: serverTimestamp(), // Use server timestamp for consistency
      });
      return true;
    } catch (error) {
      console.error('Error adding note:', error);
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
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/notes`, noteId));
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      setNotesError('Failed to delete note.');
      return false;
    }
  };

  return {
    notes,
    userId,
    notesLoading,
    notesError,
    addNote,
    deleteNote,
    isAuthReady // Expose isAuthReady for components to disable UI elements
  };
};

export default useFirebaseNotes;
