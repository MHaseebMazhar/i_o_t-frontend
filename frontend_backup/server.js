const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Serve index.html on all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`React frontend running on http://localhost:${PORT}`);
});