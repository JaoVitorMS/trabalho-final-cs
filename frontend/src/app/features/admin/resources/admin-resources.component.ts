import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ResourceService } from '../../../core/services/resource.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RecursoDTO } from '../../../core/models/recurso.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-resources',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    EmptyStateComponent,
  ],
  templateUrl: './admin-resources.component.html',
  styleUrl: './admin-resources.component.scss',
})
export class AdminResourcesComponent {
  private readonly fb = inject(FormBuilder);
  private readonly resourceService = inject(ResourceService);
  private readonly notifier = inject(NotificationService);

  readonly colunas = ['id', 'nome', 'tipo', 'categoria', 'descricao'];
  readonly recursos = signal<RecursoDTO[]>([]);
  readonly loading = signal(false);
  readonly salvando = signal(false);

  readonly formAuditorio = this.fb.nonNullable.group({
    nome: ['', [Validators.required]],
    descricao: [''],
    capacidade: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  readonly formNotebook = this.fb.nonNullable.group({
    nome: ['', [Validators.required]],
    descricao: [''],
    marca: [''],
    modelo: [''],
  });

  constructor() {
    this.carregar();
  }

  carregar(): void {
    this.loading.set(true);
    this.resourceService
      .listarTodos()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((recursos) => this.recursos.set(recursos));
  }

  salvarAuditorio(): void {
    if (this.formAuditorio.invalid) {
      this.formAuditorio.markAllAsTouched();
      return;
    }
    const { nome, descricao, capacidade } = this.formAuditorio.getRawValue();
    this.salvando.set(true);
    this.resourceService
      .cadastrarAuditorio({
        nome,
        descricao: descricao || undefined,
        capacidade: capacidade!,
      })
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe((recurso) => {
        this.notifier.success(`Auditório "${recurso.nome}" cadastrado.`);
        this.formAuditorio.reset();
        this.carregar();
      });
  }

  salvarNotebook(): void {
    if (this.formNotebook.invalid) {
      this.formNotebook.markAllAsTouched();
      return;
    }
    const { nome, descricao, marca, modelo } = this.formNotebook.getRawValue();
    this.salvando.set(true);
    this.resourceService
      .cadastrarNotebook({
        nome,
        descricao: descricao || undefined,
        marca: marca || undefined,
        modelo: modelo || undefined,
      })
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe((recurso) => {
        this.notifier.success(`Notebook "${recurso.nome}" cadastrado.`);
        this.formNotebook.reset();
        this.carregar();
      });
  }
}
