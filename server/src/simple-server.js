const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

/**
 * Simple Express server for the Flashcard application
 */
const app = express();
const port = process.env.PORT || 3000;

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
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Get all flashcards
app.get('/api/flashcards', (req, res) => {
  try {
    res.json({
      success: true,
      data: flashcards,
      count: flashcards.length
    });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get flashcard by ID
app.get('/api/flashcards/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const flashcard = flashcards.find(card => card.id === id);

    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    res.json({
      success: true,
      data: flashcard
    });
  } catch (error) {
    console.error('Error fetching flashcard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create flashcard
app.post('/api/flashcards', (req, res) => {
  try {
    const { term, definition } = req.body;

    if (!term || typeof term !== 'string' || term.trim().length === 0) {
      return res.status(400).json({ error: 'Term is required and must be a non-empty string' });
    }

    if (!definition || typeof definition !== 'string' || definition.trim().length === 0) {
      return res.status(400).json({ error: 'Definition is required and must be a non-empty string' });
    }

    const now = new Date();
    const flashcard = {
      id: nextId++,
      term: term.trim(),
      definition: definition.trim(),
      createdAt: now,
      updatedAt: now
    };

    flashcards.push(flashcard);

    res.status(201).json({
      success: true,
      data: flashcard,
      message: 'Flashcard created successfully'
    });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update flashcard
app.put('/api/flashcards/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const { term, definition } = req.body;

    if (term !== undefined && (typeof term !== 'string' || term.trim().length === 0)) {
      return res.status(400).json({ error: 'Term must be a non-empty string if provided' });
    }

    if (definition !== undefined && (typeof definition !== 'string' || definition.trim().length === 0)) {
      return res.status(400).json({ error: 'Definition must be a non-empty string if provided' });
    }

    if (!term && !definition) {
      return res.status(400).json({ error: 'At least one field (term or definition) must be provided' });
    }

    const index = flashcards.findIndex(card => card.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    const flashcard = flashcards[index];
    flashcards[index] = {
      ...flashcard,
      term: term?.trim() || flashcard.term,
      definition: definition?.trim() || flashcard.definition,
      updatedAt: new Date()
    };

    res.json({
      success: true,
      data: flashcards[index],
      message: 'Flashcard updated successfully'
    });
  } catch (error) {
    console.error('Error updating flashcard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete flashcard
app.delete('/api/flashcards/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
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
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Flashcard API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      flashcards: '/api/flashcards'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📚 Flashcard API available at http://localhost:${port}/api/flashcards`);
  console.log(`🏥 Health check available at http://localhost:${port}/health`);
});

module.exports = app;
