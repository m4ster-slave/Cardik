import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FlashcardService } from '../../services/flashcard';
import { Flashcard } from '../../models/flashcard.model';

@Component({
  selector: 'app-flashcard-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './flashcard-detail.html',
  styleUrl: './flashcard-detail.scss'
})
export class FlashcardDetail implements OnInit, OnDestroy {
  flashcard: Flashcard | null = null;
  loading = true;
  error: string | null = null;
  isFlipped = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flashcardService: FlashcardService
  ) { }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = parseInt(params['id']);
        if (!isNaN(id)) {
          this.loadFlashcard(id);
        } else {
          this.error = 'Invalid flashcard ID';
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load flashcard by ID
   */
  private loadFlashcard(id: number): void {
    this.loading = true;
    this.error = null;

    this.flashcardService.getFlashcardById(id).subscribe({
      next: (flashcard) => {
        this.flashcard = flashcard;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load flashcard';
        this.loading = false;
        console.error('Error loading flashcard:', error);
      }
    });
  }

  /**
   * Flip the flashcard
   */
  flipCard(): void {
    this.isFlipped = !this.isFlipped;
  }

  /**
   * Reset the card to show the term side
   */
  resetCard(): void {
    this.isFlipped = false;
  }

  /**
   * Navigate back to the flashcard list
   */
  goBack(): void {
    this.router.navigate(['/flashcards']);
  }

  /**
   * Edit the current flashcard
   */
  editFlashcard(): void {
    if (this.flashcard) {
      this.router.navigate(['/flashcards'], {
        queryParams: { edit: this.flashcard.id }
      });
    }
  }

  /**
   * Delete the current flashcard
   */
  deleteFlashcard(): void {
    if (!this.flashcard) return;

    if (confirm('Are you sure you want to delete this flashcard?')) {
      this.flashcardService.deleteFlashcard(this.flashcard.id).subscribe({
        next: () => {
          this.goBack();
        },
        error: (error) => {
          console.error('Error deleting flashcard:', error);
          alert('Error deleting flashcard: ' + error.message);
        }
      });
    }
  }

  /**
   * Handle keyboard events for accessibility
   */
  onKeydown(event: KeyboardEvent): void {
    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault();
      this.flipCard();
    }
  }
}
