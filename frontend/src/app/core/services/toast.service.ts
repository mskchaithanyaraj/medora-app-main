    import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastId = 0;
  private toastsSignal = signal<Toast[]>([]);
  
  readonly toasts = this.toastsSignal.asReadonly();

  success(message: string, title?: string): void {
    this.addToast('success', message, title);
  }

  error(message: string, title?: string): void {
    this.addToast('error', message, title);
  }

  warning(message: string, title?: string): void {
    this.addToast('warning', message, title);
  }

  info(message: string, title?: string): void {
    this.addToast('info', message, title);
  }

  private addToast(type: Toast['type'], message: string, title?: string): void {
    const toast: Toast = {
      id: ++this.toastId,
      type,
      message,
      title
    };
    
    this.toastsSignal.update(toasts => [...toasts, toast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeToast(toast.id);
    }, 5000);
  }

  removeToast(id: number): void {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }
}
