import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Type } from '@angular/core';
import { provideNgxDatetimeKit } from '../../../provide-ngx-datetime-kit';
import { NgxCalendarComponent } from './ngx-calendar.component';

describe('NgxCalendarComponent', () => {
  let fixture: ComponentFixture<NgxCalendarComponent<Date>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxCalendarComponent],
      providers: [provideNgxDatetimeKit()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxCalendarComponent as Type<NgxCalendarComponent<Date>>);
    fixture.componentRef.setInput('viewMonth', 6);
    fixture.componentRef.setInput('viewYear', 2026);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders weekday headers and a full 42-cell grid', () => {
    const weekdayElements: NodeListOf<Element> = fixture.nativeElement.querySelectorAll('.ngx-calendar__weekday');
    const dayElements: NodeListOf<Element> = fixture.nativeElement.querySelectorAll('.ngx-calendar__day');

    expect(weekdayElements.length).toBe(7);
    expect(dayElements.length).toBe(42);
  });
});

