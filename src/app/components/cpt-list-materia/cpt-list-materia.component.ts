import { Component, Input } from '@angular/core';
import { Disciplina } from '../../interfaces/Disciplina';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CptCardPerguntaComponent } from "../cpt-card-pergunta/cpt-card-pergunta.component";
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Pergunta } from '../../interfaces/Pergunta';


@Component({
  selector: 'app-cpt-list-materia',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    CptCardPerguntaComponent,
    MatPaginator,
  ],
  templateUrl: './cpt-list-materia.component.html',
  styleUrl: './cpt-list-materia.component.scss',
})
export class CptListMateriaComponent {
  @Input({ required: true }) disciplina!: Disciplina;

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
