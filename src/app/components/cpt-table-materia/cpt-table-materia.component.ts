import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Disciplina } from '../../interfaces/Disciplina';
import { Professor } from '../../interfaces/Professor';
import { Pergunta } from '../../interfaces/Pergunta';
import { CptCardPerguntaComponent } from "../cpt-card-pergunta/cpt-card-pergunta.component";
import { MatIcon } from "@angular/material/icon";
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-cpt-table-materia',
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

  @Output() perguntaSelecionada = new EventEmitter<Pergunta>();

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
    const end = start + this.pageSize;
    this.paginatedPerguntas = this.disciplina.perguntas.slice(start, end);
  }
}
