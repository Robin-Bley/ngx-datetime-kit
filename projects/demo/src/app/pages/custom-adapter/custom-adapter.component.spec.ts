import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNgxDatetimeKit } from 'ngx-datetime-kit';
import { CustomAdapterComponent } from './custom-adapter.component';

describe('CustomAdapterComponent', () => {
  let fixture: ComponentFixture<CustomAdapterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomAdapterComponent],
      providers: [provideNgxDatetimeKit()],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomAdapterComponent);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the adapter documentation block', () => {
    const codeBlock: HTMLElement | null = fixture.nativeElement.querySelector('.demo-code-block');
    expect(codeBlock).not.toBeNull();
  });
});

