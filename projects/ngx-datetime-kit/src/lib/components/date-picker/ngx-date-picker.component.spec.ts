import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNgxDatetimeKit } from '../../provide-ngx-datetime-kit';
import { NgxDatePickerComponent } from './ngx-date-picker.component';

describe('NgxDatePickerComponent', () => {
  let fixture: ComponentFixture<NgxDatePickerComponent<Date>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxDatePickerComponent],
      providers: [provideNgxDatetimeKit()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxDatePickerComponent as Type<NgxDatePickerComponent<Date>>);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('opens the panel when the trigger is clicked', () => {
    const trigger: HTMLDivElement = fixture.nativeElement.querySelector('.ngx-picker-field');
    trigger.click();
    fixture.detectChanges();

    const panel: HTMLDivElement | null = fixture.nativeElement.querySelector('.ngx-panel');
    expect(panel).not.toBeNull();
  });
});
