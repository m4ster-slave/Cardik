import { Flashcard, CreateFlashcardDto, UpdateFlashcardDto } from "./types";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

const DB_FILE = "./flashcards.db";

/**
 * Data service for managing flashcards in an SQLite database
 */
export class FlashcardService {
  private db!: Database;

  constructor() {
    this.initDatabase();
  }

  /**
   * Initializes the SQLite database and creates the flashcards table if it doesn't exist.
   */
  private async initDatabase(): Promise<void> {
    this.db = await open({
      filename: DB_FILE,
      driver: sqlite3.Database,
    });

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS flashcards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        term TEXT NOT NULL,
        definition TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Seed data if the table is empty
    const count = await this.db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM flashcards",
    );
    if (count && count.count === 0) {
      await this.seedData();
    }
  }

  /**
   * Seeds the service with initial flashcard data
   */
  private async seedData(): Promise<void> {
    const sampleCards: CreateFlashcardDto[] = [
      {
        term: "Hello Flashcard 1",
        definition: "World!",
      },
      {
        term: "Hello Flashcard 2",
        definition: "SQLite!",
      },
      {
        term: "Hello Flashcard 3",
        definition: "Database!",
      },
    ];

    for (const card of sampleCards) {
      await this.create(card);
    }
  }

  /**
   * Retrieves all flashcards
   * @returns Array of all flashcards
   */
  async getAll(): Promise<Flashcard[]> {
    const rows = await this.db.all<Flashcard[]>( // Explicitly type `rows`
      "SELECT id, term, definition, createdAt, updatedAt FROM flashcards",
    );
    return rows.map((row: any) => ({
      // Add type for row
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }

  /**
   * Retrieves a flashcard by ID
   * @param id - The ID of the flashcard to retrieve
   * @returns The flashcard if found, null otherwise
   */
  async getById(id: number): Promise<Flashcard | null> {
    const row = await this.db.get<Flashcard>( // Explicitly type `row`
      "SELECT id, term, definition, createdAt, updatedAt FROM flashcards WHERE id = ?",
      id,
    );
    if (!row) {
      return null;
    }
    return {
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  /**
   * Creates a new flashcard
   * @param data - The data for the new flashcard
   * @returns The created flashcard
   */
  async create(data: CreateFlashcardDto): Promise<Flashcard> {
    const now = new Date().toISOString();
    const result = await this.db.run(
      "INSERT INTO flashcards (term, definition, createdAt, updatedAt) VALUES (?, ?, ?, ?)",
      data.term.trim(),
      data.definition.trim(),
      now,
      now,
    );

    if (!result.lastID) {
      throw new Error("Failed to create flashcard: No lastID returned");
    }

    return {
      id: result.lastID,
      term: data.term.trim(),
      definition: data.definition.trim(),
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  /**
   * Updates an existing flashcard
   * @param id - The ID of the flashcard to update
   * @param data - The updated data
   * @returns The updated flashcard if found, null otherwise
   */
  async update(
    id: number,
    data: UpdateFlashcardDto,
  ): Promise<Flashcard | null> {
    const flashcard = await this.getById(id);
    if (!flashcard) {
      return null;
    }

    const term = data.term?.trim() || flashcard.term;
    const definition = data.definition?.trim() || flashcard.definition;
    const updatedAt = new Date().toISOString();

    await this.db.run(
      "UPDATE flashcards SET term = ?, definition = ?, updatedAt = ? WHERE id = ?",
      term,
      definition,
      updatedAt,
      id,
    );

    return {
      ...flashcard,
      term,
      definition,
      updatedAt: new Date(updatedAt),
    };
  }

  /**
   * Deletes a flashcard by ID
   * @param id - The ID of the flashcard to delete
   * @returns True if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.db.run("DELETE FROM flashcards WHERE id = ?", id);
    return result.changes !== undefined && result.changes > 0;
  }
}
