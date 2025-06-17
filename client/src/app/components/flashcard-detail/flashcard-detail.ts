import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FlashcardService } from '../../services/flashcard';
import { Flashcard, UpdateFlashcardRequest } from '../../models/flashcard.model';

@Component({
  selector: 'app-flashcard-detail',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './flashcard-detail.html',
  styleUrl: './flashcard-detail.scss'
})
export class FlashcardDetail implements OnInit, OnDestroy {
  flashcard: Flashcard | null = null;
  loading = true;
  error: string | null = null;
  isFlipped = false;
  isEditing = false;
  isSubmitting = false;
  
  editForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flashcardService: FlashcardService,
    private fb: FormBuilder
  ) {
    this.editForm = this.createEditForm();
  }

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
    this.enterEditMode();
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
  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isEditing && this.flashcard && (event.code === 'Space' || event.code === 'Enter')) {
      event.preventDefault();
      this.flipCard();
    }
  }

  /**
   * Create the edit form
   */
  private createEditForm(): FormGroup {
    return this.fb.group({
      term: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(200)
      ]],
      definition: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(1000)
      ]]
    });
  }

  /**
   * Enter edit mode
   */
  enterEditMode(): void {
    if (this.flashcard) {
      this.isEditing = true;
      this.editForm.patchValue({
        term: this.flashcard.term,
        definition: this.flashcard.definition
      });
    }
  }

  /**
   * Cancel edit mode
   */
  cancelEdit(): void {
    this.isEditing = false;
    this.editForm.reset();
    this.isFlipped = false;
  }

  /**
   * Save the edited flashcard
   */
  saveEdit(): void {
    if (this.editForm.valid && this.flashcard && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formValue = this.editForm.value;
      const request: UpdateFlashcardRequest = {
        term: formValue.term.trim(),
        definition: formValue.definition.trim()
      };

      this.flashcardService.updateFlashcard(this.flashcard.id, request).subscribe({
        next: (updatedFlashcard) => {
          this.flashcard = updatedFlashcard;
          this.isEditing = false;
          this.isSubmitting = false;
          this.editForm.reset();
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating flashcard:', error);
          alert('Error updating flashcard: ' + error.message);
        }
      });
    }
  }

  /**
   * Get form control error message
   */
  getErrorMessage(controlName: string): string {
    const control = this.editForm.get(controlName);

    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldName(controlName)} is required`;
      }
      if (control.errors['minlength']) {
        return `${this.getFieldName(controlName)} is too short`;
      }
      if (control.errors['maxlength']) {
        const maxLength = control.errors['maxlength'].requiredLength;
        return `${this.getFieldName(controlName)} must be less than ${maxLength} characters`;
      }
    }

    return '';
  }

  /**
   * Get field display name
   */
  private getFieldName(controlName: string): string {
    switch (controlName) {
      case 'term': return 'Term';
      case 'definition': return 'Definition';
      default: return controlName;
    }
  }

  /**
   * Check if form control has error and is touched
   */
  hasError(controlName: string): boolean {
    const control = this.editForm.get(controlName);
    return !!(control?.errors && control.touched);
  }
}
