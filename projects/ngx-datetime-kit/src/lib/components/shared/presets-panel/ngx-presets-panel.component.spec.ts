import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Type } from '@angular/core';
import { provideNgxDatetimeKit } from '../../../provide-ngx-datetime-kit';
import { RangePreset } from '../../../models/preset.model';
import { NgxPresetsPanelComponent } from './ngx-presets-panel.component';

describe('NgxPresetsPanelComponent', () => {
  let fixture: ComponentFixture<NgxPresetsPanelComponent<Date>>;
  const presets: RangePreset<Date>[] = [
    { key: 'today', label: 'Today', getRangeFn: () => ({ start: new Date(2026, 6, 6), end: new Date(2026, 6, 6) }) },
    { key: 'custom', label: 'Custom', getRangeFn: () => ({ start: new Date(2026, 6, 1), end: new Date(2026, 6, 7) }) },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxPresetsPanelComponent],
      providers: [provideNgxDatetimeKit()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxPresetsPanelComponent as Type<NgxPresetsPanelComponent<Date>>);
    fixture.componentRef.setInput('presets', presets);
    fixture.componentRef.setInput('activeKey', 'custom');
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders presets and marks the active one', () => {
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.ngx-presets__btn');
    expect(buttons.length).toBe(2);
    expect(buttons[1].classList.contains('ngx-presets__btn--active')).toBeTrue();
  });
});

