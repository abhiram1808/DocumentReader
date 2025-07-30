import React from 'react';

const LandingPage = ({ onGetStarted }) => {
  const heroImageUrl = '/images/ChatGPT Image Jul 26, 2025, 06_01_16 PM.png';
  const ctaImageUrl = '/images/ChatGPT Image Jul 26, 2025, 06_01_16 PM.png';

  return (
    <div className="landing-page bg-dark text-white min-vh-100 d-flex flex-column">
      {/* Hero Section */}
      <header className="hero-section text-center py-5 position-relative overflow-hidden">
        <div className="container position-relative z-1 py-5">
          <h1 className="display-3 fw-bold mb-3 glowing-text animate__animated animate__fadeInDown">
            AI-Powered Knowledge Extraction
          </h1>
          <p className="lead mb-4 animate__animated animate__fadeInUp animate__delay-1s">
            Transform your PDFs into interactive knowledge bases with intelligent Q&A, summaries, and more.
          </p>
          <button
            onClick={() => onGetStarted('qa')} 
            className="fw-bold px-5 py-3 rounded-pill shadow animate__animated animate__pulse animate__infinite"
          >
            Get Started with AI
          </button>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section py-5 flex-grow-1">
        <div className="container">
          <h2 className="text-center mb-5 display-5 fw-bold glowing-text-secondary">
            Intelligent Features at Your Fingertips
          </h2>
          <div className="row g-4">
            {/* Feature 1: Smart Document Ingestion (Upload) */}
            <div className="col-md-4">
              <div className="feature-card card h-100 shadow-lg border-0 text-center p-4 animate__animated animate__fadeInLeft">
                <img src="/images/Upload.png" alt="Upload Document" className="feature-img mb-3 mx-auto d-block" />
                <h3 className="h5 fw-bold mb-2 text-white">Smart Document Ingestion</h3>
                <p className="text-muted">Upload PDFs and our AI instantly processes them for deep analysis.</p>
              </div>
            </div>

            {/* Feature 2: Conversational AI (Q&A) */}
            <div className="col-md-4">
              <div className="feature-card card h-100 shadow-lg border-0 text-center p-4 animate__animated animate__fadeInUp animate__delay-1s">
                <img src="/images/Q&A.png" alt="Conversational AI" className="feature-img mb-3 mx-auto d-block" />
                <h3 className="h5 fw-bold mb-2 text-white">Conversational AI</h3>
                <p className="text-muted">Ask complex questions and receive precise, context-aware answers.</p>
              </div>
            </div>

            {/* Feature 3: Intelligent Summaries (Summary) */}
            <div className="col-md-4">
              <div className="feature-card card h-100 shadow-lg border-0 text-center p-4 animate__animated animate__fadeInRight animate__delay-2s">
                <img src="/images/notebook.png" alt="Intelligent Summaries" className="feature-img mb-3 mx-auto d-block" />
                <h3 className="h5 fw-bold mb-2 text-white">Intelligent Summaries</h3>
                <p className="text-muted">Get AI-generated concise summaries of lengthy documents in seconds.</p>
              </div>
            </div>

            {/* Feature 4: Key Concept Extraction */}
            <div className="col-md-4">
              <div className="feature-card card h-100 shadow-lg border-0 text-center p-4 animate__animated animate__fadeInLeft animate__delay-3s">
                <img src="/images/Concept Extraction.png" alt="Key Concept Extraction" className="feature-img mb-3 mx-auto d-block" />
                <h3 className="h5 fw-bold mb-2 text-white">Key Concept Extraction</h3>
                <p className="text-muted">Automatically identify and highlight the most critical concepts.</p>
              </div>
            </div>

            {/* Feature 5: Dynamic Flashcards */}
            <div className="col-md-4">
              <div className="feature-card card h-100 shadow-lg border-0 text-center p-4 animate__animated animate__fadeInUp animate__delay-4s">
                <img src="/images/flashcards.png" alt="Dynamic Flashcards" className="feature-img mb-3 mx-auto d-block" />
                <h3 className="h5 fw-bold mb-2 text-white">Dynamic Flashcards</h3>
                <p className="text-muted">Generate interactive flashcards for effective active recall and study.</p>
              </div>
            </div>

            {/* Feature 6: Personalized Notes & History */}
            <div className="col-md-4">
              <div className="feature-card card h-100 shadow-lg border-0 text-center p-4 animate__animated animate__fadeInRight animate__delay-5s">
                <img src="/images/Notes & History.png" alt="Notes & Document History" className="feature-img mb-3 mx-auto d-block" />
                <h3 className="h5 fw-bold mb-2 text-white">Personalized Notes & History</h3>
                <p className="text-muted">Save your insights and easily manage all your analyzed documents.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section text-white text-center py-5 position-relative overflow-hidden">
        <div className="container position-relative z-1 py-5">
          <h2 className="display-4 fw-bold mb-4 glowing-text">Ready to Revolutionize Your Learning?</h2>
          <button
            onClick={() => onGetStarted('upload')}
            className=" fw-bold px-5 py-3 rounded-pill shadow animate__animated animate__pulse animate__infinite"
          >
            Experience AI Power Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer py-3 bg-dark-alt text-white-50 text-center">
        <div className="container">
          <small>&copy; {new Date().getFullYear()} Smart Document Study Assistant. All rights reserved.</small>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
