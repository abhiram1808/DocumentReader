AI-Powered Document Study Assistant
Empowering Your Learning with Intelligent Document Interaction
Table of Contents
Introduction

Features

Technologies Used

Getting Started

Prerequisites

Backend Setup

Frontend Setup

Running the Application

Usage

Project Structure

Future Enhancements

Contributing

License

Contact

1. Introduction
The AI-Powered Document Study Assistant is a full-stack web application designed to revolutionize how users interact with their PDF documents for study and knowledge extraction. By integrating cutting-edge AI capabilities, it transforms static PDFs into dynamic, interactive knowledge bases. Users can upload documents and then leverage AI to ask questions, generate summaries, extract key concepts, create flashcards, and manage personalized notes, all within an intuitive and modern interface.

This project aims to provide a powerful tool for students, researchers, and professionals to efficiently absorb and utilize information from their documents.

2. Features
Smart Document Ingestion: Upload PDF files, and the system intelligently processes them to build a searchable knowledge base.

Conversational AI (Q&A): Ask natural language questions about your document's content and receive precise, context-aware answers from the AI.

Intelligent Summaries: Generate concise, AI-powered summaries of lengthy documents in seconds.

Key Concept Extraction: Automatically identify and highlight the most critical concepts and keywords from your documents.

Generated Q&A Pairs: Automatically generate relevant question-and-answer pairs from the document for self-testing.

Dynamic Flashcards: Create interactive flashcards from document content to facilitate active recall and effective study.

Personalized Notes & History: Take and save personal notes associated with each document, and easily manage a history of all your uploaded and analyzed files.

Integrated PDF Viewer: View the original PDF document directly within the application with page navigation and zoom controls.

Persistent Data Storage: All AI-generated outputs and user notes are saved to a cloud database (Firestore) for seamless access across sessions.

Modern UI/UX: Features a sleek dark blue, AI-themed interface with consistent typography, custom imagery, and clear interactive elements.

3. Technologies Used
Frontend:

React.js: A JavaScript library for building user interfaces.

Bootstrap 5: For responsive design and UI components.

Animate.css: For subtle UI animations.

react-pdf: For rendering PDF documents in the browser.

Vite: A fast build tool for frontend development.

Backend:

Node.js: JavaScript runtime environment.

Express.js: Web application framework for Node.js.

Multer: Middleware for handling multipart/form-data, primarily for file uploads.

dotenv: For managing environment variables.

fs & path: Node.js built-in modules for file system operations.

Databases & AI:

Firestore (Firebase): NoSQL cloud database for storing document metadata, AI-generated outputs (summaries, concepts, Q&A, flashcards), and user notes.

ChromaDB: An open-source vector database used for storing document embeddings, enabling efficient semantic search and retrieval for Q&A.

Google Gemini API: Utilized for advanced AI capabilities including text generation for summaries, Q&A, key concepts, and flashcards.

4. Getting Started
Follow these instructions to set up and run the project locally.

Prerequisites
Node.js (v18 or higher recommended)

npm (Node Package Manager)

Git

A Google Cloud Project with the Gemini API enabled.

A Firebase Project with Firestore enabled.

Ensure your Firestore security rules allow authenticated reads/writes (e.g., allow read, write: if request.auth != null; for public data and allow read, write: if request.auth != null && request.auth.uid == userId; for user-specific data).

A config.js file in document-qa-backend/config/ with your Firebase and Gemini API keys.

Backend Setup
Navigate to the backend directory:

cd document-qa-backend

Install dependencies:

npm install

Create .env file:
Create a file named .env in the document-qa-backend directory and add your environment variables.

PORT=5000
GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY
# Add your Firebase config here as a JSON string or individual variables if needed by backend
# Example (if backend needs it, otherwise frontend handles it):
# FIREBASE_API_KEY=your_firebase_api_key
# ... other firebase config ...

Create config/config.js:
Create a config folder inside document-qa-backend, and then create a config.js file inside document-qa-backend/config/. This file will hold your Firebase configuration object.

// document-qa-backend/config/config.js
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};

module.exports = { firebaseConfig };

Note: The __firebase_config and __app_id global variables are typically provided by the Canvas environment. If running outside Canvas, you'd need to manage Firebase initialization and authentication (e.g., anonymous sign-in) directly in your frontend and potentially pass appId explicitly.

Create uploads and chroma_db directories:
These directories are needed for file storage and the ChromaDB vector store.

mkdir uploads
mkdir chroma_db

Frontend Setup
Navigate to the frontend directory:

cd document-qa-frontend

Install dependencies:

npm install

Running the Application
You need to run both the backend and frontend servers simultaneously in separate terminal windows.

Start the Backend Server:
Open a new terminal window and navigate to the document-qa-backend directory.

cd F:\DocumentReader\document-qa-backend
npm run dev

The backend server should start on http://localhost:5000.

Start the Frontend Development Server:
Open another new terminal window and navigate to the document-qa-frontend directory.

cd F:\DocumentReader\document-qa-frontend
npm run dev

The frontend application should open in your browser, typically at http://localhost:5173 (or a similar port).

5. Usage
Once the application is running:

Landing Page: You will first see a landing page.

Click "Get Started with AI" to go to the main application's Q&A tab.

Click "Experience AI Power Now" to go directly to the "Upload Document" tab.

Upload Document: In the "Upload Document" tab, select a PDF file and click "Upload." The system will process it and create a knowledge base.

Document History: Your uploaded documents will appear in the left sidebar. Click on any document to make it the "Currently Active Document."

Interact with AI:

Q&A Tab: Type a question in the input field and click "Ask Question" to get an AI-generated answer.

Summary Tab: Click "Get Summary" to generate a concise summary of the active document.

Key Concepts Tab: Click "Get Key Concepts" to extract important terms.

Generated Q&A Tab: Click "Generate Q&A Pairs" to get automatically created question-answer sets.

Flashcards Tab: Click "Generate Flashcards" to create interactive study cards.

Notes Tab: Add and save your personal notes for the active document.

Read Document Tab: View the original PDF content directly in the browser.

6. Project Structure
DocumentReader/
├── document-qa-backend/
│   ├── config/
│   │   └── config.js              # Firebase configuration
│   ├── controllers/
│   │   └── documentController.js  # Logic for document processing and AI interactions
│   ├── node_modules/              # Backend dependencies
│   ├── routes/
│   │   └── documentRoutes.js      # API routes for documents
│   ├── uploads/                   # Directory to store uploaded PDF files (ignored by Git)
│   ├── chroma_db/                 # Directory for ChromaDB vector store (ignored by Git)
│   ├── .env                       # Environment variables (ignored by Git)
│   ├── package.json
│   ├── server.js                  # Backend entry point
│   └── ...
├── document-qa-frontend/
│   ├── public/
│   │   ├── images/                # Your custom AI-themed images
│   │   └── ...
│   ├── src/
│   │   ├── api/
│   │   │   └── documentApi.js     # Frontend API calls to backend
│   │   ├── components/
│   │   │   ├── DocumentHistory.jsx
│   │   │   ├── DocumentUpload.jsx
│   │   │   ├── FlashcardsSection.jsx
│   │   │   ├── GeneratedQaSection.jsx
│   │   │   ├── KeyConceptsSection.jsx
│   │   │   ├── MessageDisplay.jsx
│   │   │   ├── NotesSection.jsx
│   │   │   ├── PdfViewerSection.jsx # New PDF viewer component
│   │   │   ├── QaSection.jsx
│   │   │   ├── SummarySection.jsx
│   │   │   └── TabNavigation.jsx
│   │   ├── hooks/
│   │   │   └── useFirebaseNotes.js # Custom hook for Firebase/Firestore
│   │   ├── pages/
│   │   │   ├── HomePage.jsx       # Main application interface
│   │   │   └── LandingPage.jsx    # Initial landing page
│   │   ├── App.jsx                # Root React component
│   │   ├── index.css              # Global CSS styles
│   │   └── main.jsx               # React entry point
│   ├── node_modules/              # Frontend dependencies
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js
│   └── ...
└── .gitignore                     # Global .gitignore for the monorepo

7. Future Enhancements
Document Management: Implement features to rename, delete, and download documents from history.

User Authentication: Introduce robust user accounts (e.g., email/password, social logins) for personalized experiences.

Enhanced PDF Viewer: Add text search, annotation tools, and improved navigation within the PDF viewer.

Advanced AI Features: Explore multi-document Q&A, document comparison, or more complex content generation.

Mobile Responsiveness: Further optimize layout and navigation for smaller screens (e.g., collapsible sidebar).

"Copy to Clipboard" Functionality: Add quick copy buttons for AI-generated text.

8. Contributing
Contributions are welcome! If you have suggestions, bug reports, or want to contribute code, please feel free to:

Fork the repository.

Create a new branch (git checkout -b feature/your-feature).

Make your changes.

Commit your changes (git commit -m 'Add new feature').

Push to the branch (git push origin feature/your-feature).

Open a Pull Request.

9. License
This project is licensed under the MIT License - see the LICENSE file for details.

10. Contact
If you have any questions or feedback, feel free to reach out.
