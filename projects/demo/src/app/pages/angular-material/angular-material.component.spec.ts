import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AngularMaterialPageComponent } from './angular-material.component';
import { provideNgxDatetimeKit } from 'ngx-datetime-kit';

const waitForDomMutation: () => Promise<void> = async (): Promise<void> => {
  await new Promise<void>((resolve: () => void) => {
    window.setTimeout(() => resolve(), 0);
  });
};

const getRequiredElement = <T extends Element>(
  container: ParentNode,
  selector: string,
  context: string,
): T => {
  const element: T | null = container.querySelector<T>(selector);
  expect(element).withContext(context).not.toBeNull();

  if (element === null) {
    throw new Error(context);
  }

  return element;
};

const getRequiredClosest = <T extends Element>(
  element: Element,
  selector: string,
  context: string,
): T => {
  const closestElement: T | null = element.closest<T>(selector);
  expect(closestElement).withContext(context).not.toBeNull();

  if (closestElement === null) {
    throw new Error(context);
  }

  return closestElement;
};

const getRequiredFormFieldWithHintWrapper = (container: ParentNode): HTMLElement => {
  const formFields: HTMLElement[] = Array.from(container.querySelectorAll<HTMLElement>('mat-form-field'));
  const formFieldWithHintWrapper: HTMLElement | undefined = formFields.find((formField: HTMLElement) => {
    return formField.querySelector('.mat-mdc-form-field-hint-wrapper') !== null;
  });
  const context: string = 'Expected a Material form field with a hint wrapper.';
  expect(formFieldWithHintWrapper).withContext(context).toBeDefined();

  if (formFieldWithHintWrapper === undefined) {
    throw new Error(context);
  }

  return formFieldWithHintWrapper;
};

describe('AngularMaterialPageComponent', () => {
  let component: AngularMaterialPageComponent;
  let fixture: ComponentFixture<AngularMaterialPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngularMaterialPageComponent, ReactiveFormsModule],
      providers: [
        provideNgxDatetimeKit(),
        provideAnimationsAsync(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AngularMaterialPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    await waitForDomMutation();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the page title', () => {
    const compiled: HTMLElement = fixture.nativeElement as HTMLElement;
    const title: HTMLElement | null = compiled.querySelector('.demo-hero__title');
    expect(title?.textContent).toContain('Angular Material');
  });

  it('should have a basicForm with date and dateTime controls', () => {
    expect(component.basicForm.contains('date')).toBeTrue();
    expect(component.basicForm.contains('dateTime')).toBeTrue();
  });

  it('should mark basicForm as touched and invalid on submit when empty', () => {
    component.onBasicSubmit();
    expect(component.basicForm.get('date')?.touched).toBeTrue();
    expect(component.basicForm.valid).toBeFalse();
  });

  it('should have a rangeForm with range and fullRange controls', () => {
    expect(component.rangeForm.contains('range')).toBeTrue();
    expect(component.rangeForm.contains('fullRange')).toBeTrue();
  });

  it('should toggle disabled state on basicForm date control', () => {
    const initial: boolean = component.isDateDisabled;
    component.toggleDisabled();
    expect(component.isDateDisabled).toBe(!initial);
    component.toggleDisabled(); // restore
  });

  it('should raise the active mat-form-field while a picker panel is open and close when the X icon is clicked', async () => {
    const compiled: HTMLElement = fixture.nativeElement as HTMLElement;
    const trigger: HTMLElement = getRequiredElement<HTMLElement>(
      compiled,
      '.demo-mat-field .ngx-picker-field',
      'Expected the Material demo to render a picker trigger.',
    );
    const formField: HTMLElement = getRequiredClosest<HTMLElement>(
      trigger,
      'mat-form-field',
      'Expected the picker trigger to be wrapped by mat-form-field.',
    );

    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();
    await waitForDomMutation();
    fixture.detectChanges();

    expect(formField.classList.contains('ngx-mat-form-field--panel-open')).toBeTrue();

    const closeIcon: SVGElement = getRequiredElement<SVGElement>(
      compiled,
      '.ngx-panel__close svg',
      'Expected the open picker panel to render a close icon inside the close button.',
    );

    closeIcon.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    await waitForDomMutation();
    fixture.detectChanges();

    expect(formField.classList.contains('ngx-mat-form-field--panel-open')).toBeFalse();
  });

  it('should close an open picker when clicking outside the dialog', async () => {
    const compiled: HTMLElement = fixture.nativeElement as HTMLElement;
    const trigger: HTMLElement = getRequiredElement<HTMLElement>(
      compiled,
      '.demo-mat-field .ngx-picker-field',
      'Expected the Material demo to render a picker trigger.',
    );
    const formField: HTMLElement = getRequiredClosest<HTMLElement>(
      trigger,
      'mat-form-field',
      'Expected the picker trigger to be wrapped by mat-form-field.',
    );

    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();
    await waitForDomMutation();
    fixture.detectChanges();

    expect(compiled.querySelector('.ngx-panel')).not.toBeNull();

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    await waitForDomMutation();
    fixture.detectChanges();

    expect(compiled.querySelector('.ngx-panel')).toBeNull();
    expect(formField.classList.contains('ngx-mat-form-field--panel-open')).toBeFalse();
  });

  it('should keep only one Material picker dialog open at a time', async () => {
    const compiled: HTMLElement = fixture.nativeElement as HTMLElement;
    const triggers: HTMLElement[] = Array.from(compiled.querySelectorAll<HTMLElement>('.demo-mat-field .ngx-picker-field'));

    expect(triggers.length).toBeGreaterThan(1);

    const firstTrigger: HTMLElement = triggers[0];
    const secondTrigger: HTMLElement = triggers[1];
    const firstFormField: HTMLElement = getRequiredClosest<HTMLElement>(
      firstTrigger,
      'mat-form-field',
      'Expected the first picker trigger to be wrapped by mat-form-field.',
    );
    const secondFormField: HTMLElement = getRequiredClosest<HTMLElement>(
      secondTrigger,
      'mat-form-field',
      'Expected the second picker trigger to be wrapped by mat-form-field.',
    );

    firstTrigger.click();
    fixture.detectChanges();
    await fixture.whenStable();
    await waitForDomMutation();
    fixture.detectChanges();

    expect(firstFormField.classList.contains('ngx-mat-form-field--panel-open')).toBeTrue();
    expect(compiled.querySelectorAll('.ngx-panel').length).toBe(1);

    secondTrigger.click();
    fixture.detectChanges();
    await fixture.whenStable();
    await waitForDomMutation();
    fixture.detectChanges();

    expect(firstFormField.classList.contains('ngx-mat-form-field--panel-open')).toBeFalse();
    expect(secondFormField.classList.contains('ngx-mat-form-field--panel-open')).toBeTrue();
    expect(compiled.querySelectorAll('.ngx-panel').length).toBe(1);
  });

  it('should keep the Material hint wrapper below the open picker panel', async () => {
    const compiled: HTMLElement = fixture.nativeElement as HTMLElement;
    const formField: HTMLElement = getRequiredFormFieldWithHintWrapper(compiled);
    const trigger: HTMLElement = getRequiredElement<HTMLElement>(
      formField,
      '.ngx-picker-field',
      'Expected the Material form field with a hint wrapper to render a picker trigger.',
    );

    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();
    await waitForDomMutation();
    fixture.detectChanges();

    const panel: HTMLElement = getRequiredElement<HTMLElement>(
      formField,
      '.ngx-panel',
      'Expected the picker trigger to open an inline panel.',
    );
    const control: HTMLElement = getRequiredElement<HTMLElement>(
      formField,
      '.ngx-mat-control',
      'Expected the Material form field to render the ngx Material control host.',
    );
    const hintWrapper: HTMLElement = getRequiredElement<HTMLElement>(
      formField,
      '.mat-mdc-form-field-hint-wrapper',
      'Expected the Material form field to keep its hint wrapper in the DOM.',
    );
    const panelZIndex: number = Number.parseInt(getComputedStyle(panel).zIndex, 10);
    const controlZIndex: number = Number.parseInt(getComputedStyle(control).zIndex, 10);
    const hintWrapperZIndex: number = Number.parseInt(getComputedStyle(hintWrapper).zIndex, 10);

    expect(panelZIndex).toBeGreaterThan(hintWrapperZIndex);
    expect(controlZIndex).toBeGreaterThan(hintWrapperZIndex);
  });
});
