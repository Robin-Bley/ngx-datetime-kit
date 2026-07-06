import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  it('creates the component shell', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the workspace title', () => {
    const title: HTMLElement | null = fixture.nativeElement.querySelector('.app-nav__title');
    expect(title?.textContent).toContain('ngx-datetime-kit');
  });
});

