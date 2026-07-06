import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNgxDatetimeKit } from 'ngx-datetime-kit';
import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let fixture: ComponentFixture<OverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewComponent],
      providers: [provideNgxDatetimeKit()],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the hero title', () => {
    const title: HTMLElement | null = fixture.nativeElement.querySelector('.demo-hero__title');
    expect(title?.textContent).toContain('ngx-datetime-kit');
  });
});

