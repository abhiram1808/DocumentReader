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
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-2">Loading notes...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger text-center py-3">Error: {error}</div>;
  }

  return (
    <div className="card shadow-sm p-4">
      <h5 className="card-title text-dark mb-4">Your Notes</h5>
      {userId && (
        <p className="text-muted small mb-4">
          Logged in as: <span className="fw-bold text-primary break-all">{userId}</span>
        </p>
      )}

      <div className="mb-4">
        <textarea
          className="form-control mb-3"
          rows="4"
          placeholder="Write your notes here..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        ></textarea>
        <button
          onClick={handleAddNote}
          className="btn btn-primary w-100"
          aria-label="Add note"
          disabled={!isAuthReady || !db || !userId} // Disable if Firebase not ready
        >
          Add Note
        </button>
      </div>

      <div>
        {notes.length === 0 ? (
          <p className="text-muted text-center">No notes yet. Add one above!</p>
        ) : (
          <ul className="list-group list-group-flush">
            {notes.map((note) => (
              <li
                key={note.id}
                className="list-group-item d-flex justify-content-between align-items-start"
              >
                <div className="flex-grow-1 me-3">
                  <p className="mb-1 text-dark">{note.content}</p>
                  <small className="text-muted">
                    {note.createdAt ? new Date(note.createdAt.toDate()).toLocaleString() : 'Saving...'}
                  </small>
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="btn btn-sm btn-danger"
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
