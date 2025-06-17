import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import {
  Flashcard,
  CreateFlashcardRequest,
  UpdateFlashcardRequest,
  FlashcardApiResponse,
} from '../models/flashcard.model';

/**
 * Service for managing flashcard operations with the backend API
 */
@Injectable({
  providedIn: 'root',
})
export class FlashcardService {
  private readonly apiUrl = 'http://localhost:3000/api/flashcards';

  // BehaviorSubject to manage flashcards state
  private flashcardsSubject = new BehaviorSubject<Flashcard[]>([]);
  public flashcards$ = this.flashcardsSubject.asObservable();

  // Loading state management
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Form visibility state management
  private showFormSubject = new BehaviorSubject<boolean>(false);
  public showForm$ = this.showFormSubject.asObservable();

  // Search term state management
  private searchTermSubject = new BehaviorSubject<string>('');

  // Sort state management
  private sortBySubject = new BehaviorSubject<
    'term' | 'definition' | 'created' | 'updated'
  >('created');
  public sortBy$ = this.sortBySubject.asObservable();

  private sortOrderSubject = new BehaviorSubject<'asc' | 'desc'>('desc');
  public sortOrder$ = this.sortOrderSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFlashcards();
  }

  /**
   * Load all flashcards from the API
   */
  private loadFlashcards(): void {
    this.loadingSubject.next(true);
    this.getAllFlashcards().subscribe({
      next: (flashcards) => {
        this.flashcardsSubject.next(flashcards);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        console.error('Error loading flashcards:', error);
        this.loadingSubject.next(false);
      },
    });
  }

  /**
   * Get all flashcards
   */
  getAllFlashcards(): Observable<Flashcard[]> {
    return this.http.get<FlashcardApiResponse<Flashcard[]>>(this.apiUrl).pipe(
      map((response) =>
        response.data ? response.data.map(this.parseFlashcardDates) : [],
      ),
      catchError(this.handleError),
    );
  }

  /**
   * Get a single flashcard by ID
   */
  getFlashcardById(id: number): Observable<Flashcard> {
    return this.http
      .get<FlashcardApiResponse<Flashcard>>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response) =>
          response.data
            ? this.parseFlashcardDates(response.data)
            : ({} as Flashcard),
        ),
        catchError(this.handleError),
      );
  }

  /**
   * Create a new flashcard
   */
  createFlashcard(flashcard: CreateFlashcardRequest): Observable<Flashcard> {
    this.loadingSubject.next(true);
    return this.http
      .post<FlashcardApiResponse<Flashcard>>(this.apiUrl, flashcard)
      .pipe(
        map((response) =>
          response.data
            ? this.parseFlashcardDates(response.data)
            : ({} as Flashcard),
        ),
        tap(() => {
          this.loadFlashcards(); // Refresh the list
        }),
        catchError(this.handleError),
      );
  }

  /**
   * Update an existing flashcard
   */
  updateFlashcard(
    id: number,
    flashcard: UpdateFlashcardRequest,
  ): Observable<Flashcard> {
    this.loadingSubject.next(true);
    return this.http
      .put<FlashcardApiResponse<Flashcard>>(`${this.apiUrl}/${id}`, flashcard)
      .pipe(
        map((response) =>
          response.data
            ? this.parseFlashcardDates(response.data)
            : ({} as Flashcard),
        ),
        tap(() => {
          this.loadFlashcards(); // Refresh the list
        }),
        catchError(this.handleError),
      );
  }

  /**
   * Delete a flashcard
   */
  deleteFlashcard(id: number): Observable<void> {
    this.loadingSubject.next(true);
    return this.http.delete<FlashcardApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map(() => void 0),
      tap(() => {
        this.loadFlashcards(); // Refresh the list
      }),
      catchError(this.handleError),
    );
  }

  /**
   * Refresh the flashcards list
   */
  refresh(): void {
    this.loadFlashcards();
  }

  /**
   * Toggle form visibility
   */
  toggleForm(): void {
    this.showFormSubject.next(!this.showFormSubject.value);
  }

  /**
   * Set form visibility
   */
  setFormVisibility(show: boolean): void {
    this.showFormSubject.next(show);
  }

  /**
   * Set sort by field
   */
  setSortBy(sortBy: 'term' | 'definition' | 'created' | 'updated'): void {
    // If same field, toggle order, otherwise set to asc
    if (this.sortBySubject.value === sortBy) {
      const currentOrder = this.sortOrderSubject.value;
      this.sortOrderSubject.next(currentOrder === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBySubject.next(sortBy);
      this.sortOrderSubject.next('asc');
    }
  }

  /**
   * Get current form visibility
   */
  getCurrentFormVisibility(): boolean {
    return this.showFormSubject.value;
  }

  /**
   * Parse date strings to Date objects
   */
  private parseFlashcardDates(flashcard: any): Flashcard {
    return {
      ...flashcard,
      createdAt: new Date(flashcard.createdAt),
      updatedAt: new Date(flashcard.updatedAt),
    };
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    this.loadingSubject.next(false);

    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage =
        error.error?.error ||
        error.error?.message ||
        `Server Error: ${error.status} ${error.statusText}`;
    }

    console.error('FlashcardService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  };
}
