// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import * as DocumentApi from '../api/documentApi'; // Import all functions from DocumentApi

// --- Import ALL necessary components ---
import DocumentUpload from '../components/DocumentUpload';
import MessageDisplay from '../components/MessageDisplay';
import TabNavigation from '../components/TabNavigation';
import QaSection from '../components/QaSection';
import SummarySection from '../components/SummarySection';
import KeyConceptsSection from '../components/KeyConceptsSection';
import GeneratedQaSection from '../components/GeneratedQaSection';
import NotesSection from '../components/NotesSection';
import FlashcardsSection from '../components/FlashcardsSection';
import DocumentHistory from '../components/DocumentHistory';

// Import the custom hook that handles Firebase initialization and notes
import useFirebaseNotes from '../hooks/useFirebaseNotes';

// Firebase imports for Firestore operations within HomePage (used for document metadata)
import { collection, doc, setDoc, getDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

// Accept initialActiveTab prop
const HomePage = ({ initialActiveTab }) => {
  // --- Consume Firebase instances from useFirebaseNotes hook ---
  const { db, auth, userId, isAuthReady, currentAppId, notesError: firebaseNotesError } = useFirebaseNotes();

  // --- UI and Data State ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState(''); // Specific message for upload section
  const [uploadError, setUploadError] = useState(''); // Specific error for upload section

  // Global message states for MessageDisplay component (FIXED: These MUST be present)
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'info', 'success', 'error', 'warning', 'danger'

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [answerLoading, setAnswerLoading] = useState(false);
  const [answerError, setAnswerError] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [keyConcepts, setKeyConcepts] = useState([]);
  const [keyConceptsLoading, setKeyConceptsLoading] = useState(false);
  const [keyConceptsError, setKeyConceptsError] = useState('');
  const [qaPairs, setQaPairs] = useState([]); // Renamed from generatedQA for consistency with Firestore
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [flashcardsError, setFlashcardsError] = useState('');

  // Initialize activeTab with the prop, or fallback to 'upload' if not provided
  const [activeTab, setActiveTab] = useState(initialActiveTab || 'upload'); // Default active tab

  // --- States for Multi-Document Management ---
  const [documentList, setDocumentList] = useState([]); // List of all uploaded documents metadata
  const [currentDocumentId, setCurrentDocumentId] = useState(null); // ID of the currently active document
  const [initialLoading, setInitialLoading] = useState(true); // Combined loading for Firebase init + initial doc data

  // 1. Listener for Document List (metadata) from Firestore
  // This runs once Firebase auth is ready and userId is available
  useEffect(() => {
    let unsubscribeDocumentList = () => {};

    if (db && userId && isAuthReady) {
      setMessage(''); // Clear global messages on init
      setMessageType('info');
      setUploadError(''); // Clear any previous upload errors
      try {
        const documentsCollectionRef = collection(db, `artifacts/${currentAppId}/users/${userId}/documents`);
        const q = query(documentsCollectionRef, orderBy('uploadTimestamp', 'desc'));

        unsubscribeDocumentList = onSnapshot(q, (snapshot) => {
          const fetchedDocuments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setDocumentList(fetchedDocuments);
          console.log(`HomePage: Fetched ${fetchedDocuments.length} documents from Firestore.`);

          // Set the first document as active if none is currently active and list is not empty
          if (!currentDocumentId && fetchedDocuments.length > 0) {
            setCurrentDocumentId(fetchedDocuments[0].id);
            console.log(`HomePage: Setting first document (${fetchedDocuments[0].id}) as active.`);
          }
          setInitialLoading(false); // Initial loading of document list is complete
        }, (error) => {
          console.error("HomePage Firestore Error fetching document list:", error);
          setMessage(`Failed to load document list: ${error.message}`); // Use global message
          setMessageType('error');
          setInitialLoading(false);
        });
      } catch (error) {
        console.error("HomePage Error setting up document list listener:", error);
        setMessage("Error setting up document list listener."); // Use global message
        setMessageType('error');
        setInitialLoading(false);
      }
    } else if (isAuthReady && !userId) {
      setInitialLoading(false); // Auth ready but no user, stop loading
      setMessage('Not authenticated to load document list.'); // Use global message
      setMessageType('warning');
    }

    return () => unsubscribeDocumentList();
  }, [db, userId, isAuthReady, currentAppId, currentDocumentId, setMessage, setMessageType, setUploadError, setInitialLoading]); // Added dependencies

  // 2. Load generated data for the active document whenever currentDocumentId changes
  useEffect(() => {
    const loadActiveDocumentData = async () => {
      if (!db || !userId || !currentDocumentId) {
        // No document selected or Firebase not ready, clear data
        setSummary('');
        setKeyConcepts([]);
        setQaPairs([]);
        setFlashcards([]);
        return;
      }

      // Set specific loading states for the content
      setAnswerLoading(true);
      setSummaryLoading(true);
      setKeyConceptsLoading(true);
      setQaLoading(true);
      setFlashcardsLoading(true);
      setMessage(''); // Clear global message on new load
      setMessageType('info');
      setUploadError(''); // Clear general errors

      try {
        // First, tell the backend to load this document's context
        await DocumentApi.loadDocumentContext(currentDocumentId);
        console.log(`Backend context loaded for document ID: ${currentDocumentId}`);

        // Then, load the generated data from Firestore
        const docRef = doc(db, `artifacts/${currentAppId}/users/${userId}/documents`, currentDocumentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSummary(data.summary || '');
          setKeyConcepts(data.keyConcepts || []);
          setQaPairs(data.qaPairs || []);
          setFlashcards(data.flashcards || []);
          setMessage(`Loaded data for document: ${data.fileName || currentDocumentId}.`);
          setMessageType('success');
          console.log("HomePage: Loaded generated data from Firestore for active document.");
        } else {
          // If no generated data exists, clear states
          setSummary('');
          setKeyConcepts([]);
          setQaPairs([]);
          setFlashcards([]);
          setMessage(`No generated data found for document ID: ${currentDocumentId}.`);
          setMessageType('info');
          console.log("HomePage: No generated data found in Firestore for active document.");
        }
      } catch (error) {
        console.error("HomePage Error loading active document data:", error);
        setMessage(`Failed to load document data: ${error.message}`);
        setMessageType('error');
      } finally {
        // Reset all loading states
        setAnswerLoading(false);
        setSummaryLoading(false);
        setKeyConceptsLoading(false);
        setQaLoading(false);
        setFlashcardsLoading(false);
      }
    };

    if (currentDocumentId && db && userId) { // Only load if a document is selected and Firebase is ready
      loadActiveDocumentData();
    }
  }, [currentDocumentId, db, userId, currentAppId, setSummary, setKeyConcepts, setQaPairs, setFlashcards, setMessage, setMessageType, setUploadError, setAnswerLoading, setSummaryLoading, setKeyConceptsLoading, setQaLoading, setFlashcardsLoading]); // Add all setters as dependencies

  // Helper function to save generated data to Firestore for the current active document
  const saveGeneratedData = async (dataToSave) => {
    if (!db || !userId || !currentDocumentId) {
      console.warn("Firestore not ready, user not authenticated, or no document active. Cannot save data.");
      setMessage("Cannot save data: Please ensure a document is uploaded/selected and Firebase is ready.");
      setMessageType('error');
      return;
    }
    try {
      const docRef = doc(db, `artifacts/${currentAppId}/users/${userId}/documents`, currentDocumentId);
      await setDoc(docRef, dataToSave, { merge: true }); // Use merge to update specific fields
      console.log(`HomePage: Data saved for document ID: ${currentDocumentId} to Firestore successfully.`);
      setMessage(''); // Clear global message on success
      setMessageType('info');
    } catch (error) {
      console.error("HomePage Firestore Error saving data:", error);
      setMessage(`Failed to save data: ${error.message}`);
      setMessageType('error');
    }
  };

  // --- Handlers ---
  // This now correctly accepts the 'file' object directly from DocumentUpload
  const handleFileChange = (file) => {
    setSelectedFile(file);
    setUploadMessage(''); // Clear specific upload message
    setUploadError(''); // Clear specific upload error
    setMessage(''); // Clear global message
    setMessageType('info');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.'); // Use specific upload error
      return;
    }
    if (!db || !userId || !isAuthReady) {
      setUploadError('Firebase not ready or user not authenticated. Cannot upload document.'); // Use specific upload error
      return;
    }

    setUploadMessage('Uploading document and creating knowledge base...'); // Use specific upload message
    setMessageType('info'); // Set global message type for general feedback
    setMessage('Uploading document and creating knowledge base...'); // Set global message
    setUploadError(''); // Clear specific upload error
    // Clear all previous AI outputs when a new document is uploaded
    setAnswer(''); setSummary(''); setKeyConcepts([]); setQaPairs([]); setFlashcards([]);

    try {
      // 1. Create a new document entry in Firestore to get a unique ID
      const newDocRef = doc(collection(db, `artifacts/${currentAppId}/users/${userId}/documents`));
      const newDocumentId = newDocRef.id;

      // Initialize the Firestore document with metadata and empty generated fields
      await setDoc(newDocRef, {
        fileName: selectedFile.name,
        uploadTimestamp: serverTimestamp(),
        summary: '',
        keyConcepts: [],
        qaPairs: [],
        flashcards: [],
      });
      console.log(`HomePage: Created new Firestore document with ID: ${newDocumentId}`);

      // 2. Upload the PDF to the backend, passing the new document ID
      const data = await DocumentApi.uploadDocument(selectedFile, newDocumentId);
      if (data.message) {
        setUploadMessage(data.message); // Use specific upload message
        setMessage(data.message); // Also set global message
        setMessageType('success');
      } else if (data.error) {
        setUploadError(`Error: ${data.error}`); // Use specific upload error
        setMessage(`Error: ${data.error}`); // Also set global message
        setMessageType('error');
      }
      setCurrentDocumentId(newDocumentId); // Set the newly uploaded document as active
      setActiveTab('qa'); // Switch to Q&A tab after successful upload
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error.message); // Use specific upload error
      setMessage(`Failed to connect to the server or upload document: ${error.message}`); // Set global message
      setMessageType('error');
    } finally {
      // setLoading(false); // Removed global loading, using specific ones
      setSelectedFile(null); // Clear the selected file after upload attempt
    }
  };

  const handleAskQuestion = async () => {
    if (!currentDocumentId) {
      setAnswerError('Please upload or select a document first to ask a question.');
      setMessage('Please upload or select a document first to ask a question.'); // Set global message
      setMessageType('warning');
      return;
    }
    if (!question.trim()) {
      setAnswerError('Please enter a question.');
      setMessage('Please enter a question.'); // Set global message
      setMessageType('warning');
      return;
    }

    setAnswerLoading(true);
    setAnswer('');
    setAnswerError('');
    setMessage('Getting answer...'); // Set global message
    setMessageType('info');
    try {
      const response = await DocumentApi.askQuestion(question);
      setAnswer(response.answer);
      setMessage('Answer retrieved successfully.'); // Set global message
      setMessageType('success');
    } catch (error) {
      setAnswerError(error.message);
      setMessage(`Failed to get answer: ${error.message}`); // Set global message
      setMessageType('error');
    } finally {
      setAnswerLoading(false);
    }
  };

  const handleGetSummary = async () => {
    if (!currentDocumentId) {
      setSummaryError('Please upload or select a document first to generate a summary.');
      setMessage('Please upload or select a document first to generate a summary.'); // Set global message
      setMessageType('warning');
      return;
    }
    setSummaryLoading(true);
    setSummary('');
    setSummaryError('');
    setMessage('Generating summary...'); // Set global message
    setMessageType('info');
    try {
      const response = await DocumentApi.getSummary();
      setSummary(response.summary);
      setMessage('Summary generated successfully.'); // Set global message
      setMessageType('success');
      await saveGeneratedData({ summary: response.summary }); // Save to Firestore
    } catch (error) {
      setSummaryError(error.message);
      setMessage(`Failed to generate summary: ${error.message}`); // Set global message
      setMessageType('error');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleGetKeyConcepts = async () => {
    if (!currentDocumentId) {
      setKeyConceptsError('Please upload or select a document first to extract key concepts.');
      setMessage('Please upload or select a document first to extract key concepts.'); // Set global message
      setMessageType('warning');
      return;
    }
    setKeyConceptsLoading(true);
    setKeyConcepts([]);
    setKeyConceptsError('');
    setMessage('Extracting key concepts...'); // Set global message
    setMessageType('info');
    try {
      const response = await DocumentApi.getKeyConcepts();
      setKeyConcepts(response.concepts);
      setMessage('Key concepts extracted successfully.'); // Set global message
      setMessageType('success');
      await saveGeneratedData({ keyConcepts: response.concepts }); // Save to Firestore
    } catch (error) {
      setKeyConceptsError(error.message);
      setMessage(`Failed to extract key concepts: ${error.message}`); // Set global message
      setMessageType('error');
    } finally {
      setKeyConceptsLoading(false);
    }
  };

  const handleGenerateQA = async () => {
    if (!currentDocumentId) {
      setQaError('Please upload or select a document first to generate Q&A pairs.');
      setMessage('Please upload or select a document first to generate Q&A pairs.'); // Set global message
      setMessageType('warning');
      return;
    }
    setQaLoading(true);
    setQaPairs([]);
    setQaError('');
    setMessage('Generating important Q&A pairs...'); // Set global message
    setMessageType('info');
    try {
      const response = await DocumentApi.generateQA();
      setQaPairs(response.qa_pairs);
      setMessage('Important Q&A pairs generated successfully.'); // Set global message
      setMessageType('success');
      await saveGeneratedData({ qaPairs: response.qa_pairs }); // Save to Firestore
    } catch (error) {
      setQaError(error.message);
      setMessage(`Failed to generate Q&A: ${error.message}`); // Set global message
      setMessageType('error');
    } finally {
      setQaLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!currentDocumentId) {
      setFlashcardsError('Please upload or select a document first to generate flashcards.');
      setMessage('Please upload or select a document first to generate flashcards.'); // Set global message
      setMessageType('warning');
      return;
    }
    setFlashcardsLoading(true);
    setFlashcards([]);
    setFlashcardsError('');
    setMessage('Generating flashcards...'); // Set global message
    setMessageType('info');
    try {
      const response = await DocumentApi.generateFlashcards();
      setFlashcards(response.flashcards);
      setMessage('Flashcards generated successfully.'); // Set global message
      setMessageType('success');
      await saveGeneratedData({ flashcards: response.flashcards }); // Save to Firestore
    } catch (error) {
      setFlashcardsError(error.message);
      setMessage(`Failed to generate flashcards: ${error.message}`); // Set global message
      setMessageType('error');
    } finally {
      setFlashcardsLoading(false);
    }
  };

  // New handler to load a previously uploaded document
  const handleLoadDocument = async (docId) => {
    if (docId === currentDocumentId) {
      console.log(`Document ${docId} is already the active document.`);
      return; // Already active, do nothing
    }
    setCurrentDocumentId(docId); // This will trigger the useEffect to load data
    setActiveTab('qa'); // Optionally switch to Q&A tab when a document is loaded
  };

  // Define tabs for TabNavigation component, including Flashcards and Upload
  const tabsConfig = [
    { id: 'upload', name: '1. Upload Document' },
    { id: 'qa', name: '2. Q&A' },
    { id: 'summary', name: '3. Summary' },
    { id: 'key-concepts', name: '4. Key Concepts' },
    { id: 'generated_qa', name: '5. Generated Q&A' },
    { id: 'flashcards', name: '6. Flashcards' },
    { id: 'notes', name: '7. Notes' },
  ];

  // If there's a Firebase notes error, display it prominently
  if (firebaseNotesError) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="card shadow-sm p-4 text-center text-danger">
          <h2 className="card-title h4 mb-3">Firebase Initialization Error</h2>
          <p className="card-text">{firebaseNotesError}</p>
          <p className="card-text text-muted mt-3">Please check your Firebase configuration and internet connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4"> {/* Use container-fluid for full width, py-4 for padding */}
      <div className="row"> {/* Bootstrap row for layout */}

        {/* Left Column: Document History Sidebar (col-md-3) */}
        <aside className="col-md-3 bg-white p-4 rounded shadow-sm me-md-4 mb-4 mb-md-0 d-flex flex-column">
          <h2 className="h5 mb-4 text-dark">Your Documents ({documentList.length})</h2>
          {initialLoading && (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-2">Loading documents...</p>
            </div>
          )}
          {/* Display general upload/Firebase errors here if any */}
          {uploadError && <div className="alert alert-danger small mt-3">{uploadError}</div>}
          {!initialLoading && documentList.length === 0 && (
            <p className="text-muted text-center">No documents uploaded yet.</p>
          )}
          {!initialLoading && documentList.length > 0 && (
            <DocumentHistory
              documents={documentList}
              currentActiveDocumentId={currentDocumentId}
              onLoadDocument={handleLoadDocument}
            />
          )}
        </aside>

        {/* Right Column: Main Content (col-md-9) */}
        <main className="col-md-8 bg-white p-4 rounded shadow-sm"> {/* Adjust col size and add mx-auto for centering if needed */}
          <header className="text-center mb-4">
            <h1 className="custom-heading mb-2">Smart Document Study Assistant</h1>
            <p className="lead text-muted">Upload, Query, Summarize, and Learn from your PDFs with AI</p>
          </header>

          {/* Display current active document */}
          {currentDocumentId && documentList.length > 0 && (
            <div className="alert alert-info text-center py-2 mb-4">
              Currently Active Document: <span className="fw-bold">{documentList.find(doc => doc.id === currentDocumentId)?.fileName || 'Loading...'}</span>
            </div>
          )}

          {/* Tab Navigation (uses TabNavigation component which uses Bootstrap) */}
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabsConfig} />

          {/* Tab Content */}
          <div className="p-3"> {/* Added padding to tab content */}
            {initialLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2">Initializing application and loading documents...</p>
              </div>
            ) : (
              <>
                {activeTab === 'upload' && (
                  <section className="mb-4">
                    {/* <h2 className="h5 mb-3 text-dark">Upload New Document</h2> */}
                    <DocumentUpload
                      onFileSelect={handleFileChange}
                      onUpload={handleUpload}
                      loading={false} // Use specific loading for upload button, not global
                      selectedFile={selectedFile}
                      isAuthReady={isAuthReady} // Pass auth readiness to DocumentUpload
                    />
                    {uploadMessage && <div className="alert alert-success mt-3">{uploadMessage}</div>}
                    {uploadError && <div className="alert alert-danger mt-3">{uploadError}</div>}
                  </section>
                )}

                {activeTab === 'qa' && (
                  <section className="mb-4">
                    {/* <h2 className="h5 mb-3 text-dark">Ask a Question</h2> */}
                    <QaSection
                      question={question}
                      setQuestion={setQuestion}
                      answer={answer}
                      handleAskQuestion={handleAskQuestion}
                      loading={answerLoading} // Use specific loading
                      error={answerError} // Pass specific error
                      isDocumentLoaded={!!currentDocumentId} // Disable if no document loaded
                    />
                  </section>
                )}

                {activeTab === 'summary' && (
                  <section className="mb-4">
                    {/* <h2 className="h5 mb-3 text-dark">Document Summary</h2> */}
                    <SummarySection
                      summary={summary}
                      handleGetSummary={handleGetSummary}
                      loading={summaryLoading} // Use specific loading
                      error={summaryError} // Pass specific error
                      isDocumentLoaded={!!currentDocumentId} // Disable if no document loaded
                    />
                  </section>
                )}

                {activeTab === 'key-concepts' && (
                  <section className="mb-4">
                    {/* <h2 className="h5 mb-3 text-dark">Key Concepts</h2> */}
                    <KeyConceptsSection
                      keyConcepts={keyConcepts}
                      handleGetKeyConcepts={handleGetKeyConcepts}
                      loading={keyConceptsLoading} // Use specific loading
                      error={keyConceptsError} // Pass specific error
                      isDocumentLoaded={!!currentDocumentId} // Disable if no document loaded
                    />
                  </section>
                )}

                {activeTab === 'generated_qa' && (
                  <section className="mb-4">
                    {/* <h2 className="h5 mb-3 text-dark">Generated Q&A Pairs</h2> */}
                    <GeneratedQaSection
                      generatedQA={qaPairs} // Use qaPairs state
                      handleGenerateQA={handleGenerateQA}
                      loading={qaLoading} // Use specific loading
                      error={qaError} // Pass specific error
                      isDocumentLoaded={!!currentDocumentId} // Disable if no document loaded
                    />
                  </section>
                )}

                {activeTab === 'flashcards' && (
                  <section className="mb-4">
                    <h2 className="h5 mb-3 text-dark">Flashcards</h2>
                    <FlashcardsSection
                      flashcards={flashcards}
                      loading={flashcardsLoading} // Use specific loading
                      error={flashcardsError} // Pass specific error
                      onGenerateFlashcards={handleGenerateFlashcards}
                      isDocumentLoaded={!!currentDocumentId} // Disable if no document loaded
                    />
                  </section>
                )}

                {activeTab === 'notes' && (
                  <section className="mb-4">
                    {/* <h2 className="h5 mb-3 text-dark">Notes</h2> */}
                    <NotesSection /> {/* NotesSection still uses its own hook */}
                  </section>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      {/* MessageDisplay remains outside the row for global alerts */}
      <MessageDisplay message={message} type={messageType} />
    </div>
  );
};

export default HomePage;
