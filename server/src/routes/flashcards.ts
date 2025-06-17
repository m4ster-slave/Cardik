import express from "express";
import { FlashcardService } from "../flashcard.service";
import { CreateFlashcardDto, UpdateFlashcardDto } from "../types";

const router = express.Router();
const flashcardService = new FlashcardService();

/**
 * Input validation middleware
 */
const validateCreateFlashcard = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void => {
  const { term, definition } = req.body;

  if (!term || typeof term !== "string" || term.trim().length === 0) {
    res
      .status(400)
      .json({ error: "Term is required and must be a non-empty string" });
    return;
  }

  if (
    !definition ||
    typeof definition !== "string" ||
    definition.trim().length === 0
  ) {
    res
      .status(400)
      .json({ error: "Definition is required and must be a non-empty string" });
    return;
  }

  next();
};

const validateUpdateFlashcard = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void => {
  const { term, definition } = req.body;

  if (
    term !== undefined &&
    (typeof term !== "string" || term.trim().length === 0)
  ) {
    res
      .status(400)
      .json({ error: "Term must be a non-empty string if provided" });
    return;
  }

  if (
    definition !== undefined &&
    (typeof definition !== "string" || definition.trim().length === 0)
  ) {
    res
      .status(400)
      .json({ error: "Definition must be a non-empty string if provided" });
    return;
  }

  if (!term && !definition) {
    res.status(400).json({
      error: "At least one field (term or definition) must be provided",
    });
    return;
  }

  next();
};

/**
 * GET /api/flashcards
 * Retrieve all flashcards
 */
router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const flashcards = await flashcardService.getAll();
    res.json({
      success: true,
      data: flashcards,
      count: flashcards.length,
    });
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/flashcards/:id
 * Retrieve a single flashcard by ID
 */
router.get("/:id", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }

    const flashcard = await flashcardService.getById(id);

    if (!flashcard) {
      res.status(404).json({ error: "Flashcard not found" });
      return;
    }

    res.json({
      success: true,
      data: flashcard,
    });
  } catch (error) {
    console.error("Error fetching flashcard:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/flashcards
 * Create a new flashcard
 */
router.post(
  "/",
  validateCreateFlashcard,
  (req: express.Request, res: express.Response): void => {
    try {
      const createDto: CreateFlashcardDto = {
        term: req.body.term,
        definition: req.body.definition,
      };

      const flashcard = flashcardService.create(createDto);

      res.status(201).json({
        success: true,
        data: flashcard,
        message: "Flashcard created successfully",
      });
    } catch (error) {
      console.error("Error creating flashcard:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * PUT /api/flashcards/:id
 * Update an existing flashcard
 */
router.put(
  "/:id",
  validateUpdateFlashcard,
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid ID format" });
        return;
      }

      const updateDto: UpdateFlashcardDto = {
        term: req.body.term,
        definition: req.body.definition,
      };

      const updatedFlashcard = await flashcardService.update(id, updateDto);

      if (!updatedFlashcard) {
        res.status(404).json({ error: "Flashcard not found" });
        return;
      }

      res.json({
        success: true,
        data: updatedFlashcard,
      });
    } catch (error) {
      console.error("Error updating flashcard:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * DELETE /api/flashcards/:id
 * Delete a flashcard
 */
router.delete("/:id", (req: express.Request, res: express.Response): void => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }

    const deleted = flashcardService.delete(id);

    if (!deleted) {
      res.status(404).json({ error: "Flashcard not found" });
      return;
    }

    res.json({
      success: true,
      message: "Flashcard deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
