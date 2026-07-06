import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNgxDatetimeKit } from 'ngx-datetime-kit';
import { I18nPageComponent } from './i18n.component';

describe('I18nPageComponent', () => {
  let fixture: ComponentFixture<I18nPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [I18nPageComponent],
      providers: [provideNgxDatetimeKit()],
    }).compileComponents();

    fixture = TestBed.createComponent(I18nPageComponent);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the locale hint section', () => {
    const info: HTMLElement | null = fixture.nativeElement.querySelector('.demo-info');
    expect(info?.textContent).toContain('Aktive Locale');
  });
});

