import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FlashcardService } from './services/flashcard';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  protected title = 'Cardik';

  showForm = false;

  private destroy$ = new Subject<void>();

  constructor(
    private flashcardService: FlashcardService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Subscribe to form visibility changes from the service
    this.flashcardService.showForm$
      .pipe(takeUntil(this.destroy$))
      .subscribe((show) => {
        this.showForm = show;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleForm(): void {
    this.flashcardService.toggleForm();
  }

  refresh(): void {
    this.flashcardService.refresh();
  }

  get isFlashcardsRoute(): boolean {
    return this.router.url === '/' || this.router.url.startsWith('/flashcards');
  }
}
