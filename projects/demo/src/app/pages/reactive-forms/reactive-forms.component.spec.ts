import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNgxDatetimeKit } from 'ngx-datetime-kit';
import { ReactiveFormsPageComponent } from './reactive-forms.component';

describe('ReactiveFormsPageComponent', () => {
  let fixture: ComponentFixture<ReactiveFormsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsPageComponent],
      providers: [provideNgxDatetimeKit()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReactiveFormsPageComponent);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the page heading', () => {
    const heading: HTMLElement | null = fixture.nativeElement.querySelector('.demo-page__title');
    expect(heading?.textContent).toContain('Reactive Forms Integration');
  });
});

