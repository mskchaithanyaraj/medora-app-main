import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast-' + toast.type">
          <div class="toast-content">
            @if (toast.title) {
              <div class="toast-title">{{ toast.title }}</div>
            }
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          <button class="toast-close" (click)="toastService.removeToast(toast.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-success {
      background: #10b981;
      color: white;
    }

    .toast-error {
      background: #ef4444;
      color: white;
    }

    .toast-warning {
      background: #f59e0b;
      color: white;
    }

    .toast-info {
      background: #3b82f6;
      color: white;
    }

    .toast-content {
      flex: 1;
    }

    .toast-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .toast-message {
      font-size: 0.875rem;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 0;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .toast-close:hover {
      opacity: 1;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
