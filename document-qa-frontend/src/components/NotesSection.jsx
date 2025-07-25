import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';

// Define global variables provided by the Canvas environment (if available)
const canvasAppId = typeof __app_id !== 'undefined' ? __app_id : null;
const canvasFirebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const canvasInitialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

const NotesSection = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Construct Firebase config from environment variables or Canvas globals
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

  // 1. Initialize Firebase App and Auth Listener
  useEffect(() => {
    try {
      // --- Robust check for essential Firebase config fields ---
      if (!effectiveFirebaseConfig.apiKey || !effectiveFirebaseConfig.authDomain || !effectiveFirebaseConfig.projectId) {
        throw new Error("Firebase config is incomplete. Ensure apiKey, authDomain, and projectId are provided in .env.local or by Canvas.");
      }

      const app = initializeApp(effectiveFirebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app); // Get auth instance from the initialized app

      setDb(firestore);
      setAuth(firebaseAuth);

      // Listen for authentication state changes
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          // User is signed in.
          setUserId(user.uid);
          console.log("Firebase: User signed in with UID:", user.uid);
        } else {
          // User is signed out or not yet signed in.
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
              console.log("Firebase: Signed in with custom token.");
            } else {
              await signInAnonymously(firebaseAuth);
              console.log("Firebase: Signed in anonymously.");
            }
          } catch (authError) {
            console.error("Firebase Auth Error:", authError);
            setError(`Authentication failed: ${authError.message}`);
          }
        }
        setIsAuthReady(true); // Mark auth as ready after initial check/attempt
        setLoading(false);
      });

      // Cleanup subscription on component unmount
      return () => unsubscribe();
    } catch (err) {
      console.error("Firebase Initialization Error:", err);
      setError(`Firebase initialization failed: ${err.message}`);
      setLoading(false);
    }
  }, [effectiveFirebaseConfig, initialAuthToken]); // Re-run if config or token changes

  // 2. Fetch Notes from Firestore (dependent on auth readiness and userId)
  useEffect(() => {
    if (!isAuthReady || !db || !userId) {
      return; // Wait until auth is ready and userId is set
    }

    // Define the collection path for private user data
    const notesCollectionRef = collection(db, `artifacts/${currentAppId}/users/${userId}/notes`);
    const q = query(notesCollectionRef, orderBy('createdAt', 'desc'));

    console.log(`Firebase: Attempting to listen to notes for user: ${userId} in app: ${currentAppId}`);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotes(fetchedNotes);
      setError(null); // Clear any previous errors
      console.log(`Firebase: Fetched ${fetchedNotes.length} notes.`);
    }, (err) => {
      console.error("Firebase Firestore Error fetching notes:", err);
      setError(`Failed to load notes: ${err.message}. Please ensure Firestore rules allow read access for authenticated users.`);
      setLoading(false); // Stop loading on error
    });

    // Cleanup subscription on component unmount or userId change
    return () => unsubscribe();
  }, [isAuthReady, db, userId, currentAppId]); // Re-run when auth state, db, or userId changes

  const handleAddNote = async () => {
    if (!db || !userId) {
      setError("Not authenticated. Please wait for user authentication or check Firebase setup.");
      return;
    }
    if (!newNote.trim()) {
      setError("Note cannot be empty.");
      return;
    }

    try {
      const notesCollectionRef = collection(db, `artifacts/${currentAppId}/users/${userId}/notes`);
      await addDoc(notesCollectionRef, {
        content: newNote,
        createdAt: serverTimestamp(), // Use server timestamp for consistency
      });
      setNewNote('');
      setError(null); // Clear error on success
      console.log("Firebase: Note added successfully.");
    } catch (err) {
      console.error("Firebase Firestore Error adding note:", err);
      setError(`Failed to add note: ${err.message}. Please ensure Firestore rules allow write access.`);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!db || !userId) {
      setError("Not authenticated. Please wait for user authentication or check Firebase setup.");
      return;
    }
    try {
      const noteDocRef = doc(db, `artifacts/${currentAppId}/users/${userId}/notes`, id);
      await deleteDoc(noteDocRef);
      setError(null); // Clear error on success
      console.log("Firebase: Note deleted successfully.");
    } catch (err) {
      console.error("Firebase Firestore Error deleting note:", err);
      setError(`Failed to delete note: ${err.message}. Please ensure Firestore rules allow delete access.`);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-600">Loading notes...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Notes</h2>
      {userId && (
        <p className="text-sm text-gray-500 mb-4">
          Logged in as: <span className="font-mono text-blue-600 break-all">{userId}</span>
        </p>
      )}

      <div className="mb-6">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          rows="4"
          placeholder="Write your notes here..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        ></textarea>
        <button
          onClick={handleAddNote}
          className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
          aria-label="Add note"
        >
          Add Note
        </button>
      </div>

      <div>
        {notes.length === 0 ? (
          <p className="text-gray-500 text-center">No notes yet. Add one above!</p>
        ) : (
          <ul className="space-y-4">
            {notes.map((note) => (
              <li
                key={note.id}
                className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200 flex justify-between items-start"
              >
                <div className="flex-grow">
                  <p className="text-gray-800 text-base mb-1">{note.content}</p>
                  <p className="text-xs text-gray-500">
                    {note.createdAt ? new Date(note.createdAt.toDate()).toLocaleString() : 'Saving...'}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="ml-4 p-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200"
                  aria-label="Delete note"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotesSection;
