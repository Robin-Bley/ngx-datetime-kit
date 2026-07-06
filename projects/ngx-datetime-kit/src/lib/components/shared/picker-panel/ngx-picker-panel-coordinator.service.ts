import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

interface ActivePickerRegistration {
  owner: object;
  host: HTMLElement;
  close: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class NgxPickerPanelCoordinatorService {
  private readonly document: Document = inject(DOCUMENT);
  private readonly activePicker = signal<ActivePickerRegistration | null>(null);
  private documentPointerDownListener: ((event: Event) => void) | null = null;

  public requestOpen(owner: object, host: HTMLElement, close: () => void): void {
    const currentRegistration: ActivePickerRegistration | null = this.activePicker();
    if (currentRegistration !== null && currentRegistration.owner !== owner) {
      currentRegistration.close();
    }

    this.activePicker.set({ owner, host, close });
    this.attachDocumentPointerDownListener();
  }

  public notifyClosed(owner: object): void {
    const currentRegistration: ActivePickerRegistration | null = this.activePicker();
    if (currentRegistration === null || currentRegistration.owner !== owner) {

      return;
    }

    this.activePicker.set(null);
    this.detachDocumentPointerDownListener();
  }

  public unregister(owner: object): void {
    this.notifyClosed(owner);
  }

  private attachDocumentPointerDownListener(): void {
    if (this.documentPointerDownListener !== null) {

      return;
    }

    this.documentPointerDownListener = (event: Event): void => {
      const currentRegistration: ActivePickerRegistration | null = this.activePicker();
      if (currentRegistration === null) {

        return;
      }

      if (this.isEventInsideHost(event, currentRegistration.host)) {

        return;
      }

      currentRegistration.close();
    };

    this.document.addEventListener('pointerdown', this.documentPointerDownListener, true);
  }

  private detachDocumentPointerDownListener(): void {
    if (this.documentPointerDownListener === null) {

      return;
    }

    this.document.removeEventListener('pointerdown', this.documentPointerDownListener, true);
    this.documentPointerDownListener = null;
  }

  private isEventInsideHost(event: Event, host: HTMLElement): boolean {
    const eventPath: EventTarget[] = typeof event.composedPath === 'function' ? event.composedPath() : [];
    if (eventPath.includes(host)) {

      return true;
    }

    const target: Node | null = event.target as Node | null;
    if (target !== null && host.contains(target)) {

      return true;
    }

    return false;
  }
}
