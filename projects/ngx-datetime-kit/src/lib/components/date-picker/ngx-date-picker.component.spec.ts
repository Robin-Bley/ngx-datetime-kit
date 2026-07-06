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

  it('closes the panel when clicking outside the picker', () => {
    const trigger: HTMLDivElement = fixture.nativeElement.querySelector('.ngx-picker-field');
    trigger.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ngx-panel')).not.toBeNull();

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ngx-panel')).toBeNull();
  });

  it('keeps only one picker panel open at a time', () => {
    const secondFixture: ComponentFixture<NgxDatePickerComponent<Date>> = TestBed.createComponent(
      NgxDatePickerComponent as Type<NgxDatePickerComponent<Date>>,
    );
    secondFixture.detectChanges();

    const firstTrigger: HTMLDivElement = fixture.nativeElement.querySelector('.ngx-picker-field');
    const secondTrigger: HTMLDivElement = secondFixture.nativeElement.querySelector('.ngx-picker-field');

    firstTrigger.click();
    fixture.detectChanges();
    secondFixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ngx-panel')).not.toBeNull();

    secondTrigger.click();
    fixture.detectChanges();
    secondFixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ngx-panel')).toBeNull();
    expect(secondFixture.nativeElement.querySelector('.ngx-panel')).not.toBeNull();

    secondFixture.destroy();
  });
});
