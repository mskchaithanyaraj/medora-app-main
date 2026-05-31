import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ToastService } from '../../core/services';
import { UserService } from '../../core/services/user.service';
import { Query, Reply } from '../../core/models';

@Component({
  selector: 'app-staff-queries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="queries-page">
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <h2>Queries & Replies</h2>
            <p class="subtitle">View patient queries and respond with helpful answers</p>
          </div>
        </div>
        <div class="query-count" *ngIf="!isLoading()">
          <span class="count-number">{{ queries().length }}</span>
          <span class="count-label">{{ queries().length === 1 ? 'Query' : 'Queries' }}</span>
        </div>
      </div>

      @if (isLoading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading queries...</p>
        </div>
      } @else if (queries().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h3>No queries yet</h3>
          <p>When patients post questions, they'll appear here.</p>
        </div>
      } @else {
        <div class="queries-list">
          @for (query of queries(); track query.id) {
            <div class="query-card" [class.expanded]="expandedQuery() === query.id">
              <div class="query-main">
                <div class="query-avatar">{{ query.patient.name.charAt(0).toUpperCase() }}</div>
                <div class="query-body">
                  <div class="query-top">
                    <span class="query-author">{{ query.patient.name }}</span>
                    <span class="query-time">{{ query.createdAt | date:'MMM d, y · h:mm a' }}</span>
                  </div>
                  <p class="query-message">{{ query.message }}</p>
                  <div class="query-actions">
                    <button class="btn-action" (click)="toggleReplies(query.id)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg>
                      {{ expandedQuery() === query.id ? 'Hide Replies' : 'View & Reply' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Replies Panel -->
              @if (expandedQuery() === query.id) {
                <div class="replies-panel">
                  @if (loadingReplies()) {
                    <div class="replies-loading"><div class="mini-spinner"></div> Loading replies...</div>
                  } @else {
                    @if (replies().length > 0) {
                      <div class="replies-list">
                        @for (reply of replies(); track reply.id) {
                          <div class="reply-item">
                            <div class="reply-avatar" [class.own-reply]="reply.repliedUser.username === currentUsername()">
                              {{ reply.repliedUser.username.charAt(0).toUpperCase() }}
                            </div>
                            <div class="reply-content">
                              <div class="reply-header">
                                <span class="reply-author">&#64;{{ reply.repliedUser.username }}</span>
                                @if (reply.repliedUser.username === currentUsername()) {
                                  <span class="you-badge">You</span>
                                }
                                <span class="reply-time">{{ reply.createdAt | date:'MMM d, h:mm a' }}</span>
                                @if (reply.repliedUser.username === currentUsername()) {
                                  <button class="btn-delete-reply" (click)="deleteReply(reply.id)" title="Delete reply">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                  </button>
                                }
                              </div>
                              <p class="reply-text">{{ reply.message }}</p>
                            </div>
                          </div>
                        }
                      </div>
                    } @else {
                      <p class="no-replies-text">No replies yet. Be the first to respond!</p>
                    }

                    <!-- Reply Input -->
                    <div class="reply-compose">
                      <div class="reply-compose-avatar">{{ currentUsername().charAt(0).toUpperCase() }}</div>
                      <div class="reply-input-wrapper">
                        <input 
                          type="text"
                          [(ngModel)]="replyText" 
                          placeholder="Write your reply..."
                          class="reply-input"
                          (keyup.enter)="postReply(query.id)">
                        <button class="btn-send" (click)="postReply(query.id)" [disabled]="!replyText.trim()">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </button>
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
  `,
  styles: [`
    .queries-page { padding: 0; }

    /* Header */
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .header-content { display: flex; align-items: flex-start; gap: 0.75rem; }
    .header-icon { 
      width: 44px; height: 44px; border-radius: 12px; 
      background: linear-gradient(135deg, #6366f1, #8b5cf6); 
      display: flex; align-items: center; justify-content: center; color: white; 
    }
    .page-header h2 { font-size: 1.375rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    .subtitle { color: var(--text-secondary); font-size: 0.8125rem; margin: 0.125rem 0 0; }
    .query-count { text-align: center; background: var(--surface-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 0.5rem 1rem; }
    .count-number { display: block; font-size: 1.25rem; font-weight: 700; color: #6366f1; }
    .count-label { font-size: 0.6875rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }

    /* Query Cards */
    .queries-list { display: flex; flex-direction: column; gap: 1rem; }
    .query-card {
      background: var(--surface-secondary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.2s;
    }
    .query-card:hover { border-color: rgba(99, 102, 241, 0.3); }
    .query-card.expanded { border-color: rgba(99, 102, 241, 0.5); box-shadow: 0 4px 16px rgba(99, 102, 241, 0.08); }
    .query-main { display: flex; gap: 0.875rem; padding: 1.25rem; }
    .query-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 1rem; flex-shrink: 0;
    }
    .query-body { flex: 1; min-width: 0; }
    .query-top { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
    .query-author { font-weight: 600; font-size: 0.875rem; color: var(--text-primary); }
    .query-time { font-size: 0.6875rem; color: var(--text-secondary); }
    .query-message { margin: 0 0 0.75rem; font-size: 0.9375rem; color: var(--text-primary); line-height: 1.6; }
    .query-actions { display: flex; }
    .btn-action {
      display: flex; align-items: center; gap: 0.375rem;
      padding: 0.4375rem 0.875rem;
      border: 1px solid var(--border-color); border-radius: 20px;
      background: transparent; color: var(--text-secondary);
      font-size: 0.75rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
    }
    .btn-action:hover { background: var(--surface-primary); color: #6366f1; border-color: #6366f1; }

    /* Replies Panel */
    .replies-panel {
      padding: 0 1.25rem 1.25rem;
      padding-left: calc(1.25rem + 40px + 0.875rem);
      border-top: 1px solid var(--border-color);
      background: var(--surface-primary);
      padding-top: 1rem;
    }
    .replies-loading { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--text-secondary); }
    .mini-spinner { width: 14px; height: 14px; border: 2px solid var(--border-color); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
    .no-replies-text { font-size: 0.8125rem; color: var(--text-secondary); margin: 0 0 1rem; font-style: italic; }
    .replies-list { display: flex; flex-direction: column; gap: 0.875rem; margin-bottom: 1rem; }
    .reply-item { display: flex; gap: 0.625rem; }
    .reply-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: linear-gradient(135deg, #10b981, #059669);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 0.6875rem; font-weight: 700; flex-shrink: 0;
    }
    .reply-avatar.own-reply { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
    .reply-content { flex: 1; min-width: 0; }
    .reply-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; flex-wrap: wrap; }
    .reply-author { font-size: 0.8125rem; font-weight: 600; color: var(--text-primary); }
    .you-badge { font-size: 0.625rem; background: #ede9fe; color: #6366f1; padding: 0.125rem 0.375rem; border-radius: 4px; font-weight: 600; }
    .reply-time { font-size: 0.6875rem; color: var(--text-secondary); margin-left: auto; }
    .btn-delete-reply {
      display: flex; padding: 0.25rem; border: none; border-radius: 4px;
      background: transparent; color: var(--text-secondary); cursor: pointer; transition: all 0.2s;
    }
    .btn-delete-reply:hover { background: #fee2e2; color: #dc2626; }
    .reply-text { margin: 0; font-size: 0.8125rem; color: var(--text-primary); line-height: 1.5; }

    /* Reply Compose */
    .reply-compose { display: flex; gap: 0.625rem; align-items: center; }
    .reply-compose-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 0.6875rem; font-weight: 700; flex-shrink: 0;
    }
    .reply-input-wrapper { flex: 1; display: flex; gap: 0.5rem; align-items: center; background: var(--surface-secondary); border: 1px solid var(--border-color); border-radius: 24px; padding: 0.375rem 0.375rem 0.375rem 1rem; transition: border-color 0.2s; }
    .reply-input-wrapper:focus-within { border-color: #6366f1; }
    .reply-input { flex: 1; border: none; background: transparent; color: var(--text-primary); font-size: 0.8125rem; outline: none; padding: 0.25rem 0; }
    .reply-input::placeholder { color: var(--text-secondary); }
    .btn-send {
      width: 32px; height: 32px; border-radius: 50%; border: none;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: opacity 0.2s, transform 0.1s; flex-shrink: 0;
    }
    .btn-send:hover:not(:disabled) { transform: scale(1.05); }
    .btn-send:disabled { opacity: 0.4; cursor: not-allowed; }

    /* States */
    .loading-state { text-align: center; padding: 3rem; }
    .spinner { width: 32px; height: 32px; border: 3px solid var(--border-color); border-top-color: #6366f1; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 0.75rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-state p { color: var(--text-secondary); font-size: 0.875rem; }
    .empty-state { text-align: center; padding: 3rem; }
    .empty-icon { color: var(--text-secondary); margin-bottom: 1rem; opacity: 0.4; }
    .empty-state h3 { color: var(--text-primary); margin: 0 0 0.25rem; font-size: 1.125rem; }
    .empty-state p { color: var(--text-secondary); margin: 0; font-size: 0.875rem; }
  `]
})
export class StaffQueriesComponent implements OnInit {
  @Input() role: 'admin' | 'hospital' | 'doctor' = 'admin';

  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private userService = inject(UserService);

  queries = signal<Query[]>([]);
  replies = signal<Reply[]>([]);
  isLoading = signal(true);
  loadingReplies = signal(false);
  expandedQuery = signal<number | null>(null);
  currentUsername = this.userService.username;
  replyText = '';

  ngOnInit(): void {
    this.loadQueries();
  }

  loadQueries(): void {
    this.isLoading.set(true);
    let obs;
    switch (this.role) {
      case 'doctor': obs = this.apiService.getDoctorQueries(); break;
      case 'hospital': obs = this.apiService.getHospitalQueries(); break;
      default: obs = this.apiService.getAdminQueries(); break;
    }
    obs.subscribe({
      next: (data) => { this.queries.set(data); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); }
    });
  }

  toggleReplies(queryId: number): void {
    if (this.expandedQuery() === queryId) {
      this.expandedQuery.set(null);
      return;
    }
    this.expandedQuery.set(queryId);
    this.loadingReplies.set(true);
    let obs;
    switch (this.role) {
      case 'doctor': obs = this.apiService.getDoctorQueryReplies(queryId); break;
      case 'hospital': obs = this.apiService.getHospitalQueryReplies(queryId); break;
      default: obs = this.apiService.getAdminQueryReplies(queryId); break;
    }
    obs.subscribe({
      next: (data) => { this.replies.set(data); this.loadingReplies.set(false); },
      error: () => { this.replies.set([]); this.loadingReplies.set(false); }
    });
  }

  postReply(queryId: number): void {
    if (!this.replyText.trim()) return;
    let obs;
    switch (this.role) {
      case 'doctor': obs = this.apiService.postDoctorReply(queryId, { message: this.replyText } as any); break;
      case 'hospital': obs = this.apiService.postHospitalReply(queryId, { message: this.replyText } as any); break;
      default: obs = this.apiService.postAdminReply(queryId, { message: this.replyText } as any); break;
    }
    obs.subscribe({
      next: () => {
        this.toastService.success('Reply posted!');
        this.replyText = '';
        this.toggleReplies(queryId); // close
        this.toggleReplies(queryId); // reopen to reload
      },
      error: (err: any) => this.toastService.error(err.error?.message || 'Failed to post reply')
    });
  }

  deleteReply(replyId: number): void {
    if (!confirm('Delete this reply?')) return;
    let obs;
    switch (this.role) {
      case 'doctor': obs = this.apiService.deleteDoctorReply(replyId); break;
      case 'hospital': obs = this.apiService.deleteHospitalReply(replyId); break;
      default: obs = this.apiService.deleteAdminReply(replyId); break;
    }
    obs.subscribe({
      next: () => {
        this.toastService.success('Reply deleted');
        this.replies.update(list => list.filter(r => r.id !== replyId));
      },
      error: () => this.toastService.error('Failed to delete reply')
    });
  }
}
