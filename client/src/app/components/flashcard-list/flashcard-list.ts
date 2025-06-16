import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FlashcardService } from '../../services/flashcard';
import { Flashcard } from '../../models/flashcard.model';
import { FlashcardForm } from '../flashcard-form/flashcard-form';

@Component({
    selector: 'app-flashcard-list',
    imports: [CommonModule, RouterModule, FlashcardForm],
    templateUrl: './flashcard-list.html',
    styleUrl: './flashcard-list.scss'
})
export class FlashcardList implements OnInit, OnDestroy {
    flashcards: Flashcard[] = [];
    filteredFlashcards: Flashcard[] = [];
    loading = false;
    showForm = false;
    editingFlashcard: Flashcard | null = null;

    // Search and filtering
    searchTerm = '';
    sortBy: 'term' | 'definition' | 'created' | 'updated' = 'created';
    sortOrder: 'asc' | 'desc' = 'desc';

    // Pagination for large datasets
    currentPage = 1;
    itemsPerPage = 20;

    // Quick preview
    previewFlashcard: Flashcard | null = null;

    // Make Math available in template
    Math = Math;

    private destroy$ = new Subject<void>();

    constructor(private flashcardService: FlashcardService) { }

    ngOnInit(): void {
        // Subscribe to flashcards
        this.flashcardService.flashcards$
            .pipe(takeUntil(this.destroy$))
            .subscribe(flashcards => {
                this.flashcards = flashcards;
                this.applyFiltersAndSorting();
            });

        // Subscribe to loading state
        this.flashcardService.loading$
            .pipe(takeUntil(this.destroy$))
            .subscribe(loading => {
                this.loading = loading;
            });

        // Subscribe to form visibility changes from service
        this.flashcardService.showForm$
            .pipe(takeUntil(this.destroy$))
            .subscribe(show => {
                this.showForm = show;
            });

        // Subscribe to search term changes from service
        this.flashcardService.searchTerm$
            .pipe(takeUntil(this.destroy$))
            .subscribe(term => {
                this.searchTerm = term;
                this.applyFiltersAndSorting();
            });

        // Subscribe to sort changes from service
        this.flashcardService.sortBy$
            .pipe(takeUntil(this.destroy$))
            .subscribe(sortBy => {
                this.sortBy = sortBy;
                this.applyFiltersAndSorting();
            });

        this.flashcardService.sortOrder$
            .pipe(takeUntil(this.destroy$))
            .subscribe(sortOrder => {
                this.sortOrder = sortOrder;
                this.applyFiltersAndSorting();
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Toggle the visibility of the form
     */
    toggleForm(): void {
        this.showForm = !this.showForm;
        if (!this.showForm) {
            this.editingFlashcard = null;
        }
    }

    /**
     * Edit a flashcard
     */
    editFlashcard(flashcard: Flashcard): void {
        this.editingFlashcard = flashcard;
        this.showForm = true;
    }

    /**
     * Delete a flashcard
     */
    deleteFlashcard(id: number): void {
        if (confirm('Are you sure you want to delete this flashcard?')) {
            this.flashcardService.deleteFlashcard(id).subscribe({
                next: () => {
                    console.log('Flashcard deleted successfully');
                },
                error: (error) => {
                    console.error('Error deleting flashcard:', error);
                    alert('Error deleting flashcard: ' + error.message);
                }
            });
        }
    }

    /**
     * Handle form submission
     */
    onFormSubmitted(): void {
        this.showForm = false;
        this.editingFlashcard = null;
    }

    /**
     * Handle form cancellation
     */
    onFormCancelled(): void {
        this.showForm = false;
        this.editingFlashcard = null;
    }

    /**
     * Refresh the flashcards list
     */
    refresh(): void {
        this.flashcardService.refresh();
    }

    /**
     * TrackBy function for ngFor optimization
     */
    trackByFlashcardId(index: number, flashcard: Flashcard): number {
        return flashcard.id;
    }

    /**
     * Truncate text for compact view
     */
    truncateText(text: string, maxLength: number = 50): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Apply search filters and sorting
     */
    applyFiltersAndSorting(): void {
        let filtered = [...this.flashcards];

        // Apply search filter
        if (this.searchTerm.trim()) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(flashcard =>
                flashcard.term.toLowerCase().includes(searchLower) ||
                flashcard.definition.toLowerCase().includes(searchLower)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: string | Date;
            let bValue: string | Date;

            switch (this.sortBy) {
                case 'term':
                    aValue = a.term.toLowerCase();
                    bValue = b.term.toLowerCase();
                    break;
                case 'definition':
                    aValue = a.definition.toLowerCase();
                    bValue = b.definition.toLowerCase();
                    break;
                case 'created':
                    aValue = a.createdAt;
                    bValue = b.createdAt;
                    break;
                case 'updated':
                    aValue = a.updatedAt;
                    bValue = b.updatedAt;
                    break;
                default:
                    aValue = a.createdAt;
                    bValue = b.createdAt;
            }

            let comparison = 0;
            if (aValue > bValue) comparison = 1;
            if (aValue < bValue) comparison = -1;

            return this.sortOrder === 'desc' ? -comparison : comparison;
        });

        this.filteredFlashcards = filtered;
        this.currentPage = 1; // Reset to first page when filters change
    }

    /**
     * Handle search input
     */
    onSearch(term: string): void {
        this.searchTerm = term;
        this.applyFiltersAndSorting();
    }

    /**
     * Get paginated flashcards
     */
    getPaginatedFlashcards(): Flashcard[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredFlashcards.slice(startIndex, endIndex);
    }

    /**
     * Get total pages
     */
    getTotalPages(): number {
        return Math.ceil(this.filteredFlashcards.length / this.itemsPerPage);
    }

    /**
     * Navigate to page
     */
    goToPage(page: number): void {
        if (page >= 1 && page <= this.getTotalPages()) {
            this.currentPage = page;
        }
    }

    /**
     * Show quick preview
     */
    showPreview(flashcard: Flashcard, event: Event): void {
        event.stopPropagation();
        this.previewFlashcard = flashcard;
    }

    /**
     * Hide quick preview
     */
    hidePreview(): void {
        this.previewFlashcard = null;
    }

    /**
     * Handle keyboard navigation
     */
    onKeyDown(event: KeyboardEvent): void {
        if (event.target !== document.body) return; // Only handle when not in input fields

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                // Focus next flashcard item
                break;
            case 'ArrowUp':
                event.preventDefault();
                // Focus previous flashcard item
                break;
            case 'Enter':
                // Open focused flashcard
                break;
            case 'f':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    // Focus search box
                    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
                    searchInput?.focus();
                }
                break;
        }
    }
}
