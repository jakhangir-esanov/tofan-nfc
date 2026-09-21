import { Injectable, inject } from '@angular/core';
import { MessageService } from '@openng/optimus-ui/api';

const TOAST_LIFETIME_MS = 4000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messages = inject(MessageService);

  success(detail: string): void {
    this.messages.add({ severity: 'success', detail, life: TOAST_LIFETIME_MS });
  }

  warn(detail: string): void {
    this.messages.add({ severity: 'warn', detail, life: TOAST_LIFETIME_MS });
  }

  error(detail: string): void {
    this.messages.add({ severity: 'error', detail, life: TOAST_LIFETIME_MS });
  }
}
