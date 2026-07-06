import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { NGX_LABELS } from '../../../tokens/labels.token';
import { RangePreset } from '../../../models/preset.model';

/**
 * Preset quick-select panel displayed on the left of range picker panels.
 * Emits the preset key when a preset is selected.
 */
@Component({
  selector: 'ngx-presets-panel',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ngx-presets-panel.component.html',
  styleUrl: './ngx-presets-panel.component.scss',
})
export class NgxPresetsPanelComponent<D> {
  protected readonly labels = inject(NGX_LABELS);

  public readonly presets = input.required<RangePreset<D>[]>();
  public readonly activeKey = input<string | null>(null);

  public readonly presetSelected = output<RangePreset<D>>();

  protected onSelect(preset: RangePreset<D>): void {
    this.presetSelected.emit(preset);
  }
}
