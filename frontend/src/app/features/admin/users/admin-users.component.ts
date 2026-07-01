import { Component, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UsuarioDTO } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-admin-users',
  imports: [
    UpperCasePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
export class AdminUsersComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly notifier = inject(NotificationService);

  readonly salvando = signal(false);
  readonly buscando = signal(false);
  readonly resultadoBusca = signal<UsuarioDTO | null>(null);

  readonly formCadastro = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  readonly formBusca = this.fb.nonNullable.group({
    id: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  cadastrar(): void {
    if (this.formCadastro.invalid) {
      this.formCadastro.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    this.auth
      .cadastrar(this.formCadastro.getRawValue())
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe((usuario) => {
        this.notifier.success(
          `Usuário "${usuario.username}" criado (id ${usuario.id}).`,
        );
        this.formCadastro.reset();
      });
  }

  buscar(): void {
    if (this.formBusca.invalid) {
      this.formBusca.markAllAsTouched();
      return;
    }
    const id = this.formBusca.getRawValue().id!;
    this.buscando.set(true);
    this.resultadoBusca.set(null);
    this.auth
      .buscarPorId(id)
      .pipe(finalize(() => this.buscando.set(false)))
      .subscribe({
        next: (usuario) => this.resultadoBusca.set(usuario),
        // Erro (ex.: 404/500) já exibido pelo errorInterceptor.
        error: () => this.resultadoBusca.set(null),
      });
  }
}
