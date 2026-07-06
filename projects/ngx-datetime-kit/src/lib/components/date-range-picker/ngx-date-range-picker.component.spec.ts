import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNgxDatetimeKit } from '../../provide-ngx-datetime-kit';
import { NgxDateRangePickerComponent } from './ngx-date-range-picker.component';

describe('NgxDateRangePickerComponent', () => {
  let fixture: ComponentFixture<NgxDateRangePickerComponent<Date>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxDateRangePickerComponent],
      providers: [provideNgxDatetimeKit()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxDateRangePickerComponent as Type<NgxDateRangePickerComponent<Date>>);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the presets panel and two calendars when opened', () => {
    const trigger: HTMLDivElement = fixture.nativeElement.querySelector('.ngx-picker-field');
    trigger.click();
    fixture.detectChanges();

    const presetsPanel: HTMLElement | null = fixture.nativeElement.querySelector('ngx-presets-panel');
    const calendars: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('ngx-calendar');
    expect(presetsPanel).not.toBeNull();
    expect(calendars.length).toBe(2);
  });
});
