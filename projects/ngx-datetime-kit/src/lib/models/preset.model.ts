/** A named quick-select preset for range pickers. */
export interface RangePreset<D> {
  /** Display label (use i18n labels for localisable strings). */
  label: string;
  /** Unique key used to mark the preset as active. */
  key: string;
  /** Factory that returns the start/end dates at call time. */
  getRangeFn: () => { start: D; end: D };
}

