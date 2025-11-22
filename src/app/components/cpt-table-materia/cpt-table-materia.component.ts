import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
  effect, // <--- IMPORTANTE
} from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

import { Disciplina } from '../../interfaces/Disciplina';
import { Professor } from '../../interfaces/Professor';
import { Pergunta } from '../../interfaces/Pergunta';
import { Alternativa } from '../../interfaces/Alternativa';
import { CptCardPerguntaComponent } from '../cpt-card-pergunta/cpt-card-pergunta.component';
import { PerguntaService } from '../../services/pergunta.service';
import { AuthService } from '../../core/auth.service';
import { DialogService } from '../../shared/services/dialog.service';

@Component({
  selector: 'app-cpt-table-materia',
  standalone: true,
  imports: [
    CptCardPerguntaComponent,
    MatIcon,
    MatPaginator,
    CommonModule,
    MatCardModule,
  ],
  templateUrl: './cpt-table-materia.component.html',
  styleUrl: './cpt-table-materia.component.scss',
})
export class CptTableMateriaComponent implements OnInit, OnChanges {
  @Input({ required: true }) disciplina!: Disciplina;
  @Input() professores: Professor[] = [];

  // --- NOVO INPUT PARA CONTROLAR O FILTRO ---
  @Input() somenteMinhas: boolean = false;

  @Input() isSelectionMode: boolean = false;
  @Input() selectedQuestionIds: number[] = [];
  @Input() isLimitReached: boolean = false;

  @Output() perguntaSelecionada = new EventEmitter<Pergunta>();
  @Output() selectToggle = new EventEmitter<Pergunta>();
  @Output() alterarAlternativa = new EventEmitter<Alternativa>();

  private router = inject(Router);
  private perguntaService = inject(PerguntaService);
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);

  expanded = false;
  pageIndex = 0;
  pageSize = 3;

  perguntasDaDisciplina: Pergunta[] = [];
  paginatedPerguntas: Pergunta[] = [];

  constructor() {
    // --- SOLUÇÃO DO BUG DO REFRESH ---
    // O effect roda sempre que o Signal 'perguntaService.perguntas()' muda.
    // Assim, se os dados chegarem atrasados (após o ngOnInit), a lista atualiza sozinha.
    effect(() => {
      // Apenas acessamos o signal para registrar a dependência
      this.perguntaService.perguntas();
      // Chamamos a função de carga (usando untracked ou deixando reagir, aqui chamar direto funciona bem)
      this.carregarPerguntas();
    });
  }

  ngOnInit(): void {
    this.carregarPerguntas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Atualiza se a disciplina ou o modo de filtro mudar
    if (changes['disciplina'] || changes['somenteMinhas']) {
      this.carregarPerguntas();
    }
  }

  get userTipo(): string {
    const usuario = this.authService.currentUserSig();
    return usuario ? usuario.perfilProfessor : ''; // Ajuste conforme sua interface (perfil ou perfilProfessor)
  }

  carregarPerguntas(): void {
    const todas = this.perguntaService.perguntas();
    const usuarioLogado = this.authService.currentUserSig();

    // 1. Filtra pela Disciplina (Padrão)
    let filtradas = todas.filter(
      (p) => p.disciplina && p.disciplina.id === this.disciplina.id
    );

    // 2. SOLUÇÃO DO BUG DE PERGUNTAS ALHEIAS
    // Se a flag 'somenteMinhas' estiver ativa, filtra pelo código do professor
    if (this.somenteMinhas && usuarioLogado) {
      filtradas = filtradas.filter(
        (p) => p.codigoProfessor === usuarioLogado.codigo
      );
    }

    this.perguntasDaDisciplina = filtradas;
    this.updatePaginatedPerguntas();
  }

  toggleExpand(): void {
    this.expanded = !this.expanded;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedPerguntas();
  }

  private updatePaginatedPerguntas(): void {
    const start = this.pageIndex * this.pageSize;
    const end = (this.pageIndex + 1) * this.pageSize;
    this.paginatedPerguntas = this.perguntasDaDisciplina.slice(start, end);
  }

  isQuestaoSelecionada(perguntaId: number): boolean {
    return this.selectedQuestionIds.includes(perguntaId);
  }

  isQuestaoDesabilitada(perguntaId: number): boolean {
    return this.isLimitReached && !this.isQuestaoSelecionada(perguntaId);
  }

  onSelectToggle(pergunta: Pergunta): void {
    this.selectToggle.emit(pergunta);
  }

  onEdit(pergunta: Pergunta) {
    this.router.navigate(['/pergunta', pergunta.id]);
  }

  onDeletePergunta(id: number) {
    this.dialogService
      .confirmAction({
        title: 'Excluir Pergunta',
        message:
          'Tem certeza que deseja remover esta pergunta permanentemente?',
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        titleColor: 'warn',
        action: () => this.perguntaService.delete(id),
      })
      .afterClosed()
      .subscribe((success: boolean | undefined) => {
        // O effect cuidará da atualização, mas chamar aqui garante feedback imediato
        if (success) {
          this.carregarPerguntas();
        }
      });
  }

  onAtualizarAlternativa(alternativa: Alternativa) {
    this.alterarAlternativa.emit(alternativa);
    console.log("materia table parou por aqui",alternativa)
  }
}
