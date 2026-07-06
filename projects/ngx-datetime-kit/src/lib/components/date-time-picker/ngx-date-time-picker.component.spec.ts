import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNgxDatetimeKit } from '../../provide-ngx-datetime-kit';
import { NgxDateTimePickerComponent } from './ngx-date-time-picker.component';

describe('NgxDateTimePickerComponent', () => {
  let fixture: ComponentFixture<NgxDateTimePickerComponent<Date>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxDateTimePickerComponent],
      providers: [provideNgxDatetimeKit()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxDateTimePickerComponent as Type<NgxDateTimePickerComponent<Date>>);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('opens the combined calendar and time panel', () => {
    const trigger: HTMLDivElement = fixture.nativeElement.querySelector('.ngx-picker-field');
    trigger.click();
    fixture.detectChanges();

    const calendar: HTMLElement | null = fixture.nativeElement.querySelector('ngx-calendar');
    const timeSelector: HTMLElement | null = fixture.nativeElement.querySelector('ngx-time-selector');
    expect(calendar).not.toBeNull();
    expect(timeSelector).not.toBeNull();
  });
});
