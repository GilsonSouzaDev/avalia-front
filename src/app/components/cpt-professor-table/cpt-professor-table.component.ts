import { Component, Input, inject, OnChanges, Output, EventEmitter } from '@angular/core';
import { Professor } from '../../interfaces/Professor';
import { AuthService } from '../../core/auth.service';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-cpt-professor-table',
  standalone: true,
  imports: [MatIcon, CommonModule, MatPaginatorModule],
  templateUrl: './cpt-professor-table.component.html',
  styleUrl: './cpt-professor-table.component.scss',
})
export class CptProfessorTableComponent implements OnChanges {
  @Input() professores: Professor[] = [];
  @Input() quantidadeQuestoes: number = 0;
  @Input() quantidadeMaterias: number = 0;

  @Output() novo = new EventEmitter<void>();

  novoProfessor() {
    this.novo.emit();
  }

  public authService = inject(AuthService);

  length = 0;
  pageSize = 5;
  pageIndex = 0;

  ngOnChanges() {
    this.length = this.professores?.length ?? 0;
  }

  get professoresPaginados() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.professores.slice(start, end);
  }

  trocarPagina(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  get currentUser(): Professor | null | undefined {
    return this.authService.currentUserSig();
  }

  verDetalhes(professor: Professor): void {
    console.log(professor);
  }
}
