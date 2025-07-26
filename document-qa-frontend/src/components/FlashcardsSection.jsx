import React, { useState, useEffect } from 'react';

const FlashcardsSection = ({ flashcards, loading, error, onGenerateFlashcards }) => {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-600">Generating flashcards...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">Error: {error}</div>;
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto text-center">
        <p className="text-gray-500 mb-4">No flashcards generated yet. Upload a document and click the button below!</p>
        <button
          onClick={onGenerateFlashcards}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
        >
          Generate Flashcards
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Flashcards</h2>

      <div className="flex justify-center mb-6">
        <button
          onClick={onGenerateFlashcards}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
        >
          Regenerate Flashcards
        </button>
      </div>

      <div className="relative w-full h-64 perspective-1000">
        <div
          className={`relative w-full h-full text-center flex items-center justify-center rounded-lg shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 transition-transform duration-700 preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={handleFlipCard}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front of the card (Question) */}
          <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-4 text-xl font-medium text-gray-800">
            {currentCard.question}
          </div>

          {/* Back of the card (Answer) */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-4 text-lg text-gray-700">
            {currentCard.answer}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePrevCard}
          disabled={flashcards.length <= 1}
          className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-200"
        >
          Previous
        </button>
        <span className="text-lg font-medium text-gray-700">
          {currentCardIndex + 1} / {flashcards.length}
        </span>
        <button
          onClick={handleNextCard}
          disabled={flashcards.length <= 1}
          className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-200"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FlashcardsSection;
