import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material Modules
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { Disciplina } from '../../interfaces/Disciplina';
import { Professor } from '../../interfaces/Professor';
import { AuthService } from '../../core/auth.service';

// IMPORTAR A DIRETIVA
import { DisciplinaUnicaDirective } from '../../directives/disciplina-unica.directive'; // Ajuste o caminho

@Component({
  selector: 'app-cpt-gerenciar-disciplina',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    DisciplinaUnicaDirective,
  ],
  templateUrl: './cpt-gerenciar-disciplina.component.html',
  styleUrl: './cpt-gerenciar-disciplina.component.scss',
})
export class CptGerenciarDisciplinaComponent implements OnChanges {
  // Inputs
  @Input() disciplinas: Disciplina[] = [];
  @Input() quantidadeQuestoes!: (disciplina: Disciplina) => number;
  @Input() quantidadeMaterias!: (disciplina: Disciplina) => number;

  // Outputs
  @Output() iniciarEdicao = new EventEmitter<number>();
  @Output() confirmarEdicao = new EventEmitter<{ id: number; nome: string }>();
  @Output() cancelarEdicao = new EventEmitter<void>();
  @Output() excluir = new EventEmitter<number>();

  @Output() criarIniciar = new EventEmitter<void>();
  @Output() criarConfirmar = new EventEmitter<string>();
  @Output() criarCancelar = new EventEmitter<void>();

  // Estado interno
  editandoId = signal<number | null>(null);
  nomeEditando = signal('');

  criando = signal(false);
  nomeCriando = signal('');

  // Paginação
  length = 0;
  pageSize = 5;
  pageIndex = 0;

  constructor(public authService: AuthService) {}

  ngOnChanges() {
    this.length = this.disciplinas?.length ?? 0;
  }

  get disciplinasPaginadas() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.disciplinas.slice(start, end);
  }

  trocarPagina(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  get currentUser(): Professor | null | undefined {
    return this.authService.currentUserSig();
  }

  // --- EDIÇÃO ---
  entrarEdicao(disciplina: Disciplina) {
    this.editandoId.set(disciplina.id);
    this.nomeEditando.set(disciplina.nome);
    this.iniciarEdicao.emit(disciplina.id);
  }

  confirmarEdicaoClick(id: number) {
    // Validação extra: não enviar se vazio
    if (!this.nomeEditando().trim()) return;

    this.confirmarEdicao.emit({
      id,
      nome: this.nomeEditando(),
    });
    this.editandoId.set(null);
    this.nomeEditando.set('');
  }

  cancelarEdicaoClick() {
    this.cancelarEdicao.emit();
    this.editandoId.set(null);
    this.nomeEditando.set('');
  }

  // --- CRIAÇÃO ---
  iniciarCriacao() {
    this.criando.set(true);
    this.nomeCriando.set('');
    this.criarIniciar.emit();
  }

  confirmarCriacao() {
    const nome = this.nomeCriando().trim();
    if (!nome) return;

    this.criarConfirmar.emit(nome);
    this.criando.set(false);
    this.nomeCriando.set('');
  }

  cancelarCriacao() {
    this.criando.set(false);
    this.nomeCriando.set('');
    this.criarCancelar.emit();
  }
}
