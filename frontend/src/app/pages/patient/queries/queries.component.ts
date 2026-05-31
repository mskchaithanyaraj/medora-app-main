import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ToastService } from '../../../core/services';
import { Query, Reply } from '../../../core/models';

@Component({
  selector: 'app-patient-queries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="queries-page">
      <div class="page-header">
        <div class="header-text">
          <h2>My Queries</h2>
          <p class="subtitle">Ask questions and get answers from healthcare professionals</p>
        </div>
      </div>

      <!-- Post New Query -->
      <div class="compose-card">
        <div class="compose-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div class="compose-body">
          <textarea 
            [(ngModel)]="newQuestion" 
            placeholder="What would you like to ask?"
            rows="2"
            class="compose-input"></textarea>
          <div class="compose-actions">
            <span class="char-hint">{{ newQuestion.length > 0 ? newQuestion.length + ' chars' : '' }}</span>
            <button class="btn-post" (click)="postQuery()" [disabled]="!newQuestion.trim()">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Post
            </button>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading your queries...</p>
        </div>
      } @else if (queries().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h3>No queries yet</h3>
          <p>Post your first question above to get started!</p>
        </div>
      } @else {
        <div class="queries-list">
          @for (query of queries(); track query.id) {
            <div class="query-card" [class.expanded]="expandedQuery() === query.id">
              <div class="query-content">
                <div class="query-bubble">
                  <p class="query-text">{{ query.message }}</p>
                </div>
                <div class="query-footer">
                  <span class="query-time">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                    {{ query.createdAt | date:'MMM d, y h:mm a' }}
                  </span>
                  <div class="query-actions">
                    <button class="btn-replies" (click)="toggleReplies(query.id)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg>
                      {{ expandedQuery() === query.id ? 'Hide' : 'Replies' }}
                    </button>
                    <button class="btn-delete-query" (click)="deleteQuery(query.id)" title="Delete query">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Replies Section -->
              @if (expandedQuery() === query.id) {
                <div class="replies-panel">
                  @if (loadingReplies()) {
                    <div class="replies-loading"><div class="mini-spinner"></div> Loading replies...</div>
                  } @else if (replies().length === 0) {
                    <div class="no-replies">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                      No replies yet. Check back later!
                    </div>
                  } @else {
                    <div class="replies-list">
                      @for (reply of replies(); track reply.id) {
                        <div class="reply-item">
                          <div class="reply-avatar">{{ reply.repliedUser.username.charAt(0).toUpperCase() }}</div>
                          <div class="reply-body">
                            <div class="reply-meta">
                              <span class="reply-author">&#64;{{ reply.repliedUser.username }}</span>
                              <span class="reply-time">{{ reply.createdAt | date:'MMM d, h:mm a' }}</span>
                            </div>
                            <p class="reply-message">{{ reply.message }}</p>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .queries-page { padding: 0; }
    .page-header { margin-bottom: 1.5rem; }
    .header-text h2 { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.25rem; }
    .subtitle { color: var(--text-secondary); font-size: 0.875rem; margin: 0; }

    /* Compose Card */
    .compose-card {
      display: flex;
      gap: 0.75rem;
      background: var(--surface-secondary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      transition: box-shadow 0.2s;
    }
    .compose-card:focus-within {
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
      border-color: #6366f1;
    }
    .compose-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    .compose-body { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
    .compose-input {
      width: 100%;
      padding: 0.5rem 0;
      border: none;
      background: transparent;
      color: var(--text-primary);
      font-size: 0.9375rem;
      resize: none;
      outline: none;
      line-height: 1.5;
    }
    .compose-input::placeholder { color: var(--text-secondary); }
    .compose-actions { display: flex; justify-content: space-between; align-items: center; }
    .char-hint { font-size: 0.75rem; color: var(--text-secondary); }
    .btn-post {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 20px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.1s;
    }
    .btn-post:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .btn-post:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Query Cards */
    .queries-list { display: flex; flex-direction: column; gap: 1rem; }
    .query-card {
      background: var(--surface-secondary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .query-card:hover { border-color: rgba(99, 102, 241, 0.3); }
    .query-card.expanded { border-color: rgba(99, 102, 241, 0.4); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .query-content { padding: 1.25rem; }
    .query-bubble { margin-bottom: 0.75rem; }
    .query-text { margin: 0; color: var(--text-primary); font-size: 0.9375rem; line-height: 1.6; }
    .query-footer { display: flex; justify-content: space-between; align-items: center; }
    .query-time { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; color: var(--text-secondary); }
    .query-actions { display: flex; align-items: center; gap: 0.5rem; }
    .btn-replies {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 20px;
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-replies:hover { background: var(--surface-primary); color: #6366f1; border-color: #6366f1; }
    .btn-delete-query {
      display: flex;
      align-items: center;
      padding: 0.375rem;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-delete-query:hover { background: #fee2e2; color: #dc2626; }

    /* Replies Panel */
    .replies-panel {
      padding: 1rem 1.25rem 1.25rem;
      background: var(--surface-primary);
      border-top: 1px solid var(--border-color);
    }
    .replies-loading { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--text-secondary); padding: 0.5rem 0; }
    .mini-spinner { width: 14px; height: 14px; border: 2px solid var(--border-color); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
    .no-replies { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--text-secondary); padding: 0.5rem 0; }
    .replies-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .reply-item { display: flex; gap: 0.75rem; }
    .reply-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981, #059669);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .reply-body { flex: 1; min-width: 0; }
    .reply-meta { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
    .reply-author { font-size: 0.8125rem; font-weight: 600; color: var(--text-primary); }
    .reply-time { font-size: 0.6875rem; color: var(--text-secondary); }
    .reply-message { margin: 0; font-size: 0.875rem; color: var(--text-primary); line-height: 1.5; }

    /* States */
    .loading-state { text-align: center; padding: 3rem; }
    .spinner { width: 32px; height: 32px; border: 3px solid var(--border-color); border-top-color: #6366f1; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 0.75rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 3rem; }
    .empty-icon { color: var(--text-secondary); margin-bottom: 1rem; opacity: 0.5; }
    .empty-state h3 { color: var(--text-primary); margin: 0 0 0.25rem; font-size: 1.125rem; }
    .empty-state p { color: var(--text-secondary); margin: 0; font-size: 0.875rem; }
  `]
})
export class PatientQueriesComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  queries = signal<Query[]>([]);
  replies = signal<Reply[]>([]);
  isLoading = signal(true);
  loadingReplies = signal(false);
  expandedQuery = signal<number | null>(null);
  newQuestion = '';

  ngOnInit(): void {
    this.loadQueries();
  }

  loadQueries(): void {
    this.isLoading.set(true);
    this.apiService.getPatientQueries().subscribe({
      next: (data) => { this.queries.set(data); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); }
    });
  }

  postQuery(): void {
    if (!this.newQuestion.trim()) return;
    this.apiService.postQuery({ message: this.newQuestion } as any).subscribe({
      next: () => {
        this.toastService.success('Query posted!');
        this.newQuestion = '';
        this.loadQueries();
      },
      error: (err: any) => this.toastService.error(err.error?.message || 'Failed to post query')
    });
  }

  deleteQuery(queryId: number): void {
    if (!confirm('Delete this query?')) return;
    this.apiService.deleteQuery(queryId).subscribe({
      next: () => { this.toastService.success('Query deleted'); this.loadQueries(); },
      error: () => this.toastService.error('Failed to delete query')
    });
  }

  toggleReplies(queryId: number): void {
    if (this.expandedQuery() === queryId) {
      this.expandedQuery.set(null);
      return;
    }
    this.expandedQuery.set(queryId);
    this.loadingReplies.set(true);
    this.apiService.getPatientQueryReplies(queryId).subscribe({
      next: (data) => { this.replies.set(data); this.loadingReplies.set(false); },
      error: () => { this.replies.set([]); this.loadingReplies.set(false); }
    });
  }
}
