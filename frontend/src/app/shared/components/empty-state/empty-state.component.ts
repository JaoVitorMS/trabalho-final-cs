import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Estado vazio reutilizável para listas sem dados. */
@Component({
  selector: 'app-empty-state',
  imports: [MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      <h3>{{ title }}</h3>
      @if (message) {
        <p>{{ message }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: [
    `
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 48px 16px;
        color: #6b7180;
      }
      .empty-icon {
        font-size: 56px;
        width: 56px;
        height: 56px;
        opacity: 0.5;
        margin-bottom: 8px;
      }
      h3 {
        margin: 0 0 4px;
        font-weight: 500;
        color: #3a3f4b;
      }
      p {
        margin: 0 0 16px;
        max-width: 360px;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input({ required: true }) title!: string;
  @Input() message?: string;
}
