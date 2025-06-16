import { Flashcard, CreateFlashcardDto, UpdateFlashcardDto } from './types';

/**
 * Data service for managing flashcards in memory
 */
export class FlashcardService {
  private flashcards: Flashcard[] = [];
  private nextId = 1;

  constructor() {
    // Initialize with some sample data
    this.seedData();
  }

  /**
   * Seeds the service with initial flashcard data
   */
  private seedData(): void {
    const sampleCards: CreateFlashcardDto[] = [
      {
        term: "TypeScript",
        definition: "A strongly typed programming language that builds on JavaScript, giving you better tooling at any scale."
      },
      {
        term: "Angular",
        definition: "A TypeScript-based open-source web application framework led by the Angular Team at Google."
      },
      {
        term: "Express.js",
        definition: "A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications."
      }
    ];

    sampleCards.forEach(card => this.create(card));
  }

  /**
   * Retrieves all flashcards
   * @returns Array of all flashcards
   */
  getAll(): Flashcard[] {
    return [...this.flashcards];
  }

  /**
   * Retrieves a flashcard by ID
   * @param id - The ID of the flashcard to retrieve
   * @returns The flashcard if found, null otherwise
   */
  getById(id: number): Flashcard | null {
    return this.flashcards.find(card => card.id === id) || null;
  }

  /**
   * Creates a new flashcard
   * @param data - The data for the new flashcard
   * @returns The created flashcard
   */
  create(data: CreateFlashcardDto): Flashcard {
    const now = new Date();
    const flashcard: Flashcard = {
      id: this.nextId++,
      term: data.term.trim(),
      definition: data.definition.trim(),
      createdAt: now,
      updatedAt: now
    };

    this.flashcards.push(flashcard);
    return flashcard;
  }

  /**
   * Updates an existing flashcard
   * @param id - The ID of the flashcard to update
   * @param data - The updated data
   * @returns The updated flashcard if found, null otherwise
   */
  update(id: number, data: UpdateFlashcardDto): Flashcard | null {
    const index = this.flashcards.findIndex(card => card.id === id);
    if (index === -1) {
      return null;
    }

    const flashcard = this.flashcards[index];
    this.flashcards[index] = {
      ...flashcard,
      term: data.term?.trim() || flashcard.term,
      definition: data.definition?.trim() || flashcard.definition,
      updatedAt: new Date()
    };

    return this.flashcards[index];
  }

  /**
   * Deletes a flashcard by ID
   * @param id - The ID of the flashcard to delete
   * @returns True if deleted, false if not found
   */
  delete(id: number): boolean {
    const index = this.flashcards.findIndex(card => card.id === id);
    if (index === -1) {
      return false;
    }

    this.flashcards.splice(index, 1);
    return true;
  }

  /**
   * Gets the total count of flashcards
   * @returns The number of flashcards
   */
  getCount(): number {
    return this.flashcards.length;
  }
}
