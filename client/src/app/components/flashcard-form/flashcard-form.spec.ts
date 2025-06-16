import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashcardForm } from './flashcard-form';

describe('FlashcardForm', () => {
  let component: FlashcardForm;
  let fixture: ComponentFixture<FlashcardForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlashcardForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlashcardForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
