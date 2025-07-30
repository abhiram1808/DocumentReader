import React, { useState, useEffect } from 'react';

// Small custom CSS for the 3D flip effect.
// In a larger project, you might move this to your main CSS file (e.g., index.css).
const flashcardStyles = `
  .flashcard-container {
    perspective: 1000px; /* Defines the 3D space */
  }

  .flashcard-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.7s;
    transform-style: preserve-3d; /* Ensures children are positioned in 3D space */
  }

  .flashcard-inner.is-flipped {
    transform: rotateY(180deg);
  }

  .flashcard-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden; /* Hides the back of the element when facing away */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  }

  .flashcard-front {
    background: linear-gradient(135deg, #e0f2f7, #bbdefb); /* Light blue gradient */
    color: #333;
    font-size: 1.25rem; /* text-xl */
    font-weight: 500; /* font-medium */
  }

  .flashcard-back {
    background: linear-gradient(135deg, #c5e1a5, #aed581); /* Light green gradient */
    color: #444;
    font-size: 1.125rem; /* text-lg */
    transform: rotateY(180deg); /* Initial rotation for the back face */
  }
`;


const FlashcardsSection = ({ flashcards, loading, error, onGenerateFlashcards, isDocumentLoaded }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset state when flashcards prop changes (e.g., new document uploaded)
  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [flashcards]);

  const handleNextCard = () => {
    setIsFlipped(false); // Flip back when moving to next card
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false); // Flip back when moving to previous card
    setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
  };

  const handleFlipCard = () => {
    setIsFlipped((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-2">Generating flashcards...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger text-center py-3">Error: {error}</div>;
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="card shadow-sm p-4 text-center">
        <p className="text-muted mb-3">No flashcards generated yet. Upload a document and click the button below!</p>
        <button
          onClick={onGenerateFlashcards}
          className="btn btn-primary"
          disabled={!isDocumentLoaded} // Disable if no document is loaded
        >
          Generate Flashcards
        </button>
        {!isDocumentLoaded && (
          <small className="text-muted mt-2">Please upload or select a document first.</small>
        )}
      </div>
    );
  }

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="card shadow-sm p-4">
      {/* Inject custom styles */}
      <style>{flashcardStyles}</style>

      <h5 className="card-title text-dark mb-4 text-center">Flashcards</h5>

      <div className="d-flex justify-content-center mb-4">
        <button
          onClick={onGenerateFlashcards}
          className="btn btn-outline-primary"
          disabled={!isDocumentLoaded} // Disable if no document is loaded
        >
          Regenerate Flashcards
        </button>
      </div>

      <div className="flashcard-container" style={{ width: '100%', height: '200px' }}> {/* Fixed height for consistency */}
        <div
          className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}
          onClick={handleFlipCard}
        >
          {/* Front of the card (Question) */}
          <div className="flashcard-face flashcard-front">
            {currentCard.question}
          </div>

          {/* Back of the card (Answer) */}
          <div className="flashcard-face flashcard-back">
            {currentCard.answer}
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <button
          onClick={handlePrevCard}
          disabled={flashcards.length <= 1}
          className="btn btn-secondary"
        >
          Previous
        </button>
        <span className="fw-bold text-dark">
          {currentCardIndex + 1} / {flashcards.length}
        </span>
        <button
          onClick={handleNextCard}
          disabled={flashcards.length <= 1}
          className="btn btn-secondary"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FlashcardsSection;
