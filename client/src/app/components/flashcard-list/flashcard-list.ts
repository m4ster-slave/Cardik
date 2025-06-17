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

    // Search and filtering
    sortBy: 'term' | 'definition' | 'created' | 'updated' = 'created';
    sortOrder: 'asc' | 'desc' = 'desc';

    // Pagination for large datasets
    currentPage = 1;
    itemsPerPage = 20;

    // Quick preview
    previewFlashcard: Flashcard | null = null;
    private previewTimeout: any = null;

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
        // Clear preview timeout
        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
        }
        
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Toggle the visibility of the form
     */
    toggleForm(): void {
        this.flashcardService.toggleForm();
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
        this.flashcardService.setFormVisibility(false);
    }

    /**
     * Handle form cancellation
     */
    onFormCancelled(): void {
        this.flashcardService.setFormVisibility(false);
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
     * Apply sorting (search filtering removed)
     */
    applyFiltersAndSorting(): void {
        let filtered = [...this.flashcards];

        // Apply sorting only (no search filtering)
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
     * Navigate to first page
     */
    goToFirstPage(): void {
        this.goToPage(1);
    }

    /**
     * Navigate to last page
     */
    goToLastPage(): void {
        this.goToPage(this.getTotalPages());
    }

    /**
     * Get visible page numbers for pagination
     */
    getVisiblePages(): number[] {
        const totalPages = this.getTotalPages();
        const maxVisiblePages = 5; // Show maximum 5 page numbers
        const currentPage = this.currentPage;
        
        if (totalPages <= maxVisiblePages) {
            // If total pages is less than or equal to max, show all pages
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        
        const visiblePages: number[] = [];
        const halfVisible = Math.floor(maxVisiblePages / 2);
        
        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, currentPage + halfVisible);
        
        // Adjust if we're near the beginning
        if (currentPage <= halfVisible) {
            endPage = Math.min(totalPages, maxVisiblePages);
        }
        
        // Adjust if we're near the end
        if (currentPage > totalPages - halfVisible) {
            startPage = Math.max(1, totalPages - maxVisiblePages + 1);
        }
        
        // Always show first page if not already visible
        if (startPage > 1) {
            visiblePages.push(1);
            if (startPage > 2) {
                visiblePages.push(-1); // Ellipsis indicator
            }
        }
        
        // Add the range of pages
        for (let i = startPage; i <= endPage; i++) {
            visiblePages.push(i);
        }
        
        // Always show last page if not already visible
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                visiblePages.push(-1); // Ellipsis indicator
            }
            visiblePages.push(totalPages);
        }
        
        return visiblePages;
    }

    /**
     * Show quick preview with delay to prevent conflicts
     */
    showPreview(flashcard: Flashcard, event: Event): void {
        event.stopPropagation();
        
        // Clear any existing timeout
        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
        }
        
        // Show preview after a short delay to prevent flickering
        this.previewTimeout = setTimeout(() => {
            this.previewFlashcard = flashcard;
        }, 500); // 500ms delay
    }

    /**
     * Hide quick preview
     */
    hidePreview(): void {
        // Clear timeout if preview hasn't shown yet
        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
            this.previewTimeout = null;
        }
        
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

    /**
     * Handle column header sorting
     */
    onColumnSort(column: 'term' | 'definition' | 'created' | 'updated'): void {
        this.flashcardService.setSortBy(column);
    }
}
