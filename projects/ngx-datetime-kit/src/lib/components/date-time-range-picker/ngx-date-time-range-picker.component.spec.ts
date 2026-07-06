import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNgxDatetimeKit } from '../../provide-ngx-datetime-kit';
import { NgxDateTimeRangePickerComponent } from './ngx-date-time-range-picker.component';

describe('NgxDateTimeRangePickerComponent', () => {
  let fixture: ComponentFixture<NgxDateTimeRangePickerComponent<Date>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxDateTimeRangePickerComponent],
      providers: [provideNgxDatetimeKit()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxDateTimeRangePickerComponent as Type<NgxDateTimeRangePickerComponent<Date>>);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders presets, calendars, and time selectors when opened', () => {
    const trigger: HTMLDivElement = fixture.nativeElement.querySelector('.ngx-picker-field');
    trigger.click();
    fixture.detectChanges();

    const presetsPanel: HTMLElement | null = fixture.nativeElement.querySelector('ngx-presets-panel');
    const calendars: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('ngx-calendar');
    const timeSelectors: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('ngx-time-selector');

    expect(presetsPanel).not.toBeNull();
    expect(calendars.length).toBe(2);
    expect(timeSelectors.length).toBe(2);
  });
});
