import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNgxDatetimeKit } from 'ngx-datetime-kit';
import { SignalFormsPageComponent } from './signal-forms.component';

describe('SignalFormsPageComponent', () => {
  let fixture: ComponentFixture<SignalFormsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalFormsPageComponent],
      providers: [provideNgxDatetimeKit()],
    }).compileComponents();

    fixture = TestBed.createComponent(SignalFormsPageComponent);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the comparison table', () => {
    const table: HTMLTableElement | null = fixture.nativeElement.querySelector('.demo-table');
    expect(table).not.toBeNull();
  });
});

