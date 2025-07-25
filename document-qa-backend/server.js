// server.js
require('dotenv').config(); // Load environment variables from .env file
const app = require('./src/app'); // Import the Express app

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // You might want to add a check here to ensure ChromaDB persistence path is set up
  // or trigger an initial load of existing vector store if applicable.
});
