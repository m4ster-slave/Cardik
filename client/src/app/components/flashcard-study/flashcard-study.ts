import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FlashcardService } from '../../services/flashcard';
import { Flashcard } from '../../models/flashcard.model';

@Component({
    selector: 'app-flashcard-study',
    imports: [CommonModule, RouterModule],
    templateUrl: './flashcard-study.html',
    styleUrl: './flashcard-study.scss'
})
export class FlashcardStudy implements OnInit, OnDestroy {
    flashcards: Flashcard[] = [];
    currentFlashcard: Flashcard | null = null;
    currentIndex = 0;
    isFlipped = false;
    loading = true;
    error: string | null = null;

    // Study session stats
    sessionStarted = false;
    cardsStudied = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;
    studyStartTime: Date | null = null;

    private destroy$ = new Subject<void>();

    constructor(
        private flashcardService: FlashcardService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Load all flashcards for study session
        this.flashcardService.flashcards$
            .pipe(takeUntil(this.destroy$))
            .subscribe(flashcards => {
                this.flashcards = [...flashcards]; // Create a copy
                if (this.flashcards.length > 0) {
                    this.shuffleFlashcards();
                    this.currentFlashcard = this.flashcards[0];
                    this.currentIndex = 0;
                }
                this.loading = false;
            });

        this.flashcardService.loading$
            .pipe(takeUntil(this.destroy$))
            .subscribe(loading => {
                this.loading = loading;
            });

        // Listen for keyboard events
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        document.removeEventListener('keydown', this.handleKeydown.bind(this));
    }

    /**
     * Start the study session
     */
    startStudySession(): void {
        this.sessionStarted = true;
        this.studyStartTime = new Date();
        this.cardsStudied = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.currentIndex = 0;
        this.isFlipped = false;
        this.shuffleFlashcards();
        this.currentFlashcard = this.flashcards[0];
    }

    /**
     * Shuffle the flashcards array
     */
    private shuffleFlashcards(): void {
        for (let i = this.flashcards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.flashcards[i], this.flashcards[j]] = [this.flashcards[j], this.flashcards[i]];
        }
    }

    /**
     * Flip the current flashcard
     */
    flipCard(): void {
        this.isFlipped = !this.isFlipped;
    }

    /**
     * Move to the next flashcard
     */
    nextCard(): void {
        if (this.currentIndex < this.flashcards.length - 1) {
            this.currentIndex++;
            this.currentFlashcard = this.flashcards[this.currentIndex];
            this.isFlipped = false;
        }
    }

    /**
     * Move to the previous flashcard
     */
    previousCard(): void {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.currentFlashcard = this.flashcards[this.currentIndex];
            this.isFlipped = false;
        }
    }

    /**
     * Go to a specific card by index
     */
    goToCard(index: number): void {
        if (index >= 0 && index < this.flashcards.length) {
            this.currentIndex = index;
            this.currentFlashcard = this.flashcards[index];
            this.isFlipped = false;
        }
    }

    /**
     * Mark current answer as correct
     */
    markCorrect(): void {
        if (this.isFlipped) {
            this.correctAnswers++;
            this.cardsStudied++;
            this.nextCard();
        }
    }

    /**
     * Mark current answer as incorrect
     */
    markIncorrect(): void {
        if (this.isFlipped) {
            this.incorrectAnswers++;
            this.cardsStudied++;
            this.nextCard();
        }
    }

    /**
     * Restart the study session
     */
    restartSession(): void {
        this.startStudySession();
    }

    /**
     * End the study session and go back to flashcards list
     */
    endSession(): void {
        this.router.navigate(['/flashcards']);
    }

    /**
     * Handle keyboard events
     */
    private handleKeydown(event: KeyboardEvent): void {
        // Ignore if user is typing in an input field
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
            return;
        }

        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.flipCard();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextCard();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.previousCard();
                break;
            case 'KeyR':
                event.preventDefault();
                this.restartSession();
                break;
            case 'Escape':
                event.preventDefault();
                this.endSession();
                break;
            case 'KeyC':
                if (this.isFlipped) {
                    event.preventDefault();
                    this.markCorrect();
                }
                break;
            case 'KeyX':
                if (this.isFlipped) {
                    event.preventDefault();
                    this.markIncorrect();
                }
                break;
        }
    }

    /**
     * Get progress percentage
     */
    getProgress(): number {
        if (this.flashcards.length === 0) return 0;
        return Math.round(((this.currentIndex + 1) / this.flashcards.length) * 100);
    }

    /**
     * Get accuracy percentage
     */
    getAccuracy(): number {
        if (this.cardsStudied === 0) return 0;
        return Math.round((this.correctAnswers / this.cardsStudied) * 100);
    }

    /**
     * Get study session duration in minutes
     */
    getSessionDuration(): number {
        if (!this.studyStartTime) return 0;
        const now = new Date();
        const diff = now.getTime() - this.studyStartTime.getTime();
        return Math.round(diff / (1000 * 60)); // Convert to minutes
    }

    /**
     * Check if this is the last card
     */
    isLastCard(): boolean {
        return this.currentIndex === this.flashcards.length - 1;
    }

    /**
     * Check if this is the first card
     */
    isFirstCard(): boolean {
        return this.currentIndex === 0;
    }
}
