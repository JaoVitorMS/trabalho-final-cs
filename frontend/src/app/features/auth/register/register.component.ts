import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

/** Validador de grupo: confirma se as duas senhas coincidem. */
function senhasIguais(group: AbstractControl): ValidationErrors | null {
  const senha = group.get('password')?.value;
  const confirmacao = group.get('confirmacao')?.value;
  return senha === confirmacao ? null : { senhasDiferentes: true };
}

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifier = inject(NotificationService);

  readonly loading = signal(false);
  readonly hidePassword = signal(true);

  readonly form = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmacao: ['', [Validators.required]],
    },
    { validators: senhasIguais },
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { username, password } = this.form.getRawValue();

    // Backend (auth-service) é sensível à ordem das propriedades no JSON (ADR-001).
    const payload = {
      username: username,
      password: password,
    };

    this.auth.cadastrar(payload).subscribe({
      next: (usuario) => {
        this.loading.set(false);
        this.notifier.success(
          `Usuário "${usuario.username}" cadastrado (id ${usuario.id}). Faça login.`,
        );
        this.router.navigate(['/login']);
      },
      error: () => this.loading.set(false),
    });
  }
}
