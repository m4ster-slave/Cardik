/**
 * Flashcard interface representing a single flashcard
 */
export interface Flashcard {
  /** Unique identifier for the flashcard */
  id: number;
  /** Term or question on the flashcard */
  term: string;
  /** Definition or answer for the term */
  definition: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Data transfer object for creating a new flashcard
 */
export interface CreateFlashcardDto {
  term: string;
  definition: string;
}

/**
 * Data transfer object for updating an existing flashcard
 */
export interface UpdateFlashcardDto {
  term?: string;
  definition?: string;
}
