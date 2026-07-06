import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNgxDatetimeKit } from '../../../provide-ngx-datetime-kit';
import { createTimeValue } from '../../../models/time-value.model';
import { NgxTimeSelectorComponent } from './ngx-time-selector.component';

describe('NgxTimeSelectorComponent', () => {
  let fixture: ComponentFixture<NgxTimeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxTimeSelectorComponent],
      providers: [provideNgxDatetimeKit()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxTimeSelectorComponent);
    fixture.componentRef.setInput('value', createTimeValue(0, 0, 0));
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('supports digit keyboard input for hours', () => {
    const hoursElement: HTMLDivElement = fixture.nativeElement.querySelector('[aria-label="Hours"]');

    hoursElement.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value().hours).toBe(1);

    hoursElement.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value().hours).toBe(12);
  });
});

