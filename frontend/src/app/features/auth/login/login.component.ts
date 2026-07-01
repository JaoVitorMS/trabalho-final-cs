import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notifier = inject(NotificationService);

  readonly loading = signal(false);
  readonly hidePassword = signal(true);
  readonly erro = signal<string | null>(null);

  /** Atalhos de login (perfis de demonstração). */
  readonly atalhos = [
    { username: 'prof.maria', label: 'Professora', icon: 'school' },
    { username: 'secretaria', label: 'Secretaria', icon: 'badge' },
    { username: 'admin', label: 'Administrador', icon: 'admin_panel_settings' },
  ];

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  preencher(username: string): void {
    this.form.patchValue({ username, password: 'demo' });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro.set(null);
    this.loading.set(true);
    const { username, password } = this.form.getRawValue();

    this.auth.login(username, password).subscribe({
      next: (user) => {
        this.loading.set(false);
        this.notifier.success(`Bem-vindo(a), ${user.username}!`);
        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.erro.set(err.message);
      },
    });
  }
}
