// src/pages/HomePage.jsx
import React, { useState } from 'react';
import * as DocumentApi from '../api/documentApi'; // Import all functions from documentApi
import DocumentUpload from '../components/DocumentUpload';
import MessageDisplay from '../components/MessageDisplay';
import TabNavigation from '../components/TabNavigation';
import QaSection from '../components/QaSection';
import SummarySection from '../components/SummarySection';
import KeyConceptsSection from '../components/KeyConceptsSection';
import GeneratedQaSection from '../components/GeneratedQaSection';
import NotesSection from '../components/NotesSection';
import FlashcardsSection from '../components/FlashcardsSection'; // <-- Import FlashcardsSection

const HomePage = () => {
  // --- UI and Data State ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [summary, setSummary] = useState('');
  const [keyConcepts, setKeyConcepts] = useState([]);
  const [generatedQA, setGeneratedQA] = useState([]);
  const [flashcards, setFlashcards] = useState([]); // <-- New state for flashcards
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'info', 'success', 'error', 'warning'
  const [activeTab, setActiveTab] = useState('qa'); // 'qa', 'summary', 'concepts', 'generated_qa', 'notes', 'flashcards'

  const tabs = [
    { id: 'qa', name: 'Q&A' },
    { id: 'summary', name: 'Summary' },
    { id: 'concepts', name: 'Key Concepts' },
    { id: 'generated_qa', name: 'Generated Q&A' },
    { id: 'flashcards', name: 'Flashcards' }, // <-- New tab for Flashcards
    { id: 'notes', name: 'Notes' },
  ];

  // --- Handlers for Document & Question ---
  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setMessage(`Selected file: ${file.name}`);
      setMessageType('info');
    } else {
      setSelectedFile(null);
      setMessage('Please select a PDF file.');
      setMessageType('error');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('No PDF file selected for upload.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('Uploading document and creating knowledge base...');
    setMessageType('info');
    // Clear previous results when a new document is uploaded
    setAnswer('');
    setSummary('');
    setKeyConcepts([]);
    setGeneratedQA([]);
    setFlashcards([]); // <-- Clear flashcards on new document upload

    try {
      const data = await DocumentApi.uploadDocument(selectedFile);
      if (data.message) {
        setMessage(data.message);
        setMessageType('success');
      } else if (data.error) {
        setMessage(`Error: ${data.error}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage('Failed to connect to the server or upload document.');
      setMessageType('error');
    } finally {
      setLoading(false);
      setSelectedFile(null); // Clear the selected file after upload attempt
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setMessage('Please enter a question.');
      setMessageType('warning');
      return;
    }

    setLoading(true);
    setMessage('Getting answer...');
    setMessageType('info');
    setAnswer(''); // Clear previous answer

    try {
      const data = await DocumentApi.askQuestion(question);
      if (data.answer) {
        setAnswer(data.answer);
        setMessage('Answer retrieved successfully.');
        setMessageType('success');
      } else if (data.error) {
        setAnswer('');
        setMessage(`Error: ${data.error}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Ask question failed:', error);
      setMessage('Failed to connect to the server or get answer.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for New Features (Summary, Key Concepts, Generated Q&A, Flashcards) ---
  const handleGetSummary = async () => {
    setLoading(true);
    setMessage('Generating summary...');
    setMessageType('info');
    setSummary('');

    try {
      const data = await DocumentApi.getSummary();
      if (data.summary) {
        setSummary(data.summary);
        setMessage('Summary generated successfully.');
        setMessageType('success');
      } else if (data.error) {
        setSummary('');
        setMessage(`Error: ${data.error}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Summary generation failed:', error);
      setMessage('Failed to connect to the server or generate summary.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleGetKeyConcepts = async () => {
    setLoading(true);
    setMessage('Extracting key concepts...');
    setMessageType('info');
    setKeyConcepts([]);

    try {
      const data = await DocumentApi.getKeyConcepts();
      if (data.concepts) {
        setKeyConcepts(data.concepts);
        setMessage('Key concepts extracted successfully.');
        setMessageType('success');
      } else if (data.error) {
        setKeyConcepts([]);
        setMessage(`Error: ${data.error}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Key concepts extraction failed:', error);
      setMessage('Failed to connect to the server or extract key concepts.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQA = async () => {
    setLoading(true);
    setMessage('Generating important Q&A pairs...');
    setMessageType('info');
    setGeneratedQA([]);

    try {
      const data = await DocumentApi.generateQA();
      if (data.qa_pairs) {
        setGeneratedQA(data.qa_pairs);
        setMessage('Important Q&A pairs generated successfully.');
        setMessageType('success');
      } else if (data.error) {
        setGeneratedQA([]);
        setMessage(`Error: ${data.error}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Generated Q&A failed:', error);
      setMessage('Failed to connect to the server or generate Q&A.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // <-- New handler for Flashcards
  const handleGenerateFlashcards = async () => {
    setLoading(true); // Use the global loading state
    setMessage('Generating flashcards...');
    setMessageType('info');
    setFlashcards([]); // Clear previous flashcards

    try {
      const data = await DocumentApi.generateFlashcards();
      if (data.flashcards) {
        setFlashcards(data.flashcards);
        setMessage('Flashcards generated successfully.');
        setMessageType('success');
      } else if (data.error) {
        setFlashcards([]);
        setMessage(`Error: ${data.error}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Flashcard generation failed:', error);
      setMessage('Failed to connect to the server or generate flashcards.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 py-4">
      <div className="custom-card">
        <h1 className="custom-heading mb-4">Smart Document Study Assistant</h1>

        <DocumentUpload
          onFileSelect={handleFileSelect}
          onUpload={handleUpload}
          loading={loading}
          selectedFile={selectedFile}
        />

        {/* TabNavigation component will receive the updated tabs array */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />

        <div className="custom-section-card mb-4">
          {activeTab === 'qa' && (
            <QaSection
              question={question}
              setQuestion={setQuestion}
              answer={answer}
              handleAskQuestion={handleAskQuestion}
              loading={loading}
            />
          )}
          {activeTab === 'summary' && (
            <SummarySection
              summary={summary}
              handleGetSummary={handleGetSummary}
              loading={loading}
            />
          )}
          {activeTab === 'concepts' && (
            <KeyConceptsSection
              keyConcepts={keyConcepts}
              handleGetKeyConcepts={handleGetKeyConcepts}
              loading={loading}
            />
          )}
          {activeTab === 'generated_qa' && (
            <GeneratedQaSection
              generatedQA={generatedQA}
              handleGenerateQA={handleGenerateQA}
              loading={loading}
            />
          )}
          {activeTab === 'flashcards' && ( // <-- Render FlashcardsSection
            <FlashcardsSection
              flashcards={flashcards}
              loading={loading} // Use global loading state
              error={messageType === 'error' && message.includes('flashcards') ? message : ''} // Pass specific error
              onGenerateFlashcards={handleGenerateFlashcards}
            />
          )}
          {activeTab === 'notes' && (
            <NotesSection />
          )}
        </div>

        <MessageDisplay message={message} type={messageType} />
      </div>
    </div>
  );
};

export default HomePage;
