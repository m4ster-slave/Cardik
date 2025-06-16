import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FlashcardService } from '../../services/flashcard';
import { Flashcard, CreateFlashcardRequest, UpdateFlashcardRequest } from '../../models/flashcard.model';

@Component({
  selector: 'app-flashcard-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './flashcard-form.html',
  styleUrl: './flashcard-form.scss'
})
export class FlashcardForm implements OnInit {
  @Input() editingFlashcard: Flashcard | null = null;
  @Output() submitted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  flashcardForm: FormGroup;
  isSubmitting = false;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private flashcardService: FlashcardService
  ) {
    this.flashcardForm = this.createForm();
  }

  ngOnInit(): void {
    this.isEditing = !!this.editingFlashcard;

    if (this.editingFlashcard) {
      this.flashcardForm.patchValue({
        term: this.editingFlashcard.term,
        definition: this.editingFlashcard.definition
      });
    }
  }

  /**
   * Create the reactive form
   */
  private createForm(): FormGroup {
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
   * Handle form submission
   */
  onSubmit(): void {
    if (this.flashcardForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formValue = this.flashcardForm.value;

      if (this.isEditing && this.editingFlashcard) {
        this.updateFlashcard(formValue);
      } else {
        this.createFlashcard(formValue);
      }
    }
  }

  /**
   * Create a new flashcard
   */
  private createFlashcard(formValue: any): void {
    const request: CreateFlashcardRequest = {
      term: formValue.term.trim(),
      definition: formValue.definition.trim()
    };

    this.flashcardService.createFlashcard(request).subscribe({
      next: () => {
        this.onSuccess();
      },
      error: (error) => {
        this.onError(error);
      }
    });
  }

  /**
   * Update an existing flashcard
   */
  private updateFlashcard(formValue: any): void {
    if (!this.editingFlashcard) return;

    const request: UpdateFlashcardRequest = {
      term: formValue.term.trim(),
      definition: formValue.definition.trim()
    };

    this.flashcardService.updateFlashcard(this.editingFlashcard.id, request).subscribe({
      next: () => {
        this.onSuccess();
      },
      error: (error) => {
        this.onError(error);
      }
    });
  }

  /**
   * Handle successful submission
   */
  private onSuccess(): void {
    this.isSubmitting = false;
    this.flashcardForm.reset();
    this.submitted.emit();
  }

  /**
   * Handle submission error
   */
  private onError(error: any): void {
    this.isSubmitting = false;
    console.error('Error submitting flashcard:', error);
    alert('Error submitting flashcard: ' + error.message);
  }

  /**
   * Cancel form submission
   */
  onCancel(): void {
    this.flashcardForm.reset();
    this.cancelled.emit();
  }

  /**
   * Get form control error message
   */
  getErrorMessage(controlName: string): string {
    const control = this.flashcardForm.get(controlName);

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
    const control = this.flashcardForm.get(controlName);
    return !!(control?.errors && control.touched);
  }
}
