const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// Sample data
let flashcards = [
  {
    id: 1,
    term: "TypeScript",
    definition: "A strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.",
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 2,
    term: "Angular",
    definition: "A TypeScript-based open-source web application framework led by the Angular Team at Google.",
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 3,
    term: "Express.js",
    definition: "A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.",
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  }
];

let nextId = 4;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Flashcard API Server',
    version: '1.0.0',
    endpoints: {
      flashcards: '/api/flashcards'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/flashcards', (req, res) => {
  res.json({
    success: true,
    data: flashcards,
    count: flashcards.length
  });
});

app.post('/api/flashcards', (req, res) => {
  const { term, definition } = req.body;

  if (!term || !definition) {
    return res.status(400).json({ error: 'Term and definition are required' });
  }

  const flashcard = {
    id: nextId++,
    term: term.trim(),
    definition: definition.trim(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  flashcards.push(flashcard);

  res.status(201).json({
    success: true,
    data: flashcard,
    message: 'Flashcard created successfully'
  });
});

// For individual flashcard operations, we'll use query parameters instead of path parameters
app.get('/api/flashcard', (req, res) => {
  const id = parseInt(req.query.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Valid ID is required' });
  }

  const flashcard = flashcards.find(card => card.id === id);

  if (!flashcard) {
    return res.status(404).json({ error: 'Flashcard not found' });
  }

  res.json({
    success: true,
    data: flashcard
  });
});

app.put('/api/flashcard', (req, res) => {
  const id = parseInt(req.query.id);
  const { term, definition } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Valid ID is required' });
  }

  const index = flashcards.findIndex(card => card.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Flashcard not found' });
  }

  if (term) flashcards[index].term = term.trim();
  if (definition) flashcards[index].definition = definition.trim();
  flashcards[index].updatedAt = new Date();

  res.json({
    success: true,
    data: flashcards[index],
    message: 'Flashcard updated successfully'
  });
});

app.delete('/api/flashcard', (req, res) => {
  const id = parseInt(req.query.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Valid ID is required' });
  }

  const index = flashcards.findIndex(card => card.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Flashcard not found' });
  }

  flashcards.splice(index, 1);

  res.json({
    success: true,
    message: 'Flashcard deleted successfully'
  });
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📚 Flashcard API available at http://localhost:${port}/api/flashcards`);
  console.log(`🏥 Health check available at http://localhost:${port}/health`);
});

module.exports = app;
