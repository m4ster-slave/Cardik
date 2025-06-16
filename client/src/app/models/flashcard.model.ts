/**
 * Flashcard interface representing a single flashcard on the frontend
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
export interface CreateFlashcardRequest {
  term: string;
  definition: string;
}

/**
 * Data transfer object for updating an existing flashcard
 */
export interface UpdateFlashcardRequest {
  term?: string;
  definition?: string;
}

/**
 * API response wrapper for flashcard operations
 */
export interface FlashcardApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}
