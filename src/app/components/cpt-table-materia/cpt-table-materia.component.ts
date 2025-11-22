import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
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

  @Input() isSelectionMode: boolean = false;
  @Input() selectedQuestionIds: number[] = [];
  @Input() isLimitReached: boolean = false;

  @Output() perguntaSelecionada = new EventEmitter<Pergunta>();
  @Output() selectToggle = new EventEmitter<Pergunta>();
  @Output() alterarAlternativa = new EventEmitter<Alternativa>();

  private router = inject(Router);
  private perguntaService = inject(PerguntaService);

  expanded = false;
  pageIndex = 0;
  pageSize = 3;

  perguntasDaDisciplina: Pergunta[] = [];
  paginatedPerguntas: Pergunta[] = [];

  ngOnInit(): void {
    this.carregarPerguntas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['disciplina']) {
      this.carregarPerguntas();
    }
  }

  carregarPerguntas(): void {
    const todas = this.perguntaService.perguntas();
    this.perguntasDaDisciplina = todas.filter(
      (p) => p.disciplina && p.disciplina.id === this.disciplina.id
    );
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

  onAtualizarAlternativa(alternativa: Alternativa) {
    this.alterarAlternativa.emit(alternativa);
  }
}
