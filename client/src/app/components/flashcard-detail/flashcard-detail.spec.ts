import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashcardDetail } from './flashcard-detail';

describe('FlashcardDetail', () => {
  let component: FlashcardDetail;
  let fixture: ComponentFixture<FlashcardDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlashcardDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlashcardDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
