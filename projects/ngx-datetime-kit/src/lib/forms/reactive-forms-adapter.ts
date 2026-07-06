/**
 * Reactive Forms integration guide is in docs/forms.md.
 *
 * This file re-exports validators and adapter helpers for Reactive Forms usage.
 * All picker components already implement ControlValueAccessor, so they work
 * directly with FormControl/FormGroup without additional setup.
 *
 * Key validators exported here:
 *   - ngxDateRangeValidator  — validates range start ≤ end, min/max
 *   - endAfterStartValidator — cross-field group validator
 *   - ngxMinDateValidator    — single-field min date
 *   - ngxMaxDateValidator    — single-field max date
 */
export {
  ngxDateRangeValidator,
  endAfterStartValidator,
  ngxMinDateValidator,
  ngxMaxDateValidator,
  validateDateRangeCore,
} from '../validators/date-range.validator';

