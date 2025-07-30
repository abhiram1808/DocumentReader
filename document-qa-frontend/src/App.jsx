import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';

function App() {
  const [showLandingPage, setShowLandingPage] = useState(true);
  // New state to control which tab HomePage should initially open to
  const [initialTab, setInitialTab] = useState('qa'); // Default to 'qa' if no specific button is clicked

  const handleGetStarted = (initialTabId = 'qa') => { // Default to 'qa' if no ID is passed
    setInitialTab(initialTabId); // Set the tab based on which button was clicked
    setShowLandingPage(false); // Switch to the main app
  };

  return (
    <div className="App">
      {showLandingPage ? (
        <LandingPage onGetStarted={handleGetStarted} />
      ) : (
        <HomePage initialActiveTab={initialTab} /> 
      )}
    </div>
  );
}

export default App;
