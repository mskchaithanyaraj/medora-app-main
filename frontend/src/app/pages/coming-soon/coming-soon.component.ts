import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="coming-soon-page">
      <div class="coming-soon-content">
        <div class="icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <h1>Coming Soon</h1>
        <p>This feature is currently under development and will be available soon.</p>
        <a routerLink="/" class="btn btn-primary">Go to Home</a>
      </div>
    </div>
  `,
  styles: [`
    .coming-soon-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: var(--bg-secondary);
    }

    .coming-soon-content {
      text-align: center;
      max-width: 400px;
    }

    .icon {
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.75rem;
    }

    p {
      font-size: 1rem;
      color: var(--text-secondary);
      margin: 0 0 2rem;
      line-height: 1.6;
    }
  `]
})
export class ComingSoonComponent {}
