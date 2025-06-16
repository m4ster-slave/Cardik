import { Routes } from '@angular/router';
import { FlashcardList } from './components/flashcard-list/flashcard-list';
import { FlashcardDetail } from './components/flashcard-detail/flashcard-detail';
import { FlashcardStudy } from './components/flashcard-study/flashcard-study';

export const routes: Routes = [
  { path: '', redirectTo: '/flashcards', pathMatch: 'full' },
  { path: 'flashcards', component: FlashcardList },
  { path: 'flashcards/:id', component: FlashcardDetail },
  { path: 'study', component: FlashcardStudy },
  { path: '**', redirectTo: '/flashcards' }
];
