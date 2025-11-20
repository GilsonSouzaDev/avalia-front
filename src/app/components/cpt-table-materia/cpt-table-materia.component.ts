import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Disciplina } from '../../interfaces/Disciplina';
import { Professor } from '../../interfaces/Professor';
import { Pergunta } from '../../interfaces/Pergunta';
import { CptCardPerguntaComponent } from '../cpt-card-pergunta/cpt-card-pergunta.component';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { Alternativa } from '../../interfaces/Alternativa';

@Component({
  selector: 'app-cpt-table-materia',
  standalone: true, // Adicionado standalone: true se não estava
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
export class CptTableMateriaComponent {
  @Input({ required: true }) disciplina!: Disciplina;
  @Input() professores: Professor[] = [];

  @Input() isSelectionMode: boolean = false;
  @Input() selectedQuestionIds: number[] = [];
  @Input() isLimitReached: boolean = false;

  @Output() perguntaSelecionada = new EventEmitter<Pergunta>();
  @Output() selectToggle = new EventEmitter<Pergunta>();
  @Output() alterarAlternativa = new EventEmitter<Alternativa>

  router = inject(Router);

  expanded = false;
  pageIndex = 0;
  pageSize = 3;
  paginatedPerguntas: Pergunta[] = [];

  ngOnInit(): void {
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
    this.paginatedPerguntas = this.disciplina.perguntas.slice(
      this.pageIndex * this.pageSize,
      (this.pageIndex + 1) * this.pageSize
    );
  }

  // MÉTODOS PARA PASSAR O ESTADO DE SELEÇÃO
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

  onAtualizarAlternativa(alternativa: Alternativa){
    this.alterarAlternativa.emit(alternativa)
    console.log("card table materia passou aqui", alternativa)
  }
}
