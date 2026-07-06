import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNgxDatetimeKit } from '../../provide-ngx-datetime-kit';
import { NgxTimePickerComponent } from './ngx-time-picker.component';

describe('NgxTimePickerComponent', () => {
  let fixture: ComponentFixture<NgxTimePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxTimePickerComponent],
      providers: [provideNgxDatetimeKit()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxTimePickerComponent);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('opens the time panel from the trigger', () => {
    const trigger: HTMLDivElement = fixture.nativeElement.querySelector('.ngx-picker-field');
    trigger.click();
    fixture.detectChanges();

    const panel: HTMLDivElement | null = fixture.nativeElement.querySelector('.ngx-panel');
    expect(panel).not.toBeNull();
  });
});

